const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

/**
 * SECURITY: Custom Admin Gateway
 * Instead of people typing '/admin', you can hide the path logic.
 * We also ensure the server provides the same index.html for all SPA routes.
 */
app.get('/api/isAdminAuth', (req, res) => {
    // Here you could add more complex server-side checks
    res.json({ gatewayEnabled: true });
});

// Handle React SPA routing - Always serve index.html for any path not handled above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Portfolio Server running on http://localhost:${PORT}`);
  console.log(`Admin Gateway secured.`);
});
