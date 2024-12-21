// Function to show the Login Form
function showLoginForm() {
  document.getElementById("LoginForm").style.display = "block";
  document.getElementById("SignupForm").style.display = "none";
  document.getElementById("wrapped").style.display = "block";
  document.getElementById("bgimage1").style.display = "none";
  document.getElementById("main").style.display = "none";
  document.getElementById("footer").style.display = "none";
}

// Function to show the Signup Form
function showSignUpForm() {
  document.getElementById("LoginForm").style.display = "none";
  document.getElementById("SignupForm").style.display = "block";
  document.getElementById("wrapped").style.display = "block";
  document.getElementById("bgimage1").style.display = "none";
  document.getElementById("footer").style.display = "none";
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

// function login(event) {
//     event.preventDefault();

//     const username = document.querySelector("#LoginForm input[name='username']").value;
//     const password = document.querySelector("#LoginForm input[name='password']").value;

//     fetch('http://localhost:3000/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }),
//     })
//         .then(response => response.json())
//         .then(data => {
//             if (data.token) {
//                 localStorage.setItem('jwt', data.token); // Save JWT to localStorage
//                 alert('Login successful!');
//                 updateNavbarButtons(); // Update the navbar buttons
//                 document.getElementById('LoginForm').style.display = 'none';
//                 document.getElementById('wrapped').style.display = 'none';
//                 document.getElementById('bgimage1').style.display = 'block';
//             } else {
//                 alert(data.message || 'Login failed!');
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             alert('An error occurred. Please try again.');
//         });
// }

// async function signup(event) {
//     event.preventDefault();

//     const username = document.getElementById('signupUsername').value;
//     const email = document.getElementById('signupEmail').value;
//     const password = document.getElementById('signupPassword').value;
//     const confirmPassword = document.getElementById('signupConfirmPassword').value;

//     if (password !== confirmPassword) {
//         alert('Passwords do not match. Please try again.');
//         return;
//     }

//     try {
//         const response = await fetch('http://localhost:3000/api/signup', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ username, email, password }),
//         });

//         const result = await response.json();

//         if (response.ok) {
//             alert('Signup successful! Please log in.');
//             showLoginForm(); // Redirect to login form
//         } else {
//             alert(result.error || 'Signup failed!');
//         }
//     } catch (error) {
//         console.error('Error during signup:', error);
//         alert('An error occurred while signing up.');
//     }
// }

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
        console.log('Success:', data);  // Handle success
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
        localStorage.setItem("userId", data["userId"]);
        // here redirection logic for Home page 
    }
}
