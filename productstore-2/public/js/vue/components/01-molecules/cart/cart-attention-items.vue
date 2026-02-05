<template>
    <div ref="attention-list" class="m-cartAttentionItems" :class="{'-sticky': isStickyAttentionItems}">
        <m-attention-items
            ref="attention-items"
            :attention-items="attentionItems"
            :button-class="buttonClass"
            :defer-on-load="true"
            :disabled="disabled"
            :handler="proceedToCheckout"
            :is-sticky-toast-visible="isStickyToastVisible">

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
    import backDatingNote from './modals/cart-back-dating-note.vue';
    import lsdVideo from './modals/cart-lsd-video.vue';
    import { mapGetters, mapMutations } from 'vuex';

    // tertiary modal wrapping - priority is based on order of object: https://www.stefanjudis.com/today-i-learned/property-order-is-predictable-in-javascript-objects-since-es2015/
    const TERTIARY_MODALS = {
        backDatingNote,
        lsdVideo
    };

    export default {
        name: 'MCartAttentionItems',
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
            /**
             * cart has two instances of AI (desktop and mobile)
             * use it when needed to fire a command only once
             */
            shouldFireOnce: {
                type: Boolean,
                default: false
            },
            handler: {
                type: Function,
                required: true
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
                default: () => {}
            },
            isStickyToastVisible: {
                type: Boolean,
                default: false
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
                snippets: '',
                isStickyAttentionItems: false
            };
        },
        computed: {
            ...mapGetters('attentionItems', ['messages'])
        },
        watch: {
            explicitAttentionItems() {
                this.generateModalQueue();
                this.generateSnippets();
            }
        },
        created() {
            this._loaded = false;
            this.$once('onLoad', this.onLoad);
        },
        mounted() {
            if(this.shouldFireOnce) this.generateModalQueue();
            // GA
            if(this.shouldFireOnce) this.dataLayerPushError(this.attentionItems, this.messages);
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
                                'errorType': 'Cart Error',
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
                            toggleLoad: toggleLoad ?? true,
                            snippet
                        }));
            },
            generateSnippets() {
                const snippets =
                    Object.entries(this.explicitAttentionItems)
                        .filter(([key, { active }]) => active)
                        .map(([key, { snippet }]) => snippet);
                this.snippets = snippets.join('');
                if(this.snippets) this.UPDATE_ERROR_MESSAGES_FOR_STICKY_TOAST_MODAL(this.snippets);
            },
            onLoad() {
                if(!this._loaded) {
                    this._loaded = true;

                    this.$nextTick(() => {
                        const index = this.modalQueue.findIndex(modal => modal.forceLoad);
                        if(index > -1) {
                            this.$refs['modal'][index].$emit('show');
                        } else {
                            this.$refs['attention-items'].$emit('onLoad');
                        }
                    });
                }
            },
            proceedToCheckout() {
                const index = this.modalQueue.findIndex(modal => modal.toggleLoad);
                if(this.modalQueue.length > 0 && index > -1) {
                    this.$refs['modal'][index].$emit('show');
                } else {
                    this.handler();
                }
            },
            updateIsStickyAttentionItems(status) {
                this.isStickyAttentionItems = status;
            }
        }
    };
</script>
