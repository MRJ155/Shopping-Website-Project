import data from './data-pretty.json' with { type: 'json' };
//checking if the data is loaded correctly
console.log(data);

function showProduct(p) {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.className = "thumb";
  img.src = p.thumbnail;
  img.alt = p.title;

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = p.title;

  const price = document.createElement("div");
  price.textContent = "$" + p.price.toFixed(2);

  const text = document.createElement("div");
  text.append(title, price);

  const btn = document.createElement("button");
  btn.className = "add-btn";
  btn.title = "Add to cart";
  btn.textContent = "+";
  btn.addEventListener("click", () => {
    alert(`Added ${p.title} to cart. The product id is ${p.id}`);
  });

  const info = document.createElement("div");
  info.className = "info";
  info.append(text, btn);

  card.append(img, info);
  document.getElementById("grid").appendChild(card);
}

for (let p of data.products.slice(0, 20)) {
  showProduct(p);
}




