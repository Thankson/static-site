import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
import { mapState } from 'vuex';

export default {
    props: {
        code: {
            type: String,
            required: true
        },
        isCheckoutEditAccountInfo: {
            type: Boolean,
            default: false
        },
        /** @typedef { import("../utils/attention-items").ModalData } ModalData */
        /** @type {ModalData} */
        modalData: {
            type: Object,
            default: () => {}
        }
    },
    mounted() {
        this.setupListeners();
    },
    computed: {
        ...mapState('attentionItems', ['isRiverbend']),
        data() {
            return this.modalData.Data || {};
        },
        labels() {
            return this.modalData.Labels || {};
        },
        parameters() {
            return this.modalData.Parameters || [];
        },
        rteContent() {
            return replaceTokenArray(this.modalData.RteContent, this.parameters);
        },
        /**
         * sections formatted as an object instead of array
         * - key will by the section Type
         * - value will be an object with the remaining section info
         * @returns {{ Heading: string, Type: Object<string, any>> }}
         */
        sections() {
            let sections = {};
            if(this.modalData.Sections && this.modalData.Sections.length > 0) {
                this.modalData.Sections.forEach(({ Type, Heading, Data }) => {
                    sections[Type] = { Heading, Data };
                });
            }
            return sections;
        }
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
