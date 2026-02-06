<template>
    <div class="m-createAccountSection">
        <h2 v-if="!hideTitle" class="m-createAccountSection__title" v-html="title"></h2>

        <!-- Friend / Referral Option -->
        <div class="m-createAccountSection__row">
            <div class="w-full">
                <m-radio
                    ref="mlcOption"
                    v-model="selectedOption"
                    :name="mlcOption1.name"
                    :label="mlcOption1.label"
                    :label-mods="selectedOption === mlcOption1.value ? 'font-bold' : 'font-normal'"
                    :input-value="mlcOption1.value">
                </m-radio>

                <div class="flex flex-wrap">
                    <!-- Friend Name -->
                    <div class="m-createAccountSection__col w-full lg:w-1_2 pl-40 pr-0 m-formField -text">
                        <label
                            class="m-formField__label uppercase"
                            :for="friendName.id"
                            v-html="friendName.label">
                        </label>
                        <v-input
                            :id="friendName.id"
                            ref="friendName"
                            v-model="friendNameValue"
                            auto-complete="off"
                            :name="friendName.name"
                            :max-length="friendName.maxLength"
                            :min-length="friendName.minLength"
                            :placeholder="friendName.placeholder"
                            :tailwind-mods="$v.friendNameValue.$error ? '-isInvalid' : null"
                            :value="getInitialValue(null, 'friendName')"
                            @input="updateModel('friendNameValue')"
                            @blur="handleBlur('friendNameValue')">
                        </v-input>

                        <div v-if="$v.friendNameValue.$error" :id="`${friendName.id}-error`" class="e-formError">
                            <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(friendName.labelKey)"></p>
                        </div>
                    </div>

                    <!-- Friend E-mail/Phone -->
                    <div class="m-createAccountSection__col w-full lg:w-1_2 pl-40 lg:pl-15 xl:pl-30 pr-0 m-formField -text">
                        <label
                            class="m-formField__label uppercase"
                            :for="friendEmail.id"
                            v-html="friendEmail.label">
                        </label>
                        <v-input
                            :id="friendEmail.id"
                            ref="friendEmail"
                            v-model="friendEmailValue"
                            auto-complete="off"
                            :name="friendEmail.name"
                            :max-length="friendEmail.maxLength"
                            :min-length="friendEmail.minLength"
                            :placeholder="friendEmail.placeholder"
                            :tailwind-mods="$v.friendEmailValue.$error ? '-isInvalid' : null"
                            :value="getInitialValue(null, 'friendEmail')"
                            @input="updateModel('friendEmailValue')"
                            @blur="handleBlur('friendEmailValue')">
                        </v-input>

                        <div v-if="$v.friendEmailValue.$error" :id="`${friendEmail.id}-error`" class="e-formError">
                            <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(friendEmail.labelKey)"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Web Search Option -->
        <div class="m-createAccountSection__row">
            <div class="m-createAccountSection__col m-formField">
                <m-radio
                    ref="mlcOption"
                    v-model="selectedOption"
                    :name="mlcOption2.name"
                    :label="mlcOption2.label"
                    :label-mods="selectedOption === mlcOption2.value ? 'font-bold' : 'font-normal'"
                    :input-value="mlcOption2.value">
                </m-radio>
            </div>
        </div>

        <!-- Other Option -->
        <div class="m-createAccountSection__row">
            <div class="m-createAccountSection__col w-full lg:w-1_6 pr-0">
                <m-radio
                    ref="mlcOption"
                    v-model="selectedOption"
                    :name="mlcOption3.name"
                    :label="mlcOption3.label + ':'"
                    :label-mods="selectedOption === mlcOption3.value ? 'font-bold' : 'font-normal'"
                    :input-value="mlcOption3.value">
                </m-radio>
            </div>

            <div class="m-createAccountSection__col w-full lg:w-5_6 to-lg:pl-40 pr-0 pb-0 m-formField -text">
                <label
                    class="m-formField__label uppercase hidden"
                    :for="other.id"
                    v-html="other.label">
                </label>
                <v-input
                    :id="other.id"
                    ref="other"
                    v-model="otherValue"
                    auto-complete="off"
                    :name="other.name"
                    :max-length="other.maxLength"
                    :min-length="other.minLength"
                    :placeholder="other.placeholder"
                    :tailwind-mods="$v.otherValue.$error ? '-isInvalid' : 'font-normal'"
                    :value="getInitialValue(null, 'other')"
                    @input="updateModel('otherValue')"
                    @blur="handleBlur('otherValue')">
                </v-input>

                <div v-if="$v.otherValue.$error" :id="`${other.id}-error`" class="e-formError">
                    <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(other.labelKey)"></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import labels from '@common/source/js/vue/mixins/api-localization';
    import createAccountMixin from '../../../mixins/create-account';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import { validationMixin } from 'vuelidate';

    export default {
        name: 'MCreateAccountAboutMlc',
        components: {
            vInput
        },
        mixins: [ labels, createAccountMixin, validationMixin ],
        validations() {
            return {
                // Friend Name Validation Settings
                friendNameValue: {
                    required: value => {
                        // If it's Friend/Referral option, then required Friend Name field
                        if(!this.isOptional && this.mlcOptionValue === this.mlcOption1.value) {
                            return value;
                        } else {
                            return true;
                        }
                    }
                },

                // Friend Email Validation Settings
                friendEmailValue: {
                    required: value => {
                        // If it's Friend/Referral option, then required Friend Email field
                        if(!this.isOptional && this.mlcOptionValue === this.mlcOption1.value) {
                            return value;
                        } else {
                            return true;
                        }
                    },
                    emailphone: value => {
                        // If it's Friend/Referral option, then validates Friend Email field
                        if(!this.isOptional && this.mlcOptionValue === this.mlcOption1.value) {
                            // Accepts email or mobile number without mask
                            return this.isValidEmail(value) || (this.isValidPhoneNumber(value) && this.isInt(value));
                        } else {
                            return true;
                        }
                    }
                },

                // Other Validation Settings
                otherValue: {
                    required: value => {
                        // If it's Other option, then required Other field
                        if(!this.isOptional && this.mlcOptionValue === this.mlcOption3.value) {
                            console.log('value: ', value);
                            return value;
                        } else {
                            return true;
                        }
                    }
                }
            };
        },
        props: {
            hideTitle: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isOptional: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                sectionName: 'aboutMLC',

                // Radio buttons
                mlcOptionValue: 'friend',
                mlcOption1: {
                    name: 'mlcoption',
                    value: 'friend',
                    label: this.getLabels(this.localization, 'Labels.AboutMLCSection.Friend', 'Friend')
                },
                mlcOption2: {
                    name: 'mlcoption',
                    value: 'web',
                    label: this.getLabels(this.localization, 'Labels.AboutMLCSection.Web', 'Web')
                },
                mlcOption3: {
                    name: 'mlcoption',
                    value: 'other',
                    label: this.getLabels(this.localization, 'Labels.AboutMLCSection.Other', 'Other')
                },

                // Friend Name Field
                friendName: {
                    id: 'friendname',
                    name: 'friendname',
                    minLength: 1,
                    maxLength: 100,
                    placeholder: null,
                    label: this.getLabels(this.localization, 'Labels.AboutMLCSection.FriendName', 'FriendName'),
                    labelKey: 'FriendName'
                },
                friendNameValue: '',

                // Friend Email/Phone Field
                friendEmail: {
                    id: 'friendemail',
                    name: 'friendemail',
                    minLength: 1,
                    maxLength: 100,
                    placeholder: null,
                    label: this.getLabels(this.localization, 'Labels.AboutMLCSection.FriendEmail', 'FriendEmail'),
                    labelKey: 'FriendEmail'
                },
                friendEmailValue: '',

                // Other Field
                other: {
                    id: 'other',
                    name: 'other',
                    minLength: 1,
                    maxLength: 100,
                    placeholder: null,
                    label: this.getLabels(this.localization, 'Labels.AboutMLCSection.Other', 'Other'),
                    labelKey: 'Other'
                },
                otherValue: ''
            };
        },
        computed: {
            title() {
                let title = this.getLabels(this.localization, 'Labels.AboutMLCSection.Title', 'Title');

                if(this.isOptional) {
                    const optional = this.getLabels(this.localization, 'Labels.AboutMLCSection.Optional', 'Optional');
                    title = `${title} <span class="font-normal italic text-base">(${optional})</span>`;
                }

                return title;
            },
            selectedOption: {
                get() {
                    return this.mlcOptionValue;
                },
                set(val) {
                    this.mlcOptionValue = val;
                }
            }
        },
        watch: {
            mlcOptionValue() {
                // Update models
                this.friendNameValue = '';
                this.friendEmailValue = '';
                this.otherValue = '';

                this.updateModel('friendNameValue');
                this.updateModel('friendEmailValue');
                this.updateModel('otherValue');

                // Reset validation
                this.$nextTick(() => {
                    this.$v['friendNameValue'].$reset();
                    this.$v['friendEmailValue'].$reset();
                    this.$v['otherValue'].$reset();

                    // Remove from FE store
                    this.$store.commit('guest/REMOVE_FE_ERROR', [
                        this.friendName.labelKey,
                        this.friendEmail.labelKey,
                        this.other.labelKey
                    ]);
                });

                // Update radio button model
                this.updateModel('mlcOptionValue');
            }
        },
        mounted() {
            // Update radio button model
            this.updateModel('mlcOptionValue');
        }
    };
</script>
