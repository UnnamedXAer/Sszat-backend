const knex = require('../../db');
const logger = require('../../logger/pino');
const UserModel = require('../Models/UserModel')

class UserController {
	async getAll() {
		logger.debug("UserController -> getAll");
		try {
			const results = await knex("users").select("*");
			return (results.map(row => {
				const user = new UserModel(row.id, row.emailAddress, row.userName, row.provider, row.joinDate, row.lastActiveOn);
				return user;
			}));
		}
		catch (err) {
			logger.error(err);
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
			return new UserModel(
				row.id, 
				row.emailAddress, 
				row.userName, 
				row.provider, 
				row.joinDate, 
				row.lastActiveOn
			);
		} catch (err) {
			logger.error(err);
		}
		// return (await this.getAll()).find(user => user.id == id);
	}

	async create(user) {

		try {
			const results = await knex("users").insert({
				"emailAddress": "test_create@test.com",
				"userName": "LJ Silver",
				"provider": "local"
				// "joinDate": "2019-11-06T09:32:18.418Z",
				// "lastActiveOn": "2019-11-06T09:32:18.418Z"
			}).returning("id");
			return results[0];
		}
		catch (err) {
			logger.error(err);
		}
	}

	async update(user) {
		try {
			const results = await knex("users").insert({
				"emailAddress": "test_create@test.com",
				"userName": "LJ Silver",
				"provider": "local"
				// "joinDate": "2019-11-06T09:32:18.418Z",
				// "lastActiveOn": "2019-11-06T09:32:18.418Z"
			}).returning("id");
			return results[0];
		}
		catch (err) {
			logger.error(err);
		}
	}
}

module.exports = new UserController();