import axios from 'axios';
import React, { ChangeEvent, FormEvent, useState } from 'react'

export default function CreateSurvey() {
    const [formData, setFormData] = useState({
      title: '',
      // Add other fields as needed
    });
  
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token not found in localStorage');
          }
    
          const response = await axios.post(
            'http://localhost:3000/surveys/create',
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Survey created successfully:', response.data);
        } catch (error) {
          console.error('Error creating survey:');
        }
    };
  
    return (
      <div>
        <h1>Welcome Create Survey</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          {/* Add other form fields for survey data */}
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      </div>
    );
}
