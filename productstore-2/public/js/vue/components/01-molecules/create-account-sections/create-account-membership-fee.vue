<template>
    <div class="m-createAccountSection mb-30">
        <!-- Membership Fee Title -->
        <h2
            class="m-createAccountSection__title to-md:mt-40"
            v-html="getLabels(localization, 'MembershipFeeTitle', 'Title')"></h2>

        <!-- Membership Fee Text -->
        <div
            class="text-sm md:text-base text-gray-120 leading-tight"
            v-html="replaceTokenArray(getLabels(localization, 'MembershipFeeText'), [membershipFee, membershipFee])"></div>

        <!-- Free Products Title -->
        <h2
            class="m-createAccountSection__title pt-40"
            v-html="getLabels(localization, 'FreeProductsTitle')"></h2>

        <!-- Free Products Text -->
        <div class="text-sm md:text-base text-gray-120 leading-tight mb-20" v-html="getLabels(localization, 'FreeProductsText')"></div>

        <!-- Checkbox - Authorize -->
        <m-checkbox
            ref="authorize"
            v-model="authorizeValue"
            :name="authorize.name"
            :label="authorize.label"
            label-mods="font-normal leading-tight text-sm md:text-base -m-4 tracking-tight"
            :input-value="authorize.value">
        </m-checkbox>

        <!-- Membership Agreement Title -->
        <h2
            class="m-createAccountSection__title pt-40"
            v-html="getLabels(localization, 'MembershipAgreement')"></h2>

        <!-- Checkbox - Agreement -->
        <m-checkbox
            ref="agreement"
            v-model="agreementValue"
            :name="agreement.name"
            :label="agreement.label"
            :label-mods="`font-normal leading-tight text-sm md:text-base -m-4 tracking-tight${!agreementValue && paymentSubmitted ? ' -error' : ''}`"
            :input-value="agreement.value">
        </m-checkbox>

        <div v-if="!agreementValue && paymentSubmitted" :id="`${agreement.id}-error`" class="e-formError">
            <p class="e-formError__item pb-0" role="alert" v-html="agreementError"></p>
        </div>

        <!-- Terms & Conditions Modal -->
        <modal id="terms-conditions" width="900px" heading-class="m-termsModal__heading">
            <template v-slot:heading>
                {{ getLabels(localization, 'TermsConditions.Modal.Heading', 'Customer Membership Agreement Terms & Conditions') }}
            </template>

            <template v-slot:body>
                <div class="m-termsModal__body" v-html="getLabels(localization, 'TermsConditions.Modal.Body')">
                </div>
            </template>

            <template v-slot:footer>
                <button
                    v-modal-hide
                    type="button"
                    class="m-termsModal__footer a-button -white">
                    {{ getLabels(localization, 'TermsConditions.Modal.ButtonText', 'Close') }}
                </button>
            </template>
        </modal>
    </div>
</template>

<script>
    import labels from '@common/source/js/vue/mixins/api-localization';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MCreateAccountMembershipFee',
        mixins: [ labels ],
        props: {
            isCn: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default: () => {}
            },
            paymentSubmitted: {
                type: Boolean,
                default: false
            },
            membershipFee: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                sectionName: 'membershipFee',

                // Authorize Checkbox
                authorize: {
                    id: 'authorize',
                    name: 'authorize',
                    value: 'authorize',
                    label: this.getLabels(this.localization, 'TermsConditions.CheckboxAuthorize.Text', 'Authorize')
                },
                authorizeValue: null,

                // Agreement Checkbox (required)
                agreement: {
                    id: 'agreement',
                    name: 'agreement',
                    value: 'agreement',
                    label: this.getLabels(this.localization, 'TermsConditions.CheckboxAgreement.Text', 'Agreement')
                },
                agreementValue: null
            };
        },
        computed: {
            agreementError() {
                return this.getLabels(this.localization, 'TermsConditions.Error');
            }
        },
        watch: {
            agreementValue() {
                this.updateInfo({
                    model: 'agreementValue',
                    value: this.agreementValue
                });

                this.applyValidation();
            },
            authorizeValue() {
                this.updateInfo({
                    model: 'authorizeValue',
                    value: this.authorizeValue
                });
            }
        },
        mounted() {
            // Bind links inside checkboxes
            this.bindTermsLink();

            // Set checkboxes value
            this.authorizeValue = true; // Authorize checkbox starts checked
            this.agreementValue = false; // Agreement checkbox starts unchecked
        },
        methods: {
            updateInfo(payload) {
                this.$emit('update-terms-conditions', {
                    ...payload
                });
            },
            bindTermsLink() {
                const arrRefs = ['authorize', 'agreement'];
                arrRefs.forEach((key) => {
                    if(this.$refs[key]) {
                        const a = this.$refs[key].$el.querySelector('a');
                        if(a) {
                            a.addEventListener('click', (e) => {
                                e.preventDefault();

                                this.$modal.show({id: 'terms-conditions'});

                                return false;
                            });
                        }
                    }
                });
            },
            applyValidation() {
                // If the checkbox is NOT checked and the form is submitted
                if(!this.agreementValue && this.paymentSubmitted) {
                    // Add error to FE error store
                    this.$store.commit('paymentMethod/SET_FE_ERROR', {
                        field: 'agreement',
                        error: this.agreementError
                    });
                } else {
                    // Remove error from FE error store
                    this.$store.commit('paymentMethod/SET_FE_ERROR', {
                        reset: true,
                        field: 'agreement',
                        error: this.agreementError
                    });
                }
            },
            replaceTokenArray
        }
    };
</script>
