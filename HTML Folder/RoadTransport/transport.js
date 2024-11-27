// Function to populate dropdowns
function populateDropdowns(jsonFile, dropdownIds)
{
  fetch(jsonFile)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      dropdownIds.forEach((dropdownId) => {
        const dropdown = document.getElementById(dropdownId);
        data.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.value;
          option.textContent = item.text;
          dropdown.appendChild(option);
        });
      });
    })
    .catch((error) => console.error("Error fetching the JSON file:", error));
}

function populateDropdown2(jsonFile, dropdownId) {
    fetch(jsonFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const dropdown = document.getElementById(dropdownId);
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.value;
                option.textContent = item.text;
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching the JSON file:', error));
}

function populateFooter(jsonFile, containerId) {
    fetch(jsonFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById(containerId);

            // Function to create a section
            function createSection(title, items) {
                const ul = document.createElement('ul');
                const titleElement = document.createElement('p');
                titleElement.textContent = title;
                ul.appendChild(titleElement);

                items.forEach(item => {
                    const anchor = document.createElement('a');
                    anchor.textContent = item;
                    anchor.href = "#"; // Optional: Add appropriate links
                    ul.appendChild(anchor);
                });

                return ul;
            }

            // Add sections dynamically
            container.appendChild(createSection("Our Main Branches", data.branches));
            container.appendChild(createSection("Services Available", data.services));
            container.appendChild(createSection("", data.otherCities)); // Blank title
            container.appendChild(createSection("Soon Available at", data.soonAvailable));
        })
        .catch(error => console.error('Error fetching the JSON file:', error));
}

function calculatePrice() {
    // Get input values
    const fromLocation = document.getElementById("sourceLocation").value;
    const toLocation = document.getElementById("destinationLocation").value;
    const bookingType = document.getElementById("bookingType").value;
    const weight = parseFloat(document.getElementById("weight").value);
    const length = parseFloat(document.getElementById("length").value);
    const width = parseFloat(document.getElementById("width").value);
    const height = parseFloat(document.getElementById("height").value);

    // Validate inputs
    if (!fromLocation || !toLocation || !bookingType || isNaN(weight) || isNaN(length) || isNaN(width) || isNaN(height)) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    // Calculate volume weight
    const volumeWeight = (length * width * height) / 5000;
    const chargeableWeight = Math.max(weight, volumeWeight);

    // Fetch rates.json and calculate the price
    fetch("rates.json")
        .then((response) => response.json())
        .then((rates) => {
            // Get rates for the selected booking type and destination
            const ratePerKg = rates.bookingTypes[bookingType][toLocation];

            if (!ratePerKg) {
                alert("Rates not available for the selected destination or booking type.");
                return;
            }

            // Calculate total price
            const totalPrice = chargeableWeight * ratePerKg;

            // Display the estimated price
            document.getElementById("estimated-price").value = `₹${totalPrice.toFixed(2)}`;
        })
        .catch((error) => {
            console.error("Error fetching rates.json:", error);
            alert("Failed to fetch rates. Please try again.");
        });
}