let local_storage_cache = getLocalStorageData();

async function getLocalStorageData() {
    await browser.storage.sync.get(null)
        .then(urlObjs => {
            local_storage_cache = urlObjs;
        });
}

async function getNewRules() {
    let id = 1
    let rules = []
    local_storage_cache.forEach(([key, value]) => {
        let rule = {
            "id": id,
            "priority": 1,
            "action": {
                "type": "redirect",
                "redirect": {
                    "url": value.url
                }
            },
            "condition": {
                "regexFilter": `(.*)\:\/\/go\/${key}`,
                "resourceTypes": ["main_frame"]
            }
        }
        let rule_search = {
            "id": id + 1,
            "priority": 1,
            "action": {
                "type": "redirect",
                "redirect": {
                    "url": value.url
                }
            },
            "condition": {
                "regexFilter": `(.*)\:\/\/(.*)=go%2F${key}`,
                "resourceTypes": ["main_frame"]
            }
        }
        rules.push(rule, rule_search)
        id += 2
    });
}

async function updateRules() {
    // Get arrays containing new and old rules
    const newRules = await getNewRules();
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map(rule => rule.id);

    // Use the arrays to update the dynamic rules
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: newRules
    });
}

function redirectGoLink(details) {
    const golink = details.url.replace(/(.*)\:\/\/go\//, "");
    if (!local_storage_cache[golink]) {
        return;
    }
    return {redirectUrl: local_storage_cache[golink].url}
}

/**
 * Extract the go link from the search link and redirect to the user's stored website if exists.
 */
function redirectSearchLink(details) {
    let golink = details.url.replace(/(.*)\:\/\/(.*)=go%2F/, "")
    // Global flag g is included to replace all "%2F" with "/"
    golink = golink.replace(/%2F/g, "/");

    // Remove trailing query string content of the search link
    // Yahoo: &fr=opensearch, Ecosia: &addon=opensearch
    golink = golink.replace(/\&fr=opensearch|\&addon=opensearch/, "")

    if (!local_storage_cache[golink]) {
        return;
    }
    return {redirectUrl: local_storage_cache[golink].url}
}

browser.storage.onChanged.addListener(async () => {
    await getLocalStorageData()
    await updateRules()
});

// browser.webRequest.onBeforeRequest.addListener(
//     redirectGoLink,
//     { "urls": ["*://go/*"] },
//     ["blocking"],
// );

// browser.webRequest.onBeforeRequest.addListener(
//     redirectSearchLink,
//     { "urls": ["*://*.google.com/*=go%2F*", "*://*.yahoo.com/*=go%2F*", "*://*.bing.com/*=go%2F*", "*://*.duckduckgo.com/*=go%2F*", "*://*.ecosia.org/*=go%2F*", "*://*.baidu.com/*=go%2F*"] },
//     ["blocking"],
// );
