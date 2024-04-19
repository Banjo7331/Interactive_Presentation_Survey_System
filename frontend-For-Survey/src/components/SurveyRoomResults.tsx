import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css'
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { aggregateData } from '../utils/agregateData';
import { useAuth } from '../utils/IsLogged';
import QRCode from 'qrcode.react';
import { roomExists } from '../utils/roomExists';
import RoomErrorPage from '../services/RoomErrorPage';


interface UserChoice {
  answer: any[]; // Replace 'any' with the actual type of the elements in the 'answer' array
}

interface Survey {
  id: string;
  title: string;
  questions: QuestionDto[];
}

interface QuestionDto {
  id: number;
  title: string;
  type: string;
  possibleChoices: string[];
}

interface FilledSurvey {
  name: string;
  userChoices: UserChoice[];
  survey: Survey;
  user: any; // Replace 'any' with the actual type of the 'user' property
}

interface QuestionRoomResultDto {
  title: string;
  type: string;
  question: QuestionDto;
  answer: string[][];
}

interface SurveyRoomResultDto {
  questionRoomResultDto: QuestionRoomResultDto[];
}

const SurveyResultsPage = () => {
  const [surveyResults, setSurveyResults] = useState<FilledSurvey[]>([]);
  const [data, setData] = useState<Record<string, Record<string, number>> | null>(null);
  const { userId,surveyId, roomId } = useParams();
  const [ws, setWS] = React.useState<Socket | null>(null)
  const wsRef = React.useRef<Socket | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);

  const [submittedUserCount, setSubmittedUserCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(-1);
  const [roomCreated, setRoomCreated] = useState(false);


  const navigate = useNavigate()
  
  const { isAuthenticated, token } = useAuth();
  useEffect(() => {
    // Establish WebSocket connection
    const fetchSurvey = async () => {
      if (!surveyId) return;
      try {
        if (!isAuthenticated) {
          throw new Error('Token not found in localStorage');
        }
        //const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Pobierz token, pomijając prefiks "token="
        const headers = { Authorization: `Bearer ${token}` };
        console.log('Request headers:', headers);
        const response = await axios.get(`http://localhost:3000/surveys/${surveyId}`,{ headers });
        setSurvey(response.data);
      } catch (error) {
        console.error('Error fetching survey:', error);
      }
    };

    fetchSurvey();
    if (!wsRef.current) {
      const socket = io("ws://localhost:3000", {
        transports: ['websocket']
      });
      if(!roomCreated){
        socket.emit('roomCreation', { roomId, userId });
        setRoomCreated(true);
      }
      // Event listeners for WebSocket events
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
      socket.on('roomCreation', async ({ roomId, userId }) => {
        // Update room ID and user ID when a new room is created
        console.log(`Room created: ${roomId} by user: ${userId}`);
        // Update your state here
      });
      socket.on('userJoined', async () => {
        // Update joined count when a new user joins the room
        console.log("aha");
        setJoinedCount(prevCount => prevCount + 1); // Add this line
      });
      socket.on('surveySubmitted', async (submittedData) => {
        // Update survey results when a new survey is submitted
        console.log("gites")
        setSurveyResults(prevSurveyResults => [...prevSurveyResults, submittedData])
        const aggregatedData = aggregateData(surveyResults);
        setData(aggregatedData);
        setSubmittedUserCount(prevCount => prevCount + 1);
      });
      wsRef.current = socket;
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null; // Reset the ref after disconnecting
        console.log("ojejejejejejej")
      }
      
    };
  }, []);

  const [doesRoomExist, setDoesRoomExist] = useState(true);
  useEffect(() => {
    async function loadRoom() {
      if(isAuthenticated && roomId && token){
        if(!await roomExists(roomId, token)){
          setDoesRoomExist(false);
        }
      }
    }

    loadRoom();
  }, [isAuthenticated, roomId, token]);

  const charts = survey?.questions.map((question, index) => {
    // Initialize an object to store the count of each choice
    const choiceCounts = question.possibleChoices.reduce((counts, choice) => {
      counts[choice] = 0;
      return counts;
    }, {} as Record<string, number>);

    // Count the number of times each choice was selected
    surveyResults.forEach(surveyResult => {
      const answer = surveyResult.userChoices[index].answer;
      if (answer.length > 0 && answer[0] in choiceCounts) {
        choiceCounts[answer[0]]++;
      }
    });

    const options = {
      chart: {
        type: 'bar' as const,
      },
      series: [{
        data: Object.entries(choiceCounts).map(([choice, count]) => ({ x: choice, y: count }))
      }],
      xaxis: {
        type: 'category' as const,
      }
    };

    return (
      <div key={index}>
        <h3>{question.title}</h3>
        <ReactApexChart options={options} series={options.series} type="bar" />
      </div>
    );
  }) || null; // Render nothing if survey is null

  const deleteRoom = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Token not found in localStorage');
      }
      if (!survey) {
        throw new Error('Survey not found');
      }
      const surveyResultsDto = filledSurveysToDto(surveyResults, survey);
      console.log(surveyResultsDto);
      //const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Pobierz token, pomijając prefiks "token="
      const headers = { Authorization: `Bearer ${token}` };
      console.log('Request headers:', headers);
      await axios.delete(`http://localhost:3000/surveys/${surveyId}/${roomId}/close-room`, { 
        headers,
        data: surveyResultsDto
      });
      navigate('/menu');
      
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };
  

  const filledSurveysToDto = (filledSurveys: FilledSurvey[], survey: Survey): SurveyRoomResultDto => {
    const questionRoomResults = survey.questions.map((question, index) => {
      const answers = filledSurveys.map(filledSurvey => filledSurvey.userChoices[index].answer);
      return {
        title: question.title,
        type: question.type,
        question: question, 
        answer: answers
      } as QuestionRoomResultDto;
    });
  
    return {
      questionRoomResultDto: questionRoomResults 
    } as SurveyRoomResultDto;
  };
  if (!doesRoomExist) {
    return <RoomErrorPage />; // Render an error component if the room does not exist
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={deleteRoom}>Close Room</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
        <p>http://localhost:5173/survey-room/{surveyId}/{roomId}</p>
        <QRCode value={`http://localhost:5173/survey-room/${surveyId}/${roomId}`} />
      </div>
      {charts}
      <div className="card" style={{ position: 'absolute', top: 0, right: 0, width: '18rem' }}>
        <div className="card-body">
          <h5 className="card-title">Survey Count</h5>
          <p className="card-text">{submittedUserCount}/{joinedCount}</p>
        </div>
      </div>
    </div>
  );
};

export default SurveyResultsPage;


