import CustomRouter from '../utils/customRouter.js';
import { productDBManager } from '../dao/productDBManager.js';
import { uploader } from '../utils/multerUtil.js';

const custom = new CustomRouter();
const ProductService = new productDBManager();

// GET /api/products - público
custom.get('/', ['PUBLIC'], async (req, res) => {
    try {
        const result = await ProductService.getAllProducts(req.query);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Get products error:', error);
        res.sendServerError('Error fetching products');
    }
});

// GET /api/products/:pid - público
custom.get('/:pid', ['PUBLIC'], async (req, res) => {
    try {
        const result = await ProductService.getProductByID(req.params.pid);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Get product error:', error);
        res.sendUserError(error.message, 400);
    }
});

// POST /api/products - admin
custom.post('/', ['admin'], uploader.array('thumbnails', 3), async (req, res) => {
    try {
        if (req.files) {
            req.body.thumbnails = [];
            req.files.forEach((file) => {
                req.body.thumbnails.push(file.path);
            });
        }

        const result = await ProductService.createProduct(req.body);
        res.sendCreated({ payload: result });
    } catch (error) {
        console.error('Create product error:', error);
        res.sendUserError(error.message || 'Error creating product', 400);
    }
});

// PUT /api/products/:pid - admin
custom.put('/:pid', ['admin'], uploader.array('thumbnails', 3), async (req, res) => {
    try {
        if (req.files) {
            req.body.thumbnails = [];
            req.files.forEach((file) => {
                req.body.thumbnails.push(file.filename || file.path);
            });
        }

        const result = await ProductService.updateProduct(req.params.pid, req.body);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Update product error:', error);
        res.sendUserError(error.message || 'Error updating product', 400);
    }
});

// DELETE /api/products/:pid - admin
custom.delete('/:pid', ['admin'], async (req, res) => {
    try {
        const result = await ProductService.deleteProduct(req.params.pid);
        res.sendSuccess({ payload: result });
    } catch (error) {
        console.error('Delete product error:', error);
        res.sendUserError(error.message || 'Error deleting product', 400);
    }
});

export default custom.getRouter();