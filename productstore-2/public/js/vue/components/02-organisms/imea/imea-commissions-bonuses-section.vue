<template>
    <div class="o-imeaCommissionsBonusesSection text-base">
        <h2 class="font-bold text-xl">
            {{ labels.CommissionsBonusesTitle }}
        </h2>
        <p>{{ labels.CommissionsBonusesSubTitle }}</p>
        <div class="pb-20">
            <div class="flex flex-col md:flex-row mt-20 md:w-3_4">
                <div
                    v-for="category in participationLevels"
                    :key="category.Level"
                    class="flex-1 mb-20 md:mb-0 md:mr-20"
                >
                    <m-radio
                        ref="participationLevel"
                        v-model="selectedLevel"
                        :input-value="category.Level"
                        name="participationLevel"
                        :label="category.Description"
                        :label-mods="
                            `font-normal -top text-base ${
                                hasError ? '-error' : ''
                            }`
                        "
                        @input="handleInput"
                    />
                </div>
            </div>
            <FormFieldErrorMessage
                id="participationLevelError"
                :is-visible="hasError"
                :msg="labels.CommissionBonusesErrorMessage"
                modifier-classes="mt-4 -no-icon mb-20"
            />
            <p v-if="labels && labels.CommissionPaymentDescription" class="my-20" v-html="labels.CommissionPaymentDescription"></p>
        </div>
        <ImeaRfcCurpForm
            v-if="isMx"
            :data="data"
            :labels="labels"
        />
        <slot name="tax-information-form" />
        <ImeaAuNzBankAccountForm
            v-if="isAu || isNz"
            :is-au="isAu"
            :is-nz="isNz"
            :data="data"
            :labels="labels"
        />
        <ImeaPlBankAccountForm
            v-if="isPl"
            :data="data"
            :labels="labels"
        />
    </div>
</template>
<script>
    import eventBus from '../../../mixins/event-bus';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import ImeaAuNzBankAccountForm from './imea-au-nz-bank-account-form.vue';
    import ImeaPlBankAccountForm from './imea-pl-bank-account-form.vue';
    import ImeaRfcCurpForm from './imea-rfc-curp-form.vue';

    export default {
        name: 'OImeaCommissionsBonusesSection',
        components: {
            FormFieldErrorMessage,
            ImeaAuNzBankAccountForm,
            ImeaPlBankAccountForm,
            ImeaRfcCurpForm
        },
        mixins: [localizationMixin],
        data() {
            return {
                selectedLevel: null,
                hasError: false
            };
        },
        computed: {
            data() {
                return this.localization?.Data || {};
            },
            taxInformationdata() {
                return this.localization?.TaxInformationForm?.Data || {};
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
            isPl() {
                return this.$env?.Country === 'Poland' || false;
            },
            labels() {
                return this.localization?.Labels || {};
            },
            taxInformationLabels() {
                return this.localization?.TaxInformationForm?.Labels || {};
            },
            participationLevels() {
                return this.labels?.ParticipationLevels;
            }
        },
        mounted() {
            this.selectedLevel = this.data?.ParticipationLevel;
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            handleInput(val) {
                this.selectedLevel = val;
                if(val) {
                    window.dataLayer && window.dataLayer.push({
                        event: 'userEvent',
                        eC: 'IMEA Form',
                        eA: 'Radio Buttons',
                        eL: val
                    });
                    this.hasError = false;
                }
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    if(!this.selectedLevel) this.hasError = true;
                    if(!this.hasError) {
                        const formInputs = {
                            ParticipationLevel: this.selectedLevel
                        };
                        eventBus.$emit('getInput', formInputs, true);
                    } else {
                        eventBus.$emit('getInput', {}, false);
                    }
                });
            }
        }
    };
</script>
