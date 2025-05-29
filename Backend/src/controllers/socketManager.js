import { Server } from 'socket.io';

const connections = {}; // { roomId: [socketId, ...] }
const messages = {};    // { roomId: [{ sender, data, socketId }, ...] }
const timeOnline = {};  // { socketId: timestamp }
const userInfo = {};    // { socketId: { username, roomId } }

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'https://video-meet-frontend-2grn.onrender.com', // ⚠️ Replace with your frontend URL in production
            methods: ['GET', 'POST'],
            allowedHeaders: ["*"],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`✅ Socket connected: ${socket.id}`);
        timeOnline[socket.id] = Date.now();

        // === JOIN ROOM ===
        socket.on("join-call", (roomId, username) => {
            if (!connections[roomId]) connections[roomId] = [];

            if (!connections[roomId].includes(socket.id)) {
                connections[roomId].push(socket.id);
            }

            userInfo[socket.id] = { username, roomId };
            socket.join(roomId);

            console.log(`📥 Socket ${socket.id} (${username}) joined room: ${roomId}`);

            // Send to newly joined user: list of existing users
            const otherUsers = connections[roomId].filter(id => id !== socket.id);
            socket.emit("user-joined", socket.id, otherUsers);

            // Send to existing users: info about the new user
            socket.to(roomId).emit("user-joined", socket.id, [socket.id]);

            // Send chat history (if any) to the newly joined user
            if (messages[roomId]) {
                messages[roomId].forEach((msg) => {
                    socket.emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"]);
                });
            }
        });

        // === SIGNAL (WebRTC signaling message) ===
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // === CHAT MESSAGE ===
        socket.on("chat-message", (data, sender) => {
            const roomId = userInfo[socket.id]?.roomId;
            if (!roomId) return;

            if (!messages[roomId]) messages[roomId] = [];

            const msgObj = {
                sender,
                data,
                "socket-id-sender": socket.id,
            };

            messages[roomId].push(msgObj);
            console.log(`💬 Message in ${roomId} from ${sender}: ${data}`);

            // Broadcast to all in the room
            connections[roomId].forEach((id) => {
                io.to(id).emit("chat-message", data, sender, socket.id);
            });
        });

        // === DISCONNECT ===
        socket.on("disconnect", () => {
            const onlineTime = Date.now() - (timeOnline[socket.id] || Date.now());
            console.log(`❌ Socket disconnected: ${socket.id}, online time: ${onlineTime}ms`);

            delete timeOnline[socket.id];

            const roomId = userInfo[socket.id]?.roomId;
            delete userInfo[socket.id];

            if (roomId && connections[roomId]) {
                connections[roomId] = connections[roomId].filter((id) => id !== socket.id);

                // Notify remaining users in the room
                connections[roomId].forEach((id) => {
                    io.to(id).emit("user-left", socket.id);
                });

                // Clean up if room is empty
                if (connections[roomId].length === 0) {
                    delete connections[roomId];
                    delete messages[roomId];
                }
            }
        });
    });
};

export default connectToSocket;
