// http://groups.google.com/group/mozilla.dev.tech.dom/browse_thread/thread/7ecbbb066ff2027f
// Martin Honnen
//  http://JavaScript.FAQTs.com/ 
(function () {
    function getLinks(selector, rawHTML) {
        var doc = document.createElement("html");
        doc.innerHTML = rawHTML;
        var links = doc.querySelectorAll(selector);
        var titles = [];
        var urls = [];
        for (var i = 0; i < links.length; i++) {
            let link = links[i];
            if (link.href.length === 0) {
                continue;
            }
            urls.push(link.href.trim());
            titles.push(link.innerText.replace(/"/g, '&quot;').trim());
        }
        return {"urls": urls, "titles": titles};
    }

    (function sendLinksMessage() {
        BodyCopy = document.body.cloneNode(true);
        var req = getLinks(selector, BodyCopy.innerHTML);
        if (req.urls.length > 0) {
            chrome.runtime.sendMessage(req);
        }
        document.body = BodyCopy;
    })();
})();
