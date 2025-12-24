const { Client } = require('pg');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};

const setupDatabase = async () => {
    console.log('\n--- Configurare Bază de Date Biblioteca Virtuală ---\n');

    const host = await askQuestion('Host (default: localhost): ') || 'localhost';
    const port = await askQuestion('Port (default: 5432): ') || '5432';
    const user = await askQuestion('User (default: postgres): ') || 'postgres';
    const password = await askQuestion('Parola: ');
    const dbName = await askQuestion('Nume Bază de Date (default: biblioteca_virtuala): ') || 'biblioteca_virtuala';

    // 1. Connect to default 'postgres' db to create the new one
    const client = new Client({
        user,
        host,
        database: 'postgres',
        password,
        port,
    });

    try {
        await client.connect();

        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (res.rowCount === 0) {
            console.log(`\nCreare bază de date '${dbName}'...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log('Baza de date a fost creată cu succes!');
        } else {
            console.log(`\nBaza de date '${dbName}' există deja.`);
        }

        // 2. Update .env file
        const envPath = path.join(__dirname, '.env');
        const envContent = `PORT=5000
DB_NAME=${dbName}
DB_USER=${user}
DB_PASS=${password}
DB_HOST=${host}
DB_DIALECT=postgres
JWT_SECRET=supersecretkey123
EMAIL_USER=
EMAIL_PASS=
`;

        fs.writeFileSync(envPath, envContent);
        console.log(`\nFișierul .env a fost actualizat/creat!`);

    } catch (err) {
        console.error('\nEroare:', err.message);
        if (err.code === '28P01') {
            console.error('Autentificare eșuată! Verifică userul și parola.');
        }
    } finally {
        await client.end();
        rl.close();
    }
};

setupDatabase();
