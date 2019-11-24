
exports.up = function(knex) {
    return knex.schema.table('messages', table => {
        table.integer("filesCount").unsigned().notNullable()
    });
};

exports.down = function(knex) {
  
};
