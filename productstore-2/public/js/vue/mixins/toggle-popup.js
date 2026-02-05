export default {
    data() {
        return {
            mixinRefs: []
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.mixinRefs = this.$refs;
        });
    },
    methods: {
        togglePopUp(id, gtmObj) {
            this.$nextTick(() => {
                const target = this.mixinRefs[id][0] || this.mixinRefs[id];
                target.toggleVisibility();
            });
            // GTM Tracking
            if(gtmObj) {
                window.trackAction && window.trackAction({
                    id: gtmObj.id,
                    eL: gtmObj.eL
                });
            }
        }
    }
};
