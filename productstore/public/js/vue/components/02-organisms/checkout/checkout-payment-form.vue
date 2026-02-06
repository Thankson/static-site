<template>
    <div>
        <h2
            v-if="!payMethodId && !isFirstPayMethod"
            class="text-xl font-bold text-gray-150 mt-40 mb-10">

            {{ getLocalizationProp('Labels.PayMethodSection.NewPayMethod', 'New Pay Method') }}
        </h2>

        <payment-form
            ref="payment-form"
            default-checkbox-label-mods="text-base font-normal leading-tight"
            default-checkbox-title-mods="-oleCheckout"
            class="pt-1"
            :button-continue="submitCTA"
            :check-first-time-user="!isOwingBalance"
            :hide-default-checkboxes="isFirstPayMethod"
            :hide-one-time-use="isFirstPayMethod"
            :hide-one-time-use-paymethod="hideOneTimeUsePaymethod"
            :hidden-error-types="hiddenErrorTypes"
            :is-actions-aside="false"
            :is-cn="$env.IsCn"
            :is-checkout-direct-debit-a-form="isCheckoutDirectDebitAForm"
            :is-enrollment="false"
            :is-inline="true"
            :is-guest-checkout="isRiverbend ? false : isGuest"
            :is-ole-checkout="true"
            :is-owing-balance="isOwingBalance"
            :riverbend-labels="labels"
            new-payment-method-title-mods="sr-only"
            one-time-use-mods="mb-5"
            one-time-use-label-mods="text-base font-normal"
            one-time-use-highlight-mods="font-medium"
            :owing-balance-customer-id="owingBalanceCustomerId"
            :paypal-email-checkout="paypalEmailCheckout"
            :paypal-nonce-checkout="paypalNonceCheckout"
            :payment-id-value="payMethodId"
            :script-id="overrideScriptId"
            :token="getLocalizationProp('Data.PaymentForm.Token', null)"
            @saved="onPaymentSaved"
            @update-paypal-error="handlePayPalError"
            @riverbend-payment-saved="({ payMethodId }) => onPaymentSaved(payMethodId)">

            <template #credit="$slotScope">
                <CheckoutPaymentFormCredit
                    :current-payment-method="$slotScope.paymentMethodTypeValue"
                    :card-number="$slotScope.cardNumberDefaults"
                    :dirty="$slotScope.dirty"
                    :is-enrollment="true"
                    :is-guest-checkout="isGuest"
                    :label-expires="getLocalizationProp('Labels.Checkout.Expires', 'Expires')"
                    :label-expired="getLocalizationProp('Labels.Checkout.Expired', 'Expired')"
                    :mask-card-number="$slotScope.isEditing"
                    :rb-is-editing="rbIsEditing"
                    :script-id="overrideScriptId"
                    :should-call-addresses-api="!isOwingBalance"
                    :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                    :use-default-layout="$slotScope.useDefaultCreditLayout"
                    :use-nick-name="false"
                    @validate="(isValid) => $slotScope.setFormValidation(isValid)"
                />
            </template>

            <template #checking="$slotScope">
                <CheckoutPaymentFormChecking
                    :dirty="$slotScope.dirty"
                    :script-id="overrideScriptId"
                    @validate="(isValid) => $slotScope.setFormValidation(isValid)"
                />
            </template>

            <!-- For connecting to PayPal account -->
            <template #paypal="$slotScope">
                <PaymentFormPaypal
                    :is-checkout="true"
                    :paypal-client-token="paypalClientToken"
                    :paypal-error-label="getLocalizationProp('Labels.PaymentForm.PayPal.Setup')"
                    :show-pay-pal-error="showPayPalError"
                    @paypal-data="data => handlePayPalDataAndSubmit(data, $slotScope.handleSubmit)"
                />
            </template>

            <template #direct-debit="$slotScope">
                <!-- Checkout - Direct debit- Form-Submit view -->
                <CheckoutPaymentFormDirectDebit
                    v-if="isCheckoutDirectDebitAForm"
                    :dirty="$slotScope.dirty"
                    :script-id="overrideScriptId"
                    @validate="(isValid) => $slotScope.setFormValidation(isValid)"
                />
                <!-- Checkout - Direct Debit - Form-Download view -->
                <PaymentFormDirectDebit
                    v-else
                    :is-enrollment="true"
                    :is-guest-checkout="isGuest"
                    :script-id="overrideScriptId" />
            </template>

            <template #actions="$slotScope">
                <div
                    v-if="savePayMethodNotice"
                    class="mb-20"
                    :class="!isFirstPayMethod ? 'mt-10' : ''"
                    @click="onShowMore($event)"
                    v-html="savePayMethodNotice"
                />

                <div
                    v-if="showMore && !isRiverbend"
                    class="mb-20"
                    @click="onShowLess($event)"
                    v-html="savePayMethodMoreNotice"
                />

                <div class="flex-none md:max-w-1_2 md:mr-15" :class="isRiverbend ? '-rbContinue' : 'w-full'">
                    <v-button
                        :cta="submitCTA"
                        class="justify-center w-full text-base text-center py-12"
                        type="submit"
                        @click="[$slotScope.handleSubmit($event),gtmTrackAction({id: 452, text: submitCTA}, $event) ]"
                    />
                </div>

                <div
                    v-if="!isFirstPayMethod"
                    class="flex-none mt-20 md:mt-0 md:ml-15" :class="{'w-full md:w-auto' : isRiverbend && showImprovedCTACheckout}">

                    <v-button
                        :cta="getLocalizationProp('Labels.PaymentForm.FormSubmit.Cancel', 'Cancel')"
                        class="-cancelPay"
                        @click="$emit('cancel')"
                    />
                </div>
            </template>
        </payment-form>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import CheckoutPaymentFormChecking from '../../01-molecules/checkout/checkout-payment-form-checking.vue';
    import CheckoutPaymentFormCredit from '../../01-molecules/checkout/checkout-payment-form-credit.vue';
    import CheckoutPaymentFormDirectDebit from '../../01-molecules/checkout/checkout-payment-form-direct-debit.vue';
    import PaymentFormDirectDebit from '../../01-molecules/my-account/payment-form-direct-debit.vue';
    import PaymentFormPaypal from '../../01-molecules/my-account/payment-form-paypal.vue';
    import handlePayPalCheckoutDataMixin from '../../../mixins/handle-paypal-data';
    import * as paymentFormErrors from '../../../utils/payment-form-errors';

    export default {
        name: 'OCheckoutPaymentForm',
        components: {
            CheckoutPaymentFormChecking,
            CheckoutPaymentFormCredit,
            CheckoutPaymentFormDirectDebit,
            PaymentFormPaypal,
            PaymentFormDirectDebit
        },
        mixins: [ localizationMixin, handlePayPalCheckoutDataMixin ],
        props: {
            hideOneTimeUsePaymethod: {
                type: Boolean,
                default: false
            },
            isFirstPayMethod: {
                type: Boolean,
                default: false
            },
            isGuest: {
                type: Boolean,
                default: false
            },
            isOwingBalance: {
                type: Boolean,
                default: false
            },
            isRiverbend: {
                type: Boolean,
                default: false
            },
            owingBalanceCustomerId: {
                type: Number,
                default: null
            },
            payMethodId: {
                type: [ Number, String ],
                default: null
            },
            rbIsEditing: {
                type: Boolean,
                default: true
            },
            labels: {
                type: Object,
                default: () => ({Labels: {}, Data: {}})
            }
        },
        data() {
            return {
                overrideScriptId: '',
                showMore: false,
                paypalEmailCheckout: '',
                paypalNonceCheckout: '',
                paypalNonceReceived: false,
                showPayPalError: false
            };
        },
        computed: {
            ...mapState('paymentMethod', ['paypalClientToken']),
            formAccess() {
                return this.getLocalizationProp('Data.PaymentForm.DirectDebit.FormAccess');
            },
            hiddenErrorTypes() {
                return [
                    paymentFormErrors.prePaidCard,
                    paymentFormErrors.cardExpiredDate
                ];
            },
            // Note this is specific to checkout payment form, there is another property for my account payment form isDirectDebitAForm
            isCheckoutDirectDebitAForm() {
                return this.getLocalizationProp('Data.IsDirectDebitAForm', false);
            },
            savePayMethodNotice() {
                return this.getLocalizationProp('Labels.PayMethodSection.SavePayMethodNotice', null)?.replace(
                    '<a>',
                    '<a role="button" class="text-green underline" tabindex="0" data-toggle="more">'
                );
            },
            showImprovedCTACheckout() {
                return this.getLocalizationProp('Data.ShowImprovedCTACheckout', false);
            },
            savePayMethodMoreNotice() {
                return this.getLocalizationProp('Labels.PayMethodSection.SavePayMethodMoreNotice', null)?.replace(
                    '<a>',
                    '<a role="button" class="text-green underline" tabindex="0" data-toggle="less">'
                );
            },
            submitCTA() {
                if(this.showImprovedCTACheckout) {
                    return this.getLocalizationProp('Labels.PayMethodSection.SavePayMethod');
                }
                return this.getLocalizationProp('Labels.CTA.Continue');
            }
        },
        created() {
            this._showMoreEl = null;
            this._scriptId = `localization-override-${this._uid}`;
        },
        mounted() {
            this.setupLocalization();
        },
        methods: {
            async handlePayPalCheckoutData(data) {
                // Handle the received nonce and email
                const { nonce, email } = data;

                if(nonce && email) {
                    this.paypalNonceReceived = true;
                    this.paypalEmailCheckout = email;
                    this.paypalNonceCheckout = nonce;
                } else {
                    console.error('Error: No nonce or email received from PayPal');
                    this.paypalNonceReceived = false;
                }
            },
            async handlePayPalDataAndSubmit(data, handleSubmit) {
                await this.handlePayPalCheckoutData(data);
                // Ensure handlePayPalCheckoutData is completed before handleSubmit is called
                handleSubmit(null);
            },
            onPaymentSaved(payMethodId) {
                this.$emit('saved', {
                    customerId: this.getLocalizationProp('Data.PaymentForm.CustomerId') || this.getLocalizationProp('Data.CustomerId'),
                    payMethodId
                });
            },
            onShowMore(evt) {
                const el = evt.srcElement;
                if(el.dataset?.toggle === 'more') {
                    this.showMore = true;

                    this._showMoreEl = el;
                    this._showMoreEl.classList.add('sr-only');
                }
            },
            onShowLess(evt) {
                const el = evt.srcElement;
                if(el.dataset?.toggle === 'less') {
                    this.showMore = false;
                    this._showMoreEl?.classList.remove('sr-only');
                    this._showMoreEl?.focus();
                }
            },
            /**
             * override payment-form.vue localization
             */
            setupLocalization() {
                // organize the localization into a schema the payment-form.vue will recognize
                const localization = {
                    Labels: this.getLocalizationProp('Labels.PaymentForm', {}),
                    Data: this.getLocalizationProp('Data.PaymentForm', {})
                };
                const json = document.createTextNode(JSON.stringify(localization));

                // create a new script element in the DOM for payment-form.vue to read from
                const scriptEl = document.createElement('script');
                scriptEl.setAttribute('id', this._scriptId);
                scriptEl.setAttribute('type', 'application/json');
                scriptEl.appendChild(json);
                document.body.appendChild(scriptEl);

                // update the localization script id so payment-form.vue will update any localization references
                this.overrideScriptId = this._scriptId;
            },
            handlePayPalError(value) {
                // Update the component's data or perform any other actions
                this.showPayPalError = value;
            }
        }
    };
</script>
