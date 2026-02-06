export default {
    props: {
        data: {
            type: Object,
            default: () => {}
        }
    },
    mounted() {
        this.setupListeners();
    },
    methods: {
        hide() {
            this.$modal.hide();
        },
        show() {
            this.$modal.show();

            this.$modal.$once.hide(() => {
                this.$emit('hide', { code: this.code });
            });
        },
        setupListeners() {
            this.$on('show', this.show);
        }
    }
};
