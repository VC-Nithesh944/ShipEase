// Function to show the Login Form
function showLoginForm() {
  document.getElementById("LoginForm").style.display = "block";
  document.getElementById("SignupForm").style.display = "none";
  document.getElementById("wrapped").style.display = "block";
  document.getElementById("bgimage1").style.display = "none";
  document.getElementById("main").style.display = "none";
  document.getElementById("footer").style.display = "none";
  document.getElementById("OtpForm").style.display = "none";
}

// Function to show the Signup Form
function showSignUpForm() {
  document.getElementById("LoginForm").style.display = "none";
  document.getElementById("SignupForm").style.display = "block";
  document.getElementById("wrapped").style.display = "block";
  document.getElementById("bgimage1").style.display = "none";
  document.getElementById("main").style.display = "none";
  document.getElementById("footer").style.display = "none";
  document.getElementById("OtpForm").style.display = "none";
}

function showOtpForm() {
  document.getElementById("LoginForm").style.display = "none";
  document.getElementById("SignupForm").style.display = "none";
  document.getElementById("wrapped").style.display = "block";
  document.getElementById("bgimage1").style.display = "none";
  document.getElementById("main").style.display = "none";
  document.getElementById("footer").style.display = "none";
  document.getElementById("OtpForm").style.display = "block";
}

// Function to update the navbar buttons and welcome message
function updateNavbarButtons() {
  const token = localStorage.getItem("jwt"); // Retrieve JWT from localStorage
  const loginButton = document.getElementById("loginButton");
  const signupButton = document.getElementById("signupButton");
  const logoutButton = document.getElementById("logoutButton");
  const welcomeMessage = document.getElementById("welcomeMessage");

  if (token) {
    const user = parseJwt(token); // Decode the token to get the username
    loginButton.style.display = "none";
    signupButton.style.display = "none";
    logoutButton.style.display = "inline"; // Show the logout button
    welcomeMessage.textContent = `Hi, ${user.username}! Welcome to ShipEase`;
  } else {
    loginButton.style.display = "inline";
    signupButton.style.display = "inline";
    logoutButton.style.display = "none"; // Hide the logout button
    welcomeMessage.textContent = "Hi, Welcome to ShipEase";
  }
}
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join("")
  );
  return JSON.parse(jsonPayload);
}

// Call this function on page load to set the initial state
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwt");
  if (token) {
    try {
      const decodedToken = jwt_decode(token);
      const loggedInUsername = decodedToken.username;

      // Update the welcome message
      document.getElementById(
        "welcomeMessage"
      ).innerText = `Hi, Welcome to ShipEase, ${loggedInUsername}!`;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
  updateNavbarButtons(); // Update button visibility
});

function logout() {
  localStorage.removeItem("jwt"); // Remove JWT from localStorage
  document.getElementById("welcomeMessage").innerText =
    "Hi, Welcome to ShipEase";
  alert("You have been logged out.");
  updateNavbarButtons(); // Update button visibility
}

// Add event listeners to the forms
// document.querySelector("#LoginForm form").addEventListener("submit", login);
// document.querySelector("#SignupForm form").addEventListener("submit", signup);

async function saveUserdata(e){
    console.log(e);
    e.preventDefault();
    const Name = document.getElementById("signupUsername").value ;
    const Email = document.getElementById("signupEmail").value;
    const Password = document.getElementById("signupPassword").value;
    const Confirm = document.getElementById("signupConfirmPassword").value;

   const response =  await fetch('http://localhost:1000/registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            {
                "Name":Name,
                "Email": Email ,
                "Password": Password,
                "Confirm": Confirm
            }, // The form data to be sent
        ) 
    })
    .then(response => response.json())  // Assuming the response is in JSON format
    .then(data => {
      showOtpForm();
      console.log('Success:', data);  // Handle success// Handle success
    })
    .catch((error) => {
        console.error('Error:', error);  // Handle error
    });
}

async function login(e) {
    e.preventDefault();
    const Email = document.getElementById("loginUsername").value;
    const Password = document.getElementById("loginPassword").value;

    const response = await fetch('http://localhost:1000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            {
                "password": Password,
                "email": Email,
            }
        )
    });
    const data = await response.json();  // Use await to get the response data

    if (data["message"] == "Login-successful") {
      // localStorage.setItem("userId", data["userId"]);
      localStorage.setItem("Authorization", "Berear " + data["token"]);
      // here redirection logic for Home page 
      alert("Login Successful!");
      window.location.href = "./index.html";
    }
    else {
      // Handle login failure (e.g., wrong credentials)
      alert(data.message || "Login failed. Please try again.");
  }
}

// Fetching all data from Mongo for Sign IN user (front-end incomplete)
async function getMyTransportRequests() {
  const response = await fetch('http://localhost:1000/api/getMyTransportRequests', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('Authorization'),
       },
  });
  const data = await response.json();
  console.log(data);
}

async function verifyOtp(e) {
  e.preventDefault();
  const email = document.getElementById("otpEmail").value;
  const otp = document.getElementById("otpCode").value;
  try {
    const response = await fetch('http://localhost:1000/verifyOtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
          {
            "otp": otp,
            "email": email,
          }
        )
    });
    let data = await response.json();
    if (data.success == true) {
      showLoginForm();
    }
    
} catch (e) {

}
}

