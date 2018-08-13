const socket = socket.io.connect('http://localhost:3000');

// Incoming Message
socket.on('message', function(data){

});

// Send Message
function sendMessage(message){
    socket.emit('message', message);
}