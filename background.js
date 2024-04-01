sites = new Set();

chrome.webNavigation.onCommitted.addListener((newTabDetails) => {
  if (newTabDetails.frameId === 0) {
    assignNewTab(newTabDetails);
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

  return true;
});

function fetchURL(input) { // Returns the short URL for the specified tab and adds URL to the set of all URLs
  let urlObj = new URL(input);
  sites.add(String(urlObj.hostname));
  return String(urlObj.hostname);
};
async function createTabGroups(groupedIDS, site) { // Create Tab Group from grouped IDs
  console.log("groupedIDS", groupedIDS)
  await chrome.tabs.group({ tabIds: groupedIDS }, function(group) {
    console.log(group);
    moveGroups(group);
    console.log("Created new group", group); //remove
    //updateGroupInfo(group, site);
  });
};

function updateGroupInfo(groupID, site) { // Update Tab Group name
  let groupName = site; 
  chrome.tabGroups.update(groupID, { title: groupName}, function(updatedGroup) {
    console.log("Updated group", updatedGroup);
  });
};

function destroyGroups(input) { // Remove all tab groups
  input.forEach(tab => {
    chrome.tabs.ungroup(tab.id , function() {
      console.log("Ungrouped tabs");
    });
  });
};

async function moveGroups(groupID) {  // Move groups to 0 index
  try {
    await chrome.tabGroups.move(groupID, {index: 0}, function(tabGroup) {
      console.log("Moved group", tabGroup);
    });
  } catch (error) {
    console.log("Error while making group", error);
  }
};

function groupTabs(tabInput) { // Grouping tabs with the same shortURL into a array of objects
  for (let site of sites) {
    let groupedIDS = [];
    for (let tab of tabInput) {
      let id = tab.id;
      let shorturl = tab.shorturl;
      if (shorturl == site) {
        groupedIDS.push(id);
      }
    }
    if (groupedIDS.length > 1) {
      groupID = createTabGroups(groupedIDS, site);
    }
  };
};

async function addNewTabtoGroup(targetGroupID, newTabID) {
  await chrome.tabs.group({ groupId: targetGroupID, tabIds: newTabID });
};

function assignNewTab(newTabDetails) {
  let allGroupTabs = {};
  let newTabID = newTabDetails.tabId;
  let newTabURL = fetchURL(newTabDetails.url);
  chrome.tabs.query({ currentWindow: true}, function (tabs) {
    tabs.forEach(tabs => {
      tabs.shorturl = fetchURL(tabs.url);
      if (newTabURL == tabs.shorturl) {
        let tab = tabs.id;
        allGroupTabs[tab] =  tabs.groupId;
      }
    });
    console.log(allGroupTabs);
    let groupIDs = Object.values(allGroupTabs);
    let tabIDs = Object.keys(allGroupTabs);

    if (groupIDs.some(value => value !== -1)) {
      let targetGroupID = groupIDs.filter(value => value !== -1);
      console.log(targetGroupID+ " " + newTabID + " " + newTabURL);
      addNewTabtoGroup(targetGroupID[0], newTabID);
    }

    else if (groupIDs.length > 1) {
      tabIDs = tabIDs.map(Number);
      console.log("tabIDs ", tabIDs)
      createTabGroups(tabIDs, newTabURL);
    }
  })
};
