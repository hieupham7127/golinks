const golinkInput = document.getElementById("go-link")
const urlInput = document.getElementById("full-link")
const storedUrl = document.getElementById("stored-url")
const saveButton = document.getElementById("save")
const searchQuery = document.getElementById("search")

golinkInput.oninput = async () => {
    const golink = golinkInput.value
    let urlObj = await browser.storage.sync.get(golink)
    if (!urlObj[golink]) {
        saveButton.textContent = "Save";
        storedUrl.style.display = "none";
        return;
    }
    saveButton.textContent = "Overwrite";
    storedUrl.textContent = urlObj[golink].url;
    storedUrl.title = urlObj[golink].url;
    storedUrl.style.display = "";
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

searchQuery.onkeyup = () => {
    const template = document.getElementById("autocomplete");
    const baseURL = "https://www.google.com/s2/favicons?sz=64&domain_url=";
    try {
        browser.storage.sync.get(null)
        .then(items => {
            let keys = Object.keys(items);
            const entries = Object.entries(items);
            let allItems = {};
            entries.forEach(entry => {
                allItems[entry[0]] = entry[1].url;
            });
            $("#search").autocomplete({
                source: keys,
            })
            .autocomplete("instance")._renderItem = function (ul, item) {
                let searchEntry = template.content.cloneNode(true);
                const url = allItems[item.value];
                searchEntry.querySelector("#shortcut").textContent = item.value;
                searchEntry.querySelector("#url").textContent = url;
                searchEntry.querySelector("#icon").src = baseURL + url;
                searchEntry.querySelector("li").addEventListener("click", function() {
                    browser.tabs.create({active: true, url: url});
                });
                return $(searchEntry)
                    .appendTo( ul );
            };
        })
    } catch (e) {
        alert("Failed! Error: " + e.toString());
    }
}
