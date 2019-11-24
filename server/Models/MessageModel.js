module.exports = class MessageModel {
	constructor(id, roomId, parts, filesCount, createBy, createDate, files) {
		this.id = id;
		this.roomId = roomId;
		this.parts = parts;
		this.filesCount = filesCount;
		this.createBy = createBy;
		this.createDate = createDate;
		this.files = files;
	}
}