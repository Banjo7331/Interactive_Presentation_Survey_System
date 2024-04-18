import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/IsLogged';

interface CreateQuestionDto {
  title: string;
  type: string;
  possibleChoices: string[];
  [key: string]: string | string[];
}

interface CreateSurveyDto {
  title: string;
  createQuestionDtos: CreateQuestionDto[];
}

export default function CreateSurvey() {

  const { isAuthenticated, token} = useAuth();
  
  const [formData, setFormData] = useState<CreateSurveyDto>({
    title: '',
    createQuestionDtos: [],
  });

  const navigate = useNavigate();
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      createQuestionDtos: [
        ...formData.createQuestionDtos,
        { title: '', type: '', possibleChoices: [] },
      ],
    });
  };

  const handleChangeQuestion = (e: ChangeEvent<HTMLInputElement>, index: number, field: string) => {
    const updatedQuestions = [...formData.createQuestionDtos];
    updatedQuestions[index][field] = e.target.value;
    setFormData({ ...formData, createQuestionDtos: updatedQuestions });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      //const token = localStorage.getItem('token');
      if (!isAuthenticated) {
        throw new Error('Token not found in localStorage');
      }
      //const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1]; // Pobierz token, pomijając prefiks "token="
      const headers = { Authorization: `Bearer ${token}` };
      console.log('Request headers:', headers);
      const response = await axios.post(
        'http://localhost:3000/surveys/create',
        formData,
        { headers }
      );
      
      console.log('Survey created successfully:', response.data);

      navigate('/menu');
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };
  const handleAddChoice = (index: number) => {
    const updatedQuestions = [...formData.createQuestionDtos];
    updatedQuestions[index].possibleChoices.push('');
    setFormData({ ...formData, createQuestionDtos: updatedQuestions });
  };
  
  const handleChangeChoice = (e: ChangeEvent<HTMLInputElement>, questionIndex: number, choiceIndex: number) => {
    const updatedQuestions = [...formData.createQuestionDtos];
    updatedQuestions[questionIndex].possibleChoices[choiceIndex] = e.target.value;
    setFormData({ ...formData, createQuestionDtos: updatedQuestions });
  };
  return (
    <div>
      <h1>Witaj w kreatorze ankiety</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Tytuł ankiety</label>
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
        {formData.createQuestionDtos.map((question, index) => (
          <div key={index}>
            <h3>Pytanie {index + 1}</h3>
            <div className="mb-3">
              <label htmlFor={`title-${index}`} className="form-label">Tytuł pytania</label>
              <input
                type="text"
                className="form-control"
                id={`title-${index}`}
                name="title"
                value={question.title}
                onChange={(e) => handleChangeQuestion(e, index, 'title')}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor={`type-${index}`} className="form-label">Typ pytania</label>
              <input
                type="text"
                className="form-control"
                id={`type-${index}`}
                name="type"
                value={question.type}
                onChange={(e) => handleChangeQuestion(e, index, 'type')}
                required
              />    
            </div>
            {/* Dodaj pole lub przycisk do dodawania możliwych odpowiedzi */}
            
            {/* Dodaj pola możliwych odpowiedzi */}
            {question.possibleChoices.map((choice, choiceIndex) => (
              <div key={choiceIndex} className="mb-3">
                <label htmlFor={`choice-${index}-${choiceIndex}`} className="form-label">Possible Choice</label>
                <input
                  type="text"
                  className="form-control"
                  id={`choice-${index}-${choiceIndex}`}
                  name={`choice-${index}-${choiceIndex}`}
                  value={choice}
                  onChange={(e) => handleChangeChoice(e, index, choiceIndex)}
                  required
                />
              </div>
            ))}
            <button type="button" className="btn btn-primary mb-3" onClick={() => handleAddChoice(index)}>Dodaj możliwość odpowiedzi</button>
          </div>
        ))}
        <button type="button" className="btn btn-primary" onClick={handleAddQuestion}>Dodaj pytanie</button>
        <button type="submit" className="btn btn-primary">Zapisz ankietę</button>
      </form>
    </div>
  );
}


