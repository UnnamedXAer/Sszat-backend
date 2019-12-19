const logger = require('../../../logger/pino');
const RoomController = require('../../Controllers/RoomController');
const RoomModel = require('../../Models/RoomModel');

const listeners = {
    "ROOM_NEW": async (data, socket, io) => {
        const loggedUserId = socket.handshake.session.user.id;
        logger.info(`-----SOCKET----- on ROOM_NEW, %O \n session.user: %s (%s)`, 
            data,
            socket.handshake.session.user.userName,
            socket.handshake.session.user.id
        );

        const {
            name,
            owner,
            createBy,
            members
        } = data.room;

        const checkIfUnique = arr => {
            const obj = {};
            arr.forEach(x => {
                obj[x] = true;
            });
    
            return arr.length === Object.keys(obj).length;
        };

        if (!(name && name.trim().length > 2 && name.length <= 50
        && members && typeof members == "object" && members.length > 1
        && members.includes(loggedUserId) && checkIfUnique(members)
        && owner && createBy
        && owner === createBy && createBy === loggedUserId)) {
            logger.debug("-----SOCKET----- on ROOM_NEW [Invalid input] %O", data);
            return socket.emit("ROOM_NEW_FAIL", {
                payload: {
                    error: "Invalid input."
                }
            });
        }

        const room = new RoomModel(
            undefined,
            name,
            loggedUserId, // use session for create
            loggedUserId, // use session
            new Date().toUTCString(),
            members
        );

        try {
            const roomId = await RoomController.create(room);
            logger.debug("-----SOCKET----- ROOM_NEW new room Id: %s", roomId);
            room.id = roomId;

            const payload = {
                type: data.type,
                payload: {
                    room,
                }
            };

            socket.emit("ROOM_NEW_FINISH", payload);
            socket.join(roomId);

            members.forEach(member => {
                const memberSocketId = io.clientsMap[member];
                const connectedSocket = io.sockets.connected[memberSocketId];
                if (connectedSocket) {
                    connectedSocket.join(roomId);
                }
            });

            // add other users to this room;
            socket.to(roomId).emit("ROOM_NEW", payload);
        }
        catch (err) {
            logger.error("-----SOCKET----- on ROOM_NEW err: %O", err);

            return socket.emit("ROOM_NEW_FAIL", {
                payload: { error: err.message }
            });
		}
    },

    "ROOM_DELETE": async (data, socket, io) => {
        const loggedUserId = socket.handshake.session.user.id;
        logger.info("-----SOCKET----- ROOM_DELETE delete room Id: %s, loggedUserId: %s", data, loggedUserId);
        const { id } = data;
        if ((+id !== parseInt(id, 10))) {
            logger.debug("-----SOCKET----- on ROOM_DELETE [Invalid input] %O", data);
            return socket.emit("ROOM_DELETE_FAIL", {
                payload: {
                    error: "Invalid input."
                }
            });
        }

        try {
            const room = await RoomController.getById(id);
            if (room.owner !== loggedUserId) {
                logger.debug("-----SOCKET----- on ROOM_DELETE [Invalid input] %O", data);
                return socket.emit("ROOM_DELETE_FAIL", {
                    payload: {
                        error: "Invalid input."
                    }
                });
            }

            const removedRoomId = await RoomController.delete(id)
            logger.info("-----SOCKET----- on ROOM_DELETE - deleted from DB: %s", removedRoomId);

            io.of('/').in(id).clients((err, socketIds) => {
                if (err) {
                    logger.error("-----SOCKET----- on ROOM_DELETE err: %O", err);

                    socket.emit("ROOM_DELETE_FAIL", {
                        payload: { error: err.message }
                    });
                }
                logger.debug("-----SOCKET----- ROOM_DELETE room Id: %s, sockets: %o", id, socketIds);

                const payload = {
                    type: data.type,
                    payload: {
                        roomId: removedRoomId
                    }
                };
    
                socket.to(id).emit("ROOM_DELETE", payload);
                socket.emit("ROOM_DELETE_FINISH", payload);

                socketIds.forEach(socketId => {
                    io.sockets.sockets[socketId].leave(id)
                });
            });
        }
        catch (err) {
            logger.error("-----SOCKET----- on ROOM_DELETE err: %O", err);

            socket.emit("ROOM_DELETE_FAIL", {
                payload: { error: err.message }
            });
        }
    },

    "ROOM_LEAVE": async (data, socket, io) => {
        const loggedUserId = socket.handshake.session.user.id;
        logger.info("-----SOCKET----- ROOM_LEAVE Leave room data: %o, loggedUserId: %s", data, loggedUserId);
        const { id } = data;

        const roomId = +id;
        if (roomId !== id) {
            logger.debug("-----SOCKET----- on ROOM_LEAVE [Invalid input] %O", data);
            return socket.emit("ROOM_LEAVE_FAIL", {
                payload: {
                    error: "Invalid input."
                }
            });
        }

        try {
            const removedRecordId = await RoomController.deleteMember(roomId, loggedUserId);
            logger.info("-----SOCKET----- on ROOM_LEAVE - room Id: %s, removed roomUsers.Id: %s", roomId, removedRecordId);

            const payload = {
                type: data.type,
                payload: {
                    roomId,
                    userId: loggedUserId
                }
            };

            socket.to(roomId).emit("ROOM_LEAVE", payload);
            socket.emit("ROOM_LEAVE_FINISH", payload);
            socket.leave(roomId);
        }
        catch (err) { 
            logger.error("-----SOCKET----- on ROOM_LEAVE err: %O", err);

            socket.emit("ROOM_LEAVE_FAIL", {
                payload: { error: err.message }
            });
        }
    },

    "ROOM_KICK_USER": async (data, socket, io) => {
        const loggedUserId = socket.handshake.session.user.id;
        logger.info("-----SOCKET----- ROOM_KICK_USER Kick user from room. data: %o, loggedUserId: %s", data, loggedUserId);
        const { roomId, userId } = data;

        if ((+userId !==  parseInt(userId, 10)) || (+roomId !== parseInt(roomId, 10))) {
            logger.debug("-----SOCKET----- on ROOM_KICK_USER [Invalid input.] %O", data);
            return socket.emit("ROOM_LEAVE_FAIL", {
                payload: {
                    error: "Invalid input."
                }
            });
        }

        try {
            const room = await RoomController.getById(roomId);
            if (room.owner !== loggedUserId) {
                logger.debug("-----SOCKET----- on ROOM_KICK_USER [Un-authorized] %O", data);
                return socket.emit("ROOM_KICK_USER_FAIL", {
                    payload: {
                        error: "Un-authorized"
                    }
                });
            }

            if (room.owner === userId) {
                logger.debug("-----SOCKET----- on ROOM_KICK_USER [Cannot Kick Owner] %O", data);
                return socket.emit("ROOM_KICK_USER_FAIL", {
                    payload: {
                        error: "Can not kick the room owner"
                    }
                });
            }

            const removedRecordId = await RoomController.deleteMember(roomId, userId);
            logger.debug("-----SOCKET----- on ROOM_KICK_USER - room Id: %s, removed roomUsers.Id: %s", roomId, removedRecordId);

            const payload = {
                type: data.type,
                payload: {
                    roomId,
                    userId
                }
            };

            const kickedUserSocketId = io.clientsMap[userId];
            if (kickedUserSocketId) {
                // otherwise means that user is not online
                io.sockets.sockets[kickedUserSocketId].leave(roomId);
                const KickedUserMessagePayload = {
                    type: data.type,
                    payload: {
                        roomId,
                        customInfo: `You have been kicked from room ${room.name}`
                    }
                };
                io.sockets.sockets[kickedUserSocketId].emit("ROOM_DELETE", KickedUserMessagePayload);
            }

            socket.emit("ROOM_LEAVE", payload);
            socket.to(roomId).emit("ROOM_LEAVE", payload);
        }
        catch (err) {
            logger.error("-----SOCKET----- on ROOM_KICK_USER err: %O", err);
            socket.emit("ROOM_KICK_USER_FAIL", {
                payload: { error: err.message }
            });
        }
    }
};

module.exports = listeners;