const golinkInput = document.getElementById("go-link")
const urlInput = document.getElementById("full-link")
const saveButton = document.getElementById("save")
const searchQuery = document.getElementById("search")
const mainSection = document.getElementById("section-main")
const helpSection = document.getElementById("section-help")
const helpBtn = document.getElementById("btn-help")
const homeBtn = document.getElementById("btn-home")
const itemList = document.getElementById("item-list")
const expandSection = document.getElementById("section-expand");
const expandBtn = document.getElementById("btn-expand");
const collapseBtn = document.getElementById("btn-collapse");

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

helpBtn.addEventListener("click", function() {
    mainSection.style.display = "none";
    helpSection.style.display = "block";
    helpBtn.style.display = "none";
    homeBtn.style.display = "block";
});

homeBtn.addEventListener("click", function() {
    mainSection.style.display = "block";
    helpSection.style.display = "none";
    helpBtn.style.display = "block";
    homeBtn.style.display = "none";
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
    const trashIcon = searchEntry.querySelector("#icon-trash");
    searchEntry.querySelector("#url-shortcut").textContent = entry[0];
    searchEntry.querySelector("#url-website").textContent = url;
    searchEntry.querySelector("#icon-website").src = baseURL + url;
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

$(expandBtn).on("click", function() {
    expandSection.style.display = "block";
    this.style.display ="none";
});

$(collapseBtn).on("click", function() {
    expandBtn.style.display = "flex";
    expandSection.style.display = "none";
})
