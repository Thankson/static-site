<template>
    <div>
        <component
            :is="useSequenceStyle ? 'o-checkout-sequence' : 'o-checkout-accordion'"
            :ref="useSequenceStyle ? 'sequence' : 'accordion'"
            :has-error="paymentMethodError"
            :is-guest="isGuest"
            :is-cn="isCn"
            :gtm-id="248"
            :title="title"
            :error-aria-label="errorAriaLabel"
            container-type="fieldset"
            title-type="legend"
            :title-copy="titleCopy"
            :sequence-index="sequenceIndex"
            :script-id="scriptId"
            sequential-section-class-modifier="mb-0"
            sequential-title-class-modifier="mt-40"
        >

            <template v-slot:selected-title>
                <CheckoutPayLabel
                    :expired-label="expiredLabel"
                    :expires-label="expiresLabel"
                />
            </template>

            <div
                v-for="(method, index) in payMethodsSorted"
                :key="method.PayMethodId"
                class="o-checkoutAccordion__radio">

                <m-radio
                    v-model="selectedIndex"
                    :class="method.ClassMod"
                    name="CheckoutPaymentMethod"
                    :input-value="index"
                    mods="w-auto flex-1">

                    <a-pay-label
                        :class="isCn ? 'hidden' : 'flex'"
                        :account-number-preview="method.LastFourDigitsOfAccount"
                        :display-name="method.PaymethodNameDisplay"
                        :card-brand-name="method.CreditCardDescription"
                        :expiration-date="method.ExpirationDisplay"
                        :expires-label="expiresLabel"
                        :expired-label="expiredLabel"
                        :expires-soon="method.ExpiresSoon"
                        :is-expired="method.Expired"
                        :image="method.PayMethodImage"
                        :name-on-account="method.NameOnAccount"
                        :type="method.PayMethodType"
                        :card-masking="method.MaskingCondensed"
                        :is-cn="isCn" />

                    <a-pay-label
                        :class="isCn ? 'flex' : 'hidden'"
                        :display-name="method.Text"
                        :image="method.Image"
                        :is-cn="isCn" />
                </m-radio>

                <div
                    v-if="!isCn"
                    class="o-checkoutAccordion__editDeleteGroup">

                    <a
                        v-if="isEditable(method)"
                        class="o-checkoutAccordion__edit"
                        :class="{ '-payIcon': method.PayMethodImage && method.PayMethodImage.Url }"
                        :href="getEditLink(method)"
                        :aria-label="getEditAriaLabel(method)">

                        <span class="font-material text-base leading-base" aria-hidden="true">edit</span>
                        <span class="uppercase pl-5">{{ editLabel }}</span>
                    </a>

                    <CheckoutDeletePaymentMethod
                        v-if="method.PayMethodId && isDeletable(method)"
                        class="o-checkoutAccordion__delete"
                        :cancel-label="modalLabelsDeletePayMethod.Cancel"
                        :delete-label="modalLabelsDeletePayMethod.Delete"
                        :is-default="Boolean(method.PayMethodDefaults.length)"
                        :manage-pay-methods-link="{ text: modalLabelsDeletePayMethod.ManagePayMethods, url: modalLabelsDeletePayMethod.ManagePayMethodsUrl }"
                        :modal-heading="modalLabelsDeletePayMethod.DeletePayMethodHeading"
                        :modal-desc="modalLabelsDeletePayMethod.DeletePayMethodDetails"
                        :modal-heading-default="modalLabelsDeletePayMethod.DeletePayMethodDefaultHeading"
                        :modal-desc-default="modalLabelsDeletePayMethod.DeletePayMethodDefaultDetails"
                        :modal-heading-selected="modalLabelsDeletePayMethod.DeletePayMethodSelectedHeading"
                        :modal-desc-selected="modalLabelsDeletePayMethod.DeletePayMethodSelectedDetails"
                        :modal-cta-selected="modalLabelsDeletePayMethod.DeletePayMethodSelectedAction"
                        :pay-method-id="method.PayMethodId"
                        data-testid="button-checkoutAccordion_delete"
                        @deleting-pay-method="(args) => $emit('deletingPayMethod', args)">

                        <a-icon-svg icon-name="trash"></a-icon-svg>
                        <span class="sr-only">{{ deleteLabel }} <span v-html="method.LastFourDigitsOfAccount"></span></span>
                    </CheckoutDeletePaymentMethod>
                </div>
            </div>

            <div v-if="$slots['default']" class="o-checkoutAccordion__action">
                <slot />
            </div>

            <template v-if="selectedPayMethod && editGuestLink" v-slot:guest-button>
                <a
                    class="o-checkoutAccordion__edit"
                    :href="editGuestLink">

                    <span class="font-material text-base leading-base" aria-hidden="true">edit</span>
                    <span class="uppercase pl-5">{{ editLabel }} <span class="sr-only" v-html="selectedPayMethod.PaymethodNameDisplay + ' ' + selectedPayMethod.LastFourDigitsOfAccount"></span></span>
                </a>
            </template>
        </component>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import CheckoutDeletePaymentMethod from '../../00-atoms/checkout/checkout-delete-payment-method.vue';
    import CheckoutPayLabel from '../../01-molecules/checkout/checkout-pay-label.vue';
    import paymentMethodsMixin from '../../../mixins/payment-methods';

    export default {
        name: 'OCheckoutPaymentMethods',
        components: {
            CheckoutDeletePaymentMethod,
            CheckoutPayLabel
        },
        mixins: [ paymentMethodsMixin ],
        props: {
            scriptId: {
                type: String,
                default: ''
            },
            sequenceIndex: {
                type: Number,
                required: true
            },
            titleCopy: {
                type: String,
                default: ''
            },
            useSequenceStyle: {
                type: Boolean,
                default: false
            }
        },
        mounted() {
            if(this.useSequenceStyle) {
                this.completeSequence({
                    isActive: false,
                    index: this.sequenceIndex,
                    loading: false
                });
            }
        },
        methods: {
            ...mapActions('sequentialSections', ['completeSequence']),
            isDefault(method) {
                return Boolean(method.PayMethodDefaults.length);
            },
            isDeletable(method) {
                // Accomodate for the fact that the method may not have the method.CanBeDeleted property set at all
                if(this.isDefault(method) && (this.hideDefaultPaymethodLink ||
                    this.hideDeleteDefaultPaymethodLink)) return false;
                return method.CanBeDeleted !== false;
            },
            isEditable(method) {
                if(this.isDefault(method) && this.hideDefaultPaymethodLink) return false;
                return method.IsEditable && method.PayMethodId && this.editLink && !this.isCn;
            }
        }
    };
</script>
