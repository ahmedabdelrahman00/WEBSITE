// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCBUWHm2g9sd9P5ZofIg0zBsN5F0W0I2vM",
    authDomain: "travel-advisor-cac06.firebaseapp.com",
    databaseURL: "https://travel-advisor-cac06-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "travel-advisor-cac06",
    storageBucket: "travel-advisor-cac06.appspot.com",
    messagingSenderId: "307821978887",
    appId: "1:307821978887:web:71ce0fb2e25ed8fb0a51a2"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("bookingForm");
    const departureSelect = document.getElementById("departureCity");
    const destinationSelect = document.getElementById("destinationCity");
    const summaryDetails = document.getElementById("summaryDetails");
    const totalPrice = document.getElementById("totalPrice");
    const confirmBtn = document.getElementById("confirmBookingBtn");
    const returnDateLabel = form.querySelector(".return-date-label");
    const bookingSummarySection = document.getElementById("bookingSummarySection");
    const stepBookingInfo = document.getElementById("step-booking-info");
    const progressSteps = document.querySelectorAll(".progress-indicator .step");
  
    let bookingData = {};
    let currentStep = 1;
  
    // Load cities from Firebase
    firebase.database().ref("destinations").once("value").then(snapshot => {
      const data = snapshot.val();
      for (let key in data) {
        const name = data[key].name;
        const option1 = new Option(name, name);
        const option2 = new Option(name, name);
        departureSelect.add(option1.cloneNode(true));
        destinationSelect.add(option2.cloneNode(true));
      }
    });
  
    function updateReturnVisibility() {
      const tripType = form.tripType.value;
      returnDateLabel.style.display = tripType === "roundtrip" ? "flex" : "none";
    }
  
    form.tripType.forEach(r => r.addEventListener("change", updateReturnVisibility));
    updateReturnVisibility();
  
    function updateSummary() {
      const dep = form.departureCity.value || "-";
      const dest = form.destinationCity.value || "-";
      const depDate = form.departureDate.value || "-";
      const retDate = form.returnDate.value || "-";
      const tripType = form.tripType.value;
      const adults = form.adults.value;
      const children = form.children.value;
      const infants = form.infants.value;
      const travelClass = form.travelClass.value;
  
      summaryDetails.innerHTML = `
        <div><b>From:</b> ${dep} <i class="fa-solid fa-arrow-right"></i> <b>To:</b> ${dest}</div>
        <div><b>Departure:</b> ${depDate}${tripType === "roundtrip" ? ` <b>Return:</b> ${retDate}` : ""}</div>
        <div><b>Passengers:</b> ${adults} Adult(s), ${children} Child(ren), ${infants} Infant(s)</div>
        <div><b>Class:</b> ${travelClass}</div>
      `;
  
      let price = 200 * adults + 120 * children + 50 * infants;
      if (travelClass === "Business") price *= 1.7;
      if (travelClass === "First") price *= 2.5;
      if (tripType === "roundtrip") price *= 1.8;
  
      totalPrice.textContent = `$${price.toFixed(2)}`;
    }
  
    form.addEventListener("input", updateSummary);
    updateSummary();
  
    function setStep(step) {
      progressSteps.forEach((el, i) => el.classList.toggle("active", i === step - 1));
      currentStep = step;
    }
  
    function showStep2() {
      bookingData = {
        departureCity: form.departureCity.value,
        destinationCity: form.destinationCity.value,
        departureDate: form.departureDate.value,
        returnDate: form.returnDate.value,
        tripType: form.tripType.value,
        adults: form.adults.value,
        children: form.children.value,
        infants: form.infants.value,
        travelClass: form.travelClass.value,
        totalPrice: totalPrice.textContent
      };
  
      stepBookingInfo.style.display = "none";
      bookingSummarySection.innerHTML = `
        <div class="card summary-card">
          <h2><i class="fa-solid fa-eye"></i> Review Your Booking</h2>
          <div class="summary-details">
            <div><b>From:</b> ${bookingData.departureCity} <i class="fa-solid fa-arrow-right"></i> <b>To:</b> ${bookingData.destinationCity}</div>
            <div><b>Departure:</b> ${bookingData.departureDate}${bookingData.tripType === "roundtrip" ? ` <b>Return:</b> ${bookingData.returnDate}` : ""}</div>
            <div><b>Passengers:</b> ${bookingData.adults} Adult(s), ${bookingData.children} Child(ren), ${bookingData.infants} Infant(s)</div>
            <div><b>Class:</b> ${bookingData.travelClass}</div>
          </div>
          <div class="summary-total"><span>Total Estimate:</span><span>${bookingData.totalPrice}</span></div>
          <button class="confirm-btn" id="okReviewBtn">Confirm</button>
        </div>
      `;
  
      setStep(2);
      document.getElementById("okReviewBtn").addEventListener("click", showStep3);
    }
  
    async function showStep3() {
      // Save to Firebase
      await firebase.database().ref("bookings").push(bookingData);
      setStep(3);
  
      bookingSummarySection.innerHTML = `
        <div class="card summary-card">
          <h2><i class="fa-solid fa-check-circle" style="color:#21795b"></i> Thank You!</h2>
          <div class="summary-details" style="text-align:center; font-size:1.1rem;">
            Your booking has been received. Have a safe trip!
          </div>
          <a href="home.html" class="confirm-btn" style="margin-top:20px;">Back to Home</a>
        </div>
      `;
    }
  
    confirmBtn.addEventListener("click", e => {
      e.preventDefault();
      showStep2();
    });
  });
  