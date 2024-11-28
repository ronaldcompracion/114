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
    console.log("Next ID:", nextId);

    // Step 3: Insert the new user with the calculated ID
    console.log("Inserting data with the following payload:");
    console.log({
      id: nextId,
      email,
      password,
      f_name: firstname,
      l_name: lastname,
      id_number: idnumber,
    });

    const { data, error } = await supabase
      .from("users")
      .insert([{ 
        id: nextId, 
        email, 
        password, 
        f_name: firstname, 
        l_name: lastname, 
        id_number: idnumber 
      }]);

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
