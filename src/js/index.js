import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * Search object
 * Current recipe object
 * Shopping list object
 * Liked recipes
 */

const state = {};


/**
 * SEARCH CONTROLLER
*/
const controlSearch = async () => {
  // get query from view
  const query = searchView.getInput()

  if (query) {
    // New search ovject and add to state
    state.search = new Search(query);

    // Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes)
    
    try {
    // Search for recipes
    await state.search.getResults();
    // Render results on UI
    clearLoader();
    searchView.renderResults(state.search.result);  
    } catch (error) {
      alert('Something went wrong with the search...')
      clearLoader();
    }    
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
})

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * RECIPE CONTROLLER
*/
const controlRecipe = async () => {
  // Get ID from url hash
  const id = window.location.hash.replace('#', '');
  console.log(id);

  if (id) {
    // Prepare UI for changes

    // Create new recipe object
    state.recipe = new Recipe(id);

    // Get recipe data
    try {
      await state.recipe.getRecipe();
      console.log(state.recipe.ingredients);
      state.recipe.parseIngredients();

      // Calculate servings and prep time
      state.recipe.calcTime();
      state.recipe.calcServings();
      // Render recipe
      console.log(state.recipe);
    } catch (error) {
      alert('Error processing recipe :(')
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
