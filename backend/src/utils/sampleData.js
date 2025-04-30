const { v4: uuidv4 } = require('uuid');

const genres = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Academic',
  'Children',
  'Biography'
];

const sampleBooks = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { title: "1984", author: "George Orwell" },
  { title: "To Kill a Mockingbird", author: "Harper Lee" },
  { title: "Pride and Prejudice", author: "Jane Austen" },
  { title: "The Hobbit", author: "J.R.R. Tolkien" },
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling" },
  { title: "The Catcher in the Rye", author: "J.D. Salinger" },
  { title: "Lord of the Flies", author: "William Golding" },
  { title: "Animal Farm", author: "George Orwell" },
  { title: "Brave New World", author: "Aldous Huxley" }
];

function generateISBN13() {
  const prefix = '978';
  const remaining = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  const isbn = prefix + remaining;
  // Simple check digit calculation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return isbn + checkDigit;
}

function generateSampleBooks(count = 50) {
  const books = [];
  const baseDate = new Date(1900, 0, 1);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const sampleBook = sampleBooks[i % sampleBooks.length];
    const randomDays = Math.floor(Math.random() * (now - baseDate));
    const publishedDate = new Date(baseDate.getTime() + randomDays);
    
    books.push({
      id: uuidv4(),
      title: `${sampleBook.title} ${Math.floor(i / sampleBooks.length) + 1}`,
      author: sampleBook.author,
      ISBN: generateISBN13(),
      publishedDate: publishedDate.toISOString(),
      genre: genres[Math.floor(Math.random() * genres.length)],
      copiesAvailable: Math.floor(Math.random() * 10) + 1
    });
  }

  return books;
}

module.exports = {
  generateSampleBooks
};