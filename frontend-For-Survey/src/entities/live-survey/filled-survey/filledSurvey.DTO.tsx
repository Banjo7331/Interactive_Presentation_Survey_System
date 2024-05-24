export interface FilledSurveyDto {
    name: string; 
    surveyId: number; 
    userChoices: UserChoiceDto[]; 
  }
  
export interface UserChoiceDto {
    questionId: number; 
    answer: string[]; 
  }