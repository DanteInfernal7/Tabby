(() => {
    let tabsList, listItem;
})();

// Add event listener after DOM content loaded
window.addEventListener("DOMContentLoaded", (event) => { 
    const buttons = document.querySelectorAll('.button-switcher');
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const linkedBoxes = {"autoRearr": "aggrRearr"}
    
    async function restoreOptions (checkboxes) { // Restore settings for extension
        for (let checkbox of checkboxes) { 
            await new Promise((resolve, reject) => { // Promise to ensure that data is loaded before funciton proceeds
                chrome.storage.sync.get(checkbox.id, (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else { // Resolve if data is loaded and update checkbox state
                        checkbox.checked = result[checkbox.id] || false;
                        resolve();
                    }
                });
            });
        }
    };
    
    restoreOptions(checkboxes); // Calling restoreOptions

    // Add listener for each navbar button
    buttons.forEach((button) => { 
        button.addEventListener('click', (event) => {
            const sectionNumber = event.target.getAttribute('data-section');
            showSection(sectionNumber);
        });
    });

    // Listener to accept URL Sort button
    document.getElementById('urlSort').addEventListener('click', async () => { // Async function to sort items based on URL
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            chrome.runtime.sendMessage({tabs: tabs, task: "url"}, function(response) { // Call to background.js
            })
        })
    });

    // Listener to accept Context Sort button
    document.getElementById('contextSort').addEventListener('click', async () => { // Async function to sort items based on Context
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            chrome.runtime.sendMessage({tabs: tabs, task: "context"}, function(response) { // Call to background.js
            })
        })
    });
    
    // Listener to accept Reset Groups button
    document.getElementById('destroyGroups').addEventListener('click', async () => { // Destroy groups
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            chrome.runtime.sendMessage({tabs: tabs, task: "destroy"}) // Call to background.js
        })
    });

    // Function to show the selected section
    function showSection(sectionNumber) {
        const sections = document.querySelectorAll('.section');
        sections.forEach((section) => { // Remove active to collapse each section
            section.classList.remove('active');
        });
        document.getElementById(`section${sectionNumber}`).classList.add('active'); // Activate required section
    }

    // Event listener for each checkbox in options menu
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
            checklinkedBox();
            saveOptions(event);
        });
    });

    // Function to check checkboxes that are depended on each other
    function checklinkedBox(checkbox) {
        
    };

    // Save current option settings into Chrome Storage
    function saveOptions (event) {
        let obj = {};
        obj[event.target.id] = event.target.checked;
        chrome.storage.sync.set(obj, () => {
        });
    }
});


  