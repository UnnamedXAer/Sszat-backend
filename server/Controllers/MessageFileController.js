const knex = require('../../db');
const logger = require('../../logger/pino');
const MessageFileModel = require('../Models/MessageFileModel');

class MessageFileController {
	async getByMessage(messageId) {
		try {
			const results = await knex("messageFiles").select("*").where({ messageId });
			logger.debug("MessageFileController -> getByMessage -> results: %O", results);

			const messageFiles = results.map(row => {
				const messageFile = new MessageFileModel(
					row.id,
					row.messageId,
					row.fileName,
					row.fileExt,
					row.fileData,
					row.createBy,
					row.createDate
				);
				return messageFile;
			});

			return messageFiles;
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}
}

module.exports = new MessageFileController();