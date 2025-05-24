// booksdb.js
let books = {
    "1": {
        "author": "Chinua Achebe",
        "title": "Things Fall Apart",
        "reviews": {
            "user_alpha": "A timeless classic!"
            // "user_beta": "Profound storytelling." // <-- This line is now removed/commented out
        }
    },
    "2": {
        "author": "Hans Christian Andersen",
        "title": "Fairy tales",
        "reviews": {
            "user_gamma": "Magical and enchanting for all ages."
        }
    },
    "3": {
        "author": "Dante Alighieri",
        "title": "The Divine Comedy",
        "reviews": {}
    },
    "4": {
        "author": "Unknown",
        "title": "The Epic Of Gilgamesh",
        "reviews": {}
    },
    "5": {
        "author": "Unknown",
        "title": "The Book Of Job",
        "reviews": {}
    },
    "6": {
        "author": "Unknown",
        "title": "One Thousand and One Nights",
        "reviews": {}
    },
    "7": {
        "author": "Unknown",
        "title": "Njál's Saga",
        "reviews": {}
    },
    "8": {
        "author": "Jane Austen",
        "title": "Pride and Prejudice",
        "reviews": {
            "user_alpha": "Witty and charming."
            // If user_beta had a review here, it would also be removed if that was the intent
        }
    },
    "9": {
        "author": "Honoré de Balzac",
        "title": "Le Père Goriot",
        "reviews": {}
    },
    "10": {
        "author": "Samuel Beckett",
        "title": "Molloy, Malone Dies, The Unnamable, the trilogy",
        "reviews": {}
    }
};

module.exports = books;