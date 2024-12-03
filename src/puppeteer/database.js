const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/puppeteer/database/citizens.sqlite'
});

const Citizen = sequelize.define('Citizen', {
  url: DataTypes.STRING,
  handle: DataTypes.STRING,
  name: DataTypes.STRING,
  mainOrg: DataTypes.STRING,
  country: DataTypes.STRING,
  region: DataTypes.STRING,
  citizenRecord: DataTypes.STRING
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

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database initialized');
  } catch (error) {
    console.error('Unable to initialize the database:', error);
    throw error;
  }
}

async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing the database connection:', error);
    throw error;
  }
}

async function insertCitizen(citizenData) {
  // Check if a citizen with the same URL already exists
  let citizen = await Citizen.findOne({ where: { url: citizenData.url } });

  if (!citizen) {
    // If citizen does not exist, create a new one
    citizen = await Citizen.create(citizenData);

    // Create affiliations if provided
    if (citizenData.Affiliations) {
      await Affiliation.bulkCreate(
        citizenData.Affiliations.map(aff => ({ ...aff, CitizenId: citizen.id }))
      );
    }

    // Create fluencies if provided
    if (citizenData.Fluencies) {
      await Fluency.bulkCreate(
        citizenData.Fluencies.map(lang => ({ language: lang, CitizenId: citizen.id }))
      );
    }
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

async function exportToCsv(scannedUrls) {
  const citizens = await Citizen.findAll({
    include: [Affiliation, Fluency],
    where: {
      url: scannedUrls
    }
  });

  let csvData = [
    "URL,Handle,Name,Main Org,Affiliation 1,Affiliation 2,Affiliation 3,Affiliation 4,Affiliation 5,Affiliation 6,Affiliation 7,Affiliation 8,Affiliation 9,Country,Region,Citizen Record,Fluency 1,Fluency 2,Fluency 3"
  ];

  for (const citizen of citizens) {
    let mainOrgSID = citizen.mainOrg;
    let affiliations = [];
    for (const aff of citizen.Affiliations) {
      if (aff) {
        if (aff.name === mainOrgSID) {
          mainOrgSID = aff.sid;
        } else {
          affiliations.push(`${aff.sid}`);
        }
      }
    }

    while (affiliations.length < 9) {
      affiliations.push('');
    }

    const fluencies = Array(3).fill('').map((_, i) => {
      return citizen.Fluencies[i] ? citizen.Fluencies[i].language : '';
    });

    const row = [
      citizen.url,
      citizen.handle,
      citizen.name,
      mainOrgSID, 
      ...affiliations,
      citizen.country,
      citizen.region,
      citizen.citizenRecord || '', 
      ...fluencies
    ].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',');

    csvData.push(row);
  }

  return csvData.join('\n');
}

module.exports = {
  Citizen,
  Affiliation,
  Fluency,
  initializeDatabase,
  closeDatabase,
  insertCitizen,
  getCitizen,
  getAllCitizens,
  exportToCsv
};