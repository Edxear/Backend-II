import CustomRouter from '../utils/customRouter.js';
import ProductRepository from '../repositories/ProductRepository.js';
import CartRepository from '../repositories/CartRepository.js';
import { protectedRoute, notAuthenticated } from '../middleware/auth.js';

const custom = new CustomRouter();
const productService = new ProductRepository();
const cartService = new CartRepository();

const mapProductsForView = (docs = []) => {
    return docs.map((product) => {
        const hasThumbnails = Array.isArray(product.thumbnails) && product.thumbnails.length > 0;
        return {
            ...product,
            formattedPrice: Number(product.price || 0).toLocaleString('es-AR'),
            imageUrl: hasThumbnails ? product.thumbnails[0] : '/img/product-placeholder.svg'
        };
    });
};

const CATEGORY_ICONS = {
    Audio: '🎧', Wearables: '⌚', Computacion: '💻',
    Fotografia: '📷', 'Hogar y Oficina': '🏠', Gaming: '🎮',
    Electrohogar: '🏡', Accesorios: '🎒', Celulares: '📱',
    Electronica: '⚡', Calzado: '👟', Ropa: '👕', General: '🛍️'
};

const SALE_DISCOUNTS = [15, 20, 25, 30, 35];

const buildFeaturedAreas = () => {
    const createOffer = ({ title, category, price, discountPct, imageUrl }) => {
        const originalPrice = Math.round(price * (100 / (100 - discountPct)));
        return {
            title,
            category,
            formattedPrice: Number(price).toLocaleString('es-AR'),
            originalFormattedPrice: originalPrice.toLocaleString('es-AR'),
            discountPct,
            imageUrl
        };
    };

    return [
        {
            name: 'Celulares',
            icon: '📱',
            products: [
                createOffer({ title: 'Smartphone Nova X12 256GB', category: 'Celulares', price: 899999, discountPct: 22, imageUrl: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=700' }),
                createOffer({ title: 'Smartphone Vision Pro 5G 128GB', category: 'Celulares', price: 749999, discountPct: 18, imageUrl: 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=700' }),
                createOffer({ title: 'Smartphone Urban Max 512GB', category: 'Celulares', price: 1099999, discountPct: 28, imageUrl: 'https://images.pexels.com/photos/1275229/pexels-photo-1275229.jpeg?auto=compress&cs=tinysrgb&w=700' }),
                createOffer({ title: 'Smartphone Lite Go 128GB', category: 'Celulares', price: 589999, discountPct: 15, imageUrl: 'https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg?auto=compress&cs=tinysrgb&w=700' }),
                createOffer({ title: 'Smartphone Zoom Plus 256GB', category: 'Celulares', price: 839999, discountPct: 25, imageUrl: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=700' })
            ]
        },
        {
            name: 'Calzado',
            icon: '👟',
            products: [
                createOffer({ title: 'Zapatillas Runner One', category: 'Calzado', price: 119999, discountPct: 20, imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=700' }),
                createOffer({ title: 'Zapatillas Street Urban', category: 'Calzado', price: 98999, discountPct: 18, imageUrl: 'https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=700' }),
                createOffer({ title: 'Botas Trek Pro', category: 'Calzado', price: 156999, discountPct: 24, imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=700' }),
                createOffer({ title: 'Zapatillas Court Classic', category: 'Calzado', price: 87999, discountPct: 16, imageUrl: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=700' }),
                createOffer({ title: 'Sneakers Air Flex', category: 'Calzado', price: 132499, discountPct: 21, imageUrl: 'https://images.pexels.com/photos/1456735/pexels-photo-1456735.jpeg?auto=compress&cs=tinysrgb&w=700' })
            ]
        }
    ];
};

const buildHomeData = (mappedProducts) => {
    const shuffledProducts = [...mappedProducts].sort(() => Math.random() - 0.5);

    // "Ofertas del día": 5 productos aleatorios con descuentos de ejemplo
    const deals = shuffledProducts.slice(0, 5).map((p, i) => {
        const pct = SALE_DISCOUNTS[i];
        const originalPrice = Math.round((Number(p.price) || 0) * (100 / (100 - pct)));
        return {
            ...p,
            discountPct: pct,
            originalFormattedPrice: originalPrice.toLocaleString('es-AR'),
            freeShipping: i % 3 !== 2
        };
    });

    // "Más vendidos": agrupar por categoría, hasta 4 productos c/u
    const catMap = {};
    mappedProducts.forEach(p => {
        const cat = p.category || 'General';
        if (!catMap[cat]) catMap[cat] = [];
        if (catMap[cat].length < 4) catMap[cat].push(p);
    });

    const preferredAreas = ['Celulares', 'Electronica', 'Calzado', 'Computacion', 'Gaming', 'Audio'];
    const sortedEntries = Object.entries(catMap).sort(([a], [b]) => {
        const ai = preferredAreas.indexOf(a);
        const bi = preferredAreas.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });

    const categoryGroups = sortedEntries.map(([name, products]) => ({
        name,
        icon: CATEGORY_ICONS[name] || '🛍️',
        products
    }));

    const featuredAreas = buildFeaturedAreas();

    return { deals, categoryGroups, featuredAreas };
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
        const { deals, categoryGroups, featuredAreas } = buildHomeData(mappedProducts);

        res.render('index', {
            title: 'E-Commerce',
            style: 'index.css',
            products: mappedProducts,
            deals,
            hasDeals: deals.length > 0,
            categoryGroups,
            hasCategoryGroups: categoryGroups.length > 0,
            featuredAreas,
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
        const { deals, categoryGroups, featuredAreas } = buildHomeData(mappedProducts);

        res.render('index', {
            title: 'Productos',
            style: 'index.css',
            products: mappedProducts,
            deals,
            hasDeals: deals.length > 0,
            categoryGroups,
            hasCategoryGroups: categoryGroups.length > 0,
            featuredAreas,
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