document.addEventListener("DOMContentLoaded", function() {
    // Select all the toggle buttons and add event listeners to them
    document.querySelectorAll(".toggle-btn").forEach(function(toggleBtn) {
        toggleBtn.addEventListener("click", function() {
            const card = toggleBtn.closest(".card");  // Find the closest card element
            const moreText = card.querySelector(".more-text");
            const previewText = card.querySelector(".preview-text");

            if (moreText.style.display === "none") {
                moreText.style.display = "inline";   // Show the full text
                previewText.style.display = "inline"; // Keep the preview text displayed
                toggleBtn.textContent = "See Short"; // Change button text to "See Short"
            } else {
                moreText.style.display = "none";      // Hide the full text
                previewText.style.display = "inline"; // Show only the preview text
                toggleBtn.textContent = "See More";   // Change button text back to "See More"
            }
        });
    });
});


document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
}, false);
// REACTION
document.querySelectorAll(".reaction-btn").forEach(function(likeButton) {
    const reactionEmojis = likeButton.closest('.interaction').querySelector(".reaction-emojis");
    const selectedReactionIcon = likeButton.querySelector("i");

    let pressTimer;
    let userReaction = ""; // Variable to store the selected reaction
    let isReactionVisible = false; // Tracks whether the emoji reactions are visible

    const emojiToIconClassMap = {
        "👍": "fas fa-thumbs-up",
        "❤️": "fas fa-heart",
        "😂": "fas fa-laugh",
        "😮": "fas fa-surprise",
        "😢": "fas fa-sad-tear",
        "👏": "fas fa-hand-peace"
    };

    likeButton.addEventListener("mousedown", startPress);
    likeButton.addEventListener("mouseup", cancelPress);
    likeButton.addEventListener("mouseleave", cancelPress);

    // For mobile devices
    likeButton.addEventListener("touchstart", startPress);
    likeButton.addEventListener("touchend", cancelPress);

    // Add event listeners for each emoji to save the reaction
    likeButton.closest('.interaction').querySelectorAll(".emoji").forEach(emoji => {
        emoji.addEventListener("click", function() {
            if (userReaction === emoji.textContent) {
                userReaction = ""; // Reset the reaction
            } else {
                userReaction = emoji.textContent; // Get the emoji text
            }
            updateReactionUI();
            hideReactions();
        });
    });

    // If the Like button is clicked, toggle the reaction
    likeButton.addEventListener("click", function() {
        if (isReactionVisible) {
            hideReactions(); // Hide reactions if they are visible
        } else if (userReaction !== "") {
            userReaction = ""; // Reset the reaction if it was already selected
            updateReactionUI(); // Update the UI to show the default "Like" icon
        } else {
            userReaction = "👍"; // Default reaction on a single click
            updateReactionUI();
        }
    });

    // Hide reactions if clicking outside
    document.addEventListener("click", function(event) {
        if (!reactionEmojis.contains(event.target) && event.target !== likeButton) {
            hideReactions();
        }
    });

    function startPress() {
        // Start the timer for long press (500 ms)
        pressTimer = setTimeout(() => {
            showReactions();
            isReactionVisible = true;
        }, 500);
    }

    function cancelPress() {
        // Clear the timer if the press is released early
        clearTimeout(pressTimer);
    }

    function showReactions() {
        reactionEmojis.style.display = "flex";
        isReactionVisible = true;
    }

    function hideReactions() {
        reactionEmojis.style.display = "none";
        isReactionVisible = false;
    }

    function updateReactionUI() {
        if (userReaction) {
            selectedReactionIcon.className = emojiToIconClassMap[userReaction];
            selectedReactionIcon.style.color = "#EA8934"; // Orange color for active reaction
        } else {
            selectedReactionIcon.className = "fas fa-thumbs-up"; // Default like icon
            selectedReactionIcon.style.color = ""; // Reset to default color
        }
    }
});



// End Reaction


// Navbar
document.addEventListener('DOMContentLoaded', (event) => {
    const navLinks = document.querySelectorAll('.nav-link');
  
    // Function to set the active link based on URL
    function setActiveLink() {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.href === window.location.href) {
          link.classList.add('active');
        }
      });
    }
  
    // Set the active link on page load
    setActiveLink();
  
    // Add click event to each link to handle navigation
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
      });
    });
  });
  
  
//   
// COMMENT
document.addEventListener("DOMContentLoaded", function () {
    function initializeCardEvents(card) {
        const commentToggle = card.querySelector(".comment-toggle");
        const commentSection = card.querySelector(".comment-section");
        const addCommentBtn = card.querySelector(".add-comment-btn");
        const commentInput = card.querySelector(".comment-input");
        const commentsContainer = card.querySelector(".comments-container");
        const commentIcon = card.querySelector(".comment-toggle i");

        // Toggle comment section visibility
        if (commentToggle && commentSection) {
            commentToggle.addEventListener("click", function () {
                commentSection.classList.toggle("d-none");
                commentIcon.style.color = commentIcon.style.color === "rgb(234, 137, 52)" ? "" : "#EA8934";
            });
        }

        // Add a new comment
        if (addCommentBtn && commentInput && commentsContainer) {
            addCommentBtn.addEventListener("click", function () {
                const commentText = commentInput.value.trim();
                if (commentText !== "") {
                    // Create a new comment element
                    const newComment = document.createElement("div");
                    newComment.classList.add("d-flex", "align-items-start", "m-2", "pb-2", "comment");

                    newComment.innerHTML = `
                        <img src="/assets/images/Profile/Profile Pic.png" alt="Profile Picture" class="profile-pic" />
                        <div class="ms-2">
                            <b>John Doe</b>
                            <p class="comment-text">${commentText}</p>
                        </div>
                    `;

                    // Add the new comment to the container
                    commentsContainer.appendChild(newComment);

                    // Clear the input field
                    commentInput.value = "";
                }
            });
        }
    }

    // Initialize all existing cards
    document.querySelectorAll(".card").forEach(initializeCardEvents);

    // Handle dynamically added cards
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.classList && node.classList.contains("card")) {
                    initializeCardEvents(node);
                }
            });
        });
    });

    // Observe changes in the DOM
    observer.observe(document.body, { childList: true, subtree: true });
});


// Add event listener for comment icon
document.getElementById("addCommentBtn").addEventListener("click", function () {
    const commentInput = document.getElementById("commentInput");
    const commentsContainer = document.getElementById("commentsContainer");

    if (commentInput.value.trim() !== "") {
        // Create a new comment element
        const newComment = document.createElement("div");
        newComment.classList.add("d-flex", "align-items-start", "m-2", "pb-2", "comment");

        newComment.innerHTML = `
            <img
                src="/assets/images/Profile/Profile Pic.png"
                alt="Profile Picture"
                class="profile-pic"
            />
            <div class="ms-2">
                <b id="user_name">Your Name</b>
                <p class="comment-text">${commentInput.value.trim()}</p>
            </div>
        `;

        // Add the new comment to the container
        commentsContainer.appendChild(newComment);

        // Clear the input
        commentInput.value = "";
    }
});

  

//   ADD TO FAVORITE
document.addEventListener("DOMContentLoaded", function () {
    // Add event listener to all "Add to Favorites" sections
    document.querySelectorAll(".favorite-toggle").forEach(function (favoriteToggle) {
        favoriteToggle.addEventListener("click", function () {
            // Target the heart icon and text within the current card
            const heartIcon = favoriteToggle.querySelector("i");
            const text = favoriteToggle.querySelector("span");

            // Toggle heart icon color and text
            if (heartIcon.style.color === "rgb(234, 137, 52)") { // Check if it's already in the selected state
                heartIcon.style.color = ""; // Reset the color
                text.textContent = "Add to Favorites"; // Reset the text
            } else {
                heartIcon.style.color = "#EA8934"; // Change heart color
                text.textContent = "Added to Favorites"; // Change text
            }
        });
    });
});

