"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lifecycle_1 = require("./lifecycle");
class RegistrationInfo {
    constructor(name) {
        this.name = name;
        this.lifetime = lifecycle_1.Lifetime.Transient;
    }
}
exports.default = RegistrationInfo;
