module.exports = class MessageFileModel {
	constructor(id, messageId, fileName, fileExt, fileData) {
		console.time('object');
		this.id = id;
		this.messageId = messageId;
		this.fileName = fileName;
		this.fileExt = fileExt;
		this.fileData = fileData;
		this.createBy = createBy;
		this.createDate = createDate;
	}
}