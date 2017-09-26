'use strict';

let queryArray = [];

function getDataFromApi(searchTerm , callback) {
  const settings = {
    url: 'https://api.edamam.com/search',
    data: {
      q: `${searchTerm} in:ingredients`,
      app_id: '37073675',
      app_key: '46b633f590a05be11cab8a438977deb9',
      to: 8,
      part: 'hits'
    },
    dataType: 'json',
    type: 'GET',
    success: callback
  };
  $.ajax(settings);
}

// <a href="${item.recipe.url}" aria-label="${item.recipe.label}"  target="_blank"></a>
//renders each API recipe as HTML to be displayed
function renderResult(item, index) {
  console.log(item);
  let recipeResult = `<span class="thumbnail" data-index="${index}" data-image="${item.recipe.image}" data-label="${item.recipe.label}" data-source="${item.recipe.source}" data-ingredientlist="${item.recipe.ingredientLines}">
    <img src="${item.recipe.image}" alt="${item.recipe.label}">
    <h3>${item.recipe.label}</h3>
    <h4>by ${item.recipe.source}</h4>
    <p>${item.recipe.ingredients.length} ingredients</p></span>`;
  return recipeResult;
}

//sends API items to get rendered,
//then displays them in the dom along with the search results count
function displaySearchData(data) {
  console.log(data);
  const results = data.hits.map((item, index) => renderResult(item, index));
  $('.js-resultNum').text(data.count);
  $('h2').prop("hidden", false);
  $('.js-results').html(results);
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

function renderIngredientsList(item, index) {
  let listItem = `<li>${item}</li>`
  return listItem;
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
    console.log("ingredient button clicked");
    var index = $(this).attr('data-index');
    queryArray.splice(index, 1);
    displayAddedIngredients();
  })

  //click thumbnail to open a modal with appended details about recipe
  $('.js-results').on('click', ".thumbnail", function(event) {
    console.log(this);
    // var index = $(this).attr('data-index');
    // var data = $(this).attr('data-data');
    var image = $(this).attr('data-image');
    var label = $(this).attr('data-label');
    var source = $(this).attr('data-source');
    var ingredients = $(this).attr('data-ingredientlist');
    // var ingredientList = ingredients.map((item, index) => renderIngredientsList(item, index))
    // console.log(data);
    let content = `<img src="${image}" alt="${label}">
                  <h3>${label}</h3>
                  <h4>by ${source}</h4>
                  <ul>${ingredients}</ul>
                  `;
                    // <p>${ingredients}</p>
    $('.js-modal-content').html(content);

    $('.modal').removeClass("hidden");  //then show the div
    // $('.js-search-results').prop("hidden", true);
    // $('h1').prop("hidden", true);
    // $('form').prop("hidden", true);
  })

  //click close button to hide modal and show results page
  $('.close-button').on('click', function(event) {
    $('.modal').addClass("hidden");
    // $('#video').attr("src", "");
    // $('.js-search-results').prop("hidden", false);
    // $('h1').prop("hidden", false);
    // $('form').prop("hidden", false);
  })
}

$(watchForClicks);
