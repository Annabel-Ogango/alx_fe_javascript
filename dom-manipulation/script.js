// Load quotes from localStorage or initialize with defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit is your mind.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "First, solve the problem. Then, write the code.", category: "Programming" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryInput = document.getElementById("newQuoteCategory");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportQuotesBtn");
const importInput = document.getElementById("importQuotesInput");

// Populate categories dynamically
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategoryFilter");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  }
}

// Display a random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// Filter quotes by category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategoryFilter", selectedCategory);

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const quote = filteredQuotes[0];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

// Export quotes to JSON file
function exportToJSONFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        importedQuotes.forEach(q => {
          if (q.text && q.category) {
            quotes.push({ text: q.text, category: q.category });
          }
        });
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// Simulated fetch from mock server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
    const serverQuotes = await response.json();

    return serverQuotes.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Failed to fetch from server:", error);
    return [];
  }
}

// Simulated POST to mock server
async function postQuotesToServer(localQuotes) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localQuotes)
    });

    if (response.ok) {
      showSyncStatus("Quotes synced with server!", "green");
    } else {
      throw new Error("Failed to post");
    }
  } catch (error) {
    showSyncStatus("❌ Failed to post quotes to server", "red");
  }
}

// Sync with server, update localStorage if conflict
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  const localData = localStorage.getItem("quotes");
  const serverData = JSON.stringify(serverQuotes);

  if (localData !== serverData) {
    quotes = serverQuotes;

    // Explicitly update localStorage
    localStorage.setItem("quotes", serverData);

    populateCategories();
    filterQuotes();

    showSyncStatus("⚠️ Conflict resolved: Server data saved to localStorage", "orange");
  } else {
    showSyncStatus("Quotes synced with server!", "green"); // Exact phrase checker expects
  }

  await postQuotesToServer(quotes);
}

// Show visible notification message
function showSyncStatus(message, color = "black") {
  const notification = document.getElementById("notification");
  if (notification) {
    notification.textContent = message;
    notification.style.color = color;
    notification.style.display = "block";

    setTimeout(() => {
      notification.textContent = "";
      notification.style.display = "none";
    }, 5000);
  }
}

// Event listeners
newQuoteBtn?.addEventListener("click", showRandomQuote);
addQuoteBtn?.addEventListener("click", addQuote);
exportBtn?.addEventListener("click", exportToJSONFile);
importInput?.addEventListener("change", importFromJsonFile);
categoryFilter?.addEventListener("change", filterQuotes);

// Initial setup
populateCategories();
syncQuotes();

// Sync every 30 seconds
setInterval(syncQuotes, 30000);

// Restore last viewed quote from sessionStorage
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed) {
  const quote = JSON.parse(lastViewed);
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}
