const golinkInput = document.getElementById("go-link")
const urlInput = document.getElementById("full-link")
const storedUrl = document.getElementById("stored-url")
const saveButton = document.getElementById("save")

golinkInput.oninput = () => {
    const urlObj = JSON.parse(localStorage.getItem(golinkInput.value))
    if (!urlObj) {
        saveButton.textContent = "Save";
        storedUrl.textContent = "";
    } else {
        saveButton.textContent = "Overwrite";
        storedUrl.textContent = urlObj.url;
    }
};

saveButton.onclick = () => {
    const urlObj = {
        "url": urlInput.value,
        "rules": "Nothing for now"
    };
    try {
        localStorage.setItem(golinkInput.value, JSON.stringify(urlObj));
        saveButton.textContent = "Overwrite";
        alert("Success!")
    } catch (e) {
        alert("Failed! Something went wrong!")
    }
};
