import {ServerResponse} from "node:http";

/**
 * Represents the structure of an error response.
 * Typically used to standardize error information returned from an API.
 *
 * @interface IErrorResponse
 * @property {number} statusCode - The HTTP status code associated with the error.
 * @property {string} message - A brief message describing the error.
 */
export interface IErrorResponse {
    statusCode: number;
    message: string;
}

/**
 * Represents a custom error response with an HTTP status code and message.
 * Extends the built-in Error class to include a status code for improved error handling in HTTP responses.
 *
 * This class facilitates the creation and management of custom error messages,
 * along with the corresponding HTTP status codes, for server-side applications.
 *
 * Provides a method to send the error as an HTTP response to the client.
 */
export class ErrorResponse extends Error {
    public statusCode: number;
    public message: string;

    constructor(message: string, statusCode: number) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
    }
}

/**
 * Represents an internal server error response.
 * This class extends the `ErrorResponse` class and implements the `IErrorResponse` interface.
 *
 * Typically, utilized to indicate that the server encountered an
 * unexpected condition that prevented it from fulfilling the request.
 *
 * The default error message is "Internal Server Error" with an HTTP status code of 500.
 */
export class InternalServerError extends ErrorResponse implements IErrorResponse {
    constructor() { super('Internal Server Error', 500) }
}

/**
 * Represents a "Not Found" HTTP error response.
 * This class extends ErrorResponse and implements the IErrorResponse interface.
 * It is used to indicate that a requested resource could not be found.
 *
 * @class NotFound
 * @extends {ErrorResponse}
 * @implements {IErrorResponse}
 * @param {string} path - The path of the resource that was not found.
 */
export class NotFound extends ErrorResponse implements IErrorResponse {
    constructor(path: string) { super('Not Found ' + path, 404) }
}

/**
 * Represents a bad request error.
 *
 * The `BadRequest` class extends the `ErrorResponse` base class
 * and implements the `IErrorResponse` interface. It is used to
 * indicate that the request made by a client is invalid or cannot
 * be processed due to client-side issues.
 *
 * This error has a status code of 400 and a default message of
 * 'Bad Request'.
 *
 * It is commonly used in scenarios where client inputs are
 * invalid, incomplete, or violate the expected format or rules for
 * the request.
 */
export class BadRequest extends ErrorResponse implements IErrorResponse {
    constructor() { super('Bad Request', 400) }
}

/**
 * Represents an error indicating that the HTTP method used in the request is not allowed for the targeted resource.
 *
 * This class extends the `ErrorResponse` base class and implements the `IErrorResponse` interface.
 * Typically, it is used in HTTP server applications to handle scenarios where a client attempts to use
 * an unsupported HTTP method for a specific endpoint.
 *
 * The HTTP status code for this error is 405.
 */
export class MethodNotAllowed extends ErrorResponse implements IErrorResponse {
    constructor() { super('Method Not Allowed', 405) }
}


/**
 * Represents an unauthorized error.
 *
 * The `Unauthorized` class extends the `ErrorResponse` base class
 * and implements the `IErrorResponse` interface. It is used to
 * indicate that the request requires user authentication.
 *
 * This error has a status code of 401.
 */
export class Unauthorized extends ErrorResponse implements IErrorResponse {
    constructor() {
        super('Unauthorized', 401)
    }
}

/**
 * Represents a forbidden error.
 *
 * The `Forbidden` class extends the `ErrorResponse` base class
 * and implements the `IErrorResponse` interface. It is used to
 * indicate that the server understands the request but refuses
 * to authorize it.
 *
 * This error has a status code of 403.
 */
export class Forbidden extends ErrorResponse implements IErrorResponse {
    constructor() {
        super('Forbidden', 403)
    }
}

/**
 * Represents a conflict error.
 *
 * The `Conflict` class extends the `ErrorResponse` base class
 * and implements the `IErrorResponse` interface. It is used to
 * indicate that the request could not be completed due to a
 * conflict with the current state of the target resource.
 *
 * This error has a status code of 409.
 */
export class Conflict extends ErrorResponse implements IErrorResponse {
    constructor() {
        super('Conflict', 409)
    }
}

/**
 * Represents an "unprocessable entity" error.
 *
 * The `UnprocessableEntity` class extends the `ErrorResponse` base class
 * and implements the `IErrorResponse` interface. It is used to
 * indicate that the request was well-formed but was unable to be
 * followed due to semantic errors.
 *
 * This error has a status code of 422.
 */
export class UnprocessableEntity extends ErrorResponse implements IErrorResponse {
    constructor() {
        super('Unprocessable Entity', 422)
    }
}

/**
 * Represents a "too many requests" error.
 *
 * The `TooManyRequests` class extends the `ErrorResponse` base class
 * and implements the `IErrorResponse` interface. It is used to
 * indicate that the user has sent too many requests in a given
 * amount of time, which triggers rate-limiting.
 *
 * This error has a status code of 429.
 */
export class TooManyRequests extends ErrorResponse implements IErrorResponse {
    constructor() {
        super('Too Many Requests', 429)
    }
}