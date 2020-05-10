function redirectGoLink(link) {
    let golink = link.url.replace(/(.*)\:\/\/go\//, "");
    
    console.log("golink: ", golink);
    
    const urlObj = JSON.parse(localStorage.getItem(golink));
    if (!urlObj) {
        return;
    }
    
    return { "redirectUrl": urlObj.url };
}

browser.webRequest.onBeforeRequest.addListener(
    redirectGoLink,
    { "urls": ["*://go/*"] },
    ["blocking"],
);