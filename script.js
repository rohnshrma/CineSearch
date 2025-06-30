// API setup: These are like the keys and addresses we need to talk to the movie database
const apiKey = "b36db9ba640e52c05b3054e15904338c"; // This is our special code to access TMDB's movie data
const baseUrl = "https://api.themoviedb.org/3"; // The main web address for TMDB's API
const imageBaseUrl = "https://image.tmdb.org/t/p/w500"; // Where we get movie poster images, sized at 500px wide

// Grabbing HTML elements: Think of these as finding the buttons and boxes on our webpage
const movieNameInput = document.getElementById("movieName"); // The text box where users type a movie name
const genreSelect = document.getElementById("genre"); // The dropdown menu for picking a genre
const yearInput = document.getElementById("year"); // The text box for entering a release year
const searchBtn = document.getElementById("searchBtn"); // The search button users click
const loading = document.getElementById("loading"); // A loading spinner or message shown while fetching data
const resultsSection = document.getElementById("resultsSection"); // The area where movie results show up
const moviesGrid = document.getElementById("moviesGrid"); // The grid where we display movie cards
const noResults = document.getElementById("noResults"); // A message shown when no movies are found

// Setting up user interactions: These make the page respond when users do stuff
searchBtn.addEventListener("click", searchMovies); // When someone clicks the search button, run searchMovies
movieNameInput.addEventListener("keypress", (e) => {
  // When someone types in the movie name box
  if (e.key === "Enter") searchMovies(); // If they hit Enter, run searchMovies
});
yearInput.addEventListener("keypress", (e) => {
  // When someone types in the year box
  if (e.key === "Enter") searchMovies(); // If they hit Enter, run searchMovies
});

// Main search function: This is where we figure out what movies to show
async function searchMovies() {
  // 'async' means we can wait for data from the internet
  const movieName = movieNameInput.value.trim(); // Get the movie name and remove extra spaces
  const genre = genreSelect.value; // Get the genre from the dropdown
  const year = yearInput.value.trim(); // Get the year and remove extra spaces

  // Show a loading spinner
  showLoading(); // Turn on the loading indicator

  try {
    // Try to avoid crashes if something goes wrong
    let movies = []; // Empty list to hold our movie results

    if (movieName) {
      // If the user typed a movie name
      movies = await searchByName(movieName, year, genre); // Search for movies by name
    } else if (genre || year) {
      // If they picked a genre or year but no name
      movies = await discoverMovies(genre, year); // Find movies matching genre/year
    } else {
      // If they didn’t enter anything
      movies = await getPopularMovies(); // Just show popular movies
    }

    displayMovies(movies); // Show the movies on the page
  } catch (error) {
    // If something breaks
    console.error("Error searching movies:", error); // Log the problem for debugging
    showNoResults(); // Show a "no results" message
  }
}

// Search by movie name: Looks up movies based on what the user typed
async function searchByName(query, year, genre) {
  // Takes the movie name, year, and genre
  let url = `${baseUrl}/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
    query
  )}&page=1`; // Build the web address for the API search
  // encodeURIComponent makes sure special characters in the movie name don’t break the URL

  if (year) {
    // If they entered a year
    url += `&year=${year}`; // Add the year to the search URL
  }

  const response = await fetch(url); // Send the request to the API and wait for a reply
  const data = await response.json(); // Turn the API’s response into usable data

  let movies = data.results || []; // Grab the list of movies, or an empty list if none found

  if (genre && movies.length > 0) {
    // If a genre was picked and we have movies
    movies = movies.filter(
      // Narrow down the list
      (movie) => movie.genre_ids && movie.genre_ids.includes(parseInt(genre)) // Only keep movies matching the genre
    ); // parseInt turns the genre ID into a number
  }

  return movies; // Send back the filtered movie list
}

// Discover movies: Finds movies based on genre and/or year
async function discoverMovies(genre, year) {
  // Takes genre and year as inputs
  let url = `${baseUrl}/discover/movie?api_key=${apiKey}&language=en-US&page=1&sort_by=popularity.desc`; // Build the API URL for discovering movies, sorted by popularity

  if (genre) {
    // If a genre was picked
    url += `&with_genres=${genre}`; // Add genre to the URL
  }

  if (year) {
    // If a year was entered
    url += `&year=${year}`; // Add year to the URL
  }

  const response = await fetch(url); // Send the request and wait for the API’s reply
  const data = await response.json(); // Convert the response to usable data

  return data.results || []; // Return the movie list, or empty if none found
}

// Get popular movies: Grabs a list of trending movies
async function getPopularMovies() {
  // No inputs needed
  const url = `${baseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`; // URL for popular movies
  const response = await fetch(url); // Send the request and wait
  const data = await response.json(); // Convert response to data

  return data.results || []; // Return the movies, or empty if none
}

// Show movies on the page: Turns the movie list into cards on the screen
function displayMovies(movies) {
  // Takes the list of movies
  hideLoading(); // Turn off the loading spinner

  if (!movies || movies.length === 0) {
    // If there are no movies
    showNoResults(); // Show a "no results" message
    return; // Stop here
  }

  resultsSection.style.display = "block"; // Show the results area
  noResults.style.display = "none"; // Hide the "no results" message

  moviesGrid.innerHTML = ""; // Clear out any old movie cards

  movies.forEach((movie) => {
    // Loop through each movie
    const movieCard = createMovieCard(movie); // Make a card for this movie
    moviesGrid.appendChild(movieCard); // Add the card to the grid
  });

  resultsSection.scrollIntoView({ behavior: "smooth" }); // Smoothly scroll to the results
}

// Create a movie card: Builds a visual card for one movie
function createMovieCard(movie) {
  // Takes a single movie object
  const card = document.createElement("div"); // Make a new div for the card
  card.className = "movie-card"; // Add a class for styling the card

  const posterUrl = movie.poster_path // Check if there’s a poster image
    ? `${imageBaseUrl}${movie.poster_path}` // Use the real poster URL
    : "https://via.placeholder.com/500x750/e1e5e9/666?text=No+Image"; // Use a placeholder if no poster

  const releaseYear = movie.release_date // Check if there’s a release date
    ? new Date(movie.release_date).getFullYear() // Get just the year
    : "N/A"; // Use "N/A" if no date

  const rating = movie.vote_average // Check if there’s a rating
    ? movie.vote_average.toFixed(1) // Round to one decimal place
    : "N/A"; // Use "N/A" if no rating

  const overview = movie.overview // Check if there’s a description
    ? movie.overview // Use the description
    : "No description available."; // Use a default message if none

  card.innerHTML = ` // Set the card’s HTML content
        <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy"> // Show the poster image
        <div class="movie-info"> // A container for movie details
            <h3 class="movie-title">${movie.title}</h3> // Show the movie title
            <div class="movie-year">${releaseYear}</div> // Show the release year
            <p class="movie-overview">${overview}</p> // Show the description
            <div class="movie-rating"> // A container for the rating
                <span class="rating-star">⭐</span> // Add a star icon
                <span class="rating-score">${rating}</span> // Show the rating
            </div>
        </div>
    `;

  card.addEventListener("click", () => {
    // When someone clicks the card
    showMovieDetails(movie); // Pop up more details
  });

  return card; // Return the finished card
}

// Show movie details: Pops up an alert with more info
function showMovieDetails(movie) {
  // Takes a movie object
  const details = ` // Build a string with movie info
Title: ${movie.title}
Release Date: ${movie.release_date || "N/A"}
Rating: ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}/10
Overview: ${movie.overview || "No description available."}
    `;

  alert(details); // Show the info in a browser alert
}

// Show loading: Makes the loading spinner visible
function showLoading() {
  // No inputs needed
  loading.style.display = "block"; // Show the loading spinner
  resultsSection.style.display = "none"; // Hide the results
  noResults.style.display = "none"; // Hide the "no results" message
}

// Hide loading: Turns off the loading spinner
function hideLoading() {
  // No inputs needed
  loading.style.display = "none"; // Hide the spinner
}

// Show no results: Displays a message when no movies are found
function showNoResults() {
  // No inputs needed
  hideLoading(); // Turn off the spinner
  resultsSection.style.display = "none"; // Hide the results area
  noResults.style.display = "block"; // Show the "no results" message
}

// Load popular movies when the page opens
document.addEventListener("DOMContentLoaded", () => {
  // When the webpage is fully loaded
  searchMovies(); // Show popular movies by default
});
