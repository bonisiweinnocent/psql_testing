const PgPromise = require("pg-promise")
const assert = require("assert");
const fs = require("fs");
require('dotenv').config()

const pg = require("pg");
const Pool = pg.Pool;


describe('As part of the sql refresh workshop', () => {
	const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://gar:gar123@localhost:5432/garmentdb';
	const pgp = PgPromise({});
	const db = pgp(DATABASE_URL);

	// we are explicitly not using an arrow function here to support this.timeout
	before(async function () {
		this.timeout(5000);
		await db.none(`delete from garment`);
		const commandText = fs.readFileSync('./sql/data.sql', 'utf-8');
		await db.none(commandText)
	});

	it('you should create a garment table in the database', async () => {

		// use db.one
		const result = await db.one('SELECT COUNT(*) FROM garment')
		// no changes below this line in this function
		assert.ok(result.count);
	});

	it('there should be 30garments in the garment table - added using the supplied script', async () => {

		// use db.one as 1 result us expected
		const result = await db.one('SELECT COUNT(*) FROM garment')
		// no changes below this line in this function

		assert.equal(30, result.count);
	});

	it('you should be able to find all the Summer garments', async () => {
		// add some code below
		const result = await db.one('SELECT FROM garment WHERE season = "Summer"')
		// no changes below this line in this function
		assert.equal([{ description: 'Golf t-shirt', img: 'collared-128x128-455119.png', season: 'Summer', gender: 'Male', price: '79.24' },
		{ description: 'Orange dress(formal)', img: 'frock-128x128-455120.png', season: 'Summer', gender: 'Female', price: '249.99' },
		{ description: 'Yellow Shorts', img: 'mens-128x128-455127.png', season: 'Summer', gender: 'Male', price: '199.99' },
		{ description: 'Lime Vest', img: 'mens-128x128-455128.png', season: 'Summer', gender: 'Male', price: '69.99' },
		{ description: 'Short Skirt(Lime)', img: 'skirt-128x128-455130.png', season: 'Summer', gender: 'Female', price: '199.99' },
		{ description: 'Short Sleeve T-shirt', img: 't-128x128-455135.png', season: 'Summer', ge: 'Male', price: '79.25' },
		{ description: 'Vest', img: 'tank-128x128-455134.png', season: 'Summer', gender: 'Female', price: '29.99' },
		{ description: 'Orange Dress', img: 'tunic-128x128-455137.png', season: 'Summer', gender: 'Female', print: '399.99' },
		{ description: 'Lime Dress(Long)', img: 'womans-128x128-455140.png', season: 'Summer', gender: 'Female', price: '399.99' },
		{ description: 'Lime Dress(Short)', img: 'womans-128x128-455146.png', season: 'Summer', gender: 'Female', price: '599.99' },
		{ description: 'Short Sleeve Top(Red)', img: 'womans-128x128-455147.png', season: 'Summer', gender: 'Female', price: '199.99' },
		{ description: 'Beach Shorts', img: 'womens-128x128-455148.png', season: 'Summer', gender: 'Male', price: '79.99' }], result);
	});

	it('you should be able to find all the Winter garments', async () => {
		// add some code below
		const result = await db.one('SELECT FROM garment WHERE season = "Winter"')
		// no changes below this line in this function
		assert.equal([{ description: 'Red hooded jacket', img: 'hoodie-128x128-455122.png', season: 'Winter', gender: 'Male', price: '299.99' },
		{ description: 'Blue Hoodie', img: 'jacket-128x128-455123.png', season: 'Winter', gender: 'Unisex', price: '399.99' },
		{ description: 'Brown Jacket', img: 'mens-128x128-455125.png', season: 'Winter', gender: 'Male', price: '199.99' },
		{ description: 'Scarf', img: 'scarf-128x128-455138.png', season: 'Winter', gender: 'Unisex', price: '49.99' },
		{ description: 'Red Jersey', img: 'sweater-128x128-455131.png', season: 'Winter', gender: 'Male', price: '599.99' }], result);
	});

	it('you should be able to find all the Winter Male garments', async () => {
		// change the code statement below
		const result = await db.one('SELECT FROM garment WHERE gende = "Male"')
		// no changes below this line in this function
		assert.equal([{ description: 'Red hooded jacket', img: 'hoodie-128x128-455122.png', season: 'Winter', gender: 'Male', price: '299.99' },
		{ description: 'Brown Jacket', img: 'mens-128x128-455125.png', season: 'Winter', gender: 'Male', price: '199.99' },
		{ description: 'Red Jersey', img: 'sweater-128x128-455131.png', season: 'Winter', gender: 'Male', price: '599.99' }], result);
	});

	it('you should be able to change a given Male garment to a Unisex garment', async () => {

		// use db.one with an update sql statement

		const result = await db.one('UPDATE garment SET gender ="Unisex" WHERE gender = $1'[gender])
		// write your code above this line

		const gender_sql = 'select gender from garment where description = $1'
		const gender = await db.one(gender_sql, ['Red hooded jacket'], r => r.gender);
		assert.equal('Unisex', result);

	});

	it('you should be able to add 2 Male & 3 Female garments', async () => {

		// use db.none - change code below here...

		const result = await db.one('INSERT INTO garment(description,img,season,gender,price) VALUES ("Brown Jacket","placeholder.png","Winter","Male","390.00")')

		// write your code above this line

		const gender_count_sql = 'select count(*) from garment where gender = $1'
		const maleCount = await db.one(gender_count_sql, ['Male'], r => r.count);
		const femaleCount = await db.one(gender_count_sql, ['Female'], r => r.count);

		// went down 1 as the previous test is changing a male garment to a female one
		assert.equal(15, maleCount);
		assert.equal(16, femaleCount);
	});

	it('you should be group garments by gender and count them', async () => {

		// and below this line for this function will

		// write your code above this line

		const expectedResult = [
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
		]
		assert.deepStrictEqual(expectedResult, garmentsGrouped)
	});

	it('you should be able to remove all the Unisex garments', async () => {

		// and below this line for this function will
		const remove = await ('DELETE FROM garment WHERE gender = "Unisex"')
		// write your code above this line

		const gender_count_sql = 'select count(*) from garment where gender = $1'
		const unisexCount = await db.one(gender_count_sql, ['Unisex'], r => r.count);

		assert.equal(0, remove)
	});



	after(async () => {
		db.$pool.end();
	});


}).timeout(5000);