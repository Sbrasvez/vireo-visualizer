// database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,   // vireo_db
  process.env.DB_USER,   // postgres
  process.env.DB_PASS,   // kGwtbdfIs83BBvfv
  {
    host: process.env.DB_HOST,  // agkitkcxnvxlektfzesz.supabase.co
    dialect: process.env.DB_DIALECT, // postgres
    logging: false
  }
);

module.exports = sequelize;
