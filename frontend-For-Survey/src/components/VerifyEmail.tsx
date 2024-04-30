import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function VerifyEmailPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const hasRun = useRef(false);

    useEffect(() => {
    if (!hasRun.current) {
        const token = new URLSearchParams(window.location.search).get('token');
        
        console.log('Token:', token);
        
        const verifyEmail = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/auth/verify?token=${token}`);
            setSuccess(true);
            console.log(response);
        } catch (error) {
            setSuccess(false);
            console.error(error);
        } finally {
            setLoading(false);
        }
        };

        verifyEmail();
        hasRun.current = true;
    }
    }, []);

    if (loading) {
        return (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <h2>Verifying your email...</h2>
          </div>
        );
    }
      
    if (success) {
        return (
          <div>
            <p>Email verification successful!</p>
            <div className="d-flex justify-content-center">
              <button className="btn btn-primary" onClick={() => window.location.href='http://localhost:5173/'}>Continue</button>
            </div>
          </div>
        );
    } else {
        return <p>Email verification failed.</p>;
    }
}

export default VerifyEmailPage;