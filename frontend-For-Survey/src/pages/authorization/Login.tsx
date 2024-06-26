import axios from "axios";
import React,{ useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [values, setValues] = useState({
    username: '',
    password: ''
  })
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate()
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios.post("http://localhost:3000/auth/login", values)
        .then(res =>{ 
          if (res.data) {
              const token = res.data;
              const expiryDate = new Date();
              expiryDate.setTime(expiryDate.getTime() + (1 * 60 * 20 * 1000)); 
              document.cookie = `token=${token}; path=/; expires=${expiryDate.toUTCString()}`;

              console.log('Token set as cookie:', token);
              console.log(res.data);
              navigate('/');
          } else {
              console.log('Token not found in response data.');
          }
         })
        .catch(err => {
          console.log(err);
          if (err.response && err.response.status === 401) {
            setLoginError('Wrong Password or UserName');
          } else {
            setLoginError('Error during login. Please try again.');
          }
        });
  };

  return (
    <div className='d-flex justify-content-center align-items-center bg-secondary vh-100'>
        <div className='bg-white p-3 rounded w-25'>
            <h2>Sign-In</h2>
            <form action='' onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label><strong>Username</strong></label>
                    <input name="username" placeholder='Enter Username' 
                    onChange={handleInput} className="form-control rounded-0"></input>
                </div>
                <div className='mb-3'>
                    <label><strong>Password</strong></label>
                    <input name="password" placeholder='Enter Password' 
                    onChange={handleInput} className="form-control rounded-0"></input>
                </div>
                <button type='submit'className='btn btn-success w-100 rounded-0'>Log in</button>
                {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
                <p>You are agree to terms and policies</p>
                <Link to="/signup"className='btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>Create Account</Link>
            </form>
        </div>
    </div>
  )
}

