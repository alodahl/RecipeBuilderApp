'use strict';

let queryArray = [];
let recipes = [];
let firstResult = 0;
let lastResult = 24;

function getDataFromApi(searchTerm , callback) {
  const settings = {
    url: 'https://api.edamam.com/search',
    data: {
      q: `${searchTerm} in:ingredients`,
      app_id: '37073675',
      app_key: '46b633f590a05be11cab8a438977deb9',
      from: firstResult,
      // to: lastResult,
      // part: 'hits'
    },
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      console.log(data);
      recipes = data;
      displaySearchData(recipes);
    }
  };
  $.ajax(settings);
}


function renderResult(item, index) {
  let recipeResult = `<span class="thumbnail col-3" data-id="${index}">
  <img src="${item.recipe.image}" alt="${item.recipe.label}">
  <h3>${item.recipe.label}</h3>
  <h4>by ${item.recipe.source}</h4>
  <p>${item.recipe.ingredients.length} ingredients</p></span>`;
  return recipeResult;
}

function renderlistInstructions(recipeIngredientsArray) {
let renderedList = "";
  for (let i=0; i < recipeIngredientsArray.length; i++) {
    renderedList += `<li class="instructions">${recipeIngredientsArray[i]}</li>`;
  }
  return renderedList;
}

//sends API items to get rendered,
//then displays them in the dom along with the search results count
function displaySearchData(data) {
  const results = data.hits.map((item, index) => renderResult(item, index));
  var index = $('.thumbnail').attr('data-id');
  $('.js-resultNum').text(data.count);
  $('h2').prop("hidden", false);
  $('.js-results').html(results);
  if (lastResult < data.count) {
    $('.js-see-more-results-button').prop("hidden", false);
  } else {
    $('.js-see-more-results-button').prop("hidden", true);
  }
  if (recipes.count === 0) {
    $(".js-results").text("Try removing one ingredient or check your spelling to find some recipes.");
  }
}

function renderIngrButton(item, index) {
  let button = `<button class="added-ingredient button" type="button" data-index="${index}">${item} X</button>`;
  return button;
}

//sends submitted ingredients to be rendered,
//then adds them to page as buttons
function displayAddedIngredients() {
  const ingredients = queryArray.map((item, index) => renderIngrButton(item, index));
  $('.js-added-ingredient-list').html(ingredients);
}


function watchForClicks() {
  //a submitted ingredient will get added to page as well as an ingredients array
  $('.js-ingr-search-form').submit(event => {
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    const query = queryTarget.val();  //'query' = the value of the user's input string
    queryArray.push(query);
    displayAddedIngredients();
    queryTarget.val("");  // clear out the input
    $('input').prop("placeholder", "add another or find recipes")
  });

  //click on the find recipes button to search for recipe with added ingredients
  $('.js-find-recipes').on('click', event => {
    firstResult = 0;
    lastResult = 24;
    getDataFromApi(queryArray, displaySearchData);
  })

  //click on an added ingredient to remove it from the ingredients array
  $('.js-added-ingredient-list').on('click', '.added-ingredient', function(event) {
    var index = $(this).attr('data-index');
    queryArray.splice(index, 1);
    displayAddedIngredients();
  })

  //click thumbnail to open a modal with appended details about recipe
  $('.js-results').on('click', ".thumbnail", function(event) {
    var index = $(this).attr('data-id');
    var selectedRecipe = recipes.hits[index].recipe;
    var image = selectedRecipe.image;
    var label = selectedRecipe.label;
    var source = selectedRecipe.source;
    var servings = selectedRecipe.yield;
    var ingredients = renderlistInstructions(selectedRecipe.ingredientLines);
    let content = `<img class="detail-photo" src="${image}" alt="${label}">
      <h3>${label}</h3>
      <h4>by ${source}</h4>
      <p>Serves ${servings}</p>
      <ul>${ingredients}</ul>
      <button type="button" class="recipe-link-button js-recipe-link-button button" data-id="${index}">view recipe directions</button>`;
    $('.js-modal-content').html(content);
    $('.js-modal').removeClass("hidden");  //then show the div
    $('header').attr("aria-hidden", "true");
    $('main').attr("aria-hidden", "true");
    $('footer').attr("aria-hidden", "true");
  })

  $('.js-modal').on('click', ".js-recipe-link-button", function(event) {
    var index = $(this).attr('data-id');
    var selectedRecipe = recipes.hits[index].recipe;
    window.open(`${selectedRecipe.url}`,"_blank",name="Open recipe directions page in new window");
  })

  //click close button to hide modal and show results page
  $('.close-button').on('click', function(event) {
    $('.js-modal').addClass("hidden");
    $('header').attr("aria-hidden", "false");
    $('main').attr("aria-hidden", "false");
    $('footer').attr("aria-hidden", "false");
  })

  $('.dark').on('click', function(event) {
    $('.js-modal').addClass("hidden");
    $('header').attr("aria-hidden", "false");
    $('main').attr("aria-hidden", "false");
    $('footer').attr("aria-hidden", "false");
  })
}

$('.js-see-more-results-button').on('click', event => {
  if (recipes.count > lastResult){
    firstResult += 24;
    lastResult += 24;
    getDataFromApi(queryArray, displaySearchData);
    $('html, body').animate({ scrollTop: 0 }, 'fast');
  }
})

$(watchForClicks);
