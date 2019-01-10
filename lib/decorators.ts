/* ================================================================================================================= */
/* ================================================================================================================= */

import "reflect-metadata";

import { INJECTION_METADATA } from "./consts";
import { identifier } from "./interfaces";

/* ================================================================================================================= */

export class InjectionMetadata
{
    public readonly parameters: Map<number, identifier> = new Map<number, identifier>();
    public readonly properties: Map<string, identifier> = new Map<string, identifier>();
}

/* ================================================================================================================= */

export function inject(token: identifier): (target: any, key: string, index?: number) => void
{
    return (target: any, key: string, index?: number): void =>
    {
        let metadata: InjectionMetadata = Reflect.getOwnMetadata(INJECTION_METADATA, target) || new InjectionMetadata();

        if (index !== undefined)
            metadata.parameters.set(index, token);
        else
            metadata.properties.set(key, token);

        Reflect.defineMetadata(INJECTION_METADATA, metadata, target);
    };
}

/* ================================================================================================================= */
