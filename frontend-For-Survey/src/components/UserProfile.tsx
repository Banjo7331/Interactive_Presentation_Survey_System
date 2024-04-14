import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'; // Assuming you're using axios for HTTP requests
import { useAuth } from '../utils/IsLogged';
import ConfirmationWindow from '../services/ConfirmationWindow';
// Interfaces
interface QuestionDto {
  id: number;
  title: string;
  type: string;
  possibleChoices: string[];
}

interface Survey {
  id: string;
  title: string;
  questions: QuestionDto[];
}

interface QuestionRoomResultDto {
  id: string;
  question: QuestionDto;
  answer: string[][];
}

interface SurveyRoomResultDto {
  id: string;
  surveyId: string;
  questionRoomResult: QuestionRoomResultDto[];
  room: string;
}

 const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyResults, setSurveyResults] = useState<SurveyRoomResultDto[]>([]);
  
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [selectedResult, setSelectedResult] = useState<SurveyRoomResultDto | null>(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'survey' | 'surveyRoomResult' | null>(null);

  const navigate = useNavigate();
  
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
        try {
            if (!isAuthenticated) {
                throw new Error('Token not found in localStorage');
            }
            const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Pobierz token, pomijając prefiks "token="
            const headers = { Authorization: `Bearer ${tokenCookie}` };
            console.log('Request headers:', headers);
            const response = await axios.get(`http://localhost:3000/surveys/user/surveys`,{ headers: { Authorization: `Bearer ${tokenCookie}` } })
            
            console.log(response);
            setSurveys(response.data)
            
            const response2 = await axios.get(`http://localhost:3000/surveys/user/survey-results`,{ headers: { Authorization: `Bearer ${tokenCookie}` } })
      
            console.log(response2);
            setSurveyResults(response2.data)
        } catch (error) {
          console.error('Error fetching survey:', error);
        }
      };

    fetchData();
    // Replace with your actual API endpoint
    
  }, []);

  const handleSurveyClick = (survey: Survey) =>{
    setSelectedSurvey(survey);
  }
  const handleResultClick = (result: SurveyRoomResultDto) =>{
    setSelectedResult(result);
  }

    const handleDeleteSurvey = async (surveyId: string) => {
        try {
            setSelectedId(surveyId);
            setSelectedType('survey');
            setShowConfirmation(true);
        } catch (error) {
            console.error('Failed to delete survey:', error);
        }
    };
    const handleDeleteSurveyRoomResult = async (roomId: string) => {
        try {
            setSelectedId(roomId);
            setSelectedType('surveyRoomResult');
            setShowConfirmation(true);
        } catch (error) {
            console.error('Failed to delete survey:', error);
        }
    };
    const handleConfirmDelete = async () => {
      if (selectedId) {
        try {
          if (selectedType === 'survey') {
            await axios.delete(`http://localhost:3000/surveys/survey/${selectedId}`);
            setSurveys(surveys.filter(survey => survey.id !== selectedId));
            setSurveyResults(surveyResults.filter(surveyResult => surveyResult.surveyId !== selectedId));
          } else if (selectedType === 'surveyRoomResult') {
            await axios.delete(`http://localhost:3000/surveys/surveyRoomResult/${selectedId}`);
            setSurveyResults(surveyResults.filter(surveyResult => surveyResult.id !== selectedId));
          }
        } catch (error) {
          console.error('Failed to delete item:', error);
        }
      }
      setSelectedType(null);
      setShowConfirmation(false);
    };
    const handleCancelDelete = () => {
      setSelectedType(null);
      setShowConfirmation(false);
    };
    const handleGoBackMenuClick = () => {
      if (isAuthenticated) {
        navigate('/menu');
      } else {
        // Redirect to the login page
        navigate('/');
      }
    };
  return (
    <>
    <ConfirmationWindow show={showConfirmation} handleConfirm={handleConfirmDelete} handleCancel={handleCancelDelete} />
    <div className="position-absolute top-0 start-0  p-2">
      <button onClick={handleGoBackMenuClick} className="btn btn-primary">Menu</button>
    </div>
    <div className="row  mt-5">
      <div className="col">
        <h2>Surveys</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {surveys && surveys.map(survey => (
              <tr key={survey.id} onClick={() => handleSurveyClick(survey)}>
                <td>{survey.title}</td>
                <td>
                  {selectedSurvey === survey && selectedSurvey.questions && selectedSurvey.questions.map(question => (
                    <div key={question.id}>
                      <h4>{question.title}</h4>
                      <p>Type: {question.type}</p>
                      <p>Possible Choices: {question.possibleChoices.join(', ')}</p>
                    </div>
                  ))}
                </td>
                <button onClick={() => handleDeleteSurvey(survey.id)} className="btn btn-danger">Delete</button>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="col">
        <h2>Survey Results</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Result</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {surveyResults && surveyResults.map(result => (
              <tr key={result.id} onClick={() => handleResultClick(result)}>
                <td>Survey Result {result.id}</td>
                <td>
                  {selectedResult === result && selectedResult.questionRoomResult && selectedResult.questionRoomResult.map(questionResult => (
                    <div key={questionResult.id}>
                      <p>Answer: {questionResult.answer.join(', ')}</p>
                    </div>
                  ))}
                </td>
                <button onClick={() => handleDeleteSurveyRoomResult(result.id)} className="btn btn-danger">Delete</button>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default UserProfile;