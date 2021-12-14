var _refresh_monkey = (function () {
    var c = {
        receive: {
            init: function () {
                chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                    //chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
                    if (request.method === "getChange") {
                        var selectors, curr = [];
                        selectors = request.selectors;
                        for (var i = 0; i < selectors.length; i++) {
                            //                            var id = selectors[i];
                            //                            var obj = $(selectors[i]);
                            //                            var html = obj.html();
                            //                            var txt = obj.text();
                            //                            var obj1 = $('table b span');
                            //                            var obj3 = $('span#yfs_l10_\\^bsesn');
                            curr[i] = $(selectors[i]).text();
                        }
                        //document.getElementsByTagName('body')[0].scrollTop = request.scrollTop;
                        //var scrollTop = $('body').scrollTop();
                        sendResponse({ tabId: request.tabId, curr: curr, title: document.title });
                    } else if (request.method === 'getScrollTop') {
                        var scrollTop = $('body').scrollTop();
                        sendResponse({ tabId: request.tabId, scrollTop: scrollTop });
                    } else if (request.method === 'setScrollTop') {
                        $('html, body').animate({ scrollTop: request.scrollTop }, 'fast');                        
                    } else sendResponse({});
                });
            }
        },
        init: function () {
            this.receive.init();
        }
    };

    $(document).ready(function () {
        c.init();
    });

    return c;
})(jQuery);

