import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/authorization/IsLogged';
import { Survey } from '../../entities/survey-activities/survey.entity';


export default function GetSurvey() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [surveyId, setSurveyId] = useState<string | null>(null); // ID ankiety, którą chcesz pobrać
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<Object>({});
  
  const [error, setError] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyName, setSurveyName] = useState('');
  const [surveyNameInput, setSurveyNameInput] = useState('');
  

  const [showInputForMaxUsers, setShowInputForMaxUsers] = useState<boolean>(false);
  const [maxUsers, setMaxUsers] = useState<number>(50);

  const { isAuthenticated, token } = useAuth();
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/login');
        }else{
          //const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1];
          const headers = { Authorization: `Bearer ${token}` };
          console.log('Request headers:', headers);
          
          if (surveyNameInput && surveyNameInput.length >= 3){
            const response = await axios.get(`http://localhost:3000/surveys/search/${surveyName}`, { headers });
            console.log(response);
            setSurveys(response.data);

            const survey = response.data.find((survey: any) => {
              return survey.title === surveyName && (surveyId ? survey.id === surveyId : true);
            });
            setSurvey(survey);
            if (survey && !surveyId) {
              setSurveyId(survey.id);
              console.log("Survey Id"+survey.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
    };
  
    fetchSurveys();
  }, [surveyName,surveyId]);

  const handleInputChang2e = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSurveyName(event.target.value);
    setSurveyNameInput(event.target.value);
    console.log(surveyName);
  };

  const handleSurveyClick = (id: string, title: string) => {
    setSurveyNameInput(title);
    setSurveyId(id);
    console.log(id);
    setSurveyName(title);
  };
  //const [roomCreated, setRoomCreated] = useState(false);

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
      //const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Pobierz token, pomijając prefiks "token="
      // console.log('Token:', tokenCookie)
      const headers = { Authorization: `Bearer ${token}` };
      console.log('Request headers:', headers);
      const response = await axios.post(`http://localhost:3000/surveys/${surveyId}/${maxUsers}/create-room`,{},{ headers });
      console.log("trolololo"+response.data)
      const roomId2 = response.data.roomId;
      const userId = response.data.userId;
      setRoomId(response.data);
      console.log('Survey room created from usestate:', roomId);
      console.log('Survey room created:', response.data);
      console.log('Room ID:', roomId2);
      console.log('Room ID in useState:', roomId);
      //setRoomCreated(true);
      navigate(`/survey-results/${userId}/${surveyId}/${roomId2}`); // Use both surveyId and roomId in the URL
    } catch (error) {
      console.error('Error creating survey room:', error);
    }
  };

  return (
    <div>
      <label>
          Enter Survey Name:
          <input type="text" value={surveyNameInput} onChange={handleInputChang2e} />
      </label>
      <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowInputForMaxUsers(true)}>Open Room</button>
      {showInputForMaxUsers && (
        <form onSubmit={handleSubmit}>
          <input type="number" min="1" max="50" value={maxUsers} onChange={(e) => setMaxUsers(Number(e.target.value))} />
          <button type="submit">Submit</button>
        </form>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
      {surveys && surveys.map((survey, index) => (
        <div key={index}>
          <h2 onClick={() => handleSurveyClick(survey.id, survey.title)}>{survey.title}</h2>
        </div>
      ))}
      {survey && (
        <div className="flex justify-between items-center space-y-5">
          <div className="flex flex-col items-center text-center mt-5 p-5 border-2 border-gray-300 rounded-lg shadow-lg">
            <h3 className="mb-4">Preview</h3>
            {survey.questions && survey.questions.map((question, index) => (
              <div key={index} className={`w-1/3 p-5 mt-${index * 5} border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out ${index % 2 === 0 ? 'ml-auto mr-5' : 'mr-auto ml-5'}`}>
                <p>{question.title}</p>
                <p>Type: {question.type}</p>
                {question.possibleChoices && (
                  <p>Possible Choices: {question.possibleChoices.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

