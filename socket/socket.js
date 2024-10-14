const socketIo = require('socket.io');
const moment = require("moment");

let io;

socketUsers = {}

const initSocket = (server) => {

  io = socketIo(server, {
    cors: {
      origin: 'http://192.168.142.179:5173 https://188.166.153.100',
      // origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {

    socket.on('login-user', async (userId) => {
      if (socketUsers[userId]) {
        console.log("This user already login to our platform!");
      }
      else {
        socket.join(userId);
        socketUsers[userId] = socket.id;
        console.log(socketUsers);
        const myDate = new Date();
        const formattedDate = myDate.toISOString();
        const message = 'You logined to our server! ' + moment(formattedDate).format("YYYY/MM/DD hh:mm:ss A");
        io.to(userId).emit('notification', { message: message, time: formattedDate, read: false, receiver_id: userId, type: "login" });
        console.log("-----------> user login " + userId);
      }
    });

    socket.on('disconnect', () => {
      console.log("disconnect", socketUsers);
      for (const userId in socketUsers) {
        if (socketUsers[userId] === socket.id) {
          console.log("----------> ", userId, " disconnected");
          delete socketUsers[userId]; // Remove the user from tracking
          break;
        }
      }
    });
  });
}

const getSocketInstance = () => {
  if (!io) {
      throw new Error("Socket not initialized!");
  }
  return io;
};

module.exports = { initSocket, getSocketInstance, socketUsers };