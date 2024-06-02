import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css'
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { useAuth } from '../../utils/authorization/IsLogged';
import QRCode from 'qrcode.react';
import { roomExists } from '../../utils/live-survey/roomExists';
import RoomErrorPage from '../../components/RoomErrorPage';
import { Survey } from '../../entities/survey-activities/survey.entity';
import { FilledSurvey} from '../../entities/live-survey/filled-survey/filledSurvey.entity';
import { QuestionRoomResultDto, SurveyRoomResultDto } from '../../entities/live-survey/room/roomResult.DTO';


const SurveyResultsPage = () => {
  const [surveyResults, setSurveyResults] = useState<FilledSurvey[]>([]);
  const { userId,surveyId, roomId } = useParams();
  const wsRef = React.useRef<Socket | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);

  const [submittedUserCount, setSubmittedUserCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(-1);
  const [roomCreated, setRoomCreated] = useState(false);


  const navigate = useNavigate()
  
  const { isAuthenticated, token } = useAuth();
  useEffect(() => {
    const fetchSurvey = async () => {
      if (!surveyId) return;
      try {
        if (!isAuthenticated) {
            navigate('/');
        }
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
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
      socket.on('roomCreation', async ({ roomId, userId }) => {
        console.log(`Room created: ${roomId} by user: ${userId}`);
      });
      socket.on('userJoined', async () => {
        setJoinedCount(prevCount => prevCount + 1); 
      });
      socket.on('surveySubmitted', async (submittedData) => {
        setSurveyResults(prevSurveyResults => [...prevSurveyResults, submittedData])
        setSubmittedUserCount(prevCount => prevCount + 1);
      });
      wsRef.current = socket;
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null; 
      }
      
    };
  }, []);

  const [doesRoomExist, setDoesRoomExist] = useState(true);
  useEffect(() => {
    async function loadRoom() {
      if(isAuthenticated && roomId && token){
        if(!await roomExists(roomId)){
          setDoesRoomExist(false);
        }
      }
    }

    loadRoom();
  }, [isAuthenticated, roomId, token]);

  const [currentAnswerIndices, setCurrentAnswerIndices] = useState<number[]>([]);

  useEffect(() => {
    if (survey) {
      setCurrentAnswerIndices(new Array(survey.questions.length).fill(0));
    }
  }, [survey]);

  const handleNext = (questionIndex: number) => {
    setCurrentAnswerIndices(prevIndices => {
      const newIndices = [...prevIndices];
      newIndices[questionIndex]++;
      return newIndices;
    });
  };

  const handlePrev = (questionIndex: number) => {
    setCurrentAnswerIndices(prevIndices => {
      const newIndices = [...prevIndices];
      newIndices[questionIndex]--;
      return newIndices;
    });
  };

  const [isHovered, setIsHovered] = useState<{ questionIndex: number, answerIndex: number } | null>(null);
  const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#3F51B5', '#546E7A', '#D4526E', '#8D5B4C', '#F86624', '#D7263D', '#1B998B', '#2E294E', '#F46036', '#E2C044'];

  const charts = survey?.questions.map((question, index) => {
    if (question.type === 'text-answer') {
      const textAnswers = surveyResults.map(surveyResult => surveyResult.userChoices[index].answer);
      return (
        <div key={index} className={`w-3/4 p-5 mt-${index * 5} border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer transition-transform duration-200 ease-in-out ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
          <div className="w-1/2">
            <h3>{question.title}</h3>
            <div className="flex flex-row flex-wrap justify-center">
              <button onClick={() => handlePrev(index)} disabled={currentAnswerIndices[index] === 0}>←</button>
              <div 
                className={`m-2 p-2 border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer transition-transform duration-200 ease-in-out`}
                style={{ 
                  transform: isHovered?.questionIndex === index && isHovered?.answerIndex === currentAnswerIndices[index] ? 'scale(1.05)' : 'scale(1)', 
                  width: '150px', 
                  height: '150px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={() => setIsHovered({ questionIndex: index, answerIndex: currentAnswerIndices[index] })}
                onMouseLeave={() => setIsHovered(null)}
              >
                <p style={{ display: isHovered?.questionIndex === index && isHovered?.answerIndex === currentAnswerIndices[index] ? 'block' : 'none' }}>{textAnswers[currentAnswerIndices[index]]}</p>
              </div>
              <button onClick={() => handleNext(index)} disabled={currentAnswerIndices[index] === textAnswers.length - 1}>→</button>
            </div>
          </div>
        </div>
      );
    } else {
      const choiceCounts = question.possibleChoices.reduce((counts, choice) => {
        counts[choice] = 0;
        return counts;
      }, {} as Record<string, number>);
  
      surveyResults.forEach(surveyResult => {
        const answer = surveyResult.userChoices[index].answer;
        if (Array.isArray(answer)) {
          answer.forEach(choice => {
            if (choice in choiceCounts) {
              choiceCounts[choice]++;
            }
          });
        } else if (answer in choiceCounts) {
          choiceCounts[answer]++;
        }
      });
  
      const options = {
        chart: {
          type: 'bar' as const,
        },
        colors: [colors[index % colors.length]],
        series: [{
          data: Object.entries(choiceCounts).map(([choice, count]) => ({ x: choice, y: count }))
        }],
        xaxis: {
          type: 'category' as const,
        }
      };
  
      return (
        <div key={index} className={`w-3/4 p-5 mt-${index * 5} border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
          <div className="w-1/2">
            <h3>{question.title}</h3>
            <ReactApexChart options={options} series={options.series} type="bar" />
          </div>
        </div>
      );
    }
  }) || null;

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
      const headers = { Authorization: `Bearer ${token}` };
      console.log('Request headers:', headers);
      await axios.delete(`http://localhost:3000/surveys/${surveyId}/${roomId}/close-room`, { 
        headers,
        data: surveyResultsDto
      });
      navigate('/');
      
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
    return <RoomErrorPage />; 
  }
  return (
  <div className="flex flex-col items-center space-y-5">
    <div className="d-flex justify-content-between">
        <button onClick={deleteRoom} className="px-4 py-2 bg-blue-500 text-white rounded">Close Room</button>
        <div>
          <h5 className="card-title">Survey Count</h5>
          <p className="card-text">{submittedUserCount}/{joinedCount}</p>
        </div>
    </div>
    <div className="flex flex-col items-center text-center mt-5 p-5 border-2 border-gray-300 rounded-lg shadow-lg">
      <QRCode className="mb-4" value={`http://localhost:5173/survey-room/${surveyId}/${roomId}`} />
      <p className="text-gray-700 text-sm">http://localhost:5173/survey-room/{surveyId}/{roomId}</p>
    </div>
    {charts && charts.map((chart, index) => (
      <div key={index} className={`w-1/3 p-5 mt-${index * 5} border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out ${index % 2 === 0 ? 'ml-auto mr-5' : 'mr-auto ml-5'}`}>
        {chart}
      </div>
    ))}
  </div>
);
};

export default SurveyResultsPage;


