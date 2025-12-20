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

async function fixSchema() {
    const dbUrl = getEnv('DATABASE_URL');
    if (!dbUrl) {
        console.error('DATABASE_URL not found');
        return;
    }

    // TiDB connection config
    const connection = await mysql.createConnection({
        uri: dbUrl,
        ssl: {
            rejectUnauthorized: true,
        },
    });

    console.log('🚀 Manually adding missing columns...');

    try {
        // Add columns to events table
        console.log('Adding is_private and password to events...');
        try {
            await connection.query('ALTER TABLE events ADD COLUMN is_private INT DEFAULT 0');
            console.log('✅ Added is_private');
        } catch (e: any) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log('ℹ️ is_private already exists');
            else console.error('Error adding is_private:', e.message);
        }

        try {
            await connection.query('ALTER TABLE events ADD COLUMN password TEXT');
            console.log('✅ Added password');
        } catch (e: any) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log('ℹ️ password already exists');
            else console.error('Error adding password:', e.message);
        }

        console.log('✨ Manual migration complete!');
    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await connection.end();
    }
}

fixSchema().then(() => process.exit(0));
