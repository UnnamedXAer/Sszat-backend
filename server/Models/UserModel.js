module.exports = class UserModel {
	constructor(id, emailAddress, userName, provider, joinDate, lastActiveOn) {
		this.id = id;
		this.emailAddress = emailAddress;
		this.userName = userName;
		this.provider = provider;
		this.joinDate = joinDate;
		this.lastActiveOn = lastActiveOn;
	}
}