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

function getAllTransportVariable() {
    const fromLocation = document.getElementById("sourceLocation").value;
    const toLocation = document.getElementById("destinationLocation").value;
    const bookingType = document.getElementById("bookingType").value;
    const weight = parseFloat(document.getElementById("weight").value);
    const length = parseFloat(document.getElementById("length").value);
    const width = parseFloat(document.getElementById("width").value);
    const height = parseFloat(document.getElementById("height").value);
    const bookingDate = document.getElementById("bookingDate").value;
    const deliveryDate = document.getElementById("delivery-date").value;
    return { fromLocation, toLocation, bookingType, weight, length, width, height, bookingDate, deliveryDate }
}

async function calculatePrice() {
    // Get input values
    let { fromLocation, toLocation, bookingType, weight, length, width, height, bookingDate, deliveryDate } = getAllTransportVariable();
    let totalPrice;
    // Validate inputs
    if (!fromLocation || !toLocation || !bookingType || isNaN(weight) || isNaN(length) || isNaN(width) || isNaN(height)) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    // Calculate volume weight
    const volumeWeight = (length * width * height) / 5000;
    const chargeableWeight = Math.max(weight, volumeWeight);

    // Fetch rates.json to get rates for calculation
    // fetch("rates.json")
    //     .then((response) => response.json())
    //     .then((rates) => {
        const response = await fetch("rates.json");
        const rates = await response.json();
            // Get the rate per kg for the booking type and destination
            const ratePerKg = rates.bookingTypes?.[bookingType]?.[toLocation];
            if (!ratePerKg) {
                alert("Rates are not available for the selected destination or booking type.");
                return;
            }

            // Calculate total price
            totalPrice = chargeableWeight * ratePerKg;

            // Display the estimated price
            document.getElementById("estimated-price").value = `₹${totalPrice.toFixed(2)}`;

            // Calculate and display the delivery date
            const deliveryDays = getDeliveryDays(bookingType);
            deliveryDate = calculateDeliveryDate(bookingDate, deliveryDays);
            document.getElementById("delivery-date").value = deliveryDate;
    return totalPrice;
        // .catch((error) => {
        //     console.error("Error fetching rates.json:", error);
        //     alert("Failed to fetch rates. Please try again.");
        // });
}

function getDeliveryDays(bookingTypes) {
    const deliveryTimes = {
        normal: 3,
        express: 1,
        refrigerated: 5,
        hazardous: 7,
    };
    return deliveryTimes[bookingTypes.toLowerCase()] || 3; // Default to 3 days if type not found
}

function calculateDeliveryDate(bookingDate, daysToAdd) {
    const date = new Date(bookingDate);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
}

function resetValues() {
    // Reset dropdowns
    document.getElementById('sourceLocation').selectedIndex = 0;
    document.getElementById('destinationLocation').selectedIndex = 0;
    document.getElementById('bookingType').selectedIndex = 0;
    document.getElementById('weight').value = '';
    document.getElementById('length').value = '';
    document.getElementById('width').value = '';
    document.getElementById('height').value = '';
    document.getElementById('bookingDate').value = '';
    document.getElementById('estimated-price').value = '';
    document.getElementById('delivery-date').value = '';
}

async function addTransportData() {
    let totalPrice = await calculatePrice(); // to use await fun should be async 
    let transportData = getAllTransportVariable();
    transportData.totalPrice = totalPrice;
    const token = localStorage.getItem('Authorization');

    if (!token) {
        console.log("Please login for the transport")
        return;
    }
    
    const response = await fetch('http://localhost:1000/api/saveTransportData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':token,
        },
        body: JSON.stringify(transportData)
    });
    const data = await response.json();
    console.log(data);

    if (response.ok) {
        // Show a success message
        alert("Shipment Successfully Placed!");

        // Reset form values
        resetValues();
    } else {
        // Handle failure response
        alert(data.message || "Failed to place shipment. Please try again.");
    }

}