'use strict';

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

function renderResult(item, index) {
  let recipeResult = `<span class="thumbnail">
                        <a href="${item.recipe.url}" aria-label="${item.recipe.label}"  target="_blank"><img src="${item.recipe.image}">
                        <h3>${item.recipe.label}</h3></a>
                        <h4>by ${item.recipe.source}</h4>
                        <p>${item.recipe.ingredients.length} ingredients</p></span>`;
  return recipeResult;
}

function displaySearchData(data) {
  console.log('displaySearchData is running');
  console.log(data);
  console.log(data.count);
  const results = data.hits.map((item, index) => renderResult(item, index));

  $('.js-resultNum').replaceWith(data.count);
  $('h2').prop("hidden", false);
  $('.js-results').html(results);
}

function watchForClicks() {
//create event listener for add-ingredient button
$('.js-ingr-search-form').submit(event => {
    console.log("add-ingredient button is working");
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    const query = queryTarget.val();  //'query' = the value of the user's input string
    console.log(query);
    queryTarget.val("");  // clear out the input
    getDataFromApi(query, displaySearchData);
  });
    //append input term to the dom: top of main
    //send input term to query

//create event listener for result clicks,
    //which should open a linked recipe page

}


$(watchForClicks);
