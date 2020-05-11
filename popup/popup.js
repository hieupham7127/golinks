const golinkInput = document.getElementById("go-link")
const urlInput = document.getElementById("full-link")
const storedUrl = document.getElementById("stored-url")
const saveButton = document.getElementById("save")

golinkInput.oninput = async () => {
    const golink = golinkInput.value
    let urlObj = await browser.storage.local.get(golink)
    if (!urlObj[golink]) {
        saveButton.textContent = "Save";
        storedUrl.textContent = "";
        return;
    }
    saveButton.textContent = "Overwrite";
    storedUrl.textContent = urlObj[golink].url;
};

saveButton.onclick = () => {
    const golink = golinkInput.value
    let urlObj = {}
    urlObj[golink] = {
        "url": urlInput.value,
        "rules": "Nothing for now"
    };
    try {
        browser.storage.local.set(urlObj)
            .then(() => {
                alert("Success!");
                golinkInput.oninput()
            });
    } catch (e) {
        alert("Failed! Error: " + e.toString());
    }
};
