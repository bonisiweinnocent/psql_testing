const PgPromise = require("pg-promise")
const assert = require("assert");
const fs = require("fs");
require('dotenv').config()

const pg = require("pg");
const Pool = pg.Pool;


describe('As part of the sql refresh workshop', () => {
	console.log('---------------------------------');
	const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://gary:gar123@localhost:5432/garment_app';
	// console.log(DATABASE_URL);
	const pgp = PgPromise({});
	const db = pgp(DATABASE_URL);

	// we are explicitly not using an arrow function here to support this.timeout
	before(async function () {
		this.timeout(5000);
		await db.none(`delete from garment`);
		const commandText = fs.readFileSync('./sql/data.sql', 'utf-8');
		await db.none(commandText);
	});

	it('you should create a garment table in the database', async () => {

		// use db.one
		const result = await db.one('SELECT COUNT(*) FROM garment');
		// no changes below this line in this function
		assert.ok(result.count);
	});

	it('there should be 30garments in the garment table - added using the supplied script', async () => {

		// use db.one as 1 result us expected
		const result = await db.one('SELECT COUNT(*) FROM garment');
		// no changes below this line in this function

		assert.equal(30, result.count);
	});

	it('you should be able to find all the Summer garments', async () => {
		// add some code below
		const result = await db.one('SELECT  count(*) FROM garment WHERE season = $1', ['Summer']);

		// no changes below this line in this function
		assert.equal(12, result.count);
	});

	it('you should be able to find all the Winter garments', async () => {
		// add some code below
		const result = await db.one('SELECT count(*) FROM garment WHERE season =  $1', ["Winter"]);
		// no changes below this line in this function
		assert.equal(5, result.count);
	});

	it('you should be able to find all the Winter Male garments', async () => {
		// change the code statement below
		const result = await db.one('SELECT count(*) FROM garment WHERE gender = $1 and season = $2', ["Male", "Winter"]);
		// no changes below this line in this function
		assert.equal(3, result.count);
	});

	it('you should be able to change a given Male garment to a Unisex garment', async () => {

		// use db.one with an update sql statement

		const result = await db.none(`update garment set gender = $1 where gender = $2 and description = $3`, ['Unisex', 'Male', 'Red hooded jacket']);
		// write your code above this line

		const gender_sql = 'select gender from garment where description = $1';
		const gender = await db.one(gender_sql, ['Red hooded jacket'], r => r.gender);
		assert.equal('Unisex', gender);

	});

	it('you should be able to add 2 Male & 3 Female garments', async () => {

		// use db.none - change code below here...

		const add = await db.none(`INSERT INTO garment(description,img,season,gender,price) VALUES ('Brown Jacket','placeholder.png','Winter','Male','390.00')`);
		const add1 = await db.none(`INSERT INTO garment(description,img,season,gender,price) VALUES ('Brown Jean','placeholder.png','Summer','Male','90.00')`);
		const add2 = await db.none(`INSERT INTO garment(description,img,season,gender,price) VALUES ('Shirt','placeholder.png','Winter','Female','190.00')`);
		const add3 = await db.none(`INSERT INTO garment(description,img,season,gender,price) VALUES ('Blouse','placeholder.png','Winter','Female','10.00')`);
		const add4 = await db.none(`INSERT INTO garment(description,img,season,gender,price) VALUES ('One arm top','placeholder.png','Summer','Female','270.00')`);

		// write your code above this line

		const gender_count_sql = 'select count(*) from garment where gender = $1'
		const maleCount = await db.one(gender_count_sql, ['Male'], r => r.count);
		const femaleCount = await db.one(gender_count_sql, ['Female'], r => r.count);

		// went down 1 as the previous test is changing a male garment to a female one
		assert.equal(15, maleCount);
		assert.equal(16, femaleCount);
	});

	it('you should be able to group garments by gender and count them', async () => {

		// and below this line for this function will
	
		const result = await db.many(`select count(*),gender from garment group by gender`)
		
		// write your code above this line
console.log(result+ 'hhhhhhhhhhhh');
		assert.deepStrictEqual([
			{
				count: '15',
				gender: 'Male'
			},
			{
				count: '16',
				gender: 'Female'
			},
			{
				count: '4',
				gender: 'Unisex'
			}
		], result.count)
	});

	it('you should be able to remove all the Unisex garments', async () => {

		// and below this line for this function will
		const remove = await db.none (`DELETE FROM garment WHERE gender = $1`,['Unisex'])
		// write your code above this line

		const gender_count_sql = 'select count(*) from garment where gender = $1'
		const unisexCount = await db.one(gender_count_sql, ['Unisex'], r => r.count);

		assert.equal(0, unisexCount)
	});



	after(async () => {
		db.$pool.end();
	});


}).timeout(5000);