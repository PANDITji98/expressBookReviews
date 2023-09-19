const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const minLength = 3;
  const maxLength = 20;
  const isUnique = !users.some((user) => user.username === username); 

  if (username.length < minLength || username.length > maxLength) {
    return false;
  }
  if (!isUnique) {
    return false;
  }
  return true; 
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res
        .status(400)
        .send("Please all the required details to continue");
    }
 
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign(
        {
          password: password,
        },
        "JWTAccessKey",
        { expiresIn: 60 * 20 }
      );
      req.session.authorization = {
        accessToken,username
      };
      return res.status(200).send("User has logged in!");
    } else {
      return res
        .status(400)
        .send(
          `Unable to log in with username: ${username}. Please check username and password.`
        );
    }
  } catch (error) {
    res.status(400).send("Some error occured");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const {review} = req.query;
  const username = req.session.authorization['username'];
  console.log(username, "THE USERNAME FROM SESSION")
  try {
    if(!isbn){
      return res.send(400).send("Please mention ISBN")
    } 
    if(!review){
      return res.status(400).send("No review was provided")
    }
    if (!books[isbn]) {
      return res.status(404).send(`Cannot find book with ISBN:${isbn}`);
    }
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    if (!books[isbn].reviews[username]) {
      books[isbn].reviews[username] = review;
    } else {
      books[isbn].reviews[username] = review;
    }
    console.log(books[isbn].reviews)
    return res.status(200).send("Review posted successfully");
  } catch (error) {
    res.status(500).send("Some error occured");
  }
});

//Delete review on the basis of username from session
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const username = req.session.authorization['username'];
  try {
    if(!isbn){
      return res.send(400).send("Please mention ISBN")
    } 
    if (!books[isbn]) {
      return res.status(404).send(`Cannot find book with ISBN:${isbn}`);
    }
  
    if (!books[isbn].reviews) {
      return res.status(404).send(`Cannot find any reviews on book with ISBN:${isbn}`);
    }
    if (!books[isbn].reviews[username]) {
      return res.status(404).send(`Cannot find any reviews on book with Username:${username}`);
    } else {
      delete books[isbn].reviews[username]
    }
    
    console.log(books[isbn].reviews)
    return res.status(200).send(`Review from username: ${username} with isbn: ${isbn} deleted successfully`);
  } catch (error) {
    res.status(500).send("Some error occured");
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
