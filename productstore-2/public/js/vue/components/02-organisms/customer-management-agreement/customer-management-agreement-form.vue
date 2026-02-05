<template>
    <form class="o-customerManagementAgreementForm">
        <fieldset>
            <CustomerManagementAgreementPersonalInfoMx
                v-if="isMx"
                ref="customerManagementAgreementPersonalInfo"
                :labels="userInfoFormLabels"
                :prospective-customer-data="prospectiveCustomerData"
                @setCustomerType="setMemberShipType"
                @showUpdateUsernameModal="showUpdateUsernameModal"
            />
            <CustomerManagementAgreementPersonalInfo
                v-else
                ref="customerManagementAgreementPersonalInfo"
                :cancel-label="cancelLabel"
                :confirm-label="confirmLabel"
                :labels="userInfoFormLabels"
                :prospective-customer-data="prospectiveCustomerData"
                @setCustomerType="setMemberShipType"
                @showUpdateUsernameModal="showUpdateUsernameModal"

            />
            <!-- Switch-Membership Modal -->
            <modal id="switch-membership" heading-class="font-bold text-2xl" :prevent-click-outside-close="true">
                <template v-slot:heading>
                    <span v-html="userInfoFormLabels.ModalSwitchMembership.Title"></span>
                </template>

                <template v-slot:body>
                    <p
                        class="text-gray-120"
                        v-html="userInfoFormLabels.ModalSwitchMembership.Text"
                    ></p>
                </template>

                <template v-slot:footer>
                    <v-button
                        class="-green mb-15 px-24 py-12 text-base"
                        @click="resetCustomerType()"
                    >
                        {{ userInfoFormLabels.ModalSwitchMembership.GoBack }}
                    </v-button>
                    <v-button
                        class="-white block px-24 py-12 text-base text-left"
                        @click="closeSwitchMembershipModal()"
                    >
                        {{ userInfoFormLabels.ModalSwitchMembership.ContinueWithNoDiscount }}
                    </v-button>
                </template>
            </modal>

            <!-- Update Username Modal -->
            <modal id="confirm-update-username" heading-class="font-bold text-2xl" :prevent-click-outside-close="true">
                <template v-slot:heading>
                    <span v-html="userInfoFormLabels.ModalUpdateUserName.Title"></span>
                </template>

                <template v-slot:body>
                    <p class="text-gray-120">
                        {{ usernameModalMessage }}
                    </p>
                    <div class="text-gray-120 flex flex-col mt-20">
                        <span
                            v-html="userInfoFormLabels.ModalUpdateUserName.NewUserName"
                        ></span>
                        <span
                            class="font-medium text-gray-160"
                        >{{ chosenUsernameValue }}</span>
                    </div>
                </template>

                <template v-slot:footer>
                    <v-button
                        class="-white mr-30 mb-15 px-24 py-12 text-base"
                        @click="resetEmailOrPhoneField()"
                    >
                        {{ cancelLabel }}
                    </v-button>
                    <v-button
                        class="-green px-24 py-12 text-base block md:inline-block"
                        @click="confirmUserName()"
                    >
                        {{ confirmLabel }}
                    </v-button>
                </template>
            </modal>
        </fieldset>
        <!-- Start: Shipping Address Forms -->
        <fieldset v-if="isAu || isNz">
            <CustomerManagementAgreementAddressFormAuNz
                :address-suggestion-max-count="addressSuggestionMaxCount"
                :country="country"
                :labels="addressFormLabels"
                :is-au="isAu"
                :is-nz="isNz"
                :states-data="provincesData"
            />
        </fieldset>
        <fieldset v-if="isIe">
            <CustomerManagementAgreementAddressFormIe
                :country="country"
                :labels="addressFormLabels"
            />
        </fieldset>
        <fieldset v-if="isEU">
            <CustomerManagementAgreementAddressFormEu
                :country="country"
                :labels="addressFormLabels"
            />
        </fieldset>
        <fieldset v-if="isFi || isLu || isBe || isEs || isEe || isIt">
            <CustomerManagementAgreementAddressFormFiLuBeEsEeIt
                :country="country"
                :labels="addressFormLabels"
            />
        </fieldset>
        <fieldset v-if="isHu">
            <CustomerManagementAgreementAddressFormHu
                :labels="addressFormLabels"
            />
        </fieldset>
        <fieldset v-if="isJp">
            <CustomerManagementAgreementAddressFormJp
                :country="country"
                :labels="addressFormLabels"
            />
        </fieldset>
        <!-- End: Shipping Address Forms -->
        <!-- Start: Payment Form -->
        <fieldset v-if="isAu || isNz || isUk || isPl">
            <div class="max-w-contain mx-auto mt-20 py-20 px-10 md:px-40 text-gray-150 text-base bg-white border-gray-50 border-1">
                <h2 class="mb-20 text-lg font-medium leading-base">
                    {{ methodOfPaymentLabels.MethodOfPaymentTitle }}
                </h2>
                <payment-form
                    ref="payment-form"
                    :pre-paid-credit-card-application-id="136"
                    :country="upperCaseCountryCode"
                    :check-first-time-user="false"
                    :hide-checkout-paypal-label="true"
                    :hidden-error-types="hiddenErrorTypes"
                    :is-customer-management-agreement-form="true"
                    :is-actions-aside="false"
                    :is-cn="false"
                    :is-enrollment="false"
                    :is-guest-checkout="true"
                    :is-inline="true"
                    radio-button-mods="justify-start"
                    :script-id="scriptId"
                    :show-pre-paid-error="showPrePaidError"
                    :token="getLocalizationProp('Data.Token')"
                    @payment-saved="handlePaymentSaved"
                >
                    <template #credit="$slotScope">
                        <CheckoutPaymentFormCredit
                            :current-payment-method="$slotScope.paymentMethodTypeValue"
                            :card-number="$slotScope.cardNumberDefaults"
                            :dirty="$slotScope.dirty"
                            :is-enrollment="false"
                            :is-guest-checkout="true"
                            :mask-card-number="$slotScope.isEditing"
                            :rb-is-editing="false"
                            :script-id="scriptId"
                            :should-call-addresses-api="false"
                            :show-improved-c-t-a-checkout="false"
                            :use-default-layout="$slotScope.useDefaultCreditLayout"
                            :use-nick-name="false"
                            @validate="(isValid) => $slotScope.setFormValidation(isValid)"
                        />
                    </template>
                    <!-- Slot with empty div passed below to mitigate render of any action button (e.g., CONTINUE) -->
                    <template v-slot:actions>
                        <div />
                    </template>
                </payment-form>
                <div v-if="methodOfPaymentLabels.BottomSection" class="text-base leading-tight">
                    <div>
                        <span v-html="showMore ? methodOfPaymentLabels.BottomSection.MoreRte : methodOfPaymentLabels.BottomSection.LessRte" />
                        <a class="text-green underline" @click="handleMoreOrLessClick">
                            {{ showMore ? methodOfPaymentLabels.BottomSection.LessLinkText : methodOfPaymentLabels.BottomSection.MoreLinkText }}
                        </a>
                    </div>
                </div>
            </div>
        </fieldset>
        <!-- End: Payment Form -->
        <fieldset>
            <CustomerManagementAgreementAuthorization
                :communication-authorization="communicationAuthorization"
                :is-chosen-membership-as-member="isChosenMembershipAsMember"
                :is-promotion-eligible="isPromotionEligible"
                :labels="benefitAndAuthorizationLabels"
                :membership-fee="membershipFee"
                :promotional-fee="promotionalFee"
                :show-benefit-list-first="showBenefitListFirst"
                :terms-and-conditions="termsAndConditions"
            >
                <template v-slot:continue>
                    <v-button
                        type="submit"
                        :aria-label="continueLabel"
                        :cta="continueLabel"
                        class="px-25 py-12 mr-10 mt-40 text-base"
                        @click.prevent="handleContinueClick($event)"
                    />
                    <span>
                        <a-loading-spinner
                            class="inline-block -m-0"
                            size="sm"
                            :visible="isLoading"
                        />
                    </span>
                </template>
            </CustomerManagementAgreementAuthorization>
        </fieldset>
    </form>
</template>
<script>
    import { mapMutations, mapState } from 'vuex';
    import eventBus from '../../../mixins/event-bus';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import getCountryCode from '@common/source/js/utils/get-country-code';
    import * as paymentFormErrors from '@productstore/source/js/vue/utils/payment-form-errors';
    import CustomerManagementAgreementAuthorization from '../../02-organisms/customer-management-agreement/customer-management-agreement-authorization.vue';
    import CustomerManagementAgreementPersonalInfoMx from './customer-management-agreement-personal-info-mx.vue';
    import CustomerManagementAgreementPersonalInfo from './customer-management-agreement-personal-info.vue';
    import CustomerManagementAgreementAddressFormAuNz from './customer-management-agreement-address-form-au-nz.vue';
    import CustomerManagementAgreementAddressFormIe from './customer-management-agreement-address-form-ie.vue';
    import CustomerManagementAgreementAddressFormEu from './customer-management-agreement-address-form-eu.vue';
    import CustomerManagementAgreementAddressFormHu from './customer-management-agreement-address-form-hu.vue';
    import CustomerManagementAgreementAddressFormFiLuBeEsEeIt from './customer-management-agreement-address-form-fi-lu-be-es-ee-it.vue';
    import CustomerManagementAgreementAddressFormJp from './customer-management-agreement-address-form-jp.vue';
    import CheckoutPaymentFormCredit from '@productstore/source/js/vue/components/01-molecules/checkout/checkout-payment-form-credit.vue';

    const MEMBERSHIP_TYPE_PREFERRED = 'preferred';

    export default {
        name: 'OCustomerManagementAgreementForm',
        components: {
            CustomerManagementAgreementAuthorization,
            CustomerManagementAgreementPersonalInfo,
            CustomerManagementAgreementPersonalInfoMx,
            CustomerManagementAgreementAddressFormAuNz,
            CustomerManagementAgreementAddressFormIe,
            CustomerManagementAgreementAddressFormEu,
            CustomerManagementAgreementAddressFormFiLuBeEsEeIt,
            CustomerManagementAgreementAddressFormHu,
            CustomerManagementAgreementAddressFormJp,
            CheckoutPaymentFormCredit
        },
        mixins: [ localizationMixin ],
        props: {
            addressFormLabels: {
                type: Object,
                default: () => ({})
            },
            addressSuggestionMaxCount: {
                type: Number,
                default: undefined
            },
            benefitAndAuthorizationLabels: {
                type: Object,
                default: () => ({})
            },
            cancelLabel: {
                type: String,
                default: ''
            },
            confirmLabel: {
                type: String,
                default: ''
            },
            continueLabel: {
                type: String,
                default: ''
            },
            isLoading: {
                type: Boolean,
                default: false
            },
            membershipData: {
                type: Object,
                default: () => ({
                    MembershipFee: '',
                    PromotionalFee: ''
                })
            },
            methodOfPaymentLabels: {
                type: Object,
                default: () => ({})
            },
            prospectiveCustomerData: {
                type: Object,
                default: () => ({
                    Email: {
                        Id: '1',
                        Value: '',
                        IsDefault: true,
                        IdenType: ''
                    },
                    FirstName: '',
                    LastName: '',
                    PhoneNumber: {
                        Id: '2',
                        Value: '',
                        IsDefault: false,
                        IdenType: ''
                    }
                })
            },
            provincesData: {
                type: Array,
                default: () => []
            },
            userInfoFormLabels: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                cmaFormData: {},
                isChosenMembershipAsMember: false,
                isValid: true,
                showMore: false,
                triggerValue: null
            };
        },
        computed: {
            ...mapState('paymentMethod', ['storedApiErrorTypes']),
            chosenUsernameValue() {
                if(this.isModalTriggerOnEmail) {
                    return this.$refs.customerManagementAgreementPersonalInfo?.emailValue;
                } else if(this.isModalTriggerOnPhone) {
                    return this.$refs.customerManagementAgreementPersonalInfo?.phoneNumber;
                }
                return '';
            },
            communicationAuthorization() {
                return this.benefitAndAuthorizationLabels?.CheckboxAuthorize
                    ?.Checked;
            },
            country() {
                return this.$env?.Country || '';
            },
            hiddenErrorTypes() {
                return [
                    paymentFormErrors.cardExpiredDate
                ];
            },
            isAu() {
                return this.$env?.Country === 'Australia' || false;
            },
            isMx() {
                return this.$env?.Country === 'Mexico' || false;
            },
            isNz() {
                return this.$env?.Country === 'NewZealand' || false;
            },
            isIe() {
                return this.$env?.Country === 'Ireland' || false;
            },
            isUk() {
                return this.$env?.Country === 'UnitedKingdom' || false;
            },
            isPl() {
                return this.$env?.Country === 'Poland' || false;
            },
            isNl() {
                return this.$env?.Country === 'Netherlands' || false;
            },
            isDe() {
                return this.$env?.Country === 'Germany' || false;
            },
            isAt() {
                return this.$env?.Country === 'Austria' || false;
            },
            isLt() {
                return this.$env?.Country === 'Lithuania' || false;
            },
            isLv() {
                return this.$env?.Country === 'Latvia' || false;
            },
            isHu() {
                return this.$env?.Country === 'Hungary' || false;
            },
            isEU() {
                return this.isUk || this.isPl || this.isNl || this.isDe || this.isAt || this.isLt || this.isLv || false;
            },
            isFi() {
                return this.$env?.Country === 'Finland' || false;
            },
            isLu() {
                return this.$env?.Country === 'Luxembourg' || false;
            },
            isBe() {
                return this.$env?.Country === 'Belgium' || false;
            },
            isEs() {
                return this.$env?.Country === 'Spain' || false;
            },
            isEe() {
                return this.$env?.Country === 'Estonia' || false;
            },
            isIt() {
                return this.$env?.Country === 'Italy' || false;
            },
            isJp() {
                return this.$env?.Country === 'Japan' || false;
            },
            isModalTriggerOnEmail() {
                return this.triggerValue === 'emailField';
            },
            isModalTriggerOnPhone() {
                return this.triggerValue === 'phoneField';
            },
            isPromotionEligible() {
                return this.membershipData?.IsPromotionEligible;
            },
            membershipFee() {
                return this.membershipData?.MembershipFee;
            },
            promotionalFee() {
                return this.membershipData?.PromotionalFee;
            },
            showBenefitListFirst() {
                return this.membershipData?.ShowBenefitListFirst;
            },
            showPrePaidError() {
                return (this.isAu || this.isNz) && this.storedApiErrorTypes?.includes(paymentFormErrors.prePaidCard);
            },
            termsAndConditions() {
                return this.benefitAndAuthorizationLabels?.CheckboxAgree?.Checked;
            },
            upperCaseCountryCode() {
                return getCountryCode(this.$env?.Country).toUpperCase() || '';
            },
            usernameModalMessage() {
                if(this.isModalTriggerOnEmail) {
                    return this.replaceToken(
                        this.userInfoFormLabels?.ModalUpdateUserName?.Text,
                        this.userInfoFormLabels?.Email?.Text);
                } else if(this.isModalTriggerOnPhone) {
                    return this.replaceToken(
                        this.userInfoFormLabels?.ModalUpdateUserName?.Text,
                        this.userInfoFormLabels?.Phone?.Text);
                }
                return '';
            }
        },
        created() {
            eventBus.$on('getInput', (childInputValues, isValid) => {
                if(!isValid) this.isValid = false;
                this.cmaFormData = { ...this.cmaFormData, ...childInputValues };
            });
        },
        beforeDestroy() {
            eventBus.$off('getInput');
        },
        mounted() {
            if(this.$refs['payment-form']) this.SET_IS_GUEST_PAY_METHOD_URL(true);
        },
        methods: {
            replaceToken,
            ...mapMutations('paymentMethod', ['SET_IS_GUEST_PAY_METHOD_URL']),
            closeSwitchMembershipModal() {
                this.pushToDataLayer(
                    'Modals',
                    'CTA',
                    this.userInfoFormLabels?.ModalSwitchMembership?.ContinueWithNoDiscount
                );
                this.$modal.hide({ id: 'switch-membership' });
            },
            confirmUserName() {
                this.$refs.customerManagementAgreementPersonalInfo.confirmUserName(this.isModalTriggerOnEmail);
                this.$modal.hide({ id: 'confirm-update-username' });
            },
            handleContinueClick() {
                eventBus.$emit('validate');
                if(this.$refs['payment-form']) {
                    // If payment post is successful, a payload will be emitted and payment data
                    // will be passed to the parent component via handlePaymentSaved()
                    this.$refs['payment-form'].handleSubmit();
                } else this.setParentData();
            },
            handleMoreOrLessClick() {
                this.showMore = !this.showMore;
            },
            handlePaymentSaved(payload) {
                if(payload?.payMethodId) {
                    const paymentFormData = {
                        ApplicationId: payload.applicationId,
                        BinNumber: payload.binNumber,
                        CountryType: payload.countryType,
                        CreditCardNumber: payload.maskedCreditCardNumber,
                        ExpirationDate: payload.expirationDate,
                        HostName: payload.hostName,
                        NameOnAccount: payload.nameOnAccount,
                        PayMethodDirection: payload.payMethodDirection,
                        PayMethodId: payload.payMethodId,
                        PayType: payload.payType,
                        ShA1Hash: payload.shA1Hash
                    };
                    eventBus.$emit('getInput', paymentFormData, true);
                } else eventBus.$emit('getInput', {}, false);

                this.setParentData();
            },
            pushToDataLayer(eC, eA, eL) {
                window.dataLayer && window.dataLayer.push({
                    event: 'userEvent',
                    eC: eC,
                    eA: eA,
                    eL: eL
                });
            },
            resetCustomerType() {
                this.pushToDataLayer(
                    'Modals',
                    'CTA',
                    this.userInfoFormLabels?.ModalSwitchMembership?.GoBack
                );
                this.$refs.customerManagementAgreementPersonalInfo.resetCustomerType();
                this.$modal.hide({ id: 'switch-membership' });
            },
            resetEmailOrPhoneField() {
                this.$refs.customerManagementAgreementPersonalInfo.resetEmailOrPhoneField(this.isModalTriggerOnEmail);
                this.$modal.hide({ id: 'confirm-update-username' });
            },
            setMemberShipType(memberShipType) {
                if(memberShipType) {
                    // show modal if user is switching from member to non-member/RB membership
                    if(
                        this.isChosenMembershipAsMember &&
                        memberShipType?.toLowerCase() !== MEMBERSHIP_TYPE_PREFERRED
                    ) {
                        this.pushToDataLayer(
                            'Modals',
                            'View',
                            this.userInfoFormLabels?.ModalSwitchMembership?.Text
                        );
                        this.$modal.show({ id: 'switch-membership' });
                    }
                    this.isChosenMembershipAsMember =
                        memberShipType.toLowerCase() === MEMBERSHIP_TYPE_PREFERRED;
                }
            },
            setParentData() {
                this.$nextTick(() => {
                    if(this.isValid) {
                        this.pushToDataLayer('Enrollment Funnel', 'CTA', this.continueLabel);
                        this.$emit('setFormData', this.cmaFormData);
                    } else {
                        this.isValid = true;
                    }
                });
            },
            showUpdateUsernameModal(value) {
                this.triggerValue = value;
                this.$modal.show({ id: 'confirm-update-username' });
                this.$modal.$on.hidden(() => {
                    this.$refs.customerManagementAgreementPersonalInfo.resetEmailOrPhoneField(this.isModalTriggerOnEmail);
                });
            }
        }
    };
</script>
