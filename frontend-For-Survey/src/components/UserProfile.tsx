import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Assuming you're using axios for HTTP requests
import { useAuth } from '../utils/IsLogged';
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
            // Send a DELETE request to your API
            await axios.delete(`http://localhost:3000/surveys/survey/${surveyId}`);

            // Remove the deleted survey from the state
            setSurveys(surveys.filter(survey => survey.id !== surveyId));
            setSurveyResults(surveyResults.filter(surveyResult => surveyResult.surveyId !== surveyId));
        } catch (error) {
            console.error('Failed to delete survey:', error);
        }
    };
    const handleDeleteSurveyRoomResult = async (roomId: string) => {
        try {
            // Send a DELETE request to your API
            await axios.delete(`http://localhost:3000/surveys/surveyRoomResult/${roomId}`);

            // Remove the deleted survey from the state
            setSurveyResults(surveyResults.filter(surveyResult => surveyResult.id !== roomId));
        } catch (error) {
            console.error('Failed to delete survey:', error);
        }
    };
  return (
    <div className="row">
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
  );
};

export default UserProfile;