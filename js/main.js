const API_URL = "https://brandstestowy.smallhost.pl/api/random";

// SELECTORS
// Selects various DOM elements by class or ID for further manipulation
const links = document.getElementsByClassName("link");
const products = document.getElementById("products");
const productFeaturesSection = document.getElementById("product-features");
const ingredientsSection = document.getElementById("ingredients");
const productCardsContainer = document.getElementById(
  "product--cards__container"
);
const threshold = document.getElementById("threshold");
let itemsAmount = document.getElementById("items-amount");
const currentPageCount = document.getElementById("current-page-count");
const dropdownOptions = document.getElementById("dropdown-options");
const dropdownOptionsItems = document.getElementsByClassName("option");
const productDetails = document.getElementById("product__details");
const productId = document.getElementById("product__id");
const productName = document.getElementById("product__name");
const closePopupBtn = document.getElementById("close__popup__btn");
const pagination = document.getElementById("pagination");
const hambugrer = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const bigDogImgContainer = document.getElementById("big-dog-img__container");

// EVENTS: Dropdown Menu Toggle
// Toggles the visibility of dropdown options
itemsAmount.addEventListener("click", () =>
  dropdownOptions.classList.toggle("show")
);

// EVENTS: Mobile Menu Toggle
// Toggles the visibility of the mobile menu
hambugrer.addEventListener("click", toggleMobileMenu);

// OBSERVERS: Setup Intersection Observers
// Observes the visibility of elements and triggers callbacks
const fetchDataObserver = new IntersectionObserver(fetchDataObserverCallback);
const fetchMoreDataObserver = new IntersectionObserver(
  fetchMoreDataObserverCallback
);
const currentSectionObserver = new IntersectionObserver(
  currentSectionObserverCallback
);

// OBSERVERS: Observing Sections
// Monitors specific sections for visibility to enable active link highlighting
const sections = [productFeaturesSection, ingredientsSection, products];
sections.forEach((section) => {
  currentSectionObserver.observe(section);
});

// Attach observer to threshold
fetchMoreDataObserver.observe(threshold);

// VARIABLES: Data and Pagination
// Keeps track of fetched data and pagination state
let data = [];
let pageNumber = 1;
let pageSize = +currentPageCount.textContent;

// FUNCTIONS: Render Data
// Dynamically creates and displays product cards based on fetched data
function renderData() {
  productCardsContainer.innerHTML = ""; // Clear current items before rendering

  data.forEach(({ text, id }) => {
    const view = document.createElement("div");
    view.innerHTML = `
      <h3 class="product__card">ID: ${id}</h3>
    `;
    // Toggle popup for product details
    view.addEventListener("click", () => {
      productId.textContent = `ID: ${id}`;
      productName.textContent = `Nazwa: ${text}`;
      productDetails.classList.add("show");
    });

    // Close popup
    closePopupBtn.addEventListener("click", () =>
      productDetails.classList.remove("show")
    );
    productCardsContainer.appendChild(view);
  });
}

// FUNCTIONS: Fetch Data
// Fetches data from the API and appends it to the data array
let isFetching = false; // Prevent multiple fetches at the same time
async function fetchData(pageNumber, pageSize) {
  if (isFetching) return; // Prevent duplicate calls
  isFetching = true;
  try {
    const response = await fetch(
      `${API_URL}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    const json = await response.json();
    const newData = json.data || []; // Handle cases where data might be undefined

    if (newData.length > 0) {
      data = data.concat(newData); // Append new data to the existing array
      renderData(); // Re-render data
    }
    isFetching = false;
    console.log("data size ", data.length);
  } catch (error) {
    console.log("Error fetching data:", error);
  }
}

// OBSERVER CALLBACK: Fetch Data Observer
// Fetches and renders data when products section is in view
function fetchDataObserverCallback([{ isIntersecting }]) {
  if (!data && isIntersecting)
    fetchData(pageNumber, pageSize).then(() => renderData(data));
}

// OBSERVER CALLBACK: Fetch More Data Observer
// Loads additional data when threshold section is in view
function fetchMoreDataObserverCallback([{ isIntersecting }]) {
  if (isIntersecting) {
    // Fetch additional data when threshold is visible
    fetchData(++pageNumber, pageSize);
  }
}

// EVENTS: Dropdown Option Clicks
// Resets data and fetches new page size
Array.from(dropdownOptionsItems).forEach((item) => {
  item.addEventListener("click", (e) => {
    // Resetting data and UI
    data = [];
    productCardsContainer.innerHTML = ""; // Clear container
    pageNumber = 1; // Reset to the first page
    pageSize = +e.target.textContent; // Set new page size based on selection
    currentPageCount.textContent = pageSize; // Update UI to reflect selection

    // Fetch and render the first set of data
    fetchData(pageNumber, pageSize);
  });
});

// FUNCTIONS: Mobile Menu Toggle
// Toggles the visibility of the mobile menu
function toggleMobileMenu() {
  mobileMenu.classList.toggle("show");
}

// OBSERVER CALLBACK: Current Section Observer
// Highlights active navigation link based on visible section
function currentSectionObserverCallback(entries) {
  entries.forEach(({ isIntersecting, target }) => {
    const id = target.id;
    const correspondingLink = Array.from(links).find(
      (link) => link.getAttribute("href").split("#")[1] === id
    );

    if (isIntersecting) {
      correspondingLink?.classList.add("active");
    } else {
      correspondingLink?.classList.remove("active");
    }
  });
}

// INITIALIZE: Fetch First Set of Data
fetchData(pageNumber, pageSize);
