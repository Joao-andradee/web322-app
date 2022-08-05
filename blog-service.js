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
const fs = require("fs"); // required at the top of your module
const { resolve } = require("path");
const Sequelize = require('sequelize')
var sequelize = new Sequelize('d9va3q8r5vjdsk', 'dkpdpdzkztogvh', '90dac3bfb1f8bb3769aaf66e5aa6c7429e4eb1580c19521640c6f5afe9c8256f', {
    host: 'ec2-52-22-136-117.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
})
var Post = sequelize.define('Post',{
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published:Sequelize.BOOLEAN,
})
var Category = sequelize.define('Category',{
    category: Sequelize.STRING,
})
Post.belongsTo(Category, {foreignKey: 'category'})

function initialize(){
    return new Promise(function(resolve,reject){
        sequelize.sync()
        .then(function(){
            resolve("Successfully")
            })
        .catch(function() {reject("Unable to sync the database")})
        })
}

function getAllPosts () {
    return new Promise(function(resolve,reject){
        sequelize.sync().then(function(){
            Post.findAll().then(function(data){        
                resolve(data)
            }).catch(function() {reject(console.log("A problem happend or no data was found"))})
        })
    })
}

function getPostsByCategory (cat) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function(){
            Post.findAll({ 
                where:{category: cat}
            }).then(function(data){        
                resolve(data)
            }).catch(function() {reject(console.log("It was not possible to acess Data"))});
        })
    });
}

function getPublishedPosts () {
    return new Promise(function(resolve,reject){
        sequelize.sync().then(function(){
            Post.findAll({ 
                where:{published: true}
            }).then(function(data){        
                resolve(data)
            }).catch(function() {reject(console.log("It was not possible to acess Data"))});
        })
    });
}

function getCategories(){
    return new Promise(function(resolve,reject){
        sequelize.sync().then(function(){
            Category.findAll().then(function(data){        
                resolve(data)
            }).catch(function() {reject(console.log("It was not possible to acess Data"))});
        })
    })
}

function getPublishedPostsByCategory(cat){
    return new Promise(function(resolve,reject){
        sequelize.sync().then(function(){
            Post.findAll({ 
                where:{published: true , category: cat}
            }).then(function(data){        
                resolve(data)
            }).catch(function() {reject(console.log("It was not possible to acess Data"))});
        })
    });
}

function addPost (postData){
    return new Promise ((resolve,reject)=>{
        if(postData.body == ""){
            postData.body = null;
        }
        if(postData.title == ""){
            postData.title = null;
        }
        if(postData.postDate == ""){
            postData.postDate = null;
        }
        if(postData.featureImage == ""){
            postData.featureImage = null;
        }
        if(postData.published == undefined){
            postData.published = false;
        }else{
            postData.published = true;
        }
        if(postData.category == ""){
            postData.category = null;
        }
        postData.published = (postData.published) ? true : false;
        postData.postDate =new Date()
        sequelize.sync().then(function(){
            Post.create(postData).then(resolve(console.log("Data was created"))).catch(function() {reject("Unable to create post")});
         })
    })
}

function getPostsByMinDate(minDateStr){
    return new Promise(function(resolve,reject){
            const { gte } = Sequelize.Op;
            sequelize.sync().then(function(){
            Post.findAll({ 
                where: {
                    postDate: {
                    [gte]: new Date(minDateStr)
                    }
                }
            }).then(function(data){        
                resolve(data)
            }).catch(function() {reject(console.log("It was not possible to acess Data"))});
        })
    })
}

function getPostById(idInput){
    return new Promise ((resolve,reject)=>{
        sequelize.sync().then(function(){
            Post.findAll({ 
                where:{id: idInput}
            }).then(function(data){        
                resolve(data)
            }).catch(function() {reject(console.log("It was not possible to acess Data"))});
        })
    })
}

function addCategory(categoryData){
    return new Promise ((resolve,reject)=>{
        if(categoryData.category == ""){
            categoryData.category = null;
        }
        sequelize.sync().then(function(){
            Category.create(categoryData).then(resolve(console.log("Data was created"))).catch(reject("Unable to create category"));
        })
    })
}

function deleteCategoryById(id){
    return new Promise ((resolve,reject)=>{
        sequelize.sync().then(function(){
            Category.destroy({
                where: {id: id}
            }).then(resolve(console.log("Data was Deleted"))).catch(reject("Unable to delete category"));
        })
    })
}

function deletePostById(id){
    return new Promise ((resolve,reject)=>{
        sequelize.sync().then(function(){
            Post.destroy({
                where: {id: id}
            }).then(resolve(console.log("Data was Deleted"))).catch(reject("Unable to delete category"));
        })
    })
}

module.exports = {getCategories,getPublishedPosts,getAllPosts,initialize,addPost,
    getPostsByCategory,getPostsByMinDate,getPostsByCategory,getPostById,getPublishedPostsByCategory,addCategory,deleteCategoryById, deletePostById} 