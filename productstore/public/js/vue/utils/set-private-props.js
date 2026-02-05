/**
 * Remove settings from each first level property depth
 * - this will prevent any property values from being editable
 * @param {Object<any>} obj // object or instantiated class
 */
export default function(obj) {
    const proxy = new Proxy(
        obj,
        {
            get() {
                return Reflect.get(...arguments);
            },
            set: () => false
        }
    );

    return proxy;
}
