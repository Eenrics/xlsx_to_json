const Sequelize = require('sequelize');
const XLSX = require('xlsx');
const moment = require('moment');
const fs = require('fs');
const path = require('path');


const sequelize = new Sequelize('xlsx_db', 'xlsx', 'xlsx', {
    host: 'localhost',
    dialect: 'mysql'
  });
  
  const Content = sequelize.define('Content', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    item_no: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    subtitle: {
      type: Sequelize.STRING,
      allowNull: true
    },
    unit: {
      type: Sequelize.STRING,
      allowNull: true
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    rate: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    section_title: {
      type: Sequelize.STRING,
      allowNull: true
    },
    summary: {
      type: Sequelize.STRING,
      allowNull: true
    },
    total: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    content_type: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });
 
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      await sequelize.sync({ force: true });
      console.log('Tables synchronized successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  })();