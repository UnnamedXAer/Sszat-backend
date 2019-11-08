module.exports = class MessageModel {
	constructor(id, roomId, parts, messageFileCount, createBy, createDate) {
		this.id = id;
		this.roomId = roomId;
		this.parts = parts;
		this.messageFileCount = messageFileCount;
		this.createBy = createBy;
		this.createDate = createDate;
	}
}