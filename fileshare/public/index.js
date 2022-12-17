const socket = io()
let username ;
do {
    username = prompt("Enter username");
}while(!username)

let textarea = document.querySelector("#text_area");
let messageArea = document.querySelector(".message__area");

textarea.addEventListener('keyup',(e)=>{
    if (e.key === 'Enter'){
        sendMessage(e.target.value);
    }
})
function sendMessage(message){
    let msg = {
        user: username,
        message: message.trim()
    }

    //Append
appendMessage(msg,'outgoing');
textarea.value = '';

//Sending to server
socket.emit("message" , msg); //emit takes two arguments event naem and the object to pass the value
}

function upload(files) {

    socket.emit("upload", files[0], (status) => {
      console.log(status);
    });
  }


function appendMessage(msg,type){
    let mainDiv = document.createElement("div");
    let className= type;
    mainDiv.classList.add(className,'message');

    let markup =`
       <h4>${msg.user}</h4>
       <p>${msg.message}</p>
    `;

    mainDiv.innerHTML = markup;

    messageArea.appendChild(mainDiv);
    scrollToBottom()

}

//Receiving the message
socket.on('message', (msg)=>{
     appendMessage(msg,'incoming');
     scrollToBottom()
})

function scrollToBottom(){
    messageArea.scrollTop = messageArea.scrollHeight;
}
/**
 * Peer 1 (Sender)
 * Peer 2 (Receiver)
 * This example has both the peers in the same browser window.
 * In a real application, the peers would exchange their signaling data for a proper connection.
 * The signaling server part is omitted for simplicity
 */
const peer1 = new SimplePeer({ initiator: true });
const peer2 = new SimplePeer();

/**
 * Implementing the WebRTC connection between the nodes
 */

// Share the signalling data of sender with the receivers
peer1.on('signal', data => {
  peer2.signal(data);
});

// Share the signalling data of receiver with the sender
peer2.on('signal', data => {
  peer1.signal(data);
});


/**
 * Connection established, now sender can send files to other peers
 */
peer1.on('connect', () => {
  const input = document.getElementById('doc');
  const btn = document.getElementById('send');

  // Event listener on the file input
  btn.addEventListener('click', () => {
    const file = input.files[0];
    console.log('Sending', file);
      const name = file.name;
      const ext = name.slice(name.lastIndexOf('.')); 
    // We convert the file from Blob to ArrayBuffer
    file.arrayBuffer()
    .then(buffer => {
      /**
       * A chunkSize (in Bytes) is set here
       * I have it set to 16KB
       */
      const chunkSize = 16 * 1024;

      // Keep chunking, and sending the chunks to the other peer
      while(buffer.byteLength) {
        const chunk = buffer.slice(0, chunkSize);
        buffer = buffer.slice(chunkSize, buffer.byteLength);
        
        // Off goes the chunk!
        peer1.send(chunk);
      }

      // End message to signal that all chunks have been sent
      peer1.send('Done.'+ext);
    });

  });
});


/**
 * Receiver receives the files
 */
const fileChunks = [];
peer2.on('data', data => {

  if ((data.toString()).slice(0,(data.toString()).indexOf('.')) == 'Done') {
    // Once, all the chunks are received, combine them to form a Blob
    console.log(data.toString());
    const exte  = (data.toString()).slice((data.toString()).lastIndexOf('.')+1);
    const file = new Blob(fileChunks);
     
    console.log('Received', file);
    // Download the received file using downloadjs
    //const extension = fileName.substring(fileName.lastIndexOf('.')+1);
    download(file, Date.now()+'.'+exte);
  }
  else {
    // Keep appending various file chunks 
    fileChunks.push(data);
  }

});
