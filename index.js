'use strict';

let queryArray = [];
let recipes = [];

function getDataFromApi(searchTerm , callback) {
  const settings = {
    url: 'https://api.edamam.com/search',
    data: {
      q: `${searchTerm} in:ingredients`,
      app_id: '37073675',
      app_key: '46b633f590a05be11cab8a438977deb9',
      from: 0,
      to: 48,
      part: 'hits'
    },
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      recipes = data;
      displaySearchData(recipes);
    }
  };
  $.ajax(settings);
}


function renderResult(item, index) {
  let recipeResult = `<span class="thumbnail" data-id="${index}">
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
  $('.thumbnail').filter(index > 47).hide();
  // if (data.count > 48) {
  //   $('.js-see-more-results-button').prop("hidden", false);
  // }
}

function renderIngrButton(item, index) {
  let button = `<button class="added-ingredient" type="button" data-index="${index}">${item} X</button>`;
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
  });

  //click on the find recipes button to search for recipe with added ingredients
  $('.js-find-recipes').on('click', event => {
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
      <button type="button" class="recipe-link-button js-recipe-link-button" data-id="${index}">view recipe directions</button>`;
    $('.js-modal-content').html(content);
    $('.modal').removeClass("hidden");  //then show the div
    console.log(recipes);
    // $('.js-search-results').prop("hidden", true);
    // $('h1').prop("hidden", true);
    // $('form').prop("hidden", true);
  })

  $('.js-modal').on('click', ".js-recipe-link-button", function(event) {
    var index = $(this).attr('data-id');
    var selectedRecipe = recipes.hits[index].recipe;
    window.open(`${selectedRecipe.url}`,"_blank",name="Open recipe directions page in new window");
  })

  //click close button to hide modal and show results page
  $('.close-button').on('click', function(event) {
    $('.modal').addClass("hidden");
    // $('#video').attr("src", "");
    // $('.js-search-results').prop("hidden", false);
    // $('h1').prop("hidden", false);
    // $('form').prop("hidden", false);
  })

  $('.dark').on('click', function(event) {
    $('.modal').addClass("hidden");
  })
}

// $('.js-see-more-results-button').on('click', event => {
//   $('#grid li:hidden').slice(0, 5).slideDown();
// })

$(watchForClicks);
