const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Ensure upload directories exist
const imageDir = path.join(__dirname, 'uploads/images');
const videoDir = path.join(__dirname, 'Uploads/videos');

if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    image TEXT NOT NULL,
    categoryId INTEGER,
    englishContent TEXT,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )`);

  db.get('SELECT COUNT(*) AS count FROM admins', (err, row) => {
    if (err) console.error('Error checking admins:', err);
    if (row.count === 0) {
      db.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', 'password']);
    }
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images/');
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, 'Uploads/videos/');
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  db.run('INSERT INTO categories (name) VALUES (?)', [name], function (err) {
    if (err) {
      console.error('Error inserting category:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  db.run('UPDATE categories SET name = ? WHERE id = ?', [name, id], function (err) {
    if (err) {
      console.error('Error updating category:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ updated: this.changes });
  });
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM categories WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error deleting category:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

app.get('/api/posts', (req, res) => {
  db.all('SELECT * FROM posts', (err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/posts', upload.single('image'), (req, res) => {
  console.log('POST /api/posts received');
  console.log('Request body:', req.body);
  console.log('File:', req.file);

  const { title, description, content, categoryId, englishContent } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!title || !content || !image) {
    console.error('Missing required fields:', { title, content, image });
    return res.status(400).json({ error: 'Title, content, and image are required' });
  }

  db.run(
    'INSERT INTO posts (title, description, content, image, categoryId, englishContent) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, content, image, categoryId || null, englishContent],
    function (err) {
      if (err) {
        console.error('Error inserting post:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/posts/:id', upload.single('image'), (req, res) => {
  console.log('PUT /api/posts/:id received');
  console.log('Request body:', req.body);
  console.log('File:', req.file);

  const { id } = req.params;
  const { title, description, content, categoryId, englishContent } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!title || !content) {
    console.error('Missing required fields:', { title, content });
    return res.status(400).json({ error: 'Title and content are required' });
  }

  db.get('SELECT image FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching post for update:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) return res.status(404).json({ error: 'Post not found' });

    if (image && row.image) {
      const oldImagePath = path.join(__dirname, 'uploads/images', row.image);
      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting old image:', err);
      });
    }

    const imageToUpdate = image || row.image;
    db.run(
      'UPDATE posts SET title = ?, description = ?, content = ?, image = ?, categoryId = ?, englishContent = ? WHERE id = ?',
      [title, description, content, imageToUpdate, categoryId || null, englishContent, id],
      function (err) {
        if (err) {
          console.error('Error updating post:', err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ updated: this.changes });
      }
    );
  });
});

app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT image FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching post for deletion:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) return res.status(404).json({ error: 'Post not found' });

    const imagePath = path.join(__dirname, 'uploads/images', row.image);
    fs.unlink(imagePath, (err) => {
      if (err && err.code !== 'ENOENT') console.error('Error deleting image:', err);
    });

    db.run('DELETE FROM posts WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting post:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ deleted: this.changes });
    });
  });
});

app.get('/api/videos', (req, res) => {
  db.all('SELECT * FROM videos', (err, rows) => {
    if (err) {
      console.error('Error fetching videos:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/videos', upload.single('video'), (req, res) => {
  console.log('POST /api/videos received');
  console.log('File:', req.file);

  const video = req.file ? req.file.filename : null;
  if (!video) {
    console.error('No video file uploaded');
    return res.status(400).json({ error: 'Video file is required' });
  }

  db.run('INSERT INTO videos (filename) VALUES (?)', [video], function (err) {
    if (err) {
      console.error('Error inserting video:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.put('/api/videos/:id', upload.single('video'), (req, res) => {
  console.log('PUT /api/videos/:id received');
  console.log('File:', req.file);

  const { id } = req.params;
  const video = req.file ? req.file.filename : null;

  if (!video) {
    console.error('No video file uploaded');
    return res.status(400).json({ error: 'Video file is required' });
  }

  db.get('SELECT filename FROM videos WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching video for update:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) return res.status(404).json({ error: 'Video not found' });

    const oldVideoPath = path.join(__dirname, 'Uploads/videos', row.filename);
    fs.unlink(oldVideoPath, (err) => {
      if (err && err.code !== 'ENOENT') console.error('Error deleting old video:', err);
    });

    db.run('UPDATE videos SET filename = ? WHERE id = ?', [video, id], function (err) {
      if (err) {
        console.error('Error updating video:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ updated: this.changes });
    });
  });
});

app.delete('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT filename FROM videos WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching video for deletion:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) return res.status(404).json({ error: 'Video not found' });

    const videoPath = path.join(__dirname, 'Uploads/videos', row.filename);
    fs.unlink(videoPath, (err) => {
      if (err && err.code !== 'ENOENT') console.error('Error deleting video:', err);
    });

    db.run('DELETE FROM videos WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting video:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ deleted: this.changes });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: err.message });
    }
    if (row) res.json({ success: true });
    else res.json({ success: false });
  });
});

app.listen(3003, () => {
  console.log('Backend running on http://localhost:3003');
});