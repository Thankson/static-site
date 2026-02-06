<template>
    <section class="o-commissionDepForm">
        <!-- Section title -->
        <h1 class="o-commissionDepForm__title -section" v-html="getLabels('Labels.Header.AddNew', 'Add Commission Deposit Account')"></h1>

        <form
            id="commission-deposit-form"
            action=""
            method="post"
            name="commission-deposit-form"
            class="o-commissionDepForm__form">

            <!-- If the user is trying to edit -->
            <div v-if="isEditing" class="o-commissionDepForm__notEditable e-formError py-0">
                <p
                    class="e-formError__item"
                    v-html="getLabels('Labels.FormLoadMessage', 'Commission account cannot be edited')"></p>
            </div>

            <!-- Show spinner while API is being loaded submited -->
            <div v-if="showSubmitLoading || !initialLoad || apiSuccess" class="o-commissionDepForm__notEditable e-formError py-0">
                <a-loading-spinner
                    :visible="true"
                    class="o-commissionDepForm__loadingIcon"
                    aria-hidden="true">
                </a-loading-spinner>
            </div>

            <!-- If Direct Deposit is an available pay method -->
            <div v-else-if="!isCommissionDepositAllowed && initialLoad" class="o-commissionDepForm__notEditable e-formError py-0">
                <p
                    class="e-formError__item"
                    v-html="getLabels('Labels.FormLoadMessage', 'Commission account cannot be created')"></p>
            </div>

            <template v-if="!isEditing && isCommissionDepositAllowed">

                <div class="o-commissionDepForm__row -jp">
                    <!-- Bank Type (Transfer Method) Field -->
                    <!-- User chooses Banks or Japan Postal Bank, which determines what fields to display -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label uppercase"
                            :for="transferMethod.Id"
                            v-html="getLabels('Labels.DirectDeposit.TransferMethod', 'Select Transfer Method')">
                        </label>
                        <v-select
                            v-if="localization && localization.Labels && bankTypes.length > 1"
                            :id="transferMethod.Id"
                            ref="bankType"
                            vmodel="bankTypeValue"
                            :options="selectOptionsLabels(bankTypes)"
                            :values="selectOptionsValues(bankTypes)"
                            :aria-label="getLabels('Labels.DirectDeposit.TransferMethod', 'Select Transfer Method')"
                            :select-mod="transferMethod.SelectMod"
                            :select-element-mod="$v.bankTypeValue.$error ? '-error' : null"
                            :initial="getInitialValue(transferMethod, 'Transfer Method', 'bankValue', 0)"
                            :name="transferMethod.Name"
                            :arrow-direction="transferMethod.Arrow.Direction || null"
                            :arrow-size="transferMethod.Arrow.Size || null"
                            :arrow-tailwind-color="transferMethod.Arrow.TailwindColor || null"
                            :arrow-other-mods="transferMethod.Arrow.OtherMods || null"
                            @change="updateModel"
                            @blur="handleBlur('bankTypeValue')">
                        </v-select>
                    </div>
                </div>

                <div class="o-commissionDepForm__wrapper">

                    <!-- Bank Search Field -->
                    <div v-if="bankTypeValue === 'banks'" class="o-commissionDepForm__row -jp">
                        <div class="m-formField -text">
                            <label
                                class="m-formField__label uppercase"
                                :for="searchTerm.Id"
                                v-html="getLabels('Labels.DirectDeposit.BankSearch', 'Bank Search')">
                            </label>
                            <v-input
                                id="searchTerm.Id"
                                ref="searchTerm"
                                v-model.trim="searchTermValue"
                                type="text"
                                :tailwind-mods="$v.searchTermValue.$error ? '-isInvalid' : null"
                                :placeholder="getLabels('Labels.DirectDeposit.BankSearchText', '')">
                            </v-input>
                            <ul v-if="showDropdown" class="o-commissionDepForm__dropdown">
                                <li v-for="banks in searchResults" :key="banks.id" @click="selectBank(banks)">
                                    {{ banks.Name }} - {{ banks.RoutingNumber }}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div v-if="bankTypeValue === 'banks'" class="o-commissionDepForm__row -jp">
                        <div class="m-formField -text">
                            <label
                                class="m-formField__label uppercase"
                                for="financialInst"
                                v-html="getLabels('Labels.DirectDeposit.FinancialInstitutions', 'Financial Institution')">
                            </label>
                            <v-input
                                id="financialInst"
                                v-model="selectedBank"
                                :tailwind-mods="$v.searchTermValue.$error ? '-isInvalid' : null"
                                disabled
                            />
                        </div>
                    </div>

                    <div v-if="bankTypeValue === 'banks'" class="o-commissionDepForm__row">
                        <!-- Account Number Field / Account Number Reenter Fields-->
                        <label
                            class="m-formField__label uppercase"
                            :for="accountNumber.Id"
                            v-html="getLabels('Labels.DirectDeposit.AccountNumber', accountNumber.Label)">
                        </label>
                        <div class="o_commissionDepForm__inputWrapper">
                            <v-input
                                :id="accountNumber.Id"
                                ref="accountNumber"
                                v-model="accountNumberValue"
                                class="o-commissionDepForm__input"
                                auto-complete="off"
                                :name="accountNumber.Name"
                                :max-length="accountNumber.MaxLength"
                                :min-length="accountNumber.MinLength"
                                model-name="accountNumberValue"
                                :placeholder="getLabels('Labels.DirectDeposit.EnterAccountNumber', 'Enter Account Number')"
                                :tailwind-mods="$v.accountNumberValue.$error ? '-isInvalid' : null"
                                :value="getInitialValue(accountNumber, 'AccountNumber', 'accountNumberValue', accountNumberValue)"
                                @input="updateModel('accountNumberValue')"
                                @blur="handleBlur('accountNumberValue')"
                                @keydown="handleInteger">
                            </v-input>
                            <v-input
                                :id="confirmAccountNumber.Id"
                                ref="confirmAccountNumber"
                                v-model="confirmAccountNumberValue"
                                class="o-commissionDepForm__input"
                                auto-complete="off"
                                :name="confirmAccountNumber.Name"
                                :max-length="confirmAccountNumber.MaxLength"
                                :min-length="confirmAccountNumber.MinLength"
                                model-name="confirmAccountNumberValue"
                                :placeholder="getLabels('Labels.DirectDeposit.ReEnterAccountNumber', 'Re-enter Account Number')"
                                :tailwind-mods="$v.confirmAccountNumberValue.$error ? '-isInvalid' : null"
                                @input="updateModel('confirmAccountNumberValue')"
                                @blur="handleBlur('confirmAccountNumberValue')"
                                @keydown="handleInteger">
                            </v-input>
                        </div>
                    </div>

                    <!-- Japan Postal Bank - Passcode Digit 5-->
                    <div v-if="bankTypeValue === 'japanpostbank'" class="o-commissionDepForm__row">
                        <label
                            class="m-formField__label uppercase"
                            :for="passbookCode5.Id"
                            v-html="getLabels('Labels.JapanPostBank.Labels.PassbookCode5Digit', 'Passbook Code 5 Digit')">
                        </label>
                        <div class="o_commissionDepForm__inputWrapper">
                            <v-input
                                :id="passbookCode5.Id"
                                ref="passbookCode5"
                                v-model="passbookCode5Value"
                                class="o-commissionDepForm__input"
                                auto-complete="off"
                                :name="passbookCode5.Name"
                                :max-length="passbookCode5.MaxLength"
                                :min-length="passbookCode5.MinLength"
                                model-name="passbookCode5Value"
                                :placeholder="getLabels('Labels.JapanPostBank.Placeholders.EnterPassbookCode', 'Enter passbook code')"
                                :tailwind-mods="$v.passbookCode5Value.$error ? '-isInvalid' : null"
                                @input="updateModel('passbookCode5Value')"
                                @blur="handleBlur('passbookCode5Value')"
                                @keydown="handleInteger">
                            </v-input>
                            <v-input
                                :id="confirmPassbookCode5.Id"
                                ref="confirmPassbookCode5"
                                v-model="confirmPassbookCode5Value"
                                class="o-commissionDepForm__input"
                                auto-complete="off"
                                :name="confirmPassbookCode5.Name"
                                :max-length="confirmPassbookCode5.MaxLength"
                                :min-length="confirmPassbookCode5.MinLength"
                                model-name="confirmPassbookCode5Value"
                                :placeholder="getLabels('Labels.JapanPostBank.Placeholders.ReEnterPassbookCode', 'Re-enter passbook code')"
                                :tailwind-mods="$v.confirmPassbookCode5Value.$error ? '-isInvalid' : null"
                                @input="updateModel('confirmPassbookCode5Value')"
                                @blur="handleBlur('confirmPassbookCode5Value')"
                                @keydown="handleInteger">
                            </v-input>
                        </div>
                    </div>

                    <!-- Japan Postal Bank - Passcode Digit 8-->
                    <div v-if="bankTypeValue === 'japanpostbank'" class="o-commissionDepForm__row  pt-15">
                        <label
                            class="m-formField__label uppercase"
                            :for="passbookCode8.Id"
                            v-html="getLabels('Labels.JapanPostBank.Labels.PassbookCode8Digit', 'Passbook Code 8 Digit')">
                        </label>
                        <div class="o_commissionDepForm__inputWrapper">
                            <v-input
                                :id="passbookCode8.Id"
                                ref="passbookCode8"
                                v-model="passbookCode8Value"
                                class="o-commissionDepForm__input"
                                auto-complete="off"
                                :name="passbookCode8.Name"
                                :max-length="passbookCode8.MaxLength"
                                :min-length="passbookCode8.MinLength"
                                model-name="passbookCode8"
                                :placeholder="getLabels('Labels.JapanPostBank.Placeholders.EnterPassbookCode', 'Enter passbook code')"
                                :tailwind-mods="$v.passbookCode8Value.$error ? '-isInvalid' : null"
                                @input="updateModel('passbookCode8Value')"
                                @blur="handleBlur('passbookCode8Value')"
                                @keydown="handleInteger">
                            </v-input>
                            <v-input
                                :id="confirmPassbookCode8.Id"
                                ref="confirmPassbookCode8"
                                v-model="confirmPassbookCode8Value"
                                class="o-commissionDepForm__input"
                                auto-complete="off"
                                :name="confirmPassbookCode8.Name"
                                :max-length="passbookCode8.MaxLength"
                                :min-length="passbookCode8.MinLength"
                                model-name="confirmPassbookCode8Value"
                                :placeholder="getLabels('Labels.JapanPostBank.Placeholders.ReEnterPassbookCode', 'Re-enter passbook code')"
                                :tailwind-mods="$v.confirmPassbookCode8Value.$error ? '-isInvalid' : null"
                                @input="updateModel('confirmPassbookCode8Value')"
                                @blur="handleBlur('confirmPassbookCode8Value')"
                                @keydown="handleInteger">
                            </v-input>
                        </div>
                    </div>

                    <div v-if="bankTypeValue && bankTypeValue === 'banks' || bankTypeValue === 'japanpostbank'" class="o-commissionDepForm__row -jp">
                        <!-- Account Holder Field -->
                        <div class="m-formField -text">
                            <label
                                class="m-formField__label uppercase"
                                :for="accountHolder.Id"
                                v-html="getLabels('Labels.DirectDebit.NameOnAccount', accountHolder.Label)">
                            </label>
                            <v-input
                                :id="accountHolder.Id"
                                ref="accountHolder"
                                v-model="accountHolderValue"
                                auto-complete="off"
                                :name="accountHolder.Name"
                                :max-length="accountHolder.MaxLength"
                                :min-length="accountHolder.MinLength"
                                :placeholder="getLabels('Labels.DirectDeposit.EnterAccountName', '')"
                                :tailwind-mods="$v.accountHolderValue.$error ? '-isInvalid' : null"
                                :value="getInitialValue(accountHolder, 'NameOnAccount', 'accountHolderValue', accountHolderValue)"
                                @input="updateModel('accountHolderValue')"
                                @blur="handleBlur('accountHolderValue')">
                            </v-input>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="o-commissionDepForm__row -actions pb-10">
                        <!-- Cancel Button -->
                        <div class="o-commissionDepForm__col -cancelBtn">
                            <v-button
                                :cta="getLabels('Labels.FormSubmit.Cancel', buttonCancel)"
                                :aria-label="getLabels('Labels.FormSubmit.CancelAriaLabel', buttonSave)"
                                class="o-commissionDepForm__button"
                                @click="handleCancel">
                            </v-button>
                        </div>

                        <!-- Save Button -->
                        <div class="o-commissionDepForm__col -saveBtn">
                            <!-- Save Button -->
                            <v-button
                                :cta="getLabels('Labels.FormSubmit.Save', buttonSave)"
                                :aria-label="getLabels('Labels.FormSubmit.SaveAriaLabel', buttonSave)"
                                class="-save"
                                type="submit"
                                @click="handleSubmit($event)">
                            </v-button>
                        </div>
                    </div>
                    <!-- Show API/FE errors messages -->
                    <div v-if="listError && listError.length" class="o-commissionDepForm__apiError e-formError pt-0">
                        <p v-for="(validation, index) in listError" :key="index" class="e-formError__item py-0 pb-6" role="alert">
                            {{ validation.error ? validation.error : validation }}
                        </p>
                    </div>

                    <!-- If no Transfer Method is selected -->
                    <div v-if="showTransferMethodError" :id="`${transferMethod.Id}-error`" class="e-formError">
                        <p class="e-formError__item" role="alert">{{ getLabels('Labels.ErrorMessages.TransferMethodRequired','Transfer Method Required') }}</p>
                    </div>

                    <!-- If account numbers dont match -->
                    <div v-if="$v.confirmAccountNumberValue.$error && !$v.confirmAccountNumberValue.match" :id="`${confirmAccountNumber.Id}-error`" class="e-formError">
                        <p class="e-formError__item" role="alert">{{ getLabels('Labels.ErrorMessages.DirectDeposit.MatchAccountNumber','Account Number must match') }}</p>
                    </div>

                    <!-- If bank numbers 5 digit dont match -->
                    <div v-if="$v.passbookCode5Value.$error" :id="`${passbookCode5.Id}-error`" class="e-formError">
                        <p class="e-formError__item" role="alert">{{ getLabels('Labels.JapanPostBank.ErrorMessages.PassbookCode5Digit','Passcode (5 Digits) must match') }}</p>
                    </div>
                    <div v-if="$v.confirmPassbookCode5Value.$error && !$v.confirmPassbookCode5Value.match" :id="`${confirmPassbookCode5.Id}-error`" class="e-formError">
                        <p class="e-formError__item" role="alert">{{ getLabels('Labels.JapanPostBank.ErrorMessages.Match5DigitPasscode','Passcode (5 Digits) must match') }}</p>
                    </div>

                    <!-- If bank numbers 8 digit dont match -->
                    <div v-if="$v.passbookCode8Value.$error" :id="`${passbookCode8.Id}-error`" class="e-formError">
                        <p class="e-formError__item" role="alert">{{ getLabels('Labels.JapanPostBank.ErrorMessages.PassbookCode8Digit','Passcode (8 Digits) must match') }}</p>
                    </div>
                    <div v-if="$v.confirmPassbookCode8Value.$error && !$v.confirmPassbookCode8Value.match" :id="`${confirmPassbookCode8.Id}-error`" class="e-formError">
                        <p class="e-formError__item" role="alert">{{ getLabels('Labels.JapanPostBank.ErrorMessages.Match8DigitPasscode','Passcode (8 Digits) must match') }}</p>
                    </div>
                </div>
            </template>
        </form>
    </section>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import cookie from '../../../utils/cookie';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import paymentFormMixin from '../../../mixins/payment-form';
    import { validationMixin } from 'vuelidate';
    import { integer, required } from 'vuelidate/lib/validators';

    export default {
        name: 'CommissionDepositFormJp',
        components: {
            vInput
        },

        mixins: [ paymentFormMixin, validationMixin ],
        validations() {
            return {
                // Account Holder Validation Settings
                accountHolderValue: {
                    required,
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.accountHolder.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.accountHolder.MaxLength;
                    }
                },

                // Account Number Validation Settings
                accountNumberValue: {
                    required,
                    integer,

                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.accountNumber.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.accountNumber.MaxLength;
                    }
                },

                // Bank Validation Settings
                bankValue: {
                    required
                },

                // Bank Type Validation Settings
                bankTypeValue: {
                    required
                },

                confirmAccountNumber: {
                    required
                },

                // Re-Enter Account Number Validation Settings
                confirmAccountNumberValue: {
                    required,
                    integer,

                    match: value => value === this.accountNumberValue,

                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.confirmAccountNumber.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.confirmAccountNumber.MaxLength;
                    }
                },

                // Re-Enter Passbook Code 5 Validation Settings
                confirmPassbookCode5Value: {
                    required,
                    integer,
                    match: value => value === this.passbookCode5Value
                },

                // Re-Enter Passbook Code 8 Validation Settings
                confirmPassbookCode8Value: {
                    required,
                    integer,
                    match: value => value === this.passbookCode8Value
                },

                // Passbook Code 5 Validation Settings
                passbookCode5Value: {
                    required,
                    integer,
                    min: 5,
                    max: 5
                },

                // Passbook Code 8 Validation Settings
                passbookCode8Value: {
                    required,
                    integer,
                    min: 8,
                    max: 8
                },

                searchTermValue: {
                    required,
                    min: 2
                }
            };
        },
        props: {
            accountHolder: {
                type: Object,
                default: function() {
                    return {
                        Id: 'accountholder',
                        Name: 'accountholder',
                        MinLength: 1,
                        MaxLength: 100,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        SelectMod: '-bg-transparent -sm w-full',
                        Label: 'ACCOUNT HOLDER NAME',
                        Arrow: {
                            Direction: '-down',
                            Size: '-sm',
                            OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-10 pointer-events-none',
                            TailwindColor: 'gray'
                        }
                    };
                }
            },
            accountNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'accountnum',
                        Name: 'accountnum',
                        MinLength: 1,
                        MaxLength: 7,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This account number field is required.',
                        Label: 'ACCOUNT NUMBER'
                    };
                }
            },
            bank: {
                type: Object,
                default: function() {
                    return {
                        Id: 'select-bank',
                        Name: 'bank',
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        SelectMod: '-bg-transparent -sm w-full',
                        Label: 'BANK',
                        Arrow: {
                            Direction: '-down',
                            Size: '-sm',
                            OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-10 pointer-events-none',
                            TailwindColor: 'gray'
                        }
                    };
                }
            },
            buttonCancel: {
                type: String,
                default: 'Cancel'
            },
            buttonCopy: {
                type: String,
                default: 'Copy From Direct Debit'
            },
            buttonSave: {
                type: String,
                default: 'Save'
            },
            confirmAccountNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'confirmaccountnum',
                        Name: 'confirmaccountnum',
                        MinLength: 1,
                        MaxLength: 7,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'RE-ENTER ACCOUNT NUMBER'
                    };
                }
            },

            confirmPassbookCode5: {
                type: Object,
                default: function() {
                    return {
                        Id: 'confirmPassbookCode5',
                        Name: 'confirmPassbookCode5',
                        MinLength: 5,
                        MaxLength: 5,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required TEST ERROR.',
                        Label: 'Passbook Code (5 Digits)'
                    };
                }
            },
            confirmPassbookCode8: {
                type: Object,
                default: function() {
                    return {
                        Id: 'confirmPassbookCode8',
                        Name: 'confirmPassbookCode8',
                        MinLength: 8,
                        MaxLength: 8,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'Passbook Code (8 Digits)'
                    };
                }
            },
            // Used only on PatternLab to set user's country
            country: {
                type: String,
                default: null
            },

            passbookCode5: {
                type: Object,
                default: function() {
                    return {
                        Id: 'passbookCode5',
                        Name: 'passbookCode5',
                        MinLength: 5,
                        MaxLength: 5,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'Passbook Code (5 Digits)'
                    };
                }
            },
            passbookCode8: {
                type: Object,
                default: function() {
                    return {
                        Id: 'passbookCode5',
                        Name: 'passbookCode5',
                        MinLength: 8,
                        MaxLength: 8,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'Passbook Code (8 Digits)'
                    };
                }
            },
            searchTerm: {
                type: Object,
                default: function() {
                    return {
                        Id: 'searchTerm',
                        Name: 'searchTerm',
                        MinLength: 1,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'The bank search field is required.',
                        Label: 'Search Term'
                    };
                }
            },

            transferMethod: {
                type: Object,
                default: function() {
                    return {
                        Id: 'select-transfer-method',
                        Name: 'transferMethod',
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        SelectMod: '-bg-transparent -sm w-full',
                        Label: 'BANK',
                        Arrow: {
                            Direction: '-down',
                            Size: '-sm',
                            OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-10 pointer-events-none',
                            TailwindColor: 'gray'
                        }
                    };
                }
            },

            token: {
                type: String,
                default: null
            }
        },

        // DATA
        data() {
            return {
                accountHolderValue: '',
                accountNumberValue: '',
                accountTypeValue: 'commission',
                apiListError: null,
                apiSuccess: false,
                bankList: [],
                bankValue: '',
                bankTypeValue: '',
                cardHolderNameOptions: [],
                consentCheckboxValue: false,
                confirmAccountNumberValue: '',
                confirmPassbookCode5Value: '',
                confirmPassbookCode8Value: '',
                formIsValid: false,
                initialLoad: false,
                passbookCode5Value: '',
                passbookCode8Value: '',
                passbookValues: {},
                searchTermValue: '',
                searchResults: [],
                selectedBank: '',
                showSubmitLoading: false,
                showTransferMethodError: false,
                urlParams: null,
                query: ''
            };
        },

        // COMPUTED
        computed: {
            ...mapState('paymentMethod', [
                'storedApiError',
                'storedApiLoading',
                'storedApiSuccess',
                'storedPayMethods',
                'storedBanks']),

            bankTypes() {
                const bankPlaceholder = this.localization.Data.Banks.filter((bank) => bank.Value === '0');

                const placeholder = {
                    Label: bankPlaceholder['0'].Name,
                    Value: null
                };

                return [
                    placeholder,
                    ...this.localization?.Data?.Banks
                        .filter((bank) => bank.Value !== '0')
                        .map((bank) => ({
                            Label: bank.Name,
                            Value: bank.Value
                        }))
                ];
            },

            bearerToken() {
                // Get token from prop
                let token = this.token;

                // If prop is null/false/undefined
                if(!token) {
                    // Get token from cookie
                    const cookieToken = cookie.getCookie('paymentClient');

                    if(cookieToken !== null) {
                        token = cookieToken;
                    }
                }

                return token;
            },
            customerId() {
                return this.localization?.Data?.CustomerId;
            },
            listError() {
                let errors = [];

                if(this.apiListError && this.apiListError.length) {
                    errors = errors.concat(this.apiListError);
                }

                if(this.feListError && this.feListError.length) {
                    errors = errors.concat(this.feListError);
                }

                return errors;
            },
            showDropdown() {
                return this.searchTermValue.length > 1;
            },
            userName() {
                return this.localization?.Data?.Username;
            }
        },

        // WATCH
        watch: {
            storedApiLoading() {
                this.showSubmitLoading = this.storedApiLoading;
            },
            storedApiError() {
                this.apiListError = this.storedApiError;
            },
            storedApiSuccess() {
                this.apiSuccess = this.storedApiSuccess;

                // If pay method is successful saved then back to previous page
                if(this.apiSuccess) {
                    this.goToPreviousPage();
                }
            },
            searchTermValue(newValue, oldValue) {
                let newValueUpper = newValue.toUpperCase();
                let newValueLower = newValue.toLowerCase();
                // Check for cases where case of string is different from in search list
                this.searchResults = this.bankList.filter(bank => {
                    if(bank.Name && bank.RoutingNumber) {
                        return bank.Name.includes(newValue) || bank.Name.includes(newValueUpper) || bank.Name.includes(newValueLower) || bank.RoutingNumber.includes(newValue);
                    }
                });
            },
            bankTypeValue() {
                this.showTransferMethodError = !this.bankTypeValue && this.bankTypeValue !== null;
            }
        },

        async mounted() {
            this.initialLoad = false;

            this.urlParams = new URLSearchParams(window.location.search);

            this.resetListErrors();

            // Get cross country information
            // Get all payment methods of the customer
            // Get all banks
            await Promise.all([
                this.getCountryInfo({ country: this.$env.Country }),
                this.getPayMethods(),
                this.getBanks(this.$env.Country)
            ]);

            this.bankList = this.storedBanks;

            this.initialLoad = true;
        },

        // METHODS
        methods: {
            ...mapActions('paymentMethod', ['getCountryInfo', 'getBanks', 'getPayMethods', 'savePayMethod']),

            selectBank(bank) {
                this.selectedBank = bank.Name + ' - ' + bank.RoutingNumber;
                this.bankValue = bank.Id;
                this.searchResults = this.storedBanks;
                this.searchTermValue = this.selectedBank;
            },

            goToPreviousPage() {
                // Check if there's a target URL on query string
                if(this.urlParams.get('backTo')) {
                    window.location.href = this.urlParams.get('backTo');
                } else {
                    // Check if there's a My Account URL on localization data
                    if(this.localization?.Data?.MyAccountPageAddress?.Url) {
                        window.location.href = this.localization.Data.MyAccountPageAddress.Url;
                    }
                }
            },
            getInitialValue(prop, store, model, current) {
                if(prop.Value) {
                    return prop.Value;
                }

                let value = null;

                if(this.isEditing && this.storedPayMethod) {
                    this[model] = current;
                    value = current;
                }

                return value;
            },
            handleCancel() {
                window.history.go(-1);
            },
            handleSubmit(event) {
                try {
                    event.preventDefault();

                    if(this.bankTypeValue === null) {
                        this.showTransferMethodError = true;
                        return;
                    }

                    this.showTransferMethodError = false;

                    const fields = this.bankTypeValue === 'banks' ? [
                        'accountHolder',
                        'bank',
                        'accountNumber',
                        'confirmAccountNumber',
                        'searchTerm'
                    ] : [
                        'accountHolder',
                        'passbookCode5',
                        'confirmPassbookCode5',
                        'passbookCode8',
                        'confirmPassbookCode8'
                    ];

                    let error = false;
                    let validation = null;
                    let focus = null;

                    this.resetListErrors();

                    // Loop to re-check if there is some validation error in the fields
                    for (let i = 0; i < fields.length; i++) {
                        validation = this.$v[fields[i] + 'Value'];

                        // Apply validation
                        validation.$touch();

                        // Check if the field is invalid
                        if(validation.$invalid) {
                            error = true;
                            this.handleValidationError(fields[i], validation);
                            focus = focus || fields[i];
                        }
                    }

                    // Define if the form is valid
                    this.formIsValid = !error && !this.feListError?.length;

                    if(!this.formIsValid) {
                        document.querySelector(`#${this[focus].Id}`).focus();
                        return;
                    }

                    // Submit form only if it's valid
                    this.submitForm();
                } catch (e) {
                    console.log('[CommissionDepositForm] HandleSubmit - Exception:');
                    console.log(e);
                }
            },

            async submitForm() {
                const routingNumber = this.storedBanks?.find((bank) => bank.Id === this.bankValue)?.RoutingNumber || '';

                if(this.bankTypeValue === 'japanpostbank') {
                    this.passbookValues['Code'] = this.passbookCode5Value;
                    this.passbookValues['Number'] = this.passbookCode8Value;
                }

                const payload = {
                    payMethodDefaults: [],
                    country: this.$env.Country,
                    oneTimeUse: false,
                    isActive: true,
                    payType: 'DirectDeposit',
                    nameOnAccount: this.accountHolderValue,
                    accountNumber: this.accountNumberValue,
                    bankName: this.bankValue,
                    passbook: this.passbookValues,
                    payMethodDirection: 'Outbound', // Inbound or Outboun
                    applicationId: 1,
                    routingNumber,
                    postalCode: '',
                    accountNickName: ''
                };

                // Save payment method
                await this.savePayMethod({
                    isEditing: false,
                    isCreditCard: false,
                    isCommissionDeposit: true,
                    customerId: this.customerId,
                    bearerToken: this.bearerToken,
                    country: this.$env.Country,
                    payload: payload,
                    envService: this.$env?.ServiceBaseUrl,
                    errorTranslations: this.localization?.Labels?.ServerErrorTranslation || null
                });
            }
        }
    };
</script>
