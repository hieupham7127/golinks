// Compatibility layer for browser and chrome namespaces
const currentBrowswer = (typeof browser !== 'undefined') ? browser : chrome;

let local_storage_cache = getLocalStorageData();

// Activate event
self.addEventListener('activate', async () => {
    console.log('Service Worker activating.');
    // Perform activate steps
    await updateRules();
});

async function getLocalStorageData() {
    await currentBrowswer.storage.sync.get(null)
        .then(urlObjs => {
            local_storage_cache = urlObjs;
        });
}

/**
 * Generate redirection rules for go links.
 */
async function getNewRules() {
    let id = 1;
    let rules = [];
    Object.keys(local_storage_cache).forEach(key => {
        // Redirection rule for go/link --> target URL
        let rule = {
            "id": id,
            "priority": 1,
            "action": {
                "type": "redirect",
                "redirect": {
                    "url": local_storage_cache[key].url
                }
            },
            "condition": {
                "regexFilter": `(.*)\:\/\/go\/${key}$`,
                "resourceTypes": ["main_frame"]
            }
        }
        // Redirection rule for the case of being redirected to a search engine
        let rule_search = {
            "id": id + 1,
            "priority": 1,
            "action": {
                "type": "redirect",
                "redirect": {
                    "url": local_storage_cache[key].url
                }
            },
            "condition": {
                "regexFilter": `(.*)\:\/\/(.*)=go%2F${key}&`,
                "resourceTypes": ["main_frame"]
            }
        }
        rules.push(rule,rule_search);
        id += 2
    });
    console.log(rules);
    return rules;
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

currentBrowswer.storage.onChanged.addListener(async () => {
    await getLocalStorageData()
    await updateRules()
});
