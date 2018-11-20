import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * Search object
 * Current recipe object
 * Shopping list object
 * Liked recipes
 */

const state = {};
window.state = state;

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

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    // highlight selected item
    if (state.search) searchView.highlightSelected(id);
    // Create new recipe object
    state.recipe = new Recipe(id);

    // Get recipe data
    try {
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate servings and prep time
      state.recipe.calcTime();
      state.recipe.calcServings();
      // Render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
        );
    } catch (error) {
      console.log(error);
      alert('Error processing recipe :(')
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */

const controlList = () => {
  // create a new list IF there is none yet
  if (!state.list) state.list = new List();

  // add each ingredient to list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
}

// handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    //delete from state
    state.list.deleteItem(id);
    //delete from UI
    listView.deleteItem(id);
  // handle count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

/**
 * LIKE CONTROLLER
 */

 //testing
state.likes = new Likes();

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  // user has not yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    //add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    //toggle like button
    likesView.toggleLikeBtn(true);
    //add like to ui list
    likesView.renderLike(newLike);

  // user has liked current recipe
  } else {
    //remove like from the state
    state.likes.deleteLike(currentID);
    //toggle like button
    likesView.toggleLikeBtn(false);
    //remove like from ui list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikesMenu(state.likes.getNumLikes())
}

// handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    //decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }    
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    //increase button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    //add ingredients to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    //like controller
    controlLike();
  }
});

window.l = new List();