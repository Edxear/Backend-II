let appInstance = null;
let bootstrapPromise = null;

const bootstrapServerless = async () => {
	if (bootstrapPromise) {
		return bootstrapPromise;
	}

	bootstrapPromise = (async () => {
		const [{ default: app }] = await Promise.all([
			import('../src/app.js'),
		]);

		return app;
	})();

	return bootstrapPromise;
};

export default async function handler(req, res) {
	try {
		if (!appInstance) {
			appInstance = await bootstrapServerless();
		}

		return appInstance(req, res);
	} catch (error) {
		console.error('[VercelEntry] Bootstrap error:', error);

		const safeMessage =
			process.env.NODE_ENV === 'production'
				? 'Error de inicializacion del servidor. Verifica variables de entorno y logs de Vercel.'
				: error.message;

		res.statusCode = 500;
		res.setHeader('Content-Type', 'application/json');
		res.end(
			JSON.stringify({
				status: 'error',
				error: {
					code: 'BOOTSTRAP_ERROR',
					message: safeMessage,
				},
			})
		);
	}
}
