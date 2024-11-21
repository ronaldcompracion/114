
document.getElementById('signinForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Show success notification
    var notification = document.getElementById('successNotification');
    notification.style.display = 'block';
    // Hide the notification after 3 seconds
    setTimeout(function() {
        notification.style.display = 'none';
    }, 3000);
});


 // Hide preloader and show form container on page load
 window.addEventListener('load', function() {
    document.getElementById('preloader').style.display = 'none';
    document.querySelector('.form-container').style.display = 'block';
});

document.getElementById('signinForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Show preloader
    document.getElementById('preloader').style.display = 'flex';
    // Simulate sign-in process and redirect to index page
    setTimeout(function() {
        window.location.href = '/pages/index.html';
    }, 2000);
});