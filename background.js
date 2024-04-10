sites = new Set();

// Returns the short URL for the specified tab and adds URL to the set of all URLs
function fetchURL(input) { 
  let urlObj = new URL(input);
  sites.add(String(urlObj.hostname));
  return String(urlObj.hostname);
};

// Create Tab Group from grouped IDs
async function createTabGroups(groupedIDS, site) { 
  console.log("groupedIDS", groupedIDS)
  await chrome.tabs.group({ tabIds: groupedIDS }, function(group) { // Await for group  to be created
    console.log(group);
    moveGroups(group);
    console.log("Created new group", group); //remove
    //updateGroupInfo(group, site);
  });
  return true;
};

// Update Tab Group details :: TODO: Modify to generic class to update tab name
function updateGroupInfo(groupID, site) { 
  let groupName = site; 
  chrome.tabGroups.update(groupID, { title: groupName}, function(updatedGroup) {
    console.log("Updated group", updatedGroup);
  });
};

// Remove tabs from groups
function destroyGroups(input) { 
  if (typeof input == "object") { // Pass input as tab objects and ungroup all tabs in group
    input.forEach(tab => {
      chrome.tabs.ungroup(tab.id , function() {
        console.log("Ungrouped tabs");
      });
    });
  }
  
  if (typeof input == "number") { // Pass input as tab number and ungroup individually from group
    chrome.tabs.ungroup(input , function() { 
      console.log("Ungrouped tabs");
    })
  }
};

// Move groups to 0 index
function moveGroups(groupID) {  
    chrome.tabGroups.move(groupID, {index: 0}, function(tabGroup) {
      console.log("Moved group", tabGroup);
    });
};

// Grouping tabs with the same shortURL into a array of objects
function groupTabs(tabInput) { 
  for (let site of sites) { // Loop over list of unique sites
    let groupedIDS = [];
    for (let tab of tabInput) { // Loop over list of open tabs
      let id = tab.id;
      let shorturl = tab.shorturl; 
      if (shorturl == site) { // If url of new tab already exists in another tab add it to list
        groupedIDS.push(id);
      }
    }
    if (groupedIDS.length > 1) { // If tab is not unique add it to group or create new group
      groupID = createTabGroups(groupedIDS, site);
    }
  };
};

// Adding tab to target group
async function addNewTabtoGroup(targetGroupID, newTabID) {
  await chrome.tabs.group({ groupId: targetGroupID, tabIds: newTabID });
};

// Assign tab position based on condition
function assignNewTab(newTabDetails) {
  let allGroupTabs = {};
  let newTabID = newTabDetails.tabId;
  let newTabURL = fetchURL(newTabDetails.url);
  chrome.tabs.query({ currentWindow: true}, function (tabs) { // Compare new tab URL with each tab URL and group into dict
    tabs.forEach(tabs => {
      tabs.shorturl = fetchURL(tabs.url);
      if (newTabURL == tabs.shorturl) {
        let tab = tabs.id;
        allGroupTabs[tab] =  tabs.groupId;
      }
    });
    let groupIDs = Object.values(allGroupTabs);
    let tabIDs = Object.keys(allGroupTabs);

    if (groupIDs.some(value => value !== -1)) { // Reposition tab to old group or different group
      let targetGroupID = groupIDs.filter(value => value !== -1);
      addNewTabtoGroup(targetGroupID[0], newTabID);
    }

    else if (groupIDs.length > 1) { // Group with other single tabs
      tabIDs = tabIDs.map(Number);
      createTabGroups(tabIDs, newTabURL);
    }
  })
};

// Retrieve specified storage value based on key
const getStorageOption = async (key) => { 
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function(result) {
      if (result[key] === undefined) {
        reject();
      } else {
        return resolve(result[key]);
      }
    });
  });
};

// Listener for tab change events
chrome.webNavigation.onCommitted.addListener((newTabDetails) => { 
  if (newTabDetails.frameId === 0) {
    getStorageOption("autoRearr").then((data) => { // Check if Auto Rearrange is enabled
      console.log('Data: ' + data);
      if (data == true) { 
        destroyGroups(newTabDetails.tabId);
        assignNewTab(newTabDetails);
      }
    })
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { // Listen for messages from popup.js
  let tabsArray = request.tabs;
  console.log(tabsArray);

  if (request.task === "url") { // Sort based on the URL
    tabsArray.forEach(tabsArray => {
    tabsArray.shorturl = fetchURL(tabsArray.url);
    });
    results = groupTabs(tabsArray)
  }

  else if (request.task === "context") { // Sort based on the Context
    try {

    }

    catch (error) {
      console.log(error);
    }

  }

  else if (request.task === "destroy") { // Sort based on the Context
    destroyGroups(tabsArray);
  }
  
  else if (request.task === "sort") {

  }
});


