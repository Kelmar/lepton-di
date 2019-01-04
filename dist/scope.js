"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("./consts");
class Scope {
    constructor(container, managedLifetime, parent) {
        this.container = container;
        this.managedLifetime = managedLifetime;
        this.parent = parent;
        this.m_managed = new Map();
    }
    dispose() {
        this.m_managed.forEach(item => this.disposeItem(item));
        this.m_managed = null;
    }
    disposeItem(item) {
        let disposal = item["dispose"];
        if (typeof disposal === "function")
            disposal.apply(item);
    }
    createNew(regInfo) {
        let params = Reflect.getOwnMetadata("design:paramtypes", regInfo.type) || [];
        let ctorMetadata = Reflect.getOwnMetadata(consts_1.INJECTION_METADATA, regInfo.type);
        if (ctorMetadata != null)
            ctorMetadata.parameters.forEach((typeName, index) => params[index] = typeName);
        let args = params.map((p) => this.resolve(p));
        let rval = new regInfo.type(...args);
        return this.buildUp(rval);
    }
    buildUpInner(target) {
        let prototype = Object.getPrototypeOf(target);
        let propMetadata = Reflect.getMetadata(consts_1.INJECTION_METADATA, prototype);
        if (propMetadata != null) {
            propMetadata.properties.forEach((typeName, index) => target[index] = this.resolve(typeName));
        }
    }
    manage(regInfo, target) {
        if (regInfo.lifetime == this.managedLifetime)
            this.m_managed.set(regInfo.name, target);
        else if (this.parent != null)
            this.parent.manage(regInfo, target);
    }
    tryResolve(name) {
        let rval = this.m_managed.get(name);
        if (rval === null && this.parent !== null)
            rval = this.parent.tryResolve(name);
        return rval;
    }
    buildUp(target) {
        if (target == null)
            throw new Error("target is null");
        this.buildUpInner(target);
        return target;
    }
    wireUp(name, target) {
        if (target == null)
            throw new Error("target is null");
        let regInfo = this.container.getRegistration(name);
        if (regInfo == null) {
            let symStr = name.toString();
            throw new Error(`Symbol '${symStr}' not registered.`);
        }
        this.buildUp(target);
        this.manage(regInfo, target);
        return target;
    }
    resolve(name) {
        let rval = this.tryResolve(name);
        if (rval == null) {
            let regInfo = this.container.getRegistration(name);
            if (regInfo == null) {
                let symStr = name.toString();
                throw new Error(`Symbol '${symStr}' not registered.`);
            }
            rval = this.createNew(regInfo);
            this.buildUp(rval);
            this.manage(regInfo, rval);
        }
        return rval;
    }
    beginScope() {
        return new Scope(this.container, this.managedLifetime, this);
    }
}
exports.Scope = Scope;
