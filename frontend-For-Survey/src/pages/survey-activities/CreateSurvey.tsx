import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/authorization/IsLogged';
import { CreateSurveyDto } from '../../entities/survey-activities/survey.DTO';


export default function CreateSurvey() {
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(0);

  const { isAuthenticated, token} = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<CreateSurveyDto>({
    title: '',
    createQuestionDtos: [],
  });

  const navigate = useNavigate();
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddQuestion = () => {
    if (!formData || !formData.createQuestionDtos || formData.createQuestionDtos.length === 0) {
      setFormData({
        ...formData,
        createQuestionDtos: [
          { title: '', type: '', possibleChoices: [] },
        ],
      });
      return;
    }
  
    const lastQuestion = formData.createQuestionDtos[formData.createQuestionDtos.length - 1];
  
    if (!lastQuestion.title || !lastQuestion.type) {
      return;
    }
  
    if (lastQuestion.type !== 'text-answer' && lastQuestion.possibleChoices.length === 0) {
      return;
    }
  
    setFormData({
      ...formData,
      createQuestionDtos: [
        ...formData.createQuestionDtos,
        { title: '', type: '', possibleChoices: [] },
      ],
    });
    setExpandedQuestionIndex(formData.createQuestionDtos.length);
  };

  const handleChangeQuestion = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number, field: string) => {
    const updatedQuestions = [...formData.createQuestionDtos];
    updatedQuestions[index][field] = e.target.value;
  
    if (field === 'type' && e.target.value === 'text-answer') {
      updatedQuestions[index].possibleChoices = [];
    }
  
    setFormData({ ...formData, createQuestionDtos: updatedQuestions });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!isAuthenticated) {
        navigate('/');
      }else{
        const headers = { Authorization: `Bearer ${token}` };
        console.log('Request headers:', headers);
        const response = await axios.post(
          'http://localhost:3000/surveys/create',
          formData,
          { headers }
        ).then(res =>{ 
            console.log('Survey created successfully:', res.data);
            console.log(formData)
            navigate('/');
        })
        .catch(err => {
            if (err.response) {
                setErrorMessage(err.response.data.message);
            }
        });
        console.log(response);
      }
    } catch (err) {
      console.error('Error creating survey:', err);
    }
  };

  const handleQuestionClick = (index: number) => {
    if (expandedQuestionIndex === index) {
      setExpandedQuestionIndex(null);
    } else {
      setExpandedQuestionIndex(index);
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

  const handleRemoveChoice = (questionIndex: number, choiceIndex: number) => {
    const updatedQuestions = [...formData.createQuestionDtos];
    updatedQuestions[questionIndex].possibleChoices.splice(choiceIndex, 1);
    setFormData({ ...formData, createQuestionDtos: updatedQuestions });
  };
  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...formData.createQuestionDtos];
    updatedQuestions.splice(index, 1);
    setFormData({ ...formData, createQuestionDtos: updatedQuestions });
  };
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Witaj w kreatorze ankiety</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tytuł ankiety</label>
          <input
            type="text"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        {formData.createQuestionDtos.map((question, index) => (
          <div key={index} className="space-y-4">
          <div className="flex items-center w-full" onClick={() => handleQuestionClick(index)}>
            <h3 className="text-lg font-medium" >Pytanie {index + 1}</h3>
            <button 
              type="button" 
              className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
              onClick={(e) => {e.stopPropagation(); handleRemoveQuestion(index);}}
            >
              Usuń pytanie
            </button>
          </div>
          {expandedQuestionIndex === index && (
            <>
            <div>
              <label htmlFor={`title-${index}`} className="block text-sm font-medium text-gray-700">Tytuł pytania</label>
              <input
                type="text"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                id={`title-${index}`}
                name="title"
                value={question.title}
                onChange={(e) => handleChangeQuestion(e, index, 'title')}
                required
              />
            </div>
            <div>
              <label htmlFor={`type-${index}`} className="block text-sm font-medium text-gray-700">Typ pytania</label>
              <select
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                id={`type-${index}`}
                name="type"
                value={question.type}
                onChange={(e) => handleChangeQuestion(e, index, 'type')}
                required
              >
                <option value="">--Wybierz typ pytania--</option>
                <option value="multiple-correct-answer">Wiele poprawnych odpowiedzi</option>
                <option value="single-correct-answer">Jedna poprawna odpowiedź</option>
                <option value="text-answer">Odpowiedź tekstowa</option>
              </select> 
            </div>
            {question.type !== 'text-answer' && (
              <div className="flex flex-wrap gap-2">
                {question.possibleChoices.map((choice, choiceIndex) => (
                  <div key={choiceIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="py-2 px-3 border border-gray-300 rounded-md"
                      id={`choice-${index}-${choiceIndex}`}
                      name={`choice-${index}-${choiceIndex}`}
                      value={choice}
                      onChange={(e) => handleChangeChoice(e, index, choiceIndex)}
                      required
                    />
                    <button 
                      type="button" 
                      className="px-2 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                      onClick={() => handleRemoveChoice(index, choiceIndex)}
                    >
                      X
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                  onClick={() => handleAddChoice(index)}
                  disabled={question.possibleChoices.length >= 8}
                >
                  Dodaj możliwość odpowiedzi
                </button>
              </div>
            )}
          </>
            )}
          </div>
        ))}
        <button 
          type="button" 
          className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
          onClick={handleAddQuestion}
          disabled={formData.createQuestionDtos.length >= 20}
        >
          Dodaj pytanie
        </button>
        <button type="submit" className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Zapisz ankietę</button>
      </form>
    </div>
  );
}


