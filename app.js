window.state = {
  crystals: 2480,
  energy: 7,
  ready: { Элори: 10, Фонея: 50 },
  moons: ['Элори', 'Теллу', 'Фонея'],
  spinning: false,
};
const moonStats = {
  Элори: { cost: 50, energy: 1, reward: 10, time: '5 мин' },
  Теллу: { cost: 250, energy: 2, reward: 25, time: '30 мин' },
  Фонея: { cost: 800, energy: 3, reward: 50, time: '1 час' },
  Виори: { cost: 1250, energy: 5, reward: 100, time: '4 часа' },
  Люмия: { cost: 2500, energy: 7, reward: 150, time: '8 часов' },
  Мегарис: { cost: 4000, energy: 12, reward: 300, time: '12 часов' },
  Нэксус: { cost: 6000, energy: 15, reward: 450, time: '24 часа' }
};
const state = window.state;
const $ = (s) => document.querySelector(s),
  format = (n) => n.toLocaleString("ru-RU");

let currentSlotForBuy = null;
function openBuyMoon(slotId) {
  currentSlotForBuy = slotId;
  const list = $('#moonsList');
  list.innerHTML = '';
  Object.entries(moonStats).forEach(([name, stats]) => {
    if (state.moons.includes(name)) return; // Already owned
    const btn = document.createElement('button');
    btn.className = 'game-card arrow-card';
    btn.innerHTML = `<span class="game-art">🌑</span><span><b>${name}</b><small>${stats.cost} ✦ / Доход: ${stats.reward} / Заряд: ${stats.energy}</small></span><i>Купить</i>`;
    btn.addEventListener('click', () => {
      if (state.crystals < stats.cost) return toast('Недостаточно кристаллов');
      state.crystals -= stats.cost;
      state.moons.push(name);
      state.ready[name] = stats.reward;
      
      const slot = $(`[data-id="${currentSlotForBuy}"]`);
      if (slot) {
        slot.dataset.moon = name;
        slot.dataset.id = ''; // Remove slot id
        slot.classList.remove('slot');
        slot.classList.add('moon-ready');
        slot.innerHTML = `<span class="moon-label"><b>${name}</b><small>${stats.reward} ✦</small></span>`;
      }
      
      closeSheets();
      update();
      toast(`Куплена луна ${name}!`);
    });
    list.append(btn);
  });
  closeSheets();
  $('#buyMoonSheet').classList.remove('hidden');
}

function update() {
  $("#crystalValue").textContent = format(state.crystals);
  $("#energyValue").textContent = state.energy;
  $("#readyTotal").textContent = Object.values(state.ready).reduce(
    (a, b) => a + b,
    0,
  );
  if (window.update3DScene) window.update3DScene(state);
}
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2200);
}
function collect(moon) {
  if (!moon) return;
  if (moon.startsWith("slot")) return openBuyMoon(moon);
  const amount = state.ready[moon];
  if (!amount) return toast("Эта луна ещё заряжается");
  state.crystals += amount;
  delete state.ready[moon];
  const button = [...document.querySelectorAll(".moon")].find(
    (x) => x.dataset.moon === moon,
  );
  if (button) button.querySelector("small").textContent = "08:24";
  $("#naviText").textContent =
    "Отлично! Заряди луну, чтобы вырастить ещё кристаллы.";
  update();
  toast(`+${amount} кристаллов · ${moon}`);
}
document
  .querySelectorAll(".moon")
  .forEach((b) =>
    b.addEventListener("click", () => collect(b.dataset.moon || b.dataset.id)),
  );
$("#collectAll").addEventListener("click", () => {
  if (!Object.keys(state.ready).length) return toast("Пока нечего собирать");
  Object.keys({ ...state.ready }).forEach(collect);
});
$("#chargeAll").addEventListener("click", () => {
  const unreadyMoons = state.moons.filter((m) => !state.ready[m]);
  if (unreadyMoons.length === 0) return toast("Все луны уже заряжаются или готовы");
  
  let requiredEnergy = 0;
  unreadyMoons.forEach(m => requiredEnergy += moonStats[m].energy);

  if (state.energy < requiredEnergy) return toast(`Нужно ${requiredEnergy} энергии, а у вас ${state.energy}`);
  
  state.energy -= requiredEnergy;
  unreadyMoons.forEach((m) => {
    state.ready[m] = moonStats[m].reward;
    const btn = [...document.querySelectorAll(".moon")].find(
      (x) => x.dataset.moon === m,
    );
    if (btn) btn.querySelector("small").textContent = `${moonStats[m].reward} ✦`;
  });

  $("#naviText").textContent =
    "Луны заряжены. Кристаллы вырастут совсем скоро!";
  update();
  toast(`Луны заряжены · −${requiredEnergy} энергии`);
});
const sheets = {
  tasks: "#tasksSheet",
  wheel: "#wheelSheet",
  draws: "#drawsSheet",
};
function closeSheets() {
  document.querySelectorAll(".sheet").forEach((x) => x.classList.add("hidden"));
}
document.querySelectorAll(".nav-item").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-item")
      .forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    closeSheets();
    if (sheets[b.dataset.view])
      $(sheets[b.dataset.view]).classList.remove("hidden");
  }),
);
document.querySelectorAll(".close-sheet").forEach((b) =>
  b.addEventListener("click", () => {
    closeSheets();
    document.querySelector("[data-view=home]").click();
  }),
);
const closeBuyMoon = $("#closeBuyMoon");
if (closeBuyMoon) closeBuyMoon.addEventListener("click", closeSheets);
$("#planetButton").addEventListener("click", () =>
  toast("Магазин планеты появится в следующей версии"),
);
$("#spinWheel").addEventListener("click", () => {
  if (state.spinning) return;
  
  // Weights based on GDD
  const roll = Math.random() * 100;
  let prizeText = "";
  let prizeCrystals = 0;
  
  if (roll < 35) {
    prizeCrystals = 50;
    prizeText = "50 кристаллов (Утешительная)";
  } else if (roll < 60) { // 35 + 25
    prizeCrystals = 150;
    prizeText = "150 кристаллов (Стандартная)";
  } else if (roll < 68) { // 60 + 8
    prizeCrystals = 500;
    prizeText = "500 кристаллов (Ценная)";
  } else if (roll < 78) { // 68 + 10
    prizeText = "Бустер 'Доп. Время'";
  } else if (roll < 83) { // 78 + 5
    prizeText = "Бустер Х2 (на 30 мин)";
  } else if (roll < 99) { // 83 + 16
    prizeText = "Подписка от МегаФон (VAS)";
  } else {
    prizeText = "Супер-приз от МегаФон!";
  }

  state.spinning = true;
  const w = $(".wheel");
  w.style.transition = "transform 2s cubic-bezier(.16,.75,.18,1)";
  w.style.transform = "rotate(1080deg)";
  setTimeout(() => {
    state.crystals += prizeCrystals;
    update();
    toast(`Приз колеса: ${prizeText}!`);
    w.style.transition = "none";
    w.style.transform = "rotate(0)";
    state.spinning = false;
  }, 2100);
});
document
  .querySelectorAll(".task-go,.prize-card button")
  .forEach((b) =>
    b.addEventListener("click", () =>
      toast("Механика доступна в полном продукте"),
    ),
  );

const menuButton = $("#menuButton");
const closeMenu = $("#closeMenu");
const sideMenu = $("#sideMenu");
const openGames = $("#openGames");

if (menuButton && sideMenu) {
  menuButton.addEventListener("click", () =>
    sideMenu.classList.remove("hidden"),
  );
}
if (closeMenu && sideMenu) {
  closeMenu.addEventListener("click", () => sideMenu.classList.add("hidden"));
}
if (openGames) {
  openGames.addEventListener("click", () => {
    if (sideMenu) sideMenu.classList.add("hidden");
    closeSheets();
    const gamesSheet = $("#gamesSheet");
    if (gamesSheet) gamesSheet.classList.remove("hidden");
  });
}
const menuGameButton = $("#menuGameButton");
if (menuGameButton) {
  menuGameButton.addEventListener("click", () => {
    if (sideMenu) sideMenu.classList.add("hidden");
    closeSheets();
    const gamesSheet = $("#gamesSheet");
    if (gamesSheet) gamesSheet.classList.remove("hidden");
  });
}
const menuLinkTasks = $("#menuLinkTasks");
if (menuLinkTasks)
  menuLinkTasks.addEventListener("click", () => {
    if (sideMenu) sideMenu.classList.add("hidden");
    document.querySelector("[data-view=tasks]").click();
  });
const menuLinkWheel = $("#menuLinkWheel");
if (menuLinkWheel)
  menuLinkWheel.addEventListener("click", () => {
    if (sideMenu) sideMenu.classList.add("hidden");
    document.querySelector("[data-view=wheel]").click();
  });

const goWater = $("#goWater");
if (goWater)
  goWater.addEventListener("click", () => {
    closeSheets();
    $("#waterSheet").classList.remove("hidden");
  });

const goArrow = $("#goArrow");
if (goArrow)
  goArrow.addEventListener("click", () => {
    closeSheets();
    $("#arrowSheet").classList.remove("hidden");
  });

const goCharge = $("#goCharge");
if (goCharge)
  goCharge.addEventListener("click", () => {
    closeSheets();
  });

document.querySelectorAll(".game-card").forEach((b) =>
  b.addEventListener("click", () => {
    closeSheets();
    $(`#${b.dataset.game}Sheet`).classList.remove("hidden");
  }),
);

const waterLevels = [
  [["cyan", "pink", "cyan"], ["pink", "cyan", "pink"], []],
  [
    ["cyan", "pink", "orange"],
    ["pink", "orange", "cyan"],
    ["orange", "cyan", "pink"],
    [],
  ],
  [
    ["cyan", "orange", "pink"],
    ["pink", "cyan", "orange"],
    ["orange", "pink", "cyan"],
    [],
  ],
  [
    ["green", "cyan", "pink"],
    ["pink", "orange", "green"],
    ["orange", "cyan", "orange"],
    ["cyan", "green", "pink"],
    [],
  ],
  [
    ["cyan", "pink", "green"],
    ["orange", "green", "cyan"],
    ["pink", "orange", "pink"],
    ["green", "cyan", "orange"],
    [],
  ],
];
let currentWaterLevel = 0;
let water = [],
  selectedTube = null;
function resetWater() {
  water = waterLevels[currentWaterLevel].map((t) => [...t]);
  selectedTube = null;
  renderWater();
}
function renderWater() {
  const board = $("#waterBoard");
  board.innerHTML = "";
  water.forEach((tube, index) => {
    const b = document.createElement("button");
    b.className = `tube ${selectedTube === index ? "selected" : ""}`;
    b.setAttribute("aria-label", `Пробирка ${index + 1}`);
    tube.forEach((color) => {
      const layer = document.createElement("i");
      layer.className = `water ${color}`;
      b.append(layer);
    });
    b.addEventListener("click", () => pourWater(index));
    board.append(b);
  });
}
function pourWater(target) {
  if (selectedTube === null) {
    if (!water[target].length) return toast("Эта пробирка пуста");
    selectedTube = target;
    return renderWater();
  }
  if (selectedTube === target) {
    selectedTube = null;
    return renderWater();
  }
  const from = water[selectedTube],
    to = water[target],
    color = from[from.length - 1];
  if (to.length === 3 || (to.length && to[to.length - 1] !== color)) {
    selectedTube = null;
    renderWater();
    return toast("Вода смешается — выбери другую пробирку");
  }
  to.push(from.pop());
  selectedTube = null;
  renderWater();
  if (
    water.every((t) => !t.length || (t.length === 3 && new Set(t).size === 1))
  ) {
    setTimeout(() => {
      state.crystals += 10;
      update();
      currentWaterLevel = (currentWaterLevel + 1) % waterLevels.length;
      resetWater();
      toast("Уровень пройден! +10 кристаллов");
    }, 400);
  }
}
$("#resetWater").addEventListener("click", resetWater);

const arrowLevels = [
  ["→", "→", "↓", null, null, "↓", null, null, "←"],
  ["↓", "←", "↑", "↓", null, "↑", "→", "→", "↑"],
  ["→", "↓", "↑", "↓", null, "↑", "↓", "↓", "←"],
  ["↓", "↑", "←", "→", null, "→", "→", "→", "↓"],
  ["→", "↑", "↓", "↓", "↑", "→", "→", "→", "↓"],
];
let currentArrowLevel = 0;
let arrows = [];
const vectors = { "→": [0, 1], "←": [0, -1], "↑": [-1, 0], "↓": [1, 0] };
function resetArrow() {
  arrows = [...arrowLevels[currentArrowLevel]];
  renderArrows();
}
function renderArrows() {
  const board = $("#arrowBoard");
  board.innerHTML = "";
  arrows.forEach((arrow, index) => {
    const b = document.createElement("button");
    b.className = `arrow-tile ${arrow ? "" : "empty"}`;
    b.textContent = arrow || "";
    if (arrow) b.addEventListener("click", () => launchArrow(index, b));
    board.append(b);
  });
}
function launchArrow(index, button) {
  const [dr, dc] = vectors[arrows[index]],
    row = Math.floor(index / 3),
    col = index % 3;
  let r = row + dr,
    c = col + dc;
  while (r >= 0 && r < 3 && c >= 0 && c < 3) {
    if (arrows[r * 3 + c]) {
      button.classList.add("blocked");
      setTimeout(() => button.classList.remove("blocked"), 350);
      return toast("Путь занят другой луной");
    }
    r += dr;
    c += dc;
  }
  button.classList.add("fly");
  arrows[index] = null;
  setTimeout(renderArrows, 380);
  if (!arrows.filter(Boolean).length)
    setTimeout(() => {
      state.crystals += 10;
      update();
      currentArrowLevel = (currentArrowLevel + 1) % arrowLevels.length;
      resetArrow();
      toast("Затор расчищен! +10 кристаллов");
    }, 420);
}
$("#resetArrow").addEventListener("click", resetArrow);
resetWater();
resetArrow();
update();
