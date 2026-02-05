<template>
    <form class="o-signInLia" method="post" novalidate>
        <input
            :id="redirectUrlId"
            type="hidden"
            :value="redirectUrl"
            :name="redirectUrlParam"
            data-testid="signIn-form" />

        <div class="flex flex-col flex-wrap">
            <div class="w-full uppercase">
                <div class="m-formField -text">
                    <label class="m-formField__label" :for="usernameId" data-testid="username-label">
                        <slot name="username-label">
                            Username
                        </slot>
                    </label>

                    <input
                        :id="usernameId"
                        v-model="usernameInput"
                        required
                        aria-required="true"
                        :autocomplete="autocompleteUsername"
                        type="text"
                        class="a-input -text text-sm"
                        :class="showErrorMessage || $v.usernameInput.$error ? '-isInvalid' : ''"
                        :name="usernameParam"
                        minlength="1"
                        :placeholder="usernamePlaceholder"
                        data-testid="username-input">
                </div>
            </div>
        </div>

        <div class="w-full uppercase">
            <div class="m-formField -text">
                <label class="m-formField__label" :for="passwordId" data-testid="password-label">
                    <slot name="password-label">
                        Password
                    </slot>
                </label>

                <a-input-glimpse
                    :attributes="passwordAttributes"
                    :init-hidden="true"
                    :show-label="showLabel"
                    :hide-label="hideLabel"
                    :autocomplete="autocompletePassword"
                    :input-classname="showErrorMessage || $v.passwordInput.$error ? '-isInvalid a-input -text' : 'a-input -text'"
                    :value="passwordInput"
                    test-id-glimpse="showPassword-button"
                    test-id-input="password-input"
                    @keydown.enter.native="[submit($event)]"
                    @input="val => (passwordInput = val)">
                </a-input-glimpse>
            </div>
        </div>

        <div class="w-full lg:flex lg:flex-row mt-10">
            <div class="lg:w-1_2 w-full flex items-start md:block relative">
                <div class="w-full">
                    <button
                        class="a-button justify-center leading-tight py-15 md:max-w-260 text-center w-full"
                        type="submit"
                        :aria-label="buttonAriaLabel"
                        data-testid="signIn-button"
                        @click="[submit($event)]">
                        <slot name="button-label">
                            SIGN IN
                        </slot>
                    </button>
                </div>
            </div>
            <div class="o-signInLia__errorMsg w-full pt-5 md:py-5 mt-6 md:mb-9 lg:w-1_2 lg:py-0" :class="{'hidden': !showErrorMessage && !($v.usernameInput.$error || $v.passwordInput.$error)}" data-testid="invalidCredential-container">
                <p role="alert" class="o-signInLia__error flex leading-tight text-red text-xs w-full md:text-sm lg:text-left lg:pl-10 xl:pl-25 xl:pr-6" data-testid="invalidCredential-text" v-html="invalidCredentialText"></p>
            </div>
        </div>

        <div v-if="!hideKeepMeSignedIn" class="w-full mb-15 pt-20 md:mb-20">
            <div class="m-formField -checkbox ">
                <input
                    :id="staySignedInId"
                    v-model="staySignedInInput"
                    type="checkbox"
                    class="a-input -checkbox"
                    :name="staySignedInParam"
                    value="true"
                    data-testid="staySignedIn-checkbox">

                <label class="m-formField__label -checkbox" :for="staySignedInId" data-testid="staySignedIn-label">
                    <slot name="signed-in-label">
                        Keep Me Signed In
                    </slot>
                </label>
            </div>
        </div>

        <div v-if="agreementList?.length" class="mt-15">
            <template v-for="(agreement, index) in agreementList">
                <m-checkbox-rte-modal
                    :key="agreement.Name"
                    class="-skyCta"
                    head-class="-signInCard"
                    body-class="-signInCard"
                    script-id=""
                    hide-footer
                    :value="$v.terms.$each[index].$model.term"
                    :modal-data="agreement"
                    :my-name="agreement.Name"
                    @update="$v.terms.$each[index].$model.term = $event.value"
                />
                <div
                    v-if="$v.terms.$each[index].$error"
                    :key="`${agreement.Name}-errorMsg`"
                    class="e-formError__item"
                    role="alert"
                    v-html="agreement.ErrorMessage"
                >
                </div>
            </template>
        </div>

        <div v-if="$slots['info']" class="flex flex-col flex-wrap md:flex-row mt:30 md:mt-15">
            <slot name="info" />
        </div>
    </form>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import privacyPolicyLogMixin from '@common/source/js/vue/mixins/privacy-policy-log';
    import signInCardTermsMixin from '@common/source/js/vue/mixins/sign-in-card-terms';

    export default {
        name: 'OSignInLia',
        mixins: [ safeId, validationMixin, privacyPolicyLogMixin, signInCardTermsMixin ],
        safeIds: [
            'passwordId',
            'usernameId',
            'staySignedInId'
        ],
        validations: {
            usernameInput: {
                required
            },
            passwordInput: {
                required
            },
            terms: {
                $each: {
                    term: {
                        termRequiredValidator: (val, data) => {
                            const {Required} = data;
                            if(Required) {
                                return val;
                            }
                            return true;
                        }
                    }
                }
            }
        },
        props: {
            buttonAriaLabel: {
                type: String,
                default: 'Sign In'
            },
            enablePolicyLog: {
                type: Boolean,
                default: false
            },
            hideCountrySelector: {
                type: Boolean,
                default: false
            },
            hideKeepMeSignedIn: {
                type: Boolean,
                default: false
            },
            invalidCredentialText: {
                type: String,
                default: ''
            },
            redirectUrlId: {
                type: String,
                default: ''
            },
            redirectUrl: {
                type: String,
                default: ''
            },
            redirectUrlParam: {
                type: String,
                default: 'ReturnUrl'
            },
            password: {
                type: String,
                default: ''
            },
            passwordPlaceholder: {
                type: String,
                default: 'Enter Password'
            },
            passwordParam: {
                type: String,
                default: 'password'
            },
            showErrorMessage: {
                type: Boolean,
                default: false
            },
            username: {
                type: String,
                default: ''
            },
            usernamePlaceholder: {
                type: String,
                default: 'Enter Username'
            },
            usernameParam: {
                type: String,
                default: 'username'
            },
            staySignedIn: {
                type: Boolean,
                default: false
            },
            staySignedInParam: {
                type: String,
                default: 'keepMeSignedIn'
            },
            showLabel: {
                type: String,
                default: 'Show Password'
            },
            hideLabel: {
                type: String,
                default: 'Hide Password'
            }
        },
        data() {
            return {
                passwordInput: '',
                usernameInput: '',
                staySignedInInput: '',

                // dynamic Ids
                passwordId: '',
                usernameId: '',
                staySignedInId: ''
            };
        },
        computed: {
            // both these autocomplete values when hideCountrySelector is true
            // are used for the Mobile Shopping App
            autocompletePassword() {
                return this.hideCountrySelector ? 'current-password' : 'off';
            },
            autocompleteUsername() {
                return this.hideCountrySelector ? 'username' : false;
            },
            passwordAttributes() {
                return {
                    id: this.passwordId,
                    name: this.passwordParam,
                    minlength: '1',
                    maxlength: '100',
                    required: true,
                    'aria-required': true,
                    placeholder: this.passwordPlaceholder
                };
            }
        },
        watch: {
            username() {
                this.usernameInput = this.username;
            },
            password() {
                this.passwordInput = this.password;
            },
            staySignedIn() {
                this.staySignedInInput = this.staySignedIn;
            }
        },
        created() {
            this.$v.$reset();
            this.$on('submit', this.submit);
        },
        mounted() {
            this.usernameInput = this.username;
            this.passwordInput = this.password;
            this.staySignedInInput = this.staySignedIn;
        },
        methods: {
            submit(event) {
                if(event !== undefined) {
                    event.preventDefault();
                }

                this.$v.$touch();

                if(!this.$v.$error) {
                    if(this.enablePolicyLog) {
                        this.policyLogAndExecute(
                            {
                                id: 'id10',
                                applicationName: 'LIA',
                                UserName: this.usernameInput
                            },
                            () => this.$el.submit()
                        );
                    } else {
                        this.$el.submit();
                    }
                }
            }
        }
    };
</script>
