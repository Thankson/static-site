/**
 * global custom Vue event mapping
 */
export default {
    /**
     * slot change event
     * - used to toggle the state of the shelf component
     */
    shelf: {
        show: 'mela::shelf::show',
        hide: 'mela::shelf::hide'
    }
};
