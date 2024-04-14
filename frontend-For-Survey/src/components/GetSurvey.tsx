import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/IsLogged';

interface QuestionDto {
  title: string;
  type: string;
  possibleChoices: string[];
}

interface SurveyDto {
  id: number;
  title: string;
  questions: QuestionDto[];
}

export default function GetSurvey() {
  const [survey, setSurvey] = useState<SurveyDto | null>(null);
  const [surveyId, setSurveyId] = useState<number | null>(null); // ID ankiety, którą chcesz pobrać
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<Object>({});
  const [roomClosed, setRoomClosed] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<SurveyDto[]>([]);
  const [surveyName, setSurveyName] = useState('');
  const [surveyNameInput, setSurveyNameInput] = useState('');

  const { isAuthenticated } = useAuth();
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        if (!isAuthenticated) {
          throw new Error('Token not found in localStorage');
        }
        const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1];
        const headers = { Authorization: `Bearer ${tokenCookie}` };
        console.log('Request headers:', headers);
        
        if (surveyNameInput) { // Add this line
          const response = await axios.get(`http://localhost:3000/surveys/search/${surveyName}`, { headers });
          console.log(response);
          setSurveys(response.data);

          const survey = response.data.find((survey: any) => survey.title === surveyName);
          if (survey) {
            setSurveyId(survey.id);
            console.log("Survey Id"+survey.id);
          } else {
            setSurveyId(null); // set to null if no survey found
          }
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
    };
  
    fetchSurveys();
  }, [surveyName]);

  /*useEffect(() => {
    const fetchSurvey = async () => {
      if (!surveyId) return; // Nie pobieraj, jeśli nie ma ID ankiety
      try {
        if (!isAuthenticated) {
          throw new Error('Token not found in localStorage');
        }
        const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Pobierz token, pomijając prefiks "token="
        const headers = { Authorization: `Bearer ${tokenCookie}` };
        console.log('Request headers:', headers);
        const response = await axios.get(`http://localhost:3000/surveys/${surveyId}`,{ headers: { Authorization: `Bearer ${tokenCookie}` } });
        console.log(response);
        setSurvey(response.data);
      } catch (error) {
        console.error('Error fetching survey:', error);
      }
    };

    fetchSurvey();
  }, [surveyId]);*/
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurveyNameInput(e.target.value);
  };
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSurveyName(surveyNameInput);
  };
  const handleInputChang2e = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSurveyName(event.target.value);
    setSurveyNameInput(event.target.value);
    console.log(surveyName);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setSurveyId(value);
    } else {
      setSurveyId(0); // Możesz też zachować poprzednią wartość surveyId
    }
  };
  const handleSurveyClick = (id: number, title: string) => {
    setSurveyNameInput(title);
    setSurveyId(id);
  };
  const [roomCreated, setRoomCreated] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (surveyId === null) {
      setError('Please select existing survey');
      return;
    }
    try {
      if (!isAuthenticated) {
        throw new Error('Token not found in localStorage');
      }
      console.log('Survey ID:', surveyId);
      const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Pobierz token, pomijając prefiks "token="
      console.log('Token:', tokenCookie)
      const headers = { Authorization: `Bearer ${tokenCookie}` };
      console.log('Request headers:', headers);
      const response = await axios.post(`http://localhost:3000/surveys/${surveyId}/create-room`,{},{ headers: { Authorization: `Bearer ${tokenCookie}` } });
      const roomId2 = response.data.id;
      setRoomId(response.data);
      console.log('Survey room created from usestate:', roomId);
      console.log('Survey room created:', response.data);
      console.log('Room ID:', roomId2);
      console.log('Room ID in useState:', roomId);
      setRoomCreated(true);
      navigate(`/survey-results/${surveyId}/${roomId2}`); // Use both surveyId and roomId in the URL
    } catch (error) {
      console.error('Error creating survey room:', error);
    }
  };

  return (
    <div>
      {/*
      <form onSubmit={handleSubmit}>
        <label>
          Enter Survey ID:
          <input type="number" value={surveyId} onChange={handleInputChange} />
        </label>
        <button type="submit">Open survey</button>
      </form>
      */}
       <form onSubmit={handleSubmit}>
        <label>
          Enter Survey Name:
          <input type="text" value={surveyNameInput} onChange={handleInputChang2e} />
        </label>
        <button type="submit">Search surveys</button>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}
      {surveys && surveys.slice(0, 4).map((survey, index) => (
        <div key={index}>
          <h2 onClick={() => handleSurveyClick(survey.id, survey.title)}>{survey.title}</h2>
        </div>
      ))}
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
                  <p>Possible Choices: {question.possibleChoices.join(', ')}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

