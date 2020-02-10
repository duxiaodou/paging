var sites = null;

// 获取站点配置
chrome.runtime.getPackageDirectoryEntry(function(root) {
  root.getFile('data/sites.json', {}, function(fileEntry) {
    fileEntry.file(function(file) {
      var reader = new FileReader();
      reader.onloadend = function(e) {
        sites = JSON.parse(this.result);
      };
      reader.readAsText(file);
    });
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    var value = request.value;
    var response = null;
    switch (request.action) {
        case 'setStatus':
            chrome.browserAction.setBadgeText({text: value});
            if (value == 'ok') {
                chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 220, 200]});
            } else {
                chrome.browserAction.setBadgeBackgroundColor({color: [220, 0, 0, 200]});
            }
            break;
        case 'getSite':
            response = getSiteConfig(value);
            break;

    }
    sendResponse(response);
});


function getSiteConfig(domain) {
    return sites[domain];
}