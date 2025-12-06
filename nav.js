// nav.js

document.addEventListener("DOMContentLoaded", function () {
  /* ========== 顶部导航下拉 ========== */

  const dropdowns = [
    { buttonId: "arrivalToggle", menuId: "arrivalMenu" },
    { buttonId: "experienceToggle", menuId: "experienceMenu" },
    { buttonId: "echoesToggle", menuId: "echoesMenu" },
  ];

  const buttons = {};
  const menus = {};

  dropdowns.forEach(({ buttonId, menuId }) => {
    const btn = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (!btn || !menu) return;

    buttons[buttonId] = btn;
    menus[menuId] = menu;

    btn.addEventListener("click", function (e) {
      e.stopPropagation(); // 阻止冒泡到 document

      // 先关掉其他所有 dropdown
      closeAll();

      // 再切换当前这个
      menu.classList.toggle("open");
    });
  });

  document.addEventListener("click", function (e) {
    const clickedInsideMenu = Object.values(menus).some((menu) =>
      menu.contains(e.target)
    );
    const clickedOnButton = Object.values(buttons).some((btn) =>
      btn.contains(e.target)
    );

    if (!clickedInsideMenu && !clickedOnButton) {
      closeAll();
    }
  });

  function closeAll() {
    Object.values(menus).forEach((menu) => menu.classList.remove("open"));
  }

  /* ========== D3 genre map + filter ========== */

  // 确保 d3 已经加载
  if (typeof d3 === "undefined") {
    console.error("d3.js 没有加载，请先在 HTML 里引入 d3.v7.min.js");
    return;
  }

  const map = document.getElementById("map");
  const controls = document.getElementById("controls");

  if (!map || !controls) {
    console.error("#map 或 #controls 没找到，检查一下 HTML 里的 id 是否对应");
    return;
  }

  const data = [
    { genre: "acid_techno", x: 4.1, y: 4.7, size: 1, family: "Electronic" },
    { genre: "afro_house", x: 3.5, y: 2.1, size: 2, family: "Electronic" },
    { genre: "afrobeats", x: 3.2, y: 0.8, size: 2, family: "Pop" },
    { genre: "alt-R&B", x: -3.8, y: -2.1, size: 3, family: "Pop" },
    { genre: "alt-dance", x: -0.6, y: -0.2, size: 3, family: "Pop" },
    { genre: "alt-z", x: -0.8, y: -0.4, size: 2, family: "Pop" },
    { genre: "art_pop", x: -5.0, y: -1.2, size: 4, family: "Pop" },
    { genre: "dance_punk", x: 5.1, y: -0.1, size: 3, family: "Rock" },
    { genre: "deep_house", x: -3.0, y: -1.4, size: 1, family: "Electronic" },
    { genre: "electropop", x: 4.4, y: 1.9, size: 4, family: "Pop" },
    {
      genre: "experimental_electronic",
      x: 0.8,
      y: 3.2,
      size: 4,
      family: "Electronic",
    },
    { genre: "garage_punk", x: 4.3, y: -1.8, size: 2, family: "Rock" },
    {
      genre: "garage_rock_revival",
      x: 1.9,
      y: -2.6,
      size: 2,
      family: "Rock",
    },
    { genre: "hardcore_punk", x: 4.2, y: -2.0, size: 2, family: "Rock" },
    { genre: "hyperpop", x: 5.0, y: 3.8, size: 3, family: "Pop" },
    { genre: "indie_pop", x: 0.1, y: 3.0, size: 5, family: "Pop" },
    { genre: "indie_rock", x: -1.8, y: -2.8, size: 5, family: "Rock" },
    { genre: "indietronica", x: -3.2, y: -0.3, size: 2, family: "Pop" },
    { genre: "k_pop", x: 0.7, y: 0.2, size: 3, family: "Pop" },
    { genre: "mainstream_pop", x: 0.7, y: -0.3, size: 3, family: "Pop" },
    { genre: "neo_soul", x: -2.3, y: -2.3, size: 1, family: "Pop" },
    { genre: "noise_rock", x: 2.8, y: -1.9, size: 3, family: "Rock" },
    {
      genre: "organic_house",
      x: -3.7,
      y: -0.8,
      size: 2,
      family: "Electronic",
    },
    { genre: "post_punk_revival", x: 0.5, y: -1.4, size: 3, family: "Rock" },
    {
      genre: "progressive_techno",
      x: -0.8,
      y: 3.5,
      size: 3,
      family: "Electronic",
    },
    { genre: "punk_metal", x: 3.4, y: -2.9, size: 1, family: "Rock" },
    { genre: "reggaeton", x: 2.7, y: 0.6, size: 1, family: "Pop" },
    { genre: "tech_house", x: 1.8, y: 1.3, size: 4, family: "Electronic" },
    { genre: "uk_bass", x: 0.9, y: 1.7, size: 2, family: "Electronic" },
  ];

  const width = map.clientWidth;
  const height = map.clientHeight;

  const originX = width / 2;
  const originY = height / 2;
  const scale = 60;

  // 创建 tile
  data.forEach((d) => {
    d.width = 26 + d.size * 10;
    d.height = 26 + d.size * 10;

    const div = document.createElement("div");
    div.className = "tile";
    div.style.width = d.width + "px";
    div.style.height = d.height + "px";

    div.innerHTML = `
      <span>${d.genre.replace(/_/g, " ")}</span>
      <div class="size-badge">${d.size}</div>
    `;

    map.appendChild(div);
    d.el = div;

    d.xPos = originX + d.x * scale;
    d.yPos = originY - d.y * scale;
  });

  // D3 force simulation
  const simulation = d3
    .forceSimulation(data)
    .force("x", d3.forceX((d) => originX + d.x * scale).strength(0.4))
    .force("y", d3.forceY((d) => originY - d.y * scale).strength(0.4))
    .force(
      "collide",
      d3
        .forceCollide(
          (d) =>
            Math.sqrt(d.width * d.width + d.height * d.height) / 2 + 3
        )
        .iterations(4)
    )
    .alphaDecay(0.03)
    .on("tick", () => {
      data.forEach((d) => {
        d.el.style.left = d.x - d.width / 2 + "px";
        d.el.style.top = d.y - d.height / 2 + "px";
      });
    });

  /* ========== Filter Buttons ========== */

  let activeFamily = "All";
  const families = Array.from(new Set(data.map((d) => d.family))).sort();
  const allFamilies = ["All", ...families];

  allFamilies.forEach((f) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (f === "All" ? " active" : "");
    btn.textContent = f;
    btn.dataset.family = f;
    controls.appendChild(btn);
  });

  function updateVisibility() {
    data.forEach((d) => {
      const show = activeFamily === "All" || d.family === activeFamily;
      d.el.style.display = show ? "flex" : "none";
    });
  }

  controls.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    activeFamily = btn.dataset.family;

    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.toggle("active", b === btn));

    updateVisibility();
  });

  // 初始显示全部
  updateVisibility();
});
