import { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import CreateSurvey from './survey-activities/CreateSurvey';
import GetSurvey from './survey-activities/GetSurvey';
import { useAuth } from '../utils/authorization/IsLogged';
import ProfileButton from '../components/user/ProfilleButton';
import UserProfile from './user/UserProfile';
import axios from 'axios';
import image1 from '../assets/SurveyPreview2.png';
import image2 from '../assets/ResultOfSurvey.png';

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
      navigate('/login');
    }
  };
  const handleChooseSurveyClick = () => {
    if (isAuthenticated) {
      navigate('/getSurvey');
    } else {
      navigate('/login');
    }
  };

  return (
  <div style={{ 
    background: 'repeating-linear-gradient(30deg, #ffffff, #ffffff 400px, #fafafa 400px, #fafafa 800px)', 
    width: '100%', 
    height: '100vh' 
  }}>
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
        <Route path="createSurvey" element={<CreateSurvey />} />
        <Route path="getSurvey" element={<GetSurvey />} />
        <Route path="profile/:userNickName?" element={<UserProfile />} />
        <Route path="/" element={
          <div className="bg-gradient-to-r from-gray-200 to-gray-300 w-full h-full transform rotate-12">
            <div className="flex_column av_one_half" style={{padding: "10px 40px 0px 20px", display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
              <div style={{flex: "0 0 45%", alignSelf: "flex-start"}}>
                <div style={{width: "100%", height: "auto", backgroundColor: "#ddd", marginBottom: "20px"}}>
                  <img src={image1} alt="Description of the image" style={{width: "100%", height: "auto"}} />
                </div>
                <h2 style={{marginTop: "20px", color: "#1e3e6e", fontSize: "25px", textAlign: "left", fontWeight: 400}}>Real-Time Survey Monitoring</h2>
                <p>Experience the power of real-time insights. With our platform, you can watch as users fill out your surveys, giving you immediate access to their responses. This allows you to make quick decisions and adjustments based on live feedback.</p>
              </div>
              <div style={{flex: "0 0 45%", alignSelf: "flex-end"}}>
                <h2 style={{marginTop: "20px", color: "#1e3e6e", fontSize: "25px", textAlign: "left", fontWeight: 400}}>Create Your Own Surveys: Unlimited Possibilities</h2>
                <p>Unleash your creativity with our professional survey software. With our platform, you can create any survey you want, tailored to your specific needs. Choose the type of question, the title, and the possible answers to create a unique survey experience. Whether you're looking to conduct market research, get feedback, or just want to know more about your audience, our software gives you the tools to do it quickly, easily, and effectively.</p>
                <div style={{width: "100%", height: "auto", backgroundColor: "#ddd", marginBottom: "20px"}}>
                  <img src={image2} alt="Description of the image" style={{width: "100%", height: "auto"}} />
                </div>
              </div>
            </div>
          </div>
        } />
    </Routes>
  </div>
  );
}
