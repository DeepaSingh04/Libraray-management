import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/config';

function BorrowModal({ book, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Borrow Book: {book.title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
            >
              Confirm Borrow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookList() {
  const queryClient = useQueryClient();
  const [selectedBook, setSelectedBook] = useState(null);

  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const response = await api.get('/api/books');
      return response.data;
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId) => {
      await api.delete(`/api/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
    }
  });

  const borrowBookMutation = useMutation({
    mutationFn: async ({ bookId, userData }) => {
      // First, check if user exists or create new user
      let user;
      const users = await api.get('/api/users').then(res => res.data);
      const existingUser = users.find(u => u.email === userData.email);
      
      if (existingUser) {
        user = existingUser;
      } else {
        user = await api.post('/api/users', userData).then(res => res.data);
      }

      // Then borrow the book
      await api.post(`/api/users/${user.id}/borrow`, { bookId });
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      queryClient.invalidateQueries(['users']);
      setSelectedBook(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to borrow book');
    }
  });

  const handleBorrow = async (userData) => {
    try {
      await borrowBookMutation.mutate({ 
        bookId: selectedBook.id,
        userData
      });
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading books</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
              {error.code === 'ERR_NETWORK' && (
                <p className="mt-1">Please ensure the backend server is running at http://localhost:5000</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Library Collection</h2>
        <Link
          to="/add-book"
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new book to your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{book.title}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    book.copiesAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {book.copiesAvailable} copies
                  </span>
                </div>
                <p className="text-gray-600 mb-4 font-medium">{book.author}</p>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 flex justify-between">
                    <span className="font-medium">ISBN:</span>
                    <span>{book.ISBN}</span>
                  </p>
                  <p className="text-sm text-gray-500 flex justify-between">
                    <span className="font-medium">Published:</span>
                    <span>{new Date(book.publishedDate).toLocaleDateString()}</span>
                  </p>
                  <p className="text-sm text-gray-500 flex justify-between">
                    <span className="font-medium">Genre:</span>
                    <span>{book.genre}</span>
                  </p>
                </div>

                <div className="mt-6 flex justify-end space-x-4 border-t pt-4">
                  {book.copiesAvailable > 0 && (
                    <button
                      onClick={() => setSelectedBook(book)}
                      className="text-white bg-green-600 hover:bg-green-700 px-4 py-1 rounded-md text-sm font-medium flex items-center transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Borrow
                    </button>
                  )}
                  <Link
                    to={`/edit-book/${book.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this book?')) {
                        deleteBookMutation.mutate(book.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBook && (
        <BorrowModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onConfirm={handleBorrow}
        />
      )}
    </div>
  );
}

export default BookList; 