import CustomRouter from '../utils/customRouter.js';
import { productDBManager } from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';

const custom = new CustomRouter();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

const authPolicies = ['user', 'admin'];

// Obtener productos del carrito
custom.get('/:cid', authPolicies, async (req, res) => {
    try {
        const result = await CartService.getProductsFromCartByID(req.params.cid);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Get cart error:', error);
        res.sendUserError(error.message, 400);
    }
});

// Crear carrito
custom.post('/', authPolicies, async (req, res) => {
    try {
        const result = await CartService.createCart();
        res.sendCreated({ payload: result });
    } catch (error) {
        console.error('Create cart error:', error);
        res.sendUserError(error.message, 400);
    }
});

// Agregar producto al carrito
custom.post('/:cid/product/:pid', authPolicies, async (req, res) => {
    try {
        const result = await CartService.addProductByID(req.params.cid, req.params.pid);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Add product to cart error:', error);
        res.sendUserError(error.message, 400);
    }
});

// Eliminar producto del carrito
custom.delete('/:cid/product/:pid', authPolicies, async (req, res) => {
    try {
        const result = await CartService.deleteProductByID(req.params.cid, req.params.pid);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Delete product from cart error:', error);
        res.sendUserError(error.message, 400);
    }
});

// Reemplazar todos los productos del carrito
custom.put('/:cid', authPolicies, async (req, res) => {
    try {
        const result = await CartService.updateAllProducts(req.params.cid, req.body.products);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Update all products error:', error);
        res.sendUserError(error.message, 400);
    }
});

// Actualizar cantidad de producto
custom.put('/:cid/product/:pid', authPolicies, async (req, res) => {
    try {
        const result = await CartService.updateProductByID(req.params.cid, req.params.pid, req.body.quantity);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Update product quantity error:', error);
        res.sendUserError(error.message, 400);
    }
});

// Vaciar carrito
custom.delete('/:cid', authPolicies, async (req, res) => {
    try {
        const result = await CartService.deleteAllProducts(req.params.cid);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Delete all products error:', error);
        res.sendUserError(error.message, 400);
    }
});

export default custom.getRouter();