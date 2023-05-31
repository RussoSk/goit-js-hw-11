
import './css/styles.css';
import { fetchImages, PER_PAGE } from './fetchImages';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.gallery a');

let currentPage = 1;
let currentSearchQuery = '';

form.addEventListener('submit', SearchImage);

async function SearchImage(event) {
  event.preventDefault();

  const searchQuery = form.elements.searchQuery.value;
  currentSearchQuery = searchQuery;
  currentPage = 1;

  try {
    const response = await fetchImages(searchQuery, currentPage);
    const data = response.data;
    const images = data.hits;

    if (images.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      gallery.innerHTML = '';
      loadMoreBtn.style.display = 'none';
      return;
    }

    gallery.innerHTML = '';

    images.forEach((image) => {
      const cardHTML = createPhotoCardHTML(image);
      gallery.insertAdjacentHTML('beforeend', cardHTML);
    });

    if (images.length < data.totalHits) {
      loadMoreBtn.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'none';
    }

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

    lightbox.refresh(); // Оновлення галереї

  } catch (error) {
    console.error(error);
  }
};

loadMoreBtn.addEventListener('click', async function () {
  try {
    currentPage += 1;

    const response = await fetchImages(currentSearchQuery, currentPage);
    const data = response.data;
    const images = data.hits;
    
    images.forEach((image) => {
      const cardHTML = createPhotoCardHTML(image);
      gallery.insertAdjacentHTML('beforeend', cardHTML);
    });

    if (currentPage * PER_PAGE >= data.totalHits) {
      loadMoreBtn.style.display = 'none';
    }

    lightbox.refresh(); // Оновлення галереї

  } catch (error) {
    console.error(error);
  }
});

function createPhotoCardHTML(image) {
  const cardHTML = `
    <div class="photo-card">
      <a href="${image.largeImageURL}">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </div>
  `;
  return cardHTML;
}
// Початково ховаємо кнопку "Load more"
loadMoreBtn.style.display = 'none';

// При першому запиті кнопка з'являється в інтерфейсі під галереєю
// form.addEventListener('submit', function () {
//   loadMoreBtn.style.display = 'block';
// });
