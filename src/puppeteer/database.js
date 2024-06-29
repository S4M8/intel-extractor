const { Sequelize, DataTypes, Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../src/db/star_citizen_data.sqlite'
});

const Citizen = sequelize.define('Citizen', {
  url: DataTypes.STRING,
  handle: DataTypes.STRING,
  name: DataTypes.STRING,
  mainOrg: DataTypes.STRING,
  country: DataTypes.STRING,
  region: DataTypes.STRING
});

const Affiliation = sequelize.define('Affiliation', {
  name: DataTypes.STRING,
  sid: DataTypes.STRING,
  rank: DataTypes.STRING,
  isMain: DataTypes.BOOLEAN
});

const Fluency = sequelize.define('Fluency', {
  language: DataTypes.STRING
});

Citizen.hasMany(Affiliation);
Citizen.hasMany(Fluency);
Affiliation.belongsTo(Citizen);
Fluency.belongsTo(Citizen);

async function initDb() {
  await sequelize.sync();
}

async function insertCitizen(citizenData) {
    const [citizen, created] = await Citizen.findOrCreate({
      where: { handle: citizenData.handle },
      defaults: citizenData
    });
  
    if (!created) {
      // Update existing citizen data
      await citizen.update(citizenData);
    }
  
    // Remove existing affiliations and fluencies
    await Affiliation.destroy({ where: { CitizenId: citizen.id } });
    await Fluency.destroy({ where: { CitizenId: citizen.id } });
  
    // Add new affiliations and fluencies
    if (citizenData.Affiliations) {
      await Affiliation.bulkCreate(
        citizenData.Affiliations.map(aff => ({ ...aff, CitizenId: citizen.id }))
      );
    }
    if (citizenData.Fluencies) {
      await Fluency.bulkCreate(
        citizenData.Fluencies.map(lang => ({ language: lang, CitizenId: citizen.id }))
      );
    }
  
    return citizen;
  }

async function getCitizen(id) {
  return Citizen.findByPk(id, {
    include: [Affiliation, Fluency]
  });
}

async function getAllCitizens() {
  return Citizen.findAll({
    include: [Affiliation, Fluency]
  });
}

async function exportToCsv(orgSID) {
    const citizens = await Citizen.findAll({
      include: [
        {
          model: Affiliation,
          where: {
            [Op.or]: [
              { sid: orgSID },
              { name: orgSID }
            ]
          },
          required: true
        },
        {
          model: Fluency
        }
      ],
      group: ['Citizen.id']
    });
  
    let csvData = [
      "URL,Handle,Name,Main Org,Affiliation 1,Affiliation 2,Affiliation 3,Affiliation 4,Affiliation 5,Affiliation 6,Affiliation 7,Affiliation 8,Affiliation 9,Country,Region,Fluency 1,Fluency 2,Fluency 3"
    ];
  
    const processedHandles = new Set();
  
    for (const citizen of citizens) {
      if (processedHandles.has(citizen.handle)) continue;
      processedHandles.add(citizen.handle);
  
      // Ensure affiliations are correctly loaded
      await citizen.reload({ include: [Affiliation, Fluency] });
  
      const affiliations = Array(9).fill('').map((_, i) => {
        const aff = citizen.Affiliations[i];
        return aff ? `${aff.name}|${aff.sid}|${aff.rank}` : '';
      });
  
      const fluencies = Array(3).fill('').map((_, i) => {
        return citizen.Fluencies[i] ? citizen.Fluencies[i].language : '';
      });
  
      const row = [
        citizen.url,
        citizen.handle,
        citizen.name,
        citizen.mainOrg,
        ...affiliations,
        citizen.country,
        citizen.region,
        ...fluencies
      ].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',');
  
      csvData.push(row);
    }
  
    return csvData.join('\n');
  }
  
  module.exports = {
    sequelize,
    Citizen,
    Affiliation,
    Fluency,
    initDb,
    insertCitizen,
    getCitizen,
    getAllCitizens,
    exportToCsv
  };