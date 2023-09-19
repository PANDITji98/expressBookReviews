const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//Custom Function to check the existing username
const isExistingUser = (username)=>{
  let existingUserCreds = users.filter((user)=>{
    return user.username === username
  });
  console.log(existingUserCreds)
  if(existingUserCreds.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password){
      return res
        .status(400)
        .send("Please all the required details to continue");
    }

    if(!isValid(username)){
      return res
        .status(400)
        .send("Please enter a valid username or try a different one");
    }
     if(!isExistingUser(username)){ 
      await users.push({"username":username,"password":password});
      return res.status(200).json({message: "User has been registered"});
    } else {
      return res.status(400).json({message: `User with username:${username} already exists`});    
    }
  } catch (error) {
    res.status(400).send("Some error occured")
  }
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {

    if (await books) {
      return res.status(200).json(books);
    }
    res.status(300).send("No books found");
  } catch (error) {
    res.send(400).send("Some error occured");
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const { isbn } = req.params;
  try {
    if (await books && await isbn) {
      return res.status(200).json(books[isbn]);
    }
    res.status(300).send("No books found");
  } catch (error) {
    res.send(400).send("Some error occured");
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const { author } = req.params;
  try {
    let arr = [];
    for (let i in books) {
      if (
        Object.entries(books[i])[0][0] == "author" &&
        Object.entries(books[i])[0][1] == author
      ) {
        await arr.push(books[i]);
      }
    }

    return res.status(200).json(arr);
  } catch (error) {
    res.status(400).send("Some error occured");
  }
});

// Get all books based on title
public_users.get("/title/:title",async function (req, res) {
  const { title } = req.params;
  try {
    let arr = [];
    for (let i in books) {
      if (
         Object.entries(books[i])[1][0] == "title" &&
         Object.entries(books[i])[1][1] == title
      ) {
        await arr.push(books[i]);
      }
    }

    return res.status(200).json(arr);
  } catch (error) {
    res.status(400).send("Some error occured");
  }
});

//  Get book review
public_users.get("/review/:isbn",async function (req, res) {
  const { isbn } = req.params;
  try {
    if (await books && await isbn) {
      return res.status(200).json(books[isbn].reviews);
    }
    res.status(300).send("No books found");
  } catch (error) {
    res.send(400).send("Some error occured");
  }
});

module.exports.general = public_users;
