import { cartDBManager } from '../dao/cartDBManager.js';
import ProductRepository from './ProductRepository.js';
import TicketRepository from './TicketRepository.js';

class CartRepository {
    constructor() {
        this.productRepo = new ProductRepository();
        this.ticketRepo = new TicketRepository();
        this.dao = new cartDBManager(this.productRepo.dao);
    }

    async getAll() {
        return await this.dao.getAllCarts();
    }

    async getById(id) {
        return await this.dao.getProductsFromCartByID(id);
    }

    async create() {
        return await this.dao.createCart();
    }

    async addProduct(cartId, productId, quantity = 1) {
        // Business logic: check if product exists and has stock
        const product = await this.productRepo.getById(productId);
        if (product.stock < quantity) {
            throw new Error('Insufficient stock');
        }
        return await this.dao.addProductByID(cartId, productId);
    }

    async removeProduct(cartId, productId) {
        return await this.dao.deleteProductByID(cartId, productId);
    }

    async updateProduct(cartId, productId, quantity) {
        return await this.dao.updateProductByID(cartId, productId, quantity);
    }

    async clear(cartId) {
        return await this.dao.deleteAllProducts(cartId);
    }

    async purchase(cartId, user) {
        const cart = await this.getById(cartId);
        let total = 0;
        const purchasedProducts = [];
        const failedProducts = [];

        for (const item of cart.products) {
            const product = item.product;
            if (product.stock >= item.quantity) {
                // Reduce stock
                await this.productRepo.reduceStock(product._id, item.quantity);
                total += product.price * item.quantity;
                purchasedProducts.push({
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price
                });
            } else {
                failedProducts.push(product._id);
            }
        }

        // Create ticket if there are purchased products
        if (purchasedProducts.length > 0) {
            const ticket = await this.ticketRepo.create({
                amount: total,
                purchaser: user.email,
                products: purchasedProducts
            });

            // Clear purchased products from cart
            const remainingProducts = cart.products.filter(item => 
                failedProducts.includes(item.product._id.toString())
            );
            await this.dao.updateAllProducts(cartId, remainingProducts);

            return {
                success: true,
                ticket,
                failedProducts
            };
        } else {
            return {
                success: false,
                message: 'No products could be purchased due to insufficient stock'
            };
        }
    }
}

export default CartRepository;