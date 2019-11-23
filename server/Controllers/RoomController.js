const knex = require('../../db');
const logger = require('../../logger/pino');
const RoomModel = require('../Models/RoomModel');

class RoomController {
	async getAll(loggedUserId) {
		logger.debug("RoomController -> getAll for logged User %s", loggedUserId);
		try {
			const results = await knex("rooms").join("roomUsers", "rooms.id", "=", "roomUsers.roomId").select("rooms.*").where({
				userId: loggedUserId
			});
			const rooms = results.map(row => {
				const room = new RoomModel(
					row.id, 
					row.roomName, 
					row.owner, 
					row.createBy, 
					row.createDate
				);
				return room;
			});

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
			const room = new RoomModel(
				row.id,
				row.roomName,
				row.owner,
				row.createBy,
				row.createDate
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
					roomName: room.roomName,
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
				.update({ ...room })
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
		try {
			const results = await knex("rooms")
				.delete()
				.where({ id })
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