
exports.seed = (knex) => {
	// Deletes ALL existing entries
	return knex('users').del()
		.then(() => {
			// Inserts seed entries
			return Promise.all([
        knex('users').insert([
          {
            emailAddress: "test@test.com",
            userName: "Long John Silver",
            provider: "local"
          },
          {
            emailAddress: "rkl2@o2.pl",
            userName: "K_",
            provider: "local"
          },
          {
            emailAddress: "dean@test.com",
            userName: "Dean W",
            provider: "local"
          }
        ])
          .then(res => console.log('Done seeding users', res))
          .catch(err => console.log("Error in seeding users", err))
      ])
    })
    .catch(err => console.log(`Error seeding data: ${err}`));
};
