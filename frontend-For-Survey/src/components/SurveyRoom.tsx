import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/IsLogged';
import { roomExists } from '../utils/roomExists';
import RoomErrorPage from '../services/RoomErrorPage';
import { v4 as uuidv4 } from 'uuid';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

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
  enum QuestionType {
    MULTIPLE_CHOICE = 'multiple-correct-answer',
    ONE_CHOICE = 'single-correct-answer',
    TEXT = 'text-answer',
  }
const SurveyRoom = () => {
    const { surveyId, roomId } = useParams();
    const intSurveyId = parseInt(surveyId!);
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [filledSurvey, setFilledSurvey] = useState<SubmitSurveyDto | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: string | string[] }>({});
    const [roomError, setRoomError] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState('not submitted');
    const [doesRoomExist, setDoesRoomExist] = useState(true);

    const [errorMessage, setErrorMessage] = useState('');

    const [redirectToMenu, setRedirectToMenu] = useState(false);

    const {token} = useAuth();
    
    const navigate = useNavigate();

    useEffect(() => {
      const fetchSurvey = async () => {
        if (!surveyId) return;
        let deviceId = await localStorage.getItem('device-id');
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Device-Id': deviceId
        };
        try {
          console.log("nie wiem o co chodzi");
          const response = await axios.get(`http://localhost:3000/surveys/${surveyId}`,{ headers });
          setSurvey(response.data);
        } catch (error) {
          console.error('Error fetching survey:', error);
        }
      };
      
      fetchSurvey();
    }, [surveyId]);

    useEffect(() => {
      const joinRoom = async () => {
        let deviceId = localStorage.getItem('device-id');
        if (!deviceId) {
          // If not, generate a new one and store it
          deviceId = uuidv4();
          localStorage.setItem('device-id', deviceId);
        }
        
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Device-Id': deviceId
        };

        // Join the room
        try {
          console.log('Joining room with ID:', roomId);
          await axios.post(`http://localhost:3000/surveys/${roomId}/join`, {}, { headers });
        } catch (error: any) {
          if (error.response && error.response.status === 404) {
            setRoomError(`Room with ID ${roomId} not found`);
          }
        }
      };
      async function loadRoom() {
        if(roomId){
          if(await roomExists(roomId)){
            joinRoom();
          }else{
            console.log("umpa lumpa")
            setDoesRoomExist(false);
          }
        }
      }
      
      loadRoom();
    }, [doesRoomExist]);

    useEffect(() => {
      if (submissionStatus === 'submitted') {
        setTimeout(() => {
          navigate('/menu'); 
        }, 5000);
      }
    }, [submissionStatus]);
  
    const handleOptionChange = (questionId: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement;
      const { value, checked, type } = target;
      setSelectedOptions(prevSelectedOptions => {
        const previousSelection = prevSelectedOptions[questionId];
        if (type === 'checkbox') {
          if (Array.isArray(previousSelection)) {
            if (checked) {
              return {
                ...prevSelectedOptions,
                [questionId]: [...previousSelection, value]
              };
            } else {
              return {
                ...prevSelectedOptions,
                [questionId]: previousSelection.filter(choice => choice !== value)
              };
            }
          } else {
            return {
              ...prevSelectedOptions,
              [questionId]: [value]
            };
          }
        } else {
          return {
            ...prevSelectedOptions,
            [questionId]: value
          };
        }
      });
    };
  
    const handleSubmit = async () => {
      const userChoices: UserChoiceDto[] = Object.keys(selectedOptions).map(questionId => {
        const answer = selectedOptions[parseInt(questionId)];
        return {
          questionId: parseInt(questionId),
          answer: Array.isArray(answer) ? answer : [answer]
        };
      });
    
      const filledSurveyData: SubmitSurveyDto = {
        name: 'Filled Survey', 
        surveyId: intSurveyId,
        userChoices: userChoices
      };
    
      setFilledSurvey(filledSurveyData);
      console.log(filledSurvey)
      try {
        //const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Get the token, ignoring the "token=" prefix
        let deviceId = localStorage.getItem('device-id');
        if (!deviceId) {
          // If not, generate a new one and store it
          deviceId = uuidv4();
          localStorage.setItem('device-id', deviceId);
        }
        
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Device-Id': deviceId
        };
        const response = await axios.post(`http://localhost:3000/surveys/${intSurveyId}/${roomId}/submit`, filledSurveyData,{ headers});
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
    if (!doesRoomExist) {
      return <RoomErrorPage />; // Render an error component if the room does not exist
    }
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
                {question.type === QuestionType.TEXT ? (
                  <textarea
                    name={`question-${question.id}`}
                    value={selectedOptions[question.id] || ''}
                    onChange={(e) => handleOptionChange(question.id, e)}
                  />
                ) : (
                  question.possibleChoices && (
                    <div>
                      <p>Possible Choices:</p>
                      {question.possibleChoices.map((choice, choiceIndex) => (
                        <label key={choiceIndex}>
                          <input
                            type={question.type === QuestionType.ONE_CHOICE ? "radio" : "checkbox"}
                            name={`question-${question.id}`}
                            value={choice}
                            checked={Array.isArray(selectedOptions[question.id]) 
                              ? selectedOptions[question.id].includes(choice)
                              : selectedOptions[question.id] === choice}
                              onChange={(e) => handleOptionChange(question.id, e)}
                          />
                          {choice}
                        </label>
                      ))}
                    </div>
                  )
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