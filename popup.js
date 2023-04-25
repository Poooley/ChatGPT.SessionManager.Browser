const nameInput = document.getElementById("name-input");
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const nameList = document.getElementById("name-list");

let names = [];

function renderNames() {
  nameList.innerHTML = "";
  for (let name of names) {
    let li = document.createElement("li");
    li.innerText = name;
    nameList.appendChild(li);
  }
}

connectBtn.addEventListener("click", () => {
  let name = nameInput.value;
  if (name) {
    names.push(name);
    renderNames();
  }
});

disconnectBtn.addEventListener("click", () => {
  names = [];
  renderNames();
});