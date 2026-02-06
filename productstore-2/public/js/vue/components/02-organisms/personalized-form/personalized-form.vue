<template>
    <div class="o-personalizedForm">
        <!-- Background image -->
        <img
            class="o-personalizedForm__background"
            :alt="getLocalizationProp('Data.Background.Alt')"
            :src="getLocalizationProp('Data.Background.Src')"
        />
        <form v-if="!submited" class="o-personalizedForm__form">
            <h3 class="o-personalizedForm__title">{{ getLocalizationProp('Data.Title') }}</h3>
            <p class="o-personalizedForm__text" v-html="getLocalizationProp('Data.Text')"></p>
            <div class="o-personalizedForm__row">
                <div class="o-personalizedForm__col">

                    <!-- First Name Field -->
                    <div class="o-personalizedForm__formGroup">
                        <label class="o-personalizedForm__label" for="fname" v-html="getLocalizationProp('Labels.FirstName')"></label>
                        <input-basic
                            id="fname"
                            ref="FName"
                            name="fname"
                            :value="firstName"
                            :tailwind-mods="`bg-clear ${error.firstName ? '-isInvalid': ''}`"
                            @keyup="error.firstName = false"
                            @input="setValue('firstName', $event)"
                        />
                        <em v-if="error.firstName" class="o-personalizedForm__error">{{ getLocalizationProp('Labels.InvalidFirstName') }}</em>
                    </div>
                </div>
                <div class="o-personalizedForm__col">

                    <!-- Last Name Field -->
                    <div class="o-personalizedForm__formGroup">
                        <label class="o-personalizedForm__label" for="lname" v-html="getLocalizationProp('Labels.LastName')"></label>
                        <input-basic
                            id="lname"
                            ref="LName"
                            name="lname"
                            :value="lastName"
                            :tailwind-mods="`bg-clear ${error.lastName ? '-isInvalid': ''}`"
                            @keyup="error.lastName = false"
                            @input="setValue('lastName', $event)"
                        />
                        <em v-if="error.lastName" class="o-personalizedForm__error">{{ getLocalizationProp('Labels.InvalidLastName') }}</em>
                    </div>
                </div>
            </div>
            <div class="o-personalizedForm__row">
                <div class="o-personalizedForm__col -email">

                    <!-- Email Field -->
                    <div class="o-personalizedForm__formGroup">
                        <label class="o-personalizedForm__label" for="email" v-html="getLocalizationProp('Labels.Email')"></label>
                        <input-basic
                            id="email"
                            ref="Email"
                            name="email"
                            :value="email"
                            :tailwind-mods="`bg-clear ${error.email ? '-isInvalid': ''}`"
                            @keyup="error.email = false"
                            @input="setValue('email', $event)"
                        />
                        <em v-if="error.email" class="o-personalizedForm__error">{{ getLocalizationProp('Labels.InvalidEmail') }}</em>
                    </div>
                </div>
                <div class="o-personalizedForm__col -phone">

                    <!-- Phone Field -->
                    <div v-if="getLocalizationProp('Labels.Phone')" class="o-personalizedForm__formGroup">
                        <label class="o-personalizedForm__label" for="phone" v-html="getLocalizationProp('Labels.Phone.title')"></label>
                        <div class="o-personalizedForm__phone">
                            <div class="o-personalizedForm__phone -type">
                                <v-select
                                    id="phonetype"
                                    ref="phoneType"
                                    :options="getLocalizationProp('Labels.Phone.types')"
                                    :values="getLocalizationProp('Labels.Phone.typesValues')"
                                    :aria-label="getLocalizationProp('Labels.Phone.typeAria')"
                                    select-mod="-sm w-full bg-clear"
                                    arrow-other-mods="-filled w-0 h-0 absolute right-15 top-10 pointer-events-none md:top-8"
                                    :initial="getLocalizationProp('Labels.Phone.typesValues')[0]"
                                />
                            </div>
                            <div class="o-personalizedForm__phone -number">
                                <input-basic
                                    id="phone"
                                    ref="Phone"
                                    name="phone"
                                    :value="phoneNumber"
                                    :tailwind-mods="`bg-clear ${error.phoneNumber ? '-isInvalid': ''}`"
                                    @input="setValue('phoneNumber', $event)"
                                />
                            </div>
                        </div>
                        <em v-if="error.phoneNumber" class="o-personalizedForm__error">{{ getLocalizationProp('Labels.InvalidPhone') }}</em>
                    </div>
                </div>
            </div>

            <div class="o-personalizedForm__row">
                <div class="o-personalizedForm__col -full">
                    <!-- Message Field -->
                    <div class="o-personalizedForm__formGroup">
                        <label class="o-personalizedForm__label" for="message" v-html="getLocalizationProp('Labels.Message')"></label>
                        <text-area-basic
                            id="message"
                            ref="message"
                            name="message"
                            rows="9"
                            :value="message"
                            :tailwind-mods="`border-1 bg-clear ${error.message ? '-isInvalid': ''}`"
                            @keyup="error.message = undefined"
                            @textArea="setValue('message', $event)"
                        />
                        <em v-if="error.message" class="o-personalizedForm__error">{{ getLocalizationProp('Labels.InvalidMessage') }}</em>
                    </div>
                </div>
            </div>
            <div class="o-personalizedForm__actions">
                <button
                    class="a-authorBtn -default block bg-green text-center rounded px-50 w-full md:w-auto"
                    @click.stop.prevent="[submit(), gtmTrackAction({id: 23}, $event)]"
                >
                    {{ getLocalizationProp('Data.CTAText') }}
                </button>
            </div>
            <a-loading-spinner :visible="loading" size="sm" />
        </form>
        <div v-else class="o-personalizedForm__submited">
            <h3 class="o-personalizedForm__title">{{ getLocalizationProp('Data.Thankyou.Title') }}</h3>
            <p class="o-personalizedForm__text -thankyou" v-html="getLocalizationProp('Data.Thankyou.Text')"></p>
            <a
                :href="getLocalizationProp('Data.Thankyou.LearnMoreLink')"
                class="a-authorBtn -default text-center bg-white rounded px-50 w-full mt-20 mb-9 md:my-0 md:w-auto"
                @click="gtmTrackAction({id: 26}, $event)"
            >
                {{ getLocalizationProp('Data.Thankyou.LearnMore') }}
            </a>
        </div>
    </div>
</template>
<script>
    import regexParser from 'regex-parser';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/about/contact';

    export default {
        name: 'OPersonalizedForm',
        mixins: [ localizationMixin ],
        data: function () {
            return {
                firstName: '',
                lastName: '',
                email: '',
                message: '',
                phoneNumber: '',
                error: {},
                loading: false,
                submited: false
            };
        },
        methods: {
            allFieldsValid: function () {
                // validate all fields
                let valid = true;
                const fields = ['firstName', 'lastName', 'message'];
                this.error = {};

                fields.forEach(field => {
                    if(!this[field]) {
                        this.error[field] = true;
                        valid = false;
                    }
                });

                if(!this.isValidEmail(this.email)) {
                    this.error.email = true;
                    valid = false;
                }

                if(this.phoneNumber.length > 0 && !this.isValidPhoneNumber()) {
                    this.error.phoneNumber = true;
                    valid = false;
                }

                return valid;
            },
            isValidEmail: function(email) {
                // validate email address
                // Aswer from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            },
            isValidPhoneNumber: function() {
                // validate phone number
                const phoneUsCan = '/^([2-9]{1})([0-9]{2})([\\s.-]?)([2-9]{1})([0-9]{2})([\\s.-]?)([0-9]{4})$/gm';
                const phoneMx = '/^([0-9]{2,3})([\\s.-]?)([0-9]{3,4})([\\s.-]?)([0-9]{4})$/';
                const phoneLength = $.trim(this.phoneNumber.replace(/[\s.-.()-]?/g, '')).length;
                const country = this.getLocalizationProp('Data.Country');
                let chosenRegex = null;
                // Set chosen regex by country
                if(country === 'us' || country === 'ca') {
                    chosenRegex = phoneUsCan;
                } else {
                    chosenRegex = phoneMx;
                }
                if(phoneLength !== 10 || !regexParser(chosenRegex).test($.trim(this.phoneNumber.replace(/[\s.-.()-]?/g, '')))) {
                    return false;
                }
                return true;
            },
            submit: async function () {
                // submit request
                if(this.loading) {
                    return;
                }
                this.loading = true;

                if(!this.allFieldsValid()) {
                    this.loading = false;
                    return;
                }

                const info = {
                    FirstName: this.firstName,
                    LastName: this.lastName,
                    Email: this.email,
                    Message: this.message,
                    Phone: this.phoneNumber,
                    PhoneType: this.$refs.phoneType.selectedVal,
                    SendTo: this.getLocalizationProp('Data.SendTo')
                };

                const response = await api.post(info);
                if(response.success) {
                    this.loading = false;
                    this.submited = true;
                }
            },
            setValue(item, value) {
                this[item] = value;
            }
        }
    };
</script>
