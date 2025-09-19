//step 1: get DOM

// helper: resolve image paths (support local folder 'Cards/' and absolute/remote urls)
function getImageSrc(img) {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) return img;
  if (img.startsWith('Cards/')) return img;
  return 'Cards/' + img;
}
let nextDom = document.getElementById('next');
let prevDom = document.getElementById('prev');

let carouselDom = document.querySelector('.carousel');
let SliderDom = carouselDom.querySelector('.carousel .list');
let thumbnailBorderDom = document.querySelector('.carousel .thumbnail');
let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');
let timeDom = document.querySelector('.carousel .time');

thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
let timeRunning = 3000;
let timeAutoNext = 7000;

nextDom.onclick = function(){
    showSlider('next');    
}

prevDom.onclick = function(){
    showSlider('prev');    
}
let runTimeOut;
let runNextAuto = setTimeout(() => {
    next.click();
}, timeAutoNext)
function showSlider(type){
    let  SliderItemsDom = SliderDom.querySelectorAll('.carousel .list .item');
    let thumbnailItemsDom = document.querySelectorAll('.carousel .thumbnail .item');
    
    if(type === 'next'){
        SliderDom.appendChild(SliderItemsDom[0]);
        thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
        carouselDom.classList.add('next');
    }else{
        SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
        thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
        carouselDom.classList.add('prev');
    }
    clearTimeout(runTimeOut);
    runTimeOut = setTimeout(() => {
        carouselDom.classList.remove('next');
        carouselDom.classList.remove('prev');
    }, timeRunning);

    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        next.click();
    }, timeAutoNext)
}



// ================== APP SCRIPT ===================

const menuItems = {
  "Hamburguesas a la Parilla": [
    { id: 1, name: "Especial de Carne", price: 5.50, img: "Cards/meatburguer2.png", ingredients: ["Carne a la parrilla", "Queso facilita", "Tomate", "Cebolla", "Lechuga", "Tocineta", "Salsa Especial de la Casa"] },
    { id: 2, name: "Doble Carne", price: 6, img: "Cards/doble-meat-burguer.png", ingredients: ["Doble carne a la parrilla", "Queso facilita", "Tomate", "Cebolla", "Lechuga", "Tocineta", "Salsa especial de la casa"] },
    { id: 3, name: "Chicken Burger", price: 7, img: "Cards/chickenburguer.png", ingredients: ["Pollo a la parrilla", "Queso facilita", "Tomate", "Cebolla", "Lechuga", "Tocineta", "Salsa especial de la casa"] },
    { id: 4, name: "Mixta Burger", price: 7, img: "Cards/mixburguer.png", ingredients: ["Carne y pollo a la parrilla", "Queso facilita", "Tomate", "Cebolla", "Lechuga", "Tocineta", "Salsa especial de la casa"] }
  ],
  "Hotdogs": [
    { id: 5, name: "Highfood Clásico", price: 2, img: "Cards/hotdog1.png", ingredients: ["Salchicha Plumrose", "Papitas", "Repollo", "Cebolla", "Salsas tradicionales"] },
    { id: 6, name: "Highfood con Queso", price: 2.50, img: "Cards/meatburguer2.png", ingredients: ["Salchicha Plumrose", "Queso amarillo", "Papitas", "Repollo", "Cebolla", "Salsas tradicionales"] }
  ]
};

// Estado de la app
let cart = [];
let selectedItem = null;
let selectedIngredients = [];
let selectedExtras = [];
let friesSelected = false;
let friesPrice = 0;

// Cantidad
let currentQty = 1;

// Helpers
function formatMoney(n){
  return Number(n).toFixed(2);
}

// DOM
const menuDiv = document.getElementById("menu");
const cartButton = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const cartItemsUl = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutForm = document.getElementById("checkoutForm");
const paymentMethod = document.getElementById("paymentMethod");
const paymentInfo = document.getElementById("paymentInfo");

// Render menú
for (const category in menuItems) {
  const section = document.createElement("div");
  section.className = "menu-section";
  section.innerHTML = `<h2>${category}</h2>`;
  const itemsDiv = document.createElement("div");
  itemsDiv.className = "menu-items";

  menuItems[category].forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";
    card.innerHTML = `
      <img src="${getImageSrc(item.img)}">
      <div class="info">
        <h3>${item.name}</h3>
        <p>$${formatMoney(item.price)}</p>
        <button>Ver</button>
      </div>`;

    card.querySelector("button").addEventListener("click", () => openModal(item));
    itemsDiv.appendChild(card);
  });

  section.appendChild(itemsDiv);
  menuDiv.appendChild(section);
}

// Abrir modal
function openModal(item) {
  selectedItem = item;
  selectedIngredients = [...item.ingredients];
  selectedExtras = [];
  friesSelected = false;
  friesPrice = 0;
  currentQty = 1; // reset cantidad

  document.getElementById("modalTitle").innerText = item.name;
  document.getElementById("modalImage").src = getImageSrc(item.img);

  const ingredientsTextDiv = document.getElementById("modalIngredientsText");
  ingredientsTextDiv.innerHTML = item.ingredients?.map(i => `<span>${i}</span>`).join('') || '';

  const ingredientsDiv = document.getElementById("modalIngredients");
  ingredientsDiv.innerHTML = "";
  item.ingredients.forEach(ing => {
    const label = document.createElement("label");
    label.innerHTML = `<input type='checkbox' checked> <span>${ing}</span>`;
    const checkbox = label.querySelector("input");
    checkbox.onchange = () => toggleIngredient(ing);
    ingredientsDiv.appendChild(label);
  });

  const extrasInputs = document.querySelectorAll("#modalExtras input[type='checkbox']");
  extrasInputs.forEach(input => {
    input.checked = false;
    input.onchange = (e) => handleExtraInputChange(e.target);
  });

  const friesInput = document.querySelector("#modalFries input[type='checkbox']");
  if (friesInput) {
    friesInput.checked = false;
    friesInput.onchange = (e) => {
      friesSelected = e.target.checked;
      friesPrice = friesSelected ? parseFloat(e.target.value || 0) : 0;
      updateModalPrice();
    };
  }

  // mostrar cantidad inicial
  document.getElementById("modalQuantity").textContent = currentQty;

  document.getElementById("productModal").classList.add("active");
  updateModalPrice();
}

function toggleIngredient(ing) {
  if (selectedIngredients.includes(ing)) {
    selectedIngredients = selectedIngredients.filter(i => i !== ing);
  } else {
    selectedIngredients.push(ing);
  }
}

function handleExtraInputChange(input) {
  const price = parseFloat(input.value) || 0;
  const labelText = input.parentNode ? input.parentNode.textContent.trim() : '';
  const name = labelText.replace(/\(.*\)/, '').trim();

  if (input.checked) {
    if (!selectedExtras.some(e => e.name === name && e.price === price)) {
      selectedExtras.push({ name, price });
    }
  } else {
    selectedExtras = selectedExtras.filter(e => !(e.name === name && e.price === price));
  }

  updateModalPrice();
}

function updateModalPrice() {
  if (!selectedItem) return;
  const base = parseFloat(selectedItem.price) || 0;
  const extrasPerUnit = selectedExtras.reduce((s, e) => s + (parseFloat(e.price) || 0), 0);
  const friesPerUnit = friesSelected ? (parseFloat(friesPrice) || 0) : 0;

  const perUnit = base + extrasPerUnit + friesPerUnit;
  const total = perUnit * currentQty;

  const modalDescription = document.getElementById("modalDescription");
  modalDescription.innerHTML = `
    <strong>Precio unitario:</strong> $${formatMoney(perUnit)}<br>
    <strong>Cantidad:</strong> ${currentQty}<br>
    <strong>Precio total:</strong> $${formatMoney(total)}
  `;
}

// Cancelar modal
document.getElementById("cancelModal").onclick = () => {
  document.getElementById("productModal").classList.remove("active");
};

// Añadir al carrito
document.getElementById("addToCart").onclick = () => {
  if (!selectedItem) return;

  const extrasCopy = selectedExtras.map(e => ({ name: e.name, price: parseFloat(e.price) }));
  const friesCopy = friesSelected ? { name: 'Papas Fritas', price: parseFloat(friesPrice) } : null;

  const perUnit = parseFloat(selectedItem.price) + extrasCopy.reduce((s,e) => s + e.price, 0) + (friesCopy ? friesCopy.price : 0);
  const itemTotalPrice = perUnit * currentQty;

  cart.push({
    id: selectedItem.id,
    name: selectedItem.name,
    price: parseFloat(selectedItem.price),
    ingredients: [...selectedIngredients],
    quantity: currentQty,
    extras: extrasCopy,
    fries: friesCopy,
    totalPrice: parseFloat(itemTotalPrice.toFixed(2))
  });

  updateCart();
  document.getElementById("productModal").classList.remove("active");
};

function updateCart() {
  cartItemsUl.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.totalPrice;
    const li = document.createElement("li");
    li.className = 'cart-item';

    let html = `${item.name} x${item.quantity} - $${formatMoney(item.totalPrice)}<br><small>Ingredientes: ${item.ingredients.join(", ")}</small>`;
    if (item.extras && item.extras.length) {
      html += `<br><small>Extras: ${item.extras.map(e => `${e.name.trim()}`).join(', ')}</small>`;
    }
    if (item.fries) {
      html += `<br><small>${item.fries.name} (+$${formatMoney(item.fries.price)})</small>`;
    }
    html += `<br><button class='remove-item' data-index='${index}'>Eliminar</button>`;

    li.innerHTML = html;
    cartItemsUl.appendChild(li);
  });

  cartTotal.innerText = `Total: $${formatMoney(total)}`;
  cartCount.innerText = cart.reduce((s,i) => s + i.quantity, 0);

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.onclick = (e) => {
      const idx = parseInt(e.target.dataset.index);
      if (!Number.isNaN(idx)) {
        cart.splice(idx, 1);
        updateCart();
      }
    };
  });
}

cartButton.onclick = () => {
  cartPanel.classList.toggle("active");
};

checkoutBtn.onclick = () => {
  checkoutForm.classList.toggle("hidden");
};

paymentMethod.onchange = (e) => {
  let totalUSD = cart.reduce((sum, i) => sum + i.totalPrice, 0);
  let info = "";
  if (e.target.value === "pago_movil") info = `Banco: XXXX<br>Número: 0412-XXXXXXX<br>CI: V-XXXXXXXX<br>Monto: ${formatMoney(totalUSD*180)} Bs`;
  if (e.target.value === "paypal") info = `Cuenta PayPal: ejemplo@paypal.com<br>Monto: ${formatMoney(totalUSD)} USD`;
  if (e.target.value === "binance") info = `Wallet Binance: xxxxxxx<br>Monto: ${formatMoney(totalUSD)} USD`;
  if (e.target.value === "zelle") info = `Cuenta Zelle: ejemplo@zelle.com<br>Monto: ${formatMoney(totalUSD)} USD`;
  paymentInfo.innerHTML = info;
  paymentInfo.classList.remove("hidden");
};

// Envío (WhatsApp)
document.getElementById("sendOrder").onclick = () => {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const delivery = document.getElementById("deliveryMethod").value;
  const payment = paymentMethod.value;
  const ref = document.getElementById("reference").value;

  if (!name || !phone || !delivery || !payment || !ref) {
    alert("Por favor complete todos los datos.");
    return;
  }

  const itemsList = cart.map(i => {
    const extrasText = (i.extras && i.extras.length) ? ` Extras: ${i.extras.map(e=>e.name).join(', ')}` : '';
    const friesText = i.fries ? ` ${i.fries.name}` : '';
    return `${i.name} x${i.quantity} - $${formatMoney(i.totalPrice)} (Ingredientes: ${i.ingredients.join(", ")}${extrasText}${friesText})`;
  }).join("%0A");

  const totalUSD = cart.reduce((sum, i) => sum + i.totalPrice, 0);
  const msg = `*Nuevo Pedido*%0A👤 Nombre: ${name}%0A📞 Teléfono: ${phone}%0A🚚 Opción: ${delivery}%0A💳 Pago: ${payment}%0A🔖 Ref: ${ref}%0A🛒 Items:%0A${itemsList}%0A%0ATotal: $${formatMoney(totalUSD)}`;
  window.open(`https://wa.me/584242104172?text=${msg}`, "_blank");
};


// ==== Botones + y - ====
const qtyDisplay = document.getElementById("modalQuantity");
const btnDecrease = document.getElementById("decreaseQty");
const btnIncrease = document.getElementById("increaseQty");

btnDecrease.addEventListener("click", () => {
  if (currentQty > 1) {
    currentQty--;
    qtyDisplay.textContent = currentQty;
    updateModalPrice();
  }
});

btnIncrease.addEventListener("click", () => {
  currentQty++;
  qtyDisplay.textContent = currentQty;
  updateModalPrice();
});










// Cancelar modal
document.getElementById("cancelModal").onclick = () => {
  document.getElementById("productModal").classList.remove("active");
};

// Añadir al carrito
document.getElementById("addToCart").onclick = () => {
  if (!selectedItem) return;

  const extrasCopy = selectedExtras.map(e => ({ name: e.name, price: parseFloat(e.price) }));
  const friesCopy = friesSelected ? { name: 'Papas Fritas', price: parseFloat(friesPrice) } : null;

  const perUnit = parseFloat(selectedItem.price) + extrasCopy.reduce((s,e) => s + e.price, 0) + (friesCopy ? friesCopy.price : 0);
  const itemTotalPrice = perUnit * currentQty;

  cart.push({
    id: selectedItem.id,
    name: selectedItem.name,
    price: parseFloat(selectedItem.price),
    ingredients: [...selectedIngredients],
    quantity: currentQty,
    extras: extrasCopy,
    fries: friesCopy,
    totalPrice: parseFloat(itemTotalPrice.toFixed(2))
  });

  updateCart();
  document.getElementById("productModal").classList.remove("active");
};

// >>> NUEVO: cerrar modal al hacer clic fuera de .modal-content <<<
const productModal = document.getElementById("productModal");
productModal.addEventListener("click", (e) => {
  if (e.target === productModal) {
    productModal.classList.remove("active");
  }
});
