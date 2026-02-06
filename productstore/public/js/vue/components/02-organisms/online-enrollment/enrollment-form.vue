<template>
    <div class="o-enrollmentForm pt-10 pb-10">
        <form action="" method="post">
            <!-- Component that controls steps / progress bar / content -->
            <o-access
                v-show="ready"
                :loading="storedGuestApiLoading || storedGuestSaved"
                :progress-final-text="text.final"
                :nav-class="!isGuestCheckout ? 'w-full' : null"
                class="-enrollmentForm">

                <!-- Page Title -->
                <template v-slot:heading>
                    {{ text.title }}
                </template>

                <!-- [Enrollment/GuestCheckout] Step 1 - Title (Profile) -->
                <template v-slot:progress-step-1>
                    {{ getLocalizationProp('Labels.Steps.Profile', 'Step 1') }}
                </template>

                <!-- [Enrollment/GuestCheckout] Step 1 - Content (Profile) -->
                <template v-slot:step-1>
                    <!-- Profile Section -->
                    <o-create-account-profile
                        v-if="loaded"
                        :allow-referral="true"
                        :cta-text="text.cta"
                        :is-cn="isCn"
                        :is-guest="isGuestCheckout"
                        :has-username="!isGuestCheckout"
                        :referral-is-optional="true"
                        :localization="localization"
                        @update-info="updateInfo"
                        @validate-section="validateSection"
                        @go-to-next="goToNext" />
                </template>

                <!-- [Enrollment/GuestCheckout] Step 2 - Title (Shipping/Address) -->
                <template v-slot:progress-step-2>
                    {{ text.shipping }}
                </template>

                <!-- [Enrollment/GuestCheckout] Step 2 - Content (Shipping/Address) -->
                <template v-slot:step-2>
                    <!-- Shipping Section -->
                    <m-create-account-shipping
                        v-if="loaded"
                        :localization="localization"
                        :is-form="false"
                        :default-address="defaultAddress"
                        @update-info="updateInfo"
                        @validate-section="validateSection"
                        @go-to-next="goToNext" />
                </template>

                <!--[Enrollment/GuestCheckout]  Step 3 - Title (Payment) -->
                <template v-slot:progress-step-3>
                    {{ text.payment }}
                </template>

                <!-- [Enrollment/GuestCheckout] Step 3 - Content (Payment) -->
                <template v-slot:step-3>
                    <!-- Payment Section -->
                    <o-enrollment-payment-section
                        v-if="loaded"
                        :extra-labels="paymentExtraLabels"
                        :is-cn="isCn"
                        :is-enrollment="!isGuestCheckout"
                        :is-guest-checkout="isGuestCheckout"
                        :script-id="scriptIdPayment"
                        :token="token"
                        @update-info="updateInfo"
                        @validate-section="validateSection"
                        @go-to-next="goToNext" />
                </template>

                <!-- [Enrollment] Step 4 - Title (Backup Order) -->
                <template v-if="!isGuestCheckout" v-slot:progress-step-4>
                    {{ getLocalizationProp('Labels.Steps.BackupOrder', 'Step 4') }}
                </template>

                <!-- [Enrollment] Step 4 - Content (Backup Order) -->
                <template v-if="!isGuestCheckout" v-slot:step-4>
                    <!-- BUO Section -->
                    <o-enrollment-buo-section
                        v-if="loaded"
                        :localization="localization"
                        @update-info="updateInfo"
                        @validate-section="validateSection"
                        @go-to-next="goToNext" />
                </template>

                <!-- [Enrollment] Step 5 - Title (Verify) -->
                <template v-if="!isGuestCheckout" v-slot:progress-step-5>
                    {{ getLocalizationProp('Labels.Steps.Verify', 'Step 5') }}
                </template>

                <!-- [Enrollment] Step 5 - Content (Verify) -->
                <template v-if="!isGuestCheckout" v-slot:step-5>
                    <!-- Verify Section -->
                    <m-create-account-verify
                        v-if="loaded && active === '5'"
                        :localization="localization"
                        :first-name="fields.firstNameValue || null"
                        :user-email="fields.emailValue || null"
                        :user-name="fields.usernameValue || null"
                        @update-info="updateInfo"
                        @validate-section="validateSection"
                        @go-to-next="goToNext" />
                </template>

                <!-- Last Step: Display API error after submit the entire form -->
                <template v-if="isLastStep" v-slot:common>
                    <!-- Show API errors messages -->
                    <div
                        v-if="!storedGuestSaved && storedGuestApiError && storedGuestApiError.length"
                        class="o-createAccountProfile__error e-formError w-full flex flex-col items-end justify-end">
                        <p
                            v-for="(validation, index) in storedGuestApiError"
                            :key="index"
                            class="e-formError__item block text-right py-0 md:w-1_2"
                            role="alert"
                            v-html="validation.error ? validation.error : validation">
                        </p>
                    </div>
                </template>
            </o-access>
        </form>
    </div>
</template>

<script>
    import { mapActions, mapState, mapGetters } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import * as addressTypes from '../../../utils/address-types';

    export default {
        name: 'OEnrollmentForm',
        mixins: [ localizationMixin ],
        props: {
            isCn: {
                type: Boolean,
                default: false
            },
            isGuestCheckout: {
                type: Boolean,
                default: false
            },
            scriptIdPayment: {
                type: String,
                default: 'dataPaymentForm'
            },
            token: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                ready: true,
                loaded: false,

                // Object to receive input models
                fields: {},

                // Mark sections as NOT valid
                sections: {
                    profile: false,
                    aboutMLC: false,
                    shipping: false,
                    payment: false,
                    buo: false,
                    verify: false
                }
            };
        },
        computed: {
            ...mapGetters('access', ['active']),
            ...mapState('guest', ['storedGuestApiLoading', 'storedGuest', 'storedGuestSaved', 'storedGuestApiError']),

            isLastStep() {
                // In Guest Checkout, the last step is Payment
                if(this.isGuestCheckout && this.active === '3') return true;

                // In Online Enrollment, the last step is Verify
                if(!this.isGuestCheckout && this.active === '5') return true;

                return false;
            },
            isUS() {
                return !this.lang || ['en-us', 'es-us'].includes(this.lang.toLowerCase());
            },
            isCA() {
                return this.lang && ['en-ca', 'fr-ca'].includes(this.lang.toLowerCase());
            },
            isMX() {
                return this.lang && this.lang.toLowerCase() === 'es-mx';
            },
            lang() {
                const langCode = this.localization?.Data?.Culture;
                let language = 'en-US';

                if(langCode) {
                    language = langCode;

                    if(!['en-us', 'es-us', 'fr-ca', 'en-ca', 'es-mx'].includes(language.toLowerCase())) {
                        language = 'en-US';
                    }
                }

                return language;
            },
            customerId() {
                return this.localization?.Data?.CustomerId || null;
            },
            defaultAddress() {
                let address = {
                    Country: this.storedGuest?.DefaultAddress?.Country || '',
                    AddressLine1: this.storedGuest?.DefaultAddress?.AddressLine1 || '',
                    AddressLine2: this.storedGuest?.DefaultAddress?.AddressLine2 || '',
                    AddressLine3: this.storedGuest?.DefaultAddress?.AddressLine3 || '', // MX only
                    Suburb: this.storedGuest?.DefaultAddress?.Suburb || '', // MX only
                    City: this.storedGuest?.DefaultAddress?.City || '',
                    Province: this.storedGuest?.DefaultAddress?.ProvinceShortName || '', // US and CA only
                    PostalCode: this.storedGuest?.DefaultAddress?.PostalCode || ''
                };

                if(this.isMX) {
                    address.Province = this.storedGuest?.DefaultAddress?.Province;
                }

                return address;
            },
            formIsValid() {
                console.log('--- formIsValid ---');
                console.log(this.sections);
                const { profile, aboutMLC, shipping, payment, buo, verify } = this.sections;

                if(this.isGuestCheckout) {
                    // Guest Checkout
                    return profile && aboutMLC && shipping && payment;
                } else {
                    // Online Enrollment
                    return profile && aboutMLC && shipping && payment && buo && verify;
                }
            },
            text() {
                let text = {};

                if(this.isGuestCheckout) {
                    text = {
                        title: this.getLocalizationProp('Labels.TitleGuest', 'Title'),
                        shipping: this.getLocalizationProp('Labels.Steps.Address', 'Address'),
                        payment: this.getLocalizationProp('Labels.Steps.Payment', 'Payment'),
                        final: this.getLocalizationProp('Labels.Steps.Checkout', 'Checkout'),
                        cta: this.getLocalizationProp('Labels.CTA.Next', 'Next')
                    };
                } else {
                    text = {
                        title: this.getLocalizationProp('Labels.TitleEnrollment', 'Title'),
                        shipping: this.getLocalizationProp('Labels.Steps.Shipping', 'Shipping'),
                        payment: this.getLocalizationProp('Labels.Steps.PaymentAgreement', 'PaymentAgreement'),
                        final: this.getLocalizationProp('Labels.Steps.Shopping', 'Shopping'),
                        cta: this.getLocalizationProp('Labels.CTA.Continue', 'Continue')
                    };
                }

                return text;
            },
            paymentExtraLabels() {
                let extraLabels = this.getLocalizationProp('Labels.PaymentSection') || {};
                extraLabels.Continue = this.getLocalizationProp('Labels.CTA.Continue', 'Continue');
                return extraLabels;
            }
        },
        async mounted() {
            // Get guest information
            // TODO: Online Enrollment: GET /api/enroll
            // TODO: Guest Checkout: it's not defined yet
            // TODO: Guest Web Account: it's not defined yet
            await this.getGuestInfo({ customerId: this.customerId });

            this.loaded = true;
        },
        methods: {
            ...mapActions('access', ['nextStep']),
            ...mapActions('guest', ['getGuestInfo', 'saveGuest', 'saveEnrollment']),

            updateInfo(payload) {
                this.fields[payload.model] = payload.value;
            },
            goToCheckout() {
                const url = this.localization?.Data?.CheckoutPageLink?.Url || window.location.origin;
                window.location.href = url;
            },
            goToCongrats() {
                const url = this.localization?.Data?.CongratsPageLink?.Url || window.location.origin;
                window.location.href = url;
            },
            async goToNext() {
                // Submit the form if it's valid and is the last step
                if(this.formIsValid && this.isLastStep) {
                    let payload = null;

                    // Guest Checkout: POST /api/guest
                    if(this.isGuestCheckout) {
                        // Prepare payload for Guest Checkout
                        payload = this.prepareGuestPayload();

                        // Save Guest Checkout
                        await this.saveGuest(payload);

                        // If the data is successfully saved
                        if(this.storedGuestSaved) {
                            // Go to Checkout Page
                            this.goToCheckout();
                        }

                    // Online Enrollment: POST /api/guest/enrollment/enroll
                    } else {
                        // Prepare payload for Online Enrollment
                        payload = this.prepareEnrollmentPayload();

                        // Save Online Enrollment
                        await this.saveEnrollment(payload);

                        // If the data is successfully saved
                        if(this.storedGuestSaved) {
                            // Go to Congrats Page
                            this.goToCongrats();
                        }
                    }
                } else {
                    // Go to next step
                    this.nextStep();
                }
            },
            prepareProfilePayload() {
                let payload = {};

                // Profile Section
                payload.FirstName = this.fields.firstNameValue;
                payload.LastName = this.fields.lastNameValue;
                payload.LastName2 = this.fields.lastName2Value || ''; // MX

                // Guest Checkout
                if(this.isGuestCheckout) {
                    payload.Email = this.fields.emailValue; // TODO: align with BE to standardize both contracts
                    payload.PhoneNumber = this.fields.phoneValue; // TODO: align with BE to standardize both contracts

                // Online Enrollment
                } else {
                    payload.EmailAddress = this.fields.emailValue; // TODO: align with BE to standardize both contracts
                    payload.Phones = [{ // TODO: align with BE to standardize both contracts
                        PhoneNumber: this.fields.phoneValue,
                        PhoneType: 'MobilePhone',
                        IsDefault: true
                    }];
                    payload.WebAccount = {
                        UserName: this.fields.usernameValue,
                        Password: this.fields.passwordValue
                    };
                    payload.Country = this.fields.shipping?.country;
                    payload.Language = this.lang;
                }

                return payload;
            },
            prepareReferralPayload() {
                let payload = {};

                if(!this.fields.referredCustomerId) {
                    // TODO: should send referred customer id null, in case there's NO referred customer??
                    payload.ReferringExecutiveCustomerId = null;

                    if(this.fields.mlcOptionValue === 'friend') {
                        // TODO: should send name and email even if there are empty??
                        payload.ReferralType = 'Referral'; // TODO: check Sitecode ENUM
                        payload.ReferralNameOrOther = this.fields.friendNameValue || '';
                        payload.ReferralContactInfo = this.fields.friendEmailValue || '';
                    }
                } else {
                    payload.ReferringExecutiveCustomerId = this.fields.referredCustomerId;

                    // TODO: should send referred info null, in case there is referred customer??
                    payload.ReferralType = 'Referral'; // TODO: check Sitecode ENUM
                    payload.ReferralNameOrOther = null;
                    payload.ReferralContactInfo = null;
                }

                return payload;
            },
            prepareShippingPayload() {
                let payload = {};

                // Shipping Section
                if(this.fields.shipping) {
                    payload.AddressType = addressTypes.shipping; // TODO: ask BE to add to API contract
                    payload.AddressLine1 = this.fields.shipping.address1;
                    payload.AddressLine2 = this.fields.shipping.address2 || '';
                    payload.AddressLine3 = this.fields.shipping.address3 || '';
                    payload.Suburb = this.fields.shipping.suburb || ''; // MX
                    payload.City = this.fields.shipping.city;
                    payload.Country = this.fields.shipping.country;
                    payload.Province = this.fields.shipping.state; // TODO: province full name
                    payload.ProvinceShortName = this.fields.shipping.state; // TODO: ask BE to add to API contract
                    payload.PostalCode = this.fields.shipping.zipCode;
                    payload.IsUserOverride = false; // TODO: create logic (indicates if the user over-rode the suggested address)
                    payload.IsDefault = true; // TODO: ask BE to add to API contract
                    payload.NameOnAddress = `${this.fields.firstNameValue} ${this.fields.lastNameValue}`; // TODO: ask BE to add to API
                }

                return payload;
            },
            preparePaymentPayload() {
                let payload = {};

                // Payment Section
                if(this.fields.payment) {
                    payload.PayMethodId = this.fields.payment.payMethodId;

                    // TODO: check with BE why the enrollment API has more fields related to payment
                    // TODO: align with BE to standardize both contracts
                    // Online Enrollment
                    if(!this.isGuestCheckout) {
                        payload.CreditCardPostalCode = this.fields.payment.postalCode;
                        payload.PayType = this.fields.payment.payType;
                        payload.NameOnAccount = this.fields.payment.nameOnAccount;
                        payload.AccountNickName = this.fields.payment.accountNickName;
                        payload.PayMethodDefaults = this.fields.payment.payMethodDefaults;
                        payload.PayMethodDirection = this.fields.payment.payMethodDirection;
                        payload.ExpirationDate = this.fields.payment.expirationDate;
                        payload.ShA1Hash = this.fields.payment.shA1Hash;
                        payload.BinNumber = this.fields.payment.binNumber;

                    // Guest Checkout
                    } else {
                        // TODO: align with BE to standardize both contracts
                        payload.Sha1 = this.fields.payment.shA1Hash;
                        payload.Bin = this.fields.payment.binNumber;
                    }
                }

                return payload;
            },
            prepareEnrollmentPayload() {
                // Payload for: POST /api/guest/enrollment/enroll
                const payload = {
                    // Profile Section
                    ...this.prepareProfilePayload(),

                    // Referral Section
                    ...this.prepareReferralPayload(),

                    // Shipping Section
                    Address: {
                        ...this.prepareShippingPayload()
                    },

                    // Payment Section
                    PayMethod: {
                        ...this.preparePaymentPayload()
                    },

                    // Membershipfee Section
                    // TODO: check with BE why Membershipfee is not on contract

                    // BUO Section
                    BackupOrder: {
                        BackupOrderType: 'SelectPack' // TODO: which field is that??
                    },

                    // Verify Section
                    VerificationPin: this.fields.enterCodeValue
                };

                return payload;
            },
            prepareGuestPayload() {
                // Payload for: POST /api/guest
                const payload = {
                    // Profile Section
                    ...this.prepareProfilePayload(),

                    // Referral Section
                    ...this.prepareReferralPayload(),

                    // Shipping Section
                    ...this.prepareShippingPayload(),

                    // Payment Section
                    ...this.preparePaymentPayload()
                };

                return payload;
            },
            validateSection(payload) {
                console.log('--- validateSection ---');
                console.log(payload);
                this.sections[payload.section] = payload.valid;
            }
        }
    };
</script>
