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
custom.put('/:cid', authPolicies, cartController.updateAllProducts);

// Actualizar cantidad de producto
custom.put('/:cid/product/:pid', authPolicies, cartController.updateProduct);

// Vaciar carrito
custom.delete('/:cid', authPolicies, cartController.clearCart);

export default custom.getRouter();