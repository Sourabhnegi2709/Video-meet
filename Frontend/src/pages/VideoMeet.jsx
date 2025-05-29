import { useRef, useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import server from '../environment';



// Icons
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';


const server_url = server;

const peerConfigConnections = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

function VideoMeet() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoRef = useRef();
    const connections = useRef({});

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isChatOn, setIsChatOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [videos, setVideos] = useState([]);

    const [roomInput, setRoomInput] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatCollapsed, setIsChatCollapsed] = useState(false);

    const getPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoAvailable,
                audio: audioAvailable,
            });
            window.localStream = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('getUserMedia error:', err);
            setVideoAvailable(false);
            setAudioAvailable(false);
        }
    };

    const connectToSocketServer = () => {
        socketRef.current = io(server_url);

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id;
            console.log('✅ Socket connected:', socketRef.current.id);
            socketRef.current.emit('join-call', roomId, username);
            socketRef.current.on("chat-message", data, sender, senderId);
        });

        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('user-joined', handleUserJoined);
        socketRef.current.on('user-left', (id) => {
            setVideos((prev) => prev.filter((v) => v.socketId !== id));
        });
    };

    const handleUserJoined = (id, clients) => {
        clients.forEach((socketListId) => {
            if (socketListId === socketIdRef.current || connections.current[socketListId]) return;

            const peerConnection = new RTCPeerConnection(peerConfigConnections);
            connections.current[socketListId] = peerConnection;

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socketRef.current.emit('signal', socketListId, JSON.stringify({ ice: event.candidate }));
                }
            };

            peerConnection.ontrack = (event) => {
                setVideos((prev) => {
                    if (prev.some((v) => v.socketId === socketListId)) return prev;
                    return [...prev, { socketId: socketListId, stream: event.streams[0] }];
                });
            };

            window.localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, window.localStream);
            });

            if (socketIdRef.current < socketListId) {
                peerConnection
                    .createOffer()
                    .then((desc) => peerConnection.setLocalDescription(desc))
                    .then(() => {
                        socketRef.current.emit('signal', socketListId, JSON.stringify({ sdp: peerConnection.localDescription }));
                    });
            }
        });
    };

    const gotMessageFromServer = (fromId, message) => {
        const signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (!connections.current[fromId]) {
                connections.current[fromId] = new RTCPeerConnection(peerConfigConnections);
            }

            const pc = connections.current[fromId];

            if (signal.sdp) {
                pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        pc.createAnswer()
                            .then((desc) => pc.setLocalDescription(desc))
                            .then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: pc.localDescription }));
                            });
                    }
                });
            }

            if (signal.ice) {
                pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(console.error);
            }
        }
    };

    const toggleVideo = () => {
        const videoTrack = window.localStream?.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };
    // handlesend
    const handleSend = () => {
        if (chatInput.trim() === "") return;

        socketRef.current.emit("chat-message", chatInput, username);
        setChatInput("");
        setIsChatOn(true);
    };


    const toggleAudio = () => {
        const audioTrack = window.localStream?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioOn(audioTrack.enabled);
        }
    };

    const toggleChat = () => {
        setIsChatOn((prev) => !prev);
        setIsChatCollapsed(false);
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                for (let id in connections.current) {
                    const sender = connections.current[id].getSenders().find((s) => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                }

                screenTrack.onended = toggleScreenShare;
                setIsScreenSharing(true);
            } else {
                const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const camTrack = camStream.getVideoTracks()[0];

                for (let id in connections.current) {
                    const sender = connections.current[id].getSenders().find((s) => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(camTrack);
                }

                setIsScreenSharing(false);
            }
        } catch (err) {
            console.error('ScreenShare error:', err);
        }
    };

    const leaveCall = () => {
        socketRef.current?.disconnect();
        window.localStream?.getTracks().forEach((track) => track.stop());
        setVideos([]);
        navigate('/');
    };

    useEffect(() => {
        if (roomId && username) {
            console.log("Joining Room:", roomId, "as", username);
            getPermission().then(connectToSocketServer);
        }

        return () => {
            socketRef.current?.disconnect();
            window.localStream?.getTracks().forEach((track) => track.stop());
        };
    }, [roomId, username]);


    // Handle incoming chat messages
    useEffect(() => {
        if (!socketRef.current) return;

        const handleIncomingMessage = (data, sender, senderId) => {
            setMessages((prevMessages) => [...prevMessages, { message: data, sender, senderId }]);
        };

        socketRef.current.on("chat-message", handleIncomingMessage);

        return () => {
            socketRef.current.off("chat-message", handleIncomingMessage);
        };
    }, [socketRef.current]); // 🔁 Re-run when socket is ready




    // Join screen
    if (!roomId || !username) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-white bg-[#1e293b] space-y-6 px-4">
                <h2 className="text-2xl font-semibold">Join a Video Room</h2>

                <TextField
                    label="Username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    variant="outlined"
                    sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
                <TextField
                    label="Room ID"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    variant="outlined"
                    sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />

                <Button
                    variant="contained"
                    disabled={!roomInput.trim() || !usernameInput.trim()}
                    onClick={() => {
                        setUsername(usernameInput.trim());
                        navigate(`/room/${roomInput.trim()}`);
                    }}
                >
                    Join Room
                </Button>

                <Button
                    variant="outlined"
                    onClick={() => {
                        const randomId = Math.random().toString(36).substring(2, 10);
                        setRoomInput(randomId);
                    }}
                >
                    Generate Random Room ID
                </Button>
            </div>
        );
    }


    return (
        <div className="w-full h-screen bg-[#1e293b] relative text-white flex flex-col md:flex-row">
            {/* Chat Sidebar */}
            {isChatOn && (
                <div
                    className={`fixed md:static top-0 left-0 bg-[#0f172a] border-r border-gray-700 flex flex-col transition-transform duration-300 ease-in-out z-40
        ${isChatCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        w-full md:w-[30%] h-full md:h-auto`}
                    style={{ maxHeight: '100vh' }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 border-b border-gray-700 flex-shrink-0">
                        <h3 className="text-lg font-semibold text-white">Chat</h3>
                        <button
                            className="md:hidden text-white text-2xl leading-none"
                            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                            aria-label="Toggle Chat"
                        >
                            {isChatCollapsed ? '▶' : '◀'}
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        id="chat-window"
                        className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                        style={{ maxHeight: 'calc(100vh - 120px)' }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`mb-3 ${msg.senderId === socketRef.current.id ? 'text-right' : 'text-left'}`}
                            >
                                <p className="text-xs text-gray-400">{msg.sender}</p>
                                <div
                                    className={`inline-block px-3 py-2 rounded-lg max-w-[80%] break-words ${msg.senderId === socketRef.current.id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
                                        }`}
                                >
                                    {msg.message}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-0.5"></p>
                            </div>
                        ))}
                        {<p className="text-sm italic text-gray-400 mt-2">He/She is typing...</p>}
                    </div>

                    {/* Chat Input */}
                    <div className="p-2 flex gap-2 border-t border-gray-700 flex-shrink-0 bg-[#1e293b] sticky bottom-0">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1 border border-gray-600 rounded px-3 py-2 bg-[#1e293b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type a message..."
                            autoComplete="off"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!chatInput.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            {/* Videos Container */}
            <div className="flex-1 relative md:ml-auto min-h-screen bg-[#0f172a]">
                {/* Remote Videos */}
                <div
                    className="absolute top-4 left-3 right-3 grid gap-4 p-2 w-full"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`,
                        placeItems: 'center',
                        maxHeight: 'calc(100vh - 220px)',
                    }}
                >
                    {videos.map((v) => (
                        <div
                            key={v.socketId}
                            className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-gray-600 hover:scale-105 transition-transform duration-300"
                        >
                            <video
                                autoPlay
                                playsInline
                                ref={(el) => {
                                    if (el && v.stream) el.srcObject = v.stream;
                                }}
                                className="w-full h-full object-cover rounded-3xl"
                            />
                        </div>
                    ))}
                </div>

                {/* Local Video */}
                <div className="absolute bottom-20 right-4 w-[45vw] max-w-[250px] aspect-video bg-black rounded-3xl overflow-hidden border border-gray-600 hover:scale-105 transition-transform duration-300">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover rounded-3xl"
                    />
                </div>

                {/* Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap gap-3 md:gap-4 bg-black bg-opacity-60 px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-lg z-20">
                    <Button onClick={toggleChat} color="inherit" size="small">
                        <ChatIcon fontSize="small" />
                    </Button>
                    <Button onClick={toggleVideo} color="inherit" size="small">
                        {isVideoOn ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
                    </Button>
                    <Button onClick={toggleAudio} color="inherit" size="small">
                        {isAudioOn ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
                    </Button>
                    <Button onClick={toggleScreenShare} color="inherit" size="small">
                        {isScreenSharing ? <StopScreenShareIcon fontSize="small" /> : <ScreenShareIcon fontSize="small" />}
                    </Button>
                    <Button color="error" onClick={leaveCall} size="small">
                        <CallEndIcon fontSize="small" />
                    </Button>
                </div>
            </div>

        </div>
    );

}

export default VideoMeet;
