import React,{ useEffect, useState } from 'react'

import axios, { Axios } from 'axios'
import Login from './components/Login'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Signup from './components/Signup'
import Menu from './components/Menu'
import CreateSurvey from './components/CreateSurvey'
import { useAuth } from './utils/IsLogged'
import SurveyRoom from './components/SurveyRoom'
import SurveyResultsPage from './components/SurveyRoomResults'
import VerifyEmailPage from './components/VerifyEmail'

function App() {
  const { isAuthenticated, login } = useAuth();
  //localStorage.removeItem('token');
  useEffect(() => {
    const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      console.log('Token found in cookie:', token);
      login(token); // Ustawienie stanu autentykacji na podstawie ciasteczka
    }
  }, [login]);
  
  
  return(
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login></Login>}></Route>
      <Route path='/signup' element={<Signup></Signup>}></Route>
      <Route path='/menu/*' element={<Menu></Menu>}></Route>
      <Route path="/survey-room/:surveyId" element={<SurveyRoom />} />
      <Route path="/survey-results/:surveyId" element={<SurveyResultsPage/>} />
      <Route path="/verify-email" element={<VerifyEmailPage/>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
