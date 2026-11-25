import data from './data-pretty.json' with { type: 'json' };
//checking if the data is loaded correctly
console.log(data);



//displays the gride of items from array in the JSON file
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

for (let p of data.products) {
  showProduct(p);
}


function showView(id) {
  const parents = document.querySelectorAll(".view");
  for (let item of parents) {
    item.classList.add('hidden');
  }
  document.getElementById(id).classList.remove('hidden');
}

showView("home");


document.getElementById("site-header").addEventListener("click", (e) => {

  const btn = e.target.closest("[data-view], [data-action]");
  if (!btn) return;

  if (btn.dataset.view) {
    showView(btn.dataset.view);
  } else if (btn.dataset.action === "about") {
    document.getElementById("about").showModal();
  }
});
