<template>
    <div class="m-updatePhones">
        <h3 class="text-gray-150 font-medium text-sm leading-base uppercase flex justify-between mb-5" :class="{'font-semibold': isCn , 'text-xs md:text-sm':!isProfile && isCn}">
            {{ labels.title }} <strong v-if="showDefault">{{ labels.default }}</strong>
        </h3>
        <form v-for="index in editablePhones" :key="index" class="w-full pb-10" @submit="event => updateNumber(index, event, savedPhones)">
            <p ref="fValidation" aria-live="polite" class="transition duration-500 ease-in-out bg-blue-600 m-updatePhones__validation italic font-medium text-green text-2xl" :class="isCn ? '' : ' py-10'"></p>
            <em v-if="index > 1" class="text-gray-150 font-medium text-sm leading-base uppercase flex justify-between mb-5 not-italic">
                {{ labels.type }}
                <button
                    v-if="!restrictMobileModification && editing !== index"
                    type="button"
                    class="uppercase font-medium text-green"
                    :aria-label="labels.makeDefaultAriaLabel"
                    @click="makeDefault(index)"
                >
                    {{ labels.makeDefault }}
                </button>
            </em>
            <div class="w-full relative lg:flex" :class="isCn && !isProfile ? 'mb-10' : ' mb-20'">
                <div v-if="!isCn" :class="selectMods">
                    <v-select
                        :id="'ftype' + index"
                        ref="fType"
                        :options="removeUnneededValues('type', getInitialValue(index))"
                        :values="removeUnneededValues('values', getInitialValue(index))"
                        :aria-label="labels.typeAria"
                        select-mod="-sm w-full bg-clear"
                        arrow-other-mods="-filled w-0 h-0 absolute right-15 top-10 pointer-events-none md:top-8"
                        :disabled="editing !== index"
                        :aria-disabled="editing !== index"
                        :initial="getInitialValue(index)"
                    >
                    </v-select>
                </div>
                <div :class="inputMods">
                    <label
                        class="sr-only"
                        :for="'fnumber' + index"
                        v-html="labels.phoneNumberLabel">
                    </label>
                    <v-input
                        :id="'fnumber' + index"
                        ref="fNumber"
                        :name="'fNumber' + index"
                        :value="savedPhones[index-1] ? formatPhone(savedPhones[index-1].Value) : ''"
                        :tailwind-mods="`${isCn && !isProfile && error ? 'border-error' : ''} bg-clear ${restrictMobileModification ? '-disabled' : ''}`"
                        :disabled="editing !== index || restrictMobileModification"
                        :aria-disabled="editing !== index"
                        :placeholder="placeholder"
                    >
                    </v-input>

                    <div v-if="!restrictMobileModification" class="absolute right-0 h-full top-0 px-5">
                        <button
                            v-if="editing !== index"
                            ref="phoneNumberEditButton"
                            class="uppercase text-green font-medium px-5 h-full inline-block"
                            :class="{'text-xs md:text-sm' : !isProfile && isCn}"
                            :aria-label="replaceTokenArray(labels.editAriaLabel, [savedPhones[index-1] ? savedPhones[index-1].IdenType : phonesTypeValues[0], savedPhones[index-1] ? savedPhones[index-1].Value : ''])"
                            type="button"
                            @click="editing = index, gtmTrackAction({id: 204}, $event)"
                        >
                            {{ labels.edit }}
                        </button>
                        <span v-if="editing !== index && index > 1">|</span>
                        <button
                            v-if="editing !== index && index > 1"
                            class="uppercase text-green font-medium px-5 h-full inline-block"
                            :class="{'text-xs md:text-sm' : !isProfile && isCn}"
                            :aria-label="replaceTokenArray(labels.deleteAriaLabel, [savedPhones[index-1] ? savedPhones[index-1].IdenType : phonesTypeValues[0], savedPhones[index-1] ? savedPhones[index-1].Value : ''])"
                            type="button"
                            @click="deleteNumber(index)"
                        >
                            {{ labels.delete }}
                        </button>
                    </div>
                </div>
            </div>
            <div v-if="!restrictMobileModification" :class="[editing == index ? 'block': 'hidden', {'text-right':!isCn}]" class="font-normal -mt-5 mb-25">
                <!-- China -->
                <div v-if="isCn && isProfile" class="mb-20">
                    <h3 class="text-gray-150 font-medium text-sm leading-base uppercase flex justify-between mb-5">
                        {{ labels.confirmTitle }}
                    </h3>
                    <v-input
                        :id="'fnumberConfirm' + index"
                        ref="fNumberConfirm"
                        :name="'fNumberConfirm' + index"
                        :value="savedPhones[index-1] ? savedPhones[index-1].Value : ''"
                        tailwind-mods="bg-clear"
                        :placeholder="placeholder"
                    >
                    </v-input>
                </div>

                <!-- China Make default phone number -->
                <div v-if="isCn && isProfile" class="mb-20">
                    <div class="md:flex">
                        <div class="md:flex-1">
                            <m-checkbox
                                ref="defaultUserName"
                                v-model="defaultUserName[index-1]"
                                name="defaultUserName"
                                :label="labels.makeUserNameDefaultLabel"
                                :disabled="savedPhones[index-1] ? savedPhones[index-1].IsUsername : false"
                                :value="savedPhones[index-1] ? savedPhones[index-1].IsUsername : false"
                                :input-value="labels.makeUserNameDefaultLabel"
                                @click.native="isUserName()"
                            >
                            </m-checkbox>
                            <!-- TODO: Address 'cklass' typo -->
                            <!-- See: http://tfs:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/113708 -->
                            <em v-if="errorUserName" cklass="e-formError__item -no-icon float-left text-left w-full not-italic" role="alert">
                                <span aria-hidden="true" class="font-material font-bold pr-5">error_outline</span>
                                {{ errorUserName }}
                            </em>
                        </div>
                        <div class="md:flex-1">
                            <m-checkbox
                                ref="defaultContactMethod"
                                v-model="defaultContactMethod[index-1]"
                                name="defaultContactMethod"
                                :disabled="savedPhones[index-1] ? savedPhones[index-1].IsDefault : false"
                                :label="labels.makeDefaultContactMethod"
                                :value="savedPhones[index-1] ? savedPhones[index-1].IsDefault : false"
                                :input-value="labels.makeDefaultContactMethod">
                            </m-checkbox>
                        </div>
                    </div>
                    <m-checkbox
                        ref="fAgreement"
                        v-model="agreement[index-1]"
                        name="fAgreement"
                        :label="confirmationCheckboxLabel()"
                        class="text-left"
                        :is-cn="true"
                        :value="savedPhones[index-1] ? savedPhones[index-1].IsAgreement : false"
                        :input-value="labels.agreementName.confirm">
                    </m-checkbox>
                </div>

                <!-- Error Message -->
                <em v-if="error" class="e-formError__item -no-icon float-left text-left w-full not-italic" role="alert">
                    <span aria-hidden="true" class="font-material font-bold pr-5">error_outline</span>
                    {{ error }}
                </em>

                <!--- Agreement Checkbox -->
                <m-checkbox-rte-modal
                    v-if="!isCn && isEnablePhoneAsUsername && isDefaultPhone(index)"
                    ref="terms-checkbox"
                    :value="$v.termsCheckbox.$model"
                    :modal-data="termsCheckboxModal"
                    my-name="termsAgreement"
                    body-class=""
                    label-mods="-green"
                    script-id=""
                    @update="updateTermsCheckbox">
                </m-checkbox-rte-modal>

                <button
                    class="a-button -white -updateAccntInfo md:py-4 mr-4 md:mr-6"
                    :aria-label="labels.cancelAriaLabel"
                    type="button"
                    @click="[cancelUpdate(index), gtmTrackAction({id: 241}, $event)]"
                >
                    {{ labels.cancel }}
                </button>
                <button
                    class="a-button -updateAccntInfo py-9 md:py-5"
                    :class="{
                        '-disabled' : disableCheckbox && isDefaultPhone(index)
                    }"
                    :aria-label="labels.saveAriaLabel"
                    :disabled="disableCheckbox && isDefaultPhone(index)"
                    type="submit"
                    @click="gtmTrackAction({id: 242}, $event)"
                >
                    {{ labels.save }}
                </button>
            </div>
        </form>

        <!-- Modal -->
        <modal id="modal-terms" width="535px">
            <div class="o-payForm -modal -noScroll">
                <h2 id="global-modal-heading" class="o-payForm__modalTitle">
                    {{ termsModalTitle }}
                </h2>
                <div class="o-payForm__scroll -isCn -longContent">
                    <!--Custom scrollbar-->
                    <perfect-scrollbar ref="scroll">
                        <div class="m-rte" v-html="termsModalRte"></div>
                    </perfect-scrollbar>
                </div>
            </div>
        </modal>

        <!-- Modal - used for privacy terms -->
        <modal id="modal-privacy" width="535px">
            <div class="o-payForm -modal -noScroll">
                <h2 id="global-modal-heading" class="o-payForm__modalTitle">
                    {{ privacyModalTitle }}
                </h2>
                <div class="o-payForm__scroll -isCn -longContent">
                    <!--Custom scrollbar-->
                    <perfect-scrollbar ref="scroll">
                        <div class="m-rte pr-16" v-html="privacyModalRte"></div>
                    </perfect-scrollbar>
                </div>
            </div>
        </modal>
        <button
            v-if="addPhoneAvailable && savedLength < 3 && editing !== savedLength+1"
            type="button"
            :aria-label="labels.addAriaLabel"
            class="justify-center w-full text-center text-base text-green leading-base uppercase block bg-white border-green border-1 rounded py-15 mb-25"
            @click="[editing = savedLength+1, gtmTrackAction({id: 243}, $event)]"
        >
            <span class="mr-5">+</span>{{ labels.add }}
        </button>
    </div>
</template>

<script>
    import regexParser from 'regex-parser';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import api from '@api/routes/account/identifications';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import isValidTwPhoneNumberType from '@productstore/source/js/vue/utils/tw/validate-phone-number-type';
    import { required } from 'vuelidate/lib/validators';
    import { validationMixin } from 'vuelidate';
    import setModalId from '@common/source/js/vue/utils/set-modal-id';
    import getCountryCode from '@common/source/js/utils/get-country-code';

    export default {
        name: 'UpdatePhoneNumbers',
        components: {
            vInput
        },
        mixins: [ validationMixin ],
        validations() {
            return {
                termsCheckbox: {
                    required,
                    checked: value => {
                        if(value) {
                            return true;
                        }
                        return false;
                    }
                }
            };
        },
        props: {
            addPhoneAvailable: {
                type: Boolean,
                default: true
            },
            showDefault: {
                type: Boolean,
                default: true
            },
            selectMods: {
                type: String,
                default: 'mb-30 relative w-full lg:mb-0 lg:w-1_4'
            },
            inputMods: {
                type: String,
                default: 'relative w-full lg:w-3_4 lg:pl-8'
            },
            isEnablePhoneAsUsername: {
                type: Boolean,
                default: false
            },
            isProfile: {
                type: Boolean,
                default: false
            },
            country: {
                type: String,
                default: 'US'
            },
            phones: {
                type: Array,
                default() {
                    return [];
                }
            },
            phonesType: {
                type: Array,
                default() {
                    return [];
                }
            },
            phonesTypeValues: {
                type: Array,
                default() {
                    return [];
                }
            },
            labels: {
                type: Object,
                default() {
                    return {};
                }
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isPlaceholder: {
                type: Boolean,
                default: true
            },
            isUseCountryFromDefaultAddress: {
                type: Boolean,
                default: false
            },
            termsModalTitle: {
                type: String,
                default: ''
            },
            termsModalRte: {
                type: String,
                default: ''
            },
            privacyModalTitle: {
                type: String,
                default: ''
            },
            privacyModalRte: {
                type: String,
                default: ''
            },
            restrictMobileModification: {
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                editing: 0,
                error: '',
                errorUserName: '',
                savedPhones: [],
                savedLength: 0,
                validationMsg: null,
                defaultUserName: [],
                defaultContactMethod: [],
                agreement: [],
                termsCheckbox: false
            };
        },

        computed: {
            availablePhonesTypeValues() {
                const usedTypeValues = this.savedPhones?.map(obj => obj.IdenType);
                return this.phonesTypeValues?.filter(value => !usedTypeValues.some(t => t === value));
            },
            disableCheckbox() {
                return !this.termsCheckbox && this.isEnablePhoneAsUsername;
            },

            editablePhones() {
                if(this.editing === this.savedLength + 1) {
                    return this.savedLength + 1;
                } else {
                    return this.savedLength;
                }
            },
            isJp() {
                return this.$env.Country === 'Japan';
            },
            isKr() {
                return this.$env.Country === 'Korea';
            },
            isTw() {
                return this.$env.Country === 'Taiwan';
            },
            placeholder() {
                if(this.isPlaceholder) {
                    if(this.country === 'US' || this.country === 'CA') {
                        return '000 000-0000';
                    } else if(this.isCn && this.country === 'CN') {
                        return '1xxxxxxxxxx';
                    } else {
                        return '00 0000 0000';
                    }
                } return null;
            },
            termsCheckboxModal() {
                const replacedText = setModalId('termsAgreement', this.labels.phoneUserName.agreement.checkboxLabel);
                return {
                    Name: '',
                    Title: replacedText,
                    Modals: [
                        {
                            Id: 'termsAgreement',
                            Title: this.labels.phoneUserName.agreement.title,
                            Body: this.labels.phoneUserName.agreement.message
                        }
                    ]
                };
            }
        },

        watch: {
            deep: true,
            editing(editingIndex) {
                const activePhoneIndex = editingIndex - 1;
                const phone = this.savedPhones[activePhoneIndex];

                this.savedLength = this.savedPhones.length;

                if(this.savedPhones.length <= 0 && this.isProfile && this.isCn) {
                    this.savedLength = 1;
                }

                if(this.isCn && this.isProfile && editingIndex > 0) {
                    this.savedLength = this.savedPhones.length > 0 ? this.savedPhones.length : 1;
                    this.defaultUserName[activePhoneIndex] = phone?.IsUsername ? phone?.IsUsername : phone?.IsUsername;
                    this.defaultContactMethod[activePhoneIndex] = phone?.IsDefault;
                    this.agreement[activePhoneIndex] = phone?.IsAgreement;
                }

                const hasUsername = phone ? phone?.IsUsername : false;
                const isNewPhone = this.savedLength < editingIndex;

                this.error = !isNewPhone && hasUsername ? this.labels.warning : '';

                if(editingIndex > 0 && !isNewPhone) {
                    this.$nextTick(() => this.$refs.fType?.[activePhoneIndex].$el.querySelector('select').focus());
                }

                if(this.isCn && this.isProfile && editingIndex > 0) {
                    this.$parent.setCloseEmailEdit();
                }
            },
            savedLength() {
                this.updateInputValues();
            },
            phones() {
                this.savedPhones = this.phones.slice();
                this.$emit('phones', this.savedPhones);
                this.savedLength = this.savedPhones.length;
                if(this.savedPhones.length <= 0 && this.isProfile && this.isCn) {
                    this.savedLength = 1;
                }
            },
            editablePhones() {
                this.$nextTick(() => {
                    this.bindTermsLink();
                });
            }
        },

        methods: {
            getCountryCode,
            replaceTokenArray,
            isDefaultPhone(index) {
                return this.phones[index - 1]?.IsDefault;
            },
            bindTermsLink() {
                if(this.$refs.fAgreement) {
                    const termsLink = this.$refs.fAgreement[this.editing]?.$el.querySelector('.terms-link');
                    const privacyLink = this.$refs.fAgreement[this.editing]?.$el.querySelector('.privacy-link');

                    if(termsLink) {
                        termsLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.openModalTerms();
                            return false;
                        });
                    }
                    if(privacyLink) {
                        privacyLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.openModalPrivacy();
                            return false;
                        });
                    }
                }
            },
            cancelUpdate(index) {
                const activePhoneIndex = index - 1;
                const phone = this.savedPhones[activePhoneIndex];
                const fNumber = this.$refs.fNumber[activePhoneIndex];

                if(!this.isCn && phone) {
                    fNumber.input = phone.Value;
                    this.$refs.fType[activePhoneIndex].selectedVal = phone.IdenType;
                } else if(this.isCn && !this.isProfile && phone) {
                    fNumber.input = phone.Value;
                } else if(this.isCn && this.isProfile) {
                    this.$refs.fNumberConfirm[activePhoneIndex].input = phone?.Value;
                    fNumber.input = phone?.Value;
                    this.defaultUserName[activePhoneIndex] = phone?.IsUsername ? phone?.IsUsername : phone?.IsUsername;
                    this.defaultContactMethod[activePhoneIndex] = phone?.IsDefault;
                    this.agreement[activePhoneIndex] = phone?.IsAgreement;
                    this.errorUserName = '';
                }

                this.editing = 0;
                this.updateTermsCheckbox({ params: false });
                this.hideError();
                this.$nextTick(() => this.$refs['phoneNumberEditButton'][activePhoneIndex]?.focus());
            },
            confirmationCheckboxLabel() {
                const checkboxLabel = this.replaceTokenArray(
                    this.labels.agreementName.confirm,
                    ['<a href="#" class="text-green-100 terms-link z-1">' + this.labels.agreementName.terms + '</a>', '<a href="#" class="text-green-100 privacy-link z-1">' + this.labels.agreementName.privacy + '</a>']
                );
                return checkboxLabel;
            },
            criteria(val) {
                return regexParser(val);
            },
            clearStatus() {
                this.$refs.fValidation.forEach((status, index) => {
                    this.$refs.fValidation[index].textContent = '';
                });
            },
            formatPhone(phone) {
                if(!this.isKr) {
                    return phone;
                }

                return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
            },
            async updateNumber(index, event, savedPhones) {
                event.preventDefault();

                const activePhoneIndex = index - 1;
                const phone = savedPhones[activePhoneIndex];

                const isNewPhone = savedPhones.length < index || (!savedPhones[0].Id && this.isCn);
                const value = this.$refs.fNumber[activePhoneIndex].input;

                const id = isNewPhone ? '' : phone.Id; // index.toString();
                const isDefault = !isNewPhone ? phone?.IsDefault : false;

                const type = this.isCn ? 'MobilePhone' : this.$refs.fType[activePhoneIndex].selectedVal;
                const country = (this.isUseCountryFromDefaultAddress || this.isCn || !phone?.Country) ? this.country : phone.Country;
                const isCnProfile = this.isCn && this.isProfile;
                const valueConfirm = isCnProfile ? this.$refs.fNumberConfirm[activePhoneIndex].input : '';
                const isDefaultContactMethod = isCnProfile ? this.defaultContactMethod[activePhoneIndex] : false;
                const isDefaultUserName = isCnProfile ? this.defaultUserName[activePhoneIndex] : false;
                const isAgreement = isCnProfile ? this.agreement[activePhoneIndex] : false;

                const countryCode = country && country.length > 2 ? getCountryCode(country) || 'US' : country;

                const strippedPhone = $.trim(value.replace(/[\s.-]?/g, ''));

                // Check regex
                if(this.isTw) {
                    if(!isValidTwPhoneNumberType(strippedPhone, type)) {
                        this.showError(this.labels.errors.format);
                        return;
                    }
                } else {
                    if(!formHelper.isValidPhoneNumber(value, countryCode)) {
                        this.showError(this.labels.errors.format);
                        return;
                    } else if(isCnProfile && (value !== valueConfirm)) {
                        this.showError(this.labels.errors.confirm);
                        return;
                    } else if(isCnProfile && !isAgreement) {
                        this.showError(this.labels.errors.agreement);
                        return;
                    }
                }

                const payload = {
                    Id: id,
                    IdenType: type,
                    IsDefault: isCnProfile ? isDefaultContactMethod : isDefault,
                    Value: strippedPhone,

                    // cn overrides
                    ...(isCnProfile && {
                        IsAgreement: isAgreement,
                        IsUsername: isDefaultUserName
                    })
                };

                const request = isNewPhone ? api.post.bind(api) : api.put.bind(api);
                const response = await request(payload);

                if(response.success && response.data.Success) {
                    this.clearStatus();

                    const phoneId = isNewPhone ? response.data?.Data?.Id : id;
                    this.$set(this.savedPhones, activePhoneIndex, {
                        ...payload,
                        Country: country,
                        Id: phoneId
                    });
                    this.savedLength = this.savedPhones.length;
                    this.editing = 0;

                    this.hideError();
                    this.updateTermsCheckbox({ params: false });
                    this.$refs.fValidation[activePhoneIndex].textContent = this.labels.updated;

                    this.$nextTick(() => this.$refs['phoneNumberEditButton'][activePhoneIndex]?.focus());

                    if(!isCnProfile) {
                        // Clear success message after 2 second timeout (global except for CN)
                        setTimeout(() => {
                            this.clearStatus();
                        }, 2000);
                    } else {
                        setTimeout(() => {
                            window.location.reload();
                        }, 600);
                    }
                } else {
                    this.showError(response.data.ErrorMessages[0].Translation);
                }
            },
            async makeDefault(index) {
                if(index > this.savedLength) {
                    return;
                }

                const activePhoneIndex = index - 1;
                const defaultPhone = this.savedPhones[activePhoneIndex];
                const response = await api.put({ Value: defaultPhone.Value, IsDefault: true, IdenType: defaultPhone.IdenType, Id: defaultPhone.Id });

                if(response.success) {
                    this.clearStatus();
                    defaultPhone.IsDefault = true;
                    this.savedPhones.splice(activePhoneIndex, 1);
                    this.savedPhones.unshift(defaultPhone);
                    this.savedPhones.forEach((phone, index) => {
                        console.log(phone, defaultPhone);
                        if(phone !== defaultPhone) {
                            phone.IsDefault = false;
                        }
                        this.$set(this.savedPhones, index, phone);
                    });
                    this.updateInputValues();
                    this.$refs.fValidation[0].textContent = this.labels.updated;
                }
            },
            async deleteNumber(index) {
                const activePhoneIndex = index - 1;
                const deletedPhone = this.savedPhones[activePhoneIndex];
                const response = await api.delete({ Value: deletedPhone.Value, IsDefault: deletedPhone.IsDefault, IdenType: deletedPhone.IdenType, Id: deletedPhone.Id });

                if(response.success) {
                    this.clearStatus();
                    this.savedPhones.splice(activePhoneIndex, 1);
                    this.savedPhones.forEach((phone, index) => {
                        this.$set(this.savedPhones, index, phone);
                    });
                    this.savedLength = this.savedPhones.length;
                    this.editing = 0;
                    this.$refs.fValidation[0].textContent = this.labels.deleted;
                }
            },
            isUserName() {
                this.errorUserName = !this.defaultUserName[this.editing - 1] ? this.labels.warningUserName : '';
            },
            openModalTerms() {
                this.$modal.show({ id: 'modal-terms' });
            },
            openModalPrivacy() {
                this.$modal.show({ id: 'modal-privacy' });
            },
            updateInputValues() {
                this.savedPhones.forEach((phone, index) => {
                    if(this.$refs.fNumber) {
                        this.$refs.fNumber[index].input = phone.Value;
                    }
                    if(this.$refs.fType) {
                        this.$refs.fType[index].selectedVal = phone.IdenType;
                    }
                });
            },
            removeUnneededValues(returnType, currentlySelectedTypeValue) {
                // create an object that can  map the  phonesTypeValues to
                // the phonesType
                const table = this.phonesTypeValues.reduce((acc, cur, index) => {
                    acc[cur] = this.phonesType[index];
                    return acc;
                }, {});
                // add the initialValue/currentlySelectedTypeValue to the list
                // but make sure it isn't a duplicate
                let updatedTypeValues = [...new Set([...this.availablePhonesTypeValues, currentlySelectedTypeValue])];
                if(returnType === 'type') {
                    return updatedTypeValues.map(v => table[v]).join(',');
                } else if(returnType === 'values') {
                    return updatedTypeValues;
                }
            },
            getInitialValue(index) {
                if(this.phones.length === 0 || !this.phones[0].Id) {
                    return this.phonesTypeValues[0] || 'MobilePhone';
                } else if(this.savedPhones[index - 1]) {
                    return this.savedPhones[index - 1].IdenType;
                } else if(this.availablePhonesTypeValues && this.availablePhonesTypeValues.length > 0) {
                    return this.availablePhonesTypeValues[0];
                }
                return this.phonesTypeValues[0] || 'MobilePhone';
            },
            updateTermsCheckbox(params) {
                this.termsCheckbox = params.value;
                this.$v.$touch();
            },
            hideError() {
                this.error = '';
                this.$emit('error', false);
            },
            showError(msg) {
                this.error = msg;
                this.$emit('error', true);
            }
        }
    };
</script>
