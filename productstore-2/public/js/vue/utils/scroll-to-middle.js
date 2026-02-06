/**
 * @typedef {Object} Options
 * @property {number?} duration
 * @property {Function?} complete
 *
 * @type {Options}
 */
const DEFAULT_OPTIONS = {
    duration: 1000,
    complete: null
};

/**
 * scroll so that element is in the middle of the viewport
 * @param {Node} el
 * @param {Options?} options
 */
export default function(el, options) {
    if(!el || el?.nodeType !== Node.ELEMENT_NODE) return;

    options = { ...DEFAULT_OPTIONS, ...options };

    const top = el.getBoundingClientRect().top;
    const pageTop = top + window.pageYOffset;
    const newPosition = pageTop - (window.innerHeight / 2);
    $('html, body').animate({ scrollTop: newPosition }, options.duration, () => options.complete?.());
}
