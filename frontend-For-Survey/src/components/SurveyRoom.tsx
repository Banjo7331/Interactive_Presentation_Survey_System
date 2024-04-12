import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/IsLogged';

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
    const { surveyId, roomId } = useParams();
    const intSurveyId = parseInt(surveyId!);
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [filledSurvey, setFilledSurvey] = useState<SubmitSurveyDto | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<{[key: number]: string}>({});
    const [roomError, setRoomError] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState('not submitted');

    const [errorMessage, setErrorMessage] = useState('');

    const [redirectToMenu, setRedirectToMenu] = useState(false);

    const { isAuthenticated } = useAuth();
    
    const navigate = useNavigate();
    useEffect(() => {
      const fetchSurvey = async () => {
        if (!surveyId) return;
        try {
          if (!isAuthenticated) {
            throw new Error('Token not found in localStorage');
          }
          const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Pobierz token, pomijając prefiks "token="
          const headers = { Authorization: `Bearer ${tokenCookie}` };
          console.log('Request headers:', headers);
          const response = await axios.get(`http://localhost:3000/surveys/${surveyId}`,{ headers: { Authorization: `Bearer ${tokenCookie}` } });
          setSurvey(response.data);
        } catch (error) {
          console.error('Error fetching survey:', error);
        }
      };
  
      fetchSurvey();
    }, [surveyId]);

    useEffect(() => {
      const joinRoom = async () => {
        
        const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Get the token, ignoring the "token=" prefix
        if (!tokenCookie) {
          throw new Error('Token not found in cookies');
        }
        const headers = { Authorization: `Bearer ${tokenCookie}` };
  
        // Join the room
        try {
          console.log('Joining room with ID:', roomId);
          await axios.post(`http://localhost:3000/surveys/${roomId}/join`, {}, { headers: { Authorization: `Bearer ${tokenCookie}` } });
        } catch (error: any) {
          if (error.response && error.response.status === 404) {
            setRoomError(`Room with ID ${roomId} not found`);
          }
        }
      };
  
      joinRoom();
    }, []);

    useEffect(() => {
      if (submissionStatus === 'submitted') {
        setTimeout(() => {
          navigate('/menu'); // Replace '/menu' with the path to your menu page
        }, 5000);
      }
    }, [submissionStatus]);
  
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
            const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Get the token, ignoring the "token=" prefix

            const response = await axios.post(`http://localhost:3000/surveys/${intSurveyId}/${roomId}/submit`, filledSurveyData,{ headers: { Authorization: `Bearer ${tokenCookie}` } });
            console.log('Wypełniona ankieta została pomyślnie przesłana:', response.data);
            setErrorMessage('');
            setSubmissionStatus('submitted');
          } catch (error) {
            console.error('Błąd podczas przesyłania wypełnionej ankiety:', error);
            if ((error as any).response) {
              if ((error as any).response.status === 403) {
                setErrorMessage('You have already submitted this survey');
              } else if ((error as any).response.status === 404) {
                setErrorMessage('The room does not exist or has been closed');
              }
            }
            setRedirectToMenu(true);
        }
    };
  
    return (
      <div>
        {roomError ? (
          <p>{roomError}</p>
        ) : (
        <div>
        {submissionStatus === 'submitted' ? (
          <p>Thanks for submitting the survey! You will be redirected to the menu in a few seconds.</p>
        ) : (
        survey && (
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
            {errorMessage && 
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            }
            {redirectToMenu && 
              <button className="btn btn-primary" onClick={() => window.location.href = '/menu'}>
                Go to Menu
              </button>
            }
          </>
        )
      )}
    
      </div>
    )}
      </div>
    );
  };
  
  export default SurveyRoom;