const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const { validate } = require('../../frontend/src/validation/validate');
const { generateSampleBooks } = require('./utils/sampleData');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const books = new Map();
const users = new Map();

// Initialize with sample books
generateSampleBooks(50).forEach(book => {
  // Ensure each book has copiesAvailable property
  books.set(book.id, { ...book, copiesAvailable: book.copiesAvailable || 5 });
});

// Validation middleware
const validateBookData = (req, res, next) => {
  const result = validate(req.body);
  if (!result.valid) {
    return res.status(400).json({ errors: result.errors });
  }
  req.validatedData = result.data;
  next();
};

// Book routes
app.get('/api/books', (req, res) => {
  res.json(Array.from(books.values()));
});

app.post('/api/books', validateBookData, (req, res) => {
  const id = require('uuid').v4();
  const book = { 
    id, 
    ...req.validatedData,
    copiesAvailable: req.validatedData.copiesAvailable || 5 // Default to 5 copies
  };
  books.set(id, book);
  res.status(201).json(book);
});

app.get('/api/books/:id', (req, res) => {
  const book = books.get(req.params.id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json(book);
});

app.put('/api/books/:id', validateBookData, (req, res) => {
  if (!books.has(req.params.id)) {
    return res.status(404).json({ message: 'Book not found' });
  }
  const book = { 
    id: req.params.id, 
    ...req.validatedData,
    copiesAvailable: req.validatedData.copiesAvailable || books.get(req.params.id).copiesAvailable
  };
  books.set(req.params.id, book);
  res.json(book);
});

app.delete('/api/books/:id', (req, res) => {
  if (!books.has(req.params.id)) {
    return res.status(404).json({ message: 'Book not found' });
  }
  books.delete(req.params.id);
  res.status(204).send();
});

// User routes
app.get('/api/users', (req, res) => {
  const userList = Array.from(users.values()).map(user => ({
    ...user,
    totalBorrowed: user.borrowedBooks.length,
    currentlyBorrowed: user.borrowedBooks.filter(book => !book.returnDate).length
  }));
  res.json(userList);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;

  // Check if user with this email already exists
  const existingUser = Array.from(users.values()).find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const id = require('uuid').v4();
  const user = {
    id,
    name,
    email,
    borrowedBooks: [],
    createdAt: new Date().toISOString()
  };
  users.set(id, user);
  res.status(201).json(user);
});

app.post('/api/users/:id/borrow', (req, res) => {
  const { bookId } = req.body;
  const user = users.get(req.params.id);
  const book = books.get(bookId);

  if (!user || !book) {
    return res.status(404).json({ message: 'User or book not found' });
  }

  if (book.copiesAvailable <= 0) {
    return res.status(400).json({ message: 'No copies available' });
  }

  // Check if user already has this book
  const alreadyBorrowed = user.borrowedBooks.some(
    b => b.bookId === bookId && !b.returnDate
  );

  if (alreadyBorrowed) {
    return res.status(400).json({ message: 'User already has this book' });
  }

  // Check if user has too many books borrowed (limit to 5 at a time)
  const currentlyBorrowed = user.borrowedBooks.filter(b => !b.returnDate).length;
  if (currentlyBorrowed >= 5) {
    return res.status(400).json({ message: 'User has reached the maximum number of books they can borrow (5)' });
  }

  book.copiesAvailable--;
  user.borrowedBooks.push({
    bookId,
    title: book.title,
    author: book.author,
    borrowDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
  });

  books.set(bookId, book);
  users.set(req.params.id, user);

  res.json(user);
});

app.post('/api/users/:id/return', (req, res) => {
  const { bookId } = req.body;
  const user = users.get(req.params.id);
  const book = books.get(bookId);

  if (!user || !book) {
    return res.status(404).json({ message: 'User or book not found' });
  }

  const borrowedBookIndex = user.borrowedBooks.findIndex(
    b => b.bookId === bookId && !b.returnDate
  );

  if (borrowedBookIndex === -1) {
    return res.status(400).json({ message: 'Book not borrowed by user' });
  }

  book.copiesAvailable++;
  user.borrowedBooks[borrowedBookIndex].returnDate = new Date().toISOString();

  books.set(bookId, book);
  users.set(req.params.id, user);

  res.json(user);
});

// Get user borrowing history
app.get('/api/users/:id/history', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const history = {
    user: {
      name: user.name,
      email: user.email,
      totalBorrowed: user.borrowedBooks.length,
      currentlyBorrowed: user.borrowedBooks.filter(book => !book.returnDate).length
    },
    currentBooks: user.borrowedBooks.filter(book => !book.returnDate),
    returnedBooks: user.borrowedBooks.filter(book => book.returnDate)
  };

  res.json(history);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});