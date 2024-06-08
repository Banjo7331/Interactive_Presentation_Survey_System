export interface SurveyRoom {
    id: string;
    surveyId: string;
    maxUsers: number;
    surveyData: any;
    participants: Set<string>; 
    submissions: Set<string>;
    link: string;
    creatorId: string;
  }