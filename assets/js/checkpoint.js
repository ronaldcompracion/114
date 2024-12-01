// checkpoint.js

// Restrict unauthorized access based on role
function restrictAccess() {
    const role = localStorage.getItem("loggedInRole");

    // List of pages restricted to admins
    const adminPages = ["/pages/index_admin.html"];
    
    // List of pages restricted to users
    const userPages = ["/pages/Announcement.html", "/pages/News.html", "/pages/Profile.html", "/pages/Settings.html"];

    // Get the current page's path
    const currentPage = window.location.pathname;

    // Check if the user is an admin trying to access user pages
    if (role === "admin" && userPages.includes(currentPage)) {
        alert("Admins cannot access user pages.");
        window.location.href = "/pages/index_admin.html"; // Redirect admin to admin page
    }
    
    // Check if the user is a regular user trying to access admin pages
    else if (role === "user" && adminPages.includes(currentPage)) {
        alert("Users cannot access admin pages.");
        window.location.href = "/pages/News.html"; // Redirect user to user page
    }
}

// Call restrictAccess on every page load
window.addEventListener("load", restrictAccess);
