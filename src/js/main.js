/**
 * NutriPlan - Main Entry Point
 *
 * This is the main entry point for the application.
 * Import your modules and initialize the app here.
 */

import {
  getEmptyProductState,
  getEmptyState,
  getLoadingSpinner,
} from "./ui/components.js";

const showLoader = function (container) {
  if (container) {
    container.innerHTML = `<div class="col-span-full">${getLoadingSpinner()}</div>`;
  }
};

const baseUrl = "https://nutriplan-api.vercel.app/api";

let mealsArray = [];

const mealsContainer = document.getElementById("recipes-grid");
const recipesCountText = document.getElementById("recipes-count");

const getAllMeals = async function (searchQuery = "") {
  showLoader(mealsContainer);
  try {
    const response = await fetch(
      `${baseUrl}/meals/search?q=${searchQuery}&page=1&limit=25`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error, status: ${response.status}`);
    }

    const payload = await response.json();
    mealsArray = payload.results || [];
    console.log(mealsArray);

    displayMeals(mealsArray);
  } catch (error) {
    console.log("error");
  }
};

//search
const searchInput = document.getElementById("search-input");

if (searchInput) {
  searchInput.addEventListener("input", function (e) {
    const keyword = e.target.value.trim();
    getAllMeals(keyword);
  });
}

const displayMeals = function (meals) {
  if (meals.length === 0) {
    if (recipesCountText) {
      recipesCountText.innerText = `Showing 0 recipes`;
    }

    mealsContainer.innerHTML = getEmptyState();
    return;
  }
  if (recipesCountText) {
    recipesCountText.innerHTML = `Showing ${meals.length} recipes`;
  }
  let data = "";
  for (let i = 0; i < meals.length; i++) {
    data += `
          <div
              class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              data-meal-id="${meals[i].id}"
            >
              <div class="relative h-48 overflow-hidden">
                <img
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src="${meals[i].thumbnail}"
                  alt="${meals[i].name}"
                  loading="lazy"
                />
                <div class="absolute bottom-3 left-3 flex gap-2">
                  <span
                    class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700"
                  >
                    ${meals[i].category}
                  </span>
                  <span
                    class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white"
                  >
                    ${meals[i].area}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <h3
                  class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1"
                >
                ${meals[i].name}  
                </h3>
                <p class="text-xs text-gray-600 mb-3 line-clamp-2">
                 ${meals[i].instructions || " Delicious recipe to try!"} 
                </p>
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-gray-900">
                    <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                    ${meals[i].category}
                  </span>
                  <span class="font-semibold text-gray-500">
                    <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                     ${meals[i].area}
                  </span>
                </div>
              </div>
            </div>
        `;
  }
  mealsContainer.innerHTML = data;
  connectMealCards();

  applyView();
};

const cuisinesContainer = document.getElementById("categories-grid");

const getAllcuisines = async function () {
  try {
    const response = await fetch(`${baseUrl}/meals/areas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error, status: ${response.status}`);
    }

    const payload = await response.json();
    const cuisinesArray = payload.results || payload;
    console.log(cuisinesArray);

    let buttonsCartona = `
        <button
              class="cuisine-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
            >
             All Cuisines
        </button>
    `;
    for (let i = 0; i < cuisinesArray.length; i++) {
      buttonsCartona += `
        <button
              class="cuisine-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
            >
              ${cuisinesArray[i].name}
        </button>
`;
    }

    cuisinesContainer.innerHTML = buttonsCartona;
    activeCuisinesBtn();
  } catch (error) {
    console.log("error");
  }
};

const activeCuisinesBtn = async function () {
  const buttons = document.querySelectorAll(".cuisine-btn");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      const cuisineName = buttons[i].innerText.trim();

      for (let j = 0; j < buttons.length; j++) {
        buttons[j].classList.replace("bg-emerald-600", "bg-gray-100");
        buttons[j].classList.replace("text-white", "text-gray-700");
      }

      buttons[i].classList.replace("bg-gray-100", "bg-emerald-600");
      buttons[i].classList.replace("text-gray-700", "text-white");

      if (cuisineName === " All Recipes" || cuisineName === "All Cuisines") {
        getAllMeals();
      } else {
        getFilteredMeals("area", cuisineName);
      }
    });
  }
};

const getFilteredMeals = async function (filterType, filterValue) {
  showLoader(mealsContainer);
  try {
    const response = await fetch(
      `${baseUrl}/meals/filter?${filterType}=${filterValue}&page=1&limit=25`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error, status: ${response.status}`);
    }

    const payload = await response.json();
    mealsArray = payload.results || [];
    console.log(mealsArray);

    displayMeals(mealsArray);
  } catch (error) {
    console.log("error");
  }
};

const mealTypeContainer = document.getElementById("categories-grid-two");

const getAllCategories = async function () {
  try {
    const response = await fetch(`${baseUrl}/meals/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error, status: ${response.status}`);
    }

    const payload = await response.json();
    const categoriesArray = payload.results || payload;

    const styleMap = {
      Beef: {
        bg: "bg-gradient-to-br from-rose-50 to-red-50",
        icon: "fa-solid fa-drumstick-bite",
        cardBg: "bg-gradient-to-br from-rose-400 to-red-500",
        border: "border border-red-200",
      },
      Chicken: {
        bg: "bg-gradient-to-br from-amber-50 to-orange-50",
        icon: "fa-solid fa-drumstick-bite",
        cardBg: "bg-gradient-to-br from-amber-400 to-orange-500",
        border: "border border-orange-200",
      },
      Dessert: {
        bg: "bg-gradient-to-br from-pink-50 to-rose-50",
        icon: "fa-solid fa-cake-candles",
        cardBg: "bg-gradient-to-br from-pink-400 to-rose-500",
        border: "border border-pink-200",
      },
      Lamb: {
        bg: "bg-gradient-to-br from-orange-50 to-amber-50",
        icon: "fa-solid fa-drumstick-bite",
        cardBg: "bg-gradient-to-br from-orange-400 to-amber-400",
        border: "border border-amber-200",
      },
      Miscellaneous: {
        bg: "bg-gradient-to-br from-slate-50 to-gray-50",
        icon: "fa-solid fa-icons",
        cardBg: "bg-gradient-to-br from-slate-400 to-gray-500",
        border: "border border-blue-200",
      },
      Pasta: {
        bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
        icon: "fa-solid fa-bowl-food",
        cardBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
        border: "border border-yellow-200",
      },
      Pork: {
        bg: "bg-gradient-to-br from-rose-50 to-red-50",
        icon: "fa-solid fa-bacon",
        cardBg: "bg-gradient-to-br from-rose-400 to-red-500",
        border: "border border-rose-200",
      },
      Seafood: {
        bg: "bg-gradient-to-br from-cyan-50 to-blue-50",
        icon: "fa-solid fa-fish",
        cardBg: "bg-gradient-to-br from-cyan-400 to-blue-500",
        border: "border border-cyan-200",
      },
      Side: {
        bg: "bg-gradient-to-br from-green-50 to-emerald-50",
        icon: "fa-solid fa-bowl-rice",
        cardBg: "bg-gradient-to-br from-green-400 to-emerald-500",
        border: "border border-emerald-200",
      },
      Starter: {
        bg: "bg-gradient-to-br from-teal-50 to-cyan-50",
        icon: "fa-solid fa-hotdog",
        cardBg: "bg-gradient-to-br from-teal-400 to-cyan-500",
        border: "border border-cyan-200",
      },
      Vegan: {
        bg: "bg-gradient-to-br from-emerald-50 to-green-50",
        icon: "fa-solid fa-leaf",
        cardBg: "bg-gradient-to-br from-emerald-400 to-green-500",
        border: "border border-green-200",
      },
      Vegetarian: {
        bg: "bg-gradient-to-br from-lime-50 to-green-50",
        icon: "fa-solid fa-seedling",
        cardBg: "bg-gradient-to-br from-lime-400 to-green-500",
        border: "border border-lime-200",
      },
    };
    let categoriesCartona = "";
    for (let i = 0; i < categoriesArray.length; i++) {
      const categoryName = categoriesArray[i].name;

      const currentStyle = styleMap[categoryName] || {
        bg: "bg-gradient-to-br from-emerald-50 to-green-50",
        icon: "fa-solid fa-utensils",
        cardBg: "bg-gradient-to-br from-emerald-400 to-green-500",
        border: "border border-emerald-200",
      };

      categoriesCartona += `
       <div class="category-card   ${currentStyle.bg} rounded-xl p-3  ${currentStyle.border} flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105" data-category="${categoryName}"> 
       <div class="flex items-center gap-2.5">
       <div class="text-white w-9 h-9  ${currentStyle.cardBg} rounded-lg flex items-center justify-center shadow-sm">
        <i class="${currentStyle.icon} text-sm"></i> 
       </div>
        <div>
         <h3 class="text-xs font-bold text-gray-900">${categoryName}</h3> 
        </div> 
       </div>
       </div> `;
    }
    mealTypeContainer.innerHTML = categoriesCartona;
    activeMealTypeBtn();
  } catch (error) {
    console.log("error");
  }
};
//.meal-type-btn
const activeMealTypeBtn = async function () {
  const typeButtons = document.querySelectorAll(".category-card");

  for (let i = 0; i < typeButtons.length; i++) {
    typeButtons[i].addEventListener("click", function () {
      const categoryName = typeButtons[i].getAttribute("data-category");
      getFilteredMeals("category", categoryName);
    });
  }
};

getAllMeals();
getAllcuisines();
getAllCategories();

const headerTitle = document.getElementById("main-header-title");
const headerDesc = document.getElementById("main-header-desc");

const searchFiltersSection = document.getElementById("search-filters-section");
const mealCategoriesSection = document.getElementById(
  "meal-categories-section",
);
const allRecipesSection = document.getElementById("all-recipes-section");
const mealDetailsSection = document.getElementById("meal-details-section");

const productsSection = document.getElementById("products-section");
const productScannerBtn = document.getElementById("product-scanner-btn");

const foodLogSection = document.getElementById("foodlog-section");
const foodLogFoodBtn = document.getElementById("food-log-btn");

function showDetailsPage() {
  if (searchFiltersSection) {
    searchFiltersSection.classList.add("hidden");
  }

  if (mealCategoriesSection) {
    mealCategoriesSection.classList.add("hidden");
  }

  if (allRecipesSection) {
    allRecipesSection.classList.add("hidden");
  }

  if (mealDetailsSection) {
    mealDetailsSection.classList.remove("hidden");
  }

  if (productsSection) {
    productsSection.classList.add("hidden");
  }

  if (foodLogSection) {
    foodLogSection.classList.add("hidden");
  }

  if (headerTitle && headerDesc) {
    headerTitle.innerText = "Recipe Details";
    headerDesc.innerText = "View full recipe information and nutrition facts";
  }
}

function showMealsPage() {
  if (searchFiltersSection) {
    searchFiltersSection.classList.remove("hidden");
  }

  if (mealCategoriesSection) {
    mealCategoriesSection.classList.remove("hidden");
  }

  if (allRecipesSection) {
    allRecipesSection.classList.remove("hidden");
  }

  if (mealDetailsSection) {
    mealDetailsSection.classList.add("hidden");
  }

  if (productsSection) {
    productsSection.classList.add("hidden");
  }

  if (foodLogSection) {
    foodLogSection.classList.add("hidden");
  }

  if (headerTitle && headerDesc) {
    headerTitle.innerText = "Meals & Recipes";
    headerDesc.innerText =
      "Discover delicious and nutritious recipes tailored for you";
  }
}

function showScannerPage() {
  if (searchFiltersSection) {
    searchFiltersSection.classList.add("hidden");
  }

  if (mealCategoriesSection) {
    mealCategoriesSection.classList.add("hidden");
  }

  if (allRecipesSection) {
    allRecipesSection.classList.add("hidden");
  }

  if (mealDetailsSection) {
    mealDetailsSection.classList.add("hidden");
  }

  if (foodLogSection) {
    foodLogSection.classList.add("hidden");
  }

  if (productsSection) {
    productsSection.classList.remove("hidden");
  }

  if (headerTitle && headerDesc) {
    headerTitle.innerText = "Product Scanner";
    headerDesc.innerText = "Search packaged foods by name or barcode";
  }
}

function showFoodLogPage() {
  if (searchFiltersSection) {
    searchFiltersSection.classList.add("hidden");
  }

  if (mealCategoriesSection) {
    mealCategoriesSection.classList.add("hidden");
  }

  if (allRecipesSection) {
    allRecipesSection.classList.add("hidden");
  }

  if (mealDetailsSection) {
    mealDetailsSection.classList.add("hidden");
  }

  if (productsSection) {
    productsSection.classList.add("hidden");
  }

  if (foodLogSection) {
    foodLogSection.classList.remove("hidden");
  }

  if (headerTitle && headerDesc) {
    headerTitle.innerText = "Food Log";
    headerDesc.innerText = "Track your daily nutrition and food intake";
  }
}

function switchActiveTab(clickedBtn) {
  if (clickedBtn === productScannerBtn) {
    productScannerBtn.classList.add("bg-emerald-50", "text-emerald-700");
    productScannerBtn.classList.remove("text-gray-600");

    mealsRecipesBtn.classList.remove("bg-emerald-50", "text-emerald-700");
    mealsRecipesBtn.classList.add("text-gray-600");

    foodLogFoodBtn.classList.remove("bg-emerald-50", "text-emerald-700");
    foodLogFoodBtn.classList.add("text-gray-600");
  } else if (clickedBtn === foodLogFoodBtn) {
    foodLogFoodBtn.classList.add("bg-emerald-50", "text-emerald-700");
    foodLogFoodBtn.classList.remove("text-gray-600");

    mealsRecipesBtn.classList.remove("bg-emerald-50", "text-emerald-700");
    mealsRecipesBtn.classList.add("text-gray-600");

    productScannerBtn.classList.remove("bg-emerald-50", "text-emerald-700");
    productScannerBtn.classList.add("text-gray-600");
  } else {
    mealsRecipesBtn.classList.add("bg-emerald-50", "text-emerald-700");
    mealsRecipesBtn.classList.remove("text-gray-600");

    productScannerBtn.classList.remove("bg-emerald-50", "text-emerald-700");
    productScannerBtn.classList.add("text-gray-600");

    foodLogFoodBtn.classList.remove("bg-emerald-50", "text-emerald-700");
    foodLogFoodBtn.classList.add("text-gray-600");
  }
}

let backButton = document.getElementById("back-to-meals-btn");
if (backButton) {
  backButton.addEventListener("click", showMealsPage);
}

const mealsRecipesBtn = document.getElementById("meals-recipes-btn");
if (mealsRecipesBtn) {
  mealsRecipesBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showMealsPage();

    switchActiveTab(mealsRecipesBtn);
  });
}

if (productScannerBtn) {
  productScannerBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showScannerPage();

    switchActiveTab(productScannerBtn);
  });
}

if (foodLogFoodBtn) {
  foodLogFoodBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showFoodLogPage();

    switchActiveTab(foodLogFoodBtn);
  });
}

let currentMeal = null;

function pct(value, target) {
  return Math.min(((Number(value) || 0) / target) * 100, 100);
}

async function getMealById(mealId) {
  try {
    const response = await fetch(`${baseUrl}/meals/${mealId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error, status: ${response.status}`);
    }

    const payload = await response.json();
    const meal = payload.result;
    console.log(meal);

    currentMeal = {
      id: meal.id,
      name: meal.name,
      brand: meal.category,
      image: meal.thumbnail,
      type: "meal",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    const detailsImg = document.getElementById("detail-img");
    detailsImg.src = meal.thumbnail;

    const detailsTitle = document.getElementById("details-title");
    detailsTitle.innerText = meal.name;

    document.getElementById("detailCategory").innerText = meal.category;

    const detailArea = document.getElementById("detailArea");
    if (meal.area) {
      detailArea.innerText = meal.area;
      detailArea.classList.remove("hidden");
    } else {
      detailArea.classList.add("hidden");
    }

    const detailTags = document.getElementById("detailTags");
    if (meal.tags && meal.tags.length > 0) {
      detailTags.innerText = meal.tags[0];
      detailTags.classList.remove("hidden");
    } else {
      detailTags.classList.add("hidden");
    }

    //ingredients
    const ingredientsContainer = document.getElementById("details-ingredients");

    if (meal.ingredients) {
      let ingredientHtml = `
          <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-list-check text-emerald-600"></i>
                  Ingredients
                  <span class="text-sm font-normal text-gray-500 ml-auto"
                    >${meal.ingredients.length} items</span
                  >
                </h2>
      `;

      for (let i = 0; i < meal.ingredients.length; i++) {
        ingredientHtml += `
          <div
                    class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
                    />
                    <span class="text-gray-700">
                      <span class="font-medium text-gray-900">${meal.ingredients[i].measure}</span> 
                       ${meal.ingredients[i].ingredient}
                    </span>
          </div>
          `;
      }

      ingredientsContainer.innerHTML = ingredientHtml;
    }

    //Instructions
    const instructionsContainer = document.getElementById(
      "detailsInstructions",
    );
    instructionsContainer.innerHTML = "";
    if (meal.instructions) {
      let instructionsHTML = `
         <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                  Instructions
                </h2>
      `;
      for (let j = 0; j < meal.instructions.length; j++) {
        instructionsHTML += `
            <div
                    class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0"
                    >
                      ${j + 1}
                    </div>
                    <p class="text-gray-700 leading-relaxed pt-2">
                      ${meal.instructions[j]}
                    </p>
                  </div>
          `;
      }
      instructionsContainer.innerHTML = instructionsHTML;
    }

    //video
    const videoElement = document.getElementById("datailVideo");
    const videoContainer = document.getElementById("videoContainer");
    if (videoElement && videoContainer) {
      if (meal.youtube) {
        videoElement.classList.remove("hidden");
        let parts = meal.youtube.split("v=");
        let videoId = parts[1];
        videoContainer.innerHTML = `
            <iframe
                    src="https://youtube.com/embed/${videoId}"
                    class="absolute inset-0 w-full h-full"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  >
            </iframe>
         `;
      } else {
        videoElement.classList.add("hidden");
        videoContainer.innerHTML = "";
      }
    }

    try {
      let ingredientForAnalze = [];
      if (meal.ingredients) {
        for (let i = 0; i < meal.ingredients.length; i++) {
          let item = meal.ingredients[i];
          ingredientForAnalze.push(item.measure + " " + item.ingredient);
        }
      }

      let requestBody = {
        recipeName: meal.name,
        ingredients: ingredientForAnalze,
      };

      const nutritionResponse = await fetch(`${baseUrl}/nutrition/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "NKqN8fnRWNzLFmGnfQFMpFPHKfpdFTqzbbHBpRqm",
        },
        body: JSON.stringify(requestBody),
      });

      if (!nutritionResponse.ok) {
        throw new Error("failed to analyze nutrition");
      }

      const nutritionData = await nutritionResponse.json();

      let nu = nutritionData.data.totals;
      let nuPer = nutritionData.data.perServing;

      currentMeal.calories = Number(nuPer.calories) || 0;
      currentMeal.protein = Number(nuPer.protein) || 0;
      currentMeal.carbs = Number(nuPer.carbs) || 0;
      currentMeal.fat = Number(nuPer.fat) || 0;

      let totalCalories = nuPer.calories;

      const heroCaloriesElement = document.getElementById("hero-calories");
      if (heroCaloriesElement) {
        heroCaloriesElement.innerText = `${nuPer.calories} cal/serving`;
      }

      let proteinPercentage = pct(nuPer.protein, 50);
      let carbsPercentage = pct(nuPer.carbs, 250);
      let fatPercentage = pct(nuPer.fat, 65);
      let fiberPercentage = pct(nuPer.fiber, 28);
      let sugarPercentage = pct(nuPer.sugar, 50);

      const nutritionFactsContainer = document.getElementById(
        "nutrition-facts-container",
      );
      if (nutritionFactsContainer) {
        nutritionFactsContainer.innerHTML = `
            <div
                    class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl"
                  >
                    <p class="text-sm text-gray-600">Calories per serving</p>
                    <p id="nutri-calories" class="text-4xl font-bold text-emerald-600">${nuPer.calories}</p>
                    <p id="nutri-total-calories" class="text-xs text-gray-500 mt-1">Total: ${nu.calories} cal</p>
            </div>

             <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span class="text-gray-700">Protein</span>
                      </div>
                      <span id="nutri-protein" class="font-bold text-gray-900">${nuPer.protein}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div id="bar-protein"
                        class="bg-emerald-500 h-2 rounded-full"
                        style="width: ${proteinPercentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span class="text-gray-700">Carbs</span>
                      </div>
                      <span id="nutri-carbs" class="font-bold text-gray-900">${nuPer.carbs}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div id="bar-carbs"
                        class="bg-blue-500 h-2 rounded-full"
                        style="width: ${carbsPercentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span class="text-gray-700">Fat</span>
                      </div>
                      <span id="nutri-fats" class="font-bold text-gray-900">${nuPer.fat}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div id="bar-fats"
                        class="bg-purple-500 h-2 rounded-full"
                        style="width: ${fatPercentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span class="text-gray-700">Fiber</span>
                      </div>
                      <span id="nutri-fiber" class="font-bold text-gray-900">${nuPer.fiber}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div id="bar-fiber"
                        class="bg-orange-500 h-2 rounded-full"
                        style="width: ${fiberPercentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                        <span class="text-gray-700">Sugar</span>
                      </div>
                      <span id="nutri-suger" class="font-bold text-gray-900">${nuPer.sugar}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div id="bar-suger"
                        class="bg-pink-500 h-2 rounded-full"
                        style="width: ${sugarPercentage}%"
                      ></div>
                    </div>
                  </div>

                <div class="mt-6 pt-6 border-t border-gray-100">
                  <h3 class="text-sm font-semibold text-gray-900 mb-3">Other</h3>
                <div class="flex gap-4 text-sm">

                 <div class="text-gray-600">
                 Cholesterol 
                 <span class="font-medium text-gray-900">${nuPer.cholesterol || 0}mg</span>
                 </div>

                 <div class="text-gray-600">Sodium
                  <span class="font-medium text-gray-900">${nuPer.sodium || 0}mg</span>
                  </div>
                  </div>
                </div>

        `;
      }
    } catch (error) {
      console.log("error");
    }

    showDetailsPage();
  } catch (error) {
    console.log("error");
  }
}

function connectMealCards() {
  const allCards = document.querySelectorAll(".recipe-card");
  for (let k = 0; k < allCards.length; k++) {
    allCards[k].addEventListener("click", function () {
      let id = this.getAttribute("data-meal-id");
      getMealById(id);
    });
  }
}

//PRODUCT SCANNER

const productSearchBtn = document.getElementById("search-product-btn");
const productSearchInput = document.getElementById("product-search-input");
const productsGrid = document.getElementById("products-grid");
const productsCountText = document.getElementById("products-count");

let currentFetchedProducts = [];

async function getProductByName(query) {
  if (!query) {
    productsCountText.innerText = "Search for products to see results";
    productsGrid.innerHTML = getEmptyProductState();
    return;
  }
  showLoader(mealsContainer);
  try {
    const response = await fetch(
      `${baseUrl}/products/search?q=${query}&page=1&limit=24`,
    );

    if (!response.ok) {
      throw new Error(`Error, status: ${response.status}`);
    }

    const payload = await response.json();
    const products = payload.results;
    console.log(products);

    currentFetchedProducts = products;

    displayProducts(products, query);
  } catch (error) {
    console.log("error");
    productsGrid.innerHTML = getEmptyProductState();
  }
}

if (productSearchInput && productSearchBtn) {
  productSearchBtn.addEventListener("click", function () {
    const searchText = productSearchInput.value.trim();
    getProductByName(searchText);
  });
}

function displayProducts(productsArray, searchQuery) {
  productsGrid.innerHTML = "";

  if (productsArray.length === 0) {
    productsCountText.innerText = `Search for products to see results`;
    productsGrid.innerHTML = getEmptyProductState();
    return;
  }

  productsCountText.innerText = `Found ${productsArray.length} products for "${searchQuery}"`;

  let htmlData = "";

  for (let i = 0; i < productsArray.length; i++) {
    const rawCalories = parseFloat(productsArray[i].nutrients.calories);
    const calories = Math.round(rawCalories);

    const rawProtein = parseFloat(productsArray[i].nutrients.protein);
    const protein = rawProtein.toFixed(1);

    const rawCarbs = parseFloat(productsArray[i].nutrients.carbs);
    const carbs = rawCarbs.toFixed(1);

    const rawFat = parseFloat(productsArray[i].nutrients.fat);
    const fat = rawFat.toFixed(1);

    const rawSuger = parseFloat(productsArray[i].nutrients.sugar);
    const suger = rawSuger.toFixed(1);

    const currentImage = productsArray[i].image;
    const productName = productsArray[i].name;

    const fallBackIcon = `
   <div class="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center"> 
   <i class="fa-solid fa-box text-2xl text-gray-400"></i>
   
    </div>
   `;

    const currentProductImage = ` <img
                    class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    src="${productsArray[i].image}"
                    alt="${productsArray[i].name}"
                    loading="lazy"
    />`;

    htmlData += `
       <div
                class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                data-barcode="${productsArray[i].barcode}"
              >
                <div
                  class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
                >
                 ${currentImage ? currentProductImage : fallBackIcon}

                  <!-- Nutri-Score Badge -->
                  <div
                    class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase"
                  >
                    Nutri-Score ${productsArray[i].nutritionGrade}
                  </div>

                  <!-- NOVA Badge -->
                 
                  ${
                    productsArray[i].novaGroup
                      ? `
                     <div
                    class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                    title="NOVA ${productsArray[i].novaGroup}"
                  >
                   ${productsArray[i].novaGroup}
                  </div>
                    `
                      : ""
                  }
                </div>

                <div class="p-4">
                  <p
                    class="text-xs text-emerald-600 font-semibold mb-1 truncate"
                  >
                    ${productsArray[i].brand}
                  </p>
                  <h3
                    class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors"
                  >
                    ${productsArray[i].name}
                  </h3>

                  <div
                    class="flex items-center gap-3 text-xs text-gray-500 mb-3"
                  >
                    <span
                      ><i class="fa-solid fa-fire mr-1"></i>${calories} kcal/100g</span
                    >
                  </div>

                  <!-- Mini Nutrition -->
                  <div class="grid grid-cols-4 gap-1 text-center">
                    <div class="bg-emerald-50 rounded p-1.5">
                      <p class="text-xs font-bold text-emerald-700">${protein}g</p>
                      <p class="text-[10px] text-gray-500">Protein</p>
                    </div>
                    <div class="bg-blue-50 rounded p-1.5">
                      <p class="text-xs font-bold text-blue-700">${carbs}g</p>
                      <p class="text-[10px] text-gray-500">Carbs</p>
                    </div>
                    <div class="bg-purple-50 rounded p-1.5">
                      <p class="text-xs font-bold text-purple-700">${fat}g</p>
                      <p class="text-[10px] text-gray-500">Fat</p>
                    </div>
                    <div class="bg-orange-50 rounded p-1.5">
                      <p class="text-xs font-bold text-orange-700">${suger}g</p>
                      <p class="text-[10px] text-gray-500">Sugar</p>
                    </div>
                  </div>
                </div>
      </div>
    `;
  }
  productsGrid.innerHTML = htmlData;

  const cards = document.querySelectorAll(".product-card");
  for (let i = 0; i < cards.length; i++) {
    cards[i].addEventListener("click", function () {
      openProductModal(productsArray[i]);
    });
  }
}

const productCategories = document.getElementById("product-categories");

async function getProductCategories() {
  try {
    const response = await fetch(`${baseUrl}/products/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const payload = await response.json();
    const categoriesArray = payload.results;
    console.log(categoriesArray);

    displayCategories(categoriesArray);
  } catch (error) {
    console.log("error");
  }
}

function displayCategories(categoriesArray) {
  if (categoriesArray.length === 0) {
    productsCountText.innerText = `Search for products to see results`;
    productsGrid.innerHTML = getEmptyProductState();
    return;
  }

  let htmlData = "";

  for (let i = 0; i < categoriesArray.length; i++) {
    const categoryId = categoriesArray[i].id;
    const categoryName = categoriesArray[i].name;

    let colorClasses = "bg-gray-50 text-gray-700 hover:bg-gray-200";
    let iconClass = " fa-folder";

    if (categoryId === "snacks") {
      colorClasses =
        "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:bg-emerald-200 font-semibold";
      iconClass = "fa-cookie mr-1.5";
    } else if (categoryId === "beverages") {
      colorClasses =
        "bg-gradient-to-br from-blue-500 to-cyan-500 text-white hover:bg-blue-200 font-semibold";
      iconClass = " fa-glass-water mr-1.5";
    } else if (categoryId === "cheeses") {
      colorClasses =
        "bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:bg-amber-200 font-semibold";
      iconClass = "fa-cheese mr-1.5";
    } else if (categoryId === "dairies") {
      colorClasses =
        "bg-gradient-to-br from-sky-400 to-blue-500 text-white hover:bg-purple-200 font-semibold";
      iconClass = " fa-ice-cream mr-1.5";
    } else if (categoryId === "yogurts") {
      colorClasses =
        "bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:bg-purple-200 font-semibold";
      iconClass = "fa-seedling mr-1.5";
    } else if (categoryId === "chocolates") {
      colorClasses =
        "bg-gradient-to-br from-amber-500 to-yellow-500 text-white hover:bg-purple-200 font-semibold";
      iconClass = "fa-cookie mr-1.5";
    } else if (categoryId === "biscuits") {
      colorClasses =
        "bg-gradient-to-br from-red-500 to-rose-500 text-white hover:bg-purple-200 font-semibold";
      iconClass = "fa-stroopwafel mr-1.5";
    }

    htmlData += `
   <button
       class="product-category-btn px-5 py-3  rounded-xl text-sm font-medium whitespace-nowrap  transition-all ${colorClasses}"
        data-category-id="${categoryId}"
       >
        <i class="fa-solid ${iconClass}"></i> ${categoriesArray[i].name}
    </button>
  `;
  }

  productCategories.innerHTML = htmlData;

  connectCategoryBtn();
}

function connectCategoryBtn() {
  const productCategoryBtn = document.querySelectorAll(".product-category-btn");

  for (let i = 0; i < productCategoryBtn.length; i++) {
    productCategoryBtn[i].addEventListener("click", function () {
      let clickedCategoryId = this.getAttribute("data-category-id");
      getProductCategories(clickedCategoryId);
    });
  }
}

function connectNutritionFilters() {
  const nutriFilterBtn = document.querySelectorAll(".nutri-score-filter");

  for (let i = 0; i < nutriFilterBtn.length; i++) {
    nutriFilterBtn[i].addEventListener("click", function () {
      const selectedGrade = this.getAttribute("data-grade");
      filterByGrade(selectedGrade);
    });
  }
}

function filterByGrade(grade) {
  if (!grade === "all") {
    displayProducts(currentFetchedProducts, "All");
    return;
  }
  let filterList = [];
  for (let i = 0; i < currentFetchedProducts.length; i++) {
    const productGrade = currentFetchedProducts[i].nutritionGrade;
    if (productGrade === grade) {
      filterList.push(currentFetchedProducts[i]);
    }
  }
  displayProducts(filterList, grade);
}

function openProductModal(product) {
  const nutrients = product.nutrients;
  const calories = Math.round(parseFloat(nutrients.calories)) || 0;
  const protein = (parseFloat(nutrients.protein) || 0).toFixed(1);
  const carbs = (parseFloat(nutrients.carbs) || 0).toFixed(1);
  const fat = (parseFloat(nutrients.fat) || 0).toFixed(1);
  const suger = (parseFloat(nutrients.sugar) || 0).toFixed(1);
  const satFate = (parseFloat(nutrients.satFate) || 0).toFixed(1);
  const fiber = (parseFloat(nutrients.fiber) || 0).toFixed(1);
  const salt = (parseFloat(nutrients.salt) || 0).toFixed(2);

  const proteinPct = pct(protein, 50);
  const carbsPct = pct(carbs, 250);
  const fatPct = pct(fat, 65);
  const sugarPct = pct(suger, 50);

  const nutriScore = product.nutritionGrade
    ? product.nutritionGrade
    : "UNKNOWN";

  let modalHtml = "";

  const currentImage = product.image;
  const productName = product.name;

  const fallBackIcon = `
   <div class="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center"> 
   <i class="fa-solid fa-box text-2xl text-gray-400"></i>
   
    </div>
   `;

  const currentProductImage = `<div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
    <img class="w-full h-full object-contain" src="${product.image}" alt="${product.name}" />
    </div>`;

  modalHtml += `
  <div id="dynamic-product-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
   
    <div class="p-6">
    
   <div class="flex items-start gap-6 mb-6">
   <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
        ${currentImage ? currentProductImage : fallBackIcon}                      
   </div>
    
    
    <div class="flex-1">
    <p class="text-sm font-semibold text-emerald-600 mb-1">${product.brand}</p>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">${product.name}</h2>
     <p class="text-xs text-gray-500 mb-3">1 unit</p>
     <div class="flex items-center gap-3">

      <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: #ecb020">
       <span class="text-white text-xs font-bold uppercase">Nutri-Score ${nutriScore}</span>
        </div>

        ${
          product.novaGroup
            ? `<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: #e63e12">
        <span class="text-white text-xs font-bold">NOVA ${product.novaGroup}</span>
        </div>`
            : ""
        } 
        </div>
        </div>

          <button id="modal-x-btn" class="text-gray-400 hover:text-gray-600">
          <i class="text-2xl fa-solid fa-xmark"></i>
         </button> 
      </div>

            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
             <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="text-emerald-600 fa-solid fa-chart-pie"></i>
             Nutrition Facts <span class="text-sm font-normal text-gray-500">(per 100g)</span>
              </h3>

               <div class="text-center mb-4 pb-4 border-b border-emerald-200">
               <p class="text-4xl font-bold text-gray-900">${calories}</p>
                <p class="text-sm text-gray-500">Calories</p>
                </div>

               <div class="grid grid-cols-4 gap-4">
               <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div class="bg-blue-500 h-2 rounded-full" style="width: ${carbsPct}%"></div>
                   </div>
                 <p class="text-lg font-bold text-blue-600">${carbs}</p>
                  <p class="text-xs text-gray-500">Carbs</p>
                   </div>

                   <div class="text-center">
                      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div class="bg-purple-500 h-2 rounded-full" style="width: ${fatPct}%"></div>
                      </div>
                   <p class="text-lg font-bold text-purple-600">${fat}</p>
                    <p class="text-xs text-gray-500">Fat</p>
                    </div>

                    <div class="text-center">
                      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                           <div class="bg-emerald-500 h-2 rounded-full" style="width: ${proteinPct}%"></div>
                        </div>
                      <p class="text-lg font-bold text-emerald-600">${protein}</p>
                       <p class="text-xs text-gray-500">Protein</p>
                        </div>

                         <div class="text-center">
                          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-orange-500 h-2 rounded-full" style="width: ${sugarPct}%"></div>
                          </div>
                          <p class="text-lg font-bold text-orange-600">${suger}</p>
                           <p class="text-xs text-gray-500">Sugar</p>
                          </div>
                    </div>

                 <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200"> 
                 <div class="text-center">
                  <p class="text-sm font-semibold text-gray-900">${satFate}</p>
                   <p class="text-xs text-gray-500">Saturated Fat</p>
                    </div> 
                    <div class="text-center">
                     <p class="text-sm font-semibold text-gray-900">${fiber}</p>
                      <p class="text-xs text-gray-500">Fiber</p>
                       </div>
                        <div class="text-center">
                         <p class="text-sm font-semibold text-gray-900">${salt}</p> 
                         <p class="text-xs text-gray-500">Salt</p>
                          </div>  
                          </div>
                           </div>

                            <div class="bg-gray-50 rounded-xl p-5 mb-6">
                             <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <i class="text-gray-600 fa-solid fa-list"></i>
                               Ingredients 
                                </h3>
                                <p class="text-sm text-gray-600 leading-relaxed max-h-24 overflow-y-auto">${product.ingredients || "No ingredients listed for this product."}</p>
                                 </div>

                                  <div class="flex gap-3"> 
                                  <button id="modal-log-btn" class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                   <i class="fa-solid fa-plus"></i>Log This Food
                                    </button> 
                                    <button id="modal-close-btn" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">Close</button> 
                                    </div>
                                     </div>
                                      </div>
                                  </div>
  
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  var modalElement = document.getElementById("dynamic-product-modal");
  var xBtn = document.getElementById("modal-x-btn");
  var closeBtn = document.getElementById("modal-close-btn");
  var logBtn = document.getElementById("modal-log-btn");

  function removeModal() {
    if (modalElement) {
      modalElement.remove();
    }
  }

  if (xBtn) xBtn.addEventListener("click", removeModal);
  if (closeBtn) closeBtn.addEventListener("click", removeModal);

  if (modalElement) {
    modalElement.addEventListener("click", function (e) {
      if (e.target === modalElement) {
        removeModal();
      }
    });
  }

  if (logBtn) {
    logBtn.addEventListener("click", function () {
      let currentLog = JSON.parse(localStorage.getItem("foodLog"));
      if (!Array.isArray(currentLog)) {
        currentLog = [];
      }
      let logEntry = {
        id: product.id || product.barcode || Date.now().toString(),
        name: product.name || "Product",
        brand: product.brand || "Brand",
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        date: new Date().toLocaleDateString(),
      };
      let updatedLog = [].concat(currentLog, [logEntry]);
      localStorage.setItem("foodLog", JSON.stringify(updatedLog));
      removeModal();

      updateFoodLogUI();
      console.log("hhh");
    });
  }
}

async function searchByBarcode() {
  const barcodeInput = document.getElementById("barcode-input");
  const barcodeValue = barcodeInput.value.trim();
  if (!barcodeValue) return;

  showLoader(productsGrid);
  try {
    const response = await fetch(`${baseUrl}/products/barcode/${barcodeValue}`);

    if (!response.ok) {
      throw new Error("product not found");
    }

    const payload = await response.json();
    const product = payload.result;

    openProductModal(product);
  } catch (error) {
    console.log("error");
  } finally {
    if (currentFetchedProducts.length) {
      displayProducts(currentFetchedProducts, "previous search");
    } else {
      productsGrid.innerHTML = getEmptyProductState();
    }
  }
}

const lookuBtn = document.getElementById("lookup-barcode-btn");

lookuBtn.addEventListener("click", function () {
  searchByBarcode();
});

const FOODLOG_KEY = "foodLog";
const TARGETS = { calories: 2000, protein: 50, carbs: 250, fat: 65 };

function getFoodLog() {
  try {
    const log = JSON.parse(localStorage.getItem(FOODLOG_KEY));
    return Array.isArray(log) ? log : [];
  } catch (e) {
    return [];
  }
}

function saveFoodLog(log) {
  localStorage.setItem(FOODLOG_KEY, JSON.stringify(log));
}

function getTodayString() {
  return new Date().toLocaleDateString();
}

function addToFoodLog(entry) {
  const log = getFoodLog();
  log.push({
    uid: Date.now().toString() + Math.random().toString(16).slice(2),
    date: getTodayString(),
    image: "",
    brand: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ...entry,
  });
  saveFoodLog(log);
  updateFoodLogUI();

  Swal.fire({
    icon: "success",
    title: "Added to Food Log",
    text: entry.name,
    timer: 1500,
    showConfirmButton: false,
  });
}

function updateFoodLogUI() {
  renderWeeklyChart();
  const todayItems = getFoodLog().filter((i) => i.date === getTodayString());

  let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  todayItems.forEach((item) => {
    total.calories += Number(item.calories) || 0;
    total.protein += Number(item.protein) || 0;
    total.carbs += Number(item.carbs) || 0;
    total.fat += Number(item.fat) || 0;
  });

  const dateEl = document.getElementById("foodlog-date");
  if (dateEl) {
    dateEl.innerText = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  const section = document.getElementById("foodlog-today-section");
  const cardsConfig = [
    { selector: ".bg-emerald-50.rounded-xl", key: "calories", unit: "kcal" },
    { selector: ".bg-blue-50.rounded-xl", key: "protein", unit: "g" },
    { selector: ".bg-amber-50.rounded-xl", key: "carbs", unit: "g" },
    { selector: ".bg-purple-50.rounded-xl", key: "fat", unit: "g" },
  ];

  cardsConfig.forEach((cfg) => {
    const card = section.querySelector(cfg.selector);
    if (!card) return;
    const value = Math.round(total[cfg.key] * 10) / 10;
    const percent = Math.min((total[cfg.key] / TARGETS[cfg.key]) * 100, 100);

    card.querySelector("span.text-gray-500").innerText =
      `${value} / ${TARGETS[cfg.key]} ${cfg.unit}`;
    card.querySelector(".bg-gray-200 > div").style.width = percent + "%";
  });

  const countTitle = section.querySelector("h4");
  if (countTitle) countTitle.innerText = `Logged Items (${todayItems.length})`;

  const clearBtn = document.getElementById("clear-foodlog");
  if (clearBtn) clearBtn.style.display = todayItems.length ? "block" : "none";

  const list = document.getElementById("logged-items-list");
  if (!list) return;

  if (todayItems.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
        <p class="font-medium">No meals logged today</p>
        <p class="text-sm">Add meals from the Meals page or scan products</p>
      </div>`;
    return;
  }

  let html = "";
  for (let i = 0; i < todayItems.length; i++) {
    const item = todayItems[i];
    const image = item.image
      ? `<img class="object-contain w-full h-full" src="${item.image}" alt="${item.name}" />`
      : `<i class="fa-solid fa-utensils text-gray-400"></i>`;

    html += `
      <div class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-50 border rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0">
            ${image}
          </div>
          <div>
            <h4 class="text-sm font-bold text-gray-900 line-clamp-1">${item.name}</h4>
            <p class="text-[10px] text-gray-400">${item.brand || ""}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right text-xs">
            <strong class="text-gray-900 block">${Math.round(item.calories)} kcal</strong>
            <span class="text-[10px] text-gray-400">
              P: ${item.protein}g | C: ${item.carbs}g | F: ${item.fat}g
            </span>
          </div>
          <button class="delete-logged-item-btn text-gray-300 hover:text-red-500 p-1 transition-colors" data-uid="${item.uid}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>`;
  }
  list.innerHTML = html;
}

const loggedItemsList = document.getElementById("logged-items-list");
if (loggedItemsList) {
  loggedItemsList.addEventListener("click", function (e) {
    const btn = e.target.closest(".delete-logged-item-btn");
    if (!btn) return;
    const uid = btn.getAttribute("data-uid");
    saveFoodLog(getFoodLog().filter((item) => item.uid !== uid));
    updateFoodLogUI();
  });
}

const clearFoodLogBtn = document.getElementById("clear-foodlog");
if (clearFoodLogBtn) {
  clearFoodLogBtn.addEventListener("click", async function () {
    const result = await Swal.fire({
      title: "Clear all items?",
      text: "This will remove all items logged today.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, clear all",
    });
    if (!result.isConfirmed) return;

    const rest = getFoodLog().filter((item) => item.date !== getTodayString());
    saveFoodLog(rest);
    updateFoodLogUI();
  });
}

function renderWeeklyChart() {
  const container = document.getElementById("weekly-chart");
  if (!container) return;

  const log = getFoodLog();
  const today = new Date();

  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  let totalCalories = 0;
  let totalItems = 0;
  let daysOnGoal = 0;
  let daysHtml = "";

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const dayItems = log.filter((item) => item.date === d.toLocaleDateString());
    const dayCalories = Math.round(
      dayItems.reduce((sum, item) => sum + (Number(item.calories) || 0), 0),
    );

    totalCalories += dayCalories;
    totalItems += dayItems.length;

    if (
      dayCalories >= TARGETS.calories * 0.9 &&
      dayCalories <= TARGETS.calories * 1.1
    ) {
      daysOnGoal++;
    }

    const isToday = d.toDateString() === today.toDateString();
    const hasData = dayCalories > 0;

    daysHtml += `
      <div class="text-center p-3 rounded-xl ${
        isToday ? "bg-indigo-50 border-2 border-indigo-300" : "bg-gray-50"
      }">
        <p class="text-xs font-medium text-gray-500">${d.toLocaleDateString("en-US", { weekday: "short" })}</p>
        <p class="text-lg font-bold text-gray-900 my-1">${d.getDate()}</p>
        <p class="text-xl font-bold ${hasData ? "text-emerald-600" : "text-gray-300"}">${dayCalories}</p>
        <p class="text-xs ${hasData ? "text-gray-500" : "text-gray-300"}">kcal</p>
        ${
          hasData
            ? `<p class="text-[11px] text-gray-400 mt-1">${dayItems.length} item${dayItems.length > 1 ? "s" : ""}</p>`
            : ""
        }
      </div>`;
  }

  const weeklyAverage = Math.round(totalCalories / 7);

  container.className = "";
  container.innerHTML = `
    <div class="grid grid-cols-7 gap-3 mb-6">
      ${daysHtml}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
        <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
          <i class="fa-solid fa-chart-line text-emerald-600 text-xl"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">Weekly Average</p>
          <p class="text-xl font-bold text-gray-900">${weeklyAverage} kcal</p>
        </div>
      </div>

      <div class="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
        <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <i class="fa-solid fa-utensils text-blue-600 text-xl"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total Items This Week</p>
          <p class="text-xl font-bold text-gray-900">${totalItems} items</p>
        </div>
      </div>

      <div class="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
        <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
          <i class="fa-solid fa-bullseye text-purple-600 text-xl"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">Days On Goal</p>
          <p class="text-xl font-bold text-gray-900">${daysOnGoal} / 7</p>
        </div>
      </div>
    </div>
  `;
}

updateFoodLogUI();

const logMealBtn = document.getElementById("log-meal-btn");
if (logMealBtn) {
  logMealBtn.addEventListener("click", openLogMealModal);
}

function openLogMealModal() {
  if (!currentMeal) return;

  const base = currentMeal;
  let servings = 1;

  Swal.fire({
    html: `
      <div class="text-left">
        <div class="flex items-center gap-3 mb-5">
          <img src="${base.image}" alt="${base.name}" class="w-14 h-14 rounded-lg object-cover" />
          <div>
            <h2 class="text-lg font-bold text-gray-900">Log This Meal</h2>
            <p class="text-sm text-gray-500">${base.name}</p>
          </div>
        </div>

        <p class="text-sm font-semibold text-gray-700 mb-2">Number of Servings</p>
        <div class="flex items-center gap-3 mb-5">
          <button type="button" id="serv-minus" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-xl font-bold">−</button>
          <input id="serv-input" type="number" min="0.5" step="0.5" value="1"
            class="w-20 h-10 text-center border border-gray-300 rounded-lg font-bold" />
          <button type="button" id="serv-plus" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-xl font-bold">+</button>
        </div>

        <div class="bg-emerald-50 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-3">Estimated nutrition:</p>
          <div class="grid grid-cols-4 text-center">
            <div><p id="est-cal" class="font-bold text-emerald-600">${base.calories}</p><p class="text-xs text-gray-500">Calories</p></div>
            <div><p id="est-pro" class="font-bold text-blue-600">${base.protein}g</p><p class="text-xs text-gray-500">Protein</p></div>
            <div><p id="est-carb" class="font-bold text-amber-600">${base.carbs}g</p><p class="text-xs text-gray-500">Carbs</p></div>
            <div><p id="est-fat" class="font-bold text-purple-600">${base.fat}g</p><p class="text-xs text-gray-500">Fat</p></div>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText:
      '<i class="fa-solid fa-clipboard-list mr-2"></i>Log Meal',
    cancelButtonText: "Cancel",
    confirmButtonColor: "#2563eb",
    didOpen: () => {
      const input = document.getElementById("serv-input");

      const refresh = () => {
        servings = Math.max(parseFloat(input.value) || 1, 0.5);
        document.getElementById("est-cal").innerText = Math.round(
          base.calories * servings,
        );
        document.getElementById("est-pro").innerText =
          Math.round(base.protein * servings) + "g";
        document.getElementById("est-carb").innerText =
          Math.round(base.carbs * servings) + "g";
        document.getElementById("est-fat").innerText =
          Math.round(base.fat * servings) + "g";
      };

      document.getElementById("serv-minus").addEventListener("click", () => {
        input.value = Math.max((parseFloat(input.value) || 1) - 0.5, 0.5);
        refresh();
      });
      document.getElementById("serv-plus").addEventListener("click", () => {
        input.value = (parseFloat(input.value) || 1) + 0.5;
        refresh();
      });
      input.addEventListener("input", refresh);
    },
    preConfirm: () => {
      return Math.max(
        parseFloat(document.getElementById("serv-input").value) || 1,
        0.5,
      );
    },
  }).then((result) => {
    if (!result.isConfirmed) return;

    const s = result.value;
    const entry = {
      uid: Date.now().toString() + Math.random().toString(16).slice(2),
      date: getTodayString(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      id: base.id,
      name: base.name,
      brand: base.brand,
      image: base.image,
      type: "meal",
      servings: s,
      calories: Math.round(base.calories * s),
      protein: Math.round(base.protein * s),
      carbs: Math.round(base.carbs * s),
      fat: Math.round(base.fat * s),
    };

    const log = getFoodLog();
    log.push(entry);
    saveFoodLog(log);
    updateFoodLogUI();

    Swal.fire({
      icon: "success",
      title: "Meal Logged!",
      html: `${base.name} (${s} serving${s > 1 ? "s" : ""}) has been added to your daily log.<br><b style="color:#10b981">+${entry.calories} calories</b>`,
      timer: 2000,
      showConfirmButton: false,
    });
  });
}

getProductCategories();
connectNutritionFilters();

if (productsGrid) {
  productsGrid.innerHTML = getEmptyProductState();
}

let currentView = "grid";

const gridViewBtn = document.getElementById("grid-view-btn");
const listViewBtn = document.getElementById("list-view-btn");

function applyView() {
  const cards = mealsContainer.querySelectorAll(".recipe-card");

  if (currentView === "list") {
    mealsContainer.classList.remove("grid-cols-4");
    mealsContainer.classList.add("grid-cols-2");
  } else {
    mealsContainer.classList.remove("grid-cols-2");
    mealsContainer.classList.add("grid-cols-4");
  }

  for (let i = 0; i < cards.length; i++) {
    const imgBox = cards[i].children[0];

    if (currentView === "list") {
      cards[i].style.display = "flex";
      cards[i].style.alignItems = "stretch";

      imgBox.style.width = "160px";
      imgBox.style.height = "auto";
      imgBox.style.minHeight = "130px";
      imgBox.style.flexShrink = "0";
    } else {
      cards[i].style.display = "";
      cards[i].style.alignItems = "";

      imgBox.style.width = "";
      imgBox.style.height = "";
      imgBox.style.minHeight = "";
      imgBox.style.flexShrink = "";
    }
  }

  gridViewBtn.className =
    currentView === "grid"
      ? "px-3 py-1.5 bg-white rounded-md shadow-sm"
      : "px-3 py-1.5";
  listViewBtn.className =
    currentView === "list"
      ? "px-3 py-1.5 bg-white rounded-md shadow-sm"
      : "px-3 py-1.5";
}

gridViewBtn.addEventListener("click", function () {
  currentView = "grid";
  applyView();
});

listViewBtn.addEventListener("click", function () {
  currentView = "list";
  applyView();
});
