import React, { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import CreateSurvey from './CreateSurvey';
import GetSurvey from './GetSurvey';
import { useAuth } from '../utils/IsLogged';
import ProfileButton from '../services/ProfilleButton';
import UserProfile from './UserProfile';
import axios from 'axios';

export default function Menu() {
  const { isAuthenticated,token } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      throw new Error('Token not found');
    }
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
  }, []);
  
  const handleCreateSurveyClick = () => {
    if (isAuthenticated) {
      navigate('/menu/createSurvey');
    } else {
      // Redirect to the login page
      navigate('/');
    }
  };
  const handleChooseSurveyClick = () => {
    if (isAuthenticated) {
      navigate('/menu/getSurvey');
    } else {
      // Redirect to the login page
      navigate('/');
    }
  };

  return (
    <div>
   <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <div className="container-fluid d-flex justify-content-between">
      <div className="btn-group" role="group" aria-label="Basic example">
        <button onClick={handleCreateSurveyClick} className="btn btn-primary me-2">Create Survey</button>
        <button onClick={handleChooseSurveyClick} className="btn btn-primary me-2">Get Survey</button>
      </div>
      <ProfileButton nickname={nickname} />
    </div>
  </nav>
    <Routes>
      {/* Nested route for the createSurvey component */}
      <Route path="createSurvey" element={<CreateSurvey />} />
      <Route path="getSurvey" element={<GetSurvey />} />
      <Route path="profile/:userNickName" element={<UserProfile />} />
    </Routes>
  </div>
  );
}
