const express = require('express');
const http = require('http');
const fs = require('fs');

const app = express();

const port = process.env.PORT || 3000;

const server = http.createServer(app);

app.use(express.static(__dirname + "/public"))

server.listen(port ,()=>{
    console.log(`Server is listening at port ${port}`);
})

app.get("/",(req,res)=>{
    res.sendFile(__dirname + '/index.html');
})


//Socket

const io = require("socket.io")(server)

io.on('connection' , (socket)=>{
    console.log("Connected....");
    socket.on("message" , (msg)=>{
        socket.broadcast.emit("message",msg);
    })
 
})