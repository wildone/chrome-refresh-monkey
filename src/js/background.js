var b = {
    url: "popup.htm",
    homePageUrl: "https://github.com/wildone/chrome-refresh-monkey",
    homePageText: 'Github',

    app: {
        manifest: null,
        manifestFileName: 'manifest.json',
        isNewVersion: false,
        getJson: function (fileName) {
            var json = undefined;
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', chrome.extension.getURL(fileName), false);
                xhr.send(null);
                json = JSON.parse(xhr.responseText);
            } catch (e) {
                json = undefined;
            }
            if (!json) {
                try {
                    json = chrome.app.getDetails();
                } catch (e) {
                }
            }
            return json;
        },
        initManifest: function () {
            if (!this.manifest) {
                this.manifest = this.getJson(this.manifestFileName);
            }
        },
        getExtensionId: function () {
            try {
                var url = chrome.extension.getURL(this.manifestFileName);
                var eid = url.split("/");
                eid = eid[2];
                return eid;
            } catch (e) { }
            this.initManifest();
            if (!this.manifest) return null;
            return this.manifest.id;
        },
        getVersion: function () {
            this.initManifest();
            if (!this.manifest) return null;
            return this.manifest.version;
        },
        getExtensionName: function () {
            this.initManifest();
            if (!this.manifest) return null;
            return this.manifest.name;
        },
        getHomePageUrl: function () {
            this.initManifest();
            if (!this.manifest) return null;
            return this.manifest.homepage_url;
        },
        getExtUrlParam: function (version, isJson = false) {
            var param = {};
            param.eid = this.getExtensionId();

            if (!version) version = this.getVersion();
            param.v = version.toString();

            var name = this.getExtensionName();
            param.name = name;

            var source = this.getSource();
            param.source = source;

            if (isJson) return param;
            return $.param(param);
        }, 
        getSource: function () {
            return b.source;
        }, 
        getUrl: function (urlPage) {
            if (!urlPage) urlPage = this.getHomePageUrl();
            var url = urlPage + "?" + this.getExtUrlParam();
            return url;
        },
        openPage: function (page) { // {url: url, newtab: true }
            if (page.newtab === true) {
                window.open(page.url, "_newtab", "location=1,menubar=1,resizable=1,scrollbars=1,status=1,statusbar=1,titlebar=1,toolbar=1");
            } else {
                try {
                    window.open(page.url, "_blank", "location=1,menubar=1,resizable=1,scrollbars=1,status=1,statusbar=1,titlebar=1,toolbar=1");
                    window.location = page.url;
                } catch (e) { }
                try {
                    location.href = page.url;
                } catch (e) { }
            }
        },
        init: function () {
            var currVersion = this.getVersion();
            var prevVersion = b.ls.version();
            var url = this.getUrl();

            if (currVersion != prevVersion) {
                this.isNewVersion = true;
                if (!url) { url = b.backup.homeUrl; } if (!currVersion) { currVersion = "1.0"; }
                var page = { url: url, version: currVersion, newtab: true };
                //this.openPage(page); // was removed in 1.3 to avoid spamming
                b.ls.version(currVersion);
            } else {
                this.isNewVersion = false;
            }
        }
    },

    ls: {
        init: function () {

        },
        keys: {
            isDisabled: "scroll-button-isDisabled",
            iconPath: "scroll-button-iconPath",
            isContextMenuOn: "scroll-button-isContextMenuOn",
            version: "scroll-button-version"
        },
        defaults: {
            isDisabled: false,
            iconPath: "img/icon19.png",
            isContextMenuOn: true
        },
        isDisabled: function (val) {
            if (typeof val !== 'undefined') {
                localStorage[b.ls.keys.isDisabled] = val;
            }
            var v = localStorage[b.ls.keys.isDisabled];
            if (typeof v === 'undefined') v = b.ls.defaults.isDisabled;
            v = (v === 'true');
            if (typeof val !== 'undefined') b.sendRequest.disable();
            return v;
        },
        iconPath: function (val) {
            if (typeof val !== 'undefined') {
                localStorage[b.ls.keys.iconPath] = val;
            }
            var v = localStorage[b.ls.keys.iconPath];
            if (typeof v === 'undefined') v = b.ls.defaults.iconPath;
            return v;
        },
        isContextMenuOn: function (val) {
            if (typeof val !== 'undefined') {
                localStorage[b.ls.keys.isContextMenuOn] = val;
            }
            var v = localStorage[b.ls.keys.isContextMenuOn];
            if (typeof v === 'undefined') v = b.ls.defaults.isContextMenuOn;
            v = !(v === 'false');
            return v;
        },
        version: function (val) {
            if (typeof val !== 'undefined') {
                localStorage[b.ls.keys.version] = val;
            }
            var v = localStorage[b.ls.keys.version];
            //if (typeof v === 'undefined') v = b.ls.defaults.version;
            return v;
        }
    },

    contextMenu: {
        id: undefined,
        title: "",
        contexts: ["all"],
        create: function (clickHandler) {
            if (b.contextMenu.id !== undefined) return;
            if (typeof clickHandler === 'undefined' || clickHandler === null) {
                b.contextMenu.id = chrome.contextMenus.create({ "title": b.contextMenu.title, "contexts": b.contextMenu.contexts
                });
            } else {
                b.contextMenu.id = chrome.contextMenus.create({ "title": b.contextMenu.title, "contexts": b.contextMenu.contexts,
                    'onclick': clickHandler
                });
            }
            b.ls.isContextMenuOn(true);
            b.contextMenu.addSubButtons();
        },
        remove: function () {
            if (b.contextMenu.id !== undefined) {
                chrome.contextMenus.remove(b.contextMenu.id);
                b.contextMenu.id = undefined;
            }
            b.ls.isContextMenuOn(false);
        },
        init: function (title, clickHandler) {
            b.contextMenu.title = title;
            if (b.ls.isContextMenuOn()) b.contextMenu.create(clickHandler);
            //b.contextMenu.clickHandler = clickHandler;
        },
        addSubButtons: function () {
            //            chrome.contextMenus.create({ "title": "Scroll to Top", "contexts": b.contextMenu.contexts
            //            , "parentId": b.contextMenu.id
            //            , "onclick": b.scrollToTop
            //            });
        }
    },

    browserActions: {
        init: function () {
            chrome.browserAction.onClicked.addListener(function (tab) {
                b.toolButtonClick();
            });
        }
    },

    install: {
        init: function () {
            function onInstall() {
                console.log("Extension Installed");
                //openHomePage();
            }

            function onUpdate() {
                console.log("Extension Updated");
                //openHomePage();
            }

            function openHomePage() {
                chrome.tabs.getAllInWindow(null, function (tabs) {
                    var isHomeTab = false;
                    for (var i = 0, tab; tab = tabs[i]; i++) {
                        if (tab.url === b.homePageUrl) {
                            //chrome.tabs.update(tab.id, { selected: true });
                            isHomeTab = true;
                            break;
                        }
                    }
                    if (!isHomeTab) chrome.tabs.create({ url: b.homePageUrl });
                    chrome.tabs.create({ url: "options.htm" });
                });
            }

            function getVersion() {
                var version = 'NaN';
                var xhr = new XMLHttpRequest();
                xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
                xhr.send(null);
                var manifest = $.parseJSON(xhr.responseText);
                return manifest.version;
            }

            // Check if the version has changed.
            var currVersion = getVersion();
            //var prevVersion = localStorage[b.keyVersion];
            var prevVersion = b.ls.version();
            if (currVersion != prevVersion) {
                // Check if we just installed this extension.
                if (typeof prevVersion == 'undefined') {
                    onInstall();
                } else {
                    onUpdate();
                }
                //localStorage[b.keyVersion] = currVersion;
                b.ls.version(currVersion);
            }
        }
    },

    omniBox: {
        init: function () {
            chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
                //console.log('inputChanged: ' + text);
                suggest([
                        { content: "https://github.com/wildone/chrome-refresh-monkey", description: "Github" }
                    ]);
            });

            chrome.omnibox.onInputEntered.addListener(function (text) {
                b.omniBox.navigate(b.homePageUrl);
            });
        },
        navigate: function (url) {
            chrome.tabs.query({active: true, currentWindow : true}, function(tabs){
                if(!tabs || tabs.length <= 0) return;
                var tab = tabs[0];
            //chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.update(tab.id, { url: url });
            });
        }
    },

    icon: {
        set: function (val) {
            var iconPath = b.ls.iconPath(val);
            chrome.browserAction.setIcon({ path: iconPath });
        },
        get: function () {
            return b.ls.iconPath();
        },
        init: function () {
            b.icon.set();
        }
    },
    
    tag: {
        outerHTML: "",
        obj: undefined,
        init: function (elementSearchKey) {
            b.tag.outerHTML = $($('<div></div>').html($(elementSearchKey).clone())).html();
            b.tag.obj = $(elementSearchKey);
        }
    },

    openOptions: function (info, tab) {
        chrome.tabs.create({ url: "options.htm" });
    },

    ///////////////// Custom to Extensions ///////////////////////////////////////////////////////////////////////////////////////

    sendRequest: {
        init: function (val) { if (typeof val === 'undefined') val = true; },
        disable: function () {
            chrome.windows.getAll({ populate: true }, function (windows) {
                for (var w = 0; w < windows.length; w++) {
                    for (var t = 0; t < windows[w].tabs.length; t++) {
                        var tab = windows[w].tabs[t];
                        chrome.tabs.sendMessage(tab.id, { method: "disable", isDisabled: b.ls.isDisabled() }, function (response) {
                            //if (response.status) { }
                        });
                    }
                }
            });
        }
    },
    receiveRequest: {
        init: function () {
            chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
                if (request.method === "getHTML") {
                    sendResponse({ outerHTML: b.tag.outerHTML, callback: request.callback });
                } else if (request.method === "isDisabled") {
                    var isDisabled = b.ls.isDisabled();
                    sendResponse({ isDisabled: isDisabled });
                } else if (request.method === "opacity") {
                    var o = b.ls.opacity(request.opacity);
                    sendResponse({ opacity: o });
                } else sendResponse({});
            });
        }
    },



    contextMenuClick: function (info, tab) {
        chrome.tabs.create({ url: b.url });
    },

    toolButtonClick: function (info, tab) {
        //Initiate Blackout
        //b.sendRequest.show();
    },

    init: function () {
        //b.tag.init("div#_scroll_button");                             //should be the first thing
        b.ls.init();                                                        // initializes defaults from html obj/tag
        b.browserActions.init();
        //b.contextMenu.init("Cookie Manager", b.contextMenuClick);
        b.icon.init();
        b.install.init();
        b.omniBox.init();

        //b.receiveRequest.init();
        //b.sendRequest.init();
    }
};

var ex = {
    reload: {
        url: '',
        tabId: -1,
        secs: 5,
        //isUrlRefresh: true,
        isTabRefresh: false,
        timerId: null,
        nextTime: new Date(),
        rand: {
            isRandom: false,
            from: 30,       //secs
            to: 30 * 60,    //secs
            getSecs: function () {
                var secs = this.from + Math.random() * (this.to - this.from);
                return secs;
            }
        },
        span: {
            startTime: new Date(),
            endTime: new Date(),
            isStartOn: false,
            isEndOn: false
        },
        isBlockRefresh: false,
        isTabFocusRequired: false,
        //isDoubleClickOn: false,
        monitor: {
            isOn: false,
            selectors: [],
            prev: [],
            curr: [],
            changeHtml: null
        },
        scrollTop: 0,
        isNaviReloadOn: false,
        isStartReloadOn: false,
        refresh: function (tabId) {
            if (!tabId) tabId = ex.currentTabId;
            chrome.tabs.get(tabId, function (tab) {
                var reload = stl.hash.get(tab.id);
                if (!reload) return;
                var isRefresh = true;
                if (reload.span.isEndOn) {
                    var currentTime = new Date();
                    if (currentTime > reload.span.endTime) return;
                }
                if (reload.isTabRefresh) { reload.url = tab.url; }
                if (reload.isTabFocusRequired) { if (ex.currentTabId !== tab.id) isRefresh = false; }
                if (reload.rand.isRandom) reload.secs = reload.rand.getSecs();

                var secs = reload.secs;
                if (reload.span.isStartOn) {
                    var currentTime = new Date();
                    if (currentTime < reload.span.startTime) {
                        secs = (reload.span.startTime - currentTime) / 1000;
                        isRefresh = false;
                    }
                }


                if (isRefresh) {
                    chrome.tabs.reload(reload.tabId, {}, function () { reload.monitorChange(reload.tabId); });
                    //chrome.tabs.update(reload.tabId, { url: reload.url }, function (tab) {
                    //    reload.monitorChange(tab.id);
                    //});
                }

                reload.nextTime = new Date();
                reload.nextTime = reload.nextTime.setTime((new Date()).getTime() + secs * 1000);
                clearTimeout(reload.timerId);
                reload.timerId = setTimeout('ex.reload.refresh(' + tabId + ')', secs * 1000);
            });
        },
        stop: function () {
            clearTimeout(this.timerId);
            this.timerId = null;
            chrome.browserAction.setBadgeText({ text: '', tabId: this.tabId });
            chrome.browserAction.setBadgeBackgroundColor({ color: [0, 0, 0, 0], tabId: this.tabId });
        },
        monitorChange: function (tabId) {
            var reload = stl.hash.get(tabId);
            if (reload) {
                if (reload.monitor.isOn) ex.send.getChange(reload);
            }
        },
        showChange: function (reload, title) {
            var prev = reload.monitor.prev;
            var curr = reload.monitor.curr;

            var changeHtml = '';
            for (var i = 0; i < curr.length; i++) {
                if (prev[i] !== curr[i]) changeHtml += curr[i] + '\n';
            }
            reload.monitor.prev = reload.monitor.curr;
            if (changeHtml.length <= 0) return;
            reload.monitor.changeHtml = changeHtml;

            var havePermission = window.webkitNotifications.checkPermission();
            if (havePermission == 0) { // 0 is PERMISSION_ALLOWED
                var notification = window.webkitNotifications.createNotification(
                  '',
                  'Changed: ' + title,
                    changeHtml +'\n' + reload.url
                );

                notification.onclick = function () {
                    chrome.windows.update(reload.windowId, { focused: true });
                    chrome.tabs.update(reload.tabId, { selected: true });
                    notification.close();
                }
                notification.show();
            } else {
                window.webkitNotifications.requestPermission();
            }

            //var notification = webkitNotifications.createHTMLNotification('notification.htm?tabId=' + reload.tabId);
            //notification.show();
        }
    },
    defaultTime: 5, //secs
    currentTabId: null,
    currentReload: {},
    c: {
        minStr: 'min',
        secStr: 'sec',
        randomStr: 'Random',
        customStr: 'Custom'
    },
    event: {
        start: function (reload) {
            //p = chrome.extension.getViews({ type: 'popup' })[0].p;
            //var reload = ex.reload;
            //var reload = ex.currentReload;
            reload.stop();
            stl.hash.add(reload.tabId, reload);
            reload.refresh(reload.tabId);
            //ex.event.timer.start(); 
            if (stl.hash.length === 1) { ex.event.timer.start(); }
        },
        stop: function () {
            chrome.tabs.query({active: true, currentWindow : true}, function(tabs){
                if(!tabs || tabs.length <= 0) return;
                var tab = tabs[0];
            //chrome.tabs.getSelected(null, function (tab) {
                var reload = stl.hash.get(tab.id);
                if (reload) {
                    reload.stop();
                    stl.hash.remove(reload.tabId);
                }
                if (stl.hash.length === 0) { ex.event.timer.stop(); }

            });
        },
        stopAll: function () {
            var reloads = stl.hash.getAll();
            for (var tabId in reloads) {
                reloads[tabId].stop();
                stl.hash.remove(tabId);
            }
            if (stl.hash.length === 0) { ex.event.timer.stop(); }
        },
        timer: {
            id: null,
            start: function () {
                chrome.tabs.query({active: true, currentWindow : true}, function(tabs){
                if(!tabs || tabs.length <= 0) return;
                var tab = tabs[0];
            //chrome.tabs.getSelected(null, function (tab) {
                    var reload = stl.hash.get(tab.id);
                    if (reload) {
                        if (!isNaN(reload.nextTime)) {
                            var timeLeft = (reload.nextTime - (new Date()).getTime()) / 1000;
                            if (reload.span.isEndOn && reload.span.endTime < new Date()) {
                                chrome.browserAction.setBadgeText({ text: '', tabId: reload.tabId });
                            } else {
                                //if (timeLeft <= 2) ex.send.getScrollTop(reload);
                                var timeLeftText = ex.toTimeFormatHHMMSS(timeLeft);
                                chrome.browserAction.setBadgeText({ text: timeLeftText, tabId: reload.tabId });
                                var hours = parseInt(timeLeft / 3600) % 24;
                                if (hours <= 0) {
                                    chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 100], tabId: reload.tabId });
                                } else {
                                    chrome.browserAction.setBadgeBackgroundColor({ color: [0, 255, 0, 100], tabId: reload.tabId });
                                }
                            }
                        }
                    }
                    ex.event.timer.stop();
                    ex.event.timer.id = setTimeout('ex.event.timer.start();', 1000);
                });
            },
            stop: function () {
                clearTimeout(ex.event.timer.id);
                ex.event.timer.id = null;
            }
        }
    },
    toTimeFormatHHMMSS: function (secs) {
        var hours = Math.ceil(parseInt(secs / 3600) % 24);
        var minutes = Math.ceil(parseInt(secs / 60) % 60);
        var seconds = Math.ceil(secs % 60);
        //var result = (hours < 10 ? "0" + hours : hours) + "-" + (minutes < 10 ? "0" + minutes : minutes) + "-" + (seconds < 10 ? "0" + seconds : seconds);
        var result = minutes + ":" + seconds
        if (hours > 0) result = hours + ":" + minutes;
        return result;
    },
    send: {
        getChange: function (reload) {
            chrome.tabs.sendMessage(reload.tabId, { method: "getChange", selectors: reload.monitor.selectors, tabId: reload.tabId }, function (response) {
                if (typeof response === typeof undefined) return;
                var curr = response.curr;
                var tabId = response.tabId;
                var title = response.title;
                var scrollTop = response.scrollTop;
                if (typeof curr !== 'undefined' && curr.length > 0) {
                    var reload = stl.hash.get(tabId);
                    if (reload) {
                        reload.monitor.curr = curr;
                        ex.reload.showChange(reload, title);
                    }
                }
            });
        },
        getScrollTop: function (reload) {
            chrome.tabs.sendMessage(reload.tabId, { method: "getScrollTop", tabId: reload.tabId }, function (response) {
                if (typeof response === typeof undefined) return;
                var tabId = response.tabId;
                var scrollTop = response.scrollTop;
                var reload = stl.hash.get(tabId);
                if (!reload) {
                    reload = ex.currentReload;
                }
                reload.scrollTop = scrollTop;
            });
        },
        setScrollTop: function (reload) {
            chrome.tabs.sendMessage(reload.tabId, { method: "setScrollTop", scrollTop: reload.scrollTop }, function (response) {

            });
        }
    },
    listen: function () {
        chrome.tabs.onSelectionChanged.addListener(function (tabId, selectInfo) {
            ex.currentTabId = tabId;
            ex.event.timer.start();
        });
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            var reload = stl.hash.get(tabId);
            if (!reload) return;
            //ex.send.setScrollTop(reload);
            if (reload.isTabRefresh) return;
            if (changeInfo.url) {
                if (reload.url !== changeInfo.url) {
                    reload.stop();
                    stl.hash.remove(tabId);
                }
            }
        });
    },
    getReload: function (tabId) {
        return stl.hash.get(tabId);
    },
    createNewReload: function () {
        ex.currentReload = $.extend(true, {}, ex.reload);
        return ex.currentReload;
    },
    loadCurrentReload: function () {
        chrome.tabs.query({active: true, currentWindow : true}, function(tabs){
                if(!tabs || tabs.length <= 0) return;
                var tab = tabs[0];
            //chrome.tabs.getSelected(null, function (tab) {
            var reload = stl.hash.get(tab.id);
            if (!reload) reload = ex.createNewReload();
            ex.currentReload = reload;
            ex.currentReload.tabId = tab.id;
            ex.currentReload.windowId = tab.windowId;
            //ex.send.getScrollTop(ex.currentReload);
            return ex.currentReload;
        });
    },
    init: function () {
        ex.listen();
    }
};


$(document).ready(function () {
    b.init();
    ex.init();
});


