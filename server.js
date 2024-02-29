const express = require('express');
const path = require('path');
const db = require('./db/db.json');
const uuid = require('./helpers/uuid');
const fs = require('fs')

const PORT = 3001;
const app = express();

app.use(express.static('public'));
app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'))
});

app.get('/api/notes', (req, res) => res.json(db));

app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      review_id: uuid()
    };

    fs.readFile(db, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading database file:', err);
        return res.status(500).json({ error: 'Could not read database' });
      }

      let noteData = [];
      if (data) {
        try {
          noteData = JSON.parse(data);
        } catch (parseError) {
          console.error('Error parsing database file:', parseError);
          return res.status(500).json({ error: 'Could not parse database' });
        }
      }

      noteData.push(newNote);

      fs.writeFile(db, JSON.stringify(noteData, null, 2), (err) => {
        if (err) {
          console.error('Error writing to database file:', err);
          return res.status(500).json({ error: 'Could not write to database' });
        }

        const response = {
          status: 'success',
          body: newNote
        };
        res.status(201).json(response);
      });
    });
  } else {
    res.status(400).json({ error: 'Both title and text are required' });
  }
});

app.delete('/api/notes', (req, res) => {

});

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);