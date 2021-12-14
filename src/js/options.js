var o = {
    b: {},

    resetButton: {
        id: undefined,
        resetValues: { startIn: 5, darkenIn: 5, iconPath: "img/icon19.png" },
        init: function (buttonId, iconPath, startIn, darkenIn) {
            o.resetButton.id = "#" + buttonId;
            $(o.resetButton.id).click(function () {
                o.resetButton.click();
            });
            o.resetButton.resetValues.startIn = startIn;
            o.resetButton.resetValues.darkenIn = darkenIn;
            o.resetButton.resetValues.iconPath = iconPath;
        },
        click: function () {
            //o.disableSwitch.uncheck();
            o.removeContextMenu.uncheck();
            o.icon.reset(o.resetButton.resetValues.iconPath);
        }
    },

    closeButton: {
        id: undefined,
        init: function (buttonId) {
            o.closeButton.id = "#" + buttonId;
            $(o.closeButton.id).click(function () {
                o.closeButton.click();
            });
        },
        click: function () {
            chrome.tabs.query({active: true, currentWindow : true}, function(tabs){
                if(!tabs || tabs.length <= 0) return;
                var tab = tabs[0];
            //chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.remove(tab.id);
            });
        }
    },

    disableSwitch: {
        id: undefined,
        init: function (checkBoxId) {
            o.disableSwitch.id = "#" + checkBoxId;
            var val = b.ls.isDisabled();
            $(o.disableSwitch.id).attr("checked", val);
            $(o.disableSwitch.id).change(function () {
                if ($(this).is(':checked')) {
                    o.disableSwitch.check();
                } else {
                    o.disableSwitch.uncheck();
                }
            });
        },
        uncheck: function () {
            var val = b.ls.isDisabled(false)
            $(o.disableSwitch.id).attr("checked", val);
        },
        check: function () {
            var val = b.ls.isDisabled(true);
            $(o.disableSwitch.id).attr("checked", val);
        }
    },

    removeContextMenu: {
        id: undefined,
        init: function (checkBoxId) {
            o.removeContextMenu.id = "#" + checkBoxId;
            var val = !b.ls.isContextMenuOn();
            $(o.removeContextMenu.id).attr("checked", val);
            $(o.removeContextMenu.id).change(function () {
                if ($(this).is(':checked')) {
                    o.removeContextMenu.check();
                } else {
                    o.removeContextMenu.uncheck();
                }
            });
        },
        uncheck: function () {
            b.contextMenu.create();
            var val = !b.ls.isContextMenuOn()
            $(o.removeContextMenu.id).attr("checked", val);
        },
        check: function () {
            b.contextMenu.remove();
            var val = !b.ls.isContextMenuOn();
            $(o.removeContextMenu.id).attr("checked", val);
        }
    },

    icon: {
        id: undefined,
        localFileId: undefined,
        localIconId: undefined,
        init: function (iconIdIdentifier, localFileId, localIconId) {
            o.icon.id = iconIdIdentifier;
            o.icon.localFileId = "#" + localFileId;
            o.icon.localIconId = "#" + localIconId;
            $(o.icon.id).click(o.icon.click);
            $(o.icon.localFileId).change(o.icon.change);
            $(o.icon.localIconId).attr('src', b.ls.iconPath());
        },
        click: function () {
            var iconPath = $(this).attr("src");
            b.icon.set(iconPath);
        },
        change: function (evt) {
            var files = evt.target.files;
            for (var i = 0, f; f = files[i]; i++) {
                if (!f.type.match('image.*')) {
                    continue;
                }
                var reader = new FileReader();
                reader.onload = (function (theFile) {
                    return function (e) {
                        $(o.icon.localIconId).attr('src', e.target.result);
                    };
                })(f);
                reader.readAsDataURL(f);
            }
        },
        reset: function (iconPath) {
            if (typeof iconPath === 'undefined') iconPath = 'img/icon19.png';
            b.icon.set(iconPath);
        }
    },

    setRateUrl: function (b) {
        var param = b.app.getExtUrlParam(null, true);
        var rate = document.getElementById('rate');
        console.log(param);
        var name = param.name.replace(/\s+/g, '-').toLowerCase();
        console.log(name);
        var url = "https://chrome.google.com/webstore/detail/" + param.name.replace(/\s+/g, '-').toLowerCase() + "/" + param.eid + "/reviews?utm_source=chrome-ntp-icon";
        rate.href = url;
    },

    init: function () {
        b = chrome.extension.getBackgroundPage().b;
        o.disableSwitch.init("cDisable");
        o.resetButton.init("bReset", "img/icon19.png", 5, 5);
        o.closeButton.init("bClose");
        o.icon.init("#dIcon input[type='image']", "bFile", "iconLocal");
        o.removeContextMenu.init("cCMenu");
        //o.resetPositionSize.init("bResetPS");
        o.setRateUrl(b);
    }
};

window.addEventListener("load", o.init);