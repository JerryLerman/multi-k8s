const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

console.log("\n\n********************************** Redis client created!\n\n")

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// This only gets executed when a redis insert is published. This is supposed to wake up
sub.on('message', (channel, message) => {
  enteredValue = parseInt(message)
  console.log("<><><><><><><><><><> A redis message was sensed with value: ",enteredValue)
  fibResult = fib(enteredValue)
  console.log("The fib result is: ",fibResult)
  redisClient.hset('values', message, fibResult);
  console.log("Just entered the fib value ", fibResult, " for index ", enteredValue)
});

// sub.on('message', (channel, message) => {
//   redisClient.hset('values', message, fib(parseInt(message)));
// });

sub.subscribe('insert');