import crypto from 'crypto';

// In-memory ticket store
const tickets = new Map();

class ticketMemoryManager {
    async create(purchaseData) {
        const { amount, purchaser, products } = purchaseData;
        const code = crypto.randomBytes(8).toString('hex').toUpperCase();
        const id = crypto.randomBytes(12).toString('hex');

        const ticket = {
            _id: id,
            code,
            purchase_datetime: new Date(),
            amount,
            purchaser,
            products: products || [],
        };

        tickets.set(id, ticket);
        return ticket;
    }

    async findById(id) {
        return tickets.get(String(id)) || null;
    }

    async findByCode(code) {
        for (const ticket of tickets.values()) {
            if (ticket.code === code) return ticket;
        }
        return null;
    }

    async findAll() {
        return Array.from(tickets.values());
    }
}

export default ticketMemoryManager;
