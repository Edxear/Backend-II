import { productDBManager } from '../dao/productDBManager.js';

class ProductRepository {
    constructor() {
        this.dao = new productDBManager();
    }

    async getAll(params) {
        return await this.dao.getAllProducts(params);
    }

    async getById(id) {
        return await this.dao.getProductByID(id);
    }

    async create(product) {
        // Business logic: ensure stock is not negative
        if (product.stock < 0) {
            throw new Error('Stock cannot be negative');
        }
        return await this.dao.createProduct(product);
    }

    async update(id, productUpdate) {
        // Business logic: validate update
        if (productUpdate.stock !== undefined && productUpdate.stock < 0) {
            throw new Error('Stock cannot be negative');
        }
        return await this.dao.updateProduct(id, productUpdate);
    }

    async delete(id) {
        return await this.dao.deleteProduct(id);
    }

    async checkStock(id, quantity) {
        const product = await this.getById(id);
        return product.stock >= quantity;
    }

    async reduceStock(id, quantity) {
        const product = await this.getById(id);
        if (product.stock < quantity) {
            throw new Error('Insufficient stock');
        }
        return await this.update(id, { stock: product.stock - quantity });
    }
}

export default ProductRepository;