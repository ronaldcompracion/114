import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const signupForm = document.getElementById("signupForm");

signupForm.onsubmit = async (event) => {
    event.preventDefault();
  
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const idnumber = document.getElementById("idnumber").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmpassword = document.getElementById("confirmpassword").value;
  
    if (password !== confirmpassword) {
      alert("Passwords do not match.");
      return;
    }

    // Insert user data into the 'users' table
    try {
      const { data, error } = await supabase
        .from("users")  // Reference to your 'users' table in the public schema
        .insert([{ email, password, f_name: firstname, l_name: lastname, id_number: idnumber }]);  // Insert the full details

      if (error) {
        console.error("User Insert Error:", error);
        throw new Error("Error inserting user details into the users table.");
      }

      alert("Account created successfully!");
      signupForm.reset();
    } catch (err) {
      console.error("Registration Error:", err);
      alert(`Registration failed: ${err.message}`);
    }
};
