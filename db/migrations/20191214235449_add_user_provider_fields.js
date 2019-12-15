
exports.up = function(knex) {
  return Promise.all([
        knex.schema.table("users", table => {
            table.string("displayName", 50);
            table.string("providerId", 50);
            table.string("avatarUrl", 1000);
            table.string("userPageUrl", 1000);
            table.string("accessToken", 100);
            table.string("refreshToken", 100);
        }),

        knex.schema.alterTable("users", table => {
            table.string("password", 256).nullable().alter();
        })
    ]);
};

exports.down = function(knex) {
  
};
