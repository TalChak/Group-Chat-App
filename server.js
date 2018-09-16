/*using with exress*/

var express = require('express');
var http = require('http');
var app = express();
var server = module.exports = http.createServer(app);
var io = require("socket.io").listen(server);
userArray = [];
connections = [];

server.listen(80);
console.log('runnning');
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
 connections.push(socket);
 console.log('connected testing123: %s sockets connected', connections.length);
    
 socket.on('disconnect', function(data){
       /* if(!socket.username) return; */
        console.log("remove user name: "+socket.user_name);
        io.sockets.emit('delete user', socket.user_name)
        removeUser(socket.user_name);
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected testing 222: %s sockets connected.', connections.length)
 
    });
   
    socket.on('new message', function (data){
        console.log("new message sent:"+data.message);
        sendMessage(data);
    });
    
    socket.on('new user', function(data){
        console.log("new user:"+data);
        socket.user_name = data.user_name;
        console.log("socket user name: "+socket.user_name);
        userArray.push(data);
        updateUserArray();
    });
    
    function sendMessage(data)
    {
        io.sockets.emit('receive message', data);
    }
    
    function updateUserArray()
    {
        io.sockets.emit('user list' , userArray);
    }
    
    function removeUser(user)
    {
        var i;
        for(i=0; i<userArray.length;i++)
        {
            if(userArray[i].user_name==user)
                userArray.splice(i, 1);
        }
        updateUserArray();
    }
    
}); 
    