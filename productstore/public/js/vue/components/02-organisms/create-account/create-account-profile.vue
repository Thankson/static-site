<template>
    <div class="o-createAccountProfile">
        <!-- Profile Section -->
        <m-create-account-profile
            v-if="localization && localization.Labels"
            :ref="profileSection"
            :has-username="hasUsername"
            :is-cn="isCn"
            :localization="localization"
            :title="profileTitle"
            @update-info="updateInfo" />

        <div v-if="localization && localization.Labels" class="flex flex-wrap">
            <!-- Title (About MLC or Referred) -->
            <div v-if="allowReferral" class="w-full">
                <h2 class="o-createAccountProfile__title" v-html="referralTitle"></h2>
            </div>

            <!-- Section (About MLC or Referred) -->
            <div v-if="allowReferral" class="w-full md:w-1_2 lg:w-2_3">
                <!-- About MLC Section -->
                <m-create-account-about-mlc
                    v-if="showAboutMLC"
                    :ref="aboutMLCSection"
                    :hide-title="true"
                    :is-cn="isCn"
                    :is-optional="referralIsOptional"
                    :localization="localization"
                    class="mb-0"
                    @update-info="updateInfo" />

                <!-- Referred Section -->
                <m-create-account-referred
                    v-if="showReferred"
                    :hide-title="true"
                    :is-cn="isCn"
                    :localization="localization"
                    class="to-md:mb-25 mb-0" />
            </div>

            <!-- CTA -->
            <div class="flex flex-col items-end justify-end w-full" :class="{'md:w-1_2': allowReferral, 'lg:w-1_3': allowReferral}">
                <button
                    class="o-createAccountProfile__button a-button green"
                    :class="{'-lg': isWebAccount}"
                    type="button"
                    @click="submit($event)">
                    {{ ctaText }}
                </button>
            </div>

            <!-- Show API/FE errors messages -->
            <div
                v-if="showGroupError && listError && listError.length"
                class="o-createAccountProfile__error e-formError w-full flex flex-col items-end justify-end">
                <p
                    v-for="(validation, index) in listError"
                    :key="index"
                    class="e-formError__item block text-right py-0 md:w-1_2"
                    role="alert"
                    v-html="validation.error ? validation.error : validation">
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import createAccountMixin from '../../../mixins/create-account';

    export default {
        name: 'OCreateAccountProfile',
        mixins: [ labels, createAccountMixin],
        props: {
            allowReferral: {
                type: Boolean,
                default: true
            },
            ctaText: {
                type: String,
                default: null
            },
            hasUsername: {
                type: Boolean,
                default: true
            },
            referralIsOptional: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isGuest: {
                type: Boolean,
                default: false
            },
            isWebAccount: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default: () => {}
            },
            showGroupError: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                fields: {},
                profileSection: 'profile',
                aboutMLCSection: 'aboutMLC'
            };
        },
        computed: {
            ...mapState('guest', ['storedGuestUserValidation']),

            profileTitle() {
                if(this.isGuest) {
                    return this.getLabels(this.localization, 'Labels.ProfileSection.TitleAboutYou', 'Title');
                } else {
                    return this.getLabels(this.localization, 'Labels.ProfileSection.Title', 'Title');
                }
            },
            referralTitle() {
                if(this.showAboutMLC) {
                    let title = this.getLabels(this.localization, 'Labels.AboutMLCSection.Title', 'Title');

                    if(this.referralIsOptional) {
                        const optional = this.getLabels(this.localization, 'Labels.AboutMLCSection.Optional', 'Optional');
                        title = `${title} <span class="font-normal italic text-base">(${optional})</span>`;
                    }

                    return title;
                } else {
                    return this.getLabels(this.localization, 'Labels.ReferredSection.Title', 'Title');
                }
            },
            showAboutMLC() {
                // If the form is configured to have referral information and there's NO referrer customer on store
                return this.allowReferral && !this.storedGuest?.Referrer?.CustomerId;
            },
            showReferred() {
                // If the form is configured to have referral information and there's referrer customer on store
                return this.allowReferral && !this.showAboutMLC;
            }
        },
        methods: {
            ...mapActions('guest', ['applyGuestValidation']),

            updateInfo(payload) {
                this.fields[payload.model] = payload.value;
                this.$emit('update-info', payload);
            },
            async validateEmailPhone() {
                // Validate email and phone using Validation API
                await this.applyGuestValidation({
                    Email: this.fields.emailValue,
                    Phone: this.fields.phoneValue
                });

                // If email and phone are valid, then proceed to next step
                if(this.storedGuestUserValidation?.EmailValid === true && this.storedGuestUserValidation?.PhoneValid === true) {
                    this.$emit('go-to-next');
                } else {
                    let validation = null;

                    // Email Validation
                    if(this.storedGuestUserValidation.EmailValid !== true) {
                        validation = this.$refs[this.profileSection].$v.emailValue;

                        // Apply validation
                        validation.$touch();

                        // Display error message on Profile Section molecule and add error to FE error store
                        this.handleValidationError('emailValue', validation, this.profileSection);
                    }

                    // Phone Validation
                    if(this.storedGuestUserValidation.PhoneValid !== true) {
                        validation = this.$refs[this.profileSection].$v.phoneValue;

                        // Apply validation
                        validation.$touch();

                        // Display error message on Profile Section molecule and add error to FE error store
                        this.handleValidationError('phoneValue', validation, this.profileSection);
                    }
                }
            },
            submit(event) {
                event.preventDefault();

                try {
                    // Validate Profile Section
                    let profileValid = this.sectionIsValid(this.profileSection);
                    this.$emit('validate-section', {
                        section: this.profileSection,
                        valid: profileValid
                    });

                    // Validate About MLC Section
                    let aboutMLCValid = this.showAboutMLC ? this.sectionIsValid(this.aboutMLCSection, false) : true;
                    this.$emit('validate-section', {
                        section: this.aboutMLCSection,
                        valid: aboutMLCValid
                    });

                    if(profileValid && aboutMLCValid) {
                        this.validateEmailPhone();
                    }
                } catch (e) {
                    console.log('[OCreateAccountProfile] Submit - Exception:');
                    console.log(e);
                }
            }
        }
    };
</script>
