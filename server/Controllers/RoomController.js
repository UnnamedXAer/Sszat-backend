const knex = require('../../db');
const logger = require('../../logger/pino');
const RoomModel = require('../Models/RoomModel');

class RoomController {
	async getAll() {
		logger.debug("RoomController -> getAll");
		try {
			const results = await knex("rooms").select("*");
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
		try {
			const results = await knex("rooms")
				.insert({
					roomName: room.roomName,
					owner: room.owner,
					// can be replaced with session user when auth functionality will be added.
					createBy: room.createBy 
				})
				.returning("id");

			return results[0];
		}
		catch (err) {
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