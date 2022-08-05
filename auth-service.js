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
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const {Schema} = mongoose;
let pass = encodeURIComponent("fVATPXWzHRARPHuW");
var userSchema = new Schema ({
    'userName': {type: String,
        unique: true
    },
    'password': String,
    'email': String,
    'loginHistory': [{'dateTime': Date,'userAgent': String}]
});

let User;

function initialize() {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection('mongodb+srv://jvandrade-miranda:fVATPXWzHRARPHuW@assignment6.kfdddtf.mongodb.net/?retryWrites=true&w=majority');
        db.on('error', (err)=>{
            reject(err);
        });
        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

function registerUser(userData){
    return new Promise(function(resolve,reject){
        if(userData.userName == "" || userData.userAgent == ""|| userData.email == ""|| userData.password == "" ||userData.password2 == "" ){
            reject("Field cannot be empty");
        }
        else if(userData.password != userData.password2){
            reject("Password does not match");
        } 
        else{
            bcrypt.hash(userData.password, 10).then(hash=>{
                userData.password = hash;
            let newUser = new User(userData);
            newUser.save().then(()=>{resolve()}).catch(err=>{
                if(err == 11000){
                    reject("User Name already taken");
                }else{
                    console.log("There was an error creating the user: ",err);
                }
            })
        }).catch(error=>{
            reject("Something happend when encrypting the password - ",error);
        });
        }
    })
}

function checkUser(userData) {
    return new Promise(function(resolve,reject){
        User.find({name: userData.userName}).exec().then((users)=>{
            if(!users){
                reject("Unable to find user: ",userData.userName);
            }else{
                bcrypt.compare(userData.password, users[0].password).then((result) => {
                    if (!result) {
                        reject("Incorrect Password for user: ${userData.userName}");
                    }
                    else {
                        users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                        User.updateOne({userName: userData.userName}, {$set: {
                                loginHistory: users[0].loginHistory
                            }
                        }).exec().then(() => {
                            resolve(users[0]);
                        }).catch((err) => {
                            reject("There was an error verifying the user: ${err}");
                        });
                    }
                });
            }
        }).catch(err=>{console.log(err)})
    })
}

module.exports = {initialize,checkUser,registerUser};
