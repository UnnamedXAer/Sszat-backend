

module.exports = {

  development: {
    client: 'pg',
    version: "9.6",
    // connection: "postgres://localhost:5432/sszat_database_tmp",
    connection: {
      user: 'postgres',
      host: 'localhost',
      password: 'pcpostgrespassword',
      database: 'sszat_database_tmp'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: `migrations`,
      directory: `${__dirname}/db/migrations`
    },
    seeds: {
      directory: './db/seeds/dev'
    },
    useNullAsDefault: true
  },

  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }

};
