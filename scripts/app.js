// UI text. Values are strings, or functions for text with variables.
const STRINGS = {
  en: {
    title: "Guild Food Recipes",
    meal: "Meal",
    selectMeal: "Select a meal…",
    toggle: "JPN",
    base: "Base ingredient",
    aux1: "Auxiliary 1",
    aux2: "Auxiliary 2",
    aux3: "Auxiliary 3",
    finalDiff: "Difficulty",
    unknown: id => `Unknown (${id})`,
    summary: (m, i, r) => `${m} meals, ${i} ingredients, ${r} recipes.`,
    count: (n, name) => `${n} recipe${n === 1 ? "" : "s"} for ${name}.`,
    none: name => `No recipes found for ${name}.`,
  },
  ja: {
    title: "猟団料理",
    meal: "料理名",
    selectMeal: "メニューを選択…",
    toggle: "EN",
    base: "基本食材",
    aux1: "補助食材1",
    aux2: "補助食材2",
    aux3: "補助食材3",
    finalDiff: "料理難易度",
    unknown: id => `不明 (${id})`,
    summary: (m, i, r) => `メニュー ${m}件、食材 ${i}件、レシピ ${r}件`,
    count: (n, name) => `${name}のレシピ ${n}件`,
    none: name => `${name}のレシピはありません。`,
  },
};


// jQuery snippet
const $ = id => document.getElementById(id);

// TODO: This is stupid. Bake data.js to objects rather than [lists]
const meals = MEALS.map(([id, en, ja]) => ({ id, en, ja }));
const ingredientsById = new Map(INGREDIENTS.map(([id, shex, bhex, en, ja]) => [id, { bhex, en, ja }]));
const recipesByMeal = new Map();
for (const [mealId, base, aux1, aux2, aux3, mealDiff, baseMod, finalDiff] of RECIPES) {
  if (!recipesByMeal.has(mealId)) recipesByMeal.set(mealId, []);
  recipesByMeal.get(mealId).push({ ingredients: [base, aux1, aux2, aux3], mealDiff, baseMod, finalDiff });
}

// Sort once, ascending by difficulty
for (const list of recipesByMeal.values()) list.sort((a, b) => a.finalDiff - b.finalDiff);

let lang = "en";          // "en" or "ja"
let currentMealId = null; // selected meal id (0 is yaminabe, so we have to use null)

const t = key => STRINGS[lang][key];
 
function applyLanguage() {
  document.documentElement.lang = lang;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
}


// Fallback
const label = o => (lang === "ja" && o.ja) || o.en;

function setStatus(msg) { $("status").textContent = msg; }

function makeIngredientCell(id) {
  if (id == null) return '<td class="none">—</td>';
  const ing = ingredientsById.get(id);
  return ing ? `<td><a href="https://xl3lackout.github.io/MHFZ-Ferias-English-Project/sozai/sozai.htm?${ing.bhex}">${label(ing)}</a></td>` : `<td class="none">Unknown (${id})</td>`;
}

function fillMealSelect() {
  const meal = $("meal");
  meal.innerHTML = `<option value="">${t("selectMeal")}</option>` +
    meals.map(m => `<option value="${m.id}">${label(m)}</option>`).join("");
  meal.value = currentMealId ?? "";
}

function showRecipes() {
  const meal = meals.find(m => m.id === currentMealId);
  if (!meal) { $("rows").innerHTML = ""; setStatus(""); return; }
  const list = recipesByMeal.get(meal.id) || [];
  const name = label(meal);
  $("rows").innerHTML = list.map(r => `<tr>
    ${r.ingredients.map(makeIngredientCell).join("")}
    <td class="num final">${r.finalDiff}</td>
  </tr>`).join("");
  setStatus(list.length ? t("count")(list.length, name) : t("none")(name));
}

function toggleLanguage() {
  lang = lang === "en" ? "ja" : "en";
  applyLanguage();
  $("lang").setAttribute("aria-pressed", String(lang === "ja"));
  fillMealSelect();
  showRecipes();
}

function init() {
  $("meal").addEventListener("change", e => {
    currentMealId = e.target.value === "" ? null : Number(e.target.value);
    showRecipes();
  });
  $("lang").addEventListener("click", toggleLanguage);
  setStatus(`${meals.length} meals, ${ingredientsById.size} ingredients, ${RECIPES.length} recipes.`);
}

init();
fillMealSelect();