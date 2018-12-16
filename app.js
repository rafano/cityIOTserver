// imported functions
const http = require('http');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');

// imported classses
const Joi = require('joi');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// get requests 
app.get('/devices', (req,res) => {
	console.log('new GET request: /devices');
	console.log('query:' + JSON.stringify(req.query));

	const schema = Joi.object().keys({
		locationLatitude: Joi.number().min(-90).max(90),
		locationLongitude: Joi.number().min(-180).max(180),
		distanceLimit: Joi.number().integer().min(0).max(50),
	});
	const result = Joi.validate(req.query, schema);
	if(result.error) {
		res.status(401).send("Bad query params: " + result.error.details[0].message);	
	}

	// else find devices within range
	// get all devices, make math on distance, return object
	// find devices
	let sql = `SELECT DISTINCT id id,
	Name name, status status, longitude longitude, 
	latitude latitude, last_update last_update,
	battery battery FROM devices
	ORDER BY id`;

	var returnArray = new Array();
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		rows.forEach((row) => {
			var obj = new Object();
			obj.id = row.id;
			obj.name = row.name; 
			obj.status = row.status;
			var cords = new Object();
			cords.longitude = row.longitude; 
			cords.latitude = row.latitude;
			obj.coordinate = cords;
			obj.last_update = row.last_update;
			obj.battery = row.battery;
			console.log(JSON.stringify(obj))
			returnArray.push(obj);
		});
		if (returnArray.length > 0) {
			res.status(200).send(returnArray);
		}
		else {
			res.status(403).send("No devices found");
		}
	});
});


app.get('/device/:id', (req,res) => {
	console.log('new GET request: /device/:' + req.params.id);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message);	
	}
	// Database Query
	let sql2 = `SELECT id id,
	Name name, status status, longitude longitude, 
	latitude latitude, last_update last_update,
	battery battery
	FROM devices
	WHERE id  = ?`;
	db.get(sql2, [req.params.id], (err, row) => {
		if (err) {
			return console.error(err.message);
		}
		if(row) {
			var obj = new Object();
			obj.id = row.id;
			obj.name = row.name 
			obj.status = row.status;
			var cords = new Object();
			cords.longitude = row.longitude; 
			cords.latitude = row.latitude;
			obj.coordinate = cords;
			obj.last_update = row.last_update;
			obj.battery = row.battery;
			console.log(JSON.stringify(obj))
			res.status(200).send(obj);
		}
		else {
			res.status(403).send("No devices found");
		}
	});
});

app.get('/data/:id', (req,res) => {
	console.log('new GET request: /data/:' + req.params.id);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message);	
	}
	// query search data index
	let sql3 = `SELECT DISTINCT id id,
	sensor_id sensor_id, value value , timestamp timestamp
	FROM data_entry
	WHERE id  = ?`;

	// 
	db.all(sql3, [req.params.id], (err, rows) => {
		if (err) {
			throw err;
		}
		var returnArray = new Array();
		rows.forEach((row) => {
			var obj = new Object();
			obj.id = row.id;
			obj.sensor_id = row.sensor_id; 
			obj.value = row.value;
			obj.timestamp = row.timestamp; 
			returnArray.push(obj);
		});
		if (returnArray.length > 0) {
			res.status(200).send(returnArray);
		}
		else {
			res.status(403).send("No data found");
		}
	});
});

/////////////////777// post requests
app.post('/data/', (req,res) => {
	console.log('new POST request: /data/');
	console.log('body:' + JSON.stringify(req.body));

	const schema = Joi.object().keys({
		id: Joi.number().min(0).required(),
		sensorName: Joi.string().alphanum().min(3).max(30).required(),
		value: Joi.number().required(),
		timestamp: Joi.string().alphanum().min(3).max(30).required(), 
	});
	const result = Joi.validate(req.body, schema);
	if(result.error) {
		res.status(401).send("Bad data submit: " + result.error.details[0].message);	
	}

	db.run(`INSERT INTO data_entry(id, sensor_id, value, timestamp) VALUES (?, ?, ?, ?)`,
		[req.body.id, req.body.sensorName,req.body.value,req.body.timestamp], function(err) {
			if (err) {
				res.status(402).send("Failed to create data entry in database:" + err.message);
				return;
			}
    // get the last insert id
    res.status(200).send("Sucessfully created new data point");
});


	var datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	let data = [datetime, req.body.id];
	let sql = `UPDATE devices
	SET last_update = ?
	WHERE id = ?`;
	db.run(sql, data, function(err) {
		if (err) {
			return console.error(err.message);
		}
		console.log(`Row(s) updated: ${this.changes}`);
	});
});


app.post('/device/register/', (req,res) => {
	console.log('new POST request: /device/register/');
	console.log('body:' + JSON.stringify(req.body));

	const schema = Joi.object().keys({
		latitude: Joi.number().min(-90).max(90).required(),
		longitude: Joi.number().min(-180).max(180).required(),
		battery: Joi.number().integer().min(0).max(100),
		title: Joi.string().min(3).max(30).required(), 
	});
	const result = Joi.validate(JSON.stringify(req.body), schema);
	if(result.error) {
		res.status(401).send("Bad data submit: " + result.error.details[0].message);	
	}
	// register device
	var datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	//console.log(datetime);
	db.run(`INSERT INTO devices(status,name,longitude,latitude,last_update,battery) VALUES (?, ?, ?, ?,?,?)`,
		["ok",req.body.title,req.body.longitude,req.body.latitude,datetime, req.body.battery], function(err) {
			if (err) {
				res.status(406).send("Failed to create device entry in database:" + err.message);
				return;
			}
    	// return 200 Sucessfully created new data
    	res.status(200).send("Sucessfully created new data point");
    });
});


// put requests
app.put('/device/update/:id',(req,res) => {
	console.log('new PUT request: /device/update/:' + req.params.id);
	console.log('body:' + JSON.stringify(req.body));

	// 	400 - Invalid ID supplied
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message);	
	}

	const schema2 = Joi.object().keys({
		latitude: Joi.number().min(-90).max(90).required(),
		longitude: Joi.number().min(-180).max(180).required(),
		battery: Joi.number().integer().min(0).max(100),
		title: Joi.string().min(3).max(30).required(), 
	});
	const result2 = Joi.validate(JSON.stringify(req.body), schema2);
	if(result2.error) {
		res.status(401).send("Bad data submit: " + result2.error.details[0].message);	
	}
	// Search device 
	// 404 - Device not Found
	// find device
	let sql2 = `SELECT id id,
	Name name, status status, longitude longitude, 
	latitude latitude, last_update last_update,
	battery battery
	FROM devices
	WHERE id  = ?`;
	db.get(sql2, [req.params.id], (err, row) => {
		if (err) {
			return console.error(err.message);
		}
		if(row) {
			// update
			let data = [req.body.latitude ,req.body.longitude ,req.body.battery ,req.body.title , req.params.id];
			let sql = `UPDATE devices
			SET latitude = ?, longitude = ?, battery = ? , name = ?
			WHERE id = ?`;
			db.run(sql, data, function(err) {
				if (err) {
					res.status(406).send("Failed to update");
					return;
				}
				res.status(200).send("Updated device in database");
			});
		}
		else {
			res.status(404).send("No devices found");
		}
	});
});


// delete requests 
app.delete('/device/delete/:id',(req,res) => {
	console.log('new DELETE request: /device/delete/:' + req.params.id);
	console.log('query:' + req.query);
	console.log('params:' + req.params);

	// 	400 - Invalid ID supplied
	const schema = Joi.number().integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message);	
	}

	// find device
	let sql2 = `SELECT id id,
	Name name, status status, longitude longitude, 
	latitude latitude, last_update last_update,
	battery battery
	FROM devices
	WHERE id  = ?`;
	db.get(sql2, [req.params.id], (err, row) => {
		if (err) {
			return console.error(err.message);
		}
		if(row) {
			// change status to deleted AKA delete device
			let data = ['deleted', req.params.id];
			let sql = `UPDATE devices
			SET status = ?
			WHERE id = ?`;
			db.run(sql, data, function(err) {
				if (err) {
					res.status(406).send("Failed to delete");
					return;
				}
				res.status(200).send("Deleted device");
			});
		}
		else {
			res.status(404).send("No devices found");
		}
	});
});

// Connection info
const hostname = '192.168.1.87';
const PORT =  process.env.PORT || 3000;
app.listen(3000, ()=> console.log(`Server running at http://${hostname}:${PORT}/`));


// mysql
// open database in memory
const db = new sqlite3.Database('./db/cityIOT.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to the ./db/cityIOT.db SQlite database.');
});

// get devices, falta fazer math da distancia

// Insert data into table

// Delete data based on id

// query data_entry by id

// insert data_entry 

/////////////////////////////////////////////77
// // close the database connection
// db.close((err) => {
// 	if (err) {
// 		return console.error(err.message);
// 	}
// 	console.log('Close the database connection.');
// });



