<template>
    <div
        class="o-checkoutAccordion"
        :class="[{'-hasError': hasError},{'-isCn': isCn}]">

        <div v-if="!hasShippingUnavailableError">
            <accordion
                v-if="!isGuest"
                ref="accordion"
                :content-id="accordionId"
                :toggle-id="`${accordionId}__toggler`"
                :gtm-toggle-id="gtmId"
                :visible="isVisible"
                :disabled="disabled"
                :aria-label="hasError ? errorAriaLabel : null"
                mod-title="bg-white rounded"
                wrapper-mods="-checkout"
                @show="visible"
                @hide="isVisible = false">

                <template v-slot:icon="$accordion">
                    <span class="o-checkoutAccordion__icon">
                        <a-icon size="inherit" :class="[ $accordion.isOpened ? '-flip': '', $accordion.isReady ? '-transition' : '']">
                            keyboard_arrow_down
                        </a-icon>
                    </span>
                </template>

                <template v-slot:title="$accordion">
                    <div class="o-checkoutAccordion__title">
                        <span class="o-checkoutAccordion__label">
                            {{ title }}
                        </span>

                        <template v-if="!$accordion.isOpened">
                            <span v-if="selectedTitle" v-html="selectedTitle"></span>
                            <span v-else :class="isCn ? 'flex-initial md:pr-10 self-start mt-5': 'flex-1'">
                                <slot name="selected-title" />
                            </span>
                            <span v-if="needInvoice && isCn" v-html="needInvoice"></span>
                            <span v-else class="flex-initial" @click.stop="() => false">
                                <slot name="need-invoice" />
                            </span>
                        </template>
                        <template v-else>
                            <span v-if="selectedTitle && !isCn" v-html="selectedTitle"></span>
                        </template>
                    </div>
                </template>

                <div class="o-checkoutAccordion__content">
                    <slot />
                </div>
            </accordion>
            <div v-else class="o-accordion -checkout -guest">
                <h2 class="o-accordion__title bg-white rounded">
                    <div class="o-accordion__toggler -vue">
                        <div class="o-checkoutAccordion__title">
                            <span class="o-checkoutAccordion__label">
                                {{ title }}
                            </span>
                            <span v-if="selectedTitle" v-html="selectedTitle"></span>
                            <span v-else :class="isCn ? 'flex-initial md:pr-10': 'flex-1'">
                                <slot name="selected-title" />
                            </span>
                            <span v-if="needInvoice && isCn" v-html="needInvoice"></span>
                            <span v-else class="flex-initial" @click.stop="() => false">
                                <slot name="need-invoice" />
                            </span>
                        </div>
                        <div class="o-checkoutAccordion__button">
                            <slot name="guest-button" />
                        </div>
                    </div>
                </h2>
            </div>
        </div>

        <!-- shipping unavailable: -->
        <div v-else class="o-checkoutAccordion__shippingUnavailable">
            <div class="flex">
                <span class="o-checkoutAccordion__shippingUnavailableLabel">{{ title }}</span>
                <span class="text-red">
                    <span class="text-xl italic pr-15">{{ errorShippingUnavailableLabel }}</span>
                    <span class="underline cursor-pointer" @click="openModal">{{ errorLearnWhyLabel }}</span>
                </span>
            </div>

            <span class="text-2xl mr-10 text-gray-150">
                <a-icon size="inherit">keyboard_arrow_down</a-icon>
            </span>
        </div>

        <span
            v-if="hasError && !isGuest"
            class="o-checkoutAccordion__alert"
            aria-hidden="true">

            error_outline
        </span>
    </div>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'OCheckoutAccordion',
        mixins: [
            safeId
        ],
        safeIds: [
            'accordionId'
        ],
        props: {
            gtmId: {
                type: Number,
                default: null
            },
            errorAriaLabel: {
                type: String,
                default: 'Error attention required'
            },
            errorLearnWhyLabel: {
                type: String,
                default: ''
            },
            hasShippingUnavailableError: {
                type: Boolean,
                default: false
            },
            errorShippingUnavailableLabel: {
                type: String,
                default: ''
            },
            hasError: {
                type: Boolean,
                default: false
            },
            selectedTitle: {
                type: String,
                default: ''
            },
            needInvoice: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                required: true
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isGuest: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                isVisible: false,

                // dynamic ID
                accordionId: ''
            };
        },
        created() {
            this.$on('hide', () => (this.closed()));
            this.$on('show', () => (this.visible()));
            this.$on('focus', () => (this.$refs['accordion']?.$emit('focus')));
        },
        methods: {
            closed() {
                this.isVisible = false;
            },
            openModal() {
                this.$emit('open-modal');
            },
            visible() {
                this.isVisible = true;
            }
        }
    };
</script>
