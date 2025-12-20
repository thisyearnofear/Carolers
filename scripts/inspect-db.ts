import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

function getEnv(key: string) {
    const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
    const lines = envFile.split('\n');
    for (const line of lines) {
        const [k, v] = line.split('=');
        if (k?.trim() === key) {
            return v?.trim().replace(/^['"]|['"]$/g, '');
        }
    }
    return undefined;
}

async function checkSchema() {
    const dbUrl = getEnv('DATABASE_URL');
    if (!dbUrl) {
        console.error('DATABASE_URL not found in .env');
        return;
    }

    const connection = await mysql.createConnection(dbUrl);
    console.log('🔍 Inspecting carols table schema...');

    try {
        const [rows] = await connection.query('DESCRIBE carols');
        console.log('Columns in carols table:');
        console.table(rows);

        const [indexes] = await connection.query('SHOW INDEX FROM carols');
        console.log('Indexes in carols table:');
        console.table(indexes);
    } catch (error) {
        console.error('❌ Error inspecting schema:', error);
    } finally {
        await connection.end();
    }
}

checkSchema().then(() => process.exit(0));
