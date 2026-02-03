import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connDB } from '../config/db.js';
import UserModel from '../dao/models/userModel.js';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'integrative_practice';

function mapNombreToNames(nombre) {
    if (!nombre || typeof nombre !== 'string') return { first_name: 'Anon', last_name: 'User' };
    const parts = nombre.trim().split(/\s+/);
    const first_name = parts[0] || 'Anon';
    const last_name = parts.slice(1).join(' ') || ' ';
    return { first_name, last_name };
}

async function run() {
    const rl = createInterface({ input, output });

    try {
        await connDB(MONGODB_URI, DB_NAME);

        const filePath = path.resolve(process.cwd(), 'src', 'usuarios.json');
        const raw = await fs.promises.readFile(filePath, 'utf-8');
        const users = JSON.parse(raw);

        let inserted = 0;
        let updated = 0;
        let skipped = 0;

        let insertAll = false;
        let skipAll = false;
        let updateAll = false;
        let skipUpdateAll = false;

        for (const u of users) {
            const email = (u.email || '').toLowerCase();
            if (!email) {
                console.warn('Usuario sin correo electrónico:', u);
                skipped++;
                continue;
            }

            const { first_name, last_name } = mapNombreToNames(u.nombre);
            const userDoc = {
                first_name,
                last_name,
                email,
                password: u.password, 
                role: u.rol || 'user'
            };

            const existing = await UserModel.findOne({ email });

            if (!existing) {
                if (!insertAll && !skipAll) {
                    const ans = (await rl.question(`Insert user ${email} (${first_name} ${last_name})? (y/n/a=all/s=skip all/q=quit) `)).trim().toLowerCase();
                    if (ans === 'a') insertAll = true;
                    else if (ans === 's') { skipAll = true; continue; }
                    else if (ans === 'q') { console.log('Salida anticipada por solicitud del usuario.'); break; }
                    else if (ans !== 'y') { console.log('Skipping user:', email); skipped++; continue; }
                }

                if (skipAll) { skipped++; continue; }

                await UserModel.create(userDoc);
                console.log('Inserted user:', email);
                inserted++;
            } else {
                if (!updateAll && !skipUpdateAll) {
                    const ans = (await rl.question(`User ${email} exists. Update with JSON data? (y/n/a=update all/s=skip all/q=quit) `)).trim().toLowerCase();
                    if (ans === 'a') updateAll = true;
                    else if (ans === 's') { skipUpdateAll = true; skipped++; continue; }
                    else if (ans === 'q') { console.log('Salida anticipada por solicitud del usuario.'); break; }
                    else if (ans !== 'y') { console.log('Skipping update for:', email); skipped++; continue; }
                }

                if (skipUpdateAll) { skipped++; continue; }

                await UserModel.findOneAndUpdate({ email }, userDoc, { new: true });
                console.log('Updated user:', email);
                updated++;
            }
        }

        rl.close();
        console.log(`\nSeed complete. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
        process.exit(0);
    } catch (error) {
        rl.close();
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

run();
