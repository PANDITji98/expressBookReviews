const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    console.log(req.session.authorization, "SESSION AUTH")
       if(req.session.authorization) {
           let token = req.session.authorization['accessToken']; 
           jwt.verify(token, "JWTAccessKey",(err,user)=>{
               if(user){
                   req.user = user;
                   next();
               }
               else{
                   return res.status(403).json({message: "User is not authenticated", error:err})
               }
            });
        } else {
            return res.status(403).json({message: "User not logged in"})
        }
    });
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log(`Server is running on port:${PORT}`));
