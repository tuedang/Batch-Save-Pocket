// http://groups.google.com/group/mozilla.dev.tech.dom/browse_thread/thread/7ecbbb066ff2027f
// Martin Honnen
//  http://JavaScript.FAQTs.com/ 
(function()
{
	function getLinks(selector, rawHTML)
	{
		var doc = document.createElement("html");
		doc.innerHTML = rawHTML;
		// var links = doc.getElementsByTagName("a");
		var links = doc.querySelectorAll(selector);
		var titles = [];
		var urls = [];
		for (var i=0; i<links.length; i++) {
			if(links[i].href.length===0) {
				continue;
			}
			urls.push(links[i].href);
            titles.push(links[i].innerText.replace(/"/g, '&quot;'));
		}
		return {"urls" : urls, "titles": titles};
	}
	(function sendLinksMessage()
	{
        BodyCopy = document.body.cloneNode(true);
        var selection = document.body;
		var div = document.createElement('div');
		div.appendChild(selection);
		var vs=div.innerHTML;
		var req = getLinks(selector, vs);
		//console.log(req);
		if(req.urls.length > 0)
		{
			chrome.runtime.sendMessage(req);
		}
        document.body = BodyCopy;
	})();
})();
