const express = require('express')
const app = express()
const cors = require('cors')
const User = require('./models/User');
const mongoose = require('mongoose')
require('dotenv').config()
// console.log('Loaded MONGO_URI:', process.env.MONGO_URI);


const uri = process.env.MONGO_URI;
console.log('Mongo URI:', uri); // For debugging

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// POST - create a new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  const user = new User({ username });
  await user.save();
  res.json({ username: user.username, _id: user._id });
});

// GET - all users
app.get('/api/users', async (req, res) => {
  const users = await User.find({}, 'username _id');
  res.json(users);
});

// POST - add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const user = await User.findById(req.params._id);
  const exerciseDate = date ? new Date(date) : new Date();

  const exercise = {
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString()
  };

  user.log.push(exercise);
  await user.save();

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

// GET - user logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);

  let logs = [...user.log];

  if (from) logs = logs.filter(e => new Date(e.date) >= new Date(from));
  if (to) logs = logs.filter(e => new Date(e.date) <= new Date(to));
  if (limit) logs = logs.slice(0, +limit);

  res.json({
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
