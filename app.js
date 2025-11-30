const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

let favorites = [];

// search recipes by name
app.get('/search', async (req, res) => {
  const query = req.query.q || '';
  try {
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    );
    const meals = response.data.meals || [];
    res.json(meals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// get full recipe by id
app.get('/recipe/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`
    );
    const meal = response.data.meals ? response.data.meals[0] : null;
    if (!meal) return res.status(404).json({ error: 'Recipe not found' });
    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
});

// add to favorites
app.post('/favorites', (req, res) => {
  const recipe = req.body;
  if (!recipe || !recipe.idMeal) {
    return res.status(400).json({ error: 'Invalid recipe data' });
  }
  const exists = favorites.find(f => f.idMeal === recipe.idMeal);
  if (!exists) favorites.push(recipe);
  res.json(favorites);
});

// list favorites
app.get('/favorites', (req, res) => {
  res.json(favorites);
});

// remove from favorites
app.delete('/favorites/:id', (req, res) => {
  const id = req.params.id;
  favorites = favorites.filter(f => f.idMeal !== id);
  res.json(favorites);
});

// root → index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Recipe Explorer backend listening on port ${port}`);
});
