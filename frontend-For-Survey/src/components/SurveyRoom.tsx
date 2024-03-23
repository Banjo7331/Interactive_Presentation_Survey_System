import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Survey {
    id: number;
    title: string;
    questions: QuestionDto[];
}
  
interface QuestionDto {
    title: string;
    type: string;
    possibleChoices: string[];
}
  
interface Props {
    survey: Survey;
}

interface SubmitSurveyDto {
    name: string; // Name of the filled survey
    surveyId: number; // ID of the survey being filled
    userId: number; // ID of the user filling the survey
    userChoices: UserChoiceDto[]; // Array of user choices for each question
  }
  
  interface UserChoiceDto {
    questionId: number; // ID of the question
    answer: string[]; // Array of answers chosen by the user (for multiple-choice questions)
  }

const SurveyRoom = () => {
    const { surveyId } = useParams();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [surveyAnswer, setSurveyAnswer] = useState<SubmitSurveyDto>({
      title: '',
      createQuestionDtos: [],
    });
    useEffect(() => {
        const fetchSurvey = async () => {
          if (!surveyId) return; // Nie pobieraj, jeśli nie ma ID ankiety
          try {
            const response = await axios.get(`http://localhost:3000/surveys/${surveyId}`);
            console.log(response);
            setSurvey(response.data);
            
          } catch (error) {
            console.error('Error fetching survey:', error);
          }
        };
    
        fetchSurvey();
    }, [surveyId]);
  
    return (
      <div>
        {survey && (
        <>
          <h2>{survey.title}</h2>
          <p>ID: {survey.id}</p>
          <h3>Questions:</h3>
          <ul>
            {survey.questions && survey.questions.map((question, index) => (
              <li key={index}>
                <p>{question.title}</p>
                <p>Type: {question.type}</p>
                {question.possibleChoices && (
                    <div>
                        <p>Possible Choices:</p>
                        {question.possibleChoices.map((choice, choiceIndex) => (
                            <button key={choiceIndex}>{choice}</button>
                        ))}
                    </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      </div>
    );
};
export default SurveyRoom;