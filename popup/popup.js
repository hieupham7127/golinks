const golinkInput = document.getElementById("go-link")
const urlInput = document.getElementById("full-link")
const saveButton = document.getElementById("save")
const searchQuery = document.getElementById("search")
const mainSection = document.getElementById("section-main")
const helpSection = document.getElementById("section-help")
const helpBtn = document.getElementById("btn-help")
const itemList = document.getElementById("item-list")
const expandSection = document.getElementById("section-expand");
const expandBtn = document.getElementById("btn-expand");
const collapseBtn = document.getElementById("btn-collapse");
const fileInput = document.getElementById("btn-upload");
const downloadButton = document.getElementById("btn-download");

golinkInput.oninput = async () => {
    const golink = golinkInput.value
    let urlObj = await browser.storage.sync.get(golink)
    if (!urlObj[golink]) {
        saveButton.textContent = "Save";
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
    browser.tabs.create({active: true, url: "https://github.com/hieupham7127/golinks#user-guide-to-go-links"});
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

downloadButton.onclick = function() {
    const data = {};
    try {
        browser.storage.sync.get(null)
        .then(items => {
            const entries = Object.entries(items);
            entries.forEach(entry => {
                data[entry[0]] = entry[1].url;
            });
            save(data);
        })
    } catch (e) {
        alert("Failed! Error: " + e.toString());
    }
};

function save(data) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {
      type: "text/plain"
    }));
    a.setAttribute("download", "golinks.txt");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

fileInput.onchange = () => {
    const files = fileInput.files;
    if (files.length > 0) {
        const curFile = files.item(0);
        curFile.text().then(async text => {
            const data = JSON.parse(text);
            var golink;
            for (golink in data) {
                let urlObj = await browser.storage.sync.get(golink);
                // Save new golinks or overwrite existing golinks
                if (!urlObj[golink] || (urlObj[golink].url != data[golink])) {
                    let newUrlObj = {}
                    newUrlObj[golink] = {
                        "url": data[golink],
                        "rules": "Nothing for now"
                    };
                    try {
                        browser.storage.sync.set(newUrlObj)
                    } catch (e) {
                        alert("Failed! Error: " + e.toString());
                    }
                }
            }
        });
    }
}
