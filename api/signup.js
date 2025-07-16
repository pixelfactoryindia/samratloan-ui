const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/', async (req, res) => {
  const { email, password, username, role } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) return res.status(400).json({ error: error.message });

  // Insert into users table
  const { error: dbError } = await supabase
    .from('users')
    .insert([{ email, username, role }]);

  if (dbError) return res.status(500).json({ error: dbError.message });

  res.status(200).json({ message: 'Signup successful', user: data.user });
});

module.exports = router;
