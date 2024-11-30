import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const signinForm = document.getElementById("signinForm");

signinForm.onsubmit = async (event) => {
    event.preventDefault();

    const idnumber = document.getElementById("id-number").value;
    const password = document.getElementById("password").value;

    const successNotification = document.getElementById("successNotification");
    const errorNotification = document.getElementById("errorNotification");
    const preloader = document.getElementById("preloader");

    try {
        // Query the users table to find a matching id_number and password
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id_number", idnumber)
            .eq("password", password);

        if (error) {
            console.error("Database Query Error:", error);
            throw new Error("Error querying users table.");
        }

        if (data.length === 0) {
            // Display error notification for invalid credentials
            errorNotification.style.display = "block";
            setTimeout(() => {
                errorNotification.style.display = "none";
            }, 3000);
            return;
        }

        // Extract user information
        const user = data[0];
        const userId = user.id; // Assuming the "id" field exists in the users table
        const fullName = `${user.f_name} ${user.l_name}`; // Concatenate first name and last name
        const profileImg = user.profile_img || "/assets/images/Profile/Profile Pic.png"; // Default to a placeholder if no image is provided

        // Store the user information in Local Storage
        localStorage.setItem("loggedInUserId", userId);
        localStorage.setItem("loggedInFullName", fullName); // Store full name
        localStorage.setItem("loggedInProfileImg", profileImg); // Store profile image

        // If a match is found, display success notification
        successNotification.style.display = "block";
        setTimeout(() => {
            successNotification.style.display = "none";
            preloader.style.display = "flex"; // Show preloader after success notification

            // Redirect after a brief delay to allow the preloader to be visible
            setTimeout(() => {
                window.location.href = "/pages/index.html"; // Redirect on success
            }, 2000);
        }, 2000); // Delay for success notification
    } catch (err) {
        console.error("Login Error:", err);
        alert(`Login failed: ${err.message}`);
    }
};



// Hide preloader and show form container on page load
window.addEventListener("load", function () {
    document.getElementById("preloader").style.display = "none";
    document.querySelector(".form-container").style.display = "block";
});
