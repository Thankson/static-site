<template>
    <div
        class="o-customerManagementAgreementAuthorization max-w-contain mx-auto mt-20 py-20 px-10 md:px-25 text-dark text-base bg-white border-gray-50 border-1"
    >
        <div v-if="labels" class="flex flex-col md:flex-row text-left md:mx-15">
            <!-- Benefits section -->
            <section
                v-if="isChosenMembershipAsMember"
                class="flex-1 flex flex-col md:mr-30"
            >
                <!-- Member benefits -->
                <!-- Benefits set to show on top by CAs -->
                <div v-if="showBenefitListFirst" class="mb-40">
                    <h2
                        class="text-xl font-medium"
                        v-html="labels.BenefitsTitle"
                    ></h2>
                    <div v-html="labels.ListOfMemberBenefits"></div>
                </div>
                <!-- Membership fee -->
                <div class="mb-40">
                    <h2
                        class="text-xl font-medium"
                        v-html="labels.MembershipFeeTitle"
                    ></h2>
                    <p
                        v-if="isPromotionEligible"
                        class="text-blue font-medium mb-20 uppercase"
                        v-html="promotionalMessage"
                    ></p>
                    <p class="mb-20" v-html="membershipFeeText"></p>
                    <p
                        class="text-sm text-green italic"
                        v-html="membershipFeeDisclaimerText"
                    ></p>
                </div>
                <!-- Member benefits -->
                <!-- Benefits set to show at bottom by CAs -->
                <div v-if="!showBenefitListFirst" class="mb-40">
                    <h2
                        class="text-xl font-medium"
                        v-html="labels.BenefitsTitle"
                    ></h2>
                    <div v-html="labels.ListOfMemberBenefits"></div>
                </div>
            </section>

            <!-- Communication Authorization and Acknowledgement-->
            <section
                v-if="labels.CheckboxAuthorize"
                class="flex-1 flex-col md:flex-row"
                :class="{ flex: !isChosenMembershipAsMember }"
            >
                <div
                    :class="{ 'flex-1 md:mr-30': !isChosenMembershipAsMember }"
                >
                    <h2
                        class="text-xl font-medium"
                        v-html="labels.CommunicationAuthorizationTitle"
                    ></h2>
                    <p v-html="labels.CommunicationAuthorizationText"></p>
                    <m-checkbox
                        ref="cummnuicationAuthorization"
                        v-model="communicationAuthorizationValue"
                        class="mt-20"
                        :aria-required="Boolean(false)"
                        :label="labels.CheckboxAuthorize.Text"
                        label-mods="font-normal -items-start"
                    />
                </div>
                <div :class="{ 'flex-1': !isChosenMembershipAsMember }">
                    <h2
                        class="font-medium text-xl"
                        :class="{ 'mt-40': isChosenMembershipAsMember }"
                        v-html="labels.AgreeAndContinue"
                    ></h2>
                    <m-checkbox
                        ref="termsAndConditions"
                        v-model="termsAndConditionsValue"
                        class="mt-20"
                        :aria-required="true"
                        :aria-invalid="!$v.termsAndConditionsValue.checked"
                        :label="labels.CheckboxAgree.Text"
                        :label-mods="
                            `font-normal -items-start${
                                !$v.termsAndConditionsValue.checked
                                    ? ' -error'
                                    : ''
                            }`
                        "
                        @input="setInput($event, 'termsAndConditionsValue')"
                    />
                    <FormFieldErrorMessage
                        id="termsAndConditionsError"
                        :is-visible="!$v.termsAndConditionsValue.checked"
                        :msg="labels.CheckboxAgree.RequiredErrorMessage"
                        modifier-classes="-no-icon"
                    />
                    <slot name="continue"></slot>
                </div>
            </section>
        </div>
    </div>
</template>
<script>
    import eventBus from '../../../mixins/event-bus';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import { validationMixin } from 'vuelidate';

    export default {
        name: 'OCustomerManagementAgreementAuthorization',
        components: {
            FormFieldErrorMessage
        },
        mixins: [validationMixin],
        validations() {
            const validations = {};
            validations.termsAndConditionsValue = {
                checked: termsAndConditionsValue => {
                    if(
                        this.$v.termsAndConditionsValue.$dirty &&
                        !termsAndConditionsValue
                    ) {
                        return false;
                    }
                    return true;
                }
            };
            return validations;
        },
        props: {
            communicationAuthorization: {
                type: Boolean,
                default: false
            },
            isChosenMembershipAsMember: {
                type: Boolean,
                default: false
            },
            isPromotionEligible: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            membershipFee: {
                type: String,
                default: '$0'
            },
            promotionalFee: {
                type: String,
                default: '$0'
            },
            showBenefitListFirst: {
                type: Boolean,
                default: false
            },
            termsAndConditions: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                communicationAuthorizationValue: false,
                termsAndConditionsValue: null
            };
        },
        computed: {
            membershipFeeDisclaimerText() {
                return this.replaceToken(
                    this.labels?.MembershipFeeDisclaimer,
                    this.membershipFee
                );
            },
            membershipFeeText() {
                const replacedFee = this.isPromotionEligible
                    ? `<span class="line-through">${this.membershipFee}</span>`
                    : this.membershipFee;
                return this.replaceToken(
                    this.labels?.MembershipFeeText,
                    replacedFee
                );
            },
            promotionalMessage() {
                return this.replaceToken(
                    this.labels?.PromotionalMessage,
                    this.promotionalFee
                );
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.termsAndConditionsValue = this.termsAndConditions;
                this.communicationAuthorizationValue = this.communicationAuthorization;
            });
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate'); // Clean up the event listener
        },
        methods: {
            replaceToken,

            setFormValidations() {
                eventBus.$on('validate', () => {
                    this.$v.$touch();
                    if(!this.$v.$invalid) {
                        const commAuth = {
                            SendTextMessages: this.communicationAuthorizationValue
                        };
                        eventBus.$emit('getInput', commAuth, true);
                    } else eventBus.$emit('getInput', false, false);
                });
            },

            setInput(event, field) {
                this[field] = event;
                // Trigger $dirty
                this.$v[field].$touch();
            }
        }
    };
</script>
