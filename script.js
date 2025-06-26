const apiKey = "b36db9ba640e52c05b3054e15904338c";
const baseUrl = "https://api.themoviedb.org/3";
const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

// DOM elements
const movieNameInput = document.getElementById("movieName");
const genreSelect = document.getElementById("genre");
const yearInput = document.getElementById("year");
const searchBtn = document.getElementById("searchBtn");
const loading = document.getElementById("loading");
const resultsSection = document.getElementById("resultsSection");
const moviesGrid = document.getElementById("moviesGrid");
const noResults = document.getElementById("noResults");

// Event listeners
searchBtn.addEventListener("click", searchMovies);
movieNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMovies();
});
yearInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMovies();
});

// Search movies function
async function searchMovies() {
  const movieName = movieNameInput.value.trim();
  const genre = genreSelect.value;
  const year = yearInput.value.trim();

  // Show loading
  showLoading();

  try {
    let movies = [];

    if (movieName) {
      // Search by movie name
      movies = await searchByName(movieName, year, genre);
    } else if (genre || year) {
      // Discover movies by genre and/or year
      movies = await discoverMovies(genre, year);
    } else {
      // Get popular movies if no search criteria
      movies = await getPopularMovies();
    }

    displayMovies(movies);
  } catch (error) {
    console.error("Error searching movies:", error);
    showNoResults();
  }
}

// Search movies by name
async function searchByName(query, year, genre) {
  let url = `${baseUrl}/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
    query
  )}&page=1`;

  if (year) {
    url += `&year=${year}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  let movies = data.results || [];

  // Filter by genre if specified
  if (genre && movies.length > 0) {
    movies = movies.filter(
      (movie) => movie.genre_ids && movie.genre_ids.includes(parseInt(genre))
    );
  }

  return movies;
}

// Discover movies by genre and/or year
async function discoverMovies(genre, year) {
  let url = `${baseUrl}/discover/movie?api_key=${apiKey}&language=en-US&page=1&sort_by=popularity.desc`;

  if (genre) {
    url += `&with_genres=${genre}`;
  }

  if (year) {
    url += `&year=${year}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  return data.results || [];
}

// Get popular movies
async function getPopularMovies() {
  const url = `${baseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
  const response = await fetch(url);
  const data = await response.json();

  return data.results || [];
}

// Display movies in the grid
function displayMovies(movies) {
  hideLoading();

  if (!movies || movies.length === 0) {
    showNoResults();
    return;
  }

  // Show results section
  resultsSection.style.display = "block";
  noResults.style.display = "none";

  // Clear previous results
  moviesGrid.innerHTML = "";

  // Create movie cards
  movies.forEach((movie) => {
    const movieCard = createMovieCard(movie);
    moviesGrid.appendChild(movieCard);
  });

  // Smooth scroll to results
  resultsSection.scrollIntoView({ behavior: "smooth" });
}

// Create a movie card element
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  const posterUrl = movie.poster_path
    ? `${imageBaseUrl}${movie.poster_path}`
    : "https://via.placeholder.com/500x750/e1e5e9/666?text=No+Image";

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  const overview = movie.overview
    ? movie.overview
    : "No description available.";

  card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-year">${releaseYear}</div>
            <p class="movie-overview">${overview}</p>
            <div class="movie-rating">
                <span class="rating-star">⭐</span>
                <span class="rating-score">${rating}</span>
            </div>
        </div>
    `;

  // Add click event to show more details (optional enhancement)
  card.addEventListener("click", () => {
    showMovieDetails(movie);
  });

  return card;
}

// Show movie details (basic implementation)
function showMovieDetails(movie) {
  const details = `
Title: ${movie.title}
Release Date: ${movie.release_date || "N/A"}
Rating: ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}/10
Overview: ${movie.overview || "No description available."}
    `;

  alert(details);
}

// Show loading state
function showLoading() {
  loading.style.display = "block";
  resultsSection.style.display = "none";
  noResults.style.display = "none";
}

// Hide loading state
function hideLoading() {
  loading.style.display = "none";
}

// Show no results message
function showNoResults() {
  hideLoading();
  resultsSection.style.display = "none";
  noResults.style.display = "block";
}

// Load popular movies on page load
document.addEventListener("DOMContentLoaded", () => {
  searchMovies();
});
