'use strict';

const API_KEY = 'c8b7d50b02e76a66b6e83ce5608b8d5c';
const API_URL = 'https://api.themoviedb.org/3';
const IMG_URL = '//image.tmdb.org/t/p/';
const NO_IMG = 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg';

const header = document.querySelector('header');
const sliderContainer = document.querySelector('.slider-container');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const searchInput = document.getElementById('search');
const searchForm = document.getElementById('searchForm');

let rootElement = document.documentElement,
  //select btn
    btn = document.querySelectorAll('.button'),
    btnScrollToTop = document.querySelector('.btn--back-to-top'),
    upcomingBtn = document.querySelector('.btn--upcoming'),
    popularBtn = document.querySelector('.btn--popular'),
    topRatingBtn = document.querySelector('.btn--top'),
    filterBtn = document.querySelector('.btn--filter'),
    searchBtn = document.querySelector('.btn--search'),
    iconBtn = document.querySelector('.btn--icon'),
    closeIcon = document.querySelector('.close__icon'),
  //select section and div
    modalContainer = document.querySelector('.modal__container'),
    resultContainer = document.querySelector('.filter__movie-list'),
    filterSection = document.querySelector('.filter'),
    movieSection = document.querySelector('.filter-movie'),
    selectGenreEl = document.getElementById('genre'),
    selectYearEl = document.getElementById('year'),
    activeSlide = 0;
//create btn load more
let title = document.querySelector('.filter__title'),
    btnEl = document.createElement('button');
    btnEl.classList.add('btn', 'btn--load-more');
    btnEl.setAttribute('type', 'button');
    btnEl.innerText = 'Load more';
//pagination
let current = document.getElementById('current'),
    prev = document.getElementById('prev'),
    next = document.getElementById('next'),
    prevPage,
    nextPage,
    page,
    currentPage,
    totalPages = 0,
    lastParam = '';

//Event Listeners
btnScrollToTop.addEventListener('click', scrollToTop);
document.addEventListener('scroll', handleScroll);

window.addEventListener('click', outsideClick);
window.addEventListener('scroll', () => {
  if(rootElement.scrollTop > 20) {
    document.querySelector('.menu').classList.add('sticky');
  } else {
    document.querySelector('.menu').classList.remove('sticky');
  }
})

iconBtn.addEventListener('click', () => searchForm.classList.add('open'));
closeIcon.addEventListener('click', () => searchForm.classList.remove('open'));

searchBtn.addEventListener('click', () => {
  getSearchMovies();
});

searchInput.addEventListener('keypress', (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();

    getSearchMovies();
  }
});

upcomingBtn.addEventListener('click', function() {
  btn.forEach(e => { 
    e.classList.remove('btn--active');
  });
  this.classList.add('btn--active');
  getRatedMovie('upcoming');
});

popularBtn.addEventListener('click', function() {
  btn.forEach(e => { 
    e.classList.remove('btn--active');
  });
  this.classList.add('btn--active');
  getRatedMovie('popular');
});

topRatingBtn.addEventListener('click', function() {
  btn.forEach(e => { 
    e.classList.remove('btn--active');
  });
  this.classList.add('btn--active');
  getRatedMovie('top_rated');
});

prev.addEventListener('click', () => {
  if(prevPage > 0){
    getRatedMovie(lastParam, prevPage);
  }
});

next.addEventListener('click', () => {
  if(nextPage <= totalPages){
    console.log(lastParam);
    getRatedMovie(lastParam, nextPage);
  }
});

filterBtn.addEventListener('click', getFilteredMovie);

drawYearList();
document.getElementById('currentYear').innerHTML = new Date().getFullYear();

//ajax request to server
function fetchDataFromServer(url, callback, options) {
  fetch(url)
    .then(response => response.json())
    .then(data => callback(data, options))
    .catch(err => console.error(err));
};

//Header slider
function createBanner({results: movieList}) {

  movieList.forEach((movie) => {
    sliderContainer.prepend(drawSlide(movie));
  })

  let sliders = document.querySelectorAll('.slide'),
      sliderContent = document.querySelectorAll('.slider__content');
  
  function setBg () {
    header.style.backgroundImage = sliders[activeSlide].style.backgroundImage;
  }

  function setActiveSlide () {
    sliders.forEach((slides) => slides.classList.remove('active'));
    sliders[activeSlide].classList.add('active');
  }
  
  function setContent () {
    sliderContent.forEach((slidersContents) => {
      slidersContents.classList.remove('active')
    });
    sliderContent[activeSlide].classList.add('active');
  }
  
  rightBtn.addEventListener('click', () => {
    nextSlide();
    setBg();
    setActiveSlide();
    setContent();
  });
  
  leftBtn.addEventListener('click', () => {
    previousSlide();
    setBg();
    setActiveSlide();
    setContent();
  });
  
  function nextSlide () {
    activeSlide++;
    if (activeSlide > sliders.length - 1) {
      activeSlide = 0;
    }
  }
  
  function previousSlide () {
    activeSlide--;
    if (activeSlide < 0) {
      activeSlide = sliders.length - 1;
    }
  }

  setInterval(() => {
    nextSlide();
    setBg();
    setActiveSlide();
    setContent();
  }, 7000);
}

function drawSlide(movie) {
  let slide = document.createElement('div'),
      img = movie.backdrop_path ? (IMG_URL + 'w1280') + movie.backdrop_path : NO_IMG,
      sliderContentContainer = document.createElement('div');
  
  slide.classList.add('slide', 'active');
  slide.style.backgroundImage = `url(${img})`;
    header.style.backgroundImage = slide.style.backgroundImage;

  sliderContentContainer.classList.add('slider__content');
  sliderContentContainer.innerHTML = `<h2 class="movie__title">${movie.title}</h2>
                                      <p class="movie__desc">${movie.overview}</p>
                                      <div class="movie__details">
                                        <div class="movie__category">${genreList.asString(movie.genre_ids)}</div>
                                        <p class="movie__year">${movie.release_date.split("-").reverse().join("-")}</p>
                                      </div>`;
 
  slide.appendChild(sliderContentContainer);
  return slide;
}

//Get and draw genre, year lists
const genreList = {
  
  
  asString(genreIdList) {
    let newGenreList = [];
    
    for(let genreId of genreIdList) {
      this[genreId] && newGenreList.push(this[genreId]);
    }

    return newGenreList.join(' / ');
  }
};

fetchDataFromServer(`${API_URL}/genre/movie/list?api_key=${API_KEY}`, function( {genres} ) {
  for (const { id, name } of genres) {
    genreList[id] = name;
  }
  drawGenreList(genreList);

  fetchDataFromServer(`${API_URL}/movie/popular?api_key=${API_KEY}&page=1`, createBanner);
});

function drawGenreList (list) {
  
  for (let genreId in list) {
    if(typeof list[genreId] === 'function') {
      return;
    } 
    let optionEl = document.createElement('option');
    optionEl.setAttribute('value', `${list[genreId]}`);
    optionEl.dataset.id = `${genreId}`;
    optionEl.textContent = list[genreId];
  
    selectGenreEl.appendChild(optionEl);
  }
}

function drawYearList () {
  let currentYear = new Date().getFullYear(),
      earliestYear = 1990;

  while (currentYear >= earliestYear) {
    let dateOptionEl = document.createElement('option');
    dateOptionEl.text = currentYear;
    dateOptionEl.value = currentYear;
    selectYearEl.add(dateOptionEl);
    currentYear -= 1;
  }
}

//Search movie
function getSearchMovies(page = 1) {
  let inputValue = searchInput.value;
  console.log(inputValue);

  resultContainer.innerHTML = '';

  if (inputValue !== '') {
    document.body.classList.add('loading');

    fetchDataFromServer(`${API_URL}/search/movie?api_key=${API_KEY}&query=${inputValue}&page=${page}`, function({results: movieList, total_pages}) {
      totalPages = total_pages;

      if(movieList.length === 0) {
        filterSection.innerHTML = `<h1 class="title">No movies found</h1>`;
      } else {
      
        title.innerHTML = `<span class="filter__subtitle">Search results for<span> <span class="filter__search-movie">"${inputValue}"</span>`;

        movieList.forEach((movie) => {
          resultContainer.append(drawMovie(movie));
        })

        if(totalPages > 1) {
          filterSection.append(btnEl);
        }

        let loadMoreBtn = document.querySelector('.btn--load-more');

        loadMoreBtn.addEventListener('click', function() {
          if (page >= totalPages) {
              this.style.display = 'none';
              return;
          }

          page++;

          fetchDataFromServer(`${API_URL}/search/movie?api_key=${API_KEY}&query=${inputValue}&page=${page}`, ({results: movieList}) => {
            movieList.forEach((movie) => {
              resultContainer.appendChild(drawMovie(movie));
            });
          });
        })
        
      }
      document.body.classList.remove('loading');
      searchInput.value = '';
    });
  } else {
    alert('Please, fill the field first correctly!');
  }

}

//Popular, upcoming, top rated movies
function getRatedMovie(param, page = 1) {
  let movieContainer = document.querySelector('.filter__result'),
      paginationContainer = document.querySelector('.pagination');

  document.body.classList.add('loading');
  movieContainer.querySelectorAll('*').forEach(n => n.remove());
  paginationContainer.style.display = 'none';
  
  lastParam = param;
  currentPage = page;
  console.log(lastParam, currentPage);

  fetchDataFromServer(`${API_URL}/movie/${param}?api_key=${API_KEY}&page=${page}`, function( {results: movies, total_pages} ) {
    
    totalPages = total_pages;

    if(movies.length !== 0) {
      
      movies.forEach((movie) => {
        movieContainer.append(drawMovie(movie));
      });
      
      if(totalPages > 1) {
        console.log(page);

        paginationContainer.style.display = 'flex';
        
        nextPage = currentPage + 1;
        prevPage = currentPage - 1;
        currentPage = page;
        current.innerText = currentPage;

        if(currentPage <= 1){
          prev.classList.add('disabled');
          next.classList.remove('disabled')
        }else if(currentPage>= totalPages){
          prev.classList.remove('disabled');
          next.classList.add('disabled')
        }else{
          prev.classList.remove('disabled');
          next.classList.remove('disabled')
        }
        movieContainer.scrollIntoView({behavior : 'smooth'});
      }
    } else {
      movieContainer.innerHTML = `<h1 class="title">No movies found</h1>`;
    }
    
    document.body.classList.remove('loading');
  });
}

//Create movie card
function drawMovie(movie) {
  let img = movie.poster_path ? (IMG_URL + 'w185') + movie.poster_path : NO_IMG,
      movieCard = document.createElement('div');

  movieCard.classList.add('movie__card');
  movieCard.innerHTML = `
                        <div class="movie__banner">
                          <img class="movie__image" src="${img}" alt="${movie.title}">
                        </div>
                        <h3 class="movie__name">${movie.title}</h3>
                        <div class="movie__info">
                          <div class="movie__average">
                            <i class="fa-solid fa-star movie--icon"></i>
                            <span class="movie__rate">${movie.vote_average}</span>
                          </div>
                          <p class="movie__year">${movie.release_date.split("-").reverse().join("-")}</p>
                        </div>`;

  movieCard.addEventListener('click', () => {
    getMovieDetail(movie.id)}
  );

  return movieCard;
}

//Create request and detail card for movie
function getMovieDetail(id) {
  //modalContainer.classList.remove('out');

  fetchDataFromServer(`${API_URL}/movie/${id}?api_key=${API_KEY}`, function(movie) {
    let modalDOM = `<div class="modal__background">
                      <div class="modal__content">
                        <img class="movie__image" src="${movie.poster_path ? (IMG_URL+ 'w300') + movie.poster_path : NO_IMG}" alt="${movie.title}">
                        <h3 class="modal__title">${movie.title}</h2>
                        <p class="modal__budget"><span>Movies budget:</span> ${movie.budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}$</p>
                        <p class="modal__time"><span>Runtime:</span> ${movie.runtime} min</p>
                        <div class="modal__genre"></div>
                        <p class="modal__overview">${movie.overview}</p>
                        <button class=" btn modal__btn" type="button" onclick="closeModal()">Close</button>
                      </div>
                    </div>`;
    
    modalContainer.innerHTML = modalDOM;

    let genresContainer = document.querySelector('.modal__genre');

    for (let {name} of movie.genres) {
      let pEl = document.createElement('p');
      pEl.classList.add('movie__category');
      pEl.innerText = name;

      genresContainer.append(pEl);
    }

    modalContainer.style.display = 'block';
    modalContainer.classList.remove('out');
  });
}

//Functions for close detail movie card
function closeModal() {
  modalContainer.classList.add('out');
}

function outsideClick(e) {
  if (e.target == document.querySelector('.modal__background')) {
    modalContainer.classList.add('out');
    //modalContainer.style.display = 'none';
  }
}

//Requests for filtered movies by genre and year
function getFilteredMovie () {
  let selectedGenreValue = selectGenreEl.options[selectGenreEl.selectedIndex].getAttribute("data-id"),
      selectedGenreText = selectGenreEl.options[selectGenreEl.selectedIndex].text,
      selectedYearValue = selectYearEl.value;
  
  resultContainer.innerHTML = '';
  selectGenreEl.selectedIndex = 0;
  selectYearEl.selectedIndex = 0;

  document.body.classList.add('loading');

  fetchDataFromServer(`${API_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&with_genres=${selectedGenreValue}&year=${selectedYearValue}&page=${currentPage}`, function( {results: filteredMovies, total_pages} ) {
    totalPages = total_pages;

    if (filteredMovies.length === 0) {
      filterSection.innerHTML = `<h1 class="title">No movies found</h1>`;
    } else {

      title.textContent = `${selectedGenreText} Movies ${selectedYearValue}`;

      filteredMovies.forEach((movie) => {
        resultContainer.append(drawMovie(movie));
      });

      if(totalPages > 1) {
        filterSection.append(btnEl);
      }

      let loadMoreBtn = document.querySelector('.btn--load-more');

      loadMoreBtn.addEventListener('click', function() {
        if (currentPage >= totalPages) {
            this.style.display = 'none';
            return;
        }

        currentPage++;

        fetchDataFromServer(`${API_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&with_genres=${selectedGenreValue}&year=${selectedYearValue}&page=${currentPage}`, ({results: filteredMovies}) => {
          filteredMovies.forEach((movie) => {
            resultContainer.appendChild(drawMovie(movie));
          });
        });
      })
      
    }
    document.body.classList.remove('loading');
  });
}

//Scroll button on page
function handleScroll() {
  let scrollTotal = rootElement.scrollHeight - rootElement.clientHeight;

  if (rootElement.scrollTop / scrollTotal > 0.5) {
    // Show button
    btnScrollToTop.classList.add('show');
  } else {
    // Hide button
    btnScrollToTop.classList.remove('show');
  }
}

function scrollToTop() {
  rootElement.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}