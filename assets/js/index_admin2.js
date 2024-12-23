import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Populate the MODAL for EDIT

// Populate the Edit Modal
document.body.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-bs-target='#editModal']");
  if (editButton) {
    const card = editButton.closest(".col-md-4");
    if (card && card.id) {
      const newsId = card.id.replace("news-card-", "");
      console.log("Extracted newsId:", newsId);

      try {
        const { data: newsItem, error } = await supabase
          .from("News")
          .select("*")
          .eq("id", newsId)
          .single();

        if (error) throw error;

        // Populate the fields
        document.getElementById("edit-title").value = newsItem.title || "";
        document.getElementById("edit-description").value =
          newsItem.description || "";

        document.getElementById("editForm").dataset.newsId = newsId;
      } catch (err) {
        console.error("Error fetching news details:", err);
      }
    } else {
      console.error(
        "Card or card ID not found. Ensure the structure is correct."
      );
    }
  }
});

//   SAVE EDITED DATA AND UI
document
  .getElementById("editForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const newsId = event.target.dataset.newsId;
    const title = document.getElementById("edit-title").value.trim(); // Corrected ID
    const description = document
      .getElementById("edit-description")
      .value.trim(); // Corrected ID
    const img1 = document.getElementById("edit-img1").files[0]; // Corrected ID
    const img2 = document.getElementById("edit-img2").files[0]; // Corrected ID

    try {
      // Handle file upload if new images are provided
      let img1Url = null,
        img2Url = null;

      if (img1) {
        const { data: upload1, error: uploadError1 } = await supabase.storage
          .from("your-bucket")
          .upload(`news/${newsId}-img1.jpg`, img1);

        if (uploadError1) throw uploadError1;
        img1Url = upload1.path;
      }

      if (img2) {
        const { data: upload2, error: uploadError2 } = await supabase.storage
          .from("your-bucket")
          .upload(`news/${newsId}-img2.jpg`, img2);

        if (uploadError2) throw uploadError2;
        img2Url = upload2.path;
      }

      // Update news item in the database
      const { error: updateError } = await supabase
        .from("News")
        .update({
          title,
          description,
          img_1: img1Url || undefined, // Only update if new image uploaded
          img_2: img2Url || undefined, // Only update if new image uploaded
        })
        .eq("id", newsId);

      if (updateError) throw updateError;

      // Update the card in the UI
      const card = document.getElementById(`news-card-${newsId}`);
      card.querySelector(".title").textContent = title;
      card.querySelector(".card-text .preview-text").textContent =
        description.substring(0, 235) + "...";
      card.querySelector(".card-text .more-text").textContent = description;

      if (img1Url) {
        card.querySelector("img:nth-child(1)").src = supabase.storage
          .from("your-bucket")
          .getPublicUrl(img1Url).publicURL;
      }
      if (img2Url) {
        card.querySelector("img:nth-child(2)").src = supabase.storage
          .from("your-bucket")
          .getPublicUrl(img2Url).publicURL;
      }

      // Close the modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editModal")
      );
      modal.hide();

      alert("News item updated successfully!");
    } catch (err) {
      console.error("Error updating news item:", err);
      alert("Failed to update news item. Please try again.");
    }
  });

//
//
// CREATE POST
async function uploadImageToImgbb(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(
      "https://api.imgbb.com/1/upload?key=5c3dd8759ac5941367fe81cf81da5618",
      {
        method: "POST",
        body: formData,
      }
    );
    const result = await response.json();
    if (result.success) {
      return result.data.url;
    } else {
      console.error("Failed to upload image:", result);
      return null;
    }
  } catch (error) {
    console.error("Error uploading image to IMGBB:", error);
    return null;
  }
}

async function createNewsPost() {
  const titleElement = document.getElementById("create-title");
  const descriptionElement = document.getElementById("create-description");

  if (!titleElement || !descriptionElement) {
    console.error("Form elements not found.");
    return;
  }

  const title = titleElement.value.trim();
  const description = descriptionElement.value.trim();
  const img1File = document.getElementById("create-img1").files[0];
  const img2File = document.getElementById("create-img2").files[0];

  if (!title || !description) {
    alert("Title and description are required.");
    return;
  }

  try {
    const img1Url = img1File ? await uploadImageToImgbb(img1File) : null;
    const img2Url = img2File ? await uploadImageToImgbb(img2File) : null;

    if ((img1File && !img1Url) || (img2File && !img2Url)) {
      alert("Failed to upload one or both images.");
      return;
    }

    const { data, error } = await supabase
      .from("News")
      .insert([
        {
          title: title,
          description: description,
          img_1: img1Url,
          img_2: img2Url,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating news post:", error);
      alert("Failed to create the news post.");
      return;
    }

    if (data && data.length > 0) {
      const newPost = data[0];
      addNewsCardToDOM(newPost);
    }

    document.getElementById("createNewsForm").reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("CreateModal")
    );
    modal.hide();
  } catch (error) {
    console.error("Unexpected error creating news post:", error);
  }
}

function addNewsCardToDOM(newsItem) {
  const newsContainer = document.getElementById("news-container");
  const fallbackImage = "/assets/images/default-placeholder.png";

  const newsCard = `
    <div class="col-md-4 p-3" id="news-card-${newsItem.id}">
      <div class="card">
        <div class="container mt-2 position-relative">
          <div class="profile-container">
            <div class="profilepic">
              <img src="/assets/images/Profile/Profile Pic.png" alt="Profile Picture" width="50px" />
            </div>
            <div class="profile-info text-start">
              <p class="user_name mt-1">College of Computing and Information Sciences - Caraga State University</p>
              <small class="date">${new Date(
                newsItem.created_at
              ).toLocaleDateString()}</small>
            </div>
          </div>

          <div class="options-icon">
            <div class="dropdown">
              <button class="btn btn-link p-0 text-dark" id="optionsMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-ellipsis-h"></i>
               
              </button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="optionsMenuButton">
                <li><div class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editModal">Edit</div></li>
                <li><a class="dropdown-item text-danger" href="javascript:void(0);" id="deleteNews" data-news-id="${
                  newsItem.id
                }">Delete</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="container">
          <div class="row pt-2 pb-">
            <small class="text-secondary title p-2">${newsItem.title}</small>
          </div>
          <div class="row g-0">
            ${
              newsItem.img_1 && !newsItem.img_2
                ? `<div class="col-12 p-1 text-center">
                     <img src="${
                       newsItem.img_1 || fallbackImage
                     }" class="img-fluid w-100 h-100" alt="${newsItem.title}" />
                   </div>`
                : newsItem.img_1 && newsItem.img_2
                ? `<div class="col-8 p-1">
                     <img src="${
                       newsItem.img_1 || fallbackImage
                     }" class="img-fluid w-100 h-100" alt="${newsItem.title}" />
                   </div>
                   <div class="col-4 p-1">
                     <img src="${
                       newsItem.img_2 || fallbackImage
                     }" class="img-fluid w-100 h-100" alt="${newsItem.title}" />
                   </div>`
                : `<div class="col-12 p-1 text-center">
                     <img src="${fallbackImage}" class="img-fluid w-100 h-100" alt="Default Placeholder" />
                   </div>`
            }
          </div>
        </div>

        <div class="card-body text-secondary">
          <p class="card-text">
            <span class="preview-text">${newsItem.description.substring(
              0,
              235
            )}...</span>
            <span class="more-text" style="display: none">${
              newsItem.description
            }</span>
            <button class="toggle-btn btn btn-link p-0">...See More</button>
          </p>
        </div>

        <div class="text-center my-3">
          <div class="toggle-interaction-div" style="cursor: pointer; background-color: #fd7e14; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            Show Interactions
          </div>
        </div>
        
        <div class="reaction-area row d-none">
          <div class="col-4 interaction">
            <div class="reaction-container text-center position-relative">
              <h6>0</h6>
              <span class="selected-reaction">Reactions</span>
            </div>
          </div>
          <div class="col-4 text-secondary interaction">
            <div class="interaction-item comment-toggle">
              <h6>0</h6>
              <span>Comments</span>
            </div>
          </div>
          <div class="col-4 text-secondary interaction">
            <div class="interaction-item favorite-toggle">
              <h6>0</h6>
              <span>Favorites</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (newsContainer) {
    newsContainer.insertAdjacentHTML("afterbegin", newsCard);

    // Add event listeners for dynamic interactions
    document
      .querySelector(`#news-card-${newsItem.id} #deleteNews`)
      .addEventListener("click", () => {
        deleteNews(newsItem.id);
      });

    document
      .querySelector(`#news-card-${newsItem.id} .toggle-btn`)
      .addEventListener("click", (e) => {
        const card = e.target.closest(".card");
        card.querySelector(".more-text").style.display = "block";
        e.target.style.display = "none";
      });
  }
   // Add event listener to the delete link
   const deleteLink = document.querySelector(`#deleteNews[data-news-id="${newsItem.id}"]`);
   if (deleteLink) {
     deleteLink.addEventListener("click", (event) => {
       event.preventDefault();
       const newsId = event.target.getAttribute("data-news-id");
       deleteNews(newsId);  // Call delete function
     });
   }
}

document
  .getElementById("createNewsForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    createNewsPost();
  });



  // DELETE FUNCTION

  async function deleteNews(newsId) {
    try {
      // Delete the news post from the 'News' table
      const { error } = await supabase.from("News").delete().eq("id", newsId);
  
      if (error) {
        console.error("Error deleting news:", error);
      } else {
        console.log("News deleted successfully!");
  
        // Remove the news card element from the DOM
        const newsCardElement = document.querySelector(`#news-card-${newsId}`);
        if (newsCardElement) {
          newsCardElement.remove();
        }
      }
    } catch (err) {
      console.error("Unexpected error in deleteNews:", err);
    }
  }


  // Function to load the specific announcement details into the modal
async function showAnnouncementModal(announcementId) {
  // Fetch the announcement details from the database
  const { data, error } = await supabase
    .from('Calendar')
    .select('id, New(title, description), Pinned(title, description), Old(title, description), date')
    .eq('id', announcementId)
    .single(); // Assuming you only need one result

  if (error) {
    console.error('Error fetching announcement details:', error);
    return;
  }

  // Determine the correct title and description
  const title = data.New?.title || data.Pinned?.title || data.Old?.title || 'Unknown Announcement';
  const description = data.New?.description || data.Pinned?.description || data.Old?.description || 'No description available.';
  const date = data.date || 'Unknown Date';

  // Populate the modal with the announcement details
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-description').textContent = description;
  document.getElementById('modal-date').textContent = `Date: ${date}`;

  // Show the modal
  const modal = document.getElementById('announcement-modal');
  modal.classList.remove('hidden');
}

// Function to hide the modal
function closeModal() {
  const modal = document.getElementById('announcement-modal');
  modal.classList.add('hidden');
}

// Function to initialize click events for announcement cards
function initializeAnnouncementCards() {
  const announcementCards = document.querySelectorAll('.announcement-card');

  announcementCards.forEach(card => {
    card.addEventListener('click', () => {
      const announcementId = card.dataset.id; // Get the ID from the card's data-id attribute
      showAnnouncementModal(announcementId); // Show the modal with the clicked announcement details
    });
  });

  // Add event listener to close button
  const closeButton = document.getElementById('close-modal-btn');
  closeButton.addEventListener('click', closeModal);
}

// Initialize the click events when the page is ready
document.addEventListener('DOMContentLoaded', initializeAnnouncementCards);
