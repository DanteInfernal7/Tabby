(() => {
    let tabsList, listItem;
})();

window.addEventListener("DOMContentLoaded", (event) => { // Add event listener after DOM content loaded
    
    document.getElementById('urlSort').addEventListener('click', async () => { // Async function to sort items based on URL
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            chrome.runtime.sendMessage({tabs: tabs, task: "url"}, function(response) { // Call to background.js
            })
        })
    });

    document.getElementById('contextSort').addEventListener('click', async () => { // Async function to sort items based on Context
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            chrome.runtime.sendMessage({tabs: tabs, task: "context"}, function(response) { // Call to background.js
            })
        })
    });

    document.getElementById('destroyGroups').addEventListener('click', async () => { // Destroy groups
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            chrome.runtime.sendMessage({tabs: tabs, task: "destroy"}) // Call to background.js
        })
    });
});


  