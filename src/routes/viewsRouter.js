import CustomRouter from '../utils/customRouter.js';
import ProductRepository from '../repositories/ProductRepository.js';
import CartRepository from '../repositories/CartRepository.js';
import { protectedRoute, notAuthenticated } from '../middleware/auth.js';

const custom = new CustomRouter();
const productService = new ProductRepository();
const cartService = new CartRepository();

const mapProductsForView = (docs = []) => {
    return docs.map((product) => {
        const normalizedThumbnails = Array.isArray(product.thumbnails)
            ? product.thumbnails.filter((thumb) => typeof thumb === 'string' && thumb.trim().length > 0)
            : (typeof product.thumbnails === 'string' && product.thumbnails.trim().length > 0
                ? [product.thumbnails.trim()]
                : []);
        return {
            ...product,
            formattedPrice: Number(product.price || 0).toLocaleString('es-AR'),
            imageUrl: normalizedThumbnails[0] || '/img/product-placeholder.svg'
        };
    });
};

const SHOWCASE_OFFERS = [
    { title: 'Smartphone Nova X12 256GB', category: 'Celulares y Telefonos', price: 899999, discountPct: 22, imageUrl: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=700', freeShipping: true },
    { title: 'Taladro Pro Builder 18V', category: 'Construccion', price: 189999, discountPct: 17, imageUrl: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=700', freeShipping: false },
    { title: 'TV 55 Pulgadas 4K Smart', category: 'Televisores', price: 649999, discountPct: 28, imageUrl: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=700', freeShipping: true },
    { title: 'Kit Cuidado Facial Premium', category: 'Belleza y Cuidado Personal', price: 65999, discountPct: 19, imageUrl: 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=700', freeShipping: false },
    { title: 'Bicicleta Urbana Active 700', category: 'Deportes y Fitness', price: 389999, discountPct: 24, imageUrl: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=700', freeShipping: true }
];

const CATEGORY_CARDS = [
    { key: 'Agro', label: 'Agro', imageUrl: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Arte Libreria y Merceria', label: 'Arte, Libreria y Merceria', imageUrl: 'https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Construccion', label: 'Construccion', imageUrl: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Industrias y Oficinas', label: 'Industrias y Oficinas', imageUrl: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Alimentos y Bebidas', label: 'Alimentos y Bebidas', imageUrl: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Bebes', label: 'Bebes', imageUrl: 'https://images.pexels.com/photos/3933273/pexels-photo-3933273.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Camaras y Accesorios', label: 'Camaras y Accesorios', imageUrl: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Instrumentos Musicales', label: 'Instrumentos Musicales', imageUrl: 'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Antiguedades y Colecciones', label: 'Antiguedades y Colecciones', imageUrl: 'https://images.pexels.com/photos/707582/pexels-photo-707582.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Consolas y Videojuegos', label: 'Consolas y Videojuegos', imageUrl: 'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Entradas para Eventos', label: 'Entradas para Eventos', imageUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Joyas y Relojes', label: 'Joyas y Relojes', imageUrl: 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Juegos y Juguetes', label: 'Juegos y Juguetes', imageUrl: 'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Musica Peliculas y Series', label: 'Musica, Peliculas y Series', imageUrl: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Souvenirs Cotillon y Fiestas', label: 'Souvenirs, Cotillon y Fiestas', imageUrl: 'https://images.pexels.com/photos/2072165/pexels-photo-2072165.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Libros Revistas y Comics', label: 'Libros, Revistas y Comics', imageUrl: 'https://images.pexels.com/photos/4861373/pexels-photo-4861373.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Salud y Equipamiento Medico', label: 'Salud y Equipamiento Medico', imageUrl: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Televisores', label: 'Televisores', imageUrl: 'https://images.pexels.com/photos/6782565/pexels-photo-6782565.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Mascotas', label: 'Mascotas', imageUrl: 'https://images.pexels.com/photos/5745221/pexels-photo-5745221.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Servicios', label: 'Servicios', imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { key: 'Otras categorias', label: 'Otras categorias', imageUrl: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=400' }
];

const chunkArray = (arr, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) chunks.push(arr.slice(i, i + chunkSize));
    return chunks;
};

const buildHomeData = (mappedProducts) => {
    const deals = SHOWCASE_OFFERS.map((offer) => {
        const originalPrice = Math.round(offer.price * (100 / (100 - offer.discountPct)));
        return {
            ...offer,
            formattedPrice: Number(offer.price).toLocaleString('es-AR'),
            originalFormattedPrice: originalPrice.toLocaleString('es-AR'),
        };
    });

    const categorySlides = chunkArray(CATEGORY_CARDS, 7);

    return { deals, categorySlides };
};

// GET /register - Mostrar formulario de registro
custom.get('/register', notAuthenticated, (req, res) => {
    const error = req.query.error || null;
    res.render('register', {
        title: 'Registro',
        style: 'index.css',
        error: error
    });
});

// GET /login - Mostrar formulario de login (solo usuarios no autenticados)
custom.get('/login', notAuthenticated, (req, res) => {
    const error = req.query.error || null;
    res.render('login', {
        title: 'Login',
        style: 'index.css',
        error: error
    });
});

// GET /current - Mostrar datos del usuario actual (protegido)
custom.get('/current', protectedRoute, (req, res) => {
    res.render('current', {
        title: 'Current User',
        style: 'index.css',
        user: req.user
    });
});

// Ruta raíz - Mostrar productos públicamente
custom.get('/', async (req, res) => {
    try {
        const products = await productService.getAll(req.query);
        const mappedProducts = mapProductsForView(JSON.parse(JSON.stringify(products.docs)));
        const { deals, categorySlides } = buildHomeData(mappedProducts);

        res.render('index', {
            title: 'E-Commerce',
            style: 'index.css',
            products: mappedProducts,
            deals,
            categorySlides,
            pagination: {
                page: products.page,
                totalPages: products.totalPages,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
            },
            user: req.user,
            isLoggedIn: !!req.user,
            prevLink: {
                exist: products.prevLink ? true : false,
                link: products.prevLink
            },
            nextLink: {
                exist: products.nextLink ? true : false,
                link: products.nextLink
            }
        });
    } catch (error) {
        console.error('Error rendering products view:', error);
        res.status(500).render('notFound', { title: 'Not Found', style: 'index.css' });
    }
});

// GET /products - También accesible como /products (redundante con /, pero por compatibilidad)
custom.get('/products', async (req, res) => {
    try {
        const products = await productService.getAll(req.query);
        const mappedProducts = mapProductsForView(JSON.parse(JSON.stringify(products.docs)));
        const { deals, categorySlides } = buildHomeData(mappedProducts);

        res.render('index', {
            title: 'Productos',
            style: 'index.css',
            products: mappedProducts,
            deals,
            categorySlides,
            pagination: {
                page: products.page,
                totalPages: products.totalPages,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
            },
            user: req.user,
            isLoggedIn: !!req.user,
            prevLink: {
                exist: products.prevLink ? true : false,
                link: products.prevLink
            },
            nextLink: {
                exist: products.nextLink ? true : false,
                link: products.nextLink
            }
        });
    } catch (error) {
        console.error('Error rendering products view:', error);
        res.status(500).render('notFound', { title: 'Not Found', style: 'index.css' });
    }
});

// GET /realtimeproducts - Página de productos en tiempo real
custom.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productService.getAll(req.query);
        res.render('realTimeProducts', { 
            title: 'Productos', 
            style: 'index.css', 
            products: JSON.parse(JSON.stringify(products.docs)),
            user: req.user,
            isLoggedIn: !!req.user
        });
    } catch (error) {
        console.error('Error rendering realtime products view:', error);
        res.status(500).render('notFound', { title: 'Not Found', style: 'index.css' });
    }
});

// GET /cart/:cid - Mostrar carrito (REQUIERE AUTENTICACIÓN)
custom.get('/cart/:cid', protectedRoute, async (req, res) => {
    try {
        const cart = await cartService.getById(req.params.cid);
        res.render('cart', { 
            title: 'Carrito', 
            style: 'index.css', 
            products: JSON.parse(JSON.stringify(cart.products)),
            user: req.user,
            isLoggedIn: true
        });
    } catch (error) {
        console.error('Error rendering cart view:', error);
        res.status(404).render('notFound', { title: 'Not Found', style: 'index.css' });
    }
});

export default custom.getRouter();