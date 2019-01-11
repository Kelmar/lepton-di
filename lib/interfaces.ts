/* ================================================================================================================= */
/* ================================================================================================================= */

import { Lifetime } from "./lifecycle";

/* ================================================================================================================= */

export interface Type<T>
{
    new(...args: any[]): T;
}

/* ================================================================================================================= */

export interface Factory<T>
{
    (...args: any[]): T
}

/* ================================================================================================================= */

export type identifier = symbol | Symbol | Type<any>;

/* ================================================================================================================= */

/**
 * Mechanism for releasing resources.
 */
export interface IDisposable
{
    /**
     * Cleans up any used resources.
     */
    dispose(): void;
}

/* ================================================================================================================= */

export interface IRegistrationSyntax
{
    toClass<T>(type: Type<T>): IRegistrationSyntax;

    toFactory<T>(fn: Factory<T>, ...args: identifier[]): IRegistrationSyntax;

    toInstance<T>(instance: T): IRegistrationSyntax;

    with(lifetime: Lifetime): IRegistrationSyntax;
}

/* ================================================================================================================= */

/**
 * Mechanism for resolving object dependency graphs.
 */
export interface IResolver
{
    /**
     * Injects values into an existing object.
     *
     * The object will not be added to the managed container.
     *
     * Unlike wireUp(), this function does not require that the target type be registered.
     *
     * @param target The object to have its properties injected.
     */
    buildUp<T>(target: T): T

    /**
     * Injects values into an existing object.
     *
     * The object will be added to the resolver's lifetime management.
     *
     * @param name The symbol name to wire to.
     * @param target The object to have its properties injected.
     */
    wireUp<T>(name: identifier, target: T): T;

    /**
     * Resolves a new or existing object of the given type.
     *
     * @param name The type to build.
     */
    resolve<T>(name: identifier): T;
}

/* ================================================================================================================= */

export interface IContainer extends IDisposable
{
    register(name: identifier): IRegistrationSyntax;

    isRegistered(name: identifier): boolean;

    /**
     * Creates a new lifetime scope.
     */
    beginScope(): IScope;
}

/* ================================================================================================================= */

/**
 * Defines the boundaries of a scoped lifetime.
 */
export interface IScope extends IResolver, IDisposable
{
    /**
     * Creates a nested lifetime scope.
     */
    beginScope(): IScope;
}

/* ================================================================================================================= */

// Symbol defines for lepton interfaces
export const IDisposable: unique symbol = Symbol("lepton:disposable");
export const IRegistrationSyntax: unique symbol = Symbol("lepton:registration_syntax");
export const IResolver: unique symbol = Symbol("lepton:resolver");
export const IContainer: unique symbol = Symbol("lepton:container");
export const IScope: unique symbol = Symbol("lepton:scope");

/* ================================================================================================================= */
