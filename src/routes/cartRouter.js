import CustomRouter from '../utils/customRouter.js';
import { cartController } from '../controllers/cartController.js';

const custom = new CustomRouter();

const authPolicies = ['user', 'admin'];

// Obtener productos del carrito
custom.get('/:cid', authPolicies, cartController.getById);

// Crear carrito
custom.post('/', authPolicies, cartController.create);

// Agregar producto al carrito
custom.post('/:cid/product/:pid', authPolicies, cartController.addProduct);

// Eliminar producto del carrito
custom.delete('/:cid/product/:pid', authPolicies, cartController.removeProduct);

// Comprar carrito
custom.post('/:cid/purchase', authPolicies, cartController.purchase);

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