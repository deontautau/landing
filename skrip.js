let cart = [];
let orderType = 'Dine In';
let selectedPayment = 'qris';
let queueCounter = 1;
let selectedRating = 5;

document.addEventListener('DOMContentLoaded', () => {
    initStarPicker();
    initReviewForm();
    startHappyHourTimer();
});

function setOrderType(type) {
    orderType = type;
    document.getElementById('btnDineIn').classList.toggle('active', type === 'Dine In');
    document.getElementById('btnTakeAway').classList.toggle('active', type === 'Take Away');
    document.getElementById('orderTypeBadge').innerText = 'Opsi: ' + type;
}

function filterCategory(category, element) {
    document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    const products = document.querySelectorAll('.menu-card');
    products.forEach(product => {
        if (category === 'all' || product.getAttribute('data-category') === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
    openCartDrawer();
}

function updateQty(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }
    updateCartUI();
}

function updateCartUI() {
    const cartContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.innerText = totalQty;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart-text">Keranjangmu masih kosong nih.<br>Yuk pilih menu favoritmu!</p>';
        document.getElementById('subtotalText').innerText = 'Rp 0';
        document.getElementById('taxText').innerText = 'Rp 0';
        document.getElementById('totalText').innerText = 'Rp 0';
        document.getElementById('checkoutBtn').disabled = true;
        return;
    }

    cartContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <div>
                    <h4 style="font-size: 0.95rem;">${item.name}</h4>
                    <p style="color: var(--primary-orange); font-weight: 800; font-size: 0.85rem;">Rp ${itemTotal.toLocaleString('id-ID')}</p>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQty('${item.name}', -1)">-</button>
                    <span style="font-weight: 800;">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty('${item.name}', 1)">+</button>
                </div>
            </div>
        `;
    });

    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    document.getElementById('subtotalText').innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('taxText').innerText = `Rp ${tax.toLocaleString('id-ID')}`;
    document.getElementById('totalText').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    document.getElementById('checkoutBtn').disabled = false;
}

function toggleCartDrawer() {
    document.getElementById('cartDrawer').classList.toggle('active');
}

function openCartDrawer() {
    document.getElementById('cartDrawer').classList.add('active');
}

function openPaymentModal() {
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let total = subtotal + (subtotal * 0.10);
    
    document.getElementById('modalTotalText').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

function selectPayment(method, element) {
    selectedPayment = method;
    document.querySelectorAll('.pay-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    if (method === 'qris') {
        document.getElementById('qrisDetail').classList.remove('hidden');
        document.getElementById('cashDetail').classList.add('hidden');
    } else {
        document.getElementById('qrisDetail').classList.add('hidden');
        document.getElementById('cashDetail').classList.remove('hidden');
    }
}

function processPayment() {
    closePaymentModal();

    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let total = subtotal + (subtotal * 0.10);

    const formattedQueue = 'S-' + String(queueCounter).padStart(3, '0');
    queueCounter++;

    document.getElementById('queueNum').innerText = formattedQueue;
    document.getElementById('rOrderType').innerText = orderType;
    document.getElementById('rPaymentMethod').innerText = selectedPayment === 'qris' ? 'QRIS / E-Wallet' : 'Tunai / Kasir';
    document.getElementById('rTotalAmount').innerText = `Rp ${total.toLocaleString('id-ID')}`;

    document.getElementById('receiptModal').classList.add('active');
}

function resetKiosk() {
    cart = [];
    updateCartUI();
    document.getElementById('receiptModal').classList.remove('active');
    toggleCartDrawer();
}

/* INTERAKSI FITUR FAQ */
function toggleFaq(element) {
    const item = element.parentElement;
    item.classList.toggle('active');
}

/* INTERAKSI ULASAN & STAR PICKER */
function initStarPicker() {
    const stars = document.querySelectorAll('#starPicker span');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.getAttribute('data-value'));
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.getAttribute('data-value')) <= selectedRating);
            });
        });
    });
}

function initReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reviewerName').value.trim();
        const text = document.getElementById('reviewText').value.trim();

        if (name && text) {
            const container = document.getElementById('reviewsContainer');
            const starsString = '★'.repeat(selectedRating);

            const newReview = document.createElement('div');
            newReview.className = 'review-card card-tilt-left';
            newReview.innerHTML = `
                <div class="quote-mark">“</div>
                <p>${text}</p>
                <div class="reviewer-profile">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}" alt="${name}">
                    <div>
                        <h4>${name}</h4>
                        <div class="star-rating">${starsString}</div>
                    </div>
                </div>
            `;

            container.prepend(newReview);

            // Reset form
            document.getElementById('reviewerName').value = '';
            document.getElementById('reviewText').value = '';
            alert('Terima kasih! Ulasanmu berhasil dikirim.');
        }
    });
}

/* TIMER COUNTDOWN HAPPY HOUR */
function startHappyHourTimer() {
    let duration = 2 * 3600 + 45 * 60 + 12; // 2 jam 45 menit 12 detik
    const timerElement = document.getElementById('happyHourTimer');

    setInterval(() => {
        if (duration <= 0) duration = 3 * 3600;

        let hours = Math.floor(duration / 3600);
        let minutes = Math.floor((duration % 3600) / 60);
        let seconds = Math.floor(duration % 60);

        hours = String(hours).padStart(2, '0');
        minutes = String(minutes).padStart(2, '0');
        seconds = String(seconds).padStart(2, '0');

        if (timerElement) {
            timerElement.innerText = `${hours}:${minutes}:${seconds}`;
        }
        duration--;
    }, 1000);
}
