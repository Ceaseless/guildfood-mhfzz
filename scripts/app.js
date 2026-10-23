// jQuery snippet
const $ = id => document.getElementById(id);

// TODO: This is stupid. Bake data.js to objects rather than [lists]
const meals = MEALS.map(([id, en, ja]) => ({ id, en, ja }));
const ingredientsById = new Map(INGREDIENTS.map(([id, shex, bhex, en, ja]) => [id, { bhex, en, ja }]));
const recipesByMeal = new Map();
for (const [mealId, base, aux1, aux2, aux3, mealDiff, baseMod, finalDiff, greatFail, fail, succ, greatSucc] of RECIPES) {
  if (!recipesByMeal.has(mealId)) recipesByMeal.set(mealId, []);
  recipesByMeal.get(mealId).push({ ingredients: [base, aux1, aux2, aux3], mealDiff, baseMod, finalDiff, skills: [greatFail, fail, succ, greatSucc] });
}
const skillsById = new Map(SKILLS.map(([id, en, ja]) => [id, {en, ja}]));

// Sort once, ascending by difficulty
for (const list of recipesByMeal.values()) list.sort((a, b) => a.finalDiff - b.finalDiff);

let lang = "en";          // "en" or "ja"
let currentMealId = null; // selected meal id (0 is yaminabe, so we have to use null)

const translated = key => STRINGS[lang][key];
 
function applyLanguage() {
  document.documentElement.lang = lang;
  document.title = translated("title");
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = translated(el.dataset.i18n); });
}


// Fallback
const label = o => (lang === "ja" && o.ja) || o.en;

function setStatus(msg) { $("status").textContent = msg; }

function makeIngredientCell(id) {
  if (id == null) return '<td class="none">—</td>';
  const ing = ingredientsById.get(id);
  return ing ? `<td><a href="https://xl3lackout.github.io/MHFZ-Ferias-English-Project/sozai/sozai.htm?${ing.bhex}">${label(ing)}</a></td>` : `<td class="none">Unknown (${id})</td>`;
}

function makeSkillCell(id) {
  if (id == null) return '<td class="none">—</td>';
  const skill = skillsById.get(id);
  return skill ? `<td>${label(skill)}</td>` : `<td class="none">Unknown (${id})</td>`;
}

function fillMealSelect() {
  const meal = $("meal");
  meal.innerHTML = `<option value="">${translated("selectMeal")}</option>` +
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
    ${r.skills.map(makeSkillCell).join("")}
  </tr>`).join("");
  setStatus(list.length ? translated("count")(list.length, name) : translated("none")(name));
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