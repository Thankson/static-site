export default {
    methods: {
        unsetPreComponentLoader () {
            let preComponentLoader = this.$el.closest('.preComponentLoader');
            if(preComponentLoader) {
                preComponentLoader.classList.add('-preComponentLoaded');
            }
        }
    }
};
