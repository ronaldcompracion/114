// Import the Supabase client library
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase URL and key for accessing the database
const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

// Create the Supabase client with the provided URL and key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to fetch announcements from a table and render them
async function fetchAnnouncements(tableName, containerId) {
  try {
    // Fetch all data from the specified table in Supabase
    const { data, error } = await supabase.from(tableName).select("*");

    // Check if there is an error in fetching the data
    if (error) {
      throw error;
    }

    // Store ID numbers and column names in local storage
    const storedData = data.map((item) => {
      const columnNames = Object.keys(item); // Get the column names of each record
      return {
        id: item.id, // Assuming 'id' is the column for ID numbers
        columns: columnNames, // Store the column names for each record
      };
    });

    // Save the extracted data to local storage
    localStorage.setItem(
      `announcements_${tableName}_data`,
      JSON.stringify(storedData)
    );

    // Call the renderAnnouncements function to display the data
    renderAnnouncements(data, containerId, tableName);
  } catch (error) {
    // Log the error if there is a problem fetching the announcements
    console.error(`Error fetching ${tableName} announcements:`, error);
  }
}

// Function to render the fetched announcements into the specified container
function renderAnnouncements(announcements, containerId, tableName) {
  const announcementContainer = document.getElementById(containerId);

  // Clear any existing content in the container
  announcementContainer.innerHTML = "";

  // Loop through each announcement and dynamically create the HTML structure
  announcements.forEach((announcement) => {
    const announcementElement = document.createElement("div");
    announcementElement.classList.add("row");

    // Build the HTML for each announcement
    announcementElement.innerHTML = `
      <div class="col-1">
       
      </div>
      <div class="col-9 clickable-area" data-title="${announcement.title}" data-description="${announcement.description}" data-date="${announcement.date}" data-id="${announcement.id}" data-table="${tableName}">
        <b id="tit2">${announcement.title}</b>
      </div>
      <div class="col-2 text-right pt-3">
        <button class="check-btn">
          <i class="fas fa-check check-icon"></i>
        </button>
      </div>
      <div class="row pb-1">
        <small class="pl-5 ml-2" id="date"><b>Posted: </b>${announcement.date}</small>
      </div>
    `;

    // Append the newly created announcement element to the container
    announcementContainer.appendChild(announcementElement);
  });

  // Add event listener for the check buttons to toggle active state and show calendar modal
  announcementContainer.addEventListener("click", function (event) {
    if (event.target.closest(".check-btn")) {
      const button = event.target.closest(".check-btn");
      const icon = button.querySelector(".check-icon");

      // Toggle active state and change icon and button styles
      button.classList.toggle("active");

      if (button.classList.contains("active")) {
        // Change icon color to white and background to orange when active
        icon.style.color = "white";
        button.style.backgroundColor = "#ea8934";
        button.style.borderColor = "#ea8934";
      } else {
        // Reset icon and background colors when not active
        icon.style.color = "#ea8934";
        button.style.backgroundColor = "white";
        button.style.borderColor = "#ea8934";
      }

      // Get announcement data
      const announcementElement = event.target.closest(".row");
      const announcementId = announcementElement.querySelector(".clickable-area").getAttribute("data-id");
      const announcementTitle = announcementElement.querySelector(".clickable-area").getAttribute("data-title");
      const announcementDate = announcementElement.querySelector(".clickable-area").getAttribute("data-date");
      const tableName = announcementElement.querySelector(".clickable-area").getAttribute("data-table");

      // Trigger the "Add to Calendar" modal to show
      showAddToCalendarModal(announcementId, announcementTitle, announcementDate, tableName);
    }

    // Show the modal with announcement details when clicking on the clickable area
    if (event.target.closest(".clickable-area")) {
      const title = event.target.closest(".clickable-area").getAttribute("data-title");
      const description = event.target.closest(".clickable-area").getAttribute("data-description");
      const date = event.target.closest(".clickable-area").getAttribute("data-date");
      const id = event.target.closest(".clickable-area").getAttribute("data-id");

      // Populate the announcement modal with the announcement data
      showAnnouncementModal(id, title, description, date);
    }
  });

  // Function to show the "Add to Calendar" modal
  function showAddToCalendarModal(id, title, date, tableName) {
    // Set title and date in the "Add to Calendar" modal
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-date").innerText = `Posted: ${date}`;
    
    // Prefill the date input with the selected date for calendar
    document.getElementById("modal-date-input").value = date;

    // Store the announcement ID and table name for later use (e.g., saving)
    const saveButton = document.getElementById("saveButton");
    saveButton.setAttribute("data-id", id);
    saveButton.setAttribute("data-table", tableName);

    // Show the modal
    $("#addToCalendarModal").modal("show");
  }

  // Function to show the announcement modal with details
  function showAnnouncementModal(id, title, description, date) {
    // Populate the modal with the announcement details
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-description").innerText = description;
    document.getElementById("modal-date").innerText = `Posted: ${date}`;

    // Show the modal overlay with the announcement details
    document.querySelector(".modal-overlay").classList.remove("hidden");

    // Optionally store the announcement ID for later use
    // document.getElementById("saveButton").setAttribute("data-id", id);
  }

  // Hide the announcement modal when clicking the close button
  document.querySelector(".close-btn").addEventListener("click", () => {
    document.querySelector(".modal-overlay").classList.add("hidden");
  });
}


// Save the announcement to the calendar
// Save the announcement to the calendar
async function saveToCalendar() {
  const announcementId = document.getElementById("saveButton").getAttribute("data-id");
  const tableName = document.getElementById("saveButton").getAttribute("data-table");
  const selectedDate = document.getElementById("modal-date-input").value; // Get the selected date from the modal
  const selectedTime = document.getElementById("time").value; // Get the selected time from the modal

  // Retrieve the user_id from local storage
  const userId = localStorage.getItem("loggedInUserId");

  if (!selectedDate || !selectedTime) {
    alert("Please select a date and time.");
    return;
  }

  // Check if userId is present in localStorage
  if (!userId) {
    alert("User is not logged in. Please log in to save to the calendar.");
    return;
  }

  try {
    // Determine the field for the foreign key based on the table name
    let foreignKeyField;
    if (tableName === "New") {
      foreignKeyField = "new_id";
    } else if (tableName === "Pinned") {
      foreignKeyField = "pinned_id";
    } else if (tableName === "Old") {
      foreignKeyField = "old_id";
    }

    // Insert the data into the Calendar table, including the user_id
    const { error } = await supabase
      .from("Calendar") // Calendar table
      .insert([
        {
          [foreignKeyField]: announcementId, // Set the appropriate foreign key
          date: selectedDate,
          time: selectedTime,
          user_id: userId, // Add the user_id from localStorage
        }
      ]);

    if (error) throw error;

    // Close the modal after saving
    $("#addToCalendarModal").modal("hide");

    alert("Saved successfully to the calendar!");

  } catch (error) {
    console.error("Error saving to calendar:", error);
    alert("Failed to save to calendar.");
  }
}


// Add event listener for the save button to trigger the saveToCalendar function
document.getElementById("saveButton").addEventListener("click", saveToCalendar);

// Hide modal when clicking close button or outside
document.querySelector(".close").addEventListener("click", () => {
  $("#addToCalendarModal").modal("hide");
});

// Fetch announcements for each section when the page loads
fetchAnnouncements("Pinned", "pinned-container");
fetchAnnouncements("New", "new-container");
fetchAnnouncements("Old", "old-container");


// MODAL SURVEY

// Get modal elements
const surveyIcon = document.getElementById('surveyIcon');
const surveyModal = document.getElementById('surveyModal');
const closeModal = document.getElementById('closeModal');

// Open modal
surveyIcon.addEventListener('click', () => {
    surveyModal.style.display = 'block';
});

// Close modal
closeModal.addEventListener('click', () => {
    surveyModal.style.display = 'none';
});

// Close modal when clicking outside the content
surveyModal.addEventListener('click', (e) => {
    if (e.target === surveyModal) {
        surveyModal.style.display = 'none';
    }
});

// Handle poll voting
document.querySelectorAll('.poll-option').forEach(option => {
  // Store the initial value for each poll option in data attributes
  let initialValue = parseInt(option.dataset.initial); // We use dataset to keep track of the initial vote count
  let currentValue = initialValue;
  
  const progressBar = option.querySelector('.custom-progress-bar');
  
  // Set initial value
  progressBar.style.width = initialValue + '%';
  progressBar.textContent = initialValue + ' votes';

  option.addEventListener('click', function () {
      // If user clicks again, decrement the value
      if (currentValue > initialValue) {
          currentValue -= 1;
      } else {
          currentValue += 1; // Increment the value on click
      }

      // Ensure we don't exceed 100%
      const newWidth = Math.min(currentValue, 100);

      // Update progress bar and text
      progressBar.style.width = newWidth + '%';
      progressBar.textContent = newWidth + ' votes';

      // Update the data attribute to track the new vote count
      option.dataset.initial = currentValue;

      // Create the +1 or -1 animation element
      const animation = document.createElement('div');
      animation.classList.add('vote-animation');
      animation.textContent = (currentValue > initialValue) ? '+1' : '-1'; // Add +1 or -1 based on increment or decrement
      option.appendChild(animation);

      // Remove the animation element after it completes
      animation.addEventListener('animationend', () => {
          animation.remove();
      });
  });
});



async function handleSearchAcrossTables(inputId, suggestionsId) {
  const searchInput = document.getElementById(inputId);
  const suggestionsList = document.getElementById(suggestionsId);

  // Listen for input events on the search field
  searchInput.addEventListener("input", async (event) => {
    const query = event.target.value.trim(); // Get the trimmed input value

    // Hide suggestions if query is empty
    if (!query) {
      suggestionsList.style.display = "none";
      suggestionsList.innerHTML = "";
      return;
    }

    try {
      // Define table names and foreign key mappings
      const tables = [
        { name: "New", foreignKey: "new_id" },
        { name: "Pinned", foreignKey: "pinned_id" },
        { name: "Old", foreignKey: "old_id" },
      ];

      let allResults = []; // Array to store combined results from all tables

      // Loop through each table and fetch matching records
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table.name) // Use the table name
          .select("*") // Select all columns
          .ilike("title", `%${query}%`); // Match 'title' column with query

        if (error) throw error; // Throw an error if fetch fails

        if (data) {
          // Map results with additional metadata (table name, foreign key)
          const resultsWithMetadata = data.map((item) => ({
            ...item,
            tableName: table.name,
            foreignKey: table.foreignKey,
          }));
          allResults = allResults.concat(resultsWithMetadata); // Merge results
        }
      }

      // Populate suggestions in the list
      suggestionsList.innerHTML = allResults
        .map(
          (item) => `
          <li class="list-group-item suggestion-item" 
              data-id="${item[item.foreignKey]}" 
              data-title="${item.title}" 
              data-description="${item.description}" 
              data-date="${item.date}" 
              data-table="${item.tableName}">
            ${item.title} <small>(${item.tableName})</small>
          </li>`
        )
        .join("");

      // Show the suggestions list if there are results
      suggestionsList.style.display = allResults.length ? "block" : "none";
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });

  // Listen for clicks on suggestions
  suggestionsList.addEventListener("click", (event) => {
    const suggestionItem = event.target.closest(".suggestion-item");
    if (suggestionItem) {
      // Extract metadata from the clicked suggestion
      const id = suggestionItem.getAttribute("data-id");
      const title = suggestionItem.getAttribute("data-title");
      const description = suggestionItem.getAttribute("data-description");
      const date = suggestionItem.getAttribute("data-date");
      const tableName = suggestionItem.getAttribute("data-table");

      // Show the modal with populated details
      showAnnouncementModal(id, title, description, date, tableName);
    }
  });
}

// Function to display the modal with announcement details
function showAnnouncementModal(id, title, description, date, tableName) {
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const modalDate = document.getElementById("modal-date");

  // Populate modal with the data
  modalTitle.innerText = title;
  modalDescription.innerText = description;
  modalDate.innerText = `Date: ${date}`;

  // Optionally, you can add more data related to the table if needed
  console.log(`Data from table: ${tableName} with ID: ${id}`);

  // Show the modal
  document.querySelector(".modal-overlay").classList.remove("hidden");
}

// Initialize the search functionality
handleSearchAcrossTables("search-input", "search-suggestions");

// Close modal functionality
document.querySelector(".close-btn").addEventListener("click", () => {
  document.querySelector(".modal-overlay").classList.add("hidden");
});



