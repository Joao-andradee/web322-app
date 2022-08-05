/*********************************************************************************************
* WEB322 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: João Vitor Andrade Miranda Student ID: 116499203 Date: 08/05/2022
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
var path = require('path');
const stripJs = require('strip-js');
const { info } = require('console');
const authData = require('./auth-service');
const clientSessions = require ('client-sessions');
var app = express();

app.use(clientSessions({
    cookieName: "session",
    secret: "assignment6WEB322",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60 
  }));

app.use(function(req, res, next) {
res.locals.session = req.session;
next();
});

app.use(express.urlencoded({extended: true}));

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

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
        }, 
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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
const upload = multer();

app.use(express.static('public'));
app.use(express.static('views'));


app.get("/", (req, res) => {
    res.redirect('blog')
});

app.get("/about", (req, res) => {
    res.render('about',{
        data: info
    })
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.post("/register", (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render('register', {successMessage: "User created"});
    }).catch((err) => {
        res.render('register', {errorMessage: err, userName: req.body.userName});
    });
});

app.get('/blog', async (req, res) => {
    let viewData = {};
    try{
        let posts = [];
        if(req.query.category){
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        let post = posts[0]; 
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }
    try{
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    res.render("blog", {data: viewData})
});

app.get('/blog/:id', async (req, res) => {
    let viewData = {};
    try{
        let posts = [];
        if(req.query.category){
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;
    }catch(err){
        viewData.message = "no results";
    }
    try{
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
    try{
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    res.render("blog", {data: viewData})
});

app.get("/posts",ensureLogin, (req, res) => {
    var cat = req.query.category;
    var minDat = req.query.minDate;
    if(blogData.length==0){
        res.render("posts",{ message: "No results" });
    }
    if(cat > 0){
        blogData.getPostsByCategory(cat).then((getResponse)=>{
            res.render("posts", {posts:getResponse})
        }).catch(()=>{
            res.render("posts", {message: "No results"})
        })
    }
    else if(minDat != null){
        blogData.getPostsByMinDate(minDat).then((getResponse)=>{
            res.render("posts", {posts: getResponse})
        }).catch(()=>{
            res.render("posts", {message: "No results"})
        })
    }else{
        blogData.getAllPosts().then((getResponse)=>{res.render("posts", {posts: getResponse})}).catch(()=>{res.render("posts", {message: "No results"})})
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

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        };
        res.redirect('/posts');
    }).catch((err) => {
        res.render('login', {errorMessage: err, userName: req.body.userName});
    });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
    });

app.get("/posts/add",ensureLogin, (req, res) => {
    blogData.getCategories().then((data) => {
        res.render('addPost',{
            categories: data
        })
    }).catch(()=>{res.render('addPost'), {categories: []}})
    
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render('userHistory');
});

app.get("/posts/:id",ensureLogin, (req, res) => {
    blogData.getPostById(req.params.id).then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
});

app.get("/posts/delete/:id",ensureLogin, (req, res) => {
    blogData.deletePostById(req.params.id).then(() => {
        res.redirect('/posts');
    }).catch(console.log("Unable to Remove Post / Post not found"))
});

app.get("/categories",ensureLogin, (req, res) => {
    if(blogData.length == 0){
        res.render("categories",{message: "No results" });
    }
    blogData.getCategories().then((getResponse)=>{res.render("categories", {categories: getResponse})}).catch(()=>{res.render("categories", {message: "No results"})})
});

app.get("/categories/add", ensureLogin, (req, res) => {
    res.render('addCategory')
});

app.post("/categories/add",ensureLogin, (req, res) => {
    blogData.addCategory(req.body).then(() => {
        res.redirect('/categories');
    }).catch(console.log("Unable to Add category"))
});

app.get("/categories/delete/:id",ensureLogin, (req, res) => {
    blogData.deleteCategoryById(req.params.id).then(() => {
        res.redirect('/categories');
    }).catch(console.log("Unable to Remove Category / Category not found)"))
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/errorPage.html"))
});



/* blogData.initialize()
.then(()=>{
    app.listen(HTTP_PORT,()=>{console.log(`Listening to port ${HTTP_PORT}`)})
}).catch(()=>{console.log("Fail to initialize the data.")})  */

blogData.initialize().then(authData.initialize).then(function(){
app.listen(HTTP_PORT, function(){
console.log("app listening on: " + HTTP_PORT)
});}).catch(function(err){
console.log("unable to start server: " + err);
});