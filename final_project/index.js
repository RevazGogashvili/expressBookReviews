// index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated; // Correct path
const genl_routes = require('./router/general.js').general;     // Correct path

const app = express();

app.use(express.json()); // For parsing application/json

// Session middleware - MUST come before routes that use session
app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization && req.session.authorization.accessToken) {
        let token = req.session.authorization.accessToken;
        jwt.verify(token, "your_jwt_secret", (err,decoded)=>{ // MUST MATCH 'your_jwt_secret' in auth_users.js login
            if(!err){
                req.user = decoded; // decoded typically contains { data: username }
                next();
            }
            else{
                return res.status(403).json({message: "User not authenticated: Invalid token"})
            }
         });
     } else {
         return res.status(403).json({message: "User not logged in or token missing"})
     }
});
 
const PORT = 5000; // Or your desired port

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));