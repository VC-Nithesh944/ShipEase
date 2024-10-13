// Login form JS
function showLoginForm() {
    document.getElementById("wrapped").style.display = "block";
    document.getElementById("LoginForm").style.display = "block";
    document.getElementById("SignupForm").style.display = "none";
    document.getElementById("navigation").style.display = "none";
    document.getElementById("navigation2").style.display="none";
}
// SignUp form JS
function showSignUpForm(){
    document.getElementById("wrapped").style.display = "block";
    document.getElementById("LoginForm").style.display = "none";
    document.getElementById("SignupForm").style.display = "block";
    document.getElementById("navigation").style.display = "none";
    document.getElementById("navigation2").style.display="none";
}

//image slider animations
let currentSlide = 0;
    const slides = document.querySelectorAll('.image-slider img');

    function showNextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;  // Loop through the slides
        slides[currentSlide].classList.add('active');
    }

    setInterval(showNextSlide, 3000);
