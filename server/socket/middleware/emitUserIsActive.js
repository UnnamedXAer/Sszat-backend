const SKIPPED_MESSAGES = [
	"USER_OFFLINE"
];

module.exports = function emitUserIsActive (socket, next) {
	
	if (SKIPPED_MESSAGES.includes("TODO-HERE"))
	socket.broadcast.emit("USER_ACTIVE", {
		userId: socket.handshake.session.user.id
	});
	return next();
}