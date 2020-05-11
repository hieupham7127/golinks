async function redirectGoLink(details) {
    const golink = details.url.replace(/(.*)\:\/\/go\//, "");
    console.log("golink: ", golink);
    
    let urlObj = await browser.storage.local.get(golink)
    if (!urlObj[golink]) {
        return;
    }
    return {redirectUrl: urlObj[golink].url};
}

browser.webRequest.onBeforeRequest.addListener(
    redirectGoLink,
    { "urls": ["*://go/*"] },
    ["blocking"],
);
