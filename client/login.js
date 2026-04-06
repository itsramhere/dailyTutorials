(() => {
  'use strict';

  const API_BASE = 'http://localhost:3000/api/auth';

  /* ========== ELEMENTS ========== */
  const form = document.getElementById('auth-form');
  const heading = document.getElementById('auth-heading');
  const subheading = document.getElementById('auth-subheading');
  const submitBtn = document.getElementById('auth-submit');
  const toggleText = document.getElementById('toggle-text');
  const toggleLink = document.getElementById('toggle-link');
  const signupFields = document.querySelectorAll('.signup-fields');
  const errorDiv = document.getElementById('form-error');
  const successDiv = document.getElementById('form-success');

  // Fields
  const nameInput = document.getElementById('name');
  const introInput = document.getElementById('introduction');
  const domainSelect = document.getElementById('domain');
  const langSelect = document.getElementById('preferredLanguage');
  const levelSelect = document.getElementById('currentLevel');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const termsCheck = document.getElementById('terms');

  // Hint elements
  const hintLength = document.getElementById('hint-length');
  const hintUpper = document.getElementById('hint-upper');
  const hintLower = document.getElementById('hint-lower');
  const hintNumber = document.getElementById('hint-number');
  const hintSpecial = document.getElementById('hint-special');
  const confirmError = document.getElementById('confirm-error');

  // Check URL param for initial mode
  const urlParams = new URLSearchParams(window.location.search);
  let isSignup = urlParams.get('mode') !== 'login';

  /* ========== TOGGLE MODE ========== */
  toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isSignup = !isSignup;
    updateMode();
    const newUrl = isSignup ? 'login.html?mode=signup' : 'login.html?mode=login';
    window.history.replaceState({}, '', newUrl);
  });

  function updateMode() {
    hideMessages();
    clearValidation();

    if (isSignup) {
      heading.textContent = 'Get Started Now';
      subheading.textContent = 'Create your account to start learning';
      submitBtn.textContent = 'Sign Up';
      toggleText.textContent = 'Have an account?';
      toggleLink.textContent = 'Sign In';
      signupFields.forEach(el => el.classList.add('visible'));
    } else {
      heading.textContent = 'Welcome Back';
      subheading.textContent = 'Sign in to continue your journey';
      submitBtn.textContent = 'Sign In';
      toggleText.textContent = "Don't have an account?";
      toggleLink.textContent = 'Sign Up';
      signupFields.forEach(el => el.classList.remove('visible'));
    }
  }

  /* ========== REAL-TIME VALIDATION ========== */

  // -- Password hints (live) --
  passwordInput.addEventListener('input', () => {
    const pw = passwordInput.value;

    setHint(hintLength, pw.length >= 8 && pw.length <= 16);
    setHint(hintUpper, /[A-Z]/.test(pw));
    setHint(hintLower, /[a-z]/.test(pw));
    setHint(hintNumber, /[0-9]/.test(pw));
    setHint(hintSpecial, /[^A-Za-z0-9]/.test(pw));

    // Also check confirm match if confirm is not empty
    if (confirmInput.value.length > 0) {
      validateConfirmPassword();
    }

    // Highlight password input
    if (pw.length === 0) {
      clearState(passwordInput);
    } else if (isPasswordValid(pw)) {
      setState(passwordInput, true);
    } else {
      setState(passwordInput, false);
    }
  });

  // -- Confirm password match --
  confirmInput.addEventListener('input', validateConfirmPassword);

  function validateConfirmPassword() {
    const pw = passwordInput.value;
    const cpw = confirmInput.value;
    if (cpw.length === 0) {
      confirmError.textContent = '';
      clearState(confirmInput);
      return;
    }
    if (pw !== cpw) {
      confirmError.textContent = 'Passwords do not match';
      setState(confirmInput, false);
    } else {
      confirmError.textContent = '';
      setState(confirmInput, true);
    }
  }

  // -- Email format (on blur) --
  emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email.length === 0) { clearState(emailInput); return; }
    if (isValidEmail(email)) {
      setState(emailInput, true);
    } else {
      setState(emailInput, false);
    }
  });

  // -- Name length (on input) --
  nameInput.addEventListener('input', () => {
    const name = nameInput.value.trim();
    if (name.length === 0) { clearState(nameInput); return; }
    setState(nameInput, name.length > 0 && name.length <= 16);
  });

  // -- Introduction length (on input) --
  introInput.addEventListener('input', () => {
    const intro = introInput.value.trim();
    if (intro.length === 0) { clearState(introInput); return; }
    setState(introInput, intro.length > 0 && intro.length <= 200);
  });

  // -- Selects (on change) --
  domainSelect.addEventListener('change', () => setState(domainSelect, domainSelect.value !== ''));
  langSelect.addEventListener('change', () => setState(langSelect, langSelect.value !== ''));
  levelSelect.addEventListener('change', () => setState(levelSelect, levelSelect.value !== ''));

  /* ========== FORM SUBMIT ========== */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    if (isSignup) {
      await handleSignup();
    } else {
      await handleLogin();
    }
  });

  async function handleSignup() {
    const name = nameInput.value.trim();
    const introduction = introInput.value.trim();
    const domain = domainSelect.value;
    const preferredLanguage = langSelect.value;
    const currentLevel = levelSelect.value;
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    const terms = termsCheck.checked;

    // Validate all fields
    const errors = [];

    if (!name) errors.push('Name is required.');
    else if (name.length > 16) errors.push('Name must be 16 characters or less.');

    if (!introduction) errors.push('Introduction is required.');
    else if (introduction.length > 200) errors.push('Introduction must be 200 characters or less.');

    if (!domain) errors.push('Please select a domain.');
    if (!preferredLanguage) errors.push('Please select a language.');
    if (!currentLevel) errors.push('Please select your level.');

    if (!email) errors.push('Email is required.');
    else if (!isValidEmail(email)) errors.push('Please enter a valid email address.');

    if (!password) {
      errors.push('Password is required.');
    } else if (!isPasswordValid(password)) {
      errors.push('Password must be 8–16 characters with uppercase, lowercase, number, and special character.');
    }

    if (password !== confirmPassword) {
      errors.push('Passwords do not match.');
    }

    if (!terms) errors.push('Please agree to the terms & policy.');

    if (errors.length > 0) {
      showError(errors.join(' '));
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, introduction, domain, preferredLanguage, currentLevel }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Signup failed');
      }

      showSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        isSignup = false;
        updateMode();
        window.history.replaceState({}, '', 'login.html?mode=login');
      }, 2000);

    } catch (err) {
      showError(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';
    }
  }

  async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please fill in all fields.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      showSuccess('Login successful!');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } catch (err) {
      showError(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  }

  /* ========== HELPERS ========== */

  function isPasswordValid(pw) {
    return pw.length >= 8 &&
           pw.length <= 16 &&
           /[A-Z]/.test(pw) &&
           /[a-z]/.test(pw) &&
           /[0-9]/.test(pw) &&
           /[^A-Za-z0-9]/.test(pw);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setHint(el, isValid) {
    el.classList.toggle('valid', isValid);
    el.classList.toggle('invalid', !isValid);
  }

  function setState(input, isValid) {
    input.classList.toggle('input-valid', isValid);
    input.classList.toggle('input-error', !isValid);
  }

  function clearState(input) {
    input.classList.remove('input-valid', 'input-error');
  }

  function clearValidation() {
    [nameInput, introInput, emailInput, passwordInput, confirmInput].forEach(clearState);
    [domainSelect, langSelect, levelSelect].forEach(clearState);
    [hintLength, hintUpper, hintLower, hintNumber, hintSpecial].forEach(el => {
      el.classList.remove('valid', 'invalid');
    });
    confirmError.textContent = '';
  }

  /* ========== MESSAGES ========== */
  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.add('visible');
    successDiv.classList.remove('visible');
    // Scroll to top of form to see error
    document.querySelector('.login-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showSuccess(msg) {
    successDiv.textContent = msg;
    successDiv.classList.add('visible');
    errorDiv.classList.remove('visible');
  }

  function hideMessages() {
    errorDiv.classList.remove('visible');
    successDiv.classList.remove('visible');
  }

  /* ========== INIT ========== */
  updateMode();
})();
