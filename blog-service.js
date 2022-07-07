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
module.exports = {getCategories,getPublishedPosts,getAllPosts,initialize,addPost,getPostsByCategory,getPostsByMinDate,getPostsByCategory,getPostById,getPublishedPostsByCategory} 
const fs = require("fs"); // required at the top of your module
const { resolve } = require("path");
var categ = require("./data/categories.json")
var getPost = require('./data/posts.json')
var posts= []
var publishedPosts = []
var categories = []

function initialize(){
    return new Promise(function(resolve,reject){
        fs.readFile('./data/posts.json', 'utf8', (err, readData) => { 
            if (err) 
                reject(err);
            else{
                posts = JSON.parse(readData);
                }});
        fs.readFile('./data/categories.json', 'utf8', (err, readData) => { 
            if (err) 
                reject(err);
            else{
                categories = JSON.parse(readData);
                resolve("Sucess");}});
    })
}

function getAllPosts () {
    return new Promise(function(resolve,reject){
        if(getPost.length!=0){
            resolve(getPost)
        }else{
            reject("The JSON is empty and no result to return")
        }
    })
}

function getPublishedPosts () {
    return new Promise(function(resolve,reject){
        if(getPost.length!=0){
            var store = 0;
            for(let i =0; i<getPost.length;i++){
                if(getPost[i].published){
                    publishedPosts[store] = getPost[i]
                    store++
                }
            }
            resolve(publishedPosts)
        }else{
            reject("The JSON is empty and no result to return")
        }
    })
}

function getCategories(){
    return new Promise(function(resolve,reject){
        if(categ.length!=0){
            resolve(categ)
        }else{
            reject("The JSON is empty and no result to return")
        }
    })
}

function getPostsByCategory (category) {
    var filterSearch =[]
    return new Promise((resolve, reject) => {
        filterSearch = posts.filter(search => 
            search.category == category);
        if (filterSearch == 0) {
            reject("So sorry, but there is no results to display");
        } else {
            resolve(filterSearch);
        }
    });
}
function getPublishedPostsByCategory(category){
    var filterSearch =[]
    var index =0
    return new Promise((resolve, reject) => {
        if (category < 0 || category >5) {
            reject("So sorry, but there is no results to display");
        }else{
            for(var i =0;i<getPost.length;i++){
                if(getPost[i].published == true && getPost[i].category == category){
                    filterSearch[index] = getPost[i]
                    index++
                }
            }
            resolve(filterSearch);
        }
    });
    
}

function addPost (postData){
    var day = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();
    return new Promise ((resolve,reject)=>{
        if(postData.published == undefined){
            postData.published = false;
        }else{
            postData.published = true;
        }
        postData.id = getPost.length +1;
        if(day <10 && month < 10){
            postData.postDate = year + "-" +  "0" + month + "-" + "0" + day
        }else if(month <10){
            postData.postDate = year + "-" + "0" + month + "-" + day
        }else if (day < 10){
            postData.postDate = year + "-"+ month + "-" + "0" + day
        }else{
            postData.postDate = year + "-" + month + "-" + day
        }
        getPost.push(postData);
        resolve(true);
    })
}
function getPostsByMinDate(minDateStr){
    var filterSearch =[]
    return new Promise ((resolve,reject)=>{
        for(var i =0;i< posts.length;i++){
            if(new Date(posts[i].postDate) >= new Date(minDateStr)){
                console.log("The postDate value is greater than minDateStr")
                filterSearch.push(posts[i])
            }
        }
        if(filterSearch.length == 0){
            reject('No data found')
        }else{
            resolve(filterSearch)
        }
    })
}

function getPostsByCategory(category){
    var filterSearch =[]
    return new Promise ((resolve,reject)=>{
        for(var i =0;i< posts.length;i++){
            if(posts[i].category == category){
                filterSearch.push(posts[i])
            }
        }
        if(filterSearch.length == 0){
            reject('No data found')
        }else{
            resolve(filterSearch)
        }
    })
}
function getPostById(id){
    var filterSearch =[]
    return new Promise ((resolve,reject)=>{
        for(var i =0;i< posts.length;i++){
            if(id == posts[i].id){
                filterSearch.push(posts[i])
            }
        }
        if(filterSearch.length == 0){
            reject('No data found')
        }else{
            resolve(filterSearch)
        }
    })
}