let local_storage_cache = getLocalStorageData();

async function getLocalStorageData() {
    await browser.storage.sync.get(null)
        .then(urlObjs => {
            local_storage_cache = urlObjs;
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

browser.storage.onChanged.addListener(() => getLocalStorageData());

browser.webRequest.onBeforeRequest.addListener(
    redirectGoLink,
    { "urls": ["*://go/*"] },
    ["blocking"],
);

browser.webRequest.onBeforeRequest.addListener(
    redirectSearchLink,
    { "urls": ["*://*.google.com/*=go%2F*", "*://*.yahoo.com/*=go%2F*", "*://*.bing.com/*=go%2F*", "*://*.duckduckgo.com/*=go%2F*", "*://*.ecosia.org/*=go%2F*", "*://*.baidu.com/*=go%2F*"] },
    ["blocking"],
);
