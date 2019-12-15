module.exports = class UserModel {
	constructor(id, 
		emailAddress, 
		userName, 
		password, 
		provider, 
		joinDate, 
		lastActiveOn, 
		displayName,
		providerId, 
		avatarUrl,
		userPageUrl,
		accessToken,
		refreshToken) {
		this.id = id;
		this.emailAddress = emailAddress;
		this.userName = userName;
		this.password = password;
		this.provider = provider;
		this.joinDate = joinDate;
		this.lastActiveOn = lastActiveOn;
		this.displayName = displayName;
		this.providerId = providerId,
		this.avatarUrl = avatarUrl,
		this.userPageUrl = userPageUrl
		this.accessToken = accessToken,
		this.refreshToken = refreshToken;
	}
}