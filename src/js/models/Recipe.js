import axios from 'axios';
import {key, proxy} from '../config';

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(`${proxy}http://food2fork.com/api/get?key=${key}&rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
      alert('Something went wrong :(');
    }
  }
  
  calcTime() {
    // Assuming 5 mins per ingerdient (will do for now)
    this.time = this.ingredients.length * 5;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pound', 'pounds'];
    const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'lb', 'lb'];
    const units = [...unitsShort, 'kg', 'g'];

    const newIngredients = this.ingredients.map(el => {
      // uniform units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i])
      });
      // remove parenthesis and trim trailing whitespace
      ingredient = ingredient.replace(/ *\(.*?\) */g, ' ').trim();
      // parse ingredients into count, unit, ingredient
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

      let objIng;
      if (unitIndex > -1) {
        // this is a unit
        
        // find unit count between start of array and the index of the unit
        const arrCount = arrIng.slice(0, unitIndex);
        // e.g. 4 1/2 cups, arrCount = [4, 1/2]
        // e.g. 3 tsp, arrCount = [3]
        let count;
        if (arrCount.length === 1) {
          // remove dashes from ingredient count data and evaluate
          count = eval(arrIng[0].replace('-', '+'));
        } else {
          // join unit counts and evaluate e.g. [4, 1/2] --> eval("4+1/2") = 4.5
          count = eval(arrCount.join('+'));
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        };

      } else if (parseInt(arrIng[0], 10)) {
        // there is no unit, but 1st element is a number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        };
      } else if (unitIndex === -1) {
        // there is no unit and no number in 1st position
        objIng ={
          count: 1,
          unit: '',
          ingredient
        };
      }

      return objIng;
    });
    this.ingredients = newIngredients;
  }
}