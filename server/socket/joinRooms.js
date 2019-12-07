const RoomController = require('../Controllers/RoomController');
const logger = require('../../logger/pino');

const joinRooms = async (socket) => {

    const { user } = socket.handshake.session;

    socket.join("public");
    const rooms = await RoomController.getByUserId(user.id);
    logger.debug("--SOCKET-- User %s (%s) is about to join to rooms: %O", user.emailAddress, user.id, rooms);

    rooms.forEach(room => {
        socket.join(room.id, err => {
            if (err) {
                logger.error("--SOCKET-- User %s (%s) could not join to room: %O, error: %O", user.emailAddress, user.id, room.id, err);
                socket.emit("room_join_error", {roomId: room.id, error: err});
            }
        });
    });
};

module.exports = joinRooms;