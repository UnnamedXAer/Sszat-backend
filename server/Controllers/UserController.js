'use-strict';
const knex = require('../../db');
const logger = require('../../logger/pino');
const UserModel = require('../Models/UserModel');

class UserController {
	async getAll() {
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

	async getByEmailAddress(emailAddress) {
		try {
			const results = await knex("users").select("*").where(
				knex.raw('LOWER("emailAddress") = :emailAddress', {
					emailAddress: emailAddress.toLowerCase()
				})
			);
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

	async getById(id) {
		try {
			const results = await knex("users").select("*").where({ id });
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
					userName: user.userName,
					password: user.password,
					provider: user.provider
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
				.update({ ...user, password: undefined })
				.returning("id");

			return results[0];
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}
}

module.exports = new UserController();