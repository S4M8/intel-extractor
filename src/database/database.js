const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const electron = require('electron');

const userDataPath = (electron.app || electron.remote.app).getPath('userData');
const dbPath = path.join(userDataPath, 'citizens.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath
});

const Citizen = sequelize.define('Citizen', {
  url: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  handle: DataTypes.STRING,
  main_org: DataTypes.STRING,
  affiliation_1: DataTypes.STRING,
  affiliation_2: DataTypes.STRING,
  affiliation_3: DataTypes.STRING,
  affiliation_4: DataTypes.STRING,
  affiliation_5: DataTypes.STRING,
  affiliation_6: DataTypes.STRING,
  affiliation_7: DataTypes.STRING,
  affiliation_8: DataTypes.STRING,
  affiliation_9: DataTypes.STRING,
  country: DataTypes.STRING,
  region: DataTypes.STRING,
  fluency_1: DataTypes.STRING,
  fluency_2: DataTypes.STRING,
  fluency_3: DataTypes.STRING
});

async function initDatabase() {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

module.exports = { Citizen, initDatabase };