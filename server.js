const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ 
    result: 'Mock AI response: File processed successfully',
    data: [['Header1', 'Header2'], ['Data1', 'Data2']],
    formatting: []
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});