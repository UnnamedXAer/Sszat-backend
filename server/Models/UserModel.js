module.exports = class UserModel {
	constructor(id, emailAddress, userName, password, provider, joinDate, lastActiveOn) {
		this.id = id;
		this.emailAddress = emailAddress;
		this.userName = userName;
		this.password = password;
		this.provider = provider;
		this.joinDate = joinDate;
		this.lastActiveOn = lastActiveOn;
	}
}