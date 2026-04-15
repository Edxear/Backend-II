import dotenv from 'dotenv';
import { connDB } from '../config/db.js';
import config from '../config/config.js';
import productModel from '../dao/models/productModel.js';

dotenv.config();

const sampleProducts = [
    {
        title: 'Auriculares Inalambricos NovaSound X1',
        description: 'Sonido envolvente, cancelacion de ruido y bateria de larga duracion para todo el dia.',
        code: 'NS-X1-001',
        price: 15999,
        stock: 24,
        category: 'Audio',
        thumbnails: []
    },
    {
        title: 'Smartwatch Pulse Active 2',
        description: 'Monitoreo de salud, GPS y pantalla AMOLED para entrenamiento diario.',
        code: 'PA2-002',
        price: 22490,
        stock: 18,
        category: 'Wearables',
        thumbnails: []
    },
    {
        title: 'Notebook Orbit 14 Ryzen 7',
        description: 'Rendimiento alto para estudio y trabajo con 16GB RAM y SSD de 512GB.',
        code: 'OB14-R7-003',
        price: 739999,
        stock: 7,
        category: 'Computacion',
        thumbnails: []
    },
    {
        title: 'Camara Instantanea LumiShot Mini',
        description: 'Captura momentos y obtiene impresiones al instante con filtros creativos.',
        code: 'LSM-004',
        price: 68990,
        stock: 12,
        category: 'Fotografia',
        thumbnails: []
    },
    {
        title: 'Silla Ergonomica CoreFlex',
        description: 'Respaldo lumbar ajustable y apoyabrazos 3D para largas jornadas.',
        code: 'CF-ERG-005',
        price: 198500,
        stock: 9,
        category: 'Hogar y Oficina',
        thumbnails: []
    },
    {
        title: 'Teclado Mecanico Zenith RGB',
        description: 'Switches tactiles, retroiluminacion RGB personalizable y estructura de aluminio.',
        code: 'ZEN-RGB-006',
        price: 48999,
        stock: 15,
        category: 'Gaming',
        thumbnails: []
    },
    {
        title: 'Freidora de Aire SkyChef 6L',
        description: 'Cocina saludable con aire caliente, panel digital y programas preconfigurados.',
        code: 'SC-6L-007',
        price: 79990,
        stock: 13,
        category: 'Electrohogar',
        thumbnails: []
    },
    {
        title: 'Mochila Urbana Atlas Pro',
        description: 'Compartimento para notebook 15.6, material impermeable y puertos externos.',
        code: 'ATLAS-PRO-008',
        price: 32990,
        stock: 26,
        category: 'Accesorios',
        thumbnails: []
    }
];

async function runSeedProducts() {
    try {
        await connDB(config.MONGODB_URI, config.DB_NAME);

        let created = 0;
        let updated = 0;

        for (const product of sampleProducts) {
            const existing = await productModel.findOne({ code: product.code });

            if (!existing) {
                await productModel.create(product);
                created += 1;
                console.log(`Created: ${product.code}`);
            } else {
                await productModel.updateOne({ code: product.code }, { $set: product });
                updated += 1;
                console.log(`Updated: ${product.code}`);
            }
        }

        const total = await productModel.countDocuments();
        console.log(`Seed complete. Created: ${created}, Updated: ${updated}, Total products: ${total}`);
        process.exit(0);
    } catch (error) {
        console.error('Product seed failed:', error.message);
        process.exit(1);
    }
}

runSeedProducts();
