// nav.js

// nav.js

document.addEventListener("DOMContentLoaded", function () {
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
      e.stopPropagation();

      const wasOpen = menu.classList.contains("open");

      closeAll();

      if (!wasOpen) {
        positionMenuUnderButton(btn, menu);
        menu.classList.add("open");
        revealMenuItems(menu);
      }
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
    Object.values(menus).forEach((menu) => {
      menu.classList.remove("open");
      resetMenuItems(menu);
    });
  }

  /* === 核心：让 dropdown 对齐对应按钮 === */
  function positionMenuUnderButton(button, menu) {
    const btnRect = button.getBoundingClientRect();
    const headerRect = document
      .querySelector(".site-header")
      .getBoundingClientRect();

    // 右对齐按钮
    const rightOffset =
      window.innerWidth - btnRect.right;

    menu.style.left = "auto";
    menu.style.right = `${rightOffset}px`;
  }

  /* === stagger reveal === */
  function revealMenuItems(menu) {
    const items = menu.querySelectorAll(".arrival-item");
    items.forEach((item, i) => {
      item.classList.remove("reveal");
      item.style.animationDelay = `${i * 0.08}s`;
      void item.offsetWidth;
      item.classList.add("reveal");
    });
  }

  function resetMenuItems(menu) {
    const items = menu.querySelectorAll(".arrival-item");
    items.forEach((item) => {
      item.classList.remove("reveal");
      item.style.animationDelay = "0s";
    });
  }

  /* ========== D3 genre map + filter ========== */

  // 确保 d3 已经加载
  if (typeof d3 === "undefined") {
    console.error("d3.js 没有加载，请先在 HTML 里引入 d3.v7.min.js");
    return;
  }

  const map = document.getElementById("map");
  const controls = document.getElementById("controls");
  const tooltip = document.getElementById("tooltip");

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
const artistsMap = {
  acid_techno: ["Infected Mushroom"],
  progressive_techno: ["Indira Paganotto", "Klangkuenstler", "Layton Giordani"],
  industrial_techno: ["Arca", "Darkside"],
  melodic_house: ["Vintage Culture", "Ben Böhmer", "Eli & Fur", "Moon Boots"],
  electro_house: ["Moon Boots", "Miike Snow"],
  deep_house: ["Moon Boots"],
  tech_house: ["Chris Stussy", "Chris Lorenzo", "Dennis Cruz", "Interplanetary Criminal"],
  hyperpop: ["Charli XCX", "A. G. Cook", "Glaive"],
  ambient_pop: ["Japanese Breakfast", "FKA twigs"],
  indietronica: ["Parcels", "Glass Beams"],
  art_pop: ["Lady Gaga", "MARINA", "FKA twigs", "Lola Young"],
  future_garage: ["Sammy Virji"],
  uk_bass: ["Sammy Virji", "Interplanetary Criminal"],
  electropop: ["FKA twigs", "Parcels", "MARINA", "Lola Young"],
  experimental_electronic: ["FKA twigs", "Arca", "Darkside", "Infected Mushroom"],
  organic_house: ["Damian Lazarus", "Sparrow & Barbossa"],

  afrobeats: ["Rema", "Amaarae"],
  "alt-r&b": ["Ravyn Lenae", "Amaarae", "Hope Tala"],
  alt_dance: ["Charli XCX", "Parcels", "Glaive"],
  alt_z: ["Beabadoobee", "Clairo"],
  indie_pop: ["Clairo", "Japanese Breakfast", "Beabadoobee", "The Marías", "Still Woozy"],
  mainstream_pop: ["Lady Gaga", "MARINA", "Jessie Murph"],
  neo_soul: ["Hope Tala"],
  k_pop: ["LISA", "JENNIE", "ENHYPEN"],
  reggaeton: ["Anitta"],

  dance_punk: ["Viagra Boys"],
  garage_punk: ["Amyl & the Sniffers", "Fucked Up"],
  garage_rock_revival: ["Viagra Boys", "The Dholis"],
  hardcore_punk: ["Fucked Up", "Amyl & the Sniffers"],
  indie_rock: ["Japanese Breakfast", "Beabadoobee", "The Beaches", "Jimmy Eat World", "The Marías"],
  noise_rock: ["Blonde Redhead"],
  post_punk_revival: ["The Misfits", "Blonde Redhead", "Viagra Boys"],
  punk_metal: ["The Misfits"]
};
const genreImageMap = {
  acid_techno: "images/genres/acid_techno.png",
  afro_house: "images/genres/afro_house.png",
  afrobeats: "images/genres/afrobeats.png",
  "alt-r&b": "images/genres/alt_rnb.png",
  alt_dance: "images/genres/alt_dance.png",
  alt_z: "images/genres/alt_z.png",
  art_pop: "images/genres/art_pop.png",
  dance_punk: "images/genres/dance_punk.png",
  deep_house: "pic/deephouse.pg",
  electropop: "images/genres/electropop.png",
  experimental_electronic: "images/genres/experimental_electronic.png",
  garage_punk: "images/genres/garage_punk.png",
  garage_rock_revival: "images/genres/garage_rock_revival.png",
  hardcore_punk: "images/genres/hardcore_punk.png",
  hyperpop: "images/genres/hyperpop.png",
  indie_pop: "images/genres/indie_pop.png",
  indie_rock: "images/genres/indie_rock.png",
  indietronica: "images/genres/indietronica.png",
  k_pop: "images/genres/k_pop.png",
  mainstream_pop: "images/genres/mainstream_pop.png",
  neo_soul: "images/genres/neo_soul.png",
  noise_rock: "images/genres/noise_rock.png",
  organic_house: "images/genres/organic_house.png",
  post_punk_revival: "images/genres/post_punk_revival.png",
  progressive_techno: "images/genres/progressive_techno.png",
  punk_metal: "images/genres/punk_metal.png",
  reggaeton: "images/genres/reggaeton.png",
  tech_house: "images/genres/tech_house.png",
  uk_bass: "images/genres/uk_bass.png"
};
function normalizeKey(s) {
  return s.toLowerCase().replace(/-/g, "_");
}

data.forEach(d => {
  const key = normalizeKey(d.genre);
  d.artists = artistsMap[key] || [];
});
  // 创建 tile
  data.forEach((d) => {
    d.width = 26 + d.size * 10;
    d.height = 26 + d.size * 10;

    const div = document.createElement("div");
    div.className = "tile";
    div.style.width = d.width + "px";
    div.style.height = d.height + "px";

 const key = normalizeKey(d.genre);
const img = genreImageMap[key];

div.style.backgroundImage = img ? `url(${img})` : "none";
div.style.backgroundSize = "contain";
div.style.backgroundRepeat = "no-repeat";
div.style.backgroundPosition = "center";

// 文字可以保留，用于 hover
div.innerHTML = `
  <span class="genre-label">${d.genre.replace(/_/g, " ")}</span>
  <div class="size-badge">${d.size}</div>
`;
div.dataset.family = d.family;
    map.appendChild(div);
    d.el = div;

  div.addEventListener("mouseenter", (e) => showTooltip(e, d));
  div.addEventListener("mousemove", moveTooltip);
  div.addEventListener("mouseleave", hideTooltip);

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
  let tooltipLocked = false;
function showTooltip(e, d) {
  tooltipLocked = false; // 每次新 hover 都重置

  const artistsHTML = d.artists && d.artists.length
    ? d.artists.map(a => `<div class="artist" data-artist="${a}">${a}</div>`).join("")
    : "<div>(no artists yet)</div>";

  tooltip.innerHTML = `
    <div class="tt-header">
      ${d.genre.replace(/_/g," ")} <span class="tt-sep">|</span> ${d.family}
    </div>
    <div class="tt-artists">
      ${artistsHTML}
    </div>
  `;

  tooltip.classList.add("show");

  // 👇 只在第一次 hover 时定位
  moveTooltip(e);
  tooltipLocked = true;
}

function moveTooltip(e) {
  if (tooltipLocked) return;

  const pad = 6;
  let x = e.clientX + pad;
  let y = e.clientY + pad;

  const rect = tooltip.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) {
    x = e.clientX - rect.width - pad;
  }
  if (y + rect.height > window.innerHeight) {
    y = e.clientY - rect.height - pad;
  }

  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
}

function hideTooltip() {
  tooltipLocked = false;
  tooltip.classList.remove("show");
}

});
const audio = new Audio();
let currentArtist = null;

tooltip.addEventListener("click", async (e) => {
  const el = e.target.closest(".artist");
  if (!el) return;

  const artistName = el.dataset.artist;

  if (currentArtist === artistName && !audio.paused) {
    audio.pause();
    return;
  }

  currentArtist = artistName;

  const previewUrl = await fetchSpotifyPreview(artistName);

  if (!previewUrl) {
    alert("No Spotify preview available");
    return;
  }

  audio.src = previewUrl;
  audio.play();
});
async function fetchSpotifyPreview(artist) {
  const token = await getSpotifyToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=track&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  const track = data.tracks?.items?.[0];
  return track?.preview_url || null;
}
///map
document.addEventListener("DOMContentLoaded", () => {
  const zones = document.querySelectorAll(".hover-zone");
  const preview = document.getElementById("preview");
  const previewImg = document.getElementById("previewImg");
  const previewTitle = document.getElementById("previewTitle");
  const map = document.getElementById("map");

  if (!zones.length) return;

  zones.forEach(zone => {
    const img = zone.dataset.img;
    const title = zone.dataset.title;

    zone.addEventListener("mouseenter", () => {
      previewImg.src = img;
      previewTitle.textContent = title;
      preview.classList.add("show");
    });

    zone.addEventListener("mousemove", (e) => {
      const r = map.getBoundingClientRect();
      let x = e.clientX - r.left + 20;
      let y = e.clientY - r.top + 20;

      x = Math.min(x, r.width - 240);
      y = Math.min(y, r.height - 220);

      preview.style.left = x + "px";
      preview.style.top = y + "px";
    });

    zone.addEventListener("mouseleave", () => {
      preview.classList.remove("show");
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".seg-btn");
  const priceNums = document.querySelectorAll(".price-num");

  function setWeek(week){
    tabs.forEach(btn => {
      const on = btn.dataset.week === week;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    priceNums.forEach(el => {
      const key = week === "week2" ? "priceWeek2" : "priceWeek1";
      const val = el.dataset[key];
      if (val) el.textContent = val;
    });
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => setWeek(btn.dataset.week));
  });

  setWeek("week1");
});
