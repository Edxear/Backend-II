import CartRepository from '../repositories/CartRepository.js';

class CartController {
    constructor() {
        this.cartRepo = new CartRepository();
    }

    getById = async (req, res) => {
        try {
            const { cid } = req.params;
            const cart = await this.cartRepo.getById(cid);
            res.sendSuccess({ payload: cart });
        } catch (error) {
            console.error('Get cart error:', error);
            if (error.message.includes('no existe')) {
                return res.sendUserError('Cart not found', 404);
            }
            res.sendUserError(error.message, 400);
        }
    };

    create = async (req, res) => {
        try {
            const newCart = await this.cartRepo.create();
            res.sendCreated({
                message: 'Cart created successfully',
                payload: newCart
            });
        } catch (error) {
            console.error('Create cart error:', error);
            res.sendServerError(error.message, 500);
        }
    };

    addProduct = async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;

            // Validar cantidad (opcional, default a 1)
            const qty = quantity ? parseInt(quantity) : 1;
            if (isNaN(qty) || qty <= 0) {
                return res.sendUserError('Invalid quantity', 400);
            }

            const updatedCart = await this.cartRepo.addProduct(cid, pid, qty);
            res.sendSuccess({
                message: 'Product added to cart',
                payload: updatedCart
            });
        } catch (error) {
            console.error('Add product to cart error:', error);
            if (error.message.includes('no existe')) {
                return res.sendUserError('Cart or product not found', 404);
            }
            if (error.message.includes('Insufficient stock')) {
                return res.sendUserError('Insufficient stock', 400);
            }
            res.sendUserError(error.message, 400);
        }
    };

    removeProduct = async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const updatedCart = await this.cartRepo.removeProduct(cid, pid);

            res.sendSuccess({
                message: 'Product removed from cart',
                payload: updatedCart
            });
        } catch (error) {
            console.error('Remove product from cart error:', error);
            if (error.message.includes('no existe')) {
                return res.sendUserError('Cart or product not found', 404);
            }
            res.sendUserError(error.message, 400);
        }
    };

    purchase = async (req, res) => {
        try {
            const { cid } = req.params;

            // Validar que el usuario esté autenticado
            if (!req.user) {
                return res.sendUserError('User not authenticated', 401);
            }

            const result = await this.cartRepo.purchase(cid, req.user);

            if (result.success) {
                res.sendSuccess({
                    message: 'Purchase completed',
                    payload: {
                        ticket: result.ticket,
                        failedProducts: result.failedProducts || []
                    }
                });
            } else {
                res.sendUserError(result.message, 400);
            }
        } catch (error) {
            console.error('Purchase cart error:', error);
            if (error.message.includes('no existe')) {
                return res.sendUserError('Cart not found', 404);
            }
            res.sendUserError(error.message, 400);
        }
    };

    updateAllProducts = async (req, res) => {
        try {
            const { cid } = req.params;
            const { products } = req.body;

            if (!products || !Array.isArray(products)) {
                return res.sendUserError('Products must be an array', 400);
            }

            const updatedCart = await this.cartRepo.updateProduct(cid, null, null);
            // Note: This is a simplified implementation - you may need to adjust based on your DAO
            const result = await this.cartRepo.dao.updateAllProducts(cid, products);
            
            res.sendSuccess({
                message: 'Cart updated successfully',
                payload: result
            });
        } catch (error) {
            console.error('Update all products error:', error);
            res.sendUserError(error.message, 400);
        }
    };

    updateProduct = async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;

            if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
                return res.sendUserError('Valid quantity is required', 400);
            }

            const updatedCart = await this.cartRepo.updateProduct(cid, pid, parseInt(quantity));
            
            res.sendSuccess({
                message: 'Product quantity updated',
                payload: updatedCart
            });
        } catch (error) {
            console.error('Update product quantity error:', error);
            if (error.message.includes('no existe')) {
                return res.sendUserError('Cart or product not found', 404);
            }
            res.sendUserError(error.message, 400);
        }
    };

    clearCart = async (req, res) => {
        try {
            const { cid } = req.params;
            const clearedCart = await this.cartRepo.clear(cid);

            res.sendSuccess({
                message: 'Cart cleared successfully',
                payload: clearedCart
            });
        } catch (error) {
            console.error('Clear cart error:', error);
            if (error.message.includes('no existe')) {
                return res.sendUserError('Cart not found', 404);
            }
            res.sendUserError(error.message, 400);
        }
    };
}

export const cartController = new CartController();
