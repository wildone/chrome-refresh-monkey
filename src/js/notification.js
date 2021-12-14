var n = {
    init: function () {
        var ex = chrome.extension.getBackgroundPage().ex;
        var param = this.getUrlParam();
        var tabId = param.tabId;
        var reload = ex.getReload(tabId);
        if (!reload) return;

//        var tUrl = document.getElementById('tUrl');
//        tUrl.value = reload.url;
//        var dChange = document.getElementById('dChange');
//        dChange.innerHTML = reload.monitor.changeHtml;

                $("#tUrl").val(reload.url);
                $("#dChange").append(reload.monitor.changeHtml);
    },
    getUrlParam: function () {
        var param = [], value;
        var paramValue = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < paramValue.length; i++) {
            value = paramValue[i].split('=');
            param.push(value[0]);
            param[value[0]] = value[1];
        }
        return param;
    }
};
//window.onload = n.init();
$(document).ready(function () {
    n.init(); 
});