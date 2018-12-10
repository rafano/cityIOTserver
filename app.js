// imported functions
const http = require('http');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();


// imported classses
const Joi = require('joi');

app.use(express.json());

// get requests 

app.get('/devices', (req,res) => {
	console.log('new GET request: /devices');
	console.log('query:' + req.query);
	console.log('params:' + req.params);
	// query devices
	// put them in res
	res.send('/devices');
});

app.get('/device/:id', (req,res) => {
	console.log('new GET request: /device/:' + req.params.id);
	console.log('query:' + req.query);
	console.log('params:' + req.params);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message);	
	}

	// find device
	// send device info
	
	res.send('/device + id:' + req.params.id);
});

app.get('/data/:id', (req,res) => {
	console.log('new GET request: /data/:' + req.params.id);
	console.log('query:' + req.query);
	console.log('params:' + req.params);

	// 	400 - Invalid ID supplie
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message);	
	}
	// query search data index
	// put them in res
	res.send('/data id:' + req.params.id);
});

// post requests
app.post('/data/', (req,res) => {
	console.log('new POST request: /data/');
	console.log('query:' + req.query);
	console.log('params:' + req.params);

	// register data
});

app.post('/device/register/', (req,res) => {
	console.log('new POST request: /device/register/');
	console.log('query:' + req.query);
	console.log('params:' + req.params);

	// register device
});


// put requests
app.put('/device/update/:id',(req,res) => {
	console.log('new PUT request: /device/update/:' + req.params.id);
	console.log('query:' + req.query);
	console.log('params:' + req.params);

	// 	400 - Invalid ID supplied
	const schema = Joi.number().min(0).integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message);	
	}

	// find device
	
	// update device
});


// delete requests 
app.delete('/device/delete/:id',(req,res) => {
	onsole.log('new DELETE request: /device/delete/:' + req.params.id);
	console.log('query:' + req.query);
	console.log('params:' + req.params);

	// 	400 - Invalid ID supplied
	const schema = Joi.number().integer().required();
	const result = Joi.validate(req.params.id, schema);
	if(result.error) {
		res.status(400).send(result.error.details[0].message);	
	}

	// find device
	

	// delete device
});

// Connection info
const hostname = '127.0.0.1';
const PORT =  process.env.PORT || 3000;
app.listen(3000, ()=> console.log(`Server running at http://${hostname}:${PORT}/`));


// mysql
// open database in memory
let db = new sqlite3.Database('./db/cityIOT.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the ./db/cityIOT.db SQlite database.');
});
 


// close the database connection
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});