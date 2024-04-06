import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css'
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { aggregateData } from '../utils/agregateData';
import { useAuth } from '../utils/IsLogged';


interface UserChoice {
  id: number;
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
  id: string;
  name: string;
  userChoices: UserChoice[];
  survey: Survey;
  user: any; // Replace 'any' with the actual type of the 'user' property
}

const SurveyResultsPage = () => {
  const [surveyResults, setSurveyResults] = useState<FilledSurvey[]>([]);
  const [data, setData] = useState<Record<string, Record<string, number>> | null>(null);
  const { surveyId, roomId } = useParams();
  const [ws, setWS] = React.useState<Socket | null>(null)
  const wsRef = React.useRef<Socket | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    // Establish WebSocket connection
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
    if (!wsRef.current) {
      const socket = io("ws://localhost:3000", {
        transports: ['websocket']
      });

      // Event listeners for WebSocket events
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      socket.on('surveySubmitted', async (submittedData) => {
        // Update survey results when a new survey is submitted
        console.log("gites")
        setSurveyResults(prevSurveyResults => [...prevSurveyResults, submittedData])
        const aggregatedData = aggregateData(surveyResults);
        setData(aggregatedData);
      });
      wsRef.current = socket;
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null; // Reset the ref after disconnecting
      }
    };
  }, []);
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
      const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Pobierz token, pomijając prefiks "token="
      const headers = { Authorization: `Bearer ${tokenCookie}` };
      console.log('Request headers:', headers);
      await axios.delete(`http://localhost:3000/surveys/${roomId}/close-room`,{ headers: { Authorization: `Bearer ${tokenCookie}` } });
      
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={deleteRoom}>Close Room</button>
        <p>http://localhost:5173/survey-room/{surveyId}/{roomId}</p>
      </div>
      {charts}
    </div>
  );
};

export default SurveyResultsPage;


