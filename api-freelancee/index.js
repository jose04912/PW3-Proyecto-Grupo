const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
const clientesRoutes = require('./routes/clientes');
const serviciosRoutes = require('./routes/servicios');

app.use('/api/clientes', clientesRoutes);
app.use('/api/servicios', serviciosRoutes);

app.get('/api/status', (req, res) => {
  res.json({ message: 'API funcionando' });
});

const PORT = process.env.PORT || 3000;
// Ruta raíz para pruebas
app.get('/', (req, res) => {
  res.send('Bienvenido al backend de Freelance API');
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
