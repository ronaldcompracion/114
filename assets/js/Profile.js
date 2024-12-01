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
    .select('id, created_at, date, time, New(title), Pinned(title), Old(title)')
    .eq('user_id', userId);  // Filter announcements by user ID

  if (error) {
    console.error('Error fetching announcements:', error);
    return;
  }

  const savedAnnouncementsContainer = document.querySelector('#saved-announcements');
  const savedCountElement = document.querySelector('#announcement-tab .count');

  savedAnnouncementsContainer.innerHTML = '';  // Clear existing cards

  Calendar.forEach(entry => {
    const title = entry.New?.title || entry.Pinned?.title || entry.Old?.title || 'Unknown Announcement';
    const savedDateTime = `${entry.date} ${entry.time}`;

    const card = document.createElement('div');
    card.classList.add('announcement-card');
    card.dataset.id = entry.id;
    card.innerHTML = `
      <div>
        <div class="announcement-title">${title}</div>
        <div class="announcement-time">Saved: ${savedDateTime}</div>
      </div>
      <i class="fa fa-trash delete-button" data-id="${entry.id}"></i>
    `;

    savedAnnouncementsContainer.appendChild(card);
  });

  savedCountElement.textContent = Calendar.length;
}

// Function to load saved favorites with News titles
async function loadFavorites(userId) {
    // Fetch the saved Favorites based on the user ID
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
  
    // Fetch the titles from the News table based on the News_id in the Favorites table
    for (const favorite of Favorites) {
      // Check if News_id is not null or undefined before making the query
      if (favorite.News_id != null) {
        const { data: newsData, error: newsError } = await supabase
          .from('News')
          .select('title')
          .eq('id', favorite.News_id)  // Get the title for the News_id in the favorite
          .single();  // Since we expect only one result
  
        if (newsError) {
          console.error('Error fetching news title:', newsError);
          continue;  // Skip this favorite if there is an error
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
