const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
// const axios = require('axios'); // If using real axios
const public_users = express.Router();

// --- Mock Asynchronous Functions ---
async function fetchBooksData() { /* ... from previous ... */
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) {
                resolve(books);
            } else {
                reject("Book data not found in simulation");
            }
        }, 100);
    });
}

async function fetchBookByISBNData(isbn) { /* ... from previous ... */
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error("Book with ISBN " + isbn + " not found in simulation"));
            }
        }, 100);
    });
}

async function fetchBooksByAuthorData(authorName) { /* ... from previous ... */
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookISBNs = Object.keys(books);
            let booksByAuthor = [];
            bookISBNs.forEach(isbn => {
                if (books[isbn] && books[isbn].author && books[isbn].author.toLowerCase() === authorName.toLowerCase()) {
                    booksByAuthor.push({ isbn: isbn, ...books[isbn] });
                }
            });
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject(new Error("No books found by author: " + authorName + " in simulation"));
            }
        }, 100);
    });
}

// New mock asynchronous function to fetch books by title (can be used with async/await)
async function fetchBooksByTitleData(titleQuery) {
    // If using a real API with axios:
    // try {
    //     const response = await axios.get(`http://some-external-api.com/books?title_contains=${encodeURIComponent(titleQuery)}`);
    //     return response.data; // Assuming API returns an array of books
    // } catch (error) {
    //     console.error(`Error fetching books with title "${titleQuery}" from external API:`, error);
    //     throw error; 
    // }

    // For our local simulation:
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookISBNs = Object.keys(books);
            let booksByTitle = [];
            bookISBNs.forEach(isbn => {
                if (books[isbn] && books[isbn].title && books[isbn].title.toLowerCase().includes(titleQuery.toLowerCase())) {
                    booksByTitle.push({ isbn: isbn, ...books[isbn] });
                }
            });

            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject(new Error("No books found with title containing: " + titleQuery + " in simulation"));
            }
        }, 100);
    });
}

// --- Routes ---
public_users.post("/register", (req,res) => { /* ... from previous ... */
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }
  const doesExist = users.find(user => user.username === username);
  if (doesExist) {
    return res.status(409).json({message: "Username already exists."});
  }
  users.push({"username":username, "password":password});
  return res.status(201).json({message: "User successfully registered. Now you can login."});
});

public_users.get('/', async function (req, res) { /* ... using fetchBooksData() ... */
    try {
        const booksData = await fetchBooksData();
        res.status(200).send(JSON.stringify(booksData, null, 4));
    } catch (error) {
        console.error("Error fetching books with async/await:", error);
        res.status(500).json({ message: "Failed to retrieve book list", error: error.message });
    }
});

public_users.get('/isbn/:isbn', async function (req, res) { /* ... using fetchBookByISBNData() ... */
    const isbn = req.params.isbn;
    try {
        const bookData = await fetchBookByISBNData(isbn);
        res.status(200).json(bookData);
    } catch (error) {
        console.error(`Error fetching book ${isbn} with async/await:`, error);
        if (error.message && error.message.includes("not found")) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to retrieve book details", error: error.message });
        }
    }
});
  
public_users.get('/author/:author', async function (req, res) { /* ... using fetchBooksByAuthorData() ... */
    const authorName = req.params.author;
    try {
        const authorBooksData = await fetchBooksByAuthorData(authorName);
        res.status(200).json({ booksbyauthor: authorBooksData });
    } catch (error) {
        console.error(`Error fetching books by author ${authorName} with async/await:`, error);
        if (error.message && error.message.includes("No books found")) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to retrieve books by author", error: error.message });
        }
    }
});

// Get all books based on title - USING ASYNC/AWAIT
public_users.get('/title/:title', async function (req, res) { // Note 'async'
    const requestedTitle = req.params.title;
    try {
        const titleBooksData = await fetchBooksByTitleData(requestedTitle); // 'await' the promise
        res.status(200).json({ booksbytitle: titleBooksData });
    } catch (error) {
        console.error(`Error fetching books with title "${requestedTitle}" using async/await:`, error);
        if (error.message && error.message.includes("No books found")) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to retrieve books by title", error: error.message });
        }
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) { /* ... remains synchronous for now ... */
    const isbn_num = req.params.isbn;
    if (books[isbn_num] && books[isbn_num].reviews) {
        if(Object.keys(books[isbn_num].reviews).length > 0) {
            return res.status(200).json(books[isbn_num].reviews);
        } else {
            return res.status(200).json({message: "No reviews for this book yet."});
        }
    } else if (books[isbn_num]) {
        return res.status(200).json({message: "No reviews property for this book."});
    }
    else {
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;