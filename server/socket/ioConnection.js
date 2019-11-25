

export const ioConnectionCallback = socket => {
	logger.debug("New client connected");
	console.log("New client connected, socket.id = ", socket.id);
	socket.emit("FromAPI", { empty: true })

	socket.on("disconnect", () => {
		logger.debug("Client disconnected");
		console.log("Client disconnected");
	});
}