import { elasticFile } from '../utils/types';
import { client } from '../utils/elastic';
import { AppError } from '../utils/customErrors';


export async function writeToIndex(fileToBeUploaded: elasticFile) : Promise<void>{
    try{

        await client.index({
            index: 'lessons-index',
            document: fileToBeUploaded
        });
    } catch(e){
        throw new AppError('Error uploading to elastic', 500);
    }
};

export async function getFromIndex(lessonTitleToBeRetrieved: string, thisUserLevel: string): Promise<string | void> {
  try {
    const response = await client.search<elasticFile>({
      index: 'lessons-index',
      size: 1,
      min_score: 7,
      query: {
        bool: {
          must: [
            {
              match: {
                title: {
                  query: lessonTitleToBeRetrieved,
                  fuzziness: 1,      
                  minimum_should_match: "75%" 
                }
              }
            }
          ],
          filter: [{ term: { userLevel: thisUserLevel } }]
        }
      }
    });

    const topHit = response.hits.hits[0];
    if (topHit) {
      console.log(`[Cache] Hit "${topHit._source?.title}" with score ${topHit._score} for query "${lessonTitleToBeRetrieved}"`);
      return topHit._source?.lessonId;
    }

    console.log(`[Cache] No hit for "${lessonTitleToBeRetrieved}"`);

  } catch (e) {
    throw new AppError('Could not retrieve from elastic', 500);
  }
}