import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const signupForm = document.getElementById("signupForm");
const notification = document.getElementById("notification");

signupForm.onsubmit = async (event) => {
  event.preventDefault();

  const firstname = document.getElementById("firstname").value;
  const lastname = document.getElementById("lastname").value;
  const idnumber = document.getElementById("idnumber").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmpassword = document.getElementById("confirmpassword").value;

  // Clear notification
  notification.textContent = "";
  notification.className = "notification";
  notification.style.display = "none";

  if (password !== confirmpassword) {
    showNotification("Passwords do not match.", "error");
    return;
  }

  try {
    // Step 1: Fetch the highest existing ID
    const { data: maxIdData, error: maxIdError } = await supabase
      .from("users")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (maxIdError) {
      console.error("Error fetching the highest ID:", maxIdError);
      throw new Error("Failed to retrieve the latest ID from the database.");
    }

    // Step 2: Calculate the new ID
    const nextId = maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;

    // Step 3: Insert the new user with the calculated ID and "user" role
    const { data, error } = await supabase
      .from("users")
      .insert([{
        id: nextId,
        email,
        password,
        f_name: firstname,
        l_name: lastname,
        id_number: idnumber,
        role: "user" // Automatically setting the role
      }]);

    if (error) {
      console.error("User Insert Error:", error);
      throw new Error("Error inserting user details into the users table.");
    }

    // Success notification
    showNotification("Account created successfully!", "success");
    signupForm.reset();
  } catch (err) {
    // Error notification
    console.error("Registration Error:", err);
    showNotification(`Registration failed: ${err.message}`, "error");
  }
};

/**
 * Displays a notification message on the UI.
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification ('success' or 'error').
 */
function showNotification(message, type) {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";
}
