var stl = {
    hash: {
        _hash: {}, /* { hash: obj, hash: obj } */
        init: function (compareHandler) {
            this._compareHandler = compareHandler;
        },
        add: function (key, obj) {
            var _hash = this._hash;
            if (!_hash[key]) { this.length++; }
            //else { _hash[key] = null; }
            _hash[key] = obj;
        },
        remove: function (key) {
            var _hash = this._hash;
            if (_hash[key]) {
                _hash[key] = null;
                delete _hash[key];
                this.length--;
            }
        },
        get: function (key) {
            var _hash = this._hash;
            return _hash[key];
        },
        getAll: function () {
            return this._hash;
        },
        reset: function () {
            this._hash = {};
            this.length = 0;
        },
        length: 0,
        compare: function (obj1, obj2) {
            return this._compareHandler(obj1, obj2);
        },
        _compareHandler: function () {
        }
    },
    cache: function () {
        this.cookies = {}; /* domain1: [cookie11, cookie12], domain2: [cookie21, cookie22, cookie 23], */
        this.getCookies = function (domain) { return this.cookies[domain]; };
        this.add = function (cookie) {
            var domain = cookie.domain;
            if (!this.cookies[domain]) { this.cookies[domain] = []; }
            this.cookies[domain].push(cookie);
        };
        this.removeAll = function () { this.cookies = {}; };
        this.remove = function (cookie) {
            var domain = cookie.domain;
            if (this.cookies[domain]) {
                for (var i = 0; i < this.cookies[domain].length; i++) {
                    if (this.compare(this.cookies[domain][i], cookie)) {
                        this.cookies[domain].splice(i, 1);
                    }
                }
                if (this.cookies[domain].length == 0) {
                    delete this.cookies[domain];
                }
            }
        };
        this.compare = function (cookie1, cookie2) {
            //            var ret = (cookie1.name === cookie2.name);
            //            ret = (cookie1.domain === cookie2.domain);
            //            ret = (cookie1.hostOnly === cookie2.hostOnly);
            //            ret = (cookie1.session === cookie2.session);
            //            ret = (cookie1.secure === cookie2.secure);
            //            ret = (cookie1.httpOnly === cookie2.httpOnly);
            //            ret = (cookie1.path === cookie2.path);
            //            ret = (cookie1.storeId === cookie2.storeId);




            var ret = (cookie1.name === cookie2.name) && (cookie1.domain === cookie2.domain) &&
                (cookie1.hostOnly === cookie2.hostOnly) && (cookie1.session === cookie2.session) &&
                (cookie1.secure === cookie2.secure) && (cookie1.httpOnly === cookie2.httpOnly) &&
                (cookie1.path === cookie2.path) && (cookie1.storeId === cookie2.storeId);
            return ret;
        };
    }

};

