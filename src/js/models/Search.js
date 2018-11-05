import axios from 'axios';

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults(){
    const key = '5d3a12ed35d871e20d0b1888d58d552e';
    try {
      const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
      this.result = res.data.recipes;
      // console.log(this.result);
    } catch (error) {
      alert(error);
    }    
  }
}