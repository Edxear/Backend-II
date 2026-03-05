import ticketModel from '../dao/models/ticketModel.js';
import crypto from 'crypto';

class TicketRepository {
    async create(purchaseData) {
        const { amount, purchaser, products } = purchaseData;
        const code = crypto.randomBytes(8).toString('hex').toUpperCase();

        return await ticketModel.create({
            code,
            amount,
            purchaser,
            products
        });
    }

    async findById(id) {
        return await ticketModel.findById(id).populate('products.product');
    }

    async findByCode(code) {
        return await ticketModel.findOne({ code });
    }

    async findAll() {
        return await ticketModel.find().populate('products.product');
    }
}

export default TicketRepository;