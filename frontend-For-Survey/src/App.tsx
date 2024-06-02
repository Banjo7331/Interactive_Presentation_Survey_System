import { useEffect,  } from 'react'

import Login from './pages/authorization/Login'
import { BrowserRouter, Routes, Route, } from 'react-router-dom'
import Signup from './pages/authorization/Signup'
import Menu from './pages/Menu'
import { useAuth } from './utils/authorization/IsLogged'
import SurveyRoom from './pages/live-survey/SurveyRoom'
import SurveyResultsPage from './pages/live-survey/SurveyRoomResults'
import VerifyEmailPage from './pages/verification/VerifyEmail'
import WaitingForVerificationPage from './pages/verification/WaitingForVerification'

function App() {
  const { login } = useAuth();
  useEffect(() => {
    const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      console.log('Token found in cookie:', token);
      login(token); 
    }
  }, [login]);
  
  
  return(
      <BrowserRouter>
      <Routes>
        <Route path='/login/' element={<Login></Login>}></Route>
        <Route path='/signup/' element={<Signup></Signup>}></Route>
        <Route path='/*' element={<Menu></Menu>}></Route>
        <Route path="/survey-room/:surveyId/:roomId" element={<SurveyRoom />} />
        <Route path="/survey-results/:userId/:surveyId/:roomId" element={<SurveyResultsPage/>} />
        <Route path="/verify-email" element={<VerifyEmailPage/>} />
        <Route path="/waiting/:email" element={<WaitingForVerificationPage />} />
        
      </Routes>
      </BrowserRouter>
  )
}

export default App
