"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const scope_1 = require("./scope");
const lifecycle_1 = require("./lifecycle");
const RegistrationInfo_1 = require("./RegistrationInfo");
class RegistrationSyntax extends RegistrationInfo_1.default {
    constructor(target) {
        super(target);
        this.target = target;
    }
    to(type) {
        this.type = type;
        return this;
    }
    with(lifetime) {
        this.lifetime = lifetime;
        return this;
    }
}
class Container {
    constructor() {
        this.m_maps = new Map();
        this.m_singletonScope = new scope_1.Scope(this, lifecycle_1.Lifetime.Singleton);
    }
    dispose() {
        this.m_singletonScope.dispose();
        this.m_maps = null;
    }
    register(name) {
        let reg = this.getRegistration(name);
        if (reg != null) {
            let nameStr = name.toString();
            throw new Error(`'${nameStr}' is an already registered type.`);
        }
        var rval = new RegistrationSyntax(name);
        this.m_maps.set(name, rval);
        return rval;
    }
    isRegistered(name) {
        return this.m_maps.has(name);
    }
    beginScope() {
        return new scope_1.Scope(this, lifecycle_1.Lifetime.Scoped, this.m_singletonScope);
    }
    getRegistration(name) {
        return this.m_maps.get(name);
    }
}
exports.Container = Container;
