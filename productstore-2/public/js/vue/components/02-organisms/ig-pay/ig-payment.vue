<template>
    <div class="o-igPayment">
        <o-checkout-accordion
            ref="accordion"
            :title="title"
            :error-aria-label="errorAriaLabel">

            <template v-slot:selected-title>
                <a-pay-label
                    v-if="selectedPay"
                    class="-selected"
                    :account-number-preview="selectedPay.LastFourDigitsOfAccount"
                    :display-name="selectedPay.PaymethodNameDisplay"
                    :expiration-date="selectedPay.ExpirationDisplay"
                    :expires-label="expires"
                    :expired-label="expired"
                    :expires-soon="selectedPay.ExpiresSoon"
                    :is-expired="selectedPay.Expired"
                    :image="selectedPay.PayMethodImage"
                    :type="selectedPay.PayMethodType"
                    :card-masking="selectedPay.MaskingCondensed" />
            </template>

            <div
                v-for="(method, index) in storedPayMethods"
                :key="index" class="pb-6 pt-3">
                <div class="o-checkoutAccordion__radio">
                    <m-radio
                        v-model="selectedIndex"
                        :class="method.ClassMod"
                        name="CheckoutPaymentMethod"
                        :input-value="index"
                        label-mods="-blue"
                        mods="w-auto flex-1">

                        <a-pay-label
                            class="flex"
                            :account-number-preview="method.LastFourDigitsOfAccount"
                            :display-name="method.PaymethodNameDisplay"
                            :expiration-date="method.ExpirationDisplay"
                            :expires-label="expires"
                            :expired-label="expired"
                            :expires-soon="method.ExpiresSoon"
                            :is-expired="method.Expired"
                            :image="method.PayMethodImage"
                            :type="method.PayMethodType"
                            :card-masking="method.MaskingCondensed" />
                    </m-radio>

                    <!-- Edit -->
                    <a
                        v-if="method.IsEditable && method.PayMethodId && editLink && editLink.Url"
                        class="o-checkoutAccordion__edit o-igPayment__edit"
                        :class="{ '-payIcon': method.PayMethodImage && method.PayMethodImage.Url }"
                        :href="getEditLink(method)"
                        :aria-label="getEditAriaLabel(method)"
                        @click="saveInfo">
                        <span class="font-material text-lg leading-base" aria-hidden="true">edit</span>
                        <span class="uppercase pl-5">{{ editLink.Text }}</span>
                    </a>
                </div>
                <!-- Card error -->
                <div v-show="showCardError(index)" class="e-formError o-igPayment__error">
                    <p class="e-formError__item o-igPayment__errorItem" role="alert" v-html="changeCardError"></p>
                </div>
            </div>

            <!-- Add payment -->
            <div class="o-igPayment__addPayment">
                <a
                    v-if="addPaymentLink && addPaymentLink.Url"
                    :target="addPaymentLink.Target"
                    class="a-button -mkt -outline o-igPayment__button -addPayment"
                    :href="addPaymentLinkUrl"
                    @click="saveInfo">
                    {{ addPaymentLink.Text }}
                </a>
            </div>
        </o-checkout-accordion>
        <!-- Checkboxes -->
        <div class="o-igPayment__checkbox">
            <div class=" m-formField -checkbox md:pt-25 pt-18">
                <m-checkbox
                    ref="payCheckbox"
                    v-model="payCheckbox"
                    name="payCheckbox"
                    :label="payCheckboxLabel || ''"
                    :label-mods="`-blue ${$v.payCheckbox.$error ? '-error': ''}`"
                    mod-class="-alignTop"
                    :script-id="scriptId"
                    @blur="$v.payCheckbox.$touch()">
                </m-checkbox>
            </div>
            <div v-show="$v.payCheckbox.$error" class="e-formError__item" role="alert" :aria-label="payCheckboxAriaLabel">
                {{ required }}
            </div>
        </div>
        <div class="o-igPayment__checkbox">
            <div class=" m-formField -checkbox -alignTop md:pt-16 pt-8 pr-1">
                <m-checkbox-rte-modal
                    v-model="$v.termsCheckbox.$model"
                    :modal-data="checkboxLocalizations"
                    my-name="termsCheckbox"
                    body-class="-mktplace"
                    :label-mods="`-blue ${$v.termsCheckbox.$error ? '-error': ''}`"
                    :script-id="scriptId"
                    @update="updateCheckbox"
                ></m-checkbox-rte-modal>
            </div>
            <div v-show="$v.termsCheckbox.$error" class="e-formError__item" role="alert" :aria-label="termsCheckboxAriaLabel">
                {{ required }}
            </div>
        </div>

        <!-- Place Order CTA -->
        <div class="o-igPayment__actions">
            <v-button class="a-button -mkt o-igPayment__button -placeOrder" :disabled="loading" @click="finishOrder">
                {{ placeOrder }}
            </v-button>
            <div v-if="loading" class="o-mktHomeSecurityPay__loading">
                <a-loading-spinner :visible="loading" size="sm" mods="-mkt" />
            </div>
        </div>
        <div v-show="apiErrorMessage" class="e-formError__item" role="alert">
            {{ apiErrorMessage }}
        </div>
    </div>
</template>

<script>
    import {mapActions, mapMutations, mapState} from 'vuex';
    import api from '@api/routes/marketplace/infoguard';
    import apiUserInfo from '@api/routes/marketplace/user/info';
    import {validationMixin} from 'vuelidate';
    import {required} from 'vuelidate/lib/validators';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import apiDefault from '@api/routes/customeraccount/paymethods/default';
    import {replaceTokenArray} from '@common/source/js/vue/utils/replace-token';
    import orderTakenBy from '@common/source/js/utils/order-taken-by';
    import { isProductsDefault } from '../../../utils/payment-methods';

    export default {
        name: 'OIgPayment',
        mixins: [validationMixin, localizationMixin],
        validations() {
            return {
                payCheckbox: {
                    required,
                    checked: value => {
                        if(value) {
                            return true;
                        }
                        return false;
                    }
                },
                termsCheckbox: {
                    required,
                    checked: value => {
                        if(value) {
                            return true;
                        }
                        return false;
                    }
                }
            };
        },
        props: {
            localizationLocal: {
                type: Object,
                default: () => {}
            },
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                apiErrorMessage: '',
                defaultServiceMethod: {},
                selectedPay: {},
                errorAriaLabel: '',
                selectedIndex: -1,
                payCheckbox: false,
                termsCheckbox: false,
                loading: false
            };
        },
        computed: {
            ...mapState('enroll', ['stepIndex']),
            ...mapState('paymentMethod', ['storedPayMethods']),
            ...mapState('enrollInfoguard', ['formData', 'selectedPlan', 'subscribers']),

            addPaymentLink() {
                return this.getLocalizationProp('Data.Payment.AddPaymentLink', {});
            },
            addPaymentLinkUrl() {
                // We want the redirect to return to current url (with all the query params included):
                const backTo = window.location.href;
                return this.getLocalizationProp('Data.Payment.AddPaymentLink.Url', {}) + '?backTo=' + backTo + '&marketplaceFlow=true';
            },
            changeCardError() {
                return this.getLocalizationProp('Labels.ErrorMessages.ChangeCardError', '');
            },
            checkboxLocalizations() {
                return this.getLocalizationProp('Data.CheckboxModal', {});
            },
            editLink() {
                return this.getLocalizationProp('Data.Payment.EditLink', {});
            },
            expired() {
                return this.getLocalizationProp('Labels.Expired', '');
            },
            expires() {
                return this.getLocalizationProp('Labels.Expires', '');
            },
            confirmPage() {
                return this.getLocalizationProp('Data.Payment.ConfirmPageUrl.Url', '');
            },
            payCheckboxAriaLabelName() {
                return this.getLocalizationProp('Labels.PayCheckboxAriaLabelName', '');
            },
            placeOrder() {
                return this.getLocalizationProp('Labels.PlaceOrder', '');
            },
            required() {
                return this.getLocalizationProp('Labels.Required', '');
            },
            requiredAriaLabel() {
                return this.getLocalizationProp('Labels.ErrorMessages.Required', '');
            },
            termsCheckboxAriaLabelName() {
                return this.getLocalizationProp('Labels.TermsCheckboxAriaLabelName', '');
            },
            termsCheckboxName() {
                return this.getLocalizationProp('Data.Payment.TermsCheckboxName', '');
            },
            title() {
                return this.getLocalizationProp('Labels.PayWith', '');
            },
            // Step # of this component in the SPA. N.b. `stepIndex` is 0-indexed; but the step itself is 1-indexed:
            // TODO: given the above discrepancy between `stepIndex` and "step", we should probably consolidate to avoid the confusion:
            step() {
                return 3;
            },
            payInfoLine() {
                return replaceTokenArray(this.localization?.Labels?.PlanCost, [this.selectedPlan?.Amount, this.selectedPlan?.PlanSummary?.Points]);
            },
            payCheckboxLabel() {
                return replaceTokenArray(this.localization?.Data?.Payment?.PayCheckbox, [this.selectedPlan?.PlanSummary?.FeeRaw, this.selectedPlan?.PlanSummary?.Cost]);
            },
            payCheckboxAriaLabel() {
                return this.replaceTokenArray(this.requiredAriaLabel, [this.payCheckboxAriaLabelName]);
            },
            termsCheckboxAriaLabel() {
                return this.replaceTokenArray(this.requiredAriaLabel, [this.termsCheckboxAriaLabelName]);
            }
        },
        watch: {
            selectedIndex(newVal) {
                if(newVal >= 0) {
                    this.selectedPay = this.storedPayMethods[newVal];
                }
            },
            stepIndex() {
                if(this.stepIndex === this.step - 1) {
                    // We need to update `formData`; however, on mounted (or $nextTick), `formData` has not been populated yet --
                    // so we update when user arrives on the payment step:
                    this.updateCountry();

                    // reset checkboxes and validation errors everytime user goes to payment step:
                    this.$v.$reset();
                    this.payCheckbox = false;
                    this.termsCheckbox = false;
                    this.apiErrorMessage = '';
                }
            }
        },
        async mounted() {
            // Localization
            if(this.localizationLocal && Object.keys(this.localizationLocal)) this.localization = this.localizationLocal;

            await this.getPayMethods();
            this.defaultServiceMethod = this.storedPayMethods.find((payMethod) => payMethod.IsServicesDefault);
            this.selectedIndex = this.storedPayMethods.findIndex((payMethod) => payMethod.IsServicesDefault);
            // If user doesn't have a default service payment, find the default payment for products and use that.
            if(!this.defaultServiceMethod) {
                this.defaultServiceMethod = this.storedPayMethods.find((payMethod, index) => payMethod.PayMethodDefaults.find(defaultType => {
                    if(isProductsDefault(defaultType)) {
                        this.selectedIndex = index;
                        return true;
                    }
                    return false;
                }));
            }
            this.selectedPay = this.defaultServiceMethod;

            // when we redirect to a non-vuex page, all the store values are lost; if have them stored in sessionStorage we can retrieve them:
            if(sessionStorage.getItem('enrollInfoguard')) {
                const sessionData = JSON.parse(sessionStorage.getItem('enrollInfoguard'));
                if(parseInt(sessionData.Step) === this.step && sessionData.FormData && sessionData.Plan && sessionData.Subscribers) {
                    this.SET_FIRST_NAME(sessionData.FormData.firstName);
                    this.SET_LAST_NAME(sessionData.FormData.lastName);
                    this.SET_ADDRESS(sessionData.FormData.address);
                    this.SET_EMAIL(sessionData.FormData.email);
                    this.SET_PHONE_NUMBER(sessionData.FormData.phoneNumber);
                    this.SET_SELECTED_PLAN(sessionData.Plan);
                    this.SET_SUBSCRIBERS(sessionData.Subscribers);
                }
            }
        },
        methods: {
            ...mapActions('paymentMethod', ['getPayMethods']),
            ...mapMutations('enrollInfoguard', ['SET_COUNTRY', 'SET_FIRST_NAME', 'SET_LAST_NAME', 'SET_ADDRESS', 'SET_EMAIL', 'SET_PHONE_NUMBER', 'SET_SELECTED_PLAN', 'SET_SUBSCRIBERS']),

            replaceTokenArray,

            // we need to fetch the country and update sessionStorage because the user may not complete the order;
            // thus, the (wrong) country value will still be in session storage
            async updateCountry() {
                const userInfoResponse = await apiUserInfo.get();
                if(userInfoResponse.success && userInfoResponse.data?.Success) {
                    const country = userInfoResponse.data.Data?.DefaultAddress?.Country || userInfoResponse.data.Data?.CustomerCountry;
                    this.SET_COUNTRY(country);

                    const currentSessionData = JSON.parse(sessionStorage.getItem('enrollInfoguard'));

                    // TODO: is this needed or can we just call `saveInfo()`?
                    const updatedSessionData = {
                        FormData: this.formData,
                        Plan: currentSessionData?.Plan,
                        Step: currentSessionData?.Step,
                        Subscribers: currentSessionData?.Subscribers
                    };
                    sessionStorage.setItem('enrollInfoguard', JSON.stringify(updatedSessionData));
                }
            },
            getEditLink(method) {
                // We want the redirect to return to current url (with all the query params included):
                const backTo = window.location.href;
                return `${this.editLink.Url}?PayMethodId=${method.PayMethodId}&backTo=${backTo}`;
            },
            getEditAriaLabel(method) {
                return this.editLink.Text + ' ' + method.PaymethodNameDisplay + ' ' + method.LastFourDigitsOfAccount;
            },
            async finishOrder() {
                this.$v.$touch();
                // verify they have a paymethod selected
                if(this.selectedIndex >= 0) {
                    // verify both checkboxes have been checked
                    if(this.$v.$invalid) {
                        return;
                    }

                    this.loading = true;
                    // call payment api to update default card if user changed it
                    if(this.defaultServiceMethod?.PayMethodId !== this.storedPayMethods[this.selectedIndex].PayMethodId) {
                        apiDefault.setRoute('/api/customeraccount/paymethods/default?payMethodId=' + this.storedPayMethods[this.selectedIndex].PayMethodId + '&payMethodDefaultType=Services');
                        const response = await apiDefault.post();
                        if(!(response.success && response.data?.Success)) {
                            this.loading = false;
                            return;
                        }
                    }

                    // add `IsPrimary` and `ServiceEnum` to subscribers:
                    const subscribers = this.subscribers.map((x, index) => {
                        if(index === 0) {
                            // we add `PlanPoints` and `PlanCost` simply because services requires them; but their values are irrelevant:
                            return {...x, IsPrimary: true, ServiceEnum: this.selectedPlan?.PlanSummary?.ServiceEnum, PlanPoints: 0, PlanCost: 0};
                        } else {
                            return {...x, IsPrimary: false, PlanPoints: 0, PlanCost: 0};
                        }
                    });

                    const request = {
                        Sku: this.selectedPlan?.PlanSummary?.ActivationSku,
                        PayMethodID: this.storedPayMethods[this.selectedIndex].PayMethodId,
                        Address: {
                            AddressLine1: this.formData.address.address1,
                            AddressLine2: this.formData.address.address2,
                            City: this.formData.address.city,
                            State: this.formData.address.state,
                            PostalCode: this.formData.address.zipCode,
                            Country: this.formData.address.country
                        },
                        Subscribers: subscribers,
                        SubscribedBy: orderTakenBy()
                    };
                    this.apiErrorMessage = '';
                    const response = await api.post(request);
                    if(response.success && response.data.Success) {
                        // clear session storage
                        sessionStorage.removeItem('enrollInfoguard');

                        // Go to the next page
                        window.location.href = this.confirmPage;
                    } else {
                        this.loading = false;
                        this.apiErrorMessage = this.localization?.Labels?.ErrorMessages?.GenericError;
                    }
                }
            },
            saveInfo() {
                const saveData = {
                    FormData: this.formData,
                    Plan: this.selectedPlan,
                    Step: this.step,
                    Subscribers: this.subscribers
                };
                // add storage for plan, address, and what step the user should return to when coming back to the page.
                sessionStorage.setItem('enrollInfoguard', JSON.stringify(saveData));
            },
            showCardError(index) {
                // Shows error if the user selects a card that is not their default
                if(this.selectedIndex === index && this.defaultServiceMethod.PayMethodId !== this.storedPayMethods[this.selectedIndex].PayMethodId) {
                    return true;
                }
            },
            updateCheckbox(payload) {
                if(payload.checkbox === 'termsCheckbox') {
                    this.termsCheckbox = payload.value;
                }
            }
        }
    };
</script>
