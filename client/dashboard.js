(() => {
  'use strict';

  // --- Clock logic ---
  const timeElement = document.getElementById('server-time');

  function updateTime() {
    const now = new Date();
    // Format: "Sun, 5\nApr 2026"  (based on screenshot)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[now.getDay()];
    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    if (timeElement) {
      timeElement.innerHTML = `${dayName}, ${dayNum}<br>${monthName} ${year}`;
    }
  }

  // Update immediately and then every minute or midnight transition
  updateTime();
  setInterval(updateTime, 60000);

  // --- Pill UI toggle logic ---
  const pills = document.querySelectorAll('.pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // --- View toggling logic ---
  const viewFeed = document.getElementById('view-feed');
  const viewHistory = document.getElementById('view-history');
  const viewPreferences = document.getElementById('view-preferences');
  const viewTopics = document.getElementById('view-topics');
  const viewFeedback = document.getElementById('view-feedback');
  
  function switchView(viewId) {
    [viewFeed, viewHistory, viewPreferences, viewTopics, viewFeedback].forEach(v => {
      if (v) v.classList.remove('active');
    });
    
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
  }

  // --- Nav UI toggle logic ---
  const navItems = document.querySelectorAll('.nav-item');
  const pageTitle = document.querySelector('.page-title');
  const viewPillsContainer = document.querySelector('.view-pills');

  const viewConfig = {
    'daily curriculum': { viewId: 'view-feed',        title: 'Daily<br>Curriculum', showPills: true  },
    'lesson reader':    { viewId: 'view-history',      title: 'Lesson<br>Reader',    showPills: false },
    'topic library':    { viewId: 'view-topics',       title: 'Topic<br>Library',    showPills: false },
    'preferences':      { viewId: 'view-preferences',  title: 'Preferences',         showPills: false },
    'give feedback':    { viewId: 'view-feedback',     title: 'Provide<br>Feedback', showPills: false },
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const textSpan = item.querySelector('span:not(.nav-icon)');
      if (textSpan) {
        const key = textSpan.textContent.trim().toLowerCase();
        const config = viewConfig[key];
        if (config) {
          switchView(config.viewId);
          if (pageTitle) pageTitle.innerHTML = config.title;
          if (viewPillsContainer) {
            viewPillsContainer.style.visibility = config.showPills ? 'visible' : 'hidden';
          }
        }
      }
    });
  });

  // --- Home and Logout logic ---
  const homeBtn = document.getElementById('nav-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }

  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }

  // --- API Integration: Preferences ---
  const API_BASE = 'http://localhost:3000/api';
  
  // Basic JWT decoding function
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch(e) {
      return null;
    }
  }

  const btnSavePrefs = document.getElementById('btn-save-prefs');
  
  if (btnSavePrefs) {
    btnSavePrefs.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You are not logged in!");
        window.location.href = 'login.html';
        return;
      }

      const payload = parseJwt(token);
      if (!payload || (!payload.id && !payload.userId && !payload.sub)) {
        alert("Invalid login token. Please log in again.");
        return;
      }
      
      // usually user id is under id, userId, or sub
      const targetUserId = payload.id || payload.userId || payload.sub;

      const newLanguage = document.getElementById('pref-language').value;
      const newLevel = document.getElementById('pref-level').value;
      const newDomain = document.getElementById('pref-domain').value;

      btnSavePrefs.disabled = true;
      btnSavePrefs.textContent = 'Saving...';

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // Fire all 3 updates in parallel
        const responses = await Promise.all([
          fetch(`${API_BASE}/users/languages/edit`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ id: targetUserId, newLanguage })
          }),
          fetch(`${API_BASE}/users/levels/edit`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ id: targetUserId, newLevel })
          }),
          fetch(`${API_BASE}/users/domains/edit`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ id: targetUserId, newDomain })
          })
        ]);

        // Check if any failed
        const failed = responses.find(r => !r.ok);
        if (failed) {
          const errData = await failed.json();
          throw new Error(errData.message || 'Failed to update some preferences.');
        }

        btnSavePrefs.textContent = 'Saved!';
        setTimeout(() => {
          btnSavePrefs.textContent = 'Save preferences';
          btnSavePrefs.disabled = false;
        }, 2000);

      } catch (error) {
        alert(`Error saving preferences: ${error.message}`);
        btnSavePrefs.textContent = 'Save preferences';
        btnSavePrefs.disabled = false;
      }
    });
  }

  // --- Topic Library Logic ---
  const topicSearch = document.getElementById('topic-search');
  const topicGrid = document.getElementById('topic-grid');
  const topicEmpty = document.getElementById('topic-empty');

  const renderTopics = (topicsToRender) => {
    if (!topicGrid) return;
    topicGrid.innerHTML = '';
    
    if (!topicsToRender || topicsToRender.length === 0) {
      return; // Error message is handled in the fetch block now
    }
    
    if (topicEmpty) {
      topicEmpty.style.display = 'none';
    }
    
    topicsToRender.forEach(topic => {
      const card = document.createElement('div');
      card.className = 'topic-card';
      let titleHtml = topic.title ? topic.title.replace('/', '/<br>') : 'Untitled';
      const levelStr = topic.level ? topic.level.toLowerCase() : 'lesson';
      card.innerHTML = `
        <div class="topic-card-name">${titleHtml}</div>
        <div class="topic-card-count">${levelStr} level</div>
        <div class="topic-card-accent"></div>
      `;

      // Click to open lesson in reader
      card.addEventListener('click', () => {
        let content = topic.content;
        if (typeof content === 'string') {
          try { content = JSON.parse(content); } catch (e) {}
        }
        const mdText = content?.markdown || content?.description || '';
        const langStr = content?.language || topic.language || 'Code';
        const topicStr = content?.topic || topic.title || 'Topic';

        const readerTitle = document.getElementById('reader-title');
        const readerContent = document.getElementById('reader-content');
        const readerMeta = document.getElementById('reader-meta-label');

        if (readerTitle) readerTitle.innerHTML = topic.title || 'Untitled Lesson';
        if (readerMeta) readerMeta.innerHTML = `${langStr} &middot; ${topicStr}`;
        if (readerContent) readerContent.innerHTML = parseMarkdown(mdText);

        switchView('view-history');
        if (pageTitle) pageTitle.innerHTML = 'Lesson<br>Reader';
        if (viewPillsContainer) viewPillsContainer.style.visibility = 'hidden';

        const allNavItems = document.querySelectorAll('.nav-item');
        allNavItems.forEach(n => n.classList.remove('active'));
        if (allNavItems[1]) allNavItems[1].classList.add('active');
      });

      topicGrid.appendChild(card);
    });
  };

  // Fetch user lessons initially
  async function loadUserTopics() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const payload = parseJwt(token);
      if (!payload) return;
      const targetUserId = payload.id || payload.userId || payload.sub;
      if (!targetUserId) return;

      const res = await fetch(`${API_BASE}/lessons/users/${targetUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const lessons = await res.json();
        // Since the UI says "Topic Library", let's group by title/topic to make it nice
        renderTopics(lessons);
      }
    } catch (err) {
      console.error("Failed to load user topics", err);
    }
  }

  if (topicSearch) {
    let debounceTimer;
    
    // Load initial actual topics
    loadUserTopics();

    topicSearch.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(debounceTimer);
      
      if (!query) {
        if (topicEmpty) {
          topicEmpty.style.display = 'none';
        }
        loadUserTopics();
        return;
      }
      
      debounceTimer = setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/lessons/topic/${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
            const lesson = await res.json();
            renderTopics([lesson]); // API returns a single lesson object for a topic
          } else {
            const errData = await res.json();
            renderTopics([]);
            if (topicEmpty) {
              topicEmpty.style.display = 'block';
              topicEmpty.textContent = errData.message || "No lesson found.";
            }
          }
        } catch (err) {
          renderTopics([]);
          if (topicEmpty) {
            topicEmpty.style.display = 'block';
            topicEmpty.textContent = "Error fetching topic.";
          }
        }
      }, 500);
    });
  }

  // --- Markdown Parser (shared) ---
  const parseMarkdown = (md) => {
    if (!md) return "";
    let html = md
      .replace(/^### (.*$)/gim, '<h3 class="reader-h1" style="font-size: 1.3rem;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="reader-h1" style="font-size: 1.5rem;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="reader-h1">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\n\n/gim, '</p><p class="reader-p">')
      .replace(/```([\s\S]*?)```/gim, '<div class="code-block"><pre>$1</pre></div>')
      .replace(/`(.*?)`/gim, '<code>$1</code>');
    return `<p class="reader-p">${html}</p>`;
  };

  // --- Today's Lesson Logic ---
  async function loadTodaysLesson() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = parseJwt(token);
    if (!payload) return;
    const targetUserId = payload.id || payload.userId || payload.sub;
    if (!targetUserId) return;

    try {
      const res = await fetch(`${API_BASE}/lessons/users/${targetUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const lessons = await res.json();
        if (lessons && lessons.length > 0) {
          // Sort by date descending to get the most recent
          lessons.sort((a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0));
          const latestLesson = lessons[0];
          
          const titleEl = document.querySelector('.lesson-title');
          if (titleEl) {
            titleEl.innerHTML = latestLesson.title || 'Untitled Lesson';
          }

          const levelFormatted = latestLesson.level ? 
            latestLesson.level.charAt(0) + latestLesson.level.slice(1).toLowerCase() : 'Intermediate';

          const metaItems = document.querySelectorAll('.lesson-meta .meta-item');
          if (metaItems.length >= 3) {
            metaItems[1].innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg> ${levelFormatted}`;
          }
          

          const summaryEl = document.querySelector('.lesson-summary');
          if (summaryEl) {
             let content = latestLesson.content;
             if (typeof content === 'string') {
               try { content = JSON.parse(content); } catch (e) {}
             }
             
             let mdText = content?.markdown || content?.description || "";
             
             // Extract first readable paragraph for summary
             let lines = mdText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('`'));
             let summaryText = lines.length > 0 ? lines[0] : (content?.summary || "Let's dive into your most recent daily lesson.");
             if (summaryText.length > 200) summaryText = summaryText.slice(0, 200) + "...";
             
             summaryEl.innerHTML = summaryText;
             
             if (content?.language || content?.topic) {
               const tagEl = document.querySelector('.lesson-tags .tag');
               if (tagEl) {
                 tagEl.innerHTML = `${content.language || 'Code'} &middot; ${content.topic || 'Concept'}`;
               }
             }
             
             if (content?.domain && metaItems.length >= 3) {
               const domainFormatted = content.domain.charAt(0) + content.domain.slice(1).toLowerCase();
               metaItems[2].innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg> ${domainFormatted}`;
             }

             // Bind "Start reading" button
             const btnPrimary = document.querySelector('.lesson-actions .btn-primary');
             if (btnPrimary) {
               btnPrimary.addEventListener('click', () => {
                 const readerTitle = document.getElementById('reader-title');
                 const readerContent = document.getElementById('reader-content');
                 const readerMeta = document.getElementById('reader-meta-label');
                 
                 if (readerTitle) readerTitle.innerHTML = latestLesson.title || 'Untitled Lesson';
                 if (readerMeta) readerMeta.innerHTML = `${content.language || latestLesson.topic || 'Lesson'} &middot; ${content.domain || 'Topic'}`;
                 if (readerContent) readerContent.innerHTML = parseMarkdown(mdText);
                 
                 switchView('view-history');
                 
                 // Fix active class on nav
                 const navItems = document.querySelectorAll('.nav-item');
                 navItems.forEach(n => n.classList.remove('active'));
                 // 2nd item is Lesson reader
                 if (navItems[1]) navItems[1].classList.add('active');
               });
             }
          }
        }
      }
    } catch (err) {
      console.error("Error loading today's lesson", err);
    }
  }

  loadTodaysLesson();

  // --- Feedback Logic ---
  const feedbackForm = document.getElementById('feedback-form');
  const starRating = document.getElementById('star-rating');
  const feedbackRatingInput = document.getElementById('feedback-rating');
  const lessonSelect = document.getElementById('feedback-lesson-select');
  const successMsg = document.getElementById('feedback-success-message');

  // Star Rating Interaction
  if (starRating) {
    const stars = starRating.querySelectorAll('.star');
    
    stars.forEach(star => {
      star.addEventListener('mouseover', (e) => {
        const val = parseInt(e.target.getAttribute('data-value'));
        stars.forEach(s => {
          if (parseInt(s.getAttribute('data-value')) <= val) {
            s.classList.add('hover');
          } else {
            s.classList.remove('hover');
          }
        });
      });

      star.addEventListener('mouseout', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });

      star.addEventListener('click', (e) => {
        const val = parseInt(e.target.getAttribute('data-value'));
        feedbackRatingInput.value = val;
        
        stars.forEach(s => {
          if (parseInt(s.getAttribute('data-value')) <= val) {
            s.classList.add('selected');
          } else {
            s.classList.remove('selected');
          }
        });
      });
    });
  }

  // Fetch last 5 lessons
  async function loadLessonsForFeedback() {
    if (!lessonSelect) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = parseJwt(token);
    if (!payload) return;
    const targetUserId = payload.id || payload.userId || payload.sub;
    if (!targetUserId) return;
    try {
      const res = await fetch(`${API_BASE}/lessons/users/${targetUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const lessons = await res.json();
        // take top 5
        const recentLessons = lessons.slice(0, 5);
        lessonSelect.innerHTML = '<option value="" disabled selected>Select a lesson</option>';
        if (recentLessons.length === 0) {
           lessonSelect.innerHTML = '<option value="" disabled selected>No recent lessons found</option>';
        } else {
           recentLessons.forEach(lesson => {
             const option = document.createElement('option');
             option.value = lesson.id;
             option.textContent = lesson.title || 'Untitled Lesson';
             lessonSelect.appendChild(option);
           });
        }
      } else {
        lessonSelect.innerHTML = '<option value="" disabled selected>Failed to load lessons</option>';
      }
    } catch (err) {
      console.error(err);
      lessonSelect.innerHTML = '<option value="" disabled selected>Error loading lessons</option>';
    }
  }

  // Handle Level Change Toggle
  const levelChangeCheckbox = document.getElementById('feedback-level-change');
  const newLevelRow = document.getElementById('feedback-new-level-row');
  const newLevelSelect = document.getElementById('feedback-new-level');

  if (levelChangeCheckbox && newLevelRow) {
    levelChangeCheckbox.addEventListener('change', (e) => {
      newLevelRow.style.display = e.target.checked ? 'flex' : 'none';
    });
  }

  // Bind to Feedback view switch or run on init
  loadLessonsForFeedback();

  // Handle Formulation Submission
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      successMsg.style.display = 'none';

      const lessonId = lessonSelect.value;
      const rating = parseInt(feedbackRatingInput.value);
      const text = document.getElementById('feedback-text').value;

      const wantsLevelChange = levelChangeCheckbox ? levelChangeCheckbox.checked : false;
      let newLevelVal = wantsLevelChange && newLevelSelect ? newLevelSelect.value : undefined;

      if (!lessonId) {
        alert("Please select a lesson to provide feedback for.");
        return;
      }
      if (rating < 1 || rating > 5) {
        alert("Please provide a rating from 1 to 5 stars.");
        return;
      }

      const btnSubmit = document.getElementById('btn-submit-feedback');
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Submitting...';

      try {
        const token = localStorage.getItem('token');
        const payload = parseJwt(token);
        const targetUserId = payload?.id || payload?.userId || payload?.sub;
        const res = await fetch(`${API_BASE}/feedback/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: targetUserId,
            lessonId: lessonId,
            rating: rating,
            feedback: text,
            levelChange: wantsLevelChange,
            ...(wantsLevelChange && newLevelVal ? { newLevel: newLevelVal } : {})
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to submit feedback.');
        }

        successMsg.style.display = 'block';
        feedbackForm.reset();
        
        // Reset stars visually
        const stars = starRating.querySelectorAll('.star');
        stars.forEach(s => s.classList.remove('selected'));
        feedbackRatingInput.value = "0";
        if (newLevelRow) newLevelRow.style.display = 'none';

        setTimeout(() => { successMsg.style.display = 'none'; }, 5000);

      } catch (error) {
        alert(`Error submitting feedback: ${error.message}`);
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Submit Feedback';
      }
    });
  }

})();
