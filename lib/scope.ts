/* ================================================================================================================= */
/* ================================================================================================================= */

import { IScope, identifier } from "./interfaces";

import { InjectionMetadata } from "./decorators";
import { INJECTION_METADATA } from "./consts";
import { Container } from "./container";
import { Lifetime, maybeDispose } from "./lifecycle";

import RegistrationInfo from './RegistrationInfo';

/* ================================================================================================================= */

export class Scope implements IScope
{
    private managed: Set<identifier>;
    private cache: Map<identifier, any>;

    constructor(readonly container: Container, readonly managedLifetime: Lifetime, readonly parent?: Scope)
    {
        this.managed = new Set<identifier>();
        this.cache = new Map<identifier, any>();
    }

    public dispose(): void
    {
        this.managed.forEach(item => maybeDispose(this.cache.get(item)));
        this.managed = null;

        this.cache.clear();
        this.cache = null;
    }

    private buildUpInner<T>(target: T): void
    {
        let prototype = Object.getPrototypeOf(target);
        let propMetadata: InjectionMetadata = Reflect.getMetadata(INJECTION_METADATA, prototype);

        if (propMetadata != null)
        {
            propMetadata.properties.forEach((typeName, index) => (target as any)[index] = this.resolve(typeName));
        }
    }

    private manage<T>(regInfo: RegistrationInfo, target: T): void
    {
        this.cache.set(regInfo.name, target);

        if (regInfo.lifetime == null || regInfo.lifetime == Lifetime.Unmanaged)
            return;

        if (regInfo.lifetime == this.managedLifetime)
            this.managed.add(regInfo.name);
        else if (this.parent != null)
            this.parent.manage(regInfo, target);
    }

    private tryResolve<T>(name: identifier): T
    {
        let rval: T = this.cache.get(name);
        
        if (rval === null && this.parent !== null)
        {
            rval = this.parent.tryResolve<T>(name);

            if (rval !== null)
                this.cache.set(name, rval);
        }

        return rval;
    }

    public buildUp<T>(target: T): T
    {
        if (target == null)
            throw new Error("target is null");

        this.buildUpInner(target);

        return target;
    }

    public wireUp<T>(name: identifier, target: T): T
    {
        if (target == null)
            throw new Error("target is null");

        let regInfo: RegistrationInfo = this.container.getRegistration(name);

        if (regInfo == null)
        {
            let symStr = name.toString();
            throw new Error(`Symbol '${symStr}' not registered.`);
        }

        this.buildUp<T>(target);
        this.manage(regInfo, target);

        return target;
    }

    public resolve<T>(name: identifier): T
    {
        let rval: T = this.tryResolve(name);

        if (rval == null)
        {
            let regInfo: RegistrationInfo = this.container.getRegistration(name);

            if (regInfo == null)
            {
                let symStr = name.toString();
                throw new Error(`Symbol '${symStr}' not registered.`);
            }

            rval = regInfo.build(this);

            this.buildUp<T>(rval);
            this.manage(regInfo, rval);
        }
        
        return rval;
    }

    public beginScope(): IScope
    {
        return new Scope(this.container, this.managedLifetime, this);
    }
}

/* ================================================================================================================= */
