import dotenv from 'dotenv';
import { connDB } from '../config/db.js';
import config from '../config/config.js';
import productModel from '../dao/models/productModel.js';

dotenv.config();

const VARIANTS = ['Pro', 'Plus', 'Max', 'Lite', 'Urban', 'Prime', 'Edge', 'Go', 'Flex', 'Elite'];

const CATEGORIES = [
    {
        name: 'Agro',
        codePrefix: 'AGRO',
        baseName: 'Producto Agro',
        basePrice: 98999,
        images: [
            'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Arte Libreria y Merceria',
        codePrefix: 'ARTL',
        baseName: 'Kit Arte',
        basePrice: 35999,
        images: [
            'https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Construccion',
        codePrefix: 'CONS',
        baseName: 'Herramienta Construccion',
        basePrice: 86999,
        images: [
            'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Industrias y Oficinas',
        codePrefix: 'INDO',
        baseName: 'Equipamiento Oficina',
        basePrice: 75999,
        images: [
            'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/1111370/pexels-photo-1111370.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Alimentos y Bebidas',
        codePrefix: 'ALIM',
        baseName: 'Pack Alimentos',
        basePrice: 15999,
        images: [
            'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Bebes',
        codePrefix: 'BEBE',
        baseName: 'Articulo Bebes',
        basePrice: 42999,
        images: [
            'https://images.pexels.com/photos/3933273/pexels-photo-3933273.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/3932946/pexels-photo-3932946.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Camaras y Accesorios',
        codePrefix: 'CAMA',
        baseName: 'Camara Digital',
        basePrice: 245999,
        images: [
            'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Instrumentos Musicales',
        codePrefix: 'MUSI',
        baseName: 'Instrumento Musical',
        basePrice: 119999,
        images: [
            'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/164936/pexels-photo-164936.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Antiguedades y Colecciones',
        codePrefix: 'ANTI',
        baseName: 'Pieza Coleccion',
        basePrice: 88999,
        images: [
            'https://images.pexels.com/photos/707582/pexels-photo-707582.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/161154/fountain-pen-antique-old-writing-161154.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Consolas y Videojuegos',
        codePrefix: 'GAME',
        baseName: 'Consola Gaming',
        basePrice: 329999,
        images: [
            'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Entradas para Eventos',
        codePrefix: 'EVEN',
        baseName: 'Entrada Evento',
        basePrice: 24999,
        images: [
            'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Joyas y Relojes',
        codePrefix: 'JOYA',
        baseName: 'Reloj Premium',
        basePrice: 147999,
        images: [
            'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Juegos y Juguetes',
        codePrefix: 'JUEG',
        baseName: 'Juguete',
        basePrice: 28999,
        images: [
            'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/163696/toy-train-track-wooden-163696.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Musica Peliculas y Series',
        codePrefix: 'MPSR',
        baseName: 'Edicion Coleccion',
        basePrice: 31999,
        images: [
            'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/1208549/pexels-photo-1208549.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Souvenirs Cotillon y Fiestas',
        codePrefix: 'SOUV',
        baseName: 'Articulo Fiesta',
        basePrice: 21999,
        images: [
            'https://images.pexels.com/photos/2072165/pexels-photo-2072165.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Libros Revistas y Comics',
        codePrefix: 'LIBR',
        baseName: 'Libro',
        basePrice: 17999,
        images: [
            'https://images.pexels.com/photos/4861373/pexels-photo-4861373.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Salud y Equipamiento Medico',
        codePrefix: 'SALU',
        baseName: 'Equipo Medico',
        basePrice: 68999,
        images: [
            'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Televisores',
        codePrefix: 'TVIS',
        baseName: 'Smart TV',
        basePrice: 459999,
        images: [
            'https://images.pexels.com/photos/6782565/pexels-photo-6782565.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Mascotas',
        codePrefix: 'MASC',
        baseName: 'Producto Mascotas',
        basePrice: 26999,
        images: [
            'https://images.pexels.com/photos/5745221/pexels-photo-5745221.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Servicios',
        codePrefix: 'SERV',
        baseName: 'Servicio Especializado',
        basePrice: 79999,
        images: [
            'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/5691613/pexels-photo-5691613.jpeg?auto=compress&cs=tinysrgb&w=700'
        ]
    },
    {
        name: 'Otras categorias',
        codePrefix: 'OTRA',
        baseName: 'Producto General',
        basePrice: 78999,
        images: [
            'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=700',
            'https://images.pexels.com/photos/794754/pexels-photo-794754.jpeg?auto=compress&cs=tinysrgb&w=700'
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
        await productModel.deleteMany({});
        await productModel.insertMany(productsToSeed);

        const total = await productModel.countDocuments();
        console.log(`Seed complete. Created: ${productsToSeed.length}, Updated: 0, Total products: ${total}`);
        process.exit(0);
    } catch (error) {
        console.error('Product seed failed:', error.message);
        process.exit(1);
    }
}

runSeedProducts();
