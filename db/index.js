const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);



// database.raw("select version()")
// 	.then((results) => {
// 		// console.log((results.rows[0].version))
// 	})
// 	.catch((err) => {
// 		console.log(err);
// 		throw err
// 	})
// 	.finally(() => {
// 		// database.destroy();
// 	});

module.exports = database;