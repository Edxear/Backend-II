import productModel from "./models/productModel.js";
import config from "../config/config.js";

class productDBManager {

    async getAllProducts(params) {
        const paginate = {
            page: params.page ? parseInt(params.page) : 1,
            limit: params.limit ? parseInt(params.limit) : 10,
        }

        const query = {};
        if (params.category) query.category = params.category;

        if (params.sort && (params.sort === 'asc' || params.sort === 'desc')) paginate.sort = { price: params.sort}

        const products = await productModel.paginate(query, paginate);

        const baseUrl = `http://localhost:${config.PORT}`;
        products.prevLink = products.hasPrevPage ? `${baseUrl}/products?page=${products.prevPage}` : null;
        products.nextLink = products.hasNextPage ? `${baseUrl}/products?page=${products.nextPage}` : null;

        //Add limit
        if (products.prevLink && paginate.limit !== 10) products.prevLink += `&limit=${paginate.limit}`
        if (products.nextLink && paginate.limit !== 10) products.nextLink += `&limit=${paginate.limit}`

        //Add sort
        if (products.prevLink && paginate.sort) products.prevLink += `&sort=${params.sort}`
        if (products.nextLink && paginate.sort) products.nextLink += `&sort=${params.sort}`

        //Add category filter
        if (products.prevLink && params.category) products.prevLink += `&category=${encodeURIComponent(params.category)}`
        if (products.nextLink && params.category) products.nextLink += `&category=${encodeURIComponent(params.category)}`

        return products;
    }

    async getProductByID(pid) {
        try {
            const product = await productModel.findOne({_id: pid});
            if (!product) throw new Error(`El producto ${pid} no existe!`);
            return product;
        } catch (error) {
            throw error;
        }
    }

    async createProduct(product) {
        try {
            const {title, description, code, price, stock, category, thumbnails} = product;

            if (!title || !description || !code || !price || !stock || !category) {
                throw new Error('Todos los campos son requeridos');
            }

            return await productModel.create({title, description, code, price, stock, category, thumbnails});  
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(pid, productUpdate) {
        try {
            const product = await productModel.findOne({_id: pid});
            if (!product) throw new Error(`El producto ${pid} no existe!`);
            return await productModel.updateOne({_id: pid}, productUpdate);
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(pid) {
        try {
            const result = await productModel.deleteOne({_id: pid});
            if (result.deletedCount === 0) throw new Error(`El producto ${pid} no existe!`);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default productDBManager;