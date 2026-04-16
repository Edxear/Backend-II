import dotenv from 'dotenv';
import { connDB } from '../config/db.js';
import config from '../config/config.js';
import productModel from '../dao/models/productModel.js';

dotenv.config();

const VARIANTS = ['Pro', 'Plus', 'Max', 'Lite', 'Urban', 'Prime', 'Edge', 'Go', 'Flex', 'Elite'];

const CATEGORIES = [
    {
        name: 'Autos, Motos y Otros',
        codePrefix: 'AUTO',
        baseName: 'Accesorio Auto',
        basePrice: 78999,
        images: [
            'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Celulares y Telefonos',
        codePrefix: 'CEL',
        baseName: 'Smartphone',
        basePrice: 699999,
        images: [
            'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Electrodomesticos y Aires Ac.',
        codePrefix: 'ELEC',
        baseName: 'Electrodomestico',
        basePrice: 189999,
        images: [
            'https://images.pexels.com/photos/4108712/pexels-photo-4108712.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/5824870/pexels-photo-5824870.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Herramientas',
        codePrefix: 'TOOL',
        baseName: 'Kit Herramientas',
        basePrice: 64999,
        images: [
            'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Accesorios para Vehiculos',
        codePrefix: 'VEH',
        baseName: 'Accesorio Vehicular',
        basePrice: 45999,
        images: [
            'https://images.pexels.com/photos/11139552/pexels-photo-11139552.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Ropa y Accesorios',
        codePrefix: 'ROPA',
        baseName: 'Prenda',
        basePrice: 35999,
        images: [
            'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Deportes y Fitness',
        codePrefix: 'SPORT',
        baseName: 'Equipo Fitness',
        basePrice: 52999,
        images: [
            'https://images.pexels.com/photos/4397840/pexels-photo-4397840.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Belleza y Cuidado Personal',
        codePrefix: 'BEAU',
        baseName: 'Kit Cuidado Personal',
        basePrice: 28999,
        images: [
            'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Hogar, Muebles y Jardin',
        codePrefix: 'HOME',
        baseName: 'Producto Hogar',
        basePrice: 118999,
        images: [
            'https://images.pexels.com/photos/2762247/pexels-photo-2762247.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Computacion',
        codePrefix: 'COMP',
        baseName: 'Equipo Computacion',
        basePrice: 329999,
        images: [
            'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/250459/pexels-photo-250459.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Inmuebles',
        codePrefix: 'INMO',
        baseName: 'Publicacion Inmueble',
        basePrice: 1299999,
        images: [
            'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Electronica, Audio y Video',
        codePrefix: 'EAV',
        baseName: 'Dispositivo Electronico',
        basePrice: 249999,
        images: [
            'https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    }
];

const buildProducts = () => {
    const products = [];

    CATEGORIES.forEach((categoryConfig) => {
        VARIANTS.forEach((variant, idx) => {
            const codeNumber = String(idx + 1).padStart(3, '0');
            const price = Math.round(categoryConfig.basePrice * (1 + idx * 0.07));
            const stock = 8 + (idx % 10) * 3;

            products.push({
                title: `${categoryConfig.baseName} ${variant}`,
                description: `${categoryConfig.baseName} version ${variant} con excelente relacion precio-calidad para ${categoryConfig.name.toLowerCase()}.`,
                code: `${categoryConfig.codePrefix}-${codeNumber}`,
                price,
                stock,
                category: categoryConfig.name,
                thumbnails: [categoryConfig.images[idx % categoryConfig.images.length]]
            });
        });
    });

    return products;
};

async function runSeedProducts() {
    try {
        await connDB(config.MONGODB_URI, config.DB_NAME);

        const productsToSeed = buildProducts();
        let created = 0;
        let updated = 0;

        for (const product of productsToSeed) {
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
