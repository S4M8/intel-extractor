const fs = require('fs').promises;
const path = require('path');
const { Citizen } = require('../database/database.js');

async function insertCitizen(citizenData) {
  try {
    const citizen = await Citizen.create(citizenData);
    console.log('Citizen inserted:', citizen.toJSON());
  } catch (error) {
    console.error('Error inserting citizen:', error);
  }
}

async function exportToCSV(filePath) {
  try {
    const citizens = await Citizen.findAll();
    const header = 'URL,Name,Handle,Main Org,Affiliation 1,Affiliation 2,Affiliation 3,Affiliation 4,Affiliation 5,Affiliation 6,Affiliation 7,Affiliation 8,Affiliation 9,Country,Region,Fluency 1,Fluency 2,Fluency 3\n';
    const rows = citizens.map(c => 
      `${c.url},${c.name},${c.handle},${c.main_org},${c.affiliation_1},${c.affiliation_2},${c.affiliation_3},${c.affiliation_4},${c.affiliation_5},${c.affiliation_6},${c.affiliation_7},${c.affiliation_8},${c.affiliation_9},${c.country},${c.region},${c.fluency_1},${c.fluency_2},${c.fluency_3}`
    ).join('\n');
    
    await fs.writeFile(filePath, header + rows);
    console.log('CSV exported successfully');
  } catch (error) {
    console.error('Error exporting CSV:', error);
  }
}