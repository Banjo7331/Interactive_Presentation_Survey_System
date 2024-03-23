import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Signup() {
    const [values, setValues] = useState({
        username: '',
        password: ''
      })
      const navigate = useNavigate()
      const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
      };
    
      const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        axios.post("http://localhost:3000/auth/register", values)
        .then(res =>{ 
            navigate('/')
        })
        .catch(err => console.log(err));
      };
    return (
        <div className='d-flex justify-content-center align-items-center bg-primary vh-100'>
            <div className='bg-white p-3 rounded w-25'>
                <h2>Sign-Up</h2>
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
                    <button className='btn btn-success w-100 rounded-0'>Sign up</button>
                    <p>You are agree to terms and policies</p>
                    <Link to="/"className='btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>Login</Link>
                </form>
            </div>
        </div>
  )
}
