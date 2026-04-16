// importData.js
const axios = require('axios');
const Recipe = require('./models/Recipe');
const Restaurant = require('./models/Restaurant');
const sequelize = require('./database');

async function importRecipes() {
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        diet: 'vegan',
        addRecipeInformation: true,
        number: 50
      }
    });
    const recipes = response.data.results;
    for (const rec of recipes) {
      await Recipe.create({
        title: rec.title,
        ingredients: JSON.stringify(rec.extendedIngredients.map(ing => ing.original)),
        instructions: rec.instructions || "Instructions not available",
        preparation_time: rec.readyInMinutes + " min"
      });
    }
    console.log('Recipes imported successfully');
  } catch (error) {
    console.error('Error importing recipes:', error.response ? error.response.data : error);
  }
}

async function importRestaurants() {
  try {
    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` },
      params: {
        term: 'vegan restaurant',
        location: 'Italia',
        categories: 'vegan,vegetarian,organic',
        limit: 50
      }
    });
    const restaurants = response.data.businesses;
    for (const rest of restaurants) {
      await Restaurant.create({
        name: rest.name,
        address: rest.location.address1 + ", " + rest.location.city,
        category: "vegan",
        price_range: rest.price ? rest.price.length : null,
        rating: rest.rating,
        review_count: rest.review_count,
        availability: null,
        services: null,
        description: null,
        lat: rest.coordinates.latitude,
        lng: rest.coordinates.longitude
      });
    }
    console.log('Restaurants imported successfully');
  } catch (error) {
    console.error('Error importing restaurants:', error.response ? error.response.data : error);
  }
}

async function runImport() {
  try {
    await sequelize.sync();
    await importRecipes();
    await importRestaurants();
    process.exit(0);
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

runImport();
