const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = [];
let exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const userId = Date.now().toString();
  const newUser = { username, _id: userId };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();
  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate,
    _id: _id
  };

  exercises.push(exercise);
  res.json(exercise);
});

// Get a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let log = exercises.filter(ex => ex._id === _id);

  if (from) {
    const fromDate = new Date(from).getTime();
    log = log.filter(ex => new Date(ex.date).getTime() >= fromDate);
  }

  if (to) {
    const toDate = new Date(to).getTime();
    log = log.filter(ex => new Date(ex.date).getTime() <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: _id,
    log: log.map(({ description, duration, date }) => ({ description, duration, date }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
