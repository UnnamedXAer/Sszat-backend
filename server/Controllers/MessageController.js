const knex = require('../../db');
const logger = require('../../logger/pino');
const MessageModel = require('../Models/MessageModel');
const MessageFileModel = require('../Models/MessageFileModel');

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

			for (let i = 0; i < messages.length; i++) {
				const messageId = messages[i].id;
				const fileResults = await knex("messageFiles").select("*").where({
					messageId
				});
				messages[i].files = fileResults.map(row => {
					return new MessageFileModel(
						row.id,
						messageId,
						row.fileName,
						row.fileExt,
						row.fileData
					);
				});
			}

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