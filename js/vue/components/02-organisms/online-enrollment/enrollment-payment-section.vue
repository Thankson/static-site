<template>
    <div class="o-enrollmentSection">
        <payment-form
            v-if="localization && localization.Labels"
            ref="payment-form"
            :button-continue="buttonContinue"
            :country="getLocalizationProp('Data.PatternLabCountry', 'US')"
            :is-actions-aside="true"
            :is-cn="isCn"
            :is-enrollment="isEnrollment"
            :is-guest-checkout="isGuestCheckout"
            :membership-fee-agreement="fields['agreementValue']"
            :membership-fee-agreement-required="isEnrollment"
            :script-id="scriptId"
            :token="token"
            @payment-submitted="handleSubmit"
            @payment-saved="handleSaved">
            <template v-slot:payment-title>
                {{ fields }}
                <!-- Payment Title -->
                <h2 class="o-enrollmentSection__title">{{ paymentTitle }}</h2>
            </template>

            <!-- Membership Fee Section (only for Online Enrollment form) -->
            <template v-if="isEnrollment" v-slot:aside-content>
                <!-- Membership Fee Section -->
                <m-create-account-membership-fee
                    ref="membership-fee"
                    :is-cn="isCn"
                    :localization="extraLabels"
                    :membership-fee="storedGuest.MembershipFeeFormatted"
                    :payment-submitted="formSubmitted"
                    @update-terms-conditions="updateInfo" />
            </template>
        </payment-form>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OEnrollmentPaymentSection',
        mixins: [ localizationMixin ],
        props: {
            extraLabels: {
                type: Object,
                default: () => {}
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isEnrollment: {
                type: Boolean,
                default: true
            },
            isGuestCheckout: {
                type: Boolean,
                default: false
            },
            token: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                fields: {},
                formSubmitted: false,
                sectionName: 'payment'
            };
        },
        computed: {
            ...mapState('guest', ['storedGuest']),

            buttonContinue() {
                return this.extraLabels?.Continue || 'Continue';
            },
            paymentTitle() {
                return this.extraLabels?.Title || 'Title';
            }
        },
        methods: {
            handleSubmit() {
                // Set for as submitted
                this.formSubmitted = true;

                // If it's Online Enrollment
                if(this.isEnrollment) {
                    // Apply validation to Membership Fee checkbox
                    this.$nextTick(() => {
                        this.$refs['membership-fee'].applyValidation();
                    });
                }
            },
            handleSaved(payload) {
                // If there's a valid Payment ID
                if(payload?.payMethodId > 0) {
                    // Update payment section value
                    this.$emit('update-info', {
                        model: 'payment',
                        value: payload
                    });

                    // Set payment section as valid
                    this.$emit('validate-section', {
                        section: this.sectionName,
                        valid: true
                    });

                    // Go to next step
                    this.$emit('go-to-next');
                } else {
                    // Set payment section as NOT valid
                    this.$emit('validate-section', {
                        section: this.sectionName,
                        valid: false
                    });
                }
            },
            updateInfo(payload) {
                const fields = { ...this.fields };
                fields[payload.model] = payload.value;
                this.fields = fields;

                this.$emit('update-info', {
                    ...payload
                });
            }
        }
    };
</script>
