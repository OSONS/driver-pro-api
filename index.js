const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:8081',
    'http://localhost:19006',
    'https://driver-pro.polsia.app',
    /\.vercel\.app$/,
    /\.netlify\.app$/,
    /\.railway\.app$/,
    /\.supabase\.co$/,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'apikey',
    'X-Client-Info',
    'X-Supabase-Auth'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/dashboard', async (req, res) => {
  try {
    const courses = await pool.query('SELECT COUNT(*) as total, COALESCE(SUM(montant),0) as revenus FROM courses WHERE date = CURRENT_DATE');
    const chauffeurs = await pool.query("SELECT COUNT(*) as actifs FROM drivers WHERE statut = 'actif'");
    res.json({
      courses_jour: parseInt(courses.rows[0].total),
      revenus_jour: parseFloat(courses.rows[0].revenus),
      chauffeurs_actifs: parseInt(chauffeurs.rows[0].actifs)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/drivers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers ORDER BY nom');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API DRIVER PRO running on port ${PORT}`));
