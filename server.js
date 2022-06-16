/*********************************************************************************************
* WEB322 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: João Vitor Andrade Miranda Student ID: 116499203 Date: 06/16/2022
*
* Online (Heroku) URL:  https://dry-cliffs-12918.herokuapp.com/
*
**********************************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var blog_service = require('./blog-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
var express = require("express");
var app = express();
var getPost = require('./data/posts.json')
var path = require('path')

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
    res.redirect('about')
});

app.get("/about", (req, res) => {
    res.redirect("about.html")
});

app.get("/blog", (req, res) => {
    blog_service.getPublishedPosts().then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
});

app.get("/posts", (req, res) => {
    var cat = req.query.category;
    var minDat = req.query.minDate;
    if(cat < 6 && cat > 0){
        blog_service.getPostsByCategory(cat).then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
    }
    else if(minDat != null){
        blog_service.getPostsByMinDate(minDat).then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
    }else{
        blog_service.getAllPosts().then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
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
        blog_service.addPost(req.body).then(() => {
            res.redirect('/posts');
        });
    });
});

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addPost.html'));
});

app.get("/posts/:id", (req, res) => {
    blog_service.getPostById(req.params.id).then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
});

app.get("/categories", (req, res) => {
    blog_service.getCategories().then((getResponse)=>{res.send(getResponse)}).catch((getReject)=>{res.send(getReject)})
});

app.get("*", (req, res) => {
    res.send("<h1><b>ERROR 404 - Page does not exist<b><h1>")
});


// setup http server to listen on HTTP_PORT
//app.listen(HTTP_PORT)
blog_service.initialize().then(()=>{app.listen(HTTP_PORT)}).catch(()=>{"Fail to initialize the data."})
