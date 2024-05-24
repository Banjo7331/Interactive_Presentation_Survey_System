export interface Survey {
    id: string;
    title: string;
    questions: Question[];
}
  
export interface Question {
    id: number;
    title: string;
    type: string;
    possibleChoices: string[];
}