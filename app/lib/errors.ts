// application/errors.ts
export class ValidationError extends Error {}
export class NotFoundError extends Error {}
export class AuthzError extends Error {}
export class AuthnError extends Error {}
export class ConflictError extends Error {}
export class InternalError extends Error {}
export class CompoundError extends Error {
  constructor(public errors: Array<Error>) {
    super();
  }
}
