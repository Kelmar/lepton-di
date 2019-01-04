"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const consts_1 = require("./consts");
class InjectionMetadata {
    constructor() {
        this.parameters = new Map();
        this.properties = new Map();
    }
}
exports.InjectionMetadata = InjectionMetadata;
function inject(token) {
    return (target, key, index) => {
        let metadata = Reflect.getOwnMetadata(consts_1.INJECTION_METADATA, target) || new InjectionMetadata();
        if (index !== undefined)
            metadata.parameters.set(index, token);
        else
            metadata.properties.set(key, token);
        Reflect.defineMetadata(consts_1.INJECTION_METADATA, metadata, target);
    };
}
exports.inject = inject;
