const BACKUP_ORDER = 'BackupOrder';
const HOME_SECURITY = 'HomeSecurity';
const PRODUCTS = 'Products';
const RIVERBEND = 'Riverbend';
const SERVICES = 'Services';

export const defaultPaymentTypes = {
    backupOrder: BACKUP_ORDER,
    homeSecurity: HOME_SECURITY,
    products: PRODUCTS,
    riverbend: RIVERBEND,
    services: SERVICES
};

/**
 * check if payment method is default based on passing in type constant
 * @param {string|Array<string>} dflt string or array of strings indicating payment method defaults
 * @param {string} defaultType string of type to check against
 * @returns {boolean} payment method dflt arg is default based on defaultType argument
 */
const isDefault = (dflt, defaultType) => Array.isArray(dflt) ? dflt.includes(defaultType) : dflt === defaultType;

/**
 * check if payment method is a backup order default
 * @param {string|Array<string>} dflt string or array of strings indicating payment method defaults
 * @returns {boolean} whether or not the dflt argument indicates a backup order default
 */
export const isBackupOrderDefault = (dflt) => isDefault(dflt, BACKUP_ORDER);

/**
 * check if payment method is a home security default
 * @param {string|Array<string>} dflt string or array of strings indicating payment method defaults
 * @returns {boolean} whether or not the dflt argument indicates a home security default
 */
export const isHomeSecurityDefault = (dflt) => isDefault(dflt, HOME_SECURITY);

/**
 * check if payment method is a products default
 * @param {string|Array<string>} dflt string or array of strings indicating payment method defaults
 * @returns {boolean} whether or not the dflt argument indicates a products default
 */
export const isProductsDefault = (dflt) => isDefault(dflt, PRODUCTS);

/**
 * check if payment method is a riverbend default
 * @param {string|Array<string>} dflt string or array of strings indicating payment method defaults
 * @returns {boolean} whether or not the dflt argument indicates a riverbend default
 */
export const isRiverbendDefault = (dflt) => isDefault(dflt, RIVERBEND);

/**
 * check if payment method is a services default
 * @param {string|Array<string>} dflt string or array of strings indicating payment method defaults
 * @returns {boolean} whether or not the dflt argument indicates a services default
 */
export const isServicesDefault = (dflt) => isDefault(dflt, SERVICES);

const CHECKING_REGEX = /^ACH(Checking|Savings)/i;

/**
 * check if payment method is a checking account
 * @param {string} type string indicating the payment type
 * @returns {boolean} whether or not the payment type is checking
 */
export const isChecking = (type) => CHECKING_REGEX.test(type);
