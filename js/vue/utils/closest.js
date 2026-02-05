export default {
    getClosestParent: (element, selector) => {
        // Element.matches() polyfill
        if(!Element.prototype.matches) {
            Element.prototype.matches =
                Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function(s) {
                    const matches = (this.document || this.ownerDocument).querySelectorAll(s);
                    let i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {
                        //
                    }
                    return i > -1;
                };
        }

        let complete = false;
        let found = null;

        while (!complete) {
            element = element.parentNode;

            if(element.matches(selector)) {
                found = element;
                complete = true;
            } else {
                if(element === document) {
                    complete = true;
                }
            }
        }

        return found;
    }
};
