import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import UserList from './components/UserList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-md fixed w-full top-0 z-10">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-2xl font-bold text-primary-600">Library Management</h1>
                  </div>
                  <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                    <Link
                      to="/"
                      className="text-gray-900 inline-flex items-center px-3 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-primary-500 hover:text-primary-600 transition-colors duration-200"
                    >
                      Books
                    </Link>
                    <Link
                      to="/add-book"
                      className="text-gray-900 inline-flex items-center px-3 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-primary-500 hover:text-primary-600 transition-colors duration-200"
                    >
                      Add Book
                    </Link>
                    <Link
                      to="/users"
                      className="text-gray-900 inline-flex items-center px-3 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-primary-500 hover:text-primary-600 transition-colors duration-200"
                    >
                      Users
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-16">
            <div className="px-4 py-6 sm:px-0">
              <Routes>
                <Route path="/" element={<BookList />} />
                <Route path="/add-book" element={<AddBook />} />
                <Route path="/edit-book/:id" element={<EditBook />} />
                <Route path="/users" element={<UserList />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
