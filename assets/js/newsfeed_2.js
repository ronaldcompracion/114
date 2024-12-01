import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let newsData = [];
async function fetchNews() {
  try { 
    const { data, error } = await supabase.from("News").select("*");
    console.log("Fetched news data:", data);

    if (error) {
      console.error("Error fetching news:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.error("No news data found.");
      return;
    }

    // Assign the fetched data to newsData and sort it
    newsData = data.sort((a, b) => b.id - a.id);
   

    const newsContainer = document.getElementById("news-container");

    if (!newsContainer) {
      console.error("News container not found.");
      return;
    }

    newsContainer.innerHTML = "";

    // Default fallback image
    const fallbackImage = "/assets/images/default-placeholder.png";

    // Loop through the sorted data to create and append cards
    for (const newsItem of newsData) {
      console.log("Processing news item:", newsItem);

      // Fetch reactions, comments, and favorites counts
      const { data: reactionsData } = await supabase
        .from("Reactions")
        .select("*")
        .eq("News_id", newsItem.id);
      const { data: commentsData } = await supabase
        .from("Comments")
        .select("*, users(f_name, l_name, profile_img)") // Join with 'users' table to get name and profile image
        .eq("News_id", newsItem.id);
      const { data: favoritesData } = await supabase
        .from("Favorites")
        .select("*")
        .eq("News_id", newsItem.id);

      const reactionCount = reactionsData ? reactionsData.length : 0;
      const commentCount = commentsData ? commentsData.length : 0;
      const favoriteCount = favoritesData ? favoritesData.length : 0;

      // Map comments to include user data
      const commentsWithUserData = (commentsData || []).map((comment) => ({
        ...comment,
        profile_img:
          comment.users?.profile_img ||
          "/assets/images/Profile/Profile Pic.png", // Default profile picture if not available
        f_name: comment.users?.f_name || "Unknown", // Use placeholder if no first name
        l_name: comment.users?.l_name || "User", // Use placeholder if no last name
      }));

      // News card structure
      const newsCard = `
        <div class="col-md-4 p-3" id="news-card-${newsItem.id}">
          <div class="card">
            <div class="container mt-2 position-relative">
              <!-- Profile Container and Content -->
              <div class="profile-container">
                <div class="profilepic">
                  <img src="/assets/images/Profile/Profile Pic.png" alt="Profile Picture" width="50px" />
                </div>
                <div class="profile-info text-start">
                  <p class="user_name mt-1">College of Computing and Information Sciences - Caraga State University</p>
                  <small class="date"><b>Posted: </b>${new Date(
                    newsItem.created_at
                  ).toLocaleDateString()}</small>
                </div>
              </div>
            </div>

            <!-- Content (Images, Title, Description) -->
            <div class="container">
              <div class="row pt-2 pb-">
                <small class="text-secondary title p-2">${
                  newsItem.title
                }</small>
              </div>
              <div class="row g-0">
                ${
                  newsItem.img_1 && !newsItem.img_2
                    ? `<div class="col-12 p-1 text-center">
                        <img src="${
                          newsItem.img_1 || fallbackImage
                        }" class="img-fluid w-100 h-100" alt="${
                        newsItem.title
                      }" />
                      </div>`
                    : newsItem.img_1 && newsItem.img_2
                    ? `<div class="col-8 p-1">
                        <img src="${
                          newsItem.img_1 || fallbackImage
                        }" class="img-fluid w-100 h-100" alt="${
                        newsItem.title
                      }" />
                      </div>
                      <div class="col-4 p-1">
                        <img src="${
                          newsItem.img_2 || fallbackImage
                        }" class="img-fluid w-100 h-100" alt="${
                        newsItem.title
                      }" />
                      </div>`
                    : `<div class="col-12 p-1 text-center">
                        <img src="${fallbackImage}" class="img-fluid w-100 h-100" alt="Default Placeholder" />
                      </div>`
                }
              </div>
              <div class="card-body text-secondary " id="card-body">
                <p class="card-text cardtext">
                  <span class="preview-text">${newsItem.description.substring(
                    0,
                    235
                  )}...</span>
                  <span class="more-text" style="display: none">${
                    newsItem.description
                  }</span>
                  ${
                    newsItem.description.length > 235
                      ? `<button class="toggle-btn btn btn-link p-0">...See More</button>`
                      : ""
                  }
                </p>
              </div>
            </div>

            <!-- Reaction Area -->
            <div class="row">
              <div class="container text-secondary">
                <hr style="width: 89%; border-color: #ccc; border-width: 2px; margin: 0 auto;" />
              </div>

              <div class="col-4 interaction">
                <div class="reaction-container text-center position-relative">
                  <div id="reactionEmojis" class="reaction-emojis">
                    <span class="emoji" data-reaction="👍">👍</span>
                    <span class="emoji" data-reaction="👏">👏</span>
                    <span class="emoji" data-reaction="❤️">❤️</span>
                    <span class="emoji" data-reaction="😂">😂</span>
                    <span class="emoji" data-reaction="😮">😮</span>
                    <span class="emoji" data-reaction="😢">😢</span>
                  </div>
                  <button id="likeButton" class="reaction-btn btn btn-link">
                    <i class="fas fa-thumbs-up"></i>
                    <span id="selectedReaction">Reaction</span>
                  </button>
                </div>
              </div>

              <div class="col-4 text-secondary interaction">
                <div class="interaction-item comment-toggle" id="comment-toggle-${
                  newsItem.id
                }">
                  <i class="fas fa-comment"></i>
                  <span>Comments (${commentCount})</span>
                </div>
              </div>

              <div class="col-4 text-secondary interaction">
                <div class="interaction-item favorite-toggle">
                  <i class="fas fa-heart"></i>
                  <span>Add to Favorites</span>
                </div>
              </div>
            </div>

         <!-- Comment Display (Initially Hidden) -->
            <div class="container mt-2 comment-section d-none" id="comment-section-${
              newsItem.id
            }">
              <div class="comments-container mt-4">
                ${commentsWithUserData
                  .map(
                    (comment) => `
                    <div class="d-flex align-items-start m-2 pb-2 comment">
                      <img
                        src="${
                          comment.profile_img ||
                          "/assets/images/Profile/User_pic.png"
                        }"
                        alt="Profile Picture"
                        class="profile-pic"
                      />
                      <div class="ms-2">
                        <b class="user_name">${comment.f_name} ${
                      comment.l_name
                    }</b>
                        <p class="comment-text">${comment.comment_text}</p>
                      </div>
                    </div>`
                  )
                  .join("")}
              </div>

              <!-- Add Comment Form -->
              <div class="col-12 mt-4 pb-2">
                <div class="d-flex align-items-start">
                  <img
                    src="${
                      localStorage.getItem("loggedInProfileImg") ||
                      "/assets/images/Profile/User_pic.png"
                    }"
                    alt="Your Profile Picture"
                    class="profile-pic"
                  />
                  <div class="ms-2 flex-grow-1">
                    <input
                      type="text"
                      class="form-control small-input comment-input"
                      placeholder="Add a comment..."
                      id="comment-input-${newsItem.id}"
                    />
                  </div>
                  <button class="btn post-btn-custom ms-2 add-comment-btn" data-news-id="${
                    newsItem.id
                  }">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;

      // Append the news card to the container
      newsContainer.insertAdjacentHTML("beforeend", newsCard);

      // Add comment toggle button listener
      const commentToggleButton = document.getElementById(
        `comment-toggle-${newsItem.id}`
      );
      const commentSection = document.getElementById(
        `comment-section-${newsItem.id}`
      );
      commentToggleButton.addEventListener("click", () => {
        commentSection.classList.toggle("d-none");
      });

      

      // Add comment posting functionality
      const addCommentBtn = document.querySelector(
        `#comment-section-${newsItem.id} .add-comment-btn`
      );
      addCommentBtn.addEventListener("click", async (e) => {
        const newsId = e.target.getAttribute("data-news-id");
        const commentInput = document.getElementById(`comment-input-${newsId}`);
        const commentText = commentInput.value.trim();

        if (!commentText) return; // Prevent submitting empty comments

        const loggedInFullName = localStorage.getItem("loggedInFullName");
        const loggedInProfileImg = localStorage.getItem("loggedInProfileImg");

        if (!loggedInFullName || !loggedInProfileImg) {
          alert("User not logged in or missing profile info.");
          return;
        }

        const userId = localStorage.getItem("loggedInUserId");
        if (!userId) {
          alert("User not logged in!");
          return;
        }

        try {
          const { data: newComment, error } = await supabase
            .from("Comments")
            .insert({
              comment_text: commentText,
              News_id: newsId,
              user_id: userId,
            });

          if (error) throw new Error("Failed to save comment.");

          // Dynamically update UI with the new comment
          const commentsContainer = document.querySelector(
            `#comment-section-${newsId} .comments-container`
          );
          commentsContainer.insertAdjacentHTML(
            "beforeend",
            `
              <div class="d-flex align-items-start m-2 pb-2 comment">
                <img 
                  src="${loggedInProfileImg}"
                  alt="Your Profile Picture"
                  class="profile-pic"
                />
                <div class="ms-2">
                  <b class="user_name">${loggedInFullName}</b>
                  <p class="comment-text">${commentText}</p>
                </div>
              </div>
            `
          );

          // Clear the comment input after posting
          commentInput.value = "";
        } catch (err) {
          console.error("Error posting comment:", err.message);
        }
      });
      setupFavoriteToggle(newsItem);
      fetchFavoritesAndUpdateUI();
    }
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

// Initial fetch call
fetchNews();

// ADD TO FAVORITES
async function setupFavoriteToggle(newsItem) {
  const favoriteToggle = document.querySelector(
    `#news-card-${newsItem.id} .favorite-toggle`
  );

  favoriteToggle.addEventListener("click", async () => {
    const loggedInUserId = localStorage.getItem("loggedInUserId");

    if (!loggedInUserId) {
      alert("You need to log in to add favorites.");
      return;
    }

    try {
      // Check if the news is already in the Favorites table
      const { data: existingFavorite, error: fetchError } = await supabase
        .from("Favorites")
        .select("*")
        .eq("News_id", newsItem.id)
        .eq("user_id", loggedInUserId)
        .limit(1);

      if (fetchError) {
        console.error("Error checking favorite status:", fetchError.message);
        return;
      }

      if (existingFavorite && existingFavorite.length > 0) {
        // If already a favorite, remove it
        const { error: deleteError } = await supabase
          .from("Favorites")
          .delete()
          .eq("News_id", newsItem.id)
          .eq("user_id", loggedInUserId);

        if (deleteError) {
          throw new Error("Failed to remove from favorites.");
        }

        alert("News item removed from your favorites!");
        favoriteToggle.querySelector("i").style.color = ""; // Reset to default color
      } else {
        // Otherwise, add it as a favorite
        const { error: insertError } = await supabase.from("Favorites").insert({
          user_id: loggedInUserId,
          News_id: newsItem.id,
        });

        if (insertError) {
          throw new Error("Failed to add to favorites.");
        }

        alert("News item added to your favorites!");
        favoriteToggle.querySelector("i").style.color = "#fd7e14"; // Apply the custom color
      }
    } catch (err) {
      console.error("Error toggling favorite:", err.message);
    }
  });
}

// FETCH FAVORITES
async function fetchFavoritesAndUpdateUI() {
  const loggedInUserId = localStorage.getItem("loggedInUserId");

  if (!loggedInUserId) {
    console.error("User not logged in.");
    return;
  }

  try {
    // Fetch all favorites for the logged-in user
    const { data: favorites, error } = await supabase
      .from("Favorites")
      .select("News_id")
      .eq("user_id", loggedInUserId);

    if (error) {
      console.error("Error fetching favorites:", error.message);
      return;
    }

    if (favorites && favorites.length > 0) {
      const favoriteNewsIds = favorites.map((fav) => fav.News_id);

      // Update the UI for each favorite news item
      favoriteNewsIds.forEach((newsId) => {
        const favoriteToggle = document.querySelector(
          `#news-card-${newsId} .favorite-toggle`
        );
        if (favoriteToggle) {
          // Apply color using inline styles
          favoriteToggle.querySelector("i").style.color = "#fd7e14";
        }
      });
    }
  } catch (err) {
    console.error("Error fetching favorites:", err.message);
  }
}

//   NEWS SEE MORE TOGGLE

document.addEventListener("click", function (event) {
  if (event.target && event.target.matches(".toggle-btn")) {
    const toggleBtn = event.target;
    const card = toggleBtn.closest(".card"); // Find the closest card element
    const moreText = card.querySelector(".more-text");
    const previewText = card.querySelector(".preview-text");

    if (moreText.style.display === "none") {
      moreText.style.display = "inline"; // Show the full text
      previewText.style.display = "inline"; // Keep the preview text displayed
      toggleBtn.textContent = "See Short"; // Change button text to "See Short"
    } else {
      moreText.style.display = "none"; // Hide the full text
      previewText.style.display = "inline"; // Show only the preview text
      toggleBtn.textContent = "See More"; // Change button text back to "See More"
    }
  }
});
// END SEE MORE TOGGLE

// REACTION
// Reactions for dynamically fetched content
document.addEventListener("click", function (event) {
  // Check if the reaction button was clicked
  if (event.target && event.target.closest(".reaction-btn")) {
    const likeButton = event.target.closest(".reaction-btn");
    const reactionContainer = likeButton.closest(".reaction-container");
    const reactionEmojis = reactionContainer.querySelector(".reaction-emojis");
    const selectedReactionIcon = likeButton.querySelector("i");

    // Track the current reaction state using a data attribute
    if (!likeButton.dataset.reactionState) {
      likeButton.dataset.reactionState = "none"; // Initialize state
    }

    const currentState = likeButton.dataset.reactionState;

    if (currentState === "none") {
      // First click: Show the reactions menu
      reactionEmojis.style.display = "flex";
      likeButton.dataset.reactionState = "menu-open";

      // Handle emoji selection
      reactionEmojis.addEventListener("click", function emojiClickHandler(e) {
        if (e.target && e.target.matches(".emoji")) {
          const selectedEmoji = e.target.textContent;

          // Map emoji to icon class
          const emojiToIconClassMap = {
            "👍": "fas fa-thumbs-up",
            "❤️": "fas fa-heart",
            "😂": "fas fa-laugh",
            "😮": "fas fa-surprise",
            "😢": "fas fa-sad-tear",
            "👏": "fas fa-hand-peace",
          };

          if (emojiToIconClassMap[selectedEmoji]) {
            // Update the reaction button icon
            selectedReactionIcon.className = emojiToIconClassMap[selectedEmoji];
            selectedReactionIcon.style.color = "#EA8934"; // Highlight the icon
            likeButton.dataset.reactionState = "reaction-selected";
          }

          // Hide the emojis menu after selection
          reactionEmojis.style.display = "none";

          // Remove the event listener to prevent duplicate handlers
          reactionEmojis.removeEventListener("click", emojiClickHandler);
        }
      });
    } else if (currentState === "reaction-selected") {
      // Second click: Reset the reaction
      selectedReactionIcon.className = "fas fa-thumbs-up"; // Default icon
      selectedReactionIcon.style.color = ""; // Reset color
      likeButton.dataset.reactionState = "none"; // Reset state
    } else if (currentState === "menu-open") {
      // Clicking again while the menu is open hides the menu
      reactionEmojis.style.display = "none";
      likeButton.dataset.reactionState = "none";
    }
  }
});
// END REACTION

// SEARCH FUNCTION

// Search function to filter news items
function searchNews(query) {
  // Remove empty spaces and make it lowercase for case-insensitive search
  const searchQuery = query.toLowerCase().trim();

  // Filter newsData based on the search query (searching in title and description)
  const results = newsData.filter(
    (newsItem) =>
      newsItem.title.toLowerCase().includes(searchQuery) ||
      newsItem.description.toLowerCase().includes(searchQuery)
  );

  // Show matching results in dropdown
  displaySearchSuggestions(results);
}

// Function to display search suggestions in the dropdown
function displaySearchSuggestions(results) {
  const suggestionsContainer = document.getElementById("search-suggestions");
  suggestionsContainer.innerHTML = ""; // Clear previous suggestions

  if (results.length === 0) {
    suggestionsContainer.style.display = "none"; // Hide dropdown if no results
    return;
  }

  // Display each result in the dropdown
  results.forEach((newsItem) => {
    const suggestionItem = document.createElement("li");
    suggestionItem.classList.add("list-group-item");
    suggestionItem.textContent = newsItem.title;

    // When a suggestion is clicked, fetch and display the full news content in a modal
    suggestionItem.addEventListener("click", async () => {
      // Fetch the detailed content of the selected news item
      const { data: newsData, error } = await supabase
        .from("News")
        .select("*")
        .eq("id", newsItem.id)
        .single(); // Fetch a single item

      if (error) {
        console.error("Error fetching news data:", error);
        return;
      }

      // Populate modal with news details
      const modalContent = document.getElementById("modal-content");
      modalContent.innerHTML = `
      <h3>${newsItem.title}</h3>
      <div class="row g-0 my-3">
        ${
          newsItem.img_1 && !newsItem.img_2
            ? `<div class="col-12 p-1 text-center">
                <img src="${
                  newsItem.img_1 || "/assets/images/default-placeholder.png"
                }" class="img-fluid w-100 h-100" alt="News Image 1" />
              </div>`
            : newsItem.img_1 && newsItem.img_2
            ? `<div class="col-8 p-1">
                <img src="${
                  newsItem.img_1 || "/assets/images/default-placeholder.png"
                }" class="img-fluid w-100 h-100" alt="News Image 1" />
              </div>
              <div class="col-4 p-1">
                <img src="${
                  newsItem.img_2 || "/assets/images/default-placeholder.png"
                }" class="img-fluid w-100 h-100" alt="News Image 2" />
              </div>`
            : `<div class="col-12 p-1 text-center">
                <img src="/assets/images/default-placeholder.png" class="img-fluid w-100 h-100" alt="Default Placeholder" />
              </div>`
        }
      </div>
      <p>${newsItem.description}</p>

     
    `;
    

      // Show the modal
      const modal = new bootstrap.Modal(document.getElementById("newsModal"));
      modal.show();

      // Hide the suggestions dropdown after selection
      suggestionsContainer.style.display = "none";
    });

    suggestionsContainer.appendChild(suggestionItem);
  });

  // Show the suggestions dropdown
  suggestionsContainer.style.display = "block";
}

// Add event listener for search input
document.getElementById("search-input").addEventListener("input", function () {
  const query = this.value;
  searchNews(query); // Call the search function each time the user types
});

// Optionally, clear the suggestions when the input is focused out
document.getElementById("search-input").addEventListener("blur", () => {
  setTimeout(() => {
    // Timeout ensures the suggestion can be clicked
    document.getElementById("search-suggestions").style.display = "none";
  }, 200);
});
