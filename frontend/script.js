var sendChannel, 
	receiveChannel,
	chatWindow = document.querySelector('.chat-window'),
	chatWindowMessage = document.querySelector('.chat-window-message'),
	chatThread = document.querySelector('.chat-thread');

// Create WebRTC connection
createConnection();

let userMessages = [];
let assistantMessages = [];
let myDateTime = ''
let mbtiType = ''


function spinner() {
  document.getElementById('loader').style.display = "block";
}

function start() {
  const date = document.getElementById('date').value;
  const hour = document.getElementById('hour').value;
  const mbti = document.getElementById('mbti-type').value;
  if (date === '') {
      alert('생년월일을 입력해주세요.');
      return;
  }
  myDateTime = date + hour;
  mbtiType = mbti;
  // console.log(myDateTime)

  document.getElementById("intro").style.display = "none";
  document.getElementById("chat").style.display = "block";
}


// On form submit, send message
chatWindow.onsubmit = function (e) {
  document.getElementById('loader').style.display = "block";

	e.preventDefault();
  if (!chatWindowMessage.disabled) {
    sendData();
    chatWindowMessage.disabled = true;
  }

	return false;
};

// 연결
async function getBear() {
  try {
    const response = await fetch('http://localhost:3000/BearTell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        myDateTime: myDateTime,
        mbtiType: mbtiType,
        userMessages: userMessages,
        assistantMessages: assistantMessages,
       }) // replace with your desired data
    });

    // Check if response status is okay
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    document.getElementById('loader').style.display = "none";
    // console.log(data);

    // Check if the response has the expected format
    if (!data || !data.assistant) {
      throw new Error('Invalid response format');
    }

    assistantMessages.push(data.assistant);

    // Print the assistant message to the chat window
    const chatNewThread = document.createElement('li');
    const chatNewMessage = document.createTextNode(data.assistant);

    chatNewThread.appendChild(chatNewMessage);
    chatThread.appendChild(chatNewThread);
    chatThread.scrollTop = chatThread.scrollHeight;

    chatWindowMessage.disabled = false;
    chatWindowMessage.focus();
    chatWindowMessage.placeholder = "";

    return data;
  } catch (error) {
    console.error(error);
  }
}

function createConnection () {
    var servers = null;

    if (window.mozRTCPeerConnection) {
	    window.localPeerConnection = new mozRTCPeerConnection(servers, {
	        optional: [{
	            RtpDataChannels: true
	        }]
	    });
    } else {
	    window.localPeerConnection = new webkitRTCPeerConnection(servers, {
	        optional: [{
	            RtpDataChannels: true
	        }]
	    });
    }

    try {
        // Reliable Data Channels not yet supported in Chrome
        sendChannel = localPeerConnection.createDataChannel('sendDataChannel', {
            reliable: false
        });
    } catch (e) {
    }

    localPeerConnection.onicecandidate = gotLocalCandidate;
    sendChannel.onopen = handleSendChannelStateChange;
    sendChannel.onclose = handleSendChannelStateChange;

    if (window.mozRTCPeerConnection) {
	    window.remotePeerConnection = new mozRTCPeerConnection(servers, {
	        optional: [{
	            RtpDataChannels: true
	        }]
	    });
    } else {
	    window.remotePeerConnection = new webkitRTCPeerConnection(servers, {
	        optional: [{
	            RtpDataChannels: true
	        }]
	    });
    }

    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
    remotePeerConnection.ondatachannel = gotReceiveChannel;

    // Firefox seems to require an error callback
    localPeerConnection.createOffer(gotLocalDescription, function (err) {
    });
}

function sendData () {
    sendChannel.send(chatWindowMessage.value);
    chatWindowMessage.value
}

function gotLocalDescription (desc) {
    localPeerConnection.setLocalDescription(desc);
    remotePeerConnection.setRemoteDescription(desc);
    // Firefox seems to require an error callback
    remotePeerConnection.createAnswer(gotRemoteDescription, function (err) {
    });
}

function gotRemoteDescription (desc) {
    remotePeerConnection.setLocalDescription(desc);
    localPeerConnection.setRemoteDescription(desc);
}

function gotLocalCandidate (event) {
    if (event.candidate) {
        remotePeerConnection.addIceCandidate(event.candidate);
    }
}

function gotRemoteIceCandidate (event) {
    if (event.candidate) {
        localPeerConnection.addIceCandidate(event.candidate);
    }
}

function gotReceiveChannel (event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleMessage;
    receiveChannel.onopen = handleReceiveChannelStateChange;
    receiveChannel.onclose = handleReceiveChannelStateChange;
}

function handleMessage (event) {
  var chatNewThread = document.createElement('li'),
    chatNewMessage = document.createTextNode(event.data);

  // Add message to chat thread and scroll to bottom
  chatNewThread.appendChild(chatNewMessage);
  chatThread.appendChild(chatNewThread);
  chatThread.scrollTop = chatThread.scrollHeight;

  userMessages.push(chatWindowMessage.value);

  // Clear text value
  chatWindowMessage.value = '';

  // Call getBear function to fetch bear data
  getBear();
}

function handleSendChannelStateChange () {
  var readyState = sendChannel.readyState;

  if (readyState == 'open') {
      chatWindowMessage.disabled = false;
      chatWindowMessage.focus();
    chatWindowMessage.placeholder = "";
  } else {
      chatWindowMessage.disabled = true;
  }
}

function handleReceiveChannelStateChange () {
  var readyState = receiveChannel.readyState;
} 

