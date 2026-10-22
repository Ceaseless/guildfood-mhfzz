// jQuery snippet
const $ = id => document.getElementById(id);

// TODO: Bake data.js to objects rather than [lists]
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

// Fallback
const label = o => (lang === "ja" && o.ja) || o.en;

function setStatus(msg) { $("status").textContent = msg; }

function makeIngredientCell(id) {
  if (id == null) return '<td class="none">—</td>';
  const ing = ingredientsById.get(id);
  return ing ? `<td><a href="https://xl3lackout.github.io/MHFZ-Ferias-English-Project/sozai/sozai.htm?${ing.bhex}">${label(ing)}</a></td>` : `<td class="none">Unknown (${id})</td>`;
}

function fillMealSelect() {
  $("meal").innerHTML = '<option value="">Select a meal…</option>' +
    meals.map(m => `<option value="${m.id}">${label(m)}</option>`).join("");
  $("meal").value = currentMealId ?? "";
}

function showMeal() {
  const meal = meals.find(m => m.id === currentMealId);
  if (!meal) { $("rows").innerHTML = ""; setStatus(""); return; }
  const list = recipesByMeal.get(meal.id) || [];
  const name = label(meal);
  $("rows").innerHTML = list.map(r => `<tr>
    ${r.ingredients.map(makeIngredientCell).join("")}
    <td class="num final">${r.finalDiff}</td>
  </tr>`).join("");
  setStatus(list.length
    ? `${list.length} recipe${list.length === 1 ? "" : "s"} for ${name}.`
    : `No recipes found for ${name}.`);
}

function toggleLanguage() {
  lang = lang === "en" ? "ja" : "en";
  document.documentElement.lang = lang;
  $("lang").textContent = lang === "en" ? "JPN" : "ENG";
  $("lang").setAttribute("aria-pressed", String(lang === "ja"));
  fillMealSelect();
  showMeal();
}

function init() {
  $("meal").addEventListener("change", e => {
    currentMealId = e.target.value === "" ? null : Number(e.target.value);
    showMeal();
  });
  $("lang").addEventListener("click", toggleLanguage);
  setStatus(`${meals.length} meals, ${ingredientsById.size} ingredients, ${RECIPES.length} recipes.`);
}

init();
fillMealSelect();