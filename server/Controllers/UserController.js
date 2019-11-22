'use-strict';
const config = require('config');
const jwt = require('jsonwebtoken');
const knex = require('../../db');
const logger = require('../../logger/pino');
const UserModel = require('../Models/UserModel');

class UserController {
	async getAll() {
		logger.debug("UserController -> getAll");
		try {
			const results = await knex("users").select("*");
			const users = results.map(row => {
				const user = new UserModel(
					row.id, 
					row.emailAddress, 
					row.userName, 
					undefined,
					row.provider, 
					row.joinDate, 
					row.lastActiveOn
				);
				return user;
			});

			return users;
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

	async getById(id) {
		try {
			const results = await knex("users").select("*").where({ id });
			logger.debug("getById -> results: %O", results);
			const row = results[0];
			if (!row) {
				return null;
			}
			const user = new UserModel(
				row.id,
				row.emailAddress,
				row.userName,
				undefined,
				row.provider,
				row.joinDate,
				row.lastActiveOn,
				row.isAdmin
			);

			return user;
		} 
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

	async getByEmailAddress(emailAddress) {
		try {
			const results = await knex("users").select("*").where({ emailAddress });
			logger.debug("getByEmailAddress -> results: %O", results);
			const row = results[0];
			if (!row) {
				return null;
			}
			const user = new UserModel(
				row.id,
				row.emailAddress,
				row.userName,
				row.password,
				row.provider,
				row.joinDate,
				row.lastActiveOn
			);

			return user;
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

	async create(user) {
		try {
			const results = await knex("users")
				.insert({
					emailAddress: user.emailAddress,
					provider: user.provider,
					userName: user.userName,
					password: user.password
					// todo insert create date and other times from api.
				})
				.returning("id");

			return results[0];
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

	async update(user) {

		const userId = user.id;
		user.id = undefined;

		try {
			const results = await knex("users").where({ id: userId })
				// .update({
				// 	emailAddress: user.emailAddress,
				// 	provider: user.provider,
				// 	userName: user.userName,
				// 	lastActiveOn: user.lastActiveOn
				// })
				.update({ ...user })
				.returning("id");

			return results[0];
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

	//custom method to generate authToken 
	generateAuthToken = function (user) {
		const token = jwt.sign({ 
			id: user.id, 
			isAdmin: user.isAdmin 
		}, config.get('myprivatekey')); //get the private key from the config file -> environment variable
		return token;
	}
}

module.exports = new UserController();