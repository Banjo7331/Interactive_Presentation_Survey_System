export interface CreateQuestionDto {
    title: string;
    type: string;
    possibleChoices: string[];
    [key: string]: string | string[];
  }
  
export interface CreateSurveyDto {
    title: string;
    createQuestionDtos: CreateQuestionDto[];
  }