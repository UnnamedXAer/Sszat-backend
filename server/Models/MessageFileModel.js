module.exports = class MessageFileModel {
	constructor(id, messageId, fileName, fileExt, fileData) {
		this.id = id;
		this.messageId = messageId;
		this.name = fileName;
		this.ext = fileExt;
		this.data = fileData;
	}
}