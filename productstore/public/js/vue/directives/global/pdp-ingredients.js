let unwatch; // will contain watcher instance that will unbind watcher action when ran

function toggle(el, hasIngredients, userFlags) {
    if(typeof hasIngredients !== 'boolean') {
        return;
    }

    if(hasIngredients) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

export default {
    name: 'pdp-ingredients',
    inserted(el, binding, vnode) {
        const store = vnode.context?.$store || null;
        if(store) {
            const userFlags = store.state?.productDetailPage?.product?.userFlags || {};
            toggle(el, store.state?.jumpLinks?.hasIngredients, userFlags);

            unwatch = store.watch(
                state => state.jumpLinks.hasIngredients,
                newValue => toggle(el, newValue, userFlags)
            );
        }
    },
    unbind() {
        unwatch();
    }
};
