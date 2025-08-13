// ✅ Simulate fetching quotes from a "server"
async function fetchQuotesFromServer() {
  try {
    // Simulated fetch (you can replace this URL with a real endpoint or mock API)
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
    const serverQuotes = await response.json();

    // Simulate mapping server "posts" to quotes
    return serverQuotes.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Failed to fetch server data:", error);
    return [];
  }
}

// ✅ Sync local quotes with server data
async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();

  // Simple conflict check: if number of quotes or first quote is different
  const localData = JSON.stringify(quotes);
  const serverData = JSON.stringify(serverQuotes);

  if (localData !== serverData) {
    quotes = serverQuotes; // Server wins
    saveQuotes();
    populateCategories();
    filterQuotes();

    // Show sync message
    showSyncStatus("⚠️ Conflict resolved using server data", "orange");
  } else {
    showSyncStatus("✅ Local data is already in sync with server", "green");
  }
}

// ✅ Show sync/conflict status message
function showSyncStatus(message, color) {
  const syncStatus = document.getElementById("syncStatus");
  if (syncStatus) {
    syncStatus.textContent = message;
    syncStatus.style.color = color;

    // Hide after 5 seconds
    setTimeout(() => {
      syncStatus.textContent = "";
    }, 5000);
  }
}

// ✅ Periodically sync every 30 seconds (for simulation)
setInterval(syncWithServer, 30000);

// ✅ Initial sync on page load
syncWithServer();
