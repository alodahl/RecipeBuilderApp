'use strict';

function getDataFromApi() {
  //make 1 JSON query for 1 free API
  //call AJAX via jQuery
  //return result data to displaySearchData()
}

function renderResult() {
  //use string interpolation to create a div containing API recipe data
  //data needed: small photo, title, author
}

function displaySearchData(data) {
  //use jQuery to append "We have # results for you:"
  //use jQuery to renderResult(data) and append the first 12 results to the DOM
  //use jQuery to remove 'hidden' aria attr from main

}

function watchForClicks() {
//create event listener for add-ingredient button
$('.ingr-search-form').submit(event => {
    console.log("add-ingredient button is working");
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    const query = queryTarget.val();  //'query' = the value of the user's input string
    console.log(query);
    queryTarget.val("");  // clear out the input
    //getDataFromApi(query, displaySearchData);
  });
    //append input term to the dom: top of main
    //send input term to query

//create event listener for result clicks,
    //which should open a linked recipe page

}


$(watchForClicks);
