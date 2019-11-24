module.exports = class RoomModel {
	constructor(id, name, owner, createBy, createDate, members) {
		this.id = id;
		this.name = name;
		this.owner = owner;
		this.createBy = createBy;
		this.createDate = createDate;
		this.members = members;
	}
}