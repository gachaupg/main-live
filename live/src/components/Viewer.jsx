// Viewer.js
import React, { Component } from 'react';
import axios from 'axios';

class Viewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      peer: null,
    };
  }

  componentDidMount() {
    this.init();
  }

  // Use an arrow function to define init
  init = async () => {
    const peer = this.createPeer();
    peer.addTransceiver('video', { direction: 'recvonly' });
    this.setState({ peer });

    try {
      // Request to join the stream
      const { data } = await axios.post('http://localhost:5000/join-stream');
      const desc = new RTCSessionDescription(data.sdp);
      peer.setRemoteDescription(desc);
    } catch (error) {
      console.error(error);
    }
  }

  createPeer() {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.stunprotocol.org',
        },
      ],
    });
    peer.ontrack = this.handleTrackEvent;
    peer.onnegotiationneeded = () => this.handleNegotiationNeededEvent(peer);

    return peer;
  }

  async handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
      sdp: peer.localDescription,
    };

    try {
      const { data } = await axios.post('http://localhost:5000/consumer', payload);
      const desc = new RTCSessionDescription(data.sdp);
      peer.setRemoteDescription(desc).catch((e) => console.log(e));
    } catch (error) {
      console.error(error);
    }
  }

  handleTrackEvent = (e) => {
    this.videoRef.srcObject = e.streams[0];
  };

  render() {
    return (
      <div>
        <button id="my-button" onClick={this.init}>
          Join Stream
        </button>
        <video id="video" ref={(ref) => (this.videoRef = ref)} autoPlay />
      </div>
    );
  }
}

export default Viewer;
