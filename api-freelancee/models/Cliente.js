const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Cliente = sequelize.define('Cliente', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'clientes'
});

module.exports = Cliente;
