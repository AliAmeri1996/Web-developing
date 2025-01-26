var mySounds = [
  'sound1', 'sound2', 'sound3', 'sound4', 'sound5', 
  'sound6', 'sound7', 'sound8', 'sound9', 'sound10',
  'sound11', 'sound12', 'sound13', 'sound14', 'sound15',
  'sound16', 'sound17', 'sound18', 'sound19'
];

var currentAudio = null;

function randomSound(event) {
  // Prevent the default link behaviour
  if (event) {
      event.preventDefault();
  }

  // Generate a random index
  var index = Math.floor(Math.random() * mySounds.length);
  var id = mySounds[index];
  var audioElement = document.getElementById(id);

  if (audioElement) {
      // Stop the currently playing audio, if any
      if (currentAudio && !currentAudio.paused) {
          currentAudio.pause();
          currentAudio.currentTime = 0; // Reset to the beginning
      }

      // Play the new sound
      audioElement.play();

      // Update the currentAudio variable
      currentAudio = audioElement;
  } else {
      console.error("Audio element not found for ID: " + id);
  }
}











// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Attach click event listeners to all genre links
  document.querySelectorAll('.genre-link').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault(); // Prevent default link behaviour
      const genre = event.target.dataset.genre; // Get the genre from the data-genre attribute
      console.log(`Genre clicked: ${genre}`); // Debug log
      fetchMoviesByGenre(genre); // Fetch and display movies for the selected genre
    });
  });
});








// Fetch movies by genre and display them
function fetchMoviesByGenre(genre) {
  const genreMap = {
    War: 'warMovies',
    Fantasy: 'fantasyMovies',
    Crime: 'crimeMovies',
    SciFi: 'scifiMovies',
  };

  const mappedGenre = genreMap[genre];
  console.log(`Fetching movies for genre: ${genre}, mappedGenre: ${mappedGenre}`);

  fetch('/movies') // Adjust endpoint as needed
    .then(response => response.json())
    .then(data => {
      console.log('Fetched data:', data); // Log the fetched data
      if (data[mappedGenre]) {
        displayMovies(data[mappedGenre]);
      } else {
        console.error(`Genre ${mappedGenre} not found in the response.`);
        displayMovies([]);
      }
    })
    .catch(error => console.error('Error fetching movies:', error));
}




// Display movies on the home screen
function displayMovies(movies) {
  const contentContainer = document.getElementById('content'); // Replace this section
  contentContainer.innerHTML = ''; // Clear previous content

  if (!movies || movies.length === 0) {
    contentContainer.innerHTML = '<p>No movies found for this genre.</p>';
    return;
  }

  const container = document.createElement('div');
  container.id = 'movie-container';
  container.className = 'container mt-4'; // Add Bootstrap container styling
  contentContainer.appendChild(container);




  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'card mb-3';
    movieCard.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-6">
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="director"><small>Director: ${movie.director}</small></p>
            <p class="release"><small>Release Year: ${movie.releaseYear}</small></p>
            <p class="card-text">${movie.description}</p>
            <p class="average average-rating"><small>Average Rating: ${movie.averageRating || 'Not Rated'}</small></p>
          </div>
        </div>
        <div class="col-md-3 d-flex flex-column justify-content-center align-items-center p-3 bg-light">
          <label class="form-label">Rate this movie:</label>
          <div class="star-rating" data-title="${movie.title}" data-id="${movie.id}">
            ${[1, 2, 3, 4, 5].map(num => `<span class="star" data-value="${num}">&#9733;</span>`).join('')}
          </div>
        </div>
        <div class="col-md-3">
    <img src="${movie.image}" alt="${movie.title} Poster" class="img-fluid rounded-end" />
  </div>
      </div>
    `;
    container.appendChild(movieCard);
  });

  // Add star rating functionality
  setupStarRatingListeners();
}

// Add star rating functionality
function setupStarRatingListeners() {
  document.querySelectorAll('.star-rating').forEach(rating => {
    const stars = rating.querySelectorAll('.star');
    const movieId = rating.dataset.id; // Movie ID to identify the rated movie

    stars.forEach((star, index) => {
      // Add click event listener
      star.addEventListener('click', () => {
        // Ensure only stars up to the clicked star are lit
        stars.forEach((s, i) => {
          if (i <= index) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });

        // Record the selected rating
        const ratingValue = index + 1; // Rating is index + 1
        console.log(`Rating for movie ID ${movieId}: ${ratingValue}`);

        // Save the rating to the backend
        saveMovieRating(movieId, ratingValue);
      });

      // Highlight stars on hover
      star.addEventListener('mouseover', () => {
        stars.forEach((s, i) => {
          if (i <= index) {
            s.classList.add('hover');
          } else {
            s.classList.remove('hover');
          }
        });
      });

      // Remove hover effect when not hovering
      star.addEventListener('mouseout', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });
    });
  });
}



// Save movie rating to the server
function saveMovieRating(movieId, ratingValue) {
  fetch(`/movies/${movieId}/rate`, {
    method: 'POST', // HTTP POST to send the rating to the backend
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating: ratingValue }), // Send rating value as JSON
  })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        console.log(`Rating saved for movie ID ${movieId}: ${data.newAverageRating}`);

        // Locate and update the average rating element
        const movieElement = document.querySelector(`.star-rating[data-id="${movieId}"]`).closest('.card');
        const averageRatingElement = movieElement.querySelector('.average-rating small');

        if (averageRatingElement) {
          averageRatingElement.textContent = `Average Rating: ${data.newAverageRating || 'Not Rated'}`;
        } else {
          console.error('Average Rating element not found in the DOM.');
        }
      } else {
        console.error('Error:', data.error);
      }
    })
    .catch(error => console.error('Error saving movie rating:', error));
}

