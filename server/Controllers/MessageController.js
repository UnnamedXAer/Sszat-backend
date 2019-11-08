const knex = require('../../db');
const logger = require('../../logger/pino');
const MessageModel = require('../Models/MessageModel');

class MessageController {
	async getByRoom (roomId) {
		try {
			const results = await knex("messages").select("*").where({ roomId });
			logger.debug("MessageController -> getByRoom -> results: %O", results);
			
			const messages = results.map(row => {
				const message = new MessageModel(
					row.id,
					row.roomId,
					row.parts,
					0, // TODO - mb query a view instead of table or add 
					// files cnt column
					row.createBy,
					row.createDate
				);
				return message;
			});

			return messages;
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

	async create(message) {
		try {
			const results = await knex("messages")
				.insert({
					roomId: message.roomId,
					parts: message.parts,
					// can be replaced with session user when auth functionality will be added.
					createBy: message.createBy
				})
				.returning("id");

			return results[0];
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

}

module.exports = new MessageController();