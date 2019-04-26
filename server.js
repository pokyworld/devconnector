const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('config');

// Init App
const app = express();

// Body parse middleware
app.use(express.json());

// DB Config
const db = config.get('mongoURI');

// Connect to MongoDb
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true
})
  .then(() => console.log("Connected to MongoDb..."))
  .catch(err => console.log(err));

// Use Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
