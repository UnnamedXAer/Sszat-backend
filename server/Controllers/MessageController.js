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
		const trxProvider = knex.transactionProvider();
		const trx = await trxProvider();
		try {
			const results = await trx("messages")
				.insert({
					roomId: message.roomId,
					parts: message.parts,
					createBy: message.createBy,
					createDate: message.createDate,
					filesCount: message.filesCount
				})
				.returning("id");

			const messageId = results[0];

			for (let i = 0; i < message.files.length; i++) {
				const file = message.files[i];

				// supposed to be send by stream etc, etc..
				const data = Buffer.from(file.data.data);
				const fileResult = await trx("messageFiles")
					.insert({
						messageId,
						fileName: file.name,
						fileExt: file.ext,
						fileData: data
					})
					.returning("id");
					file.id = fileResult[0];
			}
			trx.commit();
			return messageId;
		}
		catch (err) {
			trx.rollback(err);
			logger.error(err);
			throw err;
		}
	}

}

module.exports = new MessageController();