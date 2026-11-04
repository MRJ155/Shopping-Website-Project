import data from './data-pretty.json' with { type: 'json' };
console.log(data);

function showProduct(p) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img class="thumb" src="${p.thumbnail}" alt="${p.title}">
    <div class="info">
      <div>
        <div class="title">${p.title}</div>
        <div>$${p.price.toFixed(2)}</div>
      </div>
      <button class="add-btn" title="Add to cart">+</button>
    </div>
  `;
  document.getElementById("grid").appendChild(card);
}

for (let p of data.products.slice(0, 20)) {
  showProduct(p);
}


