export interface SurveyRoom {
    id: string;
    surveyId: string;
    surveyData: any;
    participants: Set<string>; // Set of participant IDs
  }