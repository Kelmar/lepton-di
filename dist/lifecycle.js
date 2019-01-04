"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lifetime;
(function (Lifetime) {
    Lifetime[Lifetime["Transient"] = 0] = "Transient";
    Lifetime[Lifetime["Scoped"] = 1] = "Scoped";
    Lifetime[Lifetime["Singleton"] = 2] = "Singleton";
})(Lifetime = exports.Lifetime || (exports.Lifetime = {}));
function using(item, fn) {
    try {
        fn(item);
    }
    finally {
        if (item != null)
            item.dispose();
    }
}
exports.using = using;
