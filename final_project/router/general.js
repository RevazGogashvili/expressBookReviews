const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
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
  const isbn = req.params.isbn; // Retrieve the ISBN from request parameters
  const book = books[isbn];     // Access the book from the 'books' object using the ISBN as the key

  if (book) {
    // If the book with the given ISBN exists, send its details
    return res.status(200).json(book);
  } else {
    // If no book is found for that ISBN, send a 404 Not Found response
    return res.status(404).json({message: "Book with ISBN " + isbn + " not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;