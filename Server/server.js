const express = require('express');
const keys = require('./keys');
const firebase = require('firebase');
const app = express();
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
var auth = firebase.auth();

io.on('connection', function(socket){
    console.log('a user has joined');
    socket.on('request:APIKeys', function(){
        socket.emit('requested:APIKeys', keys);
    });
    socket.on('message:received', function(messageReceived, from, to){

    });
    socket.on('database:requestdatabaseandauth', function(){
        console.log('requested database', database);
        socket.emit('database:requesteddatabaseandauth', auth);
    });
    socket.on('disconnect', function(){
        io.emit('user disconnected');
        console.log('a user has disconnected');
    });
});