export class CreateQuestionDto{
    title: string;

    type: string;

    possibleChoices?: string[];
}