exports.up = function (knex) {
	return Promise.all([
		knex.schema.createTable('users', table => {
			table.increments("id").primary();
			table.string("emailAddress", 258).unique().notNullable();
			table.string("userName", 50).notNullable();
			table.string("provider", 50);
			table.datetime('joinDate', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();
			table.datetime('lastActiveOn', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();
		}),

		knex.schema.createTable("rooms", table => {
			table.increments("id").primary();
			table.string("roomName", 50);
			table.integer("owner", 50).unsigned();
			table.integer("createBy", 50).unsigned();
			table.datetime('createDate', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();

			table.foreign("owner").references("users.id");
			table.foreign("createBy").references("users.id");
		}),

		knex.schema.createTable("roomUsers", table => {
			table.increments("id").primary();
			table.integer("roomId").unsigned();
			table.integer("userId").unsigned();

			table.foreign("roomId").references("rooms.id");
			table.foreign("userId").references("users.id");
		}),

		knex.schema.createTable("messages", table => {
			table.increments("id").primary();
			table.integer("roomId").unsigned()
			table.integer("createBy").unsigned();
			table.datetime('createDate', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();
			table.json("parts");

			table.foreign("roomId").references("rooms.id");
			table.foreign("createBy").references("users.id");
		}),

		knex.schema.createTable("messageFiles", table => {
			table.increments("id").primary();
			table.integer("messageId").unsigned();
			table.string("fileName", 50).notNullable();
			table.string("fileExt", 20).notNullable();
			table.binary("fileData").notNullable();

			table.foreign("messageId").references("messages.id");
		})
	]).then(res => {
		console.log("Initial migration UP Executed ", res);
	});
};

exports.down = function (knex) {
	return schema
		.dropTable("users")
		.dropTable("rooms")
		.dropTable("roomUsers")
		.dropTable("messages")
		.dropTable("messageFiles")
			.then(res => {
				console.log("Down Executed ", res)
			})
};
