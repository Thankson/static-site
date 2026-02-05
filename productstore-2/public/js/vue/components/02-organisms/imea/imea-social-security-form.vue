<template>
    <o-imea-accordion
        :closed-heading="getLocalizationProp('Labels.ClosedHeading')"
        :open-heading="getLocalizationProp('Labels.OpenHeading')"
        :remove-label="getLocalizationProp('Labels.Remove')"
        :subheading="getLocalizationProp('Labels.Subheading')"
        @set-is-collapse-open="setIsCollapseOpen"
    >
        <div class="o-imeaSocialSecurityForm pt-20 mb-20">
            <label class="text-sm font-medium uppercase" for="ssn">
                {{ getLocalizationProp('Labels.SocialSecurityNumber.Text') }}
            </label>
            <a-input-glimpse
                id="ssn"
                v-model="ssnData"
                class="md:w-250 block mb-20"
                :input-classname="
                    `a-input -text text-base
                    ${$v.ssnData.$error && '-isInvalid'}`
                "
                :has-criteria="false"
                :attributes="inputAttributes"
                :show-label="getLocalizationProp('Labels.SocialSecurityNumber.Show')"
                :hide-label="getLocalizationProp('Labels.SocialSecurityNumber.Hide')"
            />
            <FormFieldErrorMessage
                id="ssnErrorMsg"
                :is-visible="$v.ssnData.$error"
                :msg="getLocalizationProp('Labels.SocialSecurityNumber.InvalidErrorMessage')"
                modifier-classes="-no-icon"
            />
        </div>
    </o-imea-accordion>
</template>

<script>
    import eventBus from '../../../mixins/event-bus';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import getCountryCode from '@common/source/js/utils/get-country-code';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';

    export default {
        name: 'OImeaSocialSecurityForm',
        components: { FormFieldErrorMessage },
        mixins: [localizationMixin, validationMixin],
        validations() {
            return {
                ssnData: {
                    ssn: (val) => {
                        if(val) return formHelper.isValidSsn(val, this.countryCode);
                        return true;
                    }
                }
            };
        },
        data() {
            return {
                isCollapseOpen: false,
                ssnData: null
            };
        },
        computed: {
            countryCode() {
                return getCountryCode(this.$env.Country)?.toLowerCase();
            },
            inputAttributes() {
                return {
                    'aria-describedby': 'ssnErrorMsg',
                    'aria-invalid': this.$v.ssnData.$error,
                    placeholder: this.getLocalizationProp('Labels.SocialSecurityNumber.Placeholder')
                };
            }
        },
        watch: {
            isCollapseOpen(val) {
                if(val === false) {
                    this.$v.$reset();
                    this.ssnData = null;
                }
            }
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            setFormValidations() {
                eventBus.$on('validate', () => {
                    if(this.isCollapseOpen && this.ssnData) {
                        this.$v.$touch();
                        if(!this.$v.ssnData.$error) {
                            const formData = {
                                SocialSecurityNumber: this.ssnData.replace(/[\s-]?/g, '')
                            };
                            eventBus.$emit('getInput', formData, true);
                        } else eventBus.$emit('getInput', false, false);
                    } else eventBus.$emit('getInput', false, true);
                });
            },
            setIsCollapseOpen(val) {
                this.isCollapseOpen = val;
            }
        }
    };
</script>
