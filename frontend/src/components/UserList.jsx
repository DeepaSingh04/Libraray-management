import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/config';

function UserList() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/api/users');
      return response.data;
    }
  });

  const returnMutation = useMutation({
    mutationFn: async ({ userId, bookId }) => {
      const response = await api.post(`/api/users/${userId}/return`, { bookId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['books']);
    }
  });

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
            <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Library Members</h2>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currently Borrowed Books
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrowing History
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const currentlyBorrowed = user.borrowedBooks.filter(book => !book.returnDate);
                const borrowingHistory = user.borrowedBooks.filter(book => book.returnDate);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {currentlyBorrowed.length === 0 ? (
                          <span className="text-sm text-gray-500">No books currently borrowed</span>
                        ) : (
                          currentlyBorrowed.map((book) => (
                            <div key={`${book.bookId}-${book.borrowDate}`} 
                                 className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {book.title || `Book ID: ${book.bookId}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Borrowed on {new Date(book.borrowDate).toLocaleDateString()}
                                </div>
                              </div>
                              <button
                                onClick={() => returnMutation.mutate({ userId: user.id, bookId: book.bookId })}
                                className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                Return Book
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {borrowingHistory.length === 0 ? (
                          <span className="text-sm text-gray-500">No borrowing history</span>
                        ) : (
                          borrowingHistory.map((book) => (
                            <div key={`${book.bookId}-${book.borrowDate}`} 
                                 className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                              <div className="font-medium">{book.title || `Book ID: ${book.bookId}`}</div>
                              <div className="text-xs text-gray-500">
                                Borrowed: {new Date(book.borrowDate).toLocaleDateString()}
                                <br />
                                Returned: {new Date(book.returnDate).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserList; 