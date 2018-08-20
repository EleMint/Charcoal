const express = require('express');
const keys = require('./keys.js');
const firebase = require('firebase');
const app = express();
// TODO: Change Listening IP
var server = app.listen(3000, '127.0.0.1');
const socket = require('socket.io');
var io = socket(server);
app.use(express.static('public'));

console.log('Server is now running....');

// Initialize Firebase
var config = {
    apiKey: keys.FirebaseAPIKey,
    authDomain: keys.FirebaseAuthDomain,
    databaseURL: keys.FirebaseURL,
    projectId: keys.FirebaseProjectId,
    storageBucket: keys.FirebaseStoragebucket,
    messagingSenderId: keys.FirebaseMessagingSenderId
};
firebase.initializeApp(config);
var database = firebase.database();

// var ref = database.ref('test/-LK2P1ln1gAGp5wdyZMP');
// var data = {
//     from: '',
//     message: '',
//     to: null
// };
// ref.push(data);
io.socket.on('request:APIKeys', function(){
    io.emit('requested:APIKeys', keys);
});


// When Server Receives a Message
io.sockets.on('message:received', function(message, username, sentTo){
    var usersFound = findUsersByUsername(username);
    var refM = database.ref('users' + usersFound[0] + 'messagesSent');
    var data = {
        message : message,
        to : sentTo
    };
    refM.push(data);

    // Save in Database User Messages
    for(let i = 0; i < sentTo.length; i++){
        var refS = database.ref('users' + usersFound[i] + 'messagesRecieved');
        var data = {
            message : message,
            from : username
        };
        refS.push(data);
    }

    // Send Message Back To Everyone
    io.emit('message:send', message, sentTo);
});

function findUsersByUsername(username){
    var refU = database.ref('users');
    var rUsers = [];
    refU.on('value', function(data){
        var usersObject = data.val();
        var users = Object.keys(usersObject);
        for(let i = 0; i < users.length; i++){
            if(usersObject[i].username === username){
                rUsers.push(usersObject[i]);
            }
        }
    }, 
    function(err){
        console.log('Error...', err);
    });
    return rUsers;
}