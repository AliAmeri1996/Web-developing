
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3002;

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files from the "web" directory
app.use(express.static(path.join(__dirname, 'web')));

// Serve the index.html file at the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});



// Function to update movie ratings
function updateMovieRatings(movieId, rating) {
  const moviesFile = path.join(__dirname, 'web', 'movies.json');
  const data = JSON.parse(fs.readFileSync(moviesFile, 'utf-8'));

  let movieFound = false;
  let updatedMovie = null;



  // Iterate through all genres to find the movie by ID
  for (const genre of Object.keys(data)) {
    const movies = data[genre];
    for (const movie of movies) {
      if (movie.id === movieId) {
        movieFound = true;


        // Initialise the ratings array if it doesn't exist
        if (!movie.ratings) movie.ratings = [];

        // Add the new rating
        movie.ratings.push(rating);

        // Recalculate the average rating
        const total = movie.ratings.reduce((sum, current) => sum + current, 0);
        movie.averageRating = (total / movie.ratings.length).toFixed(1); // Rounded to 1 decimal

        updatedMovie = movie;
      }
    }
  }


  // Save changes back to movies.json
  if (movieFound) {
    fs.writeFileSync(moviesFile, JSON.stringify(data, null, 2), 'utf-8');
    return updatedMovie; // Return the updated movie with the new average rating
  }

  return null; // If the movie is not found
}

// POST endpoint to handle movie ratings
app.post('/movies/:id/rate', (req, res) => {
  const movieId = req.params.id; // Use the ID as the identifier
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating. Rating must be between 1 and 5.' });
  }

  const updatedMovie = updateMovieRatings(movieId, parseFloat(rating));

  if (updatedMovie) {
    res.json({
      message: `Rating submitted for "${updatedMovie.title}".`,
      newAverageRating: updatedMovie.averageRating,
    });
  } else {
    res.status(404).json({ error: 'Movie not found.' });
  }
});

// GET endpoint to fetch all movies
app.get('/movies', (req, res) => {
  const moviesFile = path.join(__dirname, 'web', 'movies.json');
  const data = JSON.parse(fs.readFileSync(moviesFile, 'utf-8'));
  res.json(data);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
