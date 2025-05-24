// router/auth_users.js
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Make sure this path is correct relative to auth_users.js
const regd_users = express.Router();

let users = []; // THIS IS THE SHARED ARRAY FOR USERS. It MUST be defined here at module level.

// Function to check if a username is valid (you might have your own logic)
const isValid = (username)=>{
    // Example: Basic check, can be more complex
    return username && username.length >= 3;
}

// Function to check if a user exists (used for login)
const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    return validusers.length > 0;
}

// Login for registered users
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Username and Password are required"});
    }

    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: username // Storing username in JWT. Can also store password if needed, but usually just identifier
        }, 'your_jwt_secret', { expiresIn: 60 * 60 }); // 'your_jwt_secret' MUST match in index.js

        req.session.authorization = { // Storing token in session
            accessToken, username
        }
        return res.status(200).json({message: "User successfully logged in", accessToken: accessToken});
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.body.review; // Assuming the review comes in a 'review' field in the body
    const username = req.session.authorization.username; // Get username from session (set during login)

    if (!reviewText) {
        return res.status(400).json({message: "Review text is required."});
    }

    if (books[isbn]) {
        // If the book exists, add or update the review for the logged-in user
        books[isbn].reviews[username] = reviewText; // Modifying the shared 'books' object
        return res.status(200).json({message: `Review for book with ISBN ${isbn} by user ${username} added/updated successfully.`, reviews: books[isbn].reviews});
    } else {
        return res.status(404).json({message: "Book with ISBN " + isbn + " not found."});
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Get username from session

    if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username]; // Modifying the shared 'books' object
        return res.status(200).json({message: `Review for book with ISBN ${isbn} by user ${username} deleted successfully.`, reviews: books[isbn].reviews });
    } else if (!books[isbn]) {
        return res.status(404).json({message: "Book with ISBN " + isbn + " not found."});
    } else {
        return res.status(404).json({message: `No review found for user ${username} on book with ISBN ${isbn}.`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users; // EXPORT THE SHARED USERS ARRAY