import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const signinForm = document.getElementById("signinForm");

signinForm.onsubmit = async (event) => {
    event.preventDefault();

    const idnumber = document.getElementById("id-number").value;
    const password = document.getElementById("password").value;

    const notification = document.getElementById("notification");
    const preloader = document.getElementById("preloader");

    // Reset notifications
    notification.textContent = "";
    notification.className = "notification";
    notification.style.display = "none";

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
            showNotification("Invalid ID number or password.", "error");
            return;
        }

        // Extract user information
        const user = data[0];
        const role = user.role; // Role field
        const userId = user.id;
        const fullName = `${user.f_name} ${user.l_name}`;
        const profileImg = user.profile_img || "/assets/images/Profile/Profile Pic.png";

        // Store the user information in Local Storage
        localStorage.setItem("loggedInUserId", userId);
        localStorage.setItem("loggedInFullName", fullName);
        localStorage.setItem("loggedInProfileImg", profileImg);
        localStorage.setItem("loggedInRole", role);

        // Redirect based on role
        if (role === "admin") {
            showNotification("Welcome Admin! Redirecting to admin dashboard...", "success");

            setTimeout(() => {
                window.location.href = "/pages/index_admin.html";
            }, 2000);
        } else if (role === "user") {
            showNotification("Welcome User! Redirecting...", "success");

            setTimeout(() => {
                window.location.href = "/pages/News.html";
            }, 2000);
        } else {
            throw new Error("Invalid role detected.");
        }
    } catch (err) {
        console.error("Login Error:", err);
        showNotification(`Login failed: ${err.message}`, "error");
    }
};

// Display a notification
function showNotification(message, type) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = "block";

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

// Restrict unauthorized access based on role
function restrictAccess() {
    const role = localStorage.getItem("loggedInRole");

    const adminPages = ["/pages/index_admin.html"];
    const userPages = ["/pages/Announcement.html", "/pages/News.html", "/pages/Profile.html", "/pages/Settings.html"];

    const currentPage = window.location.pathname;

    if (role === "admin" && userPages.includes(currentPage)) {
        alert("Admins cannot access user pages.");
        window.location.href = "/pages/index_admin.html";
    } else if (role === "user" && adminPages.includes(currentPage)) {
        alert("Users cannot access admin pages.");
        window.location.href = "/pages/News.html";
    }
}

// Call restrictAccess on every page load
window.addEventListener("load", restrictAccess);

// Hide preloader and show form container on page load
window.addEventListener("load", function () {
    document.getElementById("preloader").style.display = "none";
    document.querySelector(".form-container").style.display = "block";
});
