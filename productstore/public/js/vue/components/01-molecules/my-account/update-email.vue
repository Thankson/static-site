<template>
    <div class="m-updateEmail">
        <form class="w-full pb-20" @submit="updateEmail">
            <div :class="isCn && !isProfile ? 'pb-10' : 'pb-20'">
                <label class="text-gray-150 text-sm leading-base uppercase mb-5 font-medium" :class="{'font-semibold' : isCn, 'text-xs md:text-sm':!isProfile && isCn}" for="femail">{{
                    labels.title
                }}</label>
                <div class="w-full" aria-live="polite">
                    <em v-if="updated" class="text-green italic font-medium text-2xl block -mr-5 mt-5 mb-18">
                        {{ labels.updatedSuccess }}
                    </em>
                    <div :class="inputMods">
                        <v-input
                            id="femail"
                            ref="fEmail"
                            name="femail"
                            :value="email.Value"
                            :tailwind-mods="isCn && !isProfile && error ? 'bg-clear border-error' : 'bg-clear'"
                            :disabled="!editing"
                            :aria-disabled="!editing"
                            :aria-label="editing ? email.Value : null"
                        >
                        </v-input>
                        <button
                            v-if="!editing"
                            ref="emailEditButton"
                            class="uppercase text-green font-medium absolute px-10 right-0 h-full top-0"
                            :class="{'text-xs md:text-sm' : !isProfile && isCn}"
                            :aria-label="labels.editAriaLabel"
                            type="button"
                            @click="[showEdit(), gtmTrackAction({ id: 204 }, $event)]"
                        >
                            {{ labels.edit }}
                        </button>
                    </div>
                </div>
            </div>
            <div :class="[editing ? 'block' : 'hidden', {'text-right':!isCn}]" class="font-normal -mt-5 mb-25">
                <div v-if="isCn && isProfile" class="mb-20 text-left">
                    <h3 class="text-gray-150 font-medium text-sm leading-base uppercase flex justify-between mb-5">
                        {{ labels.confirmTitle }}
                    </h3>
                    <v-input
                        :id="'femailConfirm'"
                        ref="fEmailConfirm"
                        :name="'fEmailConfirm'"
                        :value="savedEmail ? savedEmail : email.Value"
                        tailwind-mods="bg-clear"
                    >
                    </v-input>
                </div>
                <!-- Make default email number -->
                <div v-if="isCn && isProfile" class="mb-20">
                    <div class="md:flex">
                        <div class="md:flex-1">
                            <m-checkbox
                                ref="DefaultUserName"
                                v-model="defaultUserName"
                                name="defaultUserName"
                                :disabled="email.IsUsername"
                                :label="labels.makeUserNameDefaultLabel"
                                :value="email.IsUsername"
                                :input-value="labels.makeUserNameDefaultLabel"
                                @click.native="isUserName()"
                            >
                            </m-checkbox>
                            <em v-if="errorUserName" class="e-formError__item float-left text-left w-full not-italic" role="alert">
                                {{ errorUserName }}
                            </em>
                        </div>
                        <div class="md:flex-1">
                            <m-checkbox
                                ref="DefaultContactMethod"
                                v-model="defaultContactMethod"
                                name="defaultContactMethod"
                                :disabled="email.IsDefault"
                                :label="labels.makeDefaultContactMethod"
                                :value="email.IsDefault"
                                :input-value="labels.makeDefaultContactMethod"
                            >
                            </m-checkbox>
                        </div>
                    </div>
                    <m-checkbox
                        ref="Agreement"
                        v-model="agreement"
                        name="agreement"
                        class="text-left"
                        :is-cn="true"
                        :label="confirmationCheckboxLabel()"
                        :value="email.IsAgreement"
                        :input-value="labels.agreementName.confirm"
                    >
                    </m-checkbox>
                </div>

                <em v-if="isEmailUsername" class="e-formError__item -no-icon float-left text-left w-full not-italic" role="alert">
                    <span aria-hidden="true" class="font-material font-bold pr-5">error_outline</span>
                    {{ labels.warning }}
                </em>
                <em v-if="error !== ''" class="e-formError__item -no-icon float-left text-left w-full not-italic" role="alert">
                    <span aria-hidden="true" class="font-material font-bold pr-5">error_outline</span>
                    {{ error }}
                </em>

                <button
                    class="a-button -white -updateAccntInfo md:py-4 mr-4 md:mr-6"
                    type="button"
                    :aria-label="labels.cancelAriaLabel"
                    @click="[cancelUpdate(), gtmTrackAction({ id: 241 }, $event)]"
                >
                    {{ labels.cancel }}
                </button>
                <button
                    class="a-button -updateAccntInfo py-9 md:py-5"
                    type="submit"
                    :aria-label="labels.saveAriaLabel"
                    @click="gtmTrackAction({ id: 242 }, $event)">
                    {{ labels.save }}
                </button>
            </div>
        </form>
        <!-- Modal -->
        <modal id="modal-terms" width="535px">
            <div class="o-payForm -modal -noScroll">
                <h2 id="global-modal-heading" class="o-payForm__modalTitle">
                    {{ labels.termsModal.title }}
                </h2>

                <div class="o-payForm__scroll -isCn -longContent">
                    <!--Custom scrollbar-->
                    <perfect-scrollbar ref="scroll">
                        <div class="m-rte" v-html="labels.termsModal.rte"></div>
                    </perfect-scrollbar>
                </div>
            </div>
        </modal>

        <!-- Modal - used for privacy terms -->
        <modal id="modal-privacy" width="535px">
            <div class="o-payForm -modal -noScroll">
                <h2 id="global-modal-heading" class="o-payForm__modalTitle">
                    {{ labels.privacyModal.title }}
                </h2>
                <div class="o-payForm__scroll -isCn -longContent">
                    <!--Custom scrollbar-->
                    <perfect-scrollbar ref="scroll">
                        <div class="m-rte pr-16" v-html="labels.privacyModal.rte"></div>
                    </perfect-scrollbar>
                </div>
            </div>
        </modal>

        <!-- Modal - used for provide phone number alert -->
        <modal id="modal-nophone" width="535px">
            <template v-slot:heading>
                <h2 id="global-modal-heading" class="o-payForm__modalTitle">
                    {{ labels.phoneUserName.alertModal.title }}
                </h2>
            </template>
            <template v-slot:body>
                <div class="o-payForm__scroll -longContent">
                    <div class="m-rte pr-16" v-html="labels.phoneUserName.alertModal.description"></div>
                </div>
            </template>

            <template v-slot:footer>
                <button
                    class="a-button -outline mr-4 md:mr-6 inline-block text-center"
                    type="button"
                    :aria-label="labels.phoneUserName.alertModal.cancel"
                    @click="[cancelUpdate(), gtmTrackAction({ id: 241 }, $event)]"
                >
                    {{ labels.phoneUserName.alertModal.cancel }}
                </button>
                <button
                    class="a-button inline-block text-center"
                    :aria-label="labels.phoneUserName.alertModal.edit"
                    @click="[editPhone(), gtmTrackAction({ id: 242 }, $event)]"
                >
                    {{ labels.phoneUserName.alertModal.edit }}
                </button>
            </template>
        </modal>
    </div>
</template>

<script>
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import api from '@api/routes/account/identifications';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import {required} from 'vuelidate/lib/validators';
    import {validationMixin} from 'vuelidate';
    import setModalId from '@common/source/js/vue/utils/set-modal-id';

    export default {
        name: 'UpdateEmail',
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
            email: {
                type: Object,
                default() {
                    return {};
                }
            },
            phones: {
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
            inputMods: {
                type: String,
                default: 'relative w-full'
            },
            isEnablePhoneAsUsername: {
                type: Boolean,
                default: false
            },
            isEmailUsername: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isProfile: {
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                editing: false,
                updated: false,
                error: '',
                errorUserName: '',
                savedEmail: '',
                savedDefaultUserName: false,
                savedDefaultContactMethod: false,
                savedAgreement: false,
                defaultUserName: false,
                defaultContactMethod: false,
                agreement: false,
                termsCheckbox: false
            };
        },

        computed: {
            isJp() {
                return this.$env.Country === 'Japan';
            },
            isWarning() {
                return this.isEmailUsername ? this.labels.warning : false;
            },
            termsCheckboxModal() {
                const replacedText = setModalId('emailAgreement', this.labels.phoneUserName.agreement.checkboxLabel);
                return {
                    Name: '',
                    Title: replacedText,
                    Modals: [
                        {
                            Id: 'emailAgreement',
                            Title: this.labels.phoneUserName.agreement.title,
                            Body: this.labels.phoneUserName.agreement.message
                        }
                    ]
                };
            }
        },
        watch: {
            email: function(newVal) {
                this.defaultUserName = newVal.IsUsername;
                this.defaultContactMethod = newVal.IsDefault;
                this.agreement = newVal.IsAgreement;
                this.errorUserName = '';
            },
            editing(newVal) {
                this.error = '';
                if(newVal) {
                    this.$refs.fEmail.$el.style.paddingRight = '15px';
                    this.updated = false;
                    this.$nextTick(() => this.$refs.fEmail.$el.focus());
                } else {
                    this.$nextTick(() => {
                        this.$refs.fEmail.$el.style.paddingRight = this.$refs.emailEditButton.offsetWidth + 'px';
                    });
                }
                if(this.isCn && this.isProfile && newVal) {
                    this.$parent.setClosePhoneEdit();
                }
            }
        },
        mounted() {
            this.savedEmail = this.email.Value;
            this.savedDefaultUserName = (this.isCn && this.isProfile) ? this.email.IsUsername : '';
            this.savedDefaultContactMethod = (this.isCn && this.isProfile) ? this.email.IsDefault : '';
            this.savedAgreement = (this.isCn && this.isProfile) ? this.email.IsAgreement : '';
            this.$nextTick(() => {
                this.$refs.fEmail.$el.style.paddingRight = this.$refs.emailEditButton.offsetWidth + 'px';
                this.bindTermsLink();
            });
        },

        methods: {
            replaceTokenArray,
            bindTermsLink() {
                if(this.$refs['Agreement']) {
                    const termsLink = this.$refs['Agreement'].$el.querySelector('.terms-link');
                    const privacyLink = this.$refs['Agreement'].$el.querySelector('.privacy-link');

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
            cancelUpdate() {
                this.$refs.fEmail.input = this.savedEmail ? this.savedEmail : this.email.Value;
                if(this.isCn && this.isProfile) {
                    this.$refs.fEmailConfirm.input = this.savedEmail ? this.savedEmail : this.email.Value;
                    this.defaultUserName = this.savedDefaultUserName ? this.savedDefaultUserName : this.email.IsUsername;
                    this.defaultContactMethod = this.savedDefaultContactMethod ? this.savedDefaultContactMethod : this.email.IsDefault;
                    this.agreement = this.savedAgreement ? this.savedAgreement : this.email.IsAgreement;
                    this.errorUserName = '';
                }
                this.clearValidations();
                this.$nextTick(() => this.$refs['emailEditButton'].focus());
            },
            confirmationCheckboxLabel() {
                const checkboxLabel = this.replaceTokenArray(
                    this.labels.agreementName.confirm,
                    ['<a href="#" class="text-green-100 terms-link z-1">' + this.labels.agreementName.terms + '</a>', '<a href="#" class="text-green-100 privacy-link z-1">' + this.labels.agreementName.privacy + '</a>']
                );
                return checkboxLabel;
            },
            clearValidations() {
                this.editing = false;
                this.updateTermsCheckbox({ params: false });
                this.error = '';
                this.$emit('error', false);
            },
            editPhone() {
                this.$emit('edit-phone');
                this.$modal.hide({ id: 'modal-nophone'});
            },
            showEdit() {
                const isValid = this.providePhoneAlert();
                if(isValid) {
                    this.editing = true;
                }
            },
            openModalTerms() {
                this.$modal.show({ id: 'modal-terms' });
            },
            openModalPrivacy() {
                this.$modal.show({ id: 'modal-privacy' });
            },
            providePhoneAlert() {
                const hasPhone = this.phones.findIndex(number => number.IdenType === 'MobilePhone') !== -1;
                // KR no longer allowing email as username, prompt user to add mobile phone prior to editing email
                if(!hasPhone && this.isEnablePhoneAsUsername && this.isEmailUsername) {
                    this.$modal.show({ id: 'modal-nophone'});
                    return false;
                }
                return true;
            },
            async updateEmail(event) {
                event.preventDefault();
                const email = this.$refs.fEmail.input;
                const emailConfirm = (this.isCn && this.isProfile) ? this.$refs.fEmailConfirm.input : '';
                const userName = (this.isCn) ? this.defaultUserName : '';
                const isDefault = (this.isCn) ? this.defaultContactMethod : '';
                const agreement = (this.isCn) ? this.agreement : '';
                if(!this.isValidEmail(email)) {
                    this.error = this.labels.errors.format;
                    this.$emit('error', true);
                } else if((this.isCn && this.isProfile) && (email !== emailConfirm)) {
                    this.error = this.labels.errors.confirm;
                    this.$emit('error', true);
                } else if((this.isCn && this.isProfile) && (!agreement)) {
                    this.error = this.labels.errors.agreement;
                    this.$emit('error', true);
                } else {
                    let response;
                    var idenType = !this.isCn && this.email && this.email.IdenType ? this.email.IdenType : 'EmailAddress';
                    if(this.isCn) {
                        if(this.isProfile) {
                            const responseObj = { Id: this.email.Id, Value: email, IsDefault: isDefault, IdenType: idenType, IsUsername: userName, IsAgreement: agreement };
                            if(this.email.Id && this.email.Id !== '') {
                                response = await api.put(responseObj);
                            } else {
                                response = await api.post(responseObj);
                            }
                            if(response.success && response.data.Success) {
                                this.savedEmail = email;
                                this.savedDefaultUserName = userName;
                                this.savedDefaultContactMethod = isDefault;
                                this.savedAgreement = agreement;
                                this.editing = false;
                                this.updated = true;
                                this.error = '';
                                this.$emit('error', false);
                                this.$nextTick(() => this.$refs['emailEditButton'].focus());

                                setTimeout(() => {
                                    window.location.reload();
                                }, 600);
                            } else {
                                this.error = response.data.ErrorMessages[0].Translation || 'Failure!';
                                this.$emit('error', true);
                                this.$nextTick(() => this.$refs['emailEditButton'].focus());
                            }
                        } else {
                            let data = { Id: this.email.Id, Value: email, IsDefault: isDefault, IdenType: idenType, IsUsername: userName, IsAgreement: agreement };
                            if(this.email.Id && this.email.Id !== '') {
                                response = await api.put(data);
                            } else {
                                response = await api.post(data);
                            }
                            if(response.success && response.data.Success) {
                                this.savedEmail = email;
                                this.updated = true;
                                this.clearValidations();
                                this.$nextTick(() => this.$refs['emailEditButton'].focus());
                            } else {
                                this.error = response.data.ErrorMessages[0].Translation || 'Failure!';
                                this.$emit('error', true);
                                this.$nextTick(() => this.$refs['emailEditButton'].focus());
                            }
                        }
                    } else {
                        let data = { Id: this.email.Id, Value: email, IsDefault: this.email.IsDefault, IdenType: idenType };
                        if(this.email.Id && this.email.Id !== '') {
                            response = await api.put(data);
                        } else {
                            response = await api.post(data);
                        }
                        if(response.success && response.data.Success) {
                            this.savedEmail = email;
                            this.updated = true;
                            this.clearValidations();
                            this.$nextTick(() => this.$refs['emailEditButton'].focus());
                        } else {
                            this.error = response.data.ErrorMessages[0].Translation || 'Failure!';
                            this.$emit('error', true);
                            this.$nextTick(() => this.$refs['emailEditButton'].focus());
                        }
                    }
                }
            },
            isUserName() {
                this.errorUserName = this.defaultUserName ? '' : this.labels.warningUserName;
            },
            isValidEmail(email) {
                // Aswer from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            },
            updateTermsCheckbox(params) {
                this.termsCheckbox = params.value;
                this.$v.$touch();
            }
        }
    };
</script>
