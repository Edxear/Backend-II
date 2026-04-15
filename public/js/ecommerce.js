showButtonCart();

async function updateCartCount() {
    const cartId = localStorage.getItem('cartId');
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    if (!cartId) {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
        return;
    }

    try {
        const res = await fetch(`/api/carts/${cartId}`);
        if (!res.ok) return;
        const data = await res.json();
        const total = (data?.payload?.products || []).reduce((acc, p) => acc + (p.quantity || 1), 0);
        if (total > 0) {
            badge.textContent = total > 99 ? '99+' : total;
            badge.classList.remove('hidden');
            badge.classList.add('flex');
        } else {
            badge.classList.add('hidden');
            badge.classList.remove('flex');
        }
    } catch (_) {}
}

async function addToCart(pid) {
    let cartId = localStorage.getItem('cartId');

    if (!cartId) {
        const createCartResponse = await fetch('/api/carts', { method: 'POST' });

        const createCart = await createCartResponse.json();

        if (!createCartResponse.ok || createCart.status === 'error') {
            if (createCartResponse.status === 401 || createCartResponse.status === 403) {
                alert('Debes iniciar sesión para crear un carrito.');
                window.location.href = '/login';
                return;
            }
            return alert(createCart.message);
        }

        cartId = createCart.payload._id;
        localStorage.setItem('cartId', cartId);
    }

    const addProductResponse = await fetch(`/api/carts/${cartId}/product/${pid}`, {
        method: 'POST'
    });

    const addProduct = await addProductResponse.json();

    if (!addProductResponse.ok || addProduct.status === 'error') {
        if (addProductResponse.status === 401 || addProductResponse.status === 403) {
            alert('Tu sesión venció. Inicia sesión nuevamente.');
            window.location.href = '/login';
            return;
        }
        return alert(addProduct.message);
    }

    showButtonCart();
    alert('Producto añadido satisfactoriamente!');
}

function showButtonCart() {
    const cartId = localStorage.getItem('cartId');
    const buttonCart = document.querySelector('#button-cart');

    if (!buttonCart) return;

    if (cartId) {
        buttonCart.setAttribute('href', `/cart/${cartId}`);
        buttonCart.classList.remove('hidden');
        buttonCart.classList.add('flex');
        updateCartCount();
    }
}

window.addToCart = addToCart;