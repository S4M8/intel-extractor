class Citizen {
    constructor(data = {}) {
        this.URL = data.URL || '';
        this.Handle = data.Handle || '';
        this.Name = data.Name || '';
        this.MainOrg = data.MainOrg || '';
        this.Affiliations = [];
        this.Country = data.Country || '';
        this.Region = data.Region || '';
        this.Fluencies = data.Fluencies || [];
        this.CitizenRecord = data.CitizenRecord || '';
    }

    addAffiliation(affiliation) {
        if (this.Affiliations.length < 9 &&
            (affiliation.name || affiliation.sid || affiliation.rank) &&
            !this.Affiliations.some(a =>
                a.name === affiliation.name &&
                a.sid === affiliation.sid &&
                a.rank === affiliation.rank
            )) {
            this.Affiliations.push({
                name: affiliation.name,
                sid: affiliation.sid,
                rank: affiliation.rank
            });
        }
        if (affiliation.isMain) {
            this.MainOrg = affiliation.name;
        }
    }

    addFluency(language) {
        if (this.Fluencies.length < 3 && !this.Fluencies.includes(language)) {
            this.Fluencies.push(language);
            this.sortFluencies();
        }
    }

    sortFluencies() {
        this.Fluencies.sort((a, b) => a.localeCompare(b));
    }

    toCSV() {
        const affiliations = Array(9).fill('').map((_, i) =>
            this.Affiliations[i] ? `${this.Affiliations[i].name},${this.Affiliations[i].sid},${this.Affiliations[i].rank}` : ''
        );
        const fluencies = Array(3).fill('').map((_, i) => this.Fluencies[i] || '');

        return [
            this.URL,
            this.Handle,
            this.Name,
            this.MainOrg,
            ...affiliations,
            this.Country,
            this.Region,
            this.CitizenRecord, 
            ...fluencies
        ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
    }
}

module.exports = { Citizen };