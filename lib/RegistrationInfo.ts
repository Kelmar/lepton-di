/* ================================================================================================================= */
/* ================================================================================================================= */

import { Factory, identifier, IResolver } from "./interfaces";
import { Lifetime } from "./lifecycle";

/* ================================================================================================================= */

export default abstract class RegistrationInfo
{
    /**
     * null indicates no lifetime scoping rules.
     */
    public lifetime: Lifetime = null;

    protected constructor (readonly name: identifier)
    {
    }

    public abstract build<T>(resolver: IResolver): T;
}

/* ================================================================================================================= */
