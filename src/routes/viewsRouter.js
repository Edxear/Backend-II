import CustomRouter from '../utils/customRouter.js';
import { productDBManager } from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import { protectedRoute, notAuthenticated } from '../middleware/auth.js';

const custom = new CustomRouter();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

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

// Ruta raíz - redirige según autenticación
custom.get('/', (req, res) => {
    if (req.user) {
        res.redirect('/products');
    } else {
        res.redirect('/login');
    }
});

// Lista pública de productos
custom.get('/products', async (req, res) => {
    try {
        const products = await ProductService.getAllProducts(req.query);

        res.render('index', {
            title: 'Productos',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(products.docs)),
            user: req.user,
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

// Página de productos en tiempo real
custom.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductService.getAllProducts(req.query);
        res.render('realTimeProducts', { title: 'Productos', style: 'index.css', products: JSON.parse(JSON.stringify(products.docs)) });
    } catch (error) {
        console.error('Error rendering realtime products view:', error);
        res.status(500).render('notFound', { title: 'Not Found', style: 'index.css' });
    }
});

// Mostrar carrito (requiere autenticación)
custom.get('/cart/:cid', protectedRoute, async (req, res) => {
    try {
        const cart = await CartService.getProductsFromCartByID(req.params.cid);
        res.render('cart', { title: 'Carrito', style: 'index.css', products: JSON.parse(JSON.stringify(cart.products)) });
    } catch (error) {
        console.error('Error rendering cart view:', error);
        res.status(404).render('notFound', { title: 'Not Found', style: 'index.css' });
    }
});

export default custom.getRouter();