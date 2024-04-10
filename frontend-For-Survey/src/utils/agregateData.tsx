interface UserChoice {
    answer: any[]; // Replace 'any' with the actual type of the elements in the 'answer' array
  }
  
  interface Survey {
    id: string;
    title: string;
}
interface FilledSurvey {
    name: string;
    userChoices: UserChoice[];
    survey: Survey;
    user: any; // Replace 'any' with the actual type of the 'user' property
  }

export const aggregateData = (surveyResults: FilledSurvey[]) => {
    const data: Record<string, Record<string, number>> = {};
  
    surveyResults.forEach((filledSurvey) => {
      filledSurvey.userChoices.forEach((userChoice, index) => {
        const questionId = `Question ${index + 1}`;
  
        if (!data[questionId]) {
          data[questionId] = {};
        }
  
        userChoice.answer.forEach((answer) => {
          if (!data[questionId][answer]) {
            data[questionId][answer] = 0;
          }
  
          data[questionId][answer]++;
        });
      });
    });
  
    return data;
};