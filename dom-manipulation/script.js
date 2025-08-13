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
const categorySelect = document.getElementById("categorySelect"); // for random quote
const categoryFilter = document.getElementById("categoryFilter"); // for filtering
const exportBtn = document.getElementById("exportQuotesBtn");
const importInput = document.getElementById("importQuotesInput");

// Populate both dropdowns from unique categories
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  // Clear and repopulate category filter
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Clear and repopulate quote category select (if used)
  if (categorySelect) {
    categorySelect.innerHTML = `<option value="all">All</option>`;
    uniqueCategories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }

  // Restore last selected filter
  const savedFilter = localStorage.getItem("selectedCategoryFilter");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes(); // Show quotes using saved filter
  }
}

// Show a random quote (used in "Show New Quote" button)
function showRandomQuote() {
  const selectedCategory = categorySelect.value;

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

// ✅ Display all quotes matching the filter
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategoryFilter", selectedCategory); // Save selection

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  // Show the first matching quote
  const quote = filteredQuotes[0];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Add new quote
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

// Export quotes to JSON
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

// Import quotes from uploaded JSON
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

// Event listeners
newQuoteBtn?.addEventListener("click", showRandomQuote);
addQuoteBtn?.addEventListener("click", addQuote);
categorySelect?.addEventListener("change", showRandomQuote);
exportBtn?.addEventListener("click", exportToJSONFile);
importInput?.addEventListener("change", importFromJsonFile);
categoryFilter?.addEventListener("change", filterQuotes);

// Initial setup
populateCategories();

// Restore last viewed quote from sessionStorage
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed) {
  const quote = JSON.parse(lastViewed);
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}
