<template>
    <div class="o-companyInfo">
        <m-form-title :title="getLocalizationProp('Data.CompanyInfoTitle')"></m-form-title>

        <div class="o-companyInfo__fields">
            <div class="o-companyInfo__field">
                <label class="m-formItemInput__label" for="companyName">{{ getLocalizationProp('Labels.CompanyName') }}</label>
                <input-basic
                    id="companyName"
                    v-model="companyName"
                    name="companyName"
                    placeholder="companyName"
                    disabled
                ></input-basic>
            </div>

            <div class="o-companyInfo__field">
                <label class="m-formItemInput__label" for="investor">{{ getLocalizationProp('Labels.OperatorLegalRepInvestor') }}</label>
                <input-basic
                    id="investor"
                    v-model="investor"
                    name="investor"
                    placeholder="investor"
                    disabled
                ></input-basic>
            </div>

            <div class="o-companyInfo__field">
                <label class="m-formItemInput__label" for="businessLicenseNo">{{ getLocalizationProp('Labels.BusinessLicenseNo') }}</label>
                <!-- readonly -->
                <input-basic
                    id="businessLicenseNo"
                    v-model="businessLicenseNo"
                    name="businessLicenseNo"
                    placeholder="Business License No."
                    disabled
                ></input-basic>
            </div>

            <div class="o-companyInfo__field">
                <label class="m-formItemInput__label" for="addressLine1">{{ getLocalizationProp('Labels.CompanyAddress') }}</label>
                <keep-alive>
                    <m-area-select
                        v-if="componentShow"
                        id="areaCn"
                        ref="areaCnRef"
                        class="relative mb-8"
                        name="areaCn"
                        :script-id="scriptId"
                        :placeholder="getLocalizationProp('Labels.AreaPlaceholder')"
                        :use-in-vue-component="true"
                        :is-field-error="isFieldError('province') || isFieldError('city') || isFieldError('suburb')"
                        :save-province.sync="province"
                        :save-city.sync="city"
                        :save-region.sync="suburb"
                    ></m-area-select>
                </keep-alive>
                <input-basic
                    id="addressLine1"
                    v-model.trim="addressLine1"
                    name="addressLine1"
                    placeholder="addressLine1"
                    :tailwind-mods="
                        isFieldError('addressLine1') ? '-isInvalid' : ''
                    "
                ></input-basic>
                <m-error-messages
                    v-if="isFieldError('province') || isFieldError('city') || isFieldError('suburb')
                        ||isFieldError('addressLine1')"
                    :errors="[
                        ...getValidationErrors('province'),
                        ...getValidationErrors('city'),
                        ...getValidationErrors('suburb'),
                        ...getValidationErrors('addressLine1'),
                    ]"
                ></m-error-messages>
            </div>
            <!-- {{ partialForm }} -->
            <div class="o-companyInfo__field">
                <label class="m-formItemInput__label" for="bankCardNo">{{ getLocalizationProp('Labels.BankCard') }}</label>
                <input-basic
                    id="bankCardNo"
                    v-model="bankCardNo"
                    name="bankCardNo"
                    placeholder="Bank Card"
                    disabled
                ></input-basic>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { required } from 'vuelidate/lib/validators';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import formValidateMixin from '@dsibo/source/js/vue/mixins/form-validate';
    import formDataStorageMixin from '@dsibo/source/js/vue/mixins/form-data-storage';
    import formHelper from '@common/source/js/vue/utils/form-helper';

    export default {
        name: 'OCompanyInfo',
        mixins: [ localizationMixin, validationMixin, formValidateMixin, formDataStorageMixin],
        validations() {
            return {
                province: {
                    required,
                    isValidCnAreaName: formHelper.isValidCnAreaName
                },
                city: {
                    required,
                    isValidCnAreaName: formHelper.isValidCnAreaName
                },
                suburb: {
                    required,
                    isValidCnAreaName: formHelper.isValidCnAreaName
                },
                addressLine1: {
                    required,
                    isValidCnAddress: formHelper.isValidCnAddress
                }
            };
        },
        props: {
            scriptId: {
                type: String,
                default: ''
            },
            jumpTo: {
                type: Function,
                default: () => {}
            }
        },
        data() {
            return {
                companyName: '',
                investor: '',
                businessLicenseNo: '',
                bankCardNo: '',

                province: '',
                city: '',
                suburb: '',
                addressLine1: '',

                formFields: [
                    'companyName', 'investor', 'businessLicenseNo', 'bankCardNo',
                    'province', 'city', 'suburb', 'addressLine1'
                ]
            };
        },
        computed: {
            ...mapState('access', ['activeStepProcessId']),
            ...mapState('iboApp', ['ocrInfos', 'showInfoForm']),
            errorMessages() {
                return {
                    province: {
                        required: this.getLocalizationProp('Labels.CommonErrorMessage'),
                        isValidCnAreaName: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    city: {
                        required: this.getLocalizationProp('Labels.CommonErrorMessage'),
                        isValidCnAreaName: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    suburb: {
                        required: this.getLocalizationProp('Labels.CommonErrorMessage'),
                        isValidCnAreaName: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    addressLine1: {
                        required: this.getLocalizationProp('Labels.CommonErrorMessage'),
                        isValidCnAddress: this.getLocalizationProp('Labels.CommonErrorMessage')
                    }
                };
            },
            componentShow() {
                return this.activeStepProcessId === this.getLocalizationProp('Data.ProcessID') && this.showInfoForm;
            }
        },
        watch: {
            ocrInfos(val) {
                this.companyName = val.BankCardNum;
                this.investor = val.LegalRepName;
                this.businessLicenseNo = val.CorpIdentNo;
                this.bankCardNo = val.BankCardNum;
            }
        }
    };
</script>
