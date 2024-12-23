import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to load the user profile from localStorage
function loadUserProfile() {
  const fullName = localStorage.getItem('loggedInFullName');
  const profileImg = localStorage.getItem('loggedInProfileImg');
  const userId = localStorage.getItem('loggedInUserId');

  if (fullName && profileImg) {
    document.getElementById('fullname').textContent = fullName;
    document.getElementById('profile-img').src = profileImg;
  }
  return userId;  // Return user ID to be used for loading data
}

// Function to load saved announcements
async function loadAnnouncements(userId) {
  const { data: Calendar, error } = await supabase
    .from('Calendar')
    .select('id, created_at, date, time, New(title, description), Pinned(title, description), Old(title, description)')
    .eq('user_id', userId); // Filter announcements by user ID

  if (error) {
    console.error('Error fetching announcements:', error);
    return;
  }

  const savedAnnouncementsContainer = document.querySelector('#saved-announcements');
  const savedCountElement = document.querySelector('#announcement-tab .count');

  savedAnnouncementsContainer.innerHTML = ''; // Clear existing cards

  Calendar.forEach(entry => {
    const title = entry.New?.title || entry.Pinned?.title || entry.Old?.title || 'Unknown Announcement';
    const description =
      entry.New?.description || entry.Pinned?.description || entry.Old?.description || 'No description provided';
    const savedDateTime = `${entry.date} ${entry.time}`;

    const card = document.createElement('div');
    card.classList.add('announcement-card');
    card.dataset.id = entry.id;
    card.dataset.title = title; // Store title in dataset
    card.dataset.description = description; // Store description in dataset
    card.dataset.date = savedDateTime; // Store date in dataset

    card.innerHTML = `
      <div>
        <div class="announcement-title">${title}</div>
        <div class="announcement-time">Saved: ${savedDateTime}</div>
      </div>
      <i class="fa fa-trash delete-button" data-id="${entry.id}"></i>
    `;

    // Add click event listener to open modal
    card.addEventListener('click', (e) => {
      // Make sure the delete button click doesn't trigger the card's modal
      if (e.target.classList.contains('delete-button')) {
        return; // Stop propagation if the delete button is clicked
      }
      showAnnouncementModal(title, description, savedDateTime);
    });
     // Add event listener for delete button
     const deleteButton = card.querySelector('.delete-button');
     deleteButton.addEventListener('click', async (e) => {
       e.stopPropagation(); // Prevent triggering the modal
       const announcementId = e.target.dataset.id;
       await deleteAnnouncement(announcementId); // Call your delete function
       card.remove(); // Remove card from the DOM
     });

    savedAnnouncementsContainer.appendChild(card);
  });

  savedCountElement.textContent = Calendar.length;
}

// Function to load saved favorites with News titles
// Function to load and handle favorites (including displaying modal with correct information)
async function loadFavorites(userId) {
  const { data: Favorites, error: favoritesError } = await supabase
      .from('Favorites')
      .select('id, created_at, News_id')
      .eq('user_id', userId);  // Filter favorites by user ID

  if (favoritesError) {
      console.error('Error fetching favorites:', favoritesError);
      return;
  }

  const savedFavoritesContainer = document.querySelector('#saved-favorites');
  const savedCountElement = document.querySelector('#favorites-tab .count');

  savedFavoritesContainer.innerHTML = '';  // Clear existing cards

  // Fetch the titles and images from the News table based on the News_id in the Favorites table
  for (const favorite of Favorites) {
      if (favorite.News_id != null) {
          const { data: newsData, error: newsError } = await supabase
              .from('News')
              .select('title, description, created_at, img_1, img_2')
              .eq('id', favorite.News_id)  // Get the title for the News_id in the favorite
              .single();  // Since we expect only one result

          if (newsError) {
              console.error('Error fetching news data:', newsError);
              continue;
          }

          const savedDateTime = favorite.created_at || 'Unknown Date';

          const card = document.createElement('div');
          card.classList.add('favorite-card');
          card.dataset.id = favorite.id;
          card.innerHTML = `
              <div>
                  <div class="favorite-title">${newsData.title}</div>
                  <div class="favorite-time">Saved: ${savedDateTime}</div>
              </div>
              <i class="fa fa-trash delete-button" data-id="${favorite.id}"></i>
          `;

         // Add the click event to show modal
      card.addEventListener('click', (event) => {
        // Prevent opening modal when delete button is clicked
        if (event.target.classList.contains('delete-button')) {
          return;
        }
        showNewsModal(newsData);  // Show the modal for the favorite news
      });

      // Handle the delete button
      const deleteButton = card.querySelector('.delete-button');
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();  // Prevent triggering card's click event
        deleteFavorite(favorite.id);  // Call delete function
      });


          savedFavoritesContainer.appendChild(card);
      } else {
          console.warn('Favorite with null News_id:', favorite);
      }
  }

  savedCountElement.textContent = Favorites.length;
}

// Function to handle delete actions
// Function to handle delete actions
async function handleDelete(id, type) {
    const userId = loadUserProfile(); // Retrieve userId from localStorage
  
    if (type === 'announcement') {
      // Delete the announcement from the Calendar table
      const { error: deleteAnnouncementError } = await supabase
        .from('Calendar')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
  
      if (deleteAnnouncementError) {
        console.error('Error deleting announcement:', deleteAnnouncementError);
        alert('Failed to delete announcement.');
        return;
      }
      console.log('Announcement deleted successfully.');
    }
  
    if (type === 'favorite') {
      // Delete the favorite from the Favorites table
      const { error: deleteFavoriteError } = await supabase
        .from('Favorites')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
  
      if (deleteFavoriteError) {
        console.error('Error deleting favorite:', deleteFavoriteError);
        alert('Failed to delete favorite.');
        return;
      }
      console.log('Favorite deleted successfully.');
    }
  
    // After deletion, reload the announcements and favorites
    await loadAnnouncements(userId); // Reload announcements
    await loadFavorites(userId);     // Reload favorites
  
    // Reinitialize delete buttons after reloading data
    initializeDeleteButtons();
  }
  

// Function to initialize delete confirmation modal
function showDeleteModal(id, type) {
    console.log("Modal trigger: ", id, type);  // Add this log
    const modal = new bootstrap.Modal(document.getElementById('delete-confirmation-modal'));
    const confirmButton = document.getElementById('confirm-delete-button');
    const cancelButton = document.getElementById('cancel-delete-button');
  
    // Show the modal
    modal.show();
  
    // When confirm button is clicked, delete the item
    confirmButton.onclick = async () => {
      await handleDelete(id, type);
      modal.hide();  // Close modal after confirming delete
    };
  
    // Close modal if the cancel button is clicked
    cancelButton.onclick = () => {
      modal.hide();  // Close modal without deleting
    };
  }

// Function to initialize the delete buttons
function initializeDeleteButtons() {
    // Add event listeners to delete buttons for both announcements and favorites
    const deleteButtons = document.querySelectorAll('.delete-button');
    
    console.log('Initializing delete buttons, found:', deleteButtons.length); // Debugging log
  
    deleteButtons.forEach(button => {
      const id = button.dataset.id;
      const type = button.closest('.announcement-card') ? 'announcement' : 'favorite';
      
      button.addEventListener('click', () => {
        console.log('Delete button clicked for ID:', id, 'Type:', type); // Debugging log
        showDeleteModal(id, type);
      });
    });
  }

// Load the user profile and saved data on page load
document.addEventListener('DOMContentLoaded', async () => {
    const userId = loadUserProfile();  // Load user profile from localStorage
    await loadAnnouncements(userId);  // Load saved announcements
    await loadFavorites(userId);  // Load saved favorites

    // Initialize delete buttons after data is loaded
    initializeDeleteButtons();
});


// Modal handling functions
function showAnnouncementModal(title, description, date) {
  const modalOverlay = document.getElementById('announcement-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalDate = document.getElementById('modal-date');

  // Set modal content
  modalTitle.textContent = title || 'No Title';
  modalDescription.textContent = description || 'No Description';
  modalDate.textContent = `Saved on: ${date || 'Unknown Date'}`;

  // Show modal
  modalOverlay.classList.remove('hidden');
}

function closeAnnouncementModal() {
  const modalOverlay = document.getElementById('announcement-modal');
  modalOverlay.classList.add('hidden');
}

// Attach the close event to the modal close button
document.getElementById('close-modal-btn').addEventListener('click', closeAnnouncementModal);



// FAVORTIES SECTION
// Function to show News modal with content
function showNewsModal(newsData) {
  const modal = document.getElementById('news-modal');
  const modalTitle = document.getElementById('news-modal-title');
  const modalDescription = document.getElementById('news-modal-description');
  // const modalAuthor = document.getElementById('news-modal-author');
  // const modalDate = document.getElementById('news-modal-date');
  const modalImages = document.querySelector('#news-modal .modal-image-section');
        modalImages.innerHTML = ''; // Clear any existing images
  
  modalTitle.textContent = newsData.title;
  modalDescription.textContent = newsData.description || 'No description available';
  // modalAuthor.textContent = newsData.author || 'Unknown Author';
  // modalDate.textContent = newsData.published_at || 'Unknown Date';
  
  // Clear existing images
  modalImages.innerHTML = '';

  // Check if images exist and display them accordingly
if (newsData.img_1 || newsData.img_2) {
  if (newsData.img_1) {
      const img1 = document.createElement('img');
      img1.src = newsData.img_1 || '/assets/images/default-placeholder.png'; // Fallback if img_1 is invalid
      img1.alt = 'News Image 1';
      img1.classList.add('modal-image');
      modalImages.appendChild(img1);
  }

  if (newsData.img_2) {
      const img2 = document.createElement('img');
      img2.src = newsData.img_2 || '/assets/images/default-placeholder.png'; // Fallback if img_2 is invalid
      img2.alt = 'News Image 2';
      img2.classList.add('modal-image');
      modalImages.appendChild(img2);
  }
} else {
  // If no images are available, show a single placeholder image
  const img = document.createElement('img');
  img.src = '/assets/images/default-placeholder.png';
  img.alt = 'No image available';
  img.classList.add('modal-image');
  modalImages.appendChild(img);
}

  // Show modal
  modal.classList.remove('hidden');
}

// Function to close the News modal
document.getElementById('close-news-modal-btn').addEventListener('click', () => {
  document.getElementById('news-modal').classList.add('hidden');
});