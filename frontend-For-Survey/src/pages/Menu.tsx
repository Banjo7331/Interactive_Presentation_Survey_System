import { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import CreateSurvey from './survey-activities/CreateSurvey';
import GetSurvey from './survey-activities/GetSurvey';
import { useAuth } from '../utils/authorization/IsLogged';
import ProfileButton from '../components/user/ProfilleButton';
import UserProfile from './user/UserProfile';
import axios from 'axios';

export default function Menu() {
  const { isAuthenticated,token } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      
      const headers = { Authorization: `Bearer ${token}` };
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/users/data`, { headers });
          console.log(response);
          setNickname(response.data.username);
        } catch (error) {
          console.error('Error fetching surveys:', error);
        }
      };
      fetchData();
    }
  }, []);
  
  const handleCreateSurveyClick = () => {
    if (isAuthenticated) {
      navigate('/createSurvey');
    } else {
      // Redirect to the login page
      navigate('/login');
    }
  };
  const handleChooseSurveyClick = () => {
    if (isAuthenticated) {
      navigate('/getSurvey');
    } else {
      // Redirect to the login page
      navigate('/login');
    }
  };

  return (
    <div>
   <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <div className="container-fluid d-flex justify-content-between">
      <div className="btn-group" role="group" aria-label="Basic example">
        <button onClick={handleCreateSurveyClick} className="px-4 py-2 bg-blue-500 text-white rounded">Create Survey</button>
        <button onClick={handleChooseSurveyClick} className="px-4 py-2 bg-blue-500 text-white rounded">Find Survey</button>
      </div>
      <ProfileButton nickname={nickname} />
    </div>
  </nav>
    <Routes>
      {/* Nested route for the createSurvey component */}
      <Route path="createSurvey" element={<CreateSurvey />} />
      <Route path="getSurvey" element={<GetSurvey />} />
      <Route path="profile/:userNickName?" element={<UserProfile />} />
    </Routes>
  </div>
  );
}
