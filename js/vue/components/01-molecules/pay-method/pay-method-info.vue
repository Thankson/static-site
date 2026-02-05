<template>
    <div class="m-payMethodInfo flex item-start flex-col" :class="mods">
        <span class="m-payMethodInfo__title">{{ getLocalizationProp('Labels.CardholderInfo.Title') }}</span>

        <div class="m-payMethodInfo__form flex-col">
            <span class="m-payMethodInfo__description">{{ getLocalizationProp('Labels.CardholderInfo.Label') }}</span>

            <div class="m-payMethodInfo__field mt-10">
                <label
                    class="m-payMethodInfo__label"
                    for="phoneNumberPayMethodInfo"
                    v-html="getLocalizationProp('Labels.CardholderInfo.MobilePhone')"
                >
                </label>
                <input-basic
                    id="phoneNumberPayMethodInfo"
                    v-model="phoneNumber"
                    name="phoneNumber"
                    :class="{ '-isInvalid': isPhoneNumberError || notSatisfiedWithAtLeastOneInfo}"
                    @blur="$v.phoneNumber.$touch"
                />
            </div>

            <div class="m-payMethodInfo__field mt-15">
                <label
                    class="m-payMethodInfo__label"
                    for="emailPayMethodInfo"
                    v-html="getLocalizationProp('Labels.CardholderInfo.EmailAddress')"
                >
                </label>
                <input-basic
                    id="emailPayMethodInfo"
                    v-model="email"
                    name="email"
                    :class="{ '-isInvalid': isEmailError || notSatisfiedWithAtLeastOneInfo}"
                    @blur="$v.email.$touch"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import { validationMixin } from 'vuelidate';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MPayMethodInfo',
        mixins: [ validationMixin, localizationMixin],
        props: {
            mods: {
                type: String,
                default: 'md:flex-row'
            }
        },
        validations() {
            return {
                phoneNumber: {
                    phoneNumberValidator: (value) => formHelper.isValidOptionalPhoneNumber(value, 'tw')
                },
                email: {
                    emailValidator: formHelper.isValidOptionalEmail,
                    phoneNumberOrEmailAtLeastOne: this.phoneNumberOrEmailAtLeastOne
                }
            };
        },
        data() {
            return {
                phoneNumber: '',
                email: ''
            };
        },
        computed: {
            emailErrorMsg() {
                return this.getLocalizationProp('Labels.CardholderInfo.ErrorMessages.EmailAddressInvalid');
            },
            errorInfo() {
                return {
                    isPhoneNumberError: this.isPhoneNumberError,
                    phoneNumberErrorMsg: this.phoneNumberErrorMsg,
                    isEmailError: this.isEmailError,
                    emailErrorMsg: this.emailErrorMsg
                };
            },
            isPhoneNumberError() {
                return this.$v.phoneNumber.$dirty && this.$v.phoneNumber.phoneNumberValidator === false;
            },
            isEmailError() {
                return this.$v.email.$dirty && this.$v.email.emailValidator === false;
            },
            notSatisfiedWithAtLeastOneInfo() {
                const notSatisfiedWithAtLeastOneInfo = this.$v.phoneNumber.$dirty && this.$v.email.$dirty && this.$v.email.phoneNumberOrEmailAtLeastOne === false;
                this.$emit('notSatisfiedWithAtLeastOneInfo', notSatisfiedWithAtLeastOneInfo);
                return notSatisfiedWithAtLeastOneInfo;
            },
            phoneNumberErrorMsg() {
                return this.getLocalizationProp('Labels.CardholderInfo.ErrorMessages.MobilePhoneInvalid');
            }
        },
        watch: {
            errorInfo(value) {
                this.$emit('updateErrorInfo', value);
            }
        },
        mounted () {
            this.phoneNumber = this.getLocalizationProp('Data.CardholderMobilePhone');
            this.email = this.getLocalizationProp('Data.CardholderEmailAddress');
        },
        methods: {
            getInfo() {
                return {
                    phoneNumber: this.phoneNumber,
                    email: this.email
                };
            },
            phoneNumberOrEmailAtLeastOne(value, vm) {
                return !!(vm.phoneNumber || vm.email);
            },
            validate() {
                this.$v.$touch();
                const isValid = !this.$v.$invalid;
                this.$emit('validated', isValid);
                return isValid;
            }
        }
    };
</script>
