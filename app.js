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
		res.status(401).send("Bad query params: " + result.error.details[0].message + "\n");	
	}

	// else find devices within range
	// get all devices, make math on distance, return object
	// find devices
	let sql = `SELECT DISTINCT id id,
	Name name, status status, longitude longitude, 
	latitude latitude, last_update last_update,
	type type FROM devices
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
			obj.type = row.type;
			console.log(JSON.stringify(obj))
			returnArray.push(obj);
		});
		if (returnArray.length > 0) {
			res.status(200).send(returnArray);
		}
		else {
			res.status(403).send("No devices found" + "\n");
			return;
		}
	});
});


app.get('/device/:id', (req,res) => {
	console.log('new GET request: /device/:' + req.params.id);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message + "\n");
		return;	
	}
	// Database Query
	let sql2 = `SELECT id id,
	Name name, status status, longitude longitude, 
	latitude latitude, last_update last_update,
	type type
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
			obj.type = row.type;
			console.log(JSON.stringify(obj))
			res.status(200).send(obj);
		}
		else {
			res.status(403).send("No devices found" + "\n");
			return;
		}
	});
});


/// GET DATAS 
/// 
app.get('/data/uptimes/:id', (req,res) => {
	console.log('new GET request: /data/:' + req.params.id);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message + "\n");	
		return;
	}
	// query search data index
	let sql3 = `SELECT DISTINCT uptime uptime,load load, timestamp timestamp
	FROM uptimes
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
			obj.uptime = row.uptime; 
			obj.load = row.load;
			obj.timestamp = row.timestamp; 
			returnArray.push(obj);
		});
		if (returnArray.length > 0) {
			res.status(200).send(returnArray);
		}
		else {
			res.status(403).send("No data found" + "\n");
			return;
		}
	});
});

app.get('/data/location/:id', (req,res) => {
	console.log('new GET request: /data/:' + req.params.id);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message + "\n");	
		return;
	}
	// query search data index
	let sql3 = `SELECT DISTINCT latitude latitude, longitude longitude,altitude altitude,speed speed,timestamp timestamp
	FROM location
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
			obj.latitude = row.latitude; 
			obj.longitude = row.longitude;
			obj.altitude = row.altitude;
			obj.speed = row.speed;
			obj.timestamp = row.timestamp; 
			returnArray.push(obj);
		});
		if (returnArray.length > 0) {
			res.status(200).send(returnArray);
		}
		else {
			res.status(403).send("No data found" + "\n");
			return;
		}
	});
});

app.get('/data/connection/:id', (req,res) => {
	console.log('new GET request: /data/:' + req.params.id);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message + "\n");	
		return;
	}
	// query search data index
	let sql3 = `SELECT DISTINCT download download,upload upload,ping ping,ip ip,distance distance,timestamp timestamp
	FROM connection_info
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
			obj.download = row.download; 
			obj.upload = row.upload;
			obj.ping = row.ping;
			obj.ip = row.ip;
			obj.distance = row.distance;
			obj.timestamp = row.timestamp; 
			returnArray.push(obj);
		});
		if (returnArray.length > 0) {
			res.status(200).send(returnArray);
		}
		else {
			res.status(403).send("No data found" + "\n");
			return;
		}
	});
});

app.get('/data/temperature/:id', (req,res) => {
	console.log('new GET request: /data/:' + req.params.id);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message + "\n");	
		return;
	}
	// query search data index
	let sql3 = `SELECT DISTINCT cpu_temp cpu_temp,gpu_temp gpu_temp,timestamp timestamp
	FROM temperature
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
			obj.cpu_temp = row.cpu_temp; 
			obj.gpu_temp = row.gpu_temp;
			obj.timestamp = row.timestamp; 
			returnArray.push(obj);
		});
		if (returnArray.length > 0) {
			res.status(200).send(returnArray);
		}
		else {
			res.status(403).send("No data found" + "\n");
			return;
		}
	});
});


app.get('/data/systeminfo/:id', (req,res) => {
	console.log('new GET request: /data/:' + req.params.id);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message + "\n");	
		return;
	}
	// query search data index
	let sql3 = `SELECT DISTINCT system system,node node,kernel kernel, kernelversion kernelversion,architecture architecture,
	processor processor,memoryused memoryused,timestamp timestamp
	FROM device_information
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
			obj.system = row.system; 
			obj.node = row.node;
			obj.kernel = row.kernel;
			obj.kernelversion = row.kernelversion;
			obj.architecture = row.architecture;
			obj.processor = row.processor;
			obj.memoryused = row.memoryused;
			obj.timestamp = row.timestamp; 
			returnArray.push(obj);
		});
		if (returnArray.length > 0) {
			res.status(200).send(returnArray);
		}
		else {
			res.status(403).send("No data found" + "\n");
			return;
		}
	});
});


/////////////////777// post requests
app.post('/data/location', (req,res) => {
	console.log('new POST request: /data/location');
	console.log('body:' + JSON.stringify(req.body));

	const schema = Joi.object().keys({
		id: Joi.number().min(0).required(),
		latitude: Joi.number().min(-90).max(90).required(),
		longitude: Joi.number().min(-180).max(180).required(),
		altitude: Joi.number(),
		speed: Joi.number(),
		timestamp: Joi.number().required(), 
	});
	const result = Joi.validate(req.body, schema);
	if(result.error) {
		res.status(401).send("Bad data submit: " + result.error.details[0].message + "\n");	
		return;
	}

	db.run(`INSERT INTO location(id, latitude, longitude, altitude,speed,timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
		[req.body.id,req.body.latitude,req.body.longitude,req.body.altitude,req.body.speed,req.body.timestamp], function(err) {
			if (err) {
				res.status(402).send("Failed to create data entry in database:" + err.message + "\n");
				return;
			}
    // get the last insert id
    res.status(200).send("Sucessfully created new data point" + "\n");
});


	var datetime = new Date();
	var seconds = Math.round(datetime.getTime() / 1000);
	let data = [seconds, req.body.id];
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


app.post('/data/connection', (req,res) => {
	console.log('new POST request: /data/connection');
	console.log('body:' + JSON.stringify(req.body));

	const schema = Joi.object().keys({
		id: Joi.number().min(0).required(),
		download: Joi.number().min(0).required(),
		upload: Joi.number().min(0).required(),
		ping: Joi.number(),
		ip: Joi.required(),
		distance: Joi.number(),
		timestamp: Joi.number().required(), 
	});
	const result = Joi.validate(req.body, schema);
	if(result.error) {
		res.status(401).send("Bad data submit: " + result.error.details[0].message + "\n");	
		return;
	}

	db.run(`INSERT INTO connection_info(id, download, upload,ping,ip,distance,timestamp) VALUES (?, ?, ?, ?, ?, ?,?)`,
		[req.body.id,req.body.download,req.body.upload,req.body.ping,req.body.ip,req.body.distance,req.body.timestamp], function(err) {
			if (err) {
				res.status(402).send("Failed to create data entry in database:" + err.message + "\n");
				return;
			}
    // get the last insert id
    res.status(200).send("Sucessfully created new data point" + "\n");
});


	var datetime = new Date();
	var seconds = Math.round(datetime.getTime() / 1000);
	let data = [seconds, req.body.id];
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


app.post('/data/temperature', (req,res) => {
	console.log('new POST request: /data/temperature');
	console.log('body:' + JSON.stringify(req.body));

	const schema = Joi.object().keys({
		id: Joi.number().min(0).required(),
		cpu_temp: Joi.number().min(0).required(),
		gpu_temp: Joi.number().min(0).required(),
		timestamp: Joi.number().min(0).required(), 
	});
	const result = Joi.validate(req.body, schema);
	if(result.error) {
		res.status(401).send("Bad data submit: " + result.error.details[0].message + "\n");
		return;	
	}
	db.run(`INSERT INTO temperature(id, cpu_temp, gpu_temp, timestamp) VALUES (?, ?, ?, ?)`,
		[req.body.id, req.body.cpu_temp,req.body.gpu_temp,req.body.timestamp], function(err) {
			if (err) {
				res.status(402).send("Failed to create data entry in database:" + err.message + "\n");
				return;
			}
    // get the last insert id
    res.status(200).send("Sucessfully created new temperature data point" + "\n");
});
	var datetime = new Date();
	var seconds = Math.round(datetime.getTime() / 1000);
	let data = [seconds, req.body.id];
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


app.post('/data/systeminfo', (req,res) => {
	console.log('new POST request: /data/systeminfo');
	console.log('body:' + JSON.stringify(req.body));

	const schema = Joi.object().keys({
		id: Joi.number().min(0).required(),
		system: Joi.string(),
		node: Joi.string(),
		kernel: Joi.string(),
		kernelversion: Joi.string(),
		architecture: Joi.string(),
		processor: Joi.string(),
		memoryused: Joi.number().min(0),
		timestamp: Joi.number().required(), 
	});
	const result = Joi.validate(req.body, schema);
	if(result.error) {
		res.status(401).send("Bad data submit: " + result.error.details[0].message+ "\n");	
		return;
	}


	db.run(`INSERT INTO device_information(id,system,node,kernel,kernelversion,architecture,processor,memoryused,
		timestamp) VALUES (?,?,?,?,?,?,?,?,?)`,
		[req.body.id, req.body.system, req.body.node, req.body.kernel, req.body.kernelversion,
		req.body.architecture, req.body.processor, req.body.memoryused,req.body.timestamp],
		function(err) {
			if (err) {
				res.status(402).send("Failed to create data entry in database:" + err.message + "\n");
				return;
			}
    // get the last insert id
    res.status(200).send("Sucessfully created new system info data point" + "\n");
});

	var datetime = new Date();
	var seconds = Math.round(datetime.getTime() / 1000);
	let data = [seconds, req.body.id];
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

app.post('/data/uptimes', (req,res) => {
	console.log('new POST request: /data/uptime');
	console.log('body:' + JSON.stringify(req.body));

	const schema = Joi.object().keys({
		id: Joi.number().min(0).required(),
		uptime: Joi.string(),
		load: Joi.number(),
		timestamp: Joi.number().required(), 
	});
	const result = Joi.validate(req.body, schema);
	if(result.error) {
		res.status(401).send("Bad data submit: " + result.error.details[0].message+ "\n");	
		return;
	}

	db.run(`INSERT INTO uptimes(id,uptime,load,timestamp) VALUES (?,?,?,?)`,
		[req.body.id, req.body.uptime, req.body.load, req.body.timestamp],
		function(err) {
			if (err) {
				res.status(402).send("Failed to create data entry in database:" + err.message + "\n");
				return;
			}
    // get the last insert id
    res.status(200).send("Sucessfully created new system info data point" + "\n");
});

	var datetime = new Date();
	var seconds = Math.round(datetime.getTime() / 1000);
	let data = [seconds, req.body.id];
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
		res.status(401).send("Bad data submit: " + result.error.details[0].message + "\n");	
		return;
	}
	// register device
	var datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	//console.log(datetime);
	db.run(`INSERT INTO devices(status,name,longitude,latitude,last_update,battery) VALUES (?, ?, ?, ?,?,?)`,
		["ok",req.body.title,req.body.longitude,req.body.latitude,datetime, req.body.battery], function(err) {
			if (err) {
				res.status(406).send("Failed to create device entry in database:" + err.message + "\n");
				return;
			}
    	// return 200 Sucessfully created new data
    	res.status(200).send("Sucessfully created new data point" + "\n");
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
		res.status(400).send(result.error.details[0].message + "\n");	
		return;
	}

	const schema2 = Joi.object().keys({
		latitude: Joi.number().min(-90).max(90).required(),
		longitude: Joi.number().min(-180).max(180).required(),
		battery: Joi.number().integer().min(0).max(100),
		title: Joi.string().min(3).max(30).required(), 
	});
	const result2 = Joi.validate(JSON.stringify(req.body), schema2);
	if(result2.error) {
		res.status(401).send("Bad data submit: " + result2.error.details[0].message + "\n");	
		return;
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
					res.status(406).send("Failed to update" + "\n");
					return;
				}
				res.status(200).send("Updated device in database" + "\n");
			});
		}
		else {
			res.status(404).send("No devices found" + "\n");
			return;
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
		res.status(400).send(result.error.details[0].message + "\n");	
		return;
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
					res.status(406).send("Failed to delete" + "\n");
					return;
				}
				res.status(200).send("Deleted device" + "\n");
			});
		}
		else {
			res.status(404).send("No devices found" + "\n");
			return;
		}
	});
});

// Connection info
const hostname = 'localhost';
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
