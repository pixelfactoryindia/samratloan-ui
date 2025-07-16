require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

// Supabase Initialization
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Sign Up Endpoint
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
// Sign In Endpoint
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) return res.status(401).json({ error: authError.message });

  // Fetch user details from 'users' table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('username, role')
    .eq('email', email)
    .single();

  if (userError) return res.status(500).json({ error: userError.message });

  res.status(200).json({
    message: 'Login successful',
    session: authData.session,
    user: userData  // includes username and role
  });
});


// ✅ Get User Role by Token
app.post('/api/user-role', async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ error: 'Token required' });

  const { data: userInfo, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userInfo.user) return res.status(401).json({ error: 'Invalid token' });

  const userId = userInfo.user.id;

  const { data: userRecord, error: fetchErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (fetchErr) return res.status(500).json({ error: fetchErr.message });

  res.status(200).json({ role: userRecord.role });
});

// Logout Endpoint
app.post('/api/logout', (req, res) => {
  // Client handles token/session clear
  res.status(200).json({ message: 'Logged out' });
});

// Static Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
