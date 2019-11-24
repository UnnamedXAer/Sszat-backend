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
					row.filesCount,
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
					createBy: message.createBy,
					createDate: message.createDate,
					filesCount: message.filesCount
				})
				.returning("id");

				// todo inser files

			return results[0];
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

}

module.exports = new MessageController();