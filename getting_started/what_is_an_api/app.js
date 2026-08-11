const API_URL = "https://www.dnd5eapi.co/api/2014/monsters";

const select = document.getElementById("monster-select");
const image = document.getElementById("monster-image");

function sentenceCase(value) {
  if (typeof value !== "string" || value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function textOrDash(value, useSentenceCase) {
  if (value === null || value === undefined || value === "") return "—";
  const asText = String(value);
  return useSentenceCase ? sentenceCase(asText) : asText;
}

function setField(id, value, useSentenceCase = false) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = textOrDash(value, useSentenceCase);
}

function parseArmorClass(armorClass) {
  if (Array.isArray(armorClass) && armorClass.length > 0) {
    return {
      value: armorClass[0].value,
      type: armorClass[0].type
    };
  }

  return { value: armorClass, type: null };
}

function updateMonsterCard(monster) {
  // The monster JSON uses an armor_class field that can be either a number
  // or an array of objects. We normalize it first so the UI code stays simple.
  const armor = parseArmorClass(monster.armor_class);

  // JSON -> DOM interpolation:
  // read each value from the API response and write it into a matching UI field.
  setField("armor", armor.value);
  setField("armor-class", armor.type, true);
  setField("cr", monster.challenge_rating);
  setField("str", monster.strength);
  setField("dex", monster.dexterity);
  setField("con", monster.constitution);
  setField("int", monster.intelligence);
  setField("wis", monster.wisdom);
  setField("cha", monster.charisma);
  setField("hp", monster.hit_points);
  setField("type", monster.type, true);
  setField("size", monster.size, true);

  if (monster.image) {
    image.src = `https://www.dnd5eapi.co${monster.image}`;
    image.alt = monster.name || "Monster";
  } else {
    image.src = "";
    image.alt = "Monster image not available";
  }
}

async function fetchJson(url) {
  // Generic helper: fetch a URL and parse JSON if the response is successful.
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

async function loadMonsterFromUrl(monsterUrl) {
  // Each monster in the list contains its own URL. We fetch that JSON here.
  const monster = await fetchJson(`https://www.dnd5eapi.co${monsterUrl}`);
  updateMonsterCard(monster);
}

function renderMonsterOptions(monsters) {
  // Build the dropdown from the monsters array returned by the API.
  select.innerHTML = "";

  monsters.forEach((monster) => {
    const option = document.createElement("option");
    option.value = monster.url;
    option.textContent = monster.name;
    select.appendChild(option);
  });
}

async function boot() {
  try {
    // 1) Fetch the list endpoint.
    const data = await fetchJson(API_URL);
    const monsters = data.results || [];

    // 2) Render that JSON list into <option> tags.
    renderMonsterOptions(monsters);

    // 3) Load one monster immediately so the page is populated on first view.
    if (monsters.length > 0) {
      await loadMonsterFromUrl(monsters[0].url);
    }

    // 4) On user selection, fetch a new monster JSON object and re-interpolate.
    select.addEventListener("change", (event) => {
      loadMonsterFromUrl(event.target.value).catch((error) => {
        console.error("Failed to load selected monster", error);
      });
    });
  } catch (error) {
    console.error("Failed to load monsters list", error);
  }
}

boot();
