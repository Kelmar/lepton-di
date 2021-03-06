# lepton-di
A lightweight dependency injection framework for TypeScript

## Install
```bash
npm install --save lepton-di
```

## Quick Example

```typescript
import { inject, using, Container } from 'lepton-di';

// Declare an interface
interface ILogger
{
    write(message: string): void;
}

// Declare a "physical" symbol for us to bind to.  (See below)
const ILogger: unique symbol = symbol("myproj:common:logger"); // Or whatever clever schema you wish.

// Build a concrete class
class ConsoleLogger implements ILogger
{
    public write(message: string): void;
    {
        console.log(message);
    }
}

// Create a class which uses our implementation
class Widget
{
    @inject(ILogger)
    public log: ILogger

    public doThing(): void
    {
        this.log.write("Doing the thing!");
    }
}

// Create a new container and register our type
let container = new Container();

container.register(ILogger)
    .toClass(ConsoleLogger)
    .with(Lifetime.Singleton);

using (container.beginScope(), scope =>
{
    let myWidget = new Widget();
    scope.buildUp(myWidget); // We can use buildUp() so we dont have to register Widget
    myWidget.doThing();
});
```

## Usage Guide

Declare your interfaces as you normally would in TypeScript
```typescript
export interface ILogger
{
    write(message: string): void;
}
```

Because TypeScript interfaces do not generate any actual code, we need a symbol to bind to.

```typescript
export const ILogger: unique symbol = Symbol("myproj:common:logger");
```

You can then register this symbol with a concrete class.

I prefer to keep the concrete classes only visible through a configuration function that I then export.
This lets me keep as much of the module's concerns contained completely in that scope and not elsewhere.

```typescript
class ConsoleLogger implements ILogger
{
    public write(message: string): void
    {
        console.log(message);
    }
}

export module log
{
    export function configure(container: IContainer)
    {
        container.register(ILogger) // Note that this is our exported symbol, not the interface.
            .toClass(ConsoleOutput)
            .with(Lifetime.Singleton);
    }
}
```

Dependent classes may declare their dependencies in their properties or via a constructor parameter:

```typescript
class Widget
{
    @inject(ILogger)
    private readonly log: ILogger; // Property injected

    public doThing(): void
    {
        this.log.write("Hi");
    }
}

class Sprocket
{
    // Constructor injected.
    constructor(@inject(ILogger) private readonly log: ILogger)
    {
    }

    public doThing(): void
    {
        this.log.write("Greetings.");
    }
}
```

You have three choices on how to get parameters injected into these classes.

The first is to register them like you would with an interface.

```typescript
export module things
{
    export function configure(container: IContainer)
    {
        container.register(IWidget).toClass(Widget); // The default lifetime is transient.
    }
}
```

Another other option is to use buildUp() to inject values in an already existing object.

```typescript
scope.buildUp(myWidget);
```

The third option is to have the resolver get passed in as a parameter:

```typescript
class Widget
{
    private sprocket: ISprocket;

    constructor(@inject(IResolver) resolver: IResolver)
    {
        this.sprocket = resolver.resolve(ISprocket);
    }
}
```

## Factories

You can register a function or lambda as a factory method as well if you need to.

```typescript
container.register(IWidget)
    .toFactory((sprocket) => new Widget(sprocket), ISprocket);
```

## Life Cycles

Lepton has various utilites for managing object lifetimes.  Objects can have one of three lifecycles:

* Transient -
  This is the default lifetime of a registered class.  Transient objects are not managed by the scope, they are simply
  created and returned.

* Scoped -
  Scoped objects have their lifetimes tied to the life of the scope that created them.  Once the scope is destroied,
  those objects will also be destroied.

* Singleton -
  A singleton object will be created once per container, which are for the lifetime of the application.

### Scopes

Scopes is the first and most prominant of these.  A scope holds (or creates) objects until that scope is destroyed.

Scopes can be nested with subsequent calls to beginScope().  Child scopes will walk up their parent chain and create
a new instance of an object if not found.

If the item cannot be found a new instance will be created for the caller and saved.

### Disposable objects

If a class exposes a dispose() method, then Lepton will call this method when the owning scope of an object is destroied.

### using()

The using method is a utility method that ensures that an object's dispose method gets called; regardless if an exception
is thrown or not.

## Resolving

The scope exposes an IResolver interface with the following functions:

### buildUp()
This will inject properties into an already instantiated object.   This is handy when you have a factory method for a class
or other means of creating the object outside of the scope.

This method will not add the object to the scope's management.

### wireUp()
This is similar to build up, but the object needs to be registered; it will also be added to the scope's management list, so
it will be cleaned up when the scope goes out of context.

### resolve()
This will resolve a new or existing object from the scope's management.
