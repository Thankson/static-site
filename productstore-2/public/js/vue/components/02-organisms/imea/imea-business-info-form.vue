<template>
    <o-imea-accordion
        :closed-heading="getLocalizationProp('Labels.ClosedHeading')"
        :open-heading="getLocalizationProp('Labels.OpenHeading')"
        :remove-label="getLocalizationProp('Labels.Remove')"
        :subheading="getLocalizationProp('Labels.Subheading')"
        @set-is-collapse-open="setIsCollapseOpen"
    >
        <div class="o-imeaBusinessInfoForm mb-20 md:pt-20">
            <div
                v-if="renderBusinessNumberInput"
                class="mb-20"
            >
                <label class="text-sm font-medium uppercase" for="businessNumber">
                    {{ getLocalizationProp('Labels.BusinessNumber.Text') }}
                </label>
                <a-input-glimpse
                    id="businessNumber"
                    v-model="businessNumberData"
                    class="lg:w-250 block"
                    :input-classname="`a-input -text text-base${$v.businessNumberData.$error && ' -isInvalid'}`"
                    :has-criteria="false"
                    :attributes="inputAttributes"
                    :show-label="getLocalizationProp('Labels.BusinessNumber.Show')"
                    :hide-label="getLocalizationProp('Labels.BusinessNumber.Hide')"
                />
                <FormFieldErrorMessage
                    id="businessNumberErrorMsg"
                    :is-visible="$v.businessNumberData.$error"
                    :msg="getLocalizationProp('Labels.BusinessNumber.RequiredErrorMessage')"
                    modifier-classes="-no-icon"
                />
            </div>
            <m-checkbox
                id="goodsAndServicesTax"
                v-model="goodsAndServicesTaxCheckboxData"
                aria-describedby="goodsAndServicesTaxErrorMsg"
                :aria-invalid="$v.goodsAndServicesTaxCheckboxData.$error"
                :aria-required="isGoodsAndServicesTaxCheckboxRequired"
                :label="goodsAndServicesTaxCheckboxLabel"
                :label-mods="`font-normal text-base${$v.goodsAndServicesTaxCheckboxData.$error && ' -error'}`"
            />
            <FormFieldErrorMessage
                id="goodsAndServicesTaxErrorMsg"
                :is-visible="$v.goodsAndServicesTaxCheckboxData.$error"
                :msg="getLocalizationProp('Labels.GoodsAndServicesTaxCheckbox.RequiredErrorMessage')"
                modifier-classes="-no-icon"
            />
        </div>
    </o-imea-accordion>
</template>

<script>
    import eventBus from '../../../mixins/event-bus';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import { requiredIf } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    export default {
        name: 'OImeaBusinessInfoForm',
        components: { FormFieldErrorMessage },
        mixins: [ localizationMixin, validationMixin ],
        validations() {
            return {
                businessNumberData: {
                    required: requiredIf(() => this.localization?.Labels?.BusinessNumber?.Required)
                },
                goodsAndServicesTaxCheckboxData: {
                    goodsAndServicesTax: (val) => {
                        if(this.isGoodsAndServicesTaxCheckboxRequired && !val) return false;
                        else return true;
                    }
                }
            };
        },
        data() {
            return {
                isCollapseOpen: false,
                goodsAndServicesTaxCheckboxData: false,
                businessNumberData: null
            };
        },
        computed: {
            goodsAndServicesTaxCheckboxLabel() {
                return this.localization?.Labels?.GoodsAndServicesTaxCheckbox?.Text || '';
            },
            inputAttributes() {
                return {
                    'aria-describedby': 'businessNumberErrorMsg',
                    'aria-invalid': this.$v.businessNumberData.$error,
                    placeholder: this.getLocalizationProp('Labels.BusinessNumber.Placeholder')
                };
            },
            isGoodsAndServicesTaxCheckboxRequired() {
                return this.localization?.Labels?.GoodsAndServicesTaxCheckbox?.Required || false;
            },
            renderBusinessNumberInput() {
                return !this.localization?.Labels?.BusinessNumber?.HideBusinessNumberTextbox || false;
            }
        },
        watch: {
            isCollapseOpen(val) {
                if(val === false) {
                    this.$v.$reset();
                    this.businessNumberData = null;
                    this.goodsAndServicesTaxCheckboxData = false;
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
                    if(this.isCollapseOpen) {
                        this.$v.$touch();
                        if(!this.$v.businessNumberData.$error) {
                            const formData = {
                                SocialSecurityNumber: this.businessNumberData,
                                GoodsAndServicesTax: this.goodsAndServicesTaxCheckboxData
                            };
                            eventBus.$emit('getInput', formData, true);
                        } else eventBus.$emit('getInput', {}, false);
                    } else eventBus.$emit('getInput', {}, true);
                });
            },
            setIsCollapseOpen(val) {
                this.isCollapseOpen = val;
            }
        }
    };
</script>
