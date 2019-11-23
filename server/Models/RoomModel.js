module.exports = class RoomModel {
	constructor(id, roomName, owner, createBy, createDate, members) {
		this.id = id;
		this.roomName = roomName;
		this.owner = owner;
		this.createBy = createBy;
		this.createDate = createDate;
		this.members = members;
	}
}