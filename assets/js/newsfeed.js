
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

// Add event listener for comment icon
document.getElementById("addCommentBtn").addEventListener("click", function () {
    const commentInput = document.getElementById("commentInput");
    const commentsContainer = document.getElementById("commentsContainer");

    if (commentInput.value.trim() !== "") {
       
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

       
        commentsContainer.appendChild(newComment);

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



  
  // Function to highlight matched text in the specified element
  function highlightText(element, searchQuery) {
    const regex = new RegExp(`(${searchQuery})`, 'gi');  // Case-insensitive regex to match the query
    element.innerHTML = element.textContent.replace(regex, '<span class="highlight">$1</span>');
  }
  
  // Function to reset highlights in the card
  function resetHighlights(card) {
    const highlightedText = card.querySelectorAll('.highlight');
    highlightedText.forEach(highlight => {
      highlight.outerHTML = highlight.textContent;  // Remove the highlight span and restore original text
    });
  }
  
  // Add an event listener to the search input
  document.getElementById('search-input').addEventListener('input', searchCards);
  