const logger = require('../../../logger/pino');
const RoomController = require('../../Controllers/RoomController');
const RoomModel = require('../../Models/RoomModel');

const listeners = {
    "ROOM_NEW": async (data, socket, io, clients) => {
        const loggedUserId = socket.handshake.session.user.id;
        logger.debug(`-----SOCKET----- on ROOM_NEW, %O \n session.user: %s (%s)`, 
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
                const connectedSocet = io.sockets.connected[memberSocketId];
                if (connectedSocet) {
                    connectedSocet.join(roomId);
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
    }
};

module.exports = listeners;