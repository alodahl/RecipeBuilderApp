'use strict';

let queryArray = [];
let recipes = [];
let firstResult = 0;
let lastResult = 0;
let displayedLastRecipe = true;

function getDataFromApi(searchTerm , callback) {
  console.log(URL);
  const settings = {
    url: URL,
    data: {
      q: `${searchTerm} in:ingredients`,
      app_id: APP_ID,
      app_key: APP_KEY,
      from: firstResult,
      to: lastResult
    },
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      let newRecipes = data.hits;
      if(newRecipes.length<1){
        displayedLastRecipe = true;
      } //display new array of search results unless the new array is empty
      displaySearchData(newRecipes, recipes.length);
      recipes=[...recipes, ...newRecipes];
    },
    error: function(data) {
      console.log("Error: Edamam API could not answer your request.");
    }
  };
  $.ajax(settings);
}

//renders recipe results and returns them to displaySearchData()
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

//renders recipe ingredients as a list and returns string to
//thumbnail click event listener to be displayed in modal
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
  let terms = ` with "${queryArray.join(", ")}"`
  $('.user-results-message').removeClass("hidden");
  $(".js-user-query-terms").html(terms);
  $('.js-results').append(results);
  if (newRecipes.length === 0) {
    $("#no-results-message").removeClass("hidden");
    // $(".js-results").text("Try removing one ingredient or check your spelling to find some recipes.");
  }
}

//renders queryArray items as ingredient name buttons
function renderIngrButton(item, index) {
  let button = `<button class="added-ingredient button" type="button" data-index="${index}">${item} X</button>`;
  return button;
}

//sends submitted ingredients array to be rendered
//as buttons, then adds them to page
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
    <ul class="ingredients-list">${ingredients}</ul>
    <button type="button" class="recipe-link-button js-recipe-link-button button" data-id="${index}">view recipe directions</button>`;
    $('.js-modal-content').html(content);
    $('.js-modal').removeClass("hidden");  //then show the div
    $('header').attr("aria-hidden", "true");
    $('main').attr("aria-hidden", "true");
    $('footer').attr("aria-hidden", "true");
  })

  //when "view recipe directions" button is clicked,
  //open new window with recipe's original url
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

  //click off light modal to hide modal and return to results page
  $('.dark').on('click', function(event) {
    $('.js-modal').addClass("hidden");
    $('header').attr("aria-hidden", "false");
    $('main').attr("aria-hidden", "false");
    $('footer').attr("aria-hidden", "false");
  })
}

//when user scrolls within 10px of bottom of results,
//if there are more results to show, load 24 more results
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
