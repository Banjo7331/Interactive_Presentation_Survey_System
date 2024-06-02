import { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import axios from 'axios'; 
import { useAuth } from '../../utils/authorization/IsLogged';
import ConfirmationWindow from '../../components/user/ConfirmationWindow';
import ChangePasswordWindow from '../../components/user/ChangePasswordWindow';
import { Survey } from '../../entities/survey-activities/survey.entity';
import { SurveyRoomResult } from '../../entities/live-survey/room/roomResult.entity';


 const UserProfile = () => {

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyResults, setSurveyResults] = useState<SurveyRoomResult[]>([]);
  
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [selectedResult, setSelectedResult] = useState<SurveyRoomResult | null>(null);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'survey' | 'surveyRoomResult' | null>(null);

  const navigate = useNavigate();
  
  const { isAuthenticated,token } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
        try {
            if (!isAuthenticated ) {
                navigate('/login');
            }
            const headers = { Authorization: `Bearer ${token}` };
            console.log('Request headers:', headers);
            const response = await axios.get(`http://localhost:3000/surveys/user/surveys`,{ headers })
            
            console.log(response);
            setSurveys(response.data)
            
            const response2 = await axios.get(`http://localhost:3000/surveys/user/survey-results`,{ headers })
      
            console.log(response2);
            setSurveyResults(response2.data)
        } catch (error) {
          console.error('Error fetching survey:', error);
        }
      };

    fetchData();
    
  }, []);

  const handleSurveyClick = (survey: Survey) =>{
    setSelectedSurvey(survey);
  }
  const handleResultClick = (result: SurveyRoomResult) =>{
    setSelectedResult(result);
  }
  const handleOpenChangePasswordModal = () => {
    setShowChangePasswordModal(true);
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
  };

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
          if (!isAuthenticated) {
            throw new Error('Token not found in localStorage');
          }
          const headers = { Authorization: `Bearer ${token}` };
          if (selectedType === 'survey') {
            await axios.delete(`http://localhost:3000/surveys/survey/${selectedId}`, { headers });
            setSurveys(surveys.filter(survey => survey.id !== selectedId));
            setSurveyResults(surveyResults.filter(surveyResult => surveyResult.surveyId !== selectedId));
          } else if (selectedType === 'surveyRoomResult') {
            await axios.delete(`http://localhost:3000/surveys/surveyRoomResult/${selectedId}`, { headers });
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
        navigate('/');
      } else {
        navigate('/login');
      }
    };
    return (
      <>
        <ConfirmationWindow show={showConfirmation} handleConfirm={handleConfirmDelete} handleCancel={handleCancelDelete} />
        <ChangePasswordWindow
          show={showChangePasswordModal}
          handleClose={handleCloseChangePasswordModal}
        />
        <div className="d-flex justify-content-between p-2">
          <button onClick={handleGoBackMenuClick} className="px-4 py-2 bg-blue-500 text-white rounded">Menu</button>
          <button onClick={handleOpenChangePasswordModal} className="px-4 py-2 bg-blue-500 text-white rounded">Change Password</button>
        </div>
        <div className="row  mt-5">
          <div className="col">
            <h2>Surveys</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Details</th>
                  <th>Action</th>
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
                    <td>
                      <button onClick={() => handleDeleteSurvey(survey.id)} className="btn btn-danger">Delete</button>
                    </td>
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
                  <th>Action</th>
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
                    <td>
                      <button onClick={() => handleDeleteSurveyRoomResult(result.id)} className="btn btn-danger">Delete</button>
                    </td>
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