'use strict';

let queryArray = [];
let recipes = [];
let firstResult = 0;
let lastResult = 0;
let displayedLastRecipe = false;

// modal will breaks

function getDataFromApi(searchTerm , callback) {
  const settings = {
    url: 'https://api.edamam.com/search',
    data: {
      q: `${searchTerm} in:ingredients`,
      app_id: '37073675',
      app_key: '46b633f590a05be11cab8a438977deb9',
      from: firstResult,
       to: lastResult
    },
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      let newRecipes = data.hits;

      if(newRecipes.length<1){
        displayedLastRecipe = true;
      }
      displaySearchData(newRecipes, recipes.length);
      recipes=[...recipes, ...newRecipes];
    },
    error: function(data) {
      console.log("Error: Edamam API could not answer your request.");
    }
  };
  $.ajax(settings);
}

//<img src="${item.recipe.image}" alt="${item.recipe.label}">
function renderResult(item, index) {
  let recipeResult = `<span class="thumbnail col-3" data-id="${index}" style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%,rgba(0, 0, 0, 0) 50%,rgba(0, 0, 0, 0.8) 100%, transparent), url('${item.recipe.image}')";>
    <div class="thumbnail-text">
      <h3>${item.recipe.label}</h3>
      <h4>by ${item.recipe.source}</h4>
      <p>${item.recipe.ingredients.length} ingredients</p>
    </div>
  </span>`;
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
function displaySearchData(newRecipes, offset) {
  const results = newRecipes.map((item, index) => renderResult(item, offset+index));
  let index = $('.thumbnail').attr('data-id');
  let terms = ` containing "${queryArray}"`
  $('.user-results-message').removeClass("hidden");
  $(".js-user-query-terms").html(terms);
  $('.js-results').append(results);
  if (newRecipes.length === 0) {
    $("#no-results-message").removeClass("hidden");
    // $(".js-results").text("Try removing one ingredient or check your spelling to find some recipes.");
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
    recipes = [];
    displayedLastRecipe = false;
    $('.js-results').html("")
    $('.js-welcome-message').attr("hidden", "true");
    $("#no-results-message").addClass("hidden");
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
    var selectedRecipe = recipes[index].recipe;
    var image = selectedRecipe.image;
    var label = selectedRecipe.label;
    var source = selectedRecipe.source;
    var servings = selectedRecipe.yield;
    var ingredients = renderlistInstructions(selectedRecipe.ingredientLines);
    let content = `<div class="detail-photo" style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%,rgba(0, 0, 0, 0) 50%,rgba(0, 0, 0, 0.8) 100%, transparent), url('${image}'); background-size: cover; no-repeat">
        <div class="detail-text">
          <h3>${label}</h3>
          <h4>by ${source}</h4>
        </div>
      </div>
      <p class="servings">Serves ${servings}</p>
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
    var selectedRecipe = recipes[index].recipe;
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

$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() > $(document).height() - 10) {

       if (!displayedLastRecipe && lastResult<100){
         console.log("load more")
         firstResult += 24;
         lastResult += 24;
         getDataFromApi(queryArray, displaySearchData);
       }
   }
});

$(watchForClicks);
