// ==============================
// STATE
// ==============================

let products = [];

// Cart items: { id, qty }
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Shipping cost by method, then destination
const SHIPPING = {
  standard: { canada: 10, us: 15, international: 20 },
  express: { canada: 25, us: 25, international: 30 },
  priority: { canada: 35, us: 50, international: 50 }
};

// ==============================
// STARTUP
// ==============================

// Load data, then draw the page
async function init () {
  const saved = localStorage.getItem('products');

  if (saved) {
    products = JSON.parse(saved);
  } else {
    const response = await fetch('https://dummyjson.com/products?limit=100');
    const data = await response.json();
    products = data.products;
    localStorage.setItem('products', JSON.stringify(products));
  }

  showView('home');
  showFeatured(products.slice(0, 3));
  buildCategoryFilters();
  renderResults();
  updateBadge();
  renderCart();
}

// ==============================
// HELPERS
// ==============================

// Format a price
function money (amount) {
  return '$' + amount.toFixed(2);
}

// Look up a product by id
function findProduct (id) {
  return products.find(p => p.id === id);
}

// Rating as stars
function stars (rating) {
  const full = Math.round(rating);
  return '✦'.repeat(full) + '✧'.repeat(5 - full);
}

// Brief popup message
function showToast (message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

// ==============================
// VIEWS AND CLICKS
// ==============================

// Show one view, hide the rest
function showView (id) {
  const views = document.querySelectorAll('.view');
  for (let view of views) {
    view.classList.add('hidden');
  }
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo(0,0);
}

// One listener for all clicks
document.addEventListener('click', e => {
  const btn = e.target.closest(
    '[data-view], [data-action], [data-add-id], [data-remove-id], ' +
      '[data-product-id], [data-detail-id], [data-tab]'
  );
  if (!btn) return;

  if (btn.dataset.view) {
    showView(btn.dataset.view);
  } else if (btn.dataset.action === 'about') {
    document.getElementById('about').showModal();
  } else if (btn.dataset.action === 'checkout') {
    checkout();
  } else if (btn.dataset.addId) {
    addToCart(Number(btn.dataset.addId));
  } else if (btn.dataset.removeId) {
    removeFromCart(Number(btn.dataset.removeId));
  } else if (btn.dataset.productId) {
    showSingleProduct(Number(btn.dataset.productId));
  } else if (btn.dataset.detailId) {
    addToCart(
      Number(btn.dataset.detailId),
      Number(document.getElementById('qty').value) || 1
    );
  } else if (btn.dataset.tab) {
    showTab(btn.dataset.tab);
  }
});

// ==============================
// HOME VIEW
// ==============================

// Featured products
function showFeatured (list) {
  const container = document.getElementById('featured');

  for (let p of list) {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = p.thumbnail;
    img.alt = p.title;
    img.dataset.productId = p.id;

    const title = document.createElement('h4');
    title.textContent = p.title;
    title.dataset.productId = p.id;

    const price = document.createElement('div');
    price.textContent = money(p.price);

    card.append(img, title, price);
    container.appendChild(card);
  }
}

// ==============================
// BROWSE VIEW
// ==============================

// One product card
function showProduct (p) {
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  img.className = 'thumb';
  img.src = p.thumbnail;
  img.alt = p.title;
  img.dataset.productId = p.id;

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = p.title;
  title.dataset.productId = p.id;

  const price = document.createElement('div');
  price.textContent = money(p.price);

  const text = document.createElement('div');
  text.append(title, price);

  const btn = document.createElement('button');
  btn.className = 'add-btn';
  btn.title = 'Add to cart';
  btn.textContent = '+';
  btn.dataset.addId = p.id;

  const info = document.createElement('div');
  info.className = 'info';
  info.append(text, btn);

  card.append(img, info);
  document.getElementById('grid').appendChild(card);
}

// Category checkboxes from the data
function buildCategoryFilters () {
  const categories = new Set(products.map(p => p.category));
  const list = document.getElementById('category-list');

  for (let category of categories) {
    const label = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.value = category;
    label.append(box, ' ' + category);
    list.appendChild(label);
  }
}

// Filter, sort, redraw
function renderResults () {
  const name = document.getElementById('filter-name').value.toLowerCase();
  const rating = Number(document.getElementById('filter-rating').value);
  const minPrice = Number(document.getElementById('price-min').value) || 0;
  const maxPrice =
    Number(document.getElementById('price-max').value) || Infinity;

  const checked = [];
  const boxes = document.querySelectorAll('#category-list input:checked');
  for (let box of boxes) {
    checked.push(box.value);
  }

  // Must pass every filter
  const matches = products.filter(
    p =>
      p.title.toLowerCase().includes(name) &&
      (checked.length === 0 || checked.includes(p.category)) &&
      p.rating >= rating &&
      p.price >= minPrice &&
      p.price <= maxPrice
  );

  const sortBy = document.getElementById('sort').value;
  matches.sort((a, b) =>
    sortBy === 'price' ? a.price - b.price : a[sortBy].localeCompare(b[sortBy])
  );

  const grid = document.getElementById('grid');
  grid.replaceChildren();
  for (let p of matches) {
    showProduct(p);
  }

  document.getElementById(
    'result-count'
  ).textContent = `Showing ${matches.length} of ${products.length} products`;
  document
    .getElementById('no-results')
    .classList.toggle('hidden', matches.length > 0);
}

// Redraw on filter or sort change
document.getElementById('filter-form').addEventListener('input', renderResults);
document.getElementById('sort').addEventListener('change', renderResults);

// Clear filters
document.getElementById('clear-btn').addEventListener('click', () => {
  document.getElementById('filter-form').reset();
  renderResults();
});

// ==============================
// SINGLE PRODUCT VIEW
// ==============================

// path link
function makePath (text, view) {
  const link = document.createElement('button');
  link.className = 'path';
  link.textContent = text;
  link.dataset.view = view;
  return link;
}

// Specifications tab
function showSpecs (p) {
  const rows = [
    ['Weight', `${p.weight} kg`],
    [
      'Dimensions',
      `${p.dimensions.width} x ${p.dimensions.height} x ${p.dimensions.depth} cm`
    ],
    ['Warranty', p.warrantyInformation],
    ['Shipping', p.shippingInformation],
    ['Return policy', p.returnPolicy]
  ];

  const panel = document.getElementById('tab-specs');
  panel.replaceChildren();
  for (let [label, value] of rows) {
    const line = document.createElement('p');
    line.textContent = `${label}: ${value}`;
    panel.appendChild(line);
  }
}

// Reviews tab
function showReviews (p) {
  const panel = document.getElementById('tab-reviews');
  panel.replaceChildren();

  for (let r of p.reviews) {
    const date = new Date(r.date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const heading = document.createElement('strong');
    heading.textContent = `${stars(r.rating)} ${r.reviewerName}`;

    const when = document.createElement('span');
    when.textContent = ' - ' + date;

    const comment = document.createElement('p');
    comment.textContent = r.comment;

    const review = document.createElement('div');
    review.className = 'review';
    review.append(heading, when, comment);
    panel.appendChild(review);
  }
}

// Switch tabs
function showTab (name) {
  document
    .getElementById('tab-specs')
    .classList.toggle('hidden', name !== 'specs');
  document
    .getElementById('tab-reviews')
    .classList.toggle('hidden', name !== 'reviews');
}

// Fill and show the product page
function showSingleProduct (id) {
  const p = findProduct(id);

  const img = document.getElementById('product-img');
  img.src = p.images[0];
  img.alt = p.title;

  document.getElementById('product-title').textContent = p.title;
  document.getElementById('product-price').textContent = money(p.price);
  document.getElementById('product-sku').textContent = 'SKU: ' + p.sku;
  document.getElementById(
    'product-rating'
  ).textContent = `${stars(p.rating)} (${p.rating})`;
  document.getElementById('product-desc').textContent = p.description;
  document.getElementById('qty').value = 1;

  const inStock = p.stock > 0;
  document.getElementById('product-stock').textContent = inStock
    ? `In stock (${p.stock} available)`
    : 'Out of stock';

  const addBtn = document.getElementById('add-detail-btn');
  addBtn.dataset.detailId = p.id;
  addBtn.disabled = !inStock;

  // path
  document
    .getElementById('path')
    .replaceChildren(
      makePath('Home', 'home'),
      ' > ',
      makePath(p.category, 'browse'),
      ' > ' + p.title
    );

  // Tag pills
  const tags = document.getElementById('product-tags');
  tags.replaceChildren();
  for (let tag of p.tags) {
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = tag;
    tags.appendChild(pill);
  }

  showSpecs(p);
  showReviews(p);
  showTab('specs');
  showView('singleprod');
}

// ==============================
// CART
// ==============================

// Save, then refresh the cart UI
function saveCart () {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateBadge();
  renderCart();
}

// Header item count
function updateBadge () {
  let count = 0;
  for (let item of cart) {
    count += item.qty;
  }
  document.getElementById('cart-count').textContent = count;
}

// Add an item
function addToCart (id, qty = 1) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }
  saveCart();
  showToast(`${findProduct(id).title} added to cart`);
}

// Remove an item
function removeFromCart (id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

// Merchandise, shipping, tax, total
function calculateTotals () {
  let merchandise = 0;
  for (let item of cart) {
    merchandise += findProduct(item.id).price * item.qty;
  }

  const method = document.getElementById('ship-method').value;
  const destination = document.getElementById('ship-dest').value;

  // Free over $500
  const shipping =
    merchandise === 0 || merchandise > 500 ? 0 : SHIPPING[method][destination];
  const tax = destination === 'canada' ? merchandise * 0.05 : 0;

  return { merchandise, shipping, tax, total: merchandise + shipping + tax };
}

// Table cell
function makeCell (...content) {
  const td = document.createElement('td');
  td.append(...content);
  return td;
}

// Draw the cart
function renderCart () {
  const tbody = document.getElementById('cart-items');
  tbody.replaceChildren();

  for (let item of cart) {
    const p = findProduct(item.id);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '-';
    removeBtn.dataset.removeId = p.id;

    const img = document.createElement('img');
    img.className = 'cart-thumb';
    img.src = p.thumbnail;
    img.alt = p.title;

    const row = document.createElement('tr');
    row.append(
      makeCell(removeBtn),
      makeCell(img),
      makeCell(p.title),
      makeCell(money(p.price)),
      makeCell(String(item.qty)),
      makeCell(money(p.price * item.qty))
    );
    tbody.appendChild(row);
  }

  const totals = calculateTotals();
  document.getElementById('sum-merch').textContent = money(totals.merchandise);
  document.getElementById('sum-ship').textContent = money(totals.shipping);
  document.getElementById('sum-tax').textContent = money(totals.tax);
  document.getElementById('sum-total').textContent = money(totals.total);

  // Empty cart state
  const isEmpty = cart.length === 0;
  document.getElementById('cart-empty').classList.toggle('hidden', !isEmpty);
  document.getElementById('cart-table').classList.toggle('hidden', isEmpty);
  document.getElementById('ship-method').disabled = isEmpty;
  document.getElementById('ship-dest').disabled = isEmpty;
  document.getElementById('checkout-btn').disabled = isEmpty;
}

// Clear cart and go home
function checkout () {
  cart = [];
  saveCart();
  showToast('Thank you for your order!');
  showView('home');
}

// Recalculate on shipping change
document.getElementById('cart').addEventListener('change', renderCart);

// ==============================
// RUN
// ==============================

init();