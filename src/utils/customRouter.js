import { Router } from 'express';

export default class CustomRouter {
    constructor() {
        this.router = Router();
        this._initResponseHelpers();
    }

    _initResponseHelpers() {
        this.router.use((req, res, next) => {
            res.sendSuccess = (payload = {}) => res.status(200).json({ status: 'success', payload });
            res.sendCreated = (payload = {}) => res.status(201).json({ status: 'success', payload });
            res.sendUserError = (error = 'Bad Request', code = 400) => res.status(code).json({ status: 'error', error });
            res.sendServerError = (error = 'Internal Server Error', code = 500) => res.status(code).json({ status: 'error', error });
            next();
        });
    }

    _policyMiddleware(policies) {
        return (req, res, next) => {
            if (!policies || policies.length === 0) return next();
            if (policies.includes('PUBLIC')) return next();
            const user = req.user;
            if (!user) return res.status(401).json({ status: 'error', error: 'Unauthorized' });
            if (policies.includes(user.role) || (Array.isArray(user.role) && user.role.some(r=>policies.includes(r)))) return next();
            return res.status(403).json({ status: 'error', error: 'Forbidden' });
        };
    }

    _extract(policiesOrHandler) {
        if (Array.isArray(policiesOrHandler)) return { policies: policiesOrHandler, handlerStartIndex: 0 };
        return { policies: null, handlerStartIndex: -1 };
    }

    get(path, policiesOrHandler, ...handlers) {
        const { policies } = this._extract(policiesOrHandler);
        const routeHandlers = policies ? [this._policyMiddleware(policies), ...handlers] : [policiesOrHandler, ...handlers].filter(Boolean);
        this.router.get(path, ...routeHandlers);
    }

    post(path, policiesOrHandler, ...handlers) {
        const { policies } = this._extract(policiesOrHandler);
        const routeHandlers = policies ? [this._policyMiddleware(policies), ...handlers] : [policiesOrHandler, ...handlers].filter(Boolean);
        this.router.post(path, ...routeHandlers);
    }

    put(path, policiesOrHandler, ...handlers) {
        const { policies } = this._extract(policiesOrHandler);
        const routeHandlers = policies ? [this._policyMiddleware(policies), ...handlers] : [policiesOrHandler, ...handlers].filter(Boolean);
        this.router.put(path, ...routeHandlers);
    }

    delete(path, policiesOrHandler, ...handlers) {
        const { policies } = this._extract(policiesOrHandler);
        const routeHandlers = policies ? [this._policyMiddleware(policies), ...handlers] : [policiesOrHandler, ...handlers].filter(Boolean);
        this.router.delete(path, ...routeHandlers);
    }

    patch(path, policiesOrHandler, ...handlers) {
        const { policies } = this._extract(policiesOrHandler);
        const routeHandlers = policies ? [this._policyMiddleware(policies), ...handlers] : [policiesOrHandler, ...handlers].filter(Boolean);
        this.router.patch(path, ...routeHandlers);
    }

    use(...args) {
        this.router.use(...args);
    }

    getRouter() {
        return this.router;
    }
}