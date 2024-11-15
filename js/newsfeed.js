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


// Reactions
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
}, false);

document.querySelectorAll(".reaction-btn").forEach(function(likeButton) {
    const reactionEmojis = likeButton.closest('.card').querySelector(".reaction-emojis");
    const selectedReaction = likeButton.closest('.card').querySelector(".reaction-btn span");

    let pressTimer;
    let userReaction = ""; // Variable to store the selected reaction

    likeButton.addEventListener("mousedown", startPress);
    likeButton.addEventListener("mouseup", cancelPress);
    likeButton.addEventListener("mouseleave", cancelPress);

    // For mobile devices
    likeButton.addEventListener("touchstart", startPress);
    likeButton.addEventListener("touchend", cancelPress);

    // Event listener to hide reactions if clicking outside
    document.addEventListener("click", function(event) {
        if (!reactionEmojis.contains(event.target) && event.target !== likeButton) {
            hideReactions();
        }
    });

    // Add event listeners for each emoji to save the reaction
    likeButton.closest('.card').querySelectorAll(".emoji").forEach(emoji => {
        emoji.addEventListener("click", function() {
            userReaction = emoji.textContent; // Get the emoji text
            updateReactionUI(); // Update UI with selected reaction
            hideReactions();
        });
    });

    // If the Like button is clicked, toggle the reaction
    likeButton.addEventListener("click", function() {
        if (userReaction !== "") {
            userReaction = ""; // Reset the reaction if it was already selected
            updateReactionUI(); // Update the UI to show default "Like" text
        } else {
            showReactions(); // Show the emoji reactions if no reaction is selected
        }
    });

    function startPress() {
        // Start the timer for long press (500 ms)
        pressTimer = setTimeout(showReactions, 500);
    }

    function cancelPress() {
        // Clear the timer if the press is released early
        clearTimeout(pressTimer);
    }

    function showReactions() {
        console.log("Showing reactions"); // Debugging
        reactionEmojis.style.display = "flex";
    }

    function hideReactions() {
        console.log("Hiding reactions"); // Debugging
        reactionEmojis.style.display = "none";
    }

    function updateReactionUI() {
        // If a reaction was selected, show that emoji
        if (userReaction) {
            selectedReaction.textContent = userReaction; // Replace the text with the selected emoji
        } else {
            selectedReaction.textContent = "Like"; // Default text when no reaction is selected
        }
    }
});
