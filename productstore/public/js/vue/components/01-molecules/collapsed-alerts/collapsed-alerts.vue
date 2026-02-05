<template>
    <!-- Main alerts categories:1 -->
    <!-- 1. Sequence errors (displayed after CTA clicked once, controlled by showSequenceOpenErrorOnCheckout) -->
    <!-- 2. Additional alerts (shown after sequence errors are resolved) -->
    <!-- 3. Attention items (shown after sequence errors are resolved)) -->
    <div class="m-collapsedAlerts">
        <!--This error messages are only for riverbend start subscription-->
        <div v-if="emptyShippingAndPaymentResponses.length > 0" class="mt-10">
            <p
                class="flex text-red text-sm leading-tight mt-5 mb-12"
                role="alert">
                {{ emptyShippingAndPaymentResponses[0] }}
            </p>
        </div>
        <p
            v-else-if="sequenceOpenErrorMessagesForStickyToast.length && showSequenceOpenErrorOnCheckout"
            class="flex text-red text-sm leading-tight mt-5 mb-12"
            role="alert">
            <span class="font-material text-xs mr-3 mt-2 leading-base" aria-hidden="true">error_outline</span>
            <span v-html="sequenceOpenErrorMessagesForStickyToast[0]"></span>
        </p>
        <div v-else>
            <p
                v-if="additionalMessagesForStickyToast.length"
                class="flex text-red text-sm leading-tight mt-5 mb-12"
                role="alert">
                <span
                    v-if="!hasBackDatingNote"
                    class="font-material text-xs mr-3 mt-2 leading-base"
                    aria-hidden="true">error_outline</span>
                <span v-html="additionalMessagesForStickyToast[0]"></span>
            </p>
            <div
                v-else-if="attentionItemErrorMessages.length"
                role="alert"
                v-html="attentionItemErrorMessages[0]">
            </div>
        </div>

        <button
            v-if="showMoreButton"
            type="button"
            class="text-red underline mb-20 text-sm"
            :aria-label="showMoreLabel"
            data-testid="button-showMoreAlerts"
            @click="showMoreModal">
            {{ showMoreLabel }}
        </button>
        <!-- Modal with list of active errors/alerts -->
        <modal ref="show-more">
            <template v-slot:content>
                <ul v-if="emptyShippingAndPaymentResponses.length > 0">
                    <li
                        v-for="message in emptyShippingAndPaymentResponses"
                        :key="message">
                        <p class="flex text-red text-sm leading-tight my-10" role="alert">
                            <span
                                class="font-material text-xs mr-3 mt-2 leading-base"
                                aria-hidden="true">error_outline</span>
                            <span v-html="message"></span>
                        </p>
                    </li>
                </ul>
                <ul v-else-if="sequenceOpenErrorMessagesForStickyToast.length && showSequenceOpenErrorOnCheckout">
                    <li
                        v-for="message in sequenceOpenErrorMessagesForStickyToast"
                        :key="message">
                        <p class="flex text-red text-sm leading-tight my-10" role="alert">
                            <span
                                class="font-material text-xs mr-3 mt-2 leading-base"
                                aria-hidden="true">error_outline</span>
                            <span v-html="message"></span>
                        </p>
                    </li>
                </ul>
                <ul>
                    <li
                        v-for="message in additionalMessagesForStickyToast"
                        :key="message">
                        <p class="flex text-red text-sm leading-tight my-10" role="alert">
                            <span
                                v-if="!hasBackDatingNote"
                                class="font-material text-xs mr-3 mt-2 leading-base"
                                aria-hidden="true">error_outline</span>
                            <span v-html="message"></span>
                        </p>
                    </li>
                    <li
                        v-for="message in attentionItemErrorMessages"
                        :key="message"
                        role="alert"
                        v-html="message">
                    </li>
                </ul>
            </template>
        </modal>
    </div>
</template>

<script>
    export default {
        name: 'MCollapsedAlerts',
        props: {
            additionalMessagesForStickyToast: {
                type: Array,
                default: () => []
            },
            emptyShippingAndPaymentResponses: {
                type: Array,
                default: () => []
            },
            attentionItemErrorMessages: {
                type: Array,
                default: () => []
            },
            hasBackDatingNote: {
                type: Boolean,
                default: false
            },
            sequenceOpenErrorMessagesForStickyToast: {
                type: Array,
                default: () => []
            },
            showMoreLabel: {
                type: String,
                default: ''
            },
            showSequenceOpenErrorOnCheckout: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            showMoreButton() {
                const sequenceCount = this.showSequenceOpenErrorOnCheckout
                    ? (this.sequenceOpenErrorMessagesForStickyToast || []).length
                    : 0;
                const emptyShippingAndPaymentResponsesCount = (this.emptyShippingAndPaymentResponses || []).length;
                // attention item Snippets.Inline.RteContent value may be empty string, so we need to filter falsy values here
                const otherCount = [...(this.attentionItemErrorMessages || []), ...((this.additionalMessagesForStickyToast || []))].filter(Boolean).length;
                const messageCount = sequenceCount + emptyShippingAndPaymentResponsesCount + otherCount;
                return messageCount > 1;
            }
        },
        methods: {
            showMoreModal() {
                this.$modal.show({ ref: 'show-more' });
            }
        }
    };
</script>
