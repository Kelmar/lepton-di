/* ================================================================================================================= */
/* ================================================================================================================= */

const assert = require('assert');

import { testFixture, test, testCase, runAllTests } from './decorators';
import { using, Lifetime, IDisposable } from '../lib';
import { Container } from '../lib/container';

/* ================================================================================================================= */

const IFoo: unique symbol = Symbol('scope:IFoo');

@testFixture("scope")
class ScopeTests
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
        c.register(IFoo).to(Foo).with(Lifetime.Scoped);

        using (c.beginScope(), scope =>
        {
            let f: Foo = scope.resolve(IFoo);
        });

        assert.ok(disposed, "dispose() was not called.");
    }

    @test resolvesClass()
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
            assert.ok(f, 'resolve() did not resolve object.');
        });

        assert.ok(resolved, "resolve() did not call object constructor.");
    }
}

/* ================================================================================================================= */
