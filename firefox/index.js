function callback(details) {
    console.log("shiet", details);
    return browser.storage.local.get("rules")
        .then(storage => {
            let rules = storage.rules;

            // if there's no rules, allow the request through
            // https://stackoverflow.com/a/32538867
            if (!rules || typeof rules[Symbol.iterator] !== "function") return;

            let url = details.url.replace(/(.*)\:\/\/go\//, "");
            console.log("url: ", url);

            // otherwise, loop through the rules and try to apply them
            for (let [pattern, repl] of rules) {
                console.log("checking:", url, pattern, url.match(pattern));
                if (url.match(pattern)) {
                    return { "redirectUrl": repl };
                }
            }

            // nothing was matched, just let the original request through
            return;
        });
}

browser.webRequest.onBeforeRequest.addListener(
    callback,
    { "urls": ["*://go/*"] },
    ["blocking"],
);

console.log(browser.webRequest.onBeforeRequest.hasListener(callback));
