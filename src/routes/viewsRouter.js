import CustomRouter from '../utils/customRouter.js';
import ProductRepository from '../repositories/ProductRepository.js';
import CartRepository from '../repositories/CartRepository.js';
import { protectedRoute, notAuthenticated } from '../middleware/auth.js';

const custom = new CustomRouter();
const productService = new ProductRepository();
const cartService = new CartRepository();

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

// Ruta raíz - Mostrar productos públicamente (ESTILO MERCADO LIBRE)
custom.get('/', async (req, res) => {
    try {
        const products = await productService.getAll(req.query);

        res.render('index', {
            title: 'E-Commerce',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(products.docs)),
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

        res.render('index', {
            title: 'Productos',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(products.docs)),
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