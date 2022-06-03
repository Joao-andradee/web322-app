/*********************************************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: João Vitor Andrade Miranda Student ID: 116499203 Date: 05/27/2022
*
* Online (Heroku) URL:  https://dry-cliffs-12918.herokuapp.com/
*
**********************************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var blog_service = require('./blog-service');
//const categ = require("./data/categories.json");
//const post = require("./data/posts.json");
//var publishedPosts = []
var express = require("express");
var app = express();


//css
//app.use(express.static("static"));
app.use(express.static('public'));
app.use(express.static('views'));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    console.log('Express http server listening on port',HTTP_PORT)
    res.redirect('about')
});

app.get("/about", (req, res) => {
    res.redirect("about.html")
});

app.get("/blog", (req, res) => {
    blog_service.getPublishedPosts().then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
});

app.get("/posts", (req, res) => {
    //var jsonString = JSON.stringify(post);
    //res.send(jsonString);
    //res.json(post);
    blog_service.getAllPosts().then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})

});
app.get("/categories", (req, res) => {
    //var jsonString = JSON.stringify(categ);
    //res.send(jsonString);
    //res.json(categ);
    blog_service.getCategories().then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
});

app.get("*", (req, res) => {
    console.log("The specified route does not exist")
    res.send("<h1><b>ERROR 404 - Page does not exist<b><h1>")
});


// setup http server to listen on HTTP_PORT
//app.listen(HTTP_PORT)
blog_service.initialize().then(()=>{app.listen(HTTP_PORT)}).catch(()=>{"Fail to initialize the data."})
