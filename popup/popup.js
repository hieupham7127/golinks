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
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append("<div>" + item.value + "<br>" + allItems[item.value] + "</div>")
                    .appendTo( ul );
            };
        })
    } catch (e) {
        alert("Failed! Error: " + e.toString());
    }
}
