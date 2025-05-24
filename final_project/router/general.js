const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid; // We'll use this if it's meant for username validation logic
let users = require("./auth_users.js").users;   // This should be an array or object to store users
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  // Option 1: If isValid is a function to check if username is valid (e.g., format, length)
  // You might have a separate function for this. If not, you can remove this block.
  // Assuming isValid checks general validity, not existence.
  /*
  if (isValid && !isValid(username)) { // Assuming isValid is a function you might have defined elsewhere
      return res.status(400).json({message: "Invalid username format or characters."});
  }
  */

  // Check if the username already exists
  // This assumes 'users' is an array of user objects like: [{username: "user1", password: "pw1"}, ...]
  // Or if 'users' is an object where keys are usernames: {"user1": {password: "pw1"}, ...}
  
  // Let's assume 'users' is an array of objects like: users = []
  // And from auth_users.js, it's exported as: module.exports.users = users;
  const doesExist = users.find(user => user.username === username);

  if (doesExist) {
    return res.status(409).json({message: "Username already exists. Please choose a different one."}); // 409 Conflict
  }

  // If username doesn't exist and all checks pass, add the new user
  // We should store the password securely in a real application (e.g., hashed)
  // For this lab, we'll store it as is.
  users.push({"username":username, "password":password});
  
  return res.status(201).json({message: "User successfully registered. Now you can login."}); // 201 Created
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  if (books) {
    res.status(200).send(JSON.stringify(books, null, 4));
  } else {
    res.status(404).json({message: "Book list not found"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: "Book with ISBN " + isbn + " not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const authorName = req.params.author;
  const bookISBNs = Object.keys(books);
  let booksByAuthor = [];

  bookISBNs.forEach(isbn => {
    if (books[isbn].author.toLowerCase() === authorName.toLowerCase()) {
      booksByAuthor.push({
        isbn: isbn,
        author: books[isbn].author,
        title: books[isbn].title,
        reviews: books[isbn].reviews
      });
    }
  });

  if (booksByAuthor.length > 0) {
    return res.status(200).json({booksbyauthor: booksByAuthor});
  } else {
    return res.status(404).json({message: "No books found by author: " + authorName});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const requestedTitle = req.params.title;
  const bookISBNs = Object.keys(books);
  let booksByTitle = [];

  bookISBNs.forEach(isbn => {
    if (books[isbn].title.toLowerCase().includes(requestedTitle.toLowerCase())) {
      booksByTitle.push({
        isbn: isbn,
        author: books[isbn].author,
        title: books[isbn].title,
        reviews: books[isbn].reviews
      });
    }
  });

  if (booksByTitle.length > 0) {
    return res.status(200).json({booksbytitle: booksByTitle});
  } else {
    return res.status(404).json({message: "No books found with title containing: " + requestedTitle});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    if (book.reviews && Object.keys(book.reviews).length > 0) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(200).json({message: "Book with ISBN " + isbn + " found, but it has no reviews yet."});
    }
  } else {
    return res.status(404).json({message: "Book with ISBN " + isbn + " not found. Cannot retrieve reviews."});
  }
});

module.exports.general = public_users;