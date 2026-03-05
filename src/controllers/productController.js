import ProductRepository from '../repositories/ProductRepository.js';

class ProductController {
    constructor() {
        this.productRepo = new ProductRepository();
    }

    getAll = async (req, res) => {
        try {
            const products = await this.productRepo.getAll(req.query);
            res.sendSuccess({ payload: products });
        } catch (error) {
            console.error('Get all products error:', error);
            res.sendUserError(error.message, 400);
        }
    };

    getById = async (req, res) => {
        try {
            const { pid } = req.params;
            const product = await this.productRepo.getById(pid);
            res.sendSuccess({ payload: product });
        } catch (error) {
            console.error('Get product by id error:', error);
            if (error.message.includes('no existe')) {
                return res.sendUserError('Product not found', 404);
            }
            res.sendUserError(error.message, 400);
        }
    };

    create = async (req, res) => {
        try {
            const { title, description, code, price, stock, category } = req.body;

            // Validar campos requeridos
            if (!title || !description || !code || !price || !stock || !category) {
                return res.sendUserError('All fields are required', 400);
            }

            const thumbnails = req.files ? req.files.map(file => file.path) : [];
            const newProduct = await this.productRepo.create({
                title,
                description,
                code,
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                thumbnails
            });

            res.sendCreated({
                message: 'Product created successfully',
                payload: newProduct
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.sendUserError(error.message, 400);
        }
    };

    update = async (req, res) => {
        try {
            const { pid } = req.params;
            const productUpdate = req.body;


            if (req.files && req.files.length > 0) {
                productUpdate.thumbnails = req.files.map(file => file.path);
            }

            if (productUpdate.price) productUpdate.price = parseFloat(productUpdate.price);
            if (productUpdate.stock) productUpdate.stock = parseInt(productUpdate.stock);

            const updatedProduct = await this.productRepo.update(pid, productUpdate);

            res.sendSuccess({
                message: 'Product updated successfully',
                payload: updatedProduct
            });
        } catch (error) {
            console.error('Update product error:', error);
            if (error.message.includes('no existe')) {
                return res.sendUserError('Product not found', 404);
            }
            res.sendUserError(error.message, 400);
        }
    };

    remove = async (req, res) => {
        try {
            const { pid } = req.params;
            await this.productRepo.delete(pid);

            res.sendSuccess({
                message: 'Product deleted successfully',
                payload: { id: pid }
            });
        } catch (error) {
            console.error('Delete product error:', error);
            if (error.message.includes('no existe')) {
                return res.sendUserError('Product not found', 404);
            }
            res.sendUserError(error.message, 400);
        }
    };
}

export const productController = new ProductController();
