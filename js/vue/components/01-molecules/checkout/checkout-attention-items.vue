<template>
    <div>
        <div v-if="showErrorMessage" class="error-message">{{ errorMessage }}</div>

        <m-attention-items
            ref="attention-items"
            :attention-items="attentionItems"
            :button-class="buttonClass"
            :defer-on-load="true"
            :disabled="disabled"
            :has-sequence-open-error-on-checkout="hasSequenceOpenError"
            :show-sequence-open-error-on-checkout="showSequenceOpenErrorOnCheckout"
            :show-improved-c-t-a-checkout="showImprovedCTACheckout"
            :excluded-inline-attention-items="excludedInlineAttentionItems"
            :hide="hide"
            :handler="placeOrder"
            :is-checkout-edit-account-info="isCheckoutEditAccountInfo"
            :is-sticky-toast-visible="isStickyToastVisible"
            :visually-disabled="visuallyDisabled">

            <slot />

            <template v-if="$slots['between']" v-slot:between>
                <slot name="between" />
            </template>

            <template v-slot:inline-messages>
                <span v-html="snippets"></span>
            </template>
        </m-attention-items>

        <component
            :is="modal.component"
            v-for="(modal, i) in modalQueue"
            ref="modal"
            :key="i"
            :data="modal.data" />
    </div>
</template>

<script>
    import payMethodExpired from './modals/checkout-pay-method-expired.vue';
    import { mapGetters, mapMutations } from 'vuex';

    // tertiary modal wrapping - priority is based on order of object: https://www.stefanjudis.com/today-i-learned/property-order-is-predictable-in-javascript-objects-since-es2015/
    const TERTIARY_MODALS = {
        payMethodExpired
    };

    export default {
        name: 'MCheckoutAttentionItems',
        props: {
            attentionItems: {
                type: Array,
                default: () => []
            },
            buttonClass: {
                type: String,
                default: '-cartCheckout'
            },
            disabled: {
                type: Boolean,
                default: false
            },
            handler: {
                type: Function,
                required: true
            },
            hasSequenceOpenError: {
                type: Boolean,
                default: false
            },
            hide: {
                type: Boolean,
                default: false
            },
            errorMessage: {
                type: String,
                default: ''
            },
            excludedInlineAttentionItems: {
                type: Array,
                default: () => []
            },
            isCheckoutEditAccountInfo: {
                type: Boolean,
                default: false
            },
            isStickyToastVisible: {
                type: Boolean,
                default: false
            },
            showImprovedCTACheckout: {
                type: Boolean,
                default: false
            },
            showSequenceOpenErrorOnCheckout: {
                type: Boolean,
                default: false
            },
            showErrorMessage: {
                type: Boolean,
                default: false
            },
            visuallyDisabled: {
                type: Boolean,
                default: false
            },
            /**
             * @typedef {{
             *  active: boolean,
             *  data: Object<string, any>,
             *  forceLoad: boolean,
             *  toggleLoad: boolean,
             *  snippet: string,
             * }} TertiaryModal
             */
            /**
             * object to define the data for each modal and whether or not the modal will open
             * - object key will be a string matching the modal property name in TERTIARY_MODALS map
             * @type {Object<string, TertiaryModal>}
             */
            explicitAttentionItems: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                /**
                 * @typedef {{
                 *  component: Vue,
                 *  data: Object<string, any>,
                 *  snippet: string
                 * }} QueuedModal
                 */
                /** @type {Array<QueuedModal>} */
                modalQueue: [],
                snippets: ''
            };
        },
        computed: {
            ...mapGetters('attentionItems', ['attentionItemErrorMessages', 'messages'])
        },
        watch: {
            attentionItemErrorMessages() {
                this.generateSnippets();
            },
            explicitAttentionItems() {
                this.generateSnippets();
                this.generateModalQueue();
            }
        },
        created() {
            this._loaded = false;
            this.$once('onLoad', this.onLoad);
        },
        mounted() {
            if(this.explicitAttentionItems) {
                this.generateSnippets();
                this.generateModalQueue();
            }

            // GA
            this.dataLayerPushError(this.attentionItems, this.messages);
        },
        methods: {
            ...mapMutations('attentionItems', ['UPDATE_ERROR_MESSAGES_FOR_STICKY_TOAST_MODAL']),

            dataLayerPushError(ai, msg) {
                if(msg?.length) {
                    const messagesArr = msg.split('|');
                    ai.map((item, index) => {
                        const content = messagesArr[index];
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = content;
                        const finalTxt = tempDiv.textContent.replace('error_outline', '').trim();
                        if(finalTxt) {
                            window.dataLayer && window.dataLayer.push({
                                'event': 'Error State',
                                'errorType': 'Checkout Error',
                                'errorMessage': finalTxt
                            });
                        }
                    });
                }
            },
            generateModalQueue() {
                this.modalQueue =
                    Object.entries(this.explicitAttentionItems)
                        .filter(([ key, { active }]) => active)
                        .map(([key, { data, forceLoad, snippet, toggleLoad }]) => ({
                            component: TERTIARY_MODALS[key],
                            data,
                            forceLoad,
                            snippet,
                            toggleLoad: toggleLoad ?? true
                        }));
            },
            generateSnippets() {
                const snippetArr = Object.values(this.explicitAttentionItems)?.filter(ai => ai.active).map(ai => ai.snippet) || [];
                this.snippets = snippetArr.join('');
                if(this.snippets) this.UPDATE_ERROR_MESSAGES_FOR_STICKY_TOAST_MODAL(this.snippets);
            },
            onLoad() {
                if(!this._loaded) {
                    this._loaded = true;

                    this.$nextTick(() => {
                        const index = this.modalQueue.findIndex(modal => modal.forceLoad);
                        if(index > -1) {
                            if(this.$refs['modal'][index]) {
                                this.$refs['modal'][index].$emit('show');
                            }
                        } else {
                            this.$refs['attention-items'].$emit('onLoad');
                        }
                    });
                }
            },
            placeOrder() {
                const index = this.modalQueue.findIndex(modal => modal.toggleLoad);
                // Sequence errors to take precedence
                if(!this.hasSequenceOpenError && this.modalQueue.length > 0) {
                    if(this.$refs['modal'][index]) {
                        this.$refs['modal'][index].$emit('show');
                    }
                } else {
                    this.handler();
                }
            }
        }
    };
</script>
