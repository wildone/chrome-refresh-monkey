var p = {
    b: {},
    ex: {},
    v: {
        isInitSelector: false
    },

    s: {
        aStopAll: '#aStopAll', aStop: '#aStop',
        aReloadEverySecs: 'div#reloadEvery ul a',
        aRandom: '#aRandom', tRandomStartSecs: '#tRandomStartSecs', tRandomEndMins: '#tRandomEndMins',
        aCustom: '#aCustom', tCustomSecs: '#tCustomSecs',
        tDefaultSecs: '#tDefaultSecs',
        rTab: '#rTab', rUrl: '#rUrl',
        aReloadAllTabs: '#aReloadAllTabs', aReloadAllWindows: '#aReloadAllWindows',
        cStart: '#cStart', tStart: '#tStart', cEnd: '#cEnd', tEnd: '#tEnd',
        cBlockRefresh: '#cBlockRefresh', cTabFocus: '#cTabFocus', cDoubleClick: '#cDoubleClick',
        dUrl: '#dUrl', aUrl_nu: '#aUrl_nu', dUrl_nu: '#dUrl_nu',
        cMonitor_nu: '#cMonitor_nu', dMonitor_nu: '#dMonitor_nu', dSelector_nu_ns: '#dSelector_nu_ns', cSelector_nu_ns: '#cSelector_nu_ns', tSelector_nu_ns: '#tSelector_nu_ns', cSelectorPre: '#cSelector', tSelectorPre: '#tSelector',
        cOnNavi_nu: '#cOnNavi_nu', cOnStart_nu: '#cOnStart_nu'
    },
    event: {
        attach: function () {
            $(p.s.aReloadEverySecs).click(p.event.reloadButton_click);
            $(p.s.aCustom).click(p.event.reloadButton_click);
            $(p.s.aRandom).click(p.event.reloadButton_click);
            $(p.s.aStop).click(p.event.aStop_click);
            $(p.s.aStopAll).click(p.event.aStopAll_click);
            $(p.s.aReloadAllTabs).click(function () { p.event.reloadAllTabs_click(); });
            $(p.s.aReloadAllWindows).click(function () { p.event.reloadAllWindows_click(); });
            $(p.s.tDefaultSecs).change(function () { p.event.defaultSecs_change(); });

            $(p.s.rTab).click(p.event.rTabOrUrl_click);
            $(p.s.rUrl).click(p.event.rTabOrUrl_click);
            $(p.s.cStart).click(p.event.cStart_click);
            $(p.s.tStart).change(p.event.tStart_change);
            $(p.s.cEnd).click(p.event.cEnd_click);
            $(p.s.tEnd).change(p.event.tEnd_change);
            $(p.s.cTabFocus).click(p.event.cTabFocus_click);
            //            $(p.s.cBlockRefresh).click();
            //            $(p.s.cDoubleClick).click();

            $(p.s.cMonitor_nu).click(p.event.cMonitor_click);
            $(p.s.cSelector_nu_ns).click(p.event.cSelector_click);
            $(p.s.tSelector_nu_ns).change(function () { p.updateMonitorSelectors(); });
        },
        reloadButton_click: function (event) {
            p.load(event);
        },
        aStop_click: function () {
            p.ex.event.stop();
        },
        aStopAll_click: function () {
            p.ex.event.stopAll();
        },
        reloadAllTabs_click: function (windowId) {
            if (!windowId) windowId = null;
            chrome.tabs.getAllInWindow(windowId, function (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    var tab = tabs[i];
                    chrome.tabs.update(tab.id, { url: tab.url });
                }
            });
        },
        reloadAllWindows_click: function () {
            chrome.windows.getAll({ populate: true }, function (windows) {
                for (var i = 0; i < windows.length; i++) {
                    p.event.reloadAllTabs_click(windows[i].id);
                }
            });
        },
        defaultSecs_change: function () {
            var val = $(p.s.tDefaultSecs).val();
            if (!isNaN(val)) {
                p.ex.reload.secs = val;
                $(p.s.tDefaultSecs).removeClass('error_red');
            } else {
                if (!$(p.s.tDefaultSecs).hasClass('error_red')) $(p.s.tDefaultSecs).addClass('error_red');
            }
        },
        rTabOrUrl_click: function () {
            p.ex.currentReload.isTabRefresh = $(p.s.rTab).is(':checked');
        },
        cTabFocus_click: function () {
            p.ex.currentReload.isTabFocusRequired = $(p.s.cTabFocus).is(':checked');
        },
        cStart_click: function () {
            p.ex.currentReload.span.isStartOn = $(p.s.cStart).is(':checked');
            if (p.ex.currentReload.span.isStartOn) $(p.s.tStart).removeAttr('disabled');
            else $(p.s.tStart).attr('disabled', 'disabled');
            var val = $(p.s.tStart).val();
            if (val === '' || val === 'MMM dd yyyy hh:mm:ss') {
                $(p.s.tStart).val(p.time.toLocal(new Date()));
            }
            p.ex.currentReload.refresh();
        },
        cEnd_click: function () {
            p.ex.currentReload.span.isEndOn = $(p.s.cEnd).is(':checked');
            if (p.ex.currentReload.span.isEndOn) $(p.s.tEnd).removeAttr('disabled');
            else $(p.s.tEnd).attr('disabled', 'disabled');
            var val = $(p.s.tEnd).val();
            if (val === '' || val === 'MMM dd yyyy hh:mm:ss') {
                $(p.s.tEnd).val(p.time.toLocal(new Date(new Date().getTime() + 1 * 60 * 60 * 1000)));
            }
            p.ex.currentReload.refresh();
        },
        tStart_change: function () {
            p.setDate('start', p.s.tStart);
        },
        tEnd_change: function () {
            p.setDate('end', p.s.tEnd);
        },
        cMonitor_click: function () {
            var status = p.toggleMonitor();
            if(!p.v.isInitSelector) p.ex.currentReload.monitor.isOn = status;
            $(p.s.tSelector_nu_ns).attr('disabled', 'disabled');
        },
        cSelector_click: function (event) {
            var id = "#" + event.target.id;
            var no = id.split('_');
            no = no[no.length - 1];
            if (!isNaN(no)) {
                var v = $(id);
                var isChecked = $(id).is(':checked');
                if (isChecked) {
                    $(p.s.tSelectorPre + '_nu_' + no).removeAttr('disabled');
                } else {
                    $(p.s.tSelectorPre + '_nu_' + no).attr('disabled', 'disabled');
                }
            } else if (no === 'ns') {
                var dSelectorOuterHtml = p.outerHTML($(p.s.dSelector_nu_ns));
                no = $(p.s.dMonitor_nu + ' input[type="checkbox"]').length;
                dSelectorOuterHtml = dSelectorOuterHtml.replace(/_ns/gim, "_" + no);
                $(dSelectorOuterHtml).insertBefore(p.s.dSelector_nu_ns);
                $(p.s.cSelectorPre + '_nu_' + no).click(p.event.cSelector_click);
                $(p.s.cSelectorPre + '_nu_' + no).attr('checked', 'checked');
                $(p.s.tSelectorPre + '_nu_' + no).removeAttr('disabled');
                $(p.s.tSelectorPre + '_nu_' + no).unbind('change');
                $(p.s.tSelectorPre + '_nu_' + no).change(function () { p.updateMonitorSelectors(); });
                $(p.s.cSelector_nu_ns).removeAttr('checked');
            }
            p.updateMonitorSelectors();
        }
    },
    outerHTML: function (obj) {
        return $($('<div></div>').html(obj.clone())).html();
    },
    time: {
        toLocal: function (dateTime) {
            if (!dateTime) return '';
            var dDate = dateTime;
            var dateString = dDate.toString().substr(dDate.toString().indexOf(' '));
            dateString = dateString.substr(0, dateString.indexOf('GMT'));
            dateString = $.trim(dateString);
            return dateString;
        }
    },
    setDate: function (startOrEndStr, elementSelector) {
        try {
            var d = $(elementSelector).val();
            d = new Date(d);
            if (startOrEndStr === 'start') p.ex.currentReload.span.startTime = d;
            else if (startOrEndStr === 'end') p.ex.currentReload.span.endTime = d;
            if ($(elementSelector).hasClass('error_red')) $(elementSelector).removeClass('error_red');
            p.ex.currentReload.refresh();
        } catch (e) {
            if (!$(elementSelector).hasClass('error_red')) $(elementSelector).addClass('error_red');
        }
    },
    load: function (event) {
        p.s._tempButtonText = event.target.innerText;
        chrome.tabs.query({active: true, currentWindow : true}, function(tabs){
                if(!tabs || tabs.length <= 0) return;
                var tab = tabs[0];
            //chrome.tabs.getSelected(null, function (tab) {
            var reload = p.ex.currentReload;
            reload.url = tab.url;
            reload.tabId = tab.id;
            reload.rand.isRandom = false;
            if (p.s._tempButtonText === p.ex.c.randomStr) {
                p.loadRandom(reload);
            } else if (p.s._tempButtonText === p.ex.c.customStr) {
                p.loadCustom(reload);
            } else {
                reload.secs = p.getSecs(p.s._tempButtonText);
            }
            p.ex.event.start(reload);
        });
    },
    loadRandom: function (reload) {
        reload.rand.isRandom = true;
        reload.rand.from = parseFloat($(p.s.tRandomStartSecs).val());
        reload.rand.to = parseFloat($(p.s.tRandomEndMins).val()) * 60;
        reload.secs = reload.rand.getSecs();
    },
    loadCustom: function (reload) {
        reload.secs = parseFloat($(p.s.tCustomSecs).val());
    },
    getSecs: function (text) {
        text = text.split(' ');
        var secs = 5;
        if (text[1].indexOf(p.ex.c.secStr) >= 0) { secs = (+text[0]); }
        else if (text[1].indexOf(p.ex.c.minStr) >= 0) { secs = (+text[0]) * 60; }
        return secs;
    },
    loadCurrentReload: function () {
        var reload = p.ex.currentReload;
        //CHECK - COMPLETE THIS LOAD VALUES ON BROWSER ACTION
    },
    toggleMonitor: function () {
        var isMonitor = $(p.s.cMonitor_nu).is(':checked');
        if (isMonitor) {
            $(p.s.dMonitor_nu + ' :input').removeAttr('disabled');
        } else {
            $(p.s.dMonitor_nu + ' :input').attr('disabled', 'disabled');
        }
        return isMonitor;
    },
    updateMonitorSelectors: function () {
        //p.ex.currentReload.monitor.selectors.length = 0;
        if (p.v.isInitSelector) return;
        p.ex.currentReload.monitor.selectors = [];
        $(p.s.dMonitor_nu + ' input[type="text"]').each(function () {
            var disabled = $(this).attr('disabled');
            if (!disabled) {
                p.ex.currentReload.monitor.selectors[p.ex.currentReload.monitor.selectors.length] = $(this).val();
            }
        });
    },
    initControls: function () {
        if (this.initControls.timerId) clearTimeout(this.initControls.timerId);
        if (p.ex.currentReload === null) { this.initControls.timerId = setTimeout('p.initControls()', 250); return; };
        var reload = p.ex.currentReload;
        $(p.s.tRandomStartSecs).val(reload.rand.from);
        $(p.s.tRandomEndMins).val(reload.rand.to / 60);
        $(p.s.tCustomSecs).val(reload.secs);
        $(p.s.tDefaultSecs).val(p.ex.defaultTime);
        if (reload.isTabRefresh) { $(p.s.rTab).attr('checked', 'checked'); }
        else $(p.s.rUrl).attr('checked', 'checked');

        if (reload.span.isStartOn) {
            $(p.s.cStart).attr('checked', 'checked');
            $(p.s.tStart).removeAttr('disabled');
            $(p.s.tStart).val(p.time.toLocal(reload.span.startTime));
        }
        if (reload.span.isEndOn) {
            $(p.s.cEnd).attr('checked', 'checked');
            $(p.s.tEnd).removeAttr('disabled');
            $(p.s.tEnd).val(p.time.toLocal(reload.span.endTime));
        }

        if (reload.isTabFocusRequired) { $(p.s.cTabFocus).attr('checked', 'checked'); }

        if (reload.monitor.isOn) {
            p.v.isInitSelector = true;
            //$(p.s.cMonitor_nu).attr('checked', 'checked');
            $(p.s.cMonitor_nu).click();
            for (var i = 0; i < reload.monitor.selectors.length; i++) {
                $(p.s.cSelector_nu_ns).click();
                var no = i + 1;
                $(p.s.cSelectorPre + '_nu_' + no).removeAttr('disabled');
                $(p.s.tSelectorPre + '_nu_' + no).val(reload.monitor.selectors[i]);
            }
            $(p.s.cSelector_nu_ns).removeAttr('disabled');
            p.v.isInitSelector = false;
        }
    },
    init: function (selectorObject) {
        p.s = selectorObject;
        p.event.attach();
        //p.ex.createNewReload();
        p.toggleMonitor();
        p.ex.currentReload = null;
        p.ex.loadCurrentReload();
        this.initControls();
    }
};

$(document).ready(function () {
    p.b = chrome.extension.getBackgroundPage().b;
    p.ex = chrome.extension.getBackgroundPage().ex;
    p.init({
        aStopAll: '#aStopAll', aStop: '#aStop',
        aReloadEverySecs: 'div#reloadEvery ul a',
        aRandom: '#aRandom', tRandomStartSecs: '#tRandomStartSecs', tRandomEndMins: '#tRandomEndMins',
        aCustom: '#aCustom', tCustomSecs: '#tCustomSecs',
        tDefaultSecs: '#tDefaultSecs',
        rTab: '#rTab', rUrl: '#rUrl',
        aReloadAllTabs: '#aReloadAllTabs', aReloadAllWindows: '#aReloadAllWindows',
        cStart: '#cStart', tStart: '#tStart', cEnd: '#cEnd', tEnd: '#tEnd',
        cBlockRefresh: '#cBlockRefresh', cTabFocus: '#cTabFocus', cDoubleClick: '#cDoubleClick',
        dUrl: '#dUrl', aUrl_nu: '#aUrl_nu', dUrl_nu: '#dUrl_nu',
        cMonitor_nu: '#cMonitor_nu', dMonitor_nu: '#dMonitor_nu', dSelector_nu_ns: '#dSelector_nu_ns', cSelector_nu_ns: '#cSelector_nu_ns', tSelector_nu_ns: '#tSelector_nu_ns', cSelectorPre: '#cSelector', tSelectorPre: '#tSelector', 
        cOnNavi_nu: '#cOnNavi_nu', cOnStart_nu: '#cOnStart_nu'
    });
});

