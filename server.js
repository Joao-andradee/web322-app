/*********************************************************************************************
* WEB322 – Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: João Vitor Andrade Miranda Student ID: 116499203 Date: 07/07/2022
*
* Online (Heroku) URL:  https://dry-cliffs-12918.herokuapp.com/
*
**********************************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var blogData = require('./blog-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require('express-handlebars')
var express = require("express");
var getPost = require('./data/posts.json')
var path = require('path');
const stripJs = require('strip-js');
const { info } = require('console');
var app = express();


app.engine('.hbs',exphbs.engine({
    extname:'.hbs',
    helpers:{
        strong: function(options){
            return '<strong>' + options.fn(this) + '</strong>'
        },
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal:function(lvalue,rvalue,options){
            if(arguments.length<3)
                throw new Error ("Handlebars Helper equal needs 2 parameters");
            if(lvalue !=rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        } 
    }
}))
app.set('view engine','.hbs')

cloudinary.config({
    cloud_name: 'web322a',
    api_key: '934275813276677',
    api_secret: 't68jqCN_o7mYn6nMLmvDwrhsWhs',
    secure: true
    });
const upload = multer(); // no { storage: storage }


//css
//app.use(express.static("static"));
app.use(express.static('public'));
app.use(express.static('views'));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    console.log('Express http server listening on port',HTTP_PORT)
    res.redirect('blog')
});

app.get("/about", (req, res) => {
    res.render('about',{
        data: info
    })
});

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get("/posts", (req, res) => {
    var cat = req.query.category;
    var minDat = req.query.minDate;
    if(cat < 6 && cat > 0){
        blogData.getPostsByCategory(cat).then((getResponse)=>{res.render("posts", {posts:getResponse})}).catch(()=>{res.render("posts", {message: "no results"})})
    }
    else if(minDat != null){
        blogData.getPostsByMinDate(minDat).then((getResponse)=>{res.render("posts", {posts: getResponse})}).catch(()=>{res.render("posts", {message: "no results"})})
    }else{
        blogData.getAllPosts().then((getResponse)=>{res.render("posts", {posts: getResponse})}).catch(()=>{res.render("posts", {message: "no results"})})
    }
});
app.post("/posts/add",upload.single("featureImage"),(req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    upload(req).then((uploaded)=> {
        req.body.featureImage = uploaded.url;
        blogData.addPost(req.body).then(() => {
            res.redirect('/posts');
        });
    });
});

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
    });

app.get("/posts/add", (req, res) => {
    res.render('addPost')
});

app.get("/posts/:id", (req, res) => {
    blogData.getPostById(req.params.id).then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
});

app.get("/categories", (req, res) => {
    blogData.getCategories().then((getResponse)=>{res.render("categories", {categories: getResponse})}).catch(()=>{res.render("posts", {message: "no results"})})
});

app.get("*", (req, res) => {
    res.send("<h1><b>ERROR 404 - Page does not exist<b><h1>")
});


// setup http server to listen on HTTP_PORT
//app.listen(HTTP_PORT)
blogData.initialize().then(()=>{app.listen(HTTP_PORT)}).catch(()=>{"Fail to initialize the data."})
