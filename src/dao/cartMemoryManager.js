import crypto from 'crypto';

// In-memory cart store (resets on each cold start - acceptable for Vercel demo)
const carts = new Map();

class cartMemoryManager {
    constructor(productManager) {
        this.productManager = productManager;
    }

    async getAllCarts() {
        return Array.from(carts.values());
    }

    async getProductsFromCartByID(cid) {
        const cart = carts.get(String(cid));
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        // Populate product details
        const populated = await Promise.all(
            cart.products.map(async (item) => {
                try {
                    const product = await this.productManager.getProductByID(item.product);
                    return { ...item, product };
                } catch {
                    return { ...item, product: null };
                }
            })
        );

        return { _id: cart._id, products: populated };
    }

    async createCart() {
        const id = crypto.randomBytes(12).toString('hex');
        const cart = { _id: id, products: [] };
        carts.set(id, cart);
        return cart;
    }

    async addProductByID(cid, pid) {
        await this.productManager.getProductByID(pid);

        const cart = carts.get(String(cid));
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        const existing = cart.products.find(item => String(item.product) === String(pid));
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.products.push({ product: String(pid), quantity: 1 });
        }

        return this.getProductsFromCartByID(cid);
    }

    async deleteProductByID(cid, pid) {
        await this.productManager.getProductByID(pid);

        const cart = carts.get(String(cid));
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        cart.products = cart.products.filter(item => String(item.product) !== String(pid));
        return this.getProductsFromCartByID(cid);
    }

    async updateAllProducts(cid, newProducts) {
        for (const item of newProducts) {
            await this.productManager.getProductByID(item.product);
        }

        const cart = carts.get(String(cid));
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        cart.products = newProducts.map(item => ({
            product: String(item.product),
            quantity: item.quantity,
        }));

        return this.getProductsFromCartByID(cid);
    }

    async updateProductByID(cid, pid, quantity) {
        if (!quantity || isNaN(parseInt(quantity))) throw new Error('La cantidad ingresada no es válida!');

        await this.productManager.getProductByID(pid);

        const cart = carts.get(String(cid));
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        const item = cart.products.find(i => String(i.product) === String(pid));
        if (!item) throw new Error(`El producto ${pid} no existe en el carrito ${cid}!`);

        item.quantity = parseInt(quantity);
        return this.getProductsFromCartByID(cid);
    }

    async deleteAllProducts(cid) {
        const cart = carts.get(String(cid));
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        cart.products = [];
        return this.getProductsFromCartByID(cid);
    }
}

export default cartMemoryManager;
