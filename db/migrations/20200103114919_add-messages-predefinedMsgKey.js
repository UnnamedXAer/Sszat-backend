
exports.up = function(knex) {
	return knex.schema.table('messages', table => {
		table.string("predefinedMsgKey", 30)
	});
};

exports.down = function(knex) {
  
};
