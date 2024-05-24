import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function WaitingForVerificationPage() {
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { email } = useParams();
  useEffect(() => {

    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:3000/auth/is-verified?email=${email}`);

        if (response.data.isVerified) {
          setIsVerified(true);
        }
      } catch (error) {
        console.error(error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []);

  useEffect(() => {
    if (isVerified) {
      navigate('/login');
    }
  }, [isVerified, navigate]);

  return (
    <div className="container text-center">
      <div className="alert alert-primary mt-5" role="alert">
        <h2 className="alert-heading">Waiting for e-mail verification</h2>
        <p>Please check your email for a verification link.</p>
      </div>
    </div>
  );
}

export default WaitingForVerificationPage;