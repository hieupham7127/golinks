let rulesBox = document.getElementById("rules");

// load the set of rules that exists, if not, []
browser.storage.local.get("rules")
    .then(storage => {
        let rules = storage.rules;
        if (!rules || typeof rules[Symbol.iterator] !== "function") rules = [];
        rulesBox.value = JSON.stringify(rules);
    });

// add the listener on the save button
document.getElementById("save").addEventListener("click", () => {
    try {
        let rules = JSON.parse(rulesBox.value);
        browser.storage.local.set({"rules": rules})
            .then(() => alert("done"));
    } catch (e) {
        alert("error: " + e.toString());
    }
});
