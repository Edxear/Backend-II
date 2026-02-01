import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import { protectedRoute, notAuthenticated, authMiddleware } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// GET /login - Mostrar formulario de login (solo usuarios no autenticados)
router.get('/login', notAuthenticated, (req, res) => {
    const error = req.query.error || null;
    res.render('login', {
        title: 'Login',
        style: 'index.css',
        error: error
    });
});

// GET /current - Mostrar datos del usuario actual (protegido)
router.get('/current', protectedRoute, (req, res) => {
    res.render('current', {
        title: 'Current User',
        style: 'index.css',
        user: req.user
    });
});

// Ruta raíz - redirige según autenticación
router.get('/', (req, res) => {
    if (req.user) {
        res.redirect('/products');
    } else {
        res.redirect('/login');
    }
});

router.get('/products', async (req, res) => {
    const products = await ProductService.getAllProducts(req.query);

    res.render(
        'index',
        {
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
        }
    )
});

router.get('/realtimeproducts', async (req, res) => {
    const products = await ProductService.getAllProducts(req.query);
    res.render(
        'realTimeProducts',
        {
            title: 'Productos',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(products.docs))
        }
    )
});

router.get('/cart/:cid', async (req, res) => {
    const response = await CartService.getProductsFromCartByID(req.params.cid);

    if (response.status === 'error') {
        return res.render(
            'notFound',
            {
                title: 'Not Found',
                style: 'index.css'
            }
        );
    }

    res.render(
        'cart',
        {
            title: 'Carrito',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(response.products))
        }
    )
});

export default router;