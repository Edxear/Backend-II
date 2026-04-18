import ticketMemoryManager from '../dao/ticketMemoryManager.js';

class TicketRepository {
    constructor() {
        this.dao = new ticketMemoryManager();
    }

    async create(purchaseData) {
        const { amount, purchaser, products } = purchaseData;
        return await this.dao.create({ amount, purchaser, products });
    }

    async findById(id) {
        return await this.dao.findById(id);
    }

    async findByCode(code) {
        return await this.dao.findByCode(code);
    }

    async findAll() {
        return await this.dao.findAll();
    }
}

export default TicketRepository;