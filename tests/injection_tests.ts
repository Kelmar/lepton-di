/* ================================================================================================================= */
/* ================================================================================================================= */

const assert = require("assert");

import { testFixture, test } from "./decorators";
import { isTypeOf } from "./utils";

import { inject, using, IContainer, IResolver } from "../lib";
import { Container } from "../lib/container";

/* ================================================================================================================= */

const IBar: unique symbol = Symbol("inject:IBar");
const IFoo: unique symbol = Symbol("inject:IFoo");

class Bar
{
}

/* ================================================================================================================= */

@testFixture("injection")
export class InjectTests
{
    @test
    public injectsOnNew()
    {
        class Foo
        {
            constructor(@inject(IBar) public bar: Bar)
            {
            }
        }

        let c = new Container();
        c.register(IBar).toClass(Bar);
        c.register(IFoo).toClass(Foo);

        using(c.beginScope(), scope =>
        {
            let f: Foo = scope.resolve(IFoo);

            assert.ok(f);
            assert.ok(f.bar);
            assert.ok(isTypeOf(f.bar, Bar));
        });
    }

    @test
    public injectsProperties()
    {
        class Foo
        {
            @inject(IBar)
            private bar: Bar;

            public test()
            {
                assert.ok(this.bar);
                assert.ok(isTypeOf(this.bar, Bar));
            }
        }

        let c = new Container();
        c.register(IBar).toClass(Bar);
        c.register(IFoo).toClass(Foo);

        using(c.beginScope(), scope =>
        {
            let f: Foo = scope.resolve(IFoo);
            assert.ok(f);
            f.test();
        });
    }

    @test
    public injectsContainer()
    {
        let resolved: boolean = false;
        let c: IContainer;

        class Foo
        {
            constructor(@inject(IContainer) container: IContainer)
            {
                resolved = container === c;
            }
        }

        c = new Container();
        c.register(IFoo).toClass(Foo);

        using(c.beginScope(), scope =>
        {
            let f: Foo = scope.resolve(IFoo);

            assert.ok(f);
        });

        assert.ok(resolved, "Container did not resolve to itself.");
    }

    @test
    public injectsResolver()
    {
        let resolved: boolean = false;
        let r: IResolver;

        class Foo
        {
            constructor(@inject(IResolver) resolver: IResolver)
            {
                resolved = resolver === r;
            }
        }

        let c = new Container();
        c.register(IFoo).toClass(Foo);

        using(c.beginScope(), scope =>
        {
            r = scope;
            let f: Foo = scope.resolve(IFoo);

            assert.ok(f);
        });

        assert.ok(resolved, "Scope did not resolve to itself.");
    }
}

/* ================================================================================================================= */
