const express = require('express');
const router = express.Router();
const Servicio = require('../models/Servicio');

// Listar servicios
router.get('/', async (req, res) => {
  try {
    const servicios = await Servicio.findAll();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar servicios' });
  }
});

// Crear servicio
router.post('/', async (req, res) => {
  try {
    const servicio = await Servicio.create(req.body);
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear servicio' });
  }
});

// Obtener servicio por ID
router.get('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener servicio' });
  }
});

// Actualizar servicio
router.put('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });

    await servicio.update(req.body);
    res.json({ message: 'Servicio actualizado', servicio });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
});

module.exports = router;
