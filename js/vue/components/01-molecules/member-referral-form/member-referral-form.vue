<template>
    <form
        class="m-memberReferralForm">
        <div class="m-memberReferralForm__row">
            <!-- Full Name  (for NON China cultures) -->
            <div
                v-if="showFullName && !isCn"
                class="m-memberReferralForm__inputGroup"
            >
                <label
                    for="fullName"
                    class="font-medium"
                    v-html="labels.FullName"
                >
                </label>
                <input-basic
                    id="fullName"
                    ref="fullName"
                    model-name="inputValue"
                    :class="{ '-isInvalid':$v.firstName.$error}"
                    :placeholder="labels.FullNamePlaceholder"
                    input-type="text"
                    name="fullName"
                    :value="firstName"
                    aria-required="true"
                    @input="setValue('firstName', $event )"
                />
                <div v-if="$v.firstName.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.FullName }}
                </div>
            </div>

            <!-- Family Name -->
            <div v-if="isJp" class="m-memberReferralForm__inputGroup">
                <label
                    for="lastName"
                    class="font-medium"
                    v-html="labels.LastName"
                >
                </label>
                <input-basic
                    id="lastName"
                    ref="lastName"
                    model-name="inputValue"
                    :class="{ '-isInvalid':$v.lastName.$error}"
                    :placeholder="labels.LastNamePlaceholder"
                    input-type="text"
                    name="lastName"
                    :value="lastName"
                    aria-required="true"
                    @input="setValue('lastName', $event)"
                />
                <div v-if="$v.lastName.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.LastName }}
                </div>
            </div>

            <!-- First Name -->
            <div v-if="showFirstName" class="m-memberReferralForm__inputGroup">
                <label
                    for="firstName"
                    class="font-medium"
                    v-html="labels.FirstName"
                >
                </label>
                <input-basic
                    id="firstName"
                    ref="firstName"
                    model-name="inputValue"
                    :class="{ '-isInvalid':$v.firstName.$error}"
                    :placeholder="labels.FirstNamePlaceholder"
                    input-type="text"
                    name="firstName"
                    :value="firstName"
                    aria-required="true"
                    @input="setValue('firstName', $event)"
                />
                <div v-if="$v.firstName.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.FirstName }}
                </div>
            </div>

            <!--Last Name -->
            <div v-if="showLastName" class="m-memberReferralForm__inputGroup">
                <label
                    for="lastName"
                    class="font-medium"
                    v-html="labels.LastName"
                >
                </label>
                <input-basic
                    id="lastName"
                    ref="lastName"
                    model-name="inputValue"
                    :class="{ '-isInvalid':$v.lastName.$error }"
                    :placeholder="labels.LastNamePlaceholder"
                    input-type="text"
                    name="lastName"
                    :value="lastName"
                    aria-required="true"
                    @input="setValue('lastName', $event)"
                />
                <div v-if="$v.lastName.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.LastName }}
                </div>
            </div>
        </div>

        <div
            class="m-memberReferralForm__row"
            :class="{'-hideZipCode': hideZipcode, '-hideLanguage': isJp}"
        >
            <!-- FULL NAME (CHINA) Since it appears on 2nd row with preferred contact -->
            <div
                v-if="showFullName && isCn"
                class="m-memberReferralForm__inputGroup"
                :class="{ '-flex2': isCn }"
            >
                <label
                    for="fullName"
                    class="font-medium"
                    v-html="labels.FullName"
                >
                </label>
                <input-basic
                    id="fullName"
                    ref="fullName"
                    model-name="inputValue"
                    :class="{ '-isInvalid':$v.fullName.$error}"
                    :placeholder="labels.FullNamePlaceholder"
                    input-type="text"
                    name="fullName"
                    :value="fullName"
                    aria-required="true"
                    @input="setValue('fullName', $event )"
                />
                <div v-if="$v.fullName.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.FullName }}
                </div>
            </div>
            <!-- Nationality -->
            <div v-if="isHk" class="m-memberReferralForm__inputGroup">
                <label for="nationality" class="font-medium">
                    {{ labels.NationalityText }}
                </label>
                <v-select
                    id="nationality"
                    ref="nationality"
                    :class="{ '-error': $v.nationality.$error }"
                    select-mod="-sm-md -padding-md"
                    :values="labels.NationalityValues"
                    :options="labels.Nationality"
                    :initial="null"
                    :arrow-other-mods="'absolute -filled right-15 top-16 pointer-events-none'"
                    :disables="nationalityDisabled"
                    @change="updateNationality"
                />

                <div v-if="$v.nationality.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.Nationality }}
                </div>
            </div>

            <!-- Province -->
            <div
                v-if="isPh"
                class="m-memberReferralForm__inputGroup"
            >
                <label
                    for="provinceName"
                    class="font-medium"
                    v-html="labels.ProvinceName"
                >
                </label>
                <input-basic
                    id="provinceName"
                    ref="provinceName"
                    model-name="inputValue"
                    :class="{ '-isInvalid': $v.provinceName.$error }"
                    :placeholder="labels.ProvinceNamePlaceholder"
                    input-type="text"
                    name="province"
                    aria-required="true"
                    @input="setValue('provinceName', $event)"
                />
                <div v-if="$v.provinceName.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.ProvinceName }}
                </div>
            </div>

            <!--Zip Code -->
            <div v-if="showZipCode" class="m-memberReferralForm__inputGroup __zipCode">
                <label
                    :for="zip.Id"
                    class="font-medium"
                    v-html="labels.ZipCode"
                >
                </label>
                <input-basic
                    :id="zip.Id"
                    ref="zip"
                    v-model="zipValue"
                    auto-complete="off"
                    :name="zip.Name"
                    model-name="zipValue"
                    :class="{ '-isInvalid':$v.zipValue.$error }"
                    :placeholder="labels.ZipPlaceholder"
                    :value="zipValue"
                    aria-required="true"
                    @input="setValue('zipValue', $event)"
                />
                <div v-if="$v.zipValue.$error" class="e-formError__item">
                    <p v-if="$v.zipValue.$error">
                        {{ labels.ErrorMessages.ZipCode }}
                    </p>
                </div>
            </div>

            <!-- Language Preference -->
            <div
                v-if="showLanguagePreference"
                class="m-memberReferralForm__inputGroup"
            >
                <label
                    for="language"
                    class="font-medium"
                >
                    {{ labels.LanguagePreferenceText }}
                </label>
                <v-select
                    id="language"
                    ref="language"
                    select-mod="-sm-md -padding-md"
                    :values="labels.LanguageValues"
                    :options="labels.Language"
                    :initial="labels.LanguageValues[0]"
                    :arrow-other-mods="'absolute -filled right-15 top-16 pointer-events-none'"
                />
            </div>

            <!-- City -->
            <div v-if="isKr" class="m-memberReferralForm__inputGroup">
                <label
                    for="city"
                    class="font-medium"
                    v-html="labels.CityName"
                >
                </label>
                <div class="relative">
                    <drop-down
                        id="city"
                        ref="cityList"
                        v-model="cityName"
                        :items="cityValues"
                        :aria-label="labels.CityName"
                        :is-invalid="$v.cityName.$error"
                        @item-selected="handleCitySelected"
                    />
                </div>
                <div v-if="$v.cityName.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.CityName }}
                </div>
            </div>

            <!-- Preferred Contact -->
            <div
                v-if="labels.PreferredContact"
                class="m-memberReferralForm__inputGroup"
            >
                <label
                    for="preferredContact"
                    class="font-medium"
                >
                    {{ labels.PreferredContactText }}
                </label>
                <v-select
                    id="preferredContact"
                    ref="preferredContact"
                    select-mod="-sm-md -padding-md"
                    :values="labels.PreferredContactValues"
                    :options="labels.PreferredContact"
                    :initial="labels.PreferredContactValues[0]"
                    :arrow-other-mods="'absolute -filled right-15 top-16 pointer-events-none'"
                    @change="updateContactMethod"
                />
            </div>

            <!-- Email Input -->
            <div
                v-if="isEmailAsContact"
                class="m-memberReferralForm__inputGroup"
            >
                <label
                    :for="email.id"
                    class="font-medium"
                    v-html="labels.EmailAddress"
                >
                </label>
                <input-basic
                    :id="email.id"
                    ref="email"
                    v-model="emailValue"
                    auto-complete="off"
                    :class="{'-isInvalid': $v.emailValue.$error || isDuplicateEmail }"
                    :placeholder="labels.EmailPlaceholder"
                    :name="email.name"
                    aria-required="true"
                    @input="setValue('emailValue', $event)"
                    @blur="isIdentificationValidation ? validateEmail(emailValue) : null"
                />
                <div v-if="$v.emailValue.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.Email }}
                </div>
                <div v-if="isDuplicateEmail" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.DuplicateEmail }}
                </div>
            </div>

            <!-- Kakao Input -->
            <div
                v-if="isKakaoAsContact && isKakaoEnabled"
                class="m-memberReferralForm__inputGroup"
            >
                <label
                    :for="kakaoId"
                    class="font-medium"
                >
                    {{ labels.KakaoTalk }}
                </label>
                <input-basic
                    :id="kakaoId"
                    v-model="kakaoValue"
                    auto-complete="off"
                    :name="kakaoName"
                    :class="{'-isInvalid': $v.kakaoValue.$error || isKakaoDuplicate }"
                    :placeholder="labels.KakaoTalkPlaceholder"
                    aria-required="true"
                />
                <div v-if="$v.kakaoValue.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.KakaoTalk }}
                </div>
            </div>

            <!-- Phone Number Input -->
            <div
                v-if="isPhoneAsContact"
                class="m-memberReferralForm__inputGroup"
            >
                <label
                    :for="phone.id"
                    class="font-medium"
                    v-html="labels.MobileNumber"
                >
                </label>
                <input-basic
                    :id="phone.id"
                    ref="phone"
                    v-model="phoneValue"
                    auto-complete="off"
                    :name="phone.name"
                    :class="{'-isInvalid': $v.phoneValue.$error || isDuplicatePhone }"
                    :placeholder="labels.MobileNumberPlaceholder"
                    aria-required="true"
                    @input="setValue('phoneValue', $event)"
                    @blur="isIdentificationValidation ? validatePhoneNumber(phoneValue) : null"
                />
                <div v-if="$v.phoneValue.$error" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.PhoneNumber }}
                </div>
                <div v-if="isDuplicatePhone" class="e-formError__item" role="alert">
                    {{ labels.ErrorMessages.DuplicatePhone }}
                </div>
            </div>
        </div>

        <!-- Message Input -->
        <div class="m-memberReferralForm__row">
            <div
                class="m-memberReferralForm__inputGroup"
            >
                <label
                    for="message"
                    class="font-medium"
                >
                    {{ labels.Message }}
                </label>
                <text-area-basic
                    id="message"
                    ref="message"
                    name="message"
                    rows="1"
                    :value="message"
                    :class="{'-slim': isTw || isSgMy}"
                    aria-required="true"
                    @textArea="setValue('message', $event)"
                />
            </div>
        </div>

        <!--Consent Checkbox -->
        <div class="my-10 md:mx-40">
            <m-checkbox
                id="consent"
                ref="consent"
                v-model="consentValue"
                :aria-required="true"
                :label="consentLabel"
                :label-mods="`text-base font-normal px-0 -items-start${$v.consentValue.$error ?
                    ' -error' : ''}`"
                name="consent"
                input-value="consent"
            />
            <div v-if="$v.consentValue.$error" class="e-formError__item" role="alert">
                {{ labels.ErrorMessages.Consent }}
            </div>
        </div>

        <!-- Submit Button -->
        <div class="md:mx-40">
            <v-button
                type="submit"
                :aria-label="labels.Submit"
                :cta="labels.Submit"
                class="-medium mr-10"
                @click="submitForm($event)"
            />
        </div>
    </form>
</template>

<script>
    import apiCity from '@api/routes/address/citystatelist';
    import { mapActions, mapState } from 'vuex';
    import { required, requiredIf } from 'vuelidate/lib/validators';
    import { validationMixin } from 'vuelidate';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import getCountryCode from '@common/source/js/utils/get-country-code';

    export default {
        name: 'MMemberReferralForm',
        mixins: [ validationMixin ],
        props: {
            consent: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => ({
                })
            },
            hideZipcode: {
                type: Boolean,
                default: false
            },
            isIdentificationValidation: {
                type: Boolean,
                default: false
            }
        },
        validations() {
            return {
                cityName: {
                    required: requiredIf(() => this.isKr)
                },
                consentValue: {
                    required,
                    checked(value) {
                        return value === true;
                    }
                },
                firstName: {
                    required: requiredIf(() => !this.isCn)
                },
                fullName: {
                    required: requiredIf(() => this.isCn)
                },
                kakaoValue: {
                    required: requiredIf(() => this.isKakaoAsContact)
                },
                lastName: {
                    required: requiredIf(() => !this.isPh && !this.isHk && !this.isCn && !this.isTw && !this.isSgMy && !this.isKr)
                },
                nationality: {
                    required: requiredIf(() => this.isHk)
                },
                provinceName: {
                    required: requiredIf(() => this.isPh)
                },
                // Phone Validation Settings
                ...(this.isPhoneAsContact && {
                    phoneValue: {
                        required,
                        phone: value => {
                            if(value === null) return false;
                            return formHelper.isValidPhoneNumber(value, this.countryCode);
                        }
                    }
                }),
                // Email Validation Settings
                ...(this.isEmailAsContact && {
                    emailValue: {
                        required,
                        phone: value => {
                            if(value === null) return false;
                            return formHelper.isValidEmail(value);
                        }
                    }
                }),
                // Zip Code Validation Settings
                ...(!this.hideZipcode && !this.isPh && !this.isHk && !this.isCn && !this.isKr && {
                    zipValue: {
                        required,
                        phone: value => {
                            return formHelper.isValidPostalCode(value, this.countryCode);
                        }
                    }
                })
            };
        },
        data() {
            return {
                cityName: '',
                cityValues: [],
                consentValue: false,
                email: {
                    id: 'email',
                    name: 'email',
                    required: true
                },
                emailValue: '',
                firstName: null,
                fullName: null,
                isDuplicateEmail: false,
                isDuplicatePhone: false,
                isKakaoDuplicate: false,
                kakaoId: 'kakao',
                kakaoName: 'kakao',
                kakaoValue: '',
                lastName: null,
                message: '',
                nationality: null,
                phone: {
                    id: 'phone',
                    name: 'phone',
                    required: true
                },
                phoneValue: '',
                preferredContactMethod: '',
                provinceName: '',
                searchValue: '',
                selectedCityIndex: -1,
                showCityList: false,
                zip: {
                    type: Object,
                    default: function() {
                        return {
                            Id: 'zip',
                            Name: 'zip'
                        };
                    }
                },
                zipValue: ''
            };
        },
        computed: {
            ...mapState('email', ['isItDuplicateEmail']),
            consentLabel() {
                return this.labels?.ConsentText || '';
            },
            contactMethods() {
                const contactMethods = {};
                this.labels?.PreferredContactValues?.forEach((method) => {
                    contactMethods[method.replace(/\s+/g, '')] = method;
                });
                return contactMethods;
            },
            countryCode() {
                return getCountryCode(this.$env.Country)?.toLowerCase();
            },
            filteredCityValues() {
                if(!this.searchValue) {
                    return this.cityValues;
                }
                return this.cityValues.filter(city =>
                    city.toLowerCase().includes(this.searchValue.toLowerCase())
                );
            },
            isCn() {
                return this.countryCode === 'cn';
            },
            isEmailAsContact() {
                return this.preferredContactMethod === this.contactMethods?.Email;
            },
            isHk() {
                return this.countryCode === 'hk';
            },
            isJp() {
                return this.countryCode === 'jp';
            },
            isKakaoEnabled() {
                return this.countryCode === 'kr';
            },
            isKakaoAsContact() {
                return this.preferredContactMethod === this.contactMethods?.KakaoTalk;
            },
            isKr() {
                return this.countryCode === 'kr';
            },
            isPhoneAsContact() {
                return this.preferredContactMethod === this.contactMethods?.TextMessage || this.preferredContactMethod === this.contactMethods?.Phone;
            },
            isPh() {
                return this.countryCode === 'ph';
            },
            isSgMy() {
                return (this.countryCode === 'sg' || this.countryCode === 'my');
            },
            isTw() {
                return this.countryCode === 'tw';
            },
            nationalityDisabled() {
                const array = new Array(this.labels.Nationality.length).fill(false);
                array[0] = true;
                return array;
            },
            showFullName() {
                return this.isPh || this.isHk || this.isTw || this.isSgMy || this.isCn || this.isKr;
            },

            showFirstName() {
                return !this.isPh && !this.isHk && !this.isCn && !this.isTw && !this.isSgMy && !this.isKr;
            },

            showZipCode() {
                return !this.hideZipcode && !this.isPh && !this.isHk && !this.isCn && !this.isKr;
            },

            showLanguagePreference() {
                return this.labels.Language && !this.isPh && !this.isHk && !this.isCn && !this.isJp && !this.isTw && !this.isKr;
            },
            showLastName() {
                return !this.isPh && !this.isHk && !this.isCn && !this.isJp && !this.isTw && !this.isSgMy && !this.isKr;
            }
        },
        created() {
            this.getCityValues();
        },
        mounted() {
            this.$nextTick(() => {
                this.consentValue = this.consent;
            });
        },
        methods: {
            ...mapActions('email', ['getEmailIsDuplicate']),
            ...mapActions('phoneNumber', ['getPhoneIsDuplicate']),
            async getCityValues() {
                const getCityVals = await apiCity.get();
                if(getCityVals?.success && getCityVals?.data?.Success && getCityVals?.data?.Data) {
                    this.cityValues = getCityVals?.data?.Data.map(a => a.CityName);
                }
            },
            handleCitySelected(city) {
                this.cityName = city;
                this.showCityList = false;
                this.$v.cityName.$touch();
            },
            setValue(item, value) {
                this[item] = value;
            },
            async submitForm(event) {
                event.preventDefault();
                this.$v.$touch();

                if(!this.$v.$invalid && !(this.isDuplicateEmail || this.isDuplicatePhone)) {
                    // Params required to be posted
                    const formData = {
                        CityName: this.cityName,
                        FirstName: this.firstName,
                        FullName: this.fullName,
                        LanguagePreference: this.$refs.language?.selectedVal,
                        LastName: this.lastName,
                        Email: this.emailValue,
                        Kakao: this.kakaoValue,
                        Message: this.message,
                        Nationality: this.nationality,
                        Phone: this.phoneValue,
                        PreferredContactMethod: this.preferredContactMethod,
                        ProvinceName: this.provinceName,
                        PostalCode: this.zipValue
                    };
                    this.$emit('submit', formData);
                }
            },
            updateCity(value) {
                this.searchValue = value;
                this.cityName = value;
                this.selectedCityIndex = -1;
                this.showCityList = true;
            },
            updateContactMethod() {
                this.preferredContactMethod = this.$refs['preferredContact'].selectedVal;

                // Clear phone value if not using phone contact method
                if(!this.isPhoneAsContact) {
                    this.phoneValue = '';
                }

                // Clear email value if not using email contact method
                if(!this.isEmailAsContact) {
                    this.emailValue = '';
                }

                // Call updateNationality to ensure nationality fields are cleared if necessary
                this.updateNationality();
            },

            updateNationality() {
                // if without nationality component, then do nothing
                if(!this.$refs['nationality']) return;
                this.nationality = this.$refs['nationality'].selectedVal;

                if(this.isPhoneAsContact) {
                    const nationalityValues = this.labels.NationalityValues;
                    const nationalityCodes = this.labels.NationalityCode;
                    const nationalityPhoneCodeMap = nationalityValues.reduce((map, nationality, index) => {
                        if(nationality) {
                            map[nationality] = nationalityCodes[index - 1];
                        }
                        return map;
                    }, {});

                    this.phoneValue = nationalityPhoneCodeMap[this.nationality] || '';
                }
            },
            async validateEmail(emailValue) {
                this.isDuplicatePhone = false; // Reset phone validation
                await this.getEmailIsDuplicate(emailValue);
                this.isDuplicateEmail = this.isItDuplicateEmail;
            },
            async validatePhoneNumber(phoneValue) {
                this.isDuplicateEmail = false; // Reset email validation
                const { data, success } = await this.getPhoneIsDuplicate(phoneValue);
                if(success && data?.Success) {
                    this.isDuplicatePhone = data?.Data;
                } else {
                    console.error('An error occurred:', data?.ErrorMessages);
                }
            }
        }
    };
</script>
