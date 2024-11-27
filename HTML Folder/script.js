// Function to show Login Form
function showLoginForm() {
    document.getElementById("LoginForm").style.display = "block";
    document.getElementById("SignupForm").style.display = "none";
    document.getElementById("wrapped").style.display = "block";
    document.getElementById("bgimage1").style.display = "none";
}

// Function to show Signup Form
function showSignUpForm() {
    document.getElementById("LoginForm").style.display = "none";
    document.getElementById("SignupForm").style.display = "block";
    document.getElementById("wrapped").style.display = "block";
    document.getElementById("bgimage1").style.display = "none";
}

function updateNavbarButtons() {
    const token = localStorage.getItem('jwt'); // Check if JWT exists
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const logoutButton = document.getElementById('logoutButton');

    if (token) {
        loginButton.style.display = 'none';
        signupButton.style.display = 'none';
        logoutButton.style.display = 'inline'; // Show logout button
    } else {
        loginButton.style.display = 'inline';
        signupButton.style.display = 'inline';
        logoutButton.style.display = 'none'; // Hide logout button
    }
}

// Call this function on page load to set the initial state
document.addEventListener('DOMContentLoaded', updateNavbarButtons);


// Function to handle Login form submission
function login(event) {
    event.preventDefault();

    const username = document.querySelector("#LoginForm input[name='username']").value;
    const password = document.querySelector("#LoginForm input[name='password']").value;

    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('jwt', data.token); // Save JWT to localStorage
            alert('Login successful!');
            updateNavbarButtons(); // Update button visibility
            document.getElementById('LoginForm').style.display = 'none';
            document.getElementById('wrapped').style.display = 'none';
            document.getElementById('bgimage1').style.display = 'block';
        } else {
            alert(data.message || 'Login failed!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

async function signup(event) {
    event.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Signup successful! Please log in.');
            showLoginForm(); // Redirect to login form
        } else {
            alert(result.error || 'Signup failed!');
        }
    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred while signing up.');
    }
}

function logout() {
    localStorage.removeItem('jwt'); // Remove JWT from localStorage
    alert('You have been logged out.');
    updateNavbarButtons(); // Update button visibility
}



// Add event listeners to the forms
document.querySelector("#LoginForm form").addEventListener("submit", login);
document.querySelector("#SignupForm form").addEventListener("submit", signup);
