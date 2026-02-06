<template>
    <div class="o-acctSettProfile">
        <div class="o-acctSettProfile__wrapper">
            <h2 class="o-acctSettProfile__title">{{ getLocalizationProp('Labels.Title', 'Profile') }}</h2>

            <div v-if="isCn" class="o-acctSettProfile__bind" :class="getLocalizationProp('Data.userProfile.BindWechatAccount.IsBind') ? '-bind' : '-unBind'">
                <h3 class="o-acctSettProfile__label text-gray-150 font-medium text-sm leading-base uppercase justify-between mb-5">{{ getLocalizationProp('Labels.BindWechatAccount.Title') }}</h3>
                <div class="o-acctSettProfile__Line text-gray-120">
                    <p v-if="getLocalizationProp('Data.userProfile.BindWechatAccount.IsBind')">{{ getLocalizationProp('Labels.BindWechatAccount.BindDescription') }}</p>
                    <p v-if="!getLocalizationProp('Data.userProfile.BindWechatAccount.IsBind')">{{ getLocalizationProp('Labels.BindWechatAccount.UnBindDescription') }}</p>
                    <em v-if="unbindError" role="alert" class="e-formError__item -no-icon float-left text-left w-full not-italic"><span aria-hidden="true" class="font-material font-bold">error_outline</span>
                        {{ unbindError }}
                    </em>
                </div>
                <a v-if="getLocalizationProp('Data.userProfile.BindWechatAccount.IsBind')" class="o-acctSettProfile__link" href="javascript:;" @click="openModal('BindWechatAccount')">
                    <span>{{ getLocalizationProp('Labels.BindWechatAccount.UnBind') }}</span>
                </a>
                <button v-if="!getLocalizationProp('Data.userProfile.BindWechatAccount.IsBind')" type="button" class="o-acctSettProfile__bindBtn" @click="bind()">
                    <span class="mx-auto text-center">{{ getLocalizationProp('Labels.BindWechatAccount.Bind') }}</span>
                </button>
            </div>

            <update-password
                v-if="!isCn"
                :labels="updatePasswordLabels"
            ></update-password>

            <update-phone-numbers
                v-if="isCn"
                ref="updatePhoneNumbers"
                :country="getLocalizationProp('Data.userProfile.CountryCode')"
                :add-phone-available="false"
                :show-default="false"
                :labels="updatePhoneLabels"
                :phones="getLocalizationProp('Data.userProfile.PhoneNumbers', [])"
                :phones-type="getLocalizationProp('Data.Types', [])"
                :phones-type-values="getLocalizationProp('Data.TypesValues', [])"
                :is-placeholder="false"
                :is-cn="isCn"
                :is-profile="true"
                :terms-modal-title="getLocalizationProp('Labels.Common.TermsTitle', '')"
                :terms-modal-rte="getLocalizationProp('Labels.Common.TermsDescription', '')"
                :privacy-modal-title="getLocalizationProp('Labels.Common.PrivacyTitle', '')"
                :privacy-modal-rte="getLocalizationProp('Labels.Common.PrivacyDescription', '')"
                select-mods="mb-30 relative w-full lg:mb-0 lg:w-1_4"
                :input-mods="isCn ? 'relative w-full' : 'relative w-full lg:w-3_4 lg:pl-8'"
                :restrict-mobile-modification="getLocalizationProp('Data.RestrictMobileModification', false)"
            ></update-phone-numbers>

            <update-email
                ref="updateEmail"
                :labels="updateEmailLabels"
                :is-cn="isCn"
                :is-profile="true"
                :email="getLocalizationProp('Data.userProfile.EmailAddress', {})"
                :phones="phonesRegistered"
                :is-enable-phone-as-username="getLocalizationProp('Data.EnablePhoneNumberAsUsername', false)"
                :is-email-username="isEmailUsername"
                @edit-phone="setEditPhone"
            ></update-email>

            <update-phone-numbers
                v-if="!isCn"
                ref="updatePhone"
                :country="countryCode"
                :labels="updatePhoneLabels"
                :phones="getLocalizationProp('Data.userProfile.PhoneNumbers', [])"
                :phones-type="getLocalizationProp('Data.Types', [])"
                :phones-type-values="getLocalizationProp('Data.TypesValues', [])"
                :is-enable-phone-as-username="getLocalizationProp('Data.EnablePhoneNumberAsUsername', false)"
                :is-use-country-from-default-address="isUseCountryFromDefaultAddress"
                :is-placeholder="false"
                @phones="onUpdatePhones"
            ></update-phone-numbers>

            <div v-if="isCn">
                <h3 class="text-gray-150 font-medium text-sm leading-base uppercase flex justify-between mb-5">
                    {{ updatePasswordLabels.title }}
                </h3>
                <em v-if="isPasswordSuccessful" class="text-green italic font-medium text-2xl block -mr-5 mt-5 mb-18">
                    {{ updatePasswordLabels.updatedSuccess }}
                </em>
                <a class="a-button -white justify-center w-full text-center text-base text-green leading-base uppercase block bg-white border-green border-1 rounded py-15 mb-44" :href="getLocalizationProp('Labels.Password.Url')">
                    {{ updatePasswordLabels.update }}
                </a>
            </div>

            <p v-if="!isCn && getLocalizationProp('Labels.Common.DisclaimerText')" class="o-acctSettProfile__disclaimer">{{ getLocalizationProp('Labels.Common.DisclaimerText') }}</p>
        </div>

        <modal v-if="isCn" id="BindWechatAccount">
            <template v-slot:heading>
                <div class="mb-30 text-gray-120 text-base mx-30 md:mx-0 md:text-2xl">{{ getLocalizationProp('Labels.BindWechatAccount.UnBindTips') }}</div>
            </template>
            <template v-slot:footer>
                <div class="mx-30 mb-30 md:mx-0 md:mb-0">
                    <button class="a-button py-15 -white px-25 mr-10 md:mr-32" @click="wechatUnbindMiniprogram()">{{ getLocalizationProp('Labels.Common.Continue') }}</button>
                    <button class="a-button py-15 px-25 mt-10 md:mt-0" @click="closeModal('BindWechatAccount')">{{ getLocalizationProp('Labels.Common.GoToList') }}</button>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import api from '@api/routes/account/identifications';
    import wechatUnbindApi from '@api/routes/wechatproxy/unbindmp';
    import qrcodeApi from '@api/routes/wechatexternal/qrcode';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import updatePassword from '../../01-molecules/my-account/update-password.vue';
    import updateEmail from '../../01-molecules/my-account/update-email.vue';
    import updatePhoneNumbers from '../../01-molecules/my-account/update-phone-numbers.vue';

    export default {
        name: 'ProfileSection',

        components: {
            updatePassword,
            updateEmail,
            updatePhoneNumbers
        },

        mixins: [ localizationMixin],

        props: {
            email: {
                type: Object,
                default() {
                    return {};
                }
            },
            phones: {
                type: Array,
                default: () => []
            },
            scriptId: {
                type: String,
                default: 'data-localization'
            }
        },

        data: function() {
            return {
                phonesRegistered: [],
                closePhoneEdit: false,
                closeEmailEdit: false,
                unbindError: ''
            };
        },

        computed: {
            countryCode() {
                // For EU markets without their own site, use UseCountryFromDefaultAddress to set the country code
                return this.isUseCountryFromDefaultAddress
                    ? this.getLocalizationProp('Data.userProfile.CountryName')
                    : this.getLocalizationProp('Data.userProfile.CountryCode');
            },
            isUseCountryFromDefaultAddress() {
                return this.getLocalizationProp('Data.UseCountryFromDefaultAddress');
            },
            updatePasswordLabels() {
                return {
                    title: this.getLocalizationProp('Labels.Password.Title'),
                    save: this.getLocalizationProp('Labels.Common.Save'),
                    saveAriaLabel: this.getLocalizationProp('Labels.Password.SaveAriaLabel'),
                    cancel: this.getLocalizationProp('Labels.Common.Cancel'),
                    cancelAriaLabel: this.getLocalizationProp('Labels.Password.CancelAriaLabel'),
                    edit: this.getLocalizationProp('Labels.Common.Edit'),
                    newPassword: this.getLocalizationProp('Labels.Password.NewPassword'),
                    confirmPassword: this.getLocalizationProp('Labels.Password.ConfirmPassword'),
                    currentPassword: this.getLocalizationProp('Labels.Password.CurrentPassword'),
                    placeholderNew: this.getLocalizationProp('Labels.Password.PlaceholderNew'),
                    placeholderConfirm: this.getLocalizationProp('Labels.Password.PlaceholderConfirm'),
                    updatedSuccess: this.getLocalizationProp('Labels.Password.UpdatedSuccess'),
                    update: this.getLocalizationProp('Labels.Password.Update'),
                    updateAriaLabel: this.getLocalizationProp('Labels.Password.UpdateAriaLabel'),
                    errors: {
                        criteria: this.getLocalizationProp('Labels.Password.Errors.Criteria'),
                        match: this.getLocalizationProp('Labels.Password.Errors.Match')
                    },
                    criteria: {
                        case: this.getLocalizationProp('Labels.Password.Criteria.Case'),
                        number: this.getLocalizationProp('Labels.Password.Criteria.Number'),
                        qtityChar: this.getLocalizationProp('Labels.Password.Criteria.QtityChar'),
                        title: this.getLocalizationProp('Labels.Password.Criteria.Title')
                    }
                };
            },
            updateEmailLabels() {
                return {
                    title: this.getLocalizationProp('Labels.Email.Title'),
                    confirmTitle: this.getLocalizationProp('Labels.Email.ConfirmTitle'),
                    editAriaLabel: this.getLocalizationProp('Labels.Email.EditAriaLabel'),
                    cancelAriaLabel: this.getLocalizationProp('Labels.Email.CancelAriaLabel'),
                    saveAriaLabel: this.getLocalizationProp('Labels.Email.SaveAriaLabel'),
                    updatedSuccess: this.getLocalizationProp('Labels.Email.UpdatedSuccess'),
                    warningUserName: this.getLocalizationProp('Labels.Email.WarningUserName'),
                    warning: this.getLocalizationProp('Labels.Email.Warning'),
                    makeDefaultContactMethod: this.getLocalizationProp('Labels.Email.MakeDefaultContactMethod'),
                    agreementName: {
                        confirm: this.getLocalizationProp('Labels.Email.AgreementName'),
                        terms: this.getLocalizationProp('Labels.Email.AgreementTerms'),
                        privacy: this.getLocalizationProp('Labels.Email.AgreementPolicy')
                    },
                    makeUserNameDefaultLabel: this.getLocalizationProp('Labels.Email.MakeUserNameDefaultLabel'),
                    phoneUserName: {
                        alertModal: {
                            title: this.getLocalizationProp('Labels.PhoneUsername.EmailModal.Title'),
                            description: this.getLocalizationProp('Labels.PhoneUsername.EmailModal.Description'),
                            cancel: this.getLocalizationProp('Labels.Common.Cancel'),
                            edit: this.getLocalizationProp('Labels.PhoneUsername.EmailModal.EditPhoneNumber')
                        },
                        warning: this.getLocalizationProp('Labels.PhoneUsername.EditMobileMessage'),
                        agreement: {
                            checkboxLabel: this.getLocalizationProp('Labels.PhoneUsername.EmailAgreement.CheckboxLabel'),
                            title: this.getLocalizationProp('Labels.PhoneUsername.EmailAgreement.Title'),
                            message: this.getLocalizationProp('Labels.PhoneUsername.EmailAgreement.AgreementMessagingEmail')
                        }
                    },
                    errors: {
                        format: this.getLocalizationProp('Labels.Email.Errors.Format'),
                        confirm: this.getLocalizationProp('Labels.Email.Errors.Confirm'),
                        agreement: this.getLocalizationProp('Labels.Email.WarningAgreement')
                    },
                    save: this.getLocalizationProp('Labels.Common.Save'),
                    cancel: this.getLocalizationProp('Labels.Common.Cancel'),
                    edit: this.getLocalizationProp('Labels.Common.Edit'),
                    termsModal: {
                        title: this.getLocalizationProp('Labels.Common.TermsTitle'),
                        rte: this.getLocalizationProp('Labels.Common.TermsDescription', '')
                    },
                    privacyModal: {
                        title: this.getLocalizationProp('Labels.Common.PrivacyTitle', ''),
                        rte: this.getLocalizationProp('Labels.Common.PrivacyDescription', '')
                    }
                };
            },
            customerId() {
                return this.getLocalizationProp('Data.userProfile.CustomerId');
            },
            isEmailUsername() {
                return this.getLocalizationProp('Data.userProfile.IsEmailUsername', false);
            },
            redirectUrl() {
                return this.getLocalizationProp('Data.userProfile.RedirectUrl', '#');
            },
            updatePhoneLabels() {
                return {
                    addAriaLabel: this.getLocalizationProp('Labels.Phones.AddAriaLabel'),
                    cancelAriaLabel: this.getLocalizationProp('Labels.Phones.CancelAriaLabel'),
                    deleteAriaLabel: this.getLocalizationProp('Labels.Phones.DeleteAriaLabel'),
                    editAriaLabel: this.getLocalizationProp('Labels.Phones.EditAriaLabel'),
                    saveAriaLabel: this.getLocalizationProp('Labels.Phones.SaveAriaLabel'),
                    phoneNumberLabel: this.getLocalizationProp('Labels.Phones.Label'),
                    title: this.getLocalizationProp('Labels.Phones.Title'),
                    confirmTitle: this.getLocalizationProp('Labels.Phones.ConfirmTitle'),
                    add: this.getLocalizationProp('Labels.Phones.Add'),
                    default: this.getLocalizationProp('Labels.Phones.Default'),
                    makeDefault: this.getLocalizationProp('Labels.Phones.MakeDefault'),
                    makeDefaultContactMethod: this.getLocalizationProp('Labels.Phones.MakeDefaultContactMethod'),
                    agreementName: {
                        confirm: this.getLocalizationProp('Labels.Phones.AgreementName'),
                        terms: this.getLocalizationProp('Labels.Phones.AgreementTerms'),
                        privacy: this.getLocalizationProp('Labels.Phones.AgreementPolicy')
                    },
                    makeUserNameDefaultLabel: this.getLocalizationProp('Labels.Phones.MakeUserNameDefaultLabel'),
                    type: this.getLocalizationProp('Labels.Phones.Type'),
                    typeAria: this.getLocalizationProp('Labels.Phones.TypeAria'),
                    delete: this.getLocalizationProp('Labels.Phones.Delete'),
                    errors: {
                        format: this.getLocalizationProp('Labels.Phones.Errors.Format'),
                        confirm: this.getLocalizationProp('Labels.Phones.Errors.Confirm'),
                        agreement: this.getLocalizationProp('Labels.Phones.WarningAgreement')
                    },
                    phoneUserName: {
                        alertModal: {
                            title: this.getLocalizationProp('Labels.PhoneUsername.PhoneModal.Title'),
                            description: this.getLocalizationProp('Labels.PhoneUsername.PhoneModal.Description'),
                            cancel: this.getLocalizationProp('Labels.Common.Cancel'),
                            edit: this.getLocalizationProp('Labels.PhoneUsername.PhoneModal.EditPhoneNumber')
                        },
                        warning: this.getLocalizationProp('Labels.PhoneUsername.EditMobileMessage'),
                        agreement: {
                            checkboxLabel: this.getLocalizationProp('Labels.PhoneUsername.PhoneAgreement.CheckboxLabel'),
                            title: this.getLocalizationProp('Labels.PhoneUsername.PhoneAgreement.Title'),
                            message: this.getLocalizationProp('Labels.PhoneUsername.PhoneAgreement.AgreementMessagingPhone')
                        }
                    },
                    warning: this.getLocalizationProp('Labels.Phones.Warning'),
                    warningUserName: this.getLocalizationProp('Labels.Phones.WarningUserName'),
                    deleted: this.getLocalizationProp('Labels.Phones.Deleted'),
                    updated: this.getLocalizationProp('Labels.Phones.Updated'),
                    save: this.getLocalizationProp('Labels.Common.Save'),
                    cancel: this.getLocalizationProp('Labels.Common.Cancel'),
                    edit: this.getLocalizationProp('Labels.Common.Edit')
                };
            },
            isPasswordSuccessful() {
                return this.getLocalizationProp('Data.Password.IsSuccessful');
            },
            isCn: function () {
                return this.$env?.IsCn || false;
            }
        },

        watch: {
            closePhoneEdit(val) {
                if(val === true) {
                    this.$refs.updatePhoneNumbers.cancelUpdate(1);
                }
            },
            closeEmailEdit(val) {
                if(val === true) {
                    this.$refs.updateEmail.cancelUpdate(1);
                }
            }
        },

        created() {
            if(this.apiEndpoint) {
                api.setRoute(this.apiEndpoint);
            }
        },

        methods: {
            closeModal: function(id) {
                this.$modal.hide({id: id});
            },
            openModal: function(id) {
                this.$modal.show({id: id});
            },
            onUpdatePhones(phoneList) {
                this.phonesRegistered = phoneList;
            },
            async wechatUnbindMiniprogram() {
                const response = await wechatUnbindApi.post({ customerId: this.customerId});
                if(response.success && response.data.Success) {
                    window.location.reload();
                } else {
                    this.closeModal('BindWechatAccount');
                    this.unbindError = response.data.ErrorMessages[0].Translation || response.error;
                }
            },
            async bind() {
                const response = await qrcodeApi.query({ customerId: this.customerId});
                if(response.success && response.data?.result?.barcode != null) {
                    window.location.href = this.redirectUrl;
                } else if(response.success && response.data?.result?.barcode === null) {
                    this.bind();
                }
            },
            setClosePhoneEdit() {
                this.closeEmailEdit = false;
                this.closePhoneEdit = true;
            },
            setEditPhone() {
                const phoneComp = this.$refs['updatePhone'];
                const mobileIndex = phoneComp?.savedPhones.findIndex((num) => num.IdenType === 'MobilePhone');
                if(mobileIndex === -1) {
                    // open a new phone field
                    phoneComp.editing = phoneComp?.savedLength + 1;
                } else {
                    // open mobile phone being edited
                    phoneComp.editing = mobileIndex;
                }
            },
            setCloseEmailEdit() {
                this.closePhoneEdit = false;
                this.closeEmailEdit = true;
            }
        }
    };
</script>
