/* ================================================================================================================= */
/* ================================================================================================================= */

const assert = require("assert");

import { testFixture, test } from "./decorators";

import { using, Lifetime, IDisposable, IContainer } from "../lib";
import { Container } from "../lib/container";

/* ================================================================================================================= */

const IFoo: unique symbol = Symbol("scope:IFoo");
const IBar: unique symbol = Symbol("scope:IBar");

@testFixture("scope")
export class ScopeTests
{
    @test
    public disposesOfChildren()
    {
        let disposed: boolean = false;

        class Foo implements IDisposable
        {
            public dispose()
            {
                disposed = true;
            }
        }

        let c = new Container();
        c.register(IFoo).toClass(Foo).with(Lifetime.Scoped);

        using (c.beginScope(), scope =>
        {
            let f: Foo = scope.resolve(IFoo);
        });

        assert.ok(disposed, "dispose() was not called.");
    }

    @test
    public resolvesClass()
    {
        let resolved: boolean = false;

        class Foo
        {
            constructor () { resolved = true; }
        }

        let c = new Container();
        c.register(Foo).with(Lifetime.Transient);

        using (c.beginScope(), scope =>{
            let f: Foo = scope.resolve(Foo);
            assert.ok(f, "resolve() did not resolve object.");
        });

        assert.ok(resolved, "resolve() did not call object constructor.");
    }

    @test
    public resolvesWithFactory()
    {
        let resolved: boolean = false;
        let factoryCalled: boolean = false;

        class Foo
        {
            constructor () { resolved = true; }
        }

        let c = new Container();
        c.register(IFoo)
            .toFactory(() => {
                factoryCalled = true;
                return new Foo();
            })
            .with(Lifetime.Transient);

        using (c.beginScope(), scope =>{
            let f: Foo = scope.resolve(IFoo);
            assert.ok(f, "resolve() did not resolve object.");
        });

        assert.ok(factoryCalled, "factory was not called.");
        assert.ok(resolved, "factory did not call object constructor.");
    }

    @test
    public resolvesWithInjectedFactory()
    {
        let barResolved: boolean = false;
        let fooResolved: boolean = false;

        let factoryCalled: boolean = false;

        class Bar
        {
            constructor ()
            {
                barResolved = true;
            }
        }

        class Foo
        {
            constructor (bar: Bar) 
            {
                fooResolved = true; 
            }
        }

        let c = new Container();
        c.register(IBar).toClass(Bar);
        c.register(IFoo)
            .toFactory((bar: Bar) => {
                factoryCalled = true;
                return new Foo(bar);
            }, IBar)
            .with(Lifetime.Transient);

        using (c.beginScope(), scope =>{
            let f: Foo = scope.resolve(IFoo);
            assert.ok(f, "resolve() did not resolve object.");
        });

        assert.ok(factoryCalled, "factory was not called.");
        assert.ok(barResolved, "resolver did not create a Bar object.");
        assert.ok(fooResolved, "factory did not create a Foo object.");
    }
    
    
}

/* ================================================================================================================= */
