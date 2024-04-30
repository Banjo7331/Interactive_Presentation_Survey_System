import { useEffect,  } from 'react'

import Login from './components/Login'
import { BrowserRouter, Routes, Route, } from 'react-router-dom'
import Signup from './components/Signup'
import Menu from './components/Menu'
import { useAuth } from './utils/IsLogged'
import SurveyRoom from './components/SurveyRoom'
import SurveyResultsPage from './components/SurveyRoomResults'
import VerifyEmailPage from './components/VerifyEmail'
import WaitingForVerificationPage from './components/WaitingForVerification'

function App() {
  const { login } = useAuth();
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
        <Route path='/signup/' element={<Signup></Signup>}></Route>
        <Route path='/menu/*' element={<Menu></Menu>}></Route>
        <Route path="/survey-room/:surveyId/:roomId" element={<SurveyRoom />} />
        <Route path="/survey-results/:userId/:surveyId/:roomId" element={<SurveyResultsPage/>} />
        <Route path="/verify-email" element={<VerifyEmailPage/>} />
        <Route path="/waiting/:email" element={<WaitingForVerificationPage />} />
        
      </Routes>
      </BrowserRouter>
  )
}

export default App
