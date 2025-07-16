const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/', async (req, res) => {
  try {
    // Nothing to revoke on server side unless you're managing tokens manually
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
