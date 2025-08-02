const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let tracks = [];

// Storage for uploaded music and cover images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = file.fieldname === 'music' ? './public/uploads/music' : './public/uploads/covers';
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  const results = tracks.filter(track =>
    track.title.toLowerCase().includes(q) || track.artist.toLowerCase().includes(q)
  );
  res.render('index', { tracks: results });
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.fields([{ name: 'music' }, { name: 'cover' }]), (req, res) => {
  const { title, artist } = req.body;
  const musicPath = req.files.music[0].filename;
  const coverPath = req.files.cover ? req.files.cover[0].filename : '';
  tracks.push({
    id: Date.now(),
    title,
    artist,
    music: '/public/uploads/music/' + musicPath,
    cover: coverPath ? '/public/uploads/covers/' + coverPath : '',
    plays: 0,
  });
  res.redirect('/');
});

app.post('/play/:id', (req, res) => {
  const track = tracks.find(t => t.id == req.params.id);
  if (track) track.plays += 1;
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});