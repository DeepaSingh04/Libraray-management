import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validate } from '../validation/validate';

const API_URL = 'http://localhost:5000/api';

const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Academic',
  'Children',
  'Biography'
];

function AddBook() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    ISBN: '',
    publishedDate: '',
    genre: '',
    copiesAvailable: 1
  });

  const addBookMutation = useMutation({
    mutationFn: async (bookData) => {
      const response = await axios.post(`${API_URL}/books`, bookData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      navigate('/');
    },
    onError: (error) => {
      setErrors([{ field: 'submit', message: error.message }]);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationResult = validate(formData);
    
    if (!validationResult.valid) {
      setErrors(validationResult.errors);
      return;
    }

    addBookMutation.mutate(validationResult.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors([]);
  };

  const getFieldError = (fieldName) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Book</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter the details of the new book.
            </p>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    getFieldError('title') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('title') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('title')}</p>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  id="author"
                  value={formData.author}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    getFieldError('author') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('author') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('author')}</p>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="ISBN" className="block text-sm font-medium text-gray-700">
                  ISBN
                </label>
                <input
                  type="text"
                  name="ISBN"
                  id="ISBN"
                  value={formData.ISBN}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    getFieldError('ISBN') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('ISBN') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('ISBN')}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700">
                  Published Date
                </label>
                <input
                  type="date"
                  name="publishedDate"
                  id="publishedDate"
                  value={formData.publishedDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    getFieldError('publishedDate') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('publishedDate') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('publishedDate')}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                  Genre
                </label>
                <select
                  name="genre"
                  id="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    getFieldError('genre') ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                {getFieldError('genre') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('genre')}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="copiesAvailable" className="block text-sm font-medium text-gray-700">
                  Copies Available
                </label>
                <input
                  type="number"
                  name="copiesAvailable"
                  id="copiesAvailable"
                  min="1"
                  value={formData.copiesAvailable}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    getFieldError('copiesAvailable') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('copiesAvailable') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('copiesAvailable')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={addBookMutation.isLoading}
          >
            {addBookMutation.isLoading ? 'Adding...' : 'Add Book'}
          </button>
        </div>

        {getFieldError('submit') && (
          <div className="mt-4 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error adding book</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{getFieldError('submit')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AddBook; 