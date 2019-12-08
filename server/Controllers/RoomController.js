const knex = require('../../db');
const logger = require('../../logger/pino');
const RoomModel = require('../Models/RoomModel');

class RoomController {
	async getByUserId(loggedUserId) {
		logger.debug("RoomController -> getByUserId for logged User %s", loggedUserId);
		try {
			const results = await knex("rooms").join("roomUsers", "rooms.id", "=", "roomUsers.roomId").select("rooms.*").where({
				userId: loggedUserId
			});

			const rooms = [];
			for (let i = 0; i < results.length; i++) {
				const row = results[i];

				// todo return members from previos query.
				const members = await knex("roomUsers").select("userId").where({
					roomId: row.id
				});

				rooms.push(new RoomModel(
					row.id, 
					row.roomName, 
					row.owner, 
					row.createBy, 
					row.createDate,
					members.map(x => x.userId)
				));
			}
			return rooms;
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

	async getById(id) {
		try {
			const results = await knex("rooms").select("*").where({ id });
			logger.debug("RoomController -> getById -> results: %O", results);
			const row = results[0];
			if (!row) {
				return null;
			}

			const members = await knex("roomUsers").select("userId").where({
				roomId: row.id
			});

			const room = new RoomModel(
				row.id,
				row.roomName,
				row.owner,
				row.createBy,
				row.createDate,
				members.map(x => x.userId)
			);

			return room;
		} 
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

	async create(room) {

		const trxProvider = knex.transactionProvider();
		// start transaction
		const trx = await trxProvider();
		try {
			const roomIds = await trx('rooms')
				.insert({
					roomName: room.name,
					owner: room.owner,
					createBy: room.createBy,
					createDate: room.createDate
				}, "id");

			const roomId = roomIds[0];

			const memersData = room.members.map(member => {
				return {
					roomId,
					userId: member
				};
			});

			await trx("roomUsers")
			.insert(memersData, "id");

			trx.commit();

			return roomId;
		}
		catch (err) {
			trx.rollback(err);
			logger.error(err);
			throw err;
		}
	}

	async update(room) {

		const roomId = room.id;
		room.id = undefined;
		try {
			const results = await knex("rooms")
				.update({ 
					roomName: room.name,
					owner: room.owner
				})
				.where({ id: roomId })
				.returning("id");
			return results[0];
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}

	async delete(id) {
		const trxProvider = knex.transactionProvider();
		const trx = await trxProvider();
		try {

			await trx("messageFiles")
				.delete()
				.whereIn(
					"messageId", 
					knex("messages").select("id").where({ roomId: id })
				);

			await trx("messages")
				.delete()
				.where({ roomId: id });

			await trx("roomUsers")
				.delete()
				.where({ roomId: id });

			const results = await trx("rooms")
				.delete()
				.where({ id })
				.returning("id");

			trx.commit();
			return results[0];
		} 
		catch (err) {
			trx.rollback(err);
			logger.error(err);
			throw err;
		}
	}

	async deleteMember(roomId, userId) {
		try {
			const results = await knex("roomUsers")
				.delete().where({
				roomId,
				userId
			})
			.returning("id");
			return results[0];
		}
		catch (err) {
			logger.error(err);
			throw err;
		}
	}
};

module.exports = new RoomController();