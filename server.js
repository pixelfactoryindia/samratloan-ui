// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from /public folder
app.use(express.static(path.join(__dirname, 'public')));

// Supabase Initialization
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Health Check Route
app.get('/health', (req, res) => res.send('OK'));

// Default route to index.html (sign-in page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes
app.post('/api/signup', async (req, res) => {
  const { email, password, username, role } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  const user = data.user;
  const insert = await supabase.from('users').insert({
    id: user.id,
    email,
    username,
    role
  });

  if (insert.error) return res.status(500).json({ error: insert.error.message });

  res.status(200).json({ message: 'Signup successful', user });
});

// Sign In Endpoint
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: error.message });

  // ✅ Fetch additional user details (role and username)
  const userId = data.user.id;
  const { data: userDetails, error: userError } = await supabase
    .from('users')
    .select('username, role')
    .eq('id', userId)
    .single();

  if (userError) return res.status(500).json({ error: userError.message });

  res.status(200).json({
    message: 'Login successful',
    session: data.session,
    user: userDetails // ✅ send full user details to frontend
  });
});

app.post('/api/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out' });
});

// Serve dashboard explicitly
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '_dashboard.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

