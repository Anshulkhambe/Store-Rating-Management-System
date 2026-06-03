const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT || 3306,
  dialect: 'mysql',
  logging: false,
});

async function initDatabase() {
  try {
    // Connect to MySQL server without database first to check/create it
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT || 3306,
      user: DB_USER,
      password: DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
    console.log(`Database '${DB_NAME}' verified/created.`);
  } catch (error) {
    console.error('Error during database verification/creation:', error.message);
    throw error;
  }
}

module.exports = { sequelize, initDatabase };
