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

function redirectSearchLink(details) {
    let golink = details.url.replace(/(.*)\:\/\/(.*)=go%2F/, "")
    const regex = /%2F/g;
    golink =  golink.replace(regex, "/");
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
    { "urls": ["*://*/*=go%2F*"] },
    ["blocking"],
);
