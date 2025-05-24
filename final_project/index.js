const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware: Make sure this is set up *before* the auth middleware that uses the session
app.use("/customer", session({secret:"fingerprint_customer", resave: true, saveUninitialized: true}))

// Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req,res,next){
    // Check if the user is logged in and has an access token in their session
    if (req.session.authorization && req.session.authorization.accessToken) {
        let token = req.session.authorization.accessToken; // Retrieve the token from session

        // Verify the token
        jwt.verify(token, "your_jwt_secret", (err, decoded) => { // IMPORTANT: Use the same secret key used for signing
            if (err) {
                // If token verification fails (e.g., expired, invalid)
                return res.status(403).json({message: "User not authenticated: Invalid token"});
            } else {
                // If token is valid, store the decoded user information in the request object
                // This makes it available to subsequent route handlers
                req.user = decoded; // 'decoded' contains the payload of the JWT
                next(); // Proceed to the next middleware or route handler
            }
        });
    } else {
        // If no access token is found in the session
        return res.status(403).json({message: "User not logged in or token missing"});
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes); // These are the routes that will be protected by the auth middleware above
app.use("/", genl_routes);

app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));