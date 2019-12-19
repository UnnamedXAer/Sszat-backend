module.exports = function ensureClientIsAuthenticated(socket, next) {
	var { session } = socket.handshake;

	const isAuthorized = !!(session && session.user && session.user.id);
	console.log('-----SOCKET----- isAuthorized: ', isAuthorized)
	if (!isAuthorized) {
		next(new Error('not authorized'));
	}

	next();
}