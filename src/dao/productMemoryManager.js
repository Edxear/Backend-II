import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const seedProducts = require('../data/products.json');

// Singleton in-memory store loaded once at startup
let products = null;
let nextId = null;

function normalizeProduct(product) {
    if (!product) return product;
    const normalizedId = String(product._id ?? product.id);
    return {
        ...product,
        id: normalizedId,
        _id: normalizedId,
    };
}

function loadProducts() {
    if (products !== null) return;
    try {
        products = structuredClone(seedProducts).map(normalizeProduct);
        const maxId = products.reduce((max, p) => {
            const n = parseInt(p.id);
            return n > max ? n : max;
        }, 0);
        nextId = maxId + 1;
    } catch {
        products = [];
        nextId = 1;
    }
}

class productMemoryManager {
    constructor() {
        loadProducts();
    }

    async getAllProducts(params = {}) {
        loadProducts();

        let filtered = [...products];

        if (params.category) {
            filtered = filtered.filter(
                p => p.category.toLowerCase() === params.category.toLowerCase()
            );
        }

        if (params.sort === 'asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (params.sort === 'desc') {
            filtered.sort((a, b) => b.price - a.price);
        }

        const limit = params.limit ? parseInt(params.limit) : 10;
        const page = params.page ? parseInt(params.page) : 1;
        const totalDocs = filtered.length;
        const totalPages = Math.ceil(totalDocs / limit) || 1;
        const safePage = Math.min(Math.max(page, 1), totalPages);
        const start = (safePage - 1) * limit;
        const docs = filtered.slice(start, start + limit);

        const hasPrevPage = safePage > 1;
        const hasNextPage = safePage < totalPages;
        const prevPage = hasPrevPage ? safePage - 1 : null;
        const nextPage = hasNextPage ? safePage + 1 : null;

        const baseUrl = `/api/products`;
        const buildLink = (pg) => {
            const qs = new URLSearchParams();
            qs.set('page', pg);
            if (limit !== 10) qs.set('limit', limit);
            if (params.sort) qs.set('sort', params.sort);
            if (params.category) qs.set('category', params.category);
            return `${baseUrl}?${qs.toString()}`;
        };

        return {
            docs,
            totalDocs,
            limit,
            page: safePage,
            totalPages,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            prevLink: hasPrevPage ? buildLink(prevPage) : null,
            nextLink: hasNextPage ? buildLink(nextPage) : null,
        };
    }

    async getProductByID(pid) {
        loadProducts();
        const product = products.find(p => String(p.id) === String(pid));
        if (!product) throw new Error(`El producto ${pid} no existe!`);
        return normalizeProduct(product);
    }

    async createProduct(product) {
        loadProducts();
        const { title, description, code, price, stock, category, thumbnails } = product;

        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error('Todos los campos son requeridos');
        }

        const newProduct = {
            id: String(nextId++),
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnails: thumbnails ?? [],
        };

        const normalizedProduct = normalizeProduct(newProduct);
        products.push(normalizedProduct);
        return normalizedProduct;
    }

    async updateProduct(pid, productUpdate) {
        loadProducts();
        const index = products.findIndex(p => String(p.id) === String(pid));
        if (index === -1) throw new Error(`El producto ${pid} no existe!`);

        products[index] = normalizeProduct({ ...products[index], ...productUpdate });
        return products[index];
    }

    async deleteProduct(pid) {
        loadProducts();
        const index = products.findIndex(p => String(p.id) === String(pid));
        if (index === -1) throw new Error(`El producto ${pid} no existe!`);

        products.splice(index, 1);
        return { deletedCount: 1 };
    }
}

export default productMemoryManager;
