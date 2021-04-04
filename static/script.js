const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.classList.add("myVideo")
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        console.log(username + " username")
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId, username) => {
        connectToNewUser(userId, username, stream)
    })

    // input value
    let text = $("#chat_message");
    // when press enter send message
    $('html').keydown(function(e) {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('')
        }
    });
    $('#send-message-icon').click(function(e) {
        if (text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('')
        }
    });
    socket.on("createMessage", (message, userId, username) => {
        if (username == "" || username == null) {
            username = "Organizer"
        }
        $("ul").append(`<li class="message"><b>${username}</b><br>${message}</li>`);
        scrollToBottom()
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    console.log("Inside open functin")
    let divForUsername = document.querySelector(".divForUsername")
    let joinButton = document.querySelector("#join-button")
    let usernameInput = document.querySelector("#username")
    if (window.getComputedStyle(divForUsername).display == "none") {
        console.log("display none tha")
        divForUsername.style.display = "flex"
        document.querySelector(".main").style.display = "none"
    }

    divForUsername.addEventListener("submit", (e) => {
        e.preventDefault()
        if (usernameInput.value == "") {

        } else {

            username = usernameInput.value
            socket.emit('join-room', ROOM_ID, id, username)
            divForUsername.style.display = "none"
            document.querySelector(".main").style.display = "flex"
        }

    })
})


function connectToNewUser(userId, username, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}



const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    let html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    let html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    let html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    let html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}



const leaveMeeting = () => {
    console.log('leave meeting')
    const video = document.querySelector('video');

    // A video's MediaStream object is available through its srcObject attribute
    const mediaStream = video.srcObject;

    // Through the MediaStream, you can get the MediaStreamTracks with getTracks():
    const tracks = mediaStream.getTracks();

    // Tracks are returned as an array, so if you know you only have one, you can stop it with: 
    tracks[0].stop();

    // Or stop all like so:
    tracks.forEach(track => track.stop())
        // window.close();
    opennewtab('https://www.google.com/')
    setStopVideo()
    setMuteButton()
        // document.querySelector('.main__leave_meeting_button').innerHTML = html;
}



function w3_open() {
    document.getElementById("mySidebar").classList.add("display-flex")
}

function w3_close() {
    document.getElementById("mySidebar").classList.remove("display-flex")
}

window.history.forward();

function noBack() {
    window.history.forward();
}

function opennewtab(url) {
    var win = window.open(url, "_self");
}