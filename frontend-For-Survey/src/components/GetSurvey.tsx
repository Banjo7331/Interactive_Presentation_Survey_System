import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { Route, Routes, useNavigate } from 'react-router-dom';

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
  const [surveyId, setSurveyId] = useState<number>(0); // ID ankiety, którą chcesz pobrać
  const navigate = useNavigate();
  
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setSurveyId(value);
    } else {
      setSurveyId(0); // Możesz też zachować poprzednią wartość surveyId
    }
  };

  const [roomCreated, setRoomCreated] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');
    try {
      const response = await axios.post(`http://localhost:3000/surveys/${surveyId}/create-room`);
      console.log('Survey room created:', response.data);
      setRoomCreated(true);

      const roomId = response.data.id;
      navigate(`/survey-room/${surveyId}`);
    } catch (error) {
      console.error('Error creating survey room:', error);
      // Handle error, display message to the user, etc.
    }
  };
  const handleViewResults = () => {
    navigate(`/survey-results/${surveyId}`);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Survey ID:
          <input type="number" value={surveyId} onChange={handleInputChange} />
        </label>
        <button type="submit">Open survey</button>
      </form>
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
          <button onClick={handleViewResults}>View Results</button>
        </>
      )}
    </div>
  );
}

