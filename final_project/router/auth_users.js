// router/auth_users.js
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Define isValid function (as discussed previously)
const isValid = (username)=>{
    if (username && typeof username === 'string' && username.length >= 3 && !username.includes(" ")) {
        return true;
    }
    return false;
};

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    return validusers.length > 0;
};

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and Password are required" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: username }, 'your_jwt_secret', { expiresIn: '1h' });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in", accessToken: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.session.authorization.username;

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required in the query parameter 'review'." });
    }
    if (books[isbn]) {
        books[isbn].reviews[username] = reviewText;
        return res.status(200).json({
            message: `Review for book with ISBN ${isbn} by user ${username} has been added/updated.`,
            current_reviews_for_book: books[isbn].reviews
        });
    } else {
        return res.status(404).json({ message: "Book with ISBN " + isbn + " not found. Cannot add/modify review." });
    }
});

// Delete a book review - Endpoint: DELETE /customer/auth/review/:isbn
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    // Get the username of the currently logged-in user from the session
    const currentUsername = req.session.authorization.username;

    // Check if the book with the given ISBN exists
    if (books[isbn]) {
        // Check if the book has a reviews object and if the current user has a review for this book
        if (books[isbn].reviews && books[isbn].reviews.hasOwnProperty(currentUsername)) {
            // Delete the review for the current user
            delete books[isbn].reviews[currentUsername];
            
            return res.status(200).json({
                message: `Review for book with ISBN ${isbn} by user ${currentUsername} deleted successfully.`,
                current_reviews_for_book: books[isbn].reviews // Send back the updated reviews object for this book
            });
        } else {
            // If the user doesn't have a review for this book (or the book has no reviews)
            return res.status(404).json({
                message: `No review found for user ${currentUsername} on book with ISBN ${isbn} to delete.`
            });
        }
    } else {
        // If no book is found for that ISBN
        return res.status(404).json({message: "Book with ISBN " + isbn + " not found. Cannot delete review."});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;