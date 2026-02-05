<template>
    <div class="m-createAccountSection">
        <!-- Title -->
        <h2 v-if="loaded" class="m-createAccountSection__title" v-html="title"></h2>

        <!-- Subtitle -->
        <div
            v-if="loaded && sent"
            class="italic text-gray-120 text-base font-normal leading-tight mb-40"
            v-html="getLabels(localization, 'Labels.VerifySection.Subtitle')"></div>

        <!-- Submit received code -->
        <div v-if="loaded && sent" class="m-createAccountSection__enterCode mb-20">
            <!-- Enter Code -->
            <div class="m-formField -text w-full md:w-1_2 pr-5 pb-0 mb-0">
                <!-- Label -->
                <label
                    class="m-formField__label uppercase"
                    :for="enterCode.id"
                    v-html="enterCode.label">
                </label>

                <!-- Input -->
                <v-input
                    :id="enterCode.id"
                    ref="enterCode"
                    v-model="enterCodeValue"
                    auto-complete="off"
                    :name="enterCode.name"
                    :max-length="enterCode.maxLength"
                    :min-length="enterCode.minLength"
                    :placeholder="enterCode.placeholder"
                    :tailwind-mods="$v.enterCodeValue.$error ? '-isInvalid' : null"
                    :value="getInitialValue(null, 'enterCode')"
                    @input="updateModel('enterCodeValue')"
                    @blur="handleBlur('enterCodeValue')">
                </v-input>
            </div>

            <!-- Submit Code -->
            <div class="w-full md:w-1_2 pt-25 pl-5 pb-0 mb-0">
                <button class="m-createAccountSection__button a-button green" type="button" @click="submit($event)">
                    {{ getLabels(localization, 'Labels.VerifySection.SubmitCode', 'Submit') }}
                </button>
            </div>

            <!-- Validation Error Message -->
            <div v-if="$v.enterCodeValue.$error" :id="`${enterCode.id}-error`" class="e-formError w-full">
                <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(enterCode.labelKey)"></p>
            </div>
        </div>

        <!-- Try to receive code again -->
        <button
            v-if="loaded && !sent"
            class="m-createAccountSection__button a-button green mb-25"
            type="button"
            @click="sendValidationEmail()">
            {{ getLabels(localization, 'Labels.VerifySection.TryAgain', 'Resend') }}
        </button>

        <!-- Footnote -->
        <div class="m-createAccountSection__footnote" v-html="getLabels(localization, 'Labels.VerifySection.Footnote')"></div>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import createAccountMixin from '../../../mixins/create-account';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';

    export default {
        name: 'MCreateAccountVerify',
        components: {
            vInput
        },
        mixins: [ labels, createAccountMixin, validationMixin ],
        validations() {
            return {
                // Validation Settings
                enterCodeValue: {
                    required
                }
            };
        },
        props: {
            localization: {
                type: Object,
                default: () => {}
            },
            firstName: {
                type: String,
                default: null
            },
            userEmail: {
                type: String,
                default: null
            },
            userName: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                loaded: false,
                sectionName: 'verify',
                sent: false,

                // Enter Code Field
                enterCode: {
                    id: 'entercode',
                    name: 'entercode',
                    minLength: 1,
                    maxLength: 100,
                    placeholder: null,
                    label: this.getLabels(this.localization, 'Labels.VerifySection.EnterCode', 'EnterCode'),
                    labelKey: 'EnterCode'
                },
                enterCodeValue: ''
            };
        },
        computed: {
            ...mapState('guest', ['storedGuestPinValidate']),

            title() {
                if(this.sent) {
                    return this.replaceToken(this.getLabels(this.localization, 'Labels.VerifySection.Title', 'Title'), this.userEmail);
                } else {
                    return this.replaceToken(this.getLabels(this.localization, 'Labels.VerifySection.NotSent', 'Error'), this.userEmail);
                }
            }
        },
        async mounted() {
            await this.sendValidationEmail();

            this.loaded = true;
        },
        methods: {
            ...mapActions('guest', ['sendGuestPin']),

            async sendValidationEmail() {
                this.sent = false;

                // Ping Sitecore API to send code confirmation to email
                await this.sendGuestPin({
                    EmailAddress: this.userEmail,
                    FirstName: this.firstName,
                    UserName: this.userName
                });

                // Check if the email was really sent
                this.sent = this.storedGuestPinValidate;
            },
            submit(event) {
                event.preventDefault();

                // Apply validation
                this.$v.enterCodeValue.$touch();

                if(!this.$v.$invalid) {
                    // Validate Verify Section
                    this.$emit('validate-section', {
                        section: this.sectionName,
                        valid: true
                    });

                    // Go to next
                    this.$emit('go-to-next');
                } else {
                    // Display error message
                    this.handleValidationError('enterCodeValue', this.$v.enterCodeValue);

                    // Validate Verify Section
                    this.$emit('validate-section', {
                        section: this.sectionName,
                        valid: false
                    });
                }
            },
            replaceToken
        }
    };
</script>
