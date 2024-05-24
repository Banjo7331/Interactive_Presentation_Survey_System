export interface SurveyRoom {
    id: string;
    surveyId: string;
    maxUsers: number;
    surveyData: any;
    participants: Set<string>; // Set of participant IDs
    submissions: Set<string>;
    link: string;
    creatorId: string;
  }