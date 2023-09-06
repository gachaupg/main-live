import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Creator = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isMicrophoneOn, setIsMicrophoneOn] = useState(true); // Initially, microphone is on
    const yourVideoRef = useRef(null);
    const yourAudioRef = useRef(null);
    const peerConnectionRef = useRef(null);

    useEffect(() => {
        if (isStreaming) {
            startStream();
        } else {
            stopStream();
        }
    }, [isStreaming]);

    async function startStream() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicrophoneOn });
            setIsStreaming(true);

            // Attach the stream to the video and audio elements
            if (yourVideoRef.current) {
                yourVideoRef.current.srcObject = stream;
            }
            if (yourAudioRef.current) {
                yourAudioRef.current.srcObject = stream;
            }

            const peerConnection = createPeer();
            peerConnectionRef.current = peerConnection;
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            // Send an offer to the signaling server
            handleNegotiationNeededEvent(peerConnection);
        } catch (error) {
            console.error('Error accessing camera and microphone:', error);
        }
    }

    function stopStream() {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        setIsStreaming(false);
    }

    function createPeer() {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(peerConnection);

        return peerConnection;
    }

    function handleNegotiationNeededEvent(peerConnection) {
        peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
                const payload = {
                    sdp: peerConnection.localDescription
                };
                // Change the URL to your Node.js server where you handle the stream.
                axios.post('http://localhost:5000/broadcast', payload)
                    .then(response => {
                        const desc = new RTCSessionDescription(response.data.sdp);
                        return peerConnection.setRemoteDescription(desc);
                    })
                    .catch(error => console.error(error));
            })
            .catch(error => console.error(error));
    }

    function toggleMicrophone() {
        setIsMicrophoneOn(!isMicrophoneOn);
        if (yourAudioRef.current && yourAudioRef.current.srcObject) {
            const audioTracks = yourAudioRef.current.srcObject.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = isMicrophoneOn;
            });
        }
    }

    return (
        <div>
            <button onClick={() => setIsStreaming(!isStreaming)} className="btn">
                {isStreaming ? 'Stop Stream' : 'Start Stream'}
            </button>
            <button onClick={toggleMicrophone} className="btn">
                {isMicrophoneOn ? 'Mute Microphone' : 'Unmute Microphone'}
            </button>
            {isStreaming && <video ref={yourVideoRef} autoPlay playsInline></video>}
            {isStreaming && <audio ref={yourAudioRef} autoPlay></audio>}
        </div>
    );
}

export default Creator;





// // Creator.js
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';

// const Creator = () => {
//     const [isStreaming, setIsStreaming] = useState(false);
//     const yourVideoRef = useRef(null);
//     const peerConnectionRef = useRef(null);

//     useEffect(() => {
//         if (isStreaming) {
//             startStream();
//         }
//     }, [isStreaming]);

//     async function startStream() {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//             setIsStreaming(true);

//             // Attach the stream to the video element
//             if (yourVideoRef.current) {
//                 yourVideoRef.current.srcObject = stream;
//             }

//             const peerConnection = createPeer();
//             peerConnectionRef.current = peerConnection;
//             stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

//             // Send an offer to the signaling server
//             handleNegotiationNeededEvent(peerConnection);
//         } catch (error) {
//             console.error('Error accessing camera:', error);
//         }
//     }

//     function createPeer() {
//         const peerConnection = new RTCPeerConnection({
//             iceServers: [
//                 {
//                     urls: "stun:stun.stunprotocol.org"
//                 }
//             ]
//         });
//         peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(peerConnection);

//         return peerConnection;
//     }

//     function handleNegotiationNeededEvent(peerConnection) {
//         peerConnection.createOffer()
//             .then(offer => peerConnection.setLocalDescription(offer))
//             .then(() => {
//                 const payload = {
//                     sdp: peerConnection.localDescription
//                 };
//                 // Change the URL to your Node.js server where you handle the stream.
//                 axios.post('http://localhost:5000/broadcast', payload)
//                     .then(response => {
//                         const desc = new RTCSessionDescription(response.data.sdp);
//                         return peerConnection.setRemoteDescription(desc);
//                     })
//                     .catch(error => console.error(error));
//             })
//             .catch(error => console.error(error));
//     }

//     return (
//         <div>
//             <button onClick={() => setIsStreaming(!isStreaming)} className="btn">
//                 {isStreaming ? 'Stop Stream' : 'Start Stream'}
//             </button>
//             {isStreaming && <video ref={yourVideoRef} autoPlay playsInline></video>}
//         </div>
//     );
// }

// export default Creator;
