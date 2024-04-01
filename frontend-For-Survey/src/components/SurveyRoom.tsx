import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Survey {
    id: number;
    title: string;
    questions: QuestionDto[];
}
  
interface QuestionDto {
    id: number;
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
    userChoices: UserChoiceDto[]; // Array of user choices for each question
  }
  
  interface UserChoiceDto {
    questionId: number; // ID of the question
    answer: string[]; // Array of answers chosen by the user (for multiple-choice questions)
  }

const SurveyRoom = () => {
    const { surveyId } = useParams();
    const intSurveyId = parseInt(surveyId!);
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [filledSurvey, setFilledSurvey] = useState<SubmitSurveyDto | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<{[key: number]: string}>({});
  
    useEffect(() => {
      const fetchSurvey = async () => {
        if (!surveyId) return;
        try {
          const response = await axios.get(`http://localhost:3000/surveys/${surveyId}`);
          setSurvey(response.data);
        } catch (error) {
          console.error('Error fetching survey:', error);
        }
      };
  
      fetchSurvey();
    }, [surveyId]);
  
    const handleOptionChange = (questionId: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setSelectedOptions(prevSelectedOptions => ({
        ...prevSelectedOptions,
        [questionId]: value
      }));
    };
  
    const handleSubmit = async () => {
        const userChoices: UserChoiceDto[] = Object.keys(selectedOptions).map(questionId => ({
          questionId: parseInt(questionId),
          answer: [selectedOptions[parseInt(questionId)]]
        }));
      
        const filledSurveyData: SubmitSurveyDto = {
          name: 'Filled Survey', 
          surveyId: intSurveyId,
          userChoices: userChoices
        };
      
        setFilledSurvey(filledSurveyData);
        console.log(filledSurvey)
        try {
            const response = await axios.post(`http://localhost:3000/surveys/${intSurveyId}/submit`, filledSurveyData);
            console.log('Wypełniona ankieta została pomyślnie przesłana:', response.data);
          } catch (error) {
            console.error('Błąd podczas przesyłania wypełnionej ankiety:', error);
        }
    };
  
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
                        <label key={choiceIndex}>
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={choice}
                            checked={selectedOptions[question.id] === choice}
                            onChange={(e) => handleOptionChange(question.id, e)}
                          />
                          {choice}
                        </label>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button onClick={handleSubmit}>Wyślij</button>
          </>
        )}
      </div>
    );
  };
  
  export default SurveyRoom;