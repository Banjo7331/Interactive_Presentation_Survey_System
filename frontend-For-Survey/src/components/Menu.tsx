import React from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import CreateSurvey from './CreateSurvey';
import GetSurvey from './GetSurvey';
import { useAuth } from '../utils/IsLogged';

export default function Menu() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
    <div className="container-fluid d-flex justify-content-center">
      <div className="btn-group" role="group" aria-label="Basic example">
        <button onClick={handleCreateSurveyClick} className="btn btn-primary me-2">Create Survey</button>
        <button onClick={handleChooseSurveyClick} className="btn btn-primary me-2">Get Survey</button>
        {/* Add more buttons here */}
      </div>
    </div>
  </nav>
    <Routes>
      {/* Nested route for the createSurvey component */}
      <Route path="createSurvey" element={<CreateSurvey />} />
      <Route path="getSurvey" element={<GetSurvey />} />
    </Routes>
  </div>
  );
}
