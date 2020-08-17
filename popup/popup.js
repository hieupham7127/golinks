const golinkInput = document.getElementById("go-link")
const urlInput = document.getElementById("full-link")
const saveButton = document.getElementById("save")
const searchQuery = document.getElementById("search")
const mainDiv = document.getElementById("main")
const helpDiv = document.getElementById("help")
const helpButton = document.getElementById("help-btn")
const homeButton = document.getElementById("home-btn")
const itemList = document.getElementById("item-list")
const addSection = document.getElementById("add-section");
const addEntry = document.getElementById("add");

golinkInput.oninput = async () => {
    const golink = golinkInput.value
    let urlObj = await browser.storage.sync.get(golink)
    if (!urlObj[golink]) {
        saveButton.textContent = "Save";
        storedUrl.style.display = "none";
        return;
    }
    saveButton.textContent = "Overwrite";
};

saveButton.onclick = () => {
    const golink = golinkInput.value
    let urlObj = {}
    urlObj[golink] = {
        "url": urlInput.value,
        "rules": "Nothing for now"
    };
    try {
        browser.storage.sync.set(urlObj)
            .then(() => {
                alert("Success!");
                golinkInput.oninput()
            });
    } catch (e) {
        alert("Failed! Error: " + e.toString());
    }
};

browser.tabs.query({'active': true, 'lastFocusedWindow': true, 'currentWindow': true})
    .then(tabs => urlInput.value = tabs[0].url);

helpButton.addEventListener("click", function() {
    mainDiv.style.display = "none";
    helpDiv.style.display = "block";
    helpButton.style.display = "none";
    homeButton.style.display = "block";
});

homeButton.addEventListener("click", function() {
    mainDiv.style.display = "block";
    helpDiv.style.display = "none";
    helpButton.style.display = "block";
    homeButton.style.display = "none";
});

async function getAllEntries() {
    try {
        await browser.storage.sync.get(null)
        .then(items => {
            const entries = Object.entries(items);
            let allItems = {};
            entries.forEach(entry => {
                console.log(entry);
                allItems[entry[0]] = entry[1].url;
                const searchEntry = createEntry(entry);
                $(searchEntry).appendTo(itemList);
            });
        })
    } catch (e) {
        alert("Failed! Error: " + e.toString());
    }
}

function createEntry(entry) {
    const template = document.getElementById("autocomplete");
    const baseURL = "https://www.google.com/s2/favicons?sz=64&domain_url=";
    let searchEntry = template.content.cloneNode(true);
    const url = entry[1].url;
    const trashIcon = searchEntry.querySelector("#trash-icon");
    searchEntry.querySelector("#shortcut").textContent = entry[0];
    searchEntry.querySelector("#url").textContent = url;
    searchEntry.querySelector("#icon").src = baseURL + url;
    searchEntry.querySelector("li").addEventListener("click", function() {
        browser.tabs.create({active: true, url: url});
    });
    searchEntry.querySelector("li").addEventListener("mouseover", function() {
        trashIcon.style.display = "block";
    });
    searchEntry.querySelector("li").addEventListener("mouseleave", function() {
        trashIcon.style.display = "none";
    });
    trashIcon.addEventListener("click", function(event) {
        let response = confirm("Delete shortcut " + entry[0] + "?");
        if (response) {
            browser.storage.sync.remove(entry[0]);
        }
        event.stopPropagation();
    });
    return searchEntry;
}

$(document).ready(getAllEntries());

browser.storage.onChanged.addListener(() => {
    $(itemList).empty();
    getAllEntries()
});

$(document).ready(function(){
    $(searchQuery).on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#item-list li").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
});

$("#add").on("click", function() {
    addSection.style.display = "block";
    this.style.display ="none";
});

$("#minus-button").on("click", function() {
    addEntry.style.display = "flex";
    addSection.style.display = "none";
})
