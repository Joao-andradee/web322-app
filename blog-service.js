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
module.exports = {getCategories,getPublishedPosts,getAllPosts,initialize} 
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