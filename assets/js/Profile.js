import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase URL and key for accessing the database
const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

// Create the Supabase client with the provided URL and key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let announcementToDelete = null;  // Store the ID of the announcement to delete

// Function to open the delete modal and set the announcement to delete
function openDeleteModal(event) {
    // Ensure the clicked element is the delete button (trash icon)
    const deleteButton = event.target.closest('.delete-button');
    if (!deleteButton) return;  // If it's not a delete button, do nothing

    const announcementId = deleteButton.getAttribute('data-id');
    announcementToDelete = announcementId;  // Store the ID of the announcement to delete
    $('#deleteModal').modal('show');  // Show the modal
}

// Function to delete the announcement
async function deleteAnnouncement() {
    try {
        if (!announcementToDelete) return;  // If no announcement selected for deletion, do nothing

        // Delete the entry from the database using the stored announcement ID
        const { error } = await supabase
            .from('Calendar')
            .delete()
            .eq('id', announcementToDelete);

        if (error) {
            console.error('Error deleting announcement:', error);
            return;
        }

        // Find the corresponding announcement card and remove it
        const card = document.querySelector(`.announcement-card[data-id="${announcementToDelete}"]`);
        if (card) {
            card.remove();
        }

        // Close the modal
        $('#deleteModal').modal('hide');

        // Update saved announcements count
        const savedCountElement = document.querySelector('.saved-announcements .count');
        const currentCount = parseInt(savedCountElement.textContent, 10);
        savedCountElement.textContent = currentCount - 1;

        // Reset announcementToDelete
        announcementToDelete = null;

        // Show the success notification
        const successNotification = document.getElementById('successNotification');
        successNotification.classList.add('show');  // Show notification

        // Hide the notification after 3 seconds
        setTimeout(() => {
            successNotification.classList.remove('show');  // Hide notification
        }, 3000);

    } catch (err) {
        console.error('Error in deleteAnnouncement:', err);
    }
}

// Attach event listeners for the delete buttons using event delegation
document.addEventListener('DOMContentLoaded', () => {
    const savedAnnouncementsContainer = document.querySelector('.dashboard');

    // Use event delegation: Listen for click events on the container
    savedAnnouncementsContainer.addEventListener('click', openDeleteModal);

    // Attach event listener for the delete confirmation button
    const deleteConfirmationButton = document.getElementById('deleteButton');
    deleteConfirmationButton.addEventListener('click', deleteAnnouncement);
});

// Function to load announcements from the Calendar table
// Function to load announcements from the Calendar table
async function loadAnnouncements() {
    // Fetch data from the Calendar table with joins for related titles
    const { data: Calendar, error } = await supabase
        .from('Calendar')
        .select(`
            id,
            created_at,
            user_id,
            date,
            time,
            New(title),  
            Pinned(title), 
            Old(title)    
        `);

    if (error) {
        console.error('Error fetching announcements:', error);
        return;
    }

    // Sort the data in descending order based on the `created_at` field
    Calendar.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const savedAnnouncementsContainer = document.querySelector('.dashboard');
    const savedCountElement = document.querySelector('.saved-announcements .count');

    // Clear existing announcement cards
    const existingCards = document.querySelectorAll('.announcement-card');
    existingCards.forEach(card => card.remove());

    // Populate announcement cards dynamically
    Calendar.forEach(entry => {
        const title =
            entry.New?.title || entry.Pinned?.title || entry.Old?.title || 'Unknown Announcement';
        const savedDateTime = `${entry.date} ${entry.time}`;
    
        const card = document.createElement('div');
        card.classList.add('announcement-card');
        card.dataset.id = entry.id;  // Store the ID in the data attribute
        card.innerHTML = `
            <div>
                <div class="announcement-title">${title}</div>
                <div class="announcement-time">Saved: ${savedDateTime}</div>
            </div>
            <i class="fa fa-trash delete-button" data-id="${entry.id}"></i>
        `;
    
        savedAnnouncementsContainer.appendChild(card);
    });

    // Update saved announcements count
    savedCountElement.textContent = Calendar.length;
}


// Load announcements on page load
document.addEventListener('DOMContentLoaded', loadAnnouncements);
