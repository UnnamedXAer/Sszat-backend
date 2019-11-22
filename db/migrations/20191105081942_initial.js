exports.up = function (knex) {
	return Promise.all([
		knex.schema.createTable('users', table => {
			table.increments("id").primary();
			table.string("emailAddress", 258).unique().notNullable();
			table.string("userName", 50).notNullable();
			table.string("password", 256).notNullable();
			table.string("provider", 50).notNullable();
			table.datetime('joinDate', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();
			table.datetime('lastActiveOn', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();
			table.boolean("isAdmin").defaultTo(false);
		}),

		knex.schema.createTable("rooms", table => {
			table.increments("id").primary();
			table.string("roomName", 50).notNullable();
			table.integer("owner", 50).unsigned().notNullable();
			table.integer("createBy", 50).unsigned().notNullable();
			table.datetime('createDate', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();
			
			table.foreign("owner").references("users.id");
			table.foreign("createBy").references("users.id");
		}),

		knex.schema.createTable("roomUsers", table => {
			table.increments("id").primary();
			table.integer("roomId").unsigned().notNullable();
			table.integer("userId").unsigned().notNullable();

			table.foreign("roomId").references("rooms.id");
			table.foreign("userId").references("users.id");
		}),

		knex.schema.createTable("messages", table => {
			table.increments("id").primary();
			table.integer("roomId").unsigned().notNullable();
			table.integer("createBy").unsigned().notNullable();
			table.datetime('createDate', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();
			table.json("parts").notNullable();

			table.foreign("roomId").references("rooms.id");
			table.foreign("createBy").references("users.id");
		}),

		knex.schema.createTable("messageFiles", table => {
			table.increments("id").primary();
			table.integer("messageId").unsigned().notNullable();
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
	return Promise.all([
		knex.schema.dropTable("messageFiles"),
		knex.schema.dropTable("messages"),
		knex.schema.dropTable("roomUsers"),
		knex.schema.dropTable("rooms"),
		knex.schema.dropTable("users")
	]).then(res => {
			console.log("Down Executed ", res)
		});
};
