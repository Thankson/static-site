const defaultMessage = 'A generic error occured with the request';

/**
 * log api errors to console
 * @param {string} route url of api triggering error
 * @param {?string} error http based error (e.g. error code, etc)
 * @param {?Array<string>} errorMessages error message array from server
 */
export default function(route, error, errorMessages) {
    const log = `API ERROR: ${route}\n${error || (Array.isArray(errorMessages) && errorMessages.join('\n')) || defaultMessage}`;
    console.warn(log);
}
