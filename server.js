const express = require('express');
const path    = require('path');
const os      = require('os');

const app  = express();
const PORT = process.env.PORT || 3000;

// Serve everything in the project root as static files
app.use(express.static(path.join(__dirname)));

// Any unknown route → index.html  (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  // Print all local network addresses so the user knows what URL to open
  const nets = os.networkInterfaces();
  console.log('\n🎓  College Fees Management Server\n');
  console.log(`   Local:   http://localhost:${PORT}`);
  Object.values(nets).flat().forEach(n => {
    if (n.family === 'IPv4' && !n.internal) {
      console.log(`   Network: http://${n.address}:${PORT}  ← open this on your phone`);
    }
  });
  console.log('\n   Make sure your phone is on the same WiFi network.\n');
});
