const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('******************************* Lost PG connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

redisClient.on('connect', function() {
  console.log("<><><><><><><><><><><><> CONNECTED TO REDIS CLIENT!!")
})

redisClient.on('error', function (err) {
  console.log("******************** FAILED TO CONNECT TO REDIS CLIENT!!", err)
})


const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');

  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

// This gets called by the webpage when someone enters a number
// The number entered is entered into redis with a fib number of "Nothing Yet!"
// The number entered is entered in a single column postgres table
// The redis insert event gets published. A routine that is listening for this event
//  will awake and calculate the fibinacci number and replace "Nothing Yet" with the calced value
app.post('/values', async (req, res) => {
  const index = req.body.index;

  enteredValue = parseInt(index)
  console.log("Entered value: ",enteredValue)

  if (enteredValue > 40) {
    console.log("Entered value rejected because it's > 40")
    return res.status(422).send('Index too high');
  }

  console.log("Now calling redis to create a slot for key: ",enteredValue, " with fib value Nothing Yet!")
  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  console.log("the redis insert event has just been published, passing value ",index)
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
  console.log("The postgres INSERT has been run with key: ", index, "\n\n")

  res.send({ working: true });
});

app.listen(5000, err => {
  console.log('Listening');
});
