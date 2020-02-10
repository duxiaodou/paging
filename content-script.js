var currentPage = 1;
var prevPageNode = null;
var nextPageNode = null;
var paginator = null;

/*
    获取分页
 */
function getPaginator() {
  return Array.prototype.slice.call(document.querySelectorAll('div')).filter(function (el) { 
    return el.className && el.className.match(/paginator|pager/);
  });
}

/*
    解析页码
 */
function parsePages(pages) {
    var prevPage = null;
    var nextPage = null;
    for (var i = 0; i < pages.length-2; i++) {
        prevPage = parseInt(pages[i].text);
        nextPage = parseInt(pages[i+2].text);
        if( prevPage != NaN && nextPage != NaN ) {
            if (prevPage+3 == nextPage ) {
                currentPage = prevPage+2;
                prevPageNode = pages[i+1];
                nextPageNode = pages[i+2];
                break;
            } else if ( pages[i+1].href == '' ) {
                currentPage = prevPage+1;
                prevPageNode = pages[i];
                nextPageNode = pages[i+2];
            }
        }
    }
}

/*
    同步扩展状态
 */
function syncExtensionStatus() {
    if (prevPageNode || nextPageNode) {
        chrome.runtime.sendMessage({action: 'setStatus', value: 'ok'}, function(response) {
            console.log(response);
        });
    } else {
        chrome.runtime.sendMessage({action: 'setStatus', value: 'no'}, function(response) {
            console.log(response);
        });
    }
}

/*
    解析
 */
function parse() {
    chrome.runtime.sendMessage({action: 'getSite', value:document.domain}, function(siteConfig) {
        console.log(document.domain);
        console.log(siteConfig);
        if (siteConfig) {
            paginator = document.querySelector(siteConfig.seletor);
        } else {
            paginator = getPaginator()[0];
        }
        if (siteConfig && siteConfig.currentPageSeletor) {
                var currentPageNode = document.querySelector(siteConfig.currentPageSeletor);
                if (siteConfig.isCurrentPageUpward) {
                    currentPageNode = currentPageNode.parentNode;
                }
                if (currentPageNode == null) {
                    chrome.runtime.sendMessage({action: 'setStatus', value: 'no'}, function(response) {
                        console.log(response);
                    });
                    return ;
                }
                if (currentPageNode.previousElementSibling) {
                    if (siteConfig.adjoinPageSeletor) {
                        prevPageNode = currentPageNode.previousElementSibling.querySelector(siteConfig.adjoinPageSeletor);
                    } else {
                        prevPageNode = currentPageNode.previousElementSibling;
                    }
                }
                if (currentPageNode.nextElementSibling) {
                    if (siteConfig.adjoinPageSeletor) {
                        nextPageNode = currentPageNode.nextElementSibling.querySelector(siteConfig.adjoinPageSeletor);
                    } else {
                        nextPageNode = currentPageNode.nextElementSibling;
                    }
                }

        } else {
            parsePages(paginator.querySelectorAll('a'));
        }
        syncExtensionStatus();
        console.log(prevPageNode, nextPageNode);
    });
}



document.addEventListener('keydown', function(event)
{
    if (event.which === 188 || event.which === 190) {
        if (event.which === 188 && prevPageNode) {
            prevPageNode.click();
        }
        if (event.which === 190 && nextPageNode) {
            nextPageNode.click();
        }
        parse();
    }
});


window.addEventListener('load', function()
{
    parse();
});