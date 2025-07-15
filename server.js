const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// ✅ Serve static files from current directory
app.use(express.static(__dirname));

// ✅ Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Or change to your home page
});

// ✅ Change here: listen on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
