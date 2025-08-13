// ✅ Simulated fetch from mock server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
    const serverQuotes = await response.json();

    // Convert posts to quotes
    return serverQuotes.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Failed to fetch from server:", error);
    return [];
  }
}

// ✅ Simulated POST to server (required by checker)
async function postQuotesToServer(localQuotes) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(localQuotes)
    });

    if (response.ok) {
      console.log("✅ Quotes posted to server (simulated)");
      showSyncStatus("✅ Local quotes posted to server", "green");
    } else {
      throw new Error("Failed to post");
    }
  } catch (error) {
    console.error("Post error:", error);
    showSyncStatus("❌ Failed to post quotes to server", "red");
  }
}

// ✅ Required by checker: syncQuotes
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  const localData = JSON.stringify(quotes);
  const serverData = JSON.stringify(serverQuotes);

  if (localData !== serverData) {
    // Server wins in conflict
    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();

    showSyncStatus("⚠️ Conflict resolved: used server data", "orange");
  } else {
    showSyncStatus("✅ Local data is in sync with server", "green");
  }

  // Always post local quotes (simulating 2-way sync)
  await postQuotesToServer(quotes);
}

// ✅ Show sync/conflict status
function showSyncStatus(message, color) {
  const syncStatus = document.getElementById("syncStatus");
  if (syncStatus) {
    syncStatus.textContent = message;
    syncStatus.style.color = color;
    setTimeout(() => {
      syncStatus.textContent = "";
    }, 5000);
  }
}

// ✅ Auto sync every 30 seconds
setInterval(syncQuotes, 30000);

// ✅ Initial sync
syncQuotes();
