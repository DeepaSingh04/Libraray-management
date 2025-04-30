// ISBN regex patterns
const ISBN10_REGEX = /^(?:\d[\ |-]?){9}[\d|X]$/;
const ISBN13_REGEX = /^(?:\d[\ |-]?){13}$/;

// Utility functions
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const isFutureDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

const isValidISBN = (isbn) => {
  const cleanISBN = isbn.replace(/[\ |-]/g, '');
  return ISBN10_REGEX.test(cleanISBN) || ISBN13_REGEX.test(cleanISBN);
};

// Transform functions
const transformString = (value) => {
  return typeof value === 'string' ? value.trim() : value;
};

const transformDate = (value) => {
  if (!value) return value;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date) ? date.toISOString() : value;
};

const transformNumber = (value) => {
  if (typeof value === 'number') return value;
  const num = Number(value);
  return isNaN(num) ? value : num;
};

// Main validation function
export const validate = (data, schema = {}) => {
  const errors = [];
  const transformedData = { ...data };

  // Required fields validation
  const requiredFields = ['title', 'author', 'ISBN', 'publishedDate'];
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push({
        field,
        message: `${field} is required`
      });
    }
  }

  // Transform and validate fields
  if (data.title) {
    transformedData.title = transformString(data.title);
  }

  if (data.author) {
    transformedData.author = transformString(data.author);
  }

  if (data.ISBN) {
    transformedData.ISBN = transformString(data.ISBN);
    if (!isValidISBN(transformedData.ISBN)) {
      errors.push({
        field: 'ISBN',
        message: 'Invalid ISBN format (must be ISBN-10 or ISBN-13)'
      });
    }
  }

  if (data.publishedDate) {
    transformedData.publishedDate = transformDate(data.publishedDate);
    if (!isValidDate(transformedData.publishedDate)) {
      errors.push({
        field: 'publishedDate',
        message: 'Invalid date format'
      });
    } else if (isFutureDate(transformedData.publishedDate)) {
      errors.push({
        field: 'publishedDate',
        message: 'Publication date cannot be in the future'
      });
    }
  }

  if (data.copiesAvailable !== undefined) {
    transformedData.copiesAvailable = transformNumber(data.copiesAvailable);
    if (typeof transformedData.copiesAvailable !== 'number') {
      errors.push({
        field: 'copiesAvailable',
        message: 'Copies available must be a number'
      });
    }
  }

  // Logical dependency validation
  if (data.genre === 'Academic' && (transformedData.copiesAvailable < 5)) {
    errors.push({
      field: 'copiesAvailable',
      message: 'Academic books must have at least 5 copies available'
    });
  }

  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? transformedData : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
};

// Export individual validation functions for reuse
export const validators = {
  isValidDate,
  isValidISBN,
  isFutureDate
};

// Export transform functions for reuse
export const transformers = {
  transformString,
  transformDate,
  transformNumber
}; 