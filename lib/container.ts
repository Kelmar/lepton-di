/* ================================================================================================================= */
/* ================================================================================================================= */

import "reflect-metadata";

import { Type, IRegistrationSyntax, IContainer, IResolver, IScope, identifier, Factory } from "./interfaces";

import { InjectionMetadata } from "./decorators";
import { INJECTION_METADATA } from "./consts";

import { Scope } from "./scope";
import { Lifetime } from "./lifecycle";

import RegistrationInfo from './RegistrationInfo';

/* ================================================================================================================= */

function factoryFromType<T>(type: Type<T>): Factory<T>
{
    let params = Reflect.getOwnMetadata("design:paramtypes", type) || [];

    let metadata: InjectionMetadata = Reflect.getOwnMetadata(INJECTION_METADATA, type);

    if (metadata != null)
        metadata.parameters.forEach((typeName, index) => params[index] = typeName);

    return function()
    {
        let args = params.map((p: any) => this.resolve(p));

        let rval: T = new type(...args);

        return this.buildUp(rval);
    };
}

/* ================================================================================================================= */

function resolvingFactory<T>(factory: Factory<T>, ...params: any[]): Factory<T>
{
    return function()
    {
        let args = params.map((p: identifier) => this.resolve(p));
        return factory(...args);
    }
}

/* ================================================================================================================= */

class RegistrationSyntax extends RegistrationInfo implements IRegistrationSyntax
{
    public factory: Factory<any>;

    constructor(readonly target: identifier)
    {
        super(target);

        this.lifetime = Lifetime.Transient;

        if (typeof target !== "symbol")
            this.factory = factoryFromType(target as Type<any>);
    }

    toClass<T>(type: Type<T>): IRegistrationSyntax
    {
        this.factory = factoryFromType(type);
        return this;
    }

    toFactory<T>(fn: Factory<T>, ...args: any[]): IRegistrationSyntax
    {
        this.factory = resolvingFactory(fn, ...args);
        return this;
    }

    with(lifetime: Lifetime): IRegistrationSyntax
    {
        this.lifetime = lifetime;
        return this;
    }

    public build<T>(resolver: IResolver): T
    {
        return this.factory.bind(resolver)();
    }
}

/* ================================================================================================================= */

class InstanceRegistration extends RegistrationInfo
{
    constructor (name: identifier, public readonly container: IContainer)
    {
        super(name);
    }

    public build<T>(resolver: IResolver): T
    {
        let rval: any;

        if (this.name == IContainer)
            rval = this.container;
        else
            rval = resolver;

        return rval as T;
    }
}

/* ================================================================================================================= */

export class Container implements IContainer
{
    private m_maps: Map<identifier, RegistrationInfo>;
    private m_singletonScope: Scope;

    constructor()
    {
        this.m_maps = new Map<symbol, RegistrationInfo>();
        this.m_singletonScope = new Scope(this, Lifetime.Singleton);

        // Preregister IResolver and IContainer
        this.reserve(IContainer);
        this.reserve(IResolver);
    }

    public dispose(): void
    {
        this.m_singletonScope.dispose();
        this.m_maps = null;
    }

    private reserve(name: identifier): void
    {
        this.m_maps.set(name, new InstanceRegistration(name, this));
    }

    public register(name: identifier): IRegistrationSyntax
    {
        let reg: RegistrationInfo = this.getRegistration(name);

        if (reg != null)
        {
            let nameStr: string = name.toString();
            throw new Error(`'${nameStr}' is an already registered type.`);
        }

        var rval = new RegistrationSyntax(name);
        this.m_maps.set(name, rval);

        return rval;
    }

    public isRegistered(name: symbol): boolean
    {
        return this.m_maps.has(name);
    }

    public beginScope(): IScope
    {
        return new Scope(this, Lifetime.Scoped, this.m_singletonScope);
    }

    // TODO: Hide the items below, they are internal to Lepton

    public getRegistration(name: identifier): RegistrationInfo
    {
        return this.m_maps.get(name);
    }
}

/* ================================================================================================================= */
