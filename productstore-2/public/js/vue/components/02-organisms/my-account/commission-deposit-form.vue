<!-- DO NOT ADD MORE CULTURES TO THIS FORM -->
<template>
    <section class="o-commissionDepForm">
        <!-- Section title -->
        <h1 class="o-commissionDepForm__title -section" v-html="getLabels('Labels.Header.AddNew', 'Add Commission Deposit Account')"></h1>

        <!-- If it's CommissionDeposit is allowed -->
        <form
            id="commission-deposit-form"
            action=""
            method="post"
            name="commission-deposit-form"
            class="o-commissionDepForm__form">

            <!-- Show spinner while API is being loaded submited -->
            <div v-if="showSubmitLoading || !initialLoad || apiSuccess" class="o-commissionDepForm__loading">
                <a-loading-spinner
                    :visible="true"
                    class="o-commissionDepForm__loadingIcon"
                    aria-hidden="true">
                </a-loading-spinner>
            </div>

            <!-- If the user is trying to edit -->
            <div v-if="isEditing" class="o-commissionDepForm__notEditable e-formError py-0">
                <p
                    class="e-formError__item"
                    v-html="getLabels('Labels.Header.CommissionNotEditable', 'Commission account cannot be edited')"></p>
            </div>

            <!-- If Direct Deposit is an available pay method -->
            <div v-if="!isCommissionDepositAllowed" class="o-commissionDepForm__notEditable e-formError py-0">
                <p
                    class="e-formError__item"
                    v-html="getLabels('Labels.Header.CommissionNotEditable', 'Commission account cannot be created')"></p>
            </div>

            <template v-if="!isEditing && isCommissionDepositAllowed">
                <!-- Form Summary (only visible in KR) -->
                <!-- Note that there is a separate Form Summary at bottom of component for PH -->
                <p
                    v-if="summary && !isPH"
                    class="o-commissionDepForm__summary"
                    v-html="summary"
                ></p>

                <!-- Display form -->
                <div class="o-commissionDepForm__wrapper">
                    <div
                        v-if="showConsentCheckbox && !isPH"
                        class="o-commissionDepForm__row mb-30 md:mb-50">

                        <m-checkbox
                            :id="consentCheckbox.Id"
                            ref="consentCheckbox"
                            v-model="$v.consentCheckboxValue.$model"
                            :label="getLabels('Labels.IAgreeLabel', 'I agree')"
                            :label-mods="`font-normal ${$v.consentCheckboxValue.$error ? '-error' : ''}`"
                            :name="consentCheckbox.Name"
                        />
                        <div v-if="$v.consentCheckboxValue.$error" class="e-formError">
                            <p class="e-formError__item" role="alert" v-html="getLocalizationProp('Labels.ErrorMessages.FieldRequired', 'Required')"></p>
                        </div>
                    </div>

                    <!-- Bank Number - Poland -->
                    <div v-if="isPL" class="o-commissionDepForm__row">
                        <div class="m-formField -text">
                            <!-- Note that label must come from DirectDebit object, not DirectDeposit -->
                            <label
                                class="m-formField__label uppercase"
                                for="bankNumber"
                                v-html="getLabels('Labels.DirectDebit.Bank')">
                            </label>
                            <v-input
                                id="bankNumber"
                                ref="bankNumber"
                                v-model="bankNumberValue"
                                :name="bankNumberValue"
                                :tailwind-mods="$v.bankNumberValue.$error ? '-isInvalid' : null"
                                @input="updateModel('bankNumberValue')"
                                @blur="handleBlur('bankNumberValue')">
                            </v-input>
                        </div>
                    </div>

                    <!-- Korea,  Singapore/Malaysia and Philippines component order is different than other countries -->
                    <div v-if="!isKR && !isSGMY && !isPH && !isPL" class="o-commissionDepForm__row">
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
                                :placeholder="accountHolder.Placeholder || getLocalizationProp('Labels.DirectDebit.EnterNameOnAccount')"
                                :tailwind-mods="$v.accountHolderValue.$error ? '-isInvalid' : null"
                                :value="getInitialValue(accountHolder, 'NameOnAccount', 'accountHolderValue', accountHolderValue)"
                                @input="updateModel('accountHolderValue')"
                                @blur="handleBlur('accountHolderValue')">
                            </v-input>
                            <div v-if="$v.accountHolderValue.$error" :id="`${accountHolder.Id}-error`" class="e-formError">
                                <p class="e-formError__item" role="alert" v-html="getFieldError('NameOnAccount')"></p>
                            </div>
                        </div>
                    </div>

                    <!-- BSB Number Field - Australia only -->
                    <div v-if="isAU" class="o-commissionDepForm__row">
                        <div class="m-formField -text">
                            <label
                                class="m-formField__tooltipLabel"
                                for="bsbNumber"
                                v-html="getLabels('Labels.BSB.Text')"
                            />
                            <m-tooltip
                                v-if="bsbLabels && bsbLabels.Tooltip"
                                :is-within-form="true"
                                :popper-offset-x-mobile="bsbLabels.Tooltip.OffsetHorizontalMobile"
                                :popper-offset-y="12"
                                placement="right"
                                :tooltip-aria-label="bsbLabels.Tooltip.AriaLabel"
                                tooltip-icon-size="xs"
                                tooltip-id="bsb"
                                :tooltip-popup-mod="isDesktop ? '-lg p-10' : '-md p-10'"
                                :tooltip-rte="bsbLabels.Tooltip.Rte"
                            />
                            <v-input
                                :id="bsbNumber.Id"
                                ref="bsbNumber"
                                v-model="bsbNumberValue"
                                auto-complete="off"
                                :tailwind-mods="$v.bsbNumberValue.$error ? '-isInvalid' : null"
                                :placeholder="getLabels('Labels.BSB.Placeholder', 'Enter BSB Number')"
                                :value="getInitialValue(bsbNumber, 'BSB', 'bsbNumberValue', bsbNumberValue)"
                                @input="updateModel('bsbNumberValue'); resetBSBNumberError();"
                                @blur="handleBlur('bsbNumberValue')">
                            </v-input>
                            <div v-if="$v.bsbNumberValue.$error || hasBackendBSBNumberError" :id="`${bsbNumber.Id}-error`" class="e-formError">
                                <p class="e-formError__item" role="alert" v-html="determineBsbNumberErrorMsg()"></p>
                            </div>
                        </div>
                    </div>

                    <div v-if="!isPL && !isAU && !isNZ" class="o-commissionDepForm__row">
                        <!-- Bank Field -->
                        <div class="m-formField -text">
                            <label
                                class="m-formField__label uppercase"
                                :for="bank.Id"
                                v-html="getLabels('Labels.DirectDebit.Bank', bank.Label)">
                            </label>
                            <!-- Search Dropdown version -->
                            <div
                                v-if="showSearchDropdown"
                                class="relative"
                            >
                                <div class="o-commissionDepForm__searchListContainer">
                                    <input
                                        :id="bank.Id"
                                        ref="bank"
                                        v-model="search"
                                        :aria-label="getLabels('Labels.DirectDebit.Bank', bank.Label)"
                                        :name="selectedSearchOption.Name"
                                        class="o-commissionDepForm__searchListInput"
                                        :class="{ '-borderError': $v.bankValue.$error }"
                                        :placeholder="searchPlaceholder"
                                        @input="filterOptions"
                                        @click="showDropdown = !showDropdown"
                                        @blur="delayedBlur"
                                    />
                                    <span :class="{'o-commissionDepForm__selectArrow': showDropdown}" class="o-commissionDepForm__arrowLeft"></span>
                                    <div
                                        v-if="showDropdown"
                                        class="o-commissionDepForm__search"
                                    >
                                        <perfect-scrollbar>
                                            <ul
                                                class="o-commissionDepForm__searchList">
                                                <li
                                                    v-for="option in filteredBankOptions"
                                                    :key="option.Id"
                                                    class="o-commissionDepForm__searchListItem"
                                                    @click="selectOption(option)"
                                                    @mousedown.prevent
                                                >
                                                    {{ option.Name }}
                                                </li>
                                            </ul>
                                        </perfect-scrollbar>
                                    </div>
                                </div>
                            </div>
                            <!-- Standard select dropdown -->
                            <v-select
                                v-else-if="showRegularDropdown"
                                :id="bank.Id"
                                ref="bank"
                                vmodel="bankValue"
                                :options="selectOptionsLabels(bankOptions)"
                                :values="selectOptionsValues(bankOptions)"
                                :aria-label="getLabels('Labels.DirectDebit.Bank', bank.Label)"
                                :select-mod="bank.SelectMod"
                                :select-element-mod="$v.bankValue.$error ? '-error' : null"
                                :initial="getInitialValue(bank, 'Bank', 'bankValue', bankValue)"
                                :name="bank.Name"
                                :arrow-direction="bank.Arrow.Direction || null"
                                :arrow-size="bank.Arrow.Size || null"
                                :arrow-tailwind-color="bank.Arrow.TailwindColor || null"
                                :arrow-other-mods="bank.Arrow.OtherMods || null"
                                @change="updateModel"
                                @blur="handleBlur('bankValue')"
                            >
                            </v-select>
                            <div v-if="!isKR && $v.bankValue.$error" :id="`${bank.Id}-error`" class="e-formError">
                                <p class="e-formError__item" role="alert" v-html="getFieldError('Bank')"></p>
                            </div>
                        </div>
                    </div>

                    <div v-if="!isAU && !isNZ" class="o-commissionDepForm__row">
                        <!-- Account Number Field -->
                        <div class="m-formField -text">
                            <label
                                class="m-formField__label uppercase"
                                :class="isPL || isMX ? 'mt-0': 'mt-50'"
                                :for="accountNumber.Id"
                                v-html="accountNumberLabel">
                            </label>
                            <v-input
                                :id="accountNumber.Id"
                                ref="accountNumber"
                                v-model="accountNumberValue"
                                auto-complete="off"
                                :name="accountNumber.Name"
                                :max-length="!isMX && maxAccountNumberLength"
                                :min-length="!isMX && accountNumber.MinLength"
                                model-name="accountNumberValue"
                                :placeholder="accountNumber.Placeholder || getLocalizationProp('Labels.DirectDebit.EnterAccountNumber')"
                                :tailwind-mods="$v.accountNumberValue.$error ? '-isInvalid' : null"
                                :value="getInitialValue(accountNumber, 'AccountNumber', 'accountNumberValue', accountNumberValue)"
                                @input="updateModel('accountNumberValue')"
                                @blur="handleBlur('accountNumberValue')"
                                v-on="isPL ? null : { keydown: handleInteger }">
                            </v-input>
                            <div v-if="!isPL && !isKR && !isMX && $v.accountNumberValue.$error" :id="`${accountNumber.Id}-error`" class="e-formError">
                                <p class="e-formError__item" role="alert" v-html="getFieldError('AccountNumber')"></p>
                            </div>
                            <div v-if="isMX && $v.accountNumberValue.$error" :id="`${accountNumber.Id}-error`" class="e-formError">
                                <p class="e-formError__item" role="alert" v-html="determineMxAccountNumberErrorMsg()" />
                            </div>
                        </div>
                        <img
                            v-if="imageData"
                            class="w-3_4 mb-30 sm:w-1_2"
                            :src="imageData.Url"
                            :alt="imageData.Alt"
                        />
                    </div>

                    <div v-if="isAU || isNZ" class="o-commissionDepForm__row">
                        <!-- Account Number Field with tooltip - Australia and New Zealand -->
                        <div class="m-formField -text">
                            <label
                                class="m-formField__tooltipLabel"
                                :for="accountNumber.Id"
                                v-html="accountNumberLabel">
                            </label>
                            <m-tooltip
                                v-if="directDepositLabels && directDepositLabels.Tooltip"
                                :is-within-form="true"
                                :popper-offset-x-mobile="directDepositLabels.Tooltip.OffsetHorizontalMobile"
                                :popper-offset-y="12"
                                placement="right"
                                :tooltip-aria-label="directDepositLabels.Tooltip.AriaLabel"
                                tooltip-icon-size="xs"
                                tooltip-id="accountNumber"
                                :tooltip-popup-mod="isDesktop ? '-lg p-10' : '-md p-10'"
                                :tooltip-rte="directDepositLabels.Tooltip.Rte"
                            />
                            <v-input
                                :id="accountNumber.Id"
                                ref="accountNumber"
                                v-model="accountNumberValue"
                                auto-complete="off"
                                :name="accountNumber.Name"
                                model-name="accountNumberValue"
                                :placeholder="accountNumber.Placeholder || getLocalizationProp('Labels.DirectDeposit.EnterAccountNumber')"
                                :tailwind-mods="$v.accountNumberValue.$error ? '-isInvalid' : null"
                                :value="getInitialValue(accountNumber, 'AccountNumber', 'accountNumberValue', accountNumberValue)"
                                @input="updateModel('accountNumberValue'); resetBackendBankAccountError();"
                                @blur="handleBlur('accountNumberValue')"
                                v-on="{ keydown: handleInteger }">
                            </v-input>
                            <div v-if="$v.accountNumberValue.$error || hasBackendBankAccountError" :id="`${accountNumber.Id}-error`" class="e-formError">
                                <p class="e-formError__item" role="alert" v-html="determineAuNzAccountNumberErrorMsg()"></p>
                            </div>
                        </div>
                        <img
                            v-if="imageData"
                            class="w-3_4 mb-30 sm:w-1_2"
                            :src="imageData.Url"
                            :alt="imageData.Alt"
                        />
                    </div>

                    <div v-if="isKR || isSGMY || isPH || isPL" class="o-commissionDepForm__row">
                        <!-- Account Holder Field -->
                        <div class="m-formField -text">
                            <label
                                class="m-formField__label uppercase"
                                :for="accountHolder.Id"
                                v-html="getLabels('Labels.DirectDebit.NameOnAccount', accountHolder.Label)">
                            </label>
                            <v-input
                                v-if="isSGMY || isPH || isPL"
                                :id="accountHolder.Id"
                                ref="accountHolder"
                                v-model="accountHolderValue"
                                auto-complete="off"
                                :name="accountHolder.Name"
                                :max-length="accountHolder.MaxLength"
                                :min-length="accountHolder.MinLength"
                                :placeholder="accountHolder.Placeholder"
                                :tailwind-mods="$v.accountHolderValue.$error ? '-isInvalid' : null"
                                :value="getInitialValue(accountHolder, 'NameOnAccount', 'accountHolderValue', accountHolderValue)"
                                @input="updateModel('accountHolderValue')"
                                @blur="handleBlur('accountHolderValue')">
                            </v-input>
                            <v-select
                                v-else
                                :id="accountHolder.id"
                                ref="accountHolder"
                                vmodel="accountHolderValue"
                                :options="selectOptionsLabels(cardHolderNameOptions)"
                                :values="selectOptionsValues(cardHolderNameOptions)"
                                :aria-label="getLabels('Labels.DirectDebit.NameOnAccount', accountHolder.Label)"
                                :select-mod="accountHolder.SelectMod"
                                :initial="getInitialValue(accountHolder, 'NameOnAccount', 'accountHolderValue', accountHolderValue) || selectOptionsValues(cardHolderNameOptions)[0] || ''"
                                :name="accountHolder.Name"
                                :arrow-direction="accountHolder.Arrow.Direction || null"
                                :arrow-size="accountHolder.Arrow.Size || null"
                                :arrow-tailwind-color="accountHolder.Arrow.TailwindColor || null"
                                :arrow-other-mods="accountHolder.Arrow.OtherMods || null"
                                @change="updateModel"
                                @blur="handleBlur('accountHolderValue')"
                            />
                            <div v-if="$v.accountHolderValue.$error" :id="`${accountHolder.Id}-error`" class="e-formError">
                                <p class="e-formError__item" role="alert">{{ getLocalizationProp('Labels.ErrorMessages.NameOnAccount.Required') }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Terms and Conditions Checkbox -->
                    <div
                        v-if="showConsentCheckbox && isPH"
                        class="o-commissionDepForm__terms"
                    >
                        <div class=" m-formField -checkbox -alignTop pt-8 pr-1">
                            <m-checkbox-rte-modal
                                :value="$v.termsCheckboxValue.$model"
                                :modal-data="checkboxLocalizations"
                                my-name="termsCheckbox"
                                body-class="-mktplace"
                                :label-mods="`-blue ${$v.termsCheckboxValue.$error ? '-error': ''}`"
                                :script-id="scriptId"
                                @update="updateTermsCheckbox"
                            ></m-checkbox-rte-modal>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="o-commissionDepForm__row -actions">
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

                    <div
                        v-if="showConsentCheckbox && !isPH"
                        class="o-commissionDepForm__row mb-30 md:mb-50">

                        <m-checkbox
                            :id="consentCheckbox.Id"
                            ref="consentCheckbox"
                            v-model="$v.consentCheckboxValue.$model"
                            :label="getLabels('Labels.IAgreeLabel', 'I agree')"
                            :label-mods="`font-normal ${$v.consentCheckboxValue.$error ? '-error' : ''}`"
                            :name="consentCheckbox.Name"
                        />
                        <div v-if="$v.consentCheckboxValue.$error" class="e-formError">
                            <p class="e-formError__item" role="alert" v-html="getLocalizationProp('Labels.ErrorMessages.FieldRequired', 'Required')"></p>
                        </div>
                    </div>

                    <p
                        v-if="summary && isPH"
                        class="o-commissionDepForm__summaryBottom"
                        v-html="summary"
                    ></p>

                    <!-- Show API/FE errors messages -->
                    <div
                        v-if="listError && listError.length"
                        class="o-commissionDepForm__apiError e-formError"
                    >
                        <p v-for="(validation, index) in listError" :key="index" class="e-formError__item py-0" role="alert">
                            {{ validation.error ? validation.error : validation }}
                        </p>
                    </div>
                    <!-- For Terms Checkbox -->
                    <div v-if="$v.termsCheckboxValue && $v.termsCheckboxValue.$error" class="e-formError">
                        <p class="e-formError__item" role="alert" v-html="getLocalizationProp('Labels.ErrorMessages.ConsentCheckbox.Required', 'Terms Checkbox Required')"></p>
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
    import { isValidClabeCardNumber } from '@productstore/source/js/vue/utils/mx-form-helper';
    import {
        isValidAuBankAccountNumber,
        isValidBsbNumber,
        isValidNzBankAccountNumber,
        prependAuBankAccountNumberWithZeros
    } from '../../../utils/au-nz-form-helper';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';

    export default {
        name: 'CommissionDepositForm',
        components: {
            vInput
        },
        mixins: [ isDesktop, paymentFormMixin, validationMixin ],
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

                // Bank Number settings (only for Poland)
                ...(this.isPL && {
                    bankNumberValue: {
                        required
                    }
                }),

                // Bank Validation Settings
                bankValue: {
                    required
                },

                // BSB Validation Settings (only for AU)
                ...(this.isAU && {
                    bsbNumberValue: {
                        required,
                        valid: val => {
                            if(!val) return true;
                            return isValidBsbNumber(val);
                        }
                    }
                }),

                // Account Number Validation Settings
                accountNumberValue: {
                    required,

                    min: value => {
                        // only validate min char limit if NOT Korea/PH/PL/AU/NZ/MX
                        // AU/NZ/MX uses regex validation below
                        if(this.isKR || this.isPH || this.isPL || this.isAU || this.isNZ || this.isMX) return true;
                        if(value === null) return false;
                        // SG and MY have different min char limit.
                        if(this.isSGMY) return value.length >= 7;
                        if(this.isAU) return value.length >= 8;
                        if(this.isNZ) return value.length >= 15;
                        return value.length >= this.accountNumber.MinLength;
                    },
                    max: value => {
                        // AU/NZ/MX uses regex validation below
                        if(this.isAU || this.isNZ || this.isMX) return true;
                        if(value === null) return false;
                        return value.length <= this.maxAccountNumberLength;
                    },
                    // AU/NZ/MX specific validation
                    valid: value => {
                        if(!this.isAU && !this.isNZ && !this.isMX) return true;
                        if(!value) return true;
                        if(this.isAU) return isValidAuBankAccountNumber(value);
                        if(this.isNZ) return isValidNzBankAccountNumber(value);
                        if(this.isMX) return isValidClabeCardNumber(value);
                    }

                },

                // Consent Checkbox Validation Settings (only KR)
                ...(this.showConsentCheckbox && !this.isPH && {
                    consentCheckboxValue: {
                        required,
                        checked: value => {
                            if(value) {
                                return true;
                            }
                            return false;
                        }
                    }
                }),

                // Terms Checkbox Validation Settings (only PH)
                ...(this.showConsentCheckbox && this.isPH && {
                    termsCheckboxValue: {
                        required,
                        checked: value => {
                            if(value) {
                                return true;
                            }
                            return false;
                        }
                    }
                })
            };
        },
        // Note that props are used for default values only, not passed from parent component
        props: {
            accountNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'accountnum',
                        Name: 'accountnum',
                        MinLength: 16,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'DEBIT CARD NUMBER'
                    };
                }
            },
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
                        Label: 'NAME ON ACCOUNT',
                        Arrow: {
                            Direction: '-down',
                            Size: '-sm',
                            OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-10 pointer-events-none',
                            TailwindColor: 'gray'
                        },
                        termsCheckbox: false
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

            // BSB Number is equivalent to Routing Number, for Australia only
            bsbNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'bsb',
                        Name: 'bsb',
                        MinLength: 6,
                        MaxLength: 7,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'BSB NUMBER'
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
            // Used only on PatternLab to set user's country
            country: {
                type: String,
                default: null
            },
            consentCheckbox: {
                type: Object,
                default: function() {
                    return {
                        Id: 'consentCheckbox',
                        Name: 'consentCheckbox',
                        Value: null,
                        ValidationAlert: 'This field is required.'
                    };
                }
            },
            termsCheckbox: {
                type: Object,
                default: function() {
                    return {
                        Id: 'termsCheckbox',
                        Name: 'termsCheckbox',
                        Value: null,
                        ValidationAlert: 'This terms field is required.'
                    };
                }
            },
            token: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                accountHolderValue: '',
                accountNumberValue: '',
                accountTypeValue: 'comission',
                apiListError: null,
                apiSuccess: false,
                bankValue: '',
                bankNumberValue: '',
                bsbNumberValue: '',
                cardHolderNameOptions: [],
                consentCheckboxValue: false,
                formIsValid: false,
                hasBackendBankAccountError: false,
                hasBackendBSBNumberError: false,
                initialLoad: false,
                showSubmitLoading: false,
                termsCheckboxValue: false,
                urlParams: null,
                search: '',
                showDropdown: false,
                filteredBankOptions: [],
                selectedSearchOption: ''
            };
        },
        computed: {
            ...mapState('paymentMethod', [
                'storedApiError',
                'storedApiLoading',
                'storedApiSuccess',
                'storedPayMethods',
                'storedBanks']),

            accountNumberLabel() {
                return this.localization.Labels.DirectDebit.AccountNumber;
            },
            bankOptions() {
                const placeholder = {
                    Label: this.getLabels('Labels.DirectDebit.Select', 'Seleccione'),
                    Value: null
                };

                return [
                    placeholder,
                    ...this.storedBanks
                        .filter((bank) => bank.Name)
                        .map((bank) => ({
                            Label: bank.Name.replace(/,/g, ' - '),
                            Value: bank.Id
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
            bsbLabels() {
                return this.getLocalizationProp('Labels.BSB', {});
            },
            checkboxLocalizations() {
                return this.getLocalizationProp('Data.TermsAndConditionModal', {});
            },
            customerId() {
                return this.localization?.Data?.CustomerId;
            },
            directDepositLabels() {
                return this.getLocalizationProp('Labels.DirectDeposit', {});
            },
            enableBankSearch() {
                return this.getLocalizationProp('Data.EnableBankSearch', false);
            },
            imageData() {
                return this.localization?.Data?.Image || null;
            },
            listError() {
                let errors = [];

                if(this.apiListError && this.apiListError.length) {
                    errors = errors.concat(this.apiListError);
                }

                if(!this.renderValidationsBelowInputs && this.feListError && this.feListError.length) {
                    errors = errors.concat(this.feListError);
                }

                return errors;
            },
            maxAccountNumberLength() {
                let maxAccountNumberLength = 18;
                if(this.isPL) maxAccountNumberLength = 35;
                if(this.isAU) maxAccountNumberLength = 9;
                return maxAccountNumberLength;
            },
            renderValidationsBelowInputs() {
                return this.getLocalizationProp('Data.RenderValidationsBelowInputs', true);
            },
            searchPlaceholder() {
                if(!this.selectedSearchOption) {
                    return this.getLocalizationProp('Labels.DirectDeposit.BankSearch', 'Search');
                } else {
                    return this.selectedSearchOption.Name;
                }
            },
            showConsentCheckbox() {
                return this.getLocalizationProp('Data.ShowAgreeCheckbox', false);
            },
            showRegularDropdown() {
                return this.localization && this.localization.Labels && this.bankOptions.length > 1;
            },
            showSearchDropdown() {
                return this.showRegularDropdown && this.enableBankSearch;
            },
            summary() {
                return this.getLocalizationProp('Data.FormSummary', null);
            },
            userName() {
                return this.localization?.Data?.Username;
            }
        },
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
            }
        },
        async mounted() {
            this.initialLoad = false;

            this.urlParams = new URLSearchParams(window.location.search);

            this.setCardHolderNameValues();

            this.resetListErrors();

            // Get cross country information
            // Get all payment methods of the customer
            // Get all banks
            await Promise.all([
                this.getCountryInfo({ country: this.$env.Country }),
                this.getPayMethods(),
                !this.isPL ? this.getBanks(this.$env.Country) : Promise.resolve()
            ]);
            this.filteredBankOptions = this.storedBanks;
            this.initialLoad = true;
        },
        methods: {
            ...mapActions('paymentMethod', ['getCountryInfo', 'getBanks', 'getPayMethods', 'savePayMethod']),
            delayedBlur() {
                // Using setTimeout delays the execution of the contained function
                setTimeout(() => {
                    this.showDropdown = false;
                }, 200);
            },
            determineAuNzAccountNumberErrorMsg() {
                if(this.$v.accountNumberValue.required === false) return this.getLocalizationProp('Labels.ErrorMessages.AccountNumber.Required');
                else if(this.$v.accountNumberValue.valid === false || this.hasBackendBankAccountError) return this.getLocalizationProp('Labels.ErrorMessages.AccountNumber.Invalid');
            },
            determineBsbNumberErrorMsg() {
                if(this.$v.bsbNumberValue.required === false) return this.getLocalizationProp('Labels.ErrorMessages.BSB.Required');
                else if(this.$v.bsbNumberValue.valid === false || this.hasBackendBSBNumberError) return this.getLocalizationProp('Labels.ErrorMessages.BSB.Invalid');
            },
            determineMxAccountNumberErrorMsg() {
                if(this.$v.accountNumberValue.required === false) return this.getLocalizationProp('Labels.ErrorMessages.AccountNumber.Required');
                else if(this.$v.accountNumberValue.valid === false) return this.getLocalizationProp('Labels.DirectDebit.InvalidErrorMessage');
            },
            filterOptions() {
                // Bug 125654
                this.showDropdown = true;

                this.filteredBankOptions = this.storedBanks.filter(option =>
                    option?.Name?.toLowerCase()?.includes(this.search.toLowerCase())
                );
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

                    const fields = [
                        ...(this.showConsentCheckbox && !this.isPH ? ['consentCheckbox'] : []),
                        ...(this.showConsentCheckbox && this.isPH ? ['termsCheckbox'] : []),
                        ...(this.isPL ? ['bankNumber'] : []),
                        ...(!this.isPL && !this.isAU && !this.isNZ ? ['bank'] : []),
                        ...(this.isAU ? ['bsbNumber'] : []),

                        'accountHolder',
                        'accountNumber'
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
                    /* eslint-disable */console.log(...oo_oo(`60456000_956_20_956_84_4`,'[CommissionDepositForm] HandleSubmit - Exception:'));
                    /* eslint-disable */console.log(...oo_oo(`60456000_957_20_957_34_4`,e));
                }
            },
            resetBSBNumberError() {
                this.hasBackendBSBNumberError = false;
            },
            resetBackendBankAccountError() {
                this.hasBackendBankAccountError = false;
            },
            setBankAccountInvalid() {
                this.hasBackendBankAccountError = true;
            },
            setBSBNumberInvalid() {
                this.hasBackendBSBNumberError = true;
            },
            setCardHolderNameValues() {
                const cardHolderNames =
                    this.localization.Data?.CardHoldersNames?.split(',')
                        .map((name) => name.trim())
                        .filter((name) => name);

                this.cardHolderNameOptions = cardHolderNames?.map((name) => ({
                    Label: name,
                    Value: name
                })) || [];
            },
            selectOption(option) {
                this.bankValue = option.Id;
                this.showDropdown = false;
                this.search = option.Name;
                this.updateModel();
                this.handleBlur('bankValue');
            },
            updateTermsCheckbox(params) {
                this.termsCheckboxValue = params.value;
                this.$v.$touch();
            },
            async submitForm() {
                const bank = this.storedBanks?.find((bank) => bank.Id === this.bankValue);
                const routingNumber = bank?.RoutingNumber || '';

                const accountNumberValue =
                    this.isAU ? prependAuBankAccountNumberWithZeros(this.accountNumberValue) : this.accountNumberValue;

                const payload = {
                    payMethodDefaults: [],
                    country: this.$env.Country,
                    oneTimeUse: false,
                    isActive: true,
                    payType: 'DirectDeposit',
                    nameOnAccount: this.accountHolderValue,
                    accountNumber: accountNumberValue,
                    bankName: this.bankValue,
                    bankNumber: this.bankNumberValue,
                    payMethodDirection: 'Outbound', // Inbound or Outboun
                    applicationId: 1,
                    routingNumber: this.bsbNumberValue || routingNumber,
                    postalCode: '',
                    accountNickName: ''
                };

                // Korean payload overrides
                if(this.isKR) {
                    const names = this.cardHolderNameOptions.map(({ Value }) => Value);
                    const customerFirstName = this.getLocalizationProp('Data.CustomerFirstName', names[0]);
                    const spouseFirstName = this.getLocalizationProp('Data.SpouseFirstName', names[1]);
                    payload.nameOnAccount = this.accountHolderValue === names[0] ? customerFirstName : spouseFirstName;
                }
                if(this.enableBankSearch || this.isKR) {
                    const bankName = bank?.Name;
                    payload.bankName = bankName;
                }

                // Save payment method
                const saveAchResponse = await this.savePayMethod({
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

                if(!saveAchResponse?.success) {
                    const messageType = saveAchResponse.response?.messageType;

                    const messageHandlers = {
                        'InvalidAccountNumber': () => this.setBankAccountInvalid(),
                        'InvalidAchAccountNumber': () => this.setBankAccountInvalid(),
                        'InvalidAchRoutingNumber': () => this.setBSBNumberInvalid()
                    };

                    if(messageType && messageHandlers[messageType]) {
                        messageHandlers[messageType]();
                    }
                }
            }
        }
    };
/* istanbul ignore next *//* c8 ignore start *//* eslint-disable */;function oo_cm(){try{return (0,eval)("globalThis._console_ninja") || (0,eval)("/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x27f4ea=_0x5cf7;function _0x36d9(){var _0x2a7840=['690392SBBGXD','ninjaSuppressConsole','level','%c\\x20Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','_connected','map','_isNegativeZero','getWebSocketClass','_Symbol','5016Girvng','cappedElements','props','negativeInfinity','astro','split','_socket','count','10.0.2.2','forEach','message','85491CEGaSW','getOwnPropertyNames','[object\\x20BigInt]','onopen','expo','depth','stack','prototype','_dateToString','_sortProps','setter','undefined','autoExpandMaxDepth','_reconnectTimeout','[object\\x20Array]','_propertyName','_isPrimitiveType','url','match','_setNodeQueryPath','_p_name','_objectToString','bigint','reducedLimits','env','constructor','[object\\x20Set]','String','_hasSymbolPropertyOnItsPath','196xjkxBf','osName','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host','_connectAttemptCount','resetOnProcessingTimeAverageMs','parent','_ws','_p_','_getOwnPropertyDescriptor','_sendErrorMessage','replace','readyState','get','data','totalStrLength','reducePolicy','function','_additionalMetadata','angular','failed\\x20to\\x20connect\\x20to\\x20host:\\x20','Map','elements','current','_type','autoExpandPropertyCount','endsWith','isExpressionToEvaluate','resetWhenQuietMs','_isMap','_inBrowser','_blacklistedProperty','host','_maxConnectAttemptCount','1.0.0','_hasSetOnItsPath','length','_setNodeLabel','_ninjaIgnoreNextError','negativeZero','Symbol','disabledLog','127.0.0.1','RegExp','origin','[object\\x20Date]','bound\\x20Promise','index','iterator','trace','react-native','_HTMLAllCollection','autoExpand','object','funcName','_console_ninja','node','WebSocket','log','some','_console_ninja_session','versions','disabledTrace','push','call','unknown','timeStamp','_addObjectProperty','_connecting','POSITIVE_INFINITY','startsWith','hostname','next.js','modules','noFunctions','serialize','positiveInfinity','expressionsToEvaluate','_disposeWebsocket','process','concat','_isArray','charAt','capped','return\\x20import(url.pathToFileURL(path.join(nodeModules,\\x20\\x27ws/index.js\\x27)).toString());','_setNodePermissions','name','gateway.docker.internal','\\x20browser','import(\\x27path\\x27)','performance','_addFunctionsNode','onmessage','stackTraceLimit','getOwnPropertyDescriptor','10816xJVhzh','_webSocketErrorDocsLink','_WebSocket','allStrLength','remix','_hasMapOnItsPath','resolveGetters','cappedProps','getOwnPropertySymbols','substr','_connectToHostNow','_consoleNinjaAllowedToStart','toString','_processTreeNodeResult','_quotedRegExp','bind','Boolean','string','strLength','dockerizedApp','eventReceivedCallback','sortProps','autoExpandPreviousObjects','global','android','HTMLAllCollection','location','catch','reduceOnAccumulatedProcessingTimeMs','includes','send','reload','6410qFSoKL','_inNextEdge','\\x20server','default','array','defaultLimits','ws://','unref','test','1770272872048','_allowedToSend','_keyStrRegExp','NEXT_RUNTIME','args','hasOwnProperty',[\"localhost\",\"127.0.0.1\",\"example.cypress.io\",\"10.0.2.2\",\"CNHODWIT013W40C\",\"10.136.130.192\",\"172.28.64.1\"],'','Number','Promise','NEGATIVE_INFINITY','_extendedWarning','root_exp_id','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','valueOf','https://tinyurl.com/37x8b79t','close','time','Buffer','_capIfString','fromCharCode','perf_hooks','console','reduceOnCount','_numberRegExp','perLogpoint','_attemptToReconnectShortly','resolve','see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','autoExpandLimit','_WebSocketClass','hits','Set','[object\\x20Map]','failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket','reduceLimits','_setNodeExpressionPath','78anopaZ','_setNodeId','import(\\x27url\\x27)','_cleanNode','_allowedToConnectOnSend','coverage','_addLoadNode','284330UEndtY','nodeModules',\"c:\\\\Users\\\\cn4095\\\\.vscode\\\\extensions\\\\wallabyjs.console-ninja-1.0.515\\\\node_modules\",'_regExpToString','_treeNodePropertiesBeforeFullValue','value','_treeNodePropertiesAfterFullValue','_isUndefined',',\\x20see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','symbol','edge','number','toUpperCase','date','isArray','_getOwnPropertyNames','null','_addProperty','Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','now','hrtime','warn','toLowerCase','stringify','error','475200jRFXVC','_isPrimitiveWrapperType','onerror','pop','12429FzEnku','_undefined','onclose','type','_isSet'];_0x36d9=function(){return _0x2a7840;};return _0x36d9();}(function(_0x247d5a,_0x341b8b){var _0x3f55d1=_0x5cf7,_0x36495b=_0x247d5a();while(!![]){try{var _0x14d248=-parseInt(_0x3f55d1(0x1dc))/0x1*(-parseInt(_0x3f55d1(0x18e))/0x2)+-parseInt(_0x3f55d1(0x20e))/0x3*(parseInt(_0x3f55d1(0x130))/0x4)+-parseInt(_0x3f55d1(0x1e3))/0x5+-parseInt(_0x3f55d1(0x1fc))/0x6+-parseInt(_0x3f55d1(0x219))/0x7+-parseInt(_0x3f55d1(0x205))/0x8+parseInt(_0x3f55d1(0x200))/0x9*(parseInt(_0x3f55d1(0x1ae))/0xa);if(_0x14d248===_0x341b8b)break;else _0x36495b['push'](_0x36495b['shift']());}catch(_0x4c7c25){_0x36495b['push'](_0x36495b['shift']());}}}(_0x36d9,0xf1d4b));function z(_0x22e966,_0x2a08d4,_0x1d9d5f,_0x18eca4,_0x226865,_0x14e3c8){var _0x3d90b1=_0x5cf7,_0x4c08d3,_0x3dfd9f,_0x48683c,_0x7da6d3;this[_0x3d90b1(0x1a5)]=_0x22e966,this[_0x3d90b1(0x14f)]=_0x2a08d4,this['port']=_0x1d9d5f,this['nodeModules']=_0x18eca4,this[_0x3d90b1(0x1a1)]=_0x226865,this[_0x3d90b1(0x1a2)]=_0x14e3c8,this[_0x3d90b1(0x1b8)]=!0x0,this[_0x3d90b1(0x1e0)]=!0x0,this[_0x3d90b1(0x209)]=!0x1,this[_0x3d90b1(0x173)]=!0x1,this['_inNextEdge']=((_0x3dfd9f=(_0x4c08d3=_0x22e966[_0x3d90b1(0x17e)])==null?void 0x0:_0x4c08d3[_0x3d90b1(0x231)])==null?void 0x0:_0x3dfd9f[_0x3d90b1(0x1ba)])==='edge',this[_0x3d90b1(0x14d)]=!((_0x7da6d3=(_0x48683c=this[_0x3d90b1(0x1a5)][_0x3d90b1(0x17e)])==null?void 0x0:_0x48683c[_0x3d90b1(0x16c)])!=null&&_0x7da6d3['node'])&&!this['_inNextEdge'],this[_0x3d90b1(0x1d5)]=null,this['_connectAttemptCount']=0x0,this[_0x3d90b1(0x150)]=0x14,this['_webSocketErrorDocsLink']=_0x3d90b1(0x1c6),this[_0x3d90b1(0x139)]=(this[_0x3d90b1(0x14d)]?_0x3d90b1(0x1c4):'Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20')+this[_0x3d90b1(0x18f)];}z[_0x27f4ea(0x220)][_0x27f4ea(0x20c)]=async function(){var _0x4e9ea2=_0x27f4ea,_0x1bd897,_0x37180d;if(this[_0x4e9ea2(0x1d5)])return this[_0x4e9ea2(0x1d5)];let _0x5520cf;if(this['_inBrowser']||this[_0x4e9ea2(0x1af)])_0x5520cf=this[_0x4e9ea2(0x1a5)][_0x4e9ea2(0x168)];else{if((_0x1bd897=this['global'][_0x4e9ea2(0x17e)])!=null&&_0x1bd897[_0x4e9ea2(0x190)])_0x5520cf=(_0x37180d=this[_0x4e9ea2(0x1a5)][_0x4e9ea2(0x17e)])==null?void 0x0:_0x37180d[_0x4e9ea2(0x190)];else try{_0x5520cf=(await new Function('path',_0x4e9ea2(0x22a),'nodeModules',_0x4e9ea2(0x183))(await(0x0,eval)(_0x4e9ea2(0x188)),await(0x0,eval)(_0x4e9ea2(0x1de)),this[_0x4e9ea2(0x1e4)]))[_0x4e9ea2(0x1b1)];}catch{try{_0x5520cf=require(require('path')['join'](this['nodeModules'],'ws'));}catch{throw new Error(_0x4e9ea2(0x1d9));}}}return this[_0x4e9ea2(0x1d5)]=_0x5520cf,_0x5520cf;},z[_0x27f4ea(0x220)][_0x27f4ea(0x198)]=function(){var _0x80449b=_0x27f4ea;this[_0x80449b(0x173)]||this[_0x80449b(0x209)]||this[_0x80449b(0x133)]>=this[_0x80449b(0x150)]||(this[_0x80449b(0x1e0)]=!0x1,this[_0x80449b(0x173)]=!0x0,this[_0x80449b(0x133)]++,this[_0x80449b(0x136)]=new Promise((_0x3afb54,_0x4b1721)=>{var _0x5882d6=_0x80449b;this['getWebSocketClass']()['then'](_0xa2a631=>{var _0x427cc4=_0x5cf7;let _0x50f21b=new _0xa2a631(_0x427cc4(0x1b4)+(!this[_0x427cc4(0x14d)]&&this[_0x427cc4(0x1a1)]?_0x427cc4(0x186):this['host'])+':'+this['port']);_0x50f21b[_0x427cc4(0x1fe)]=()=>{var _0x4a2b6b=_0x427cc4;this[_0x4a2b6b(0x1b8)]=!0x1,this[_0x4a2b6b(0x17d)](_0x50f21b),this[_0x4a2b6b(0x1d1)](),_0x4b1721(new Error('logger\\x20websocket\\x20error'));},_0x50f21b[_0x427cc4(0x21c)]=()=>{var _0x765837=_0x427cc4;this[_0x765837(0x14d)]||_0x50f21b['_socket']&&_0x50f21b['_socket'][_0x765837(0x1b5)]&&_0x50f21b[_0x765837(0x214)]['unref'](),_0x3afb54(_0x50f21b);},_0x50f21b[_0x427cc4(0x202)]=()=>{var _0x1f14a0=_0x427cc4;this[_0x1f14a0(0x1e0)]=!0x0,this['_disposeWebsocket'](_0x50f21b),this['_attemptToReconnectShortly']();},_0x50f21b[_0x427cc4(0x18b)]=_0x20f72d=>{var _0x2c8687=_0x427cc4;try{if(!(_0x20f72d!=null&&_0x20f72d[_0x2c8687(0x13d)])||!this[_0x2c8687(0x1a2)])return;let _0x31e1bb=JSON['parse'](_0x20f72d[_0x2c8687(0x13d)]);this['eventReceivedCallback'](_0x31e1bb['method'],_0x31e1bb[_0x2c8687(0x1bb)],this[_0x2c8687(0x1a5)],this[_0x2c8687(0x14d)]);}catch{}};})['then'](_0x47392a=>(this[_0x5882d6(0x209)]=!0x0,this[_0x5882d6(0x173)]=!0x1,this[_0x5882d6(0x1e0)]=!0x1,this[_0x5882d6(0x1b8)]=!0x0,this['_connectAttemptCount']=0x0,_0x47392a))['catch'](_0x557458=>(this['_connected']=!0x1,this[_0x5882d6(0x173)]=!0x1,console[_0x5882d6(0x1f8)]('logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20'+this[_0x5882d6(0x18f)]),_0x4b1721(new Error(_0x5882d6(0x143)+(_0x557458&&_0x557458[_0x5882d6(0x218)])))));}));},z['prototype'][_0x27f4ea(0x17d)]=function(_0x1f0a2c){var _0x4bf2ff=_0x27f4ea;this[_0x4bf2ff(0x209)]=!0x1,this['_connecting']=!0x1;try{_0x1f0a2c[_0x4bf2ff(0x202)]=null,_0x1f0a2c[_0x4bf2ff(0x1fe)]=null,_0x1f0a2c[_0x4bf2ff(0x21c)]=null;}catch{}try{_0x1f0a2c[_0x4bf2ff(0x13b)]<0x2&&_0x1f0a2c[_0x4bf2ff(0x1c7)]();}catch{}},z['prototype'][_0x27f4ea(0x1d1)]=function(){var _0x341bb2=_0x27f4ea;clearTimeout(this['_reconnectTimeout']),!(this[_0x341bb2(0x133)]>=this['_maxConnectAttemptCount'])&&(this[_0x341bb2(0x226)]=setTimeout(()=>{var _0x43bebd=_0x341bb2,_0x5a79f4;this[_0x43bebd(0x209)]||this[_0x43bebd(0x173)]||(this[_0x43bebd(0x198)](),(_0x5a79f4=this[_0x43bebd(0x136)])==null||_0x5a79f4[_0x43bebd(0x1a9)](()=>this['_attemptToReconnectShortly']()));},0x1f4),this[_0x341bb2(0x226)]['unref']&&this[_0x341bb2(0x226)]['unref']());},z[_0x27f4ea(0x220)]['send']=async function(_0x1313ed){var _0x479ef0=_0x27f4ea;try{if(!this[_0x479ef0(0x1b8)])return;this[_0x479ef0(0x1e0)]&&this[_0x479ef0(0x198)](),(await this[_0x479ef0(0x136)])[_0x479ef0(0x1ac)](JSON[_0x479ef0(0x1fa)](_0x1313ed));}catch(_0x11a87c){this[_0x479ef0(0x1c2)]?console[_0x479ef0(0x1f8)](this['_sendErrorMessage']+':\\x20'+(_0x11a87c&&_0x11a87c['message'])):(this[_0x479ef0(0x1c2)]=!0x0,console['warn'](this[_0x479ef0(0x139)]+':\\x20'+(_0x11a87c&&_0x11a87c['message']),_0x1313ed)),this[_0x479ef0(0x1b8)]=!0x1,this['_attemptToReconnectShortly']();}};function H(_0x43f896,_0x3f2f5a,_0x564161,_0x3241a8,_0x188d9c,_0x4c2c16,_0x44730f,_0x647db1=ne){var _0x3bb3cc=_0x27f4ea;let _0x1007b5=_0x564161[_0x3bb3cc(0x213)](',')[_0x3bb3cc(0x20a)](_0xc6ed03=>{var _0x401a03=_0x3bb3cc,_0x3c5a4a,_0x19fd6e,_0x46c009,_0x48f9f6,_0x4f2fb0,_0x3aa464,_0x5e5b35,_0x28c6b8;try{if(!_0x43f896[_0x401a03(0x16b)]){let _0x12ab8a=((_0x19fd6e=(_0x3c5a4a=_0x43f896[_0x401a03(0x17e)])==null?void 0x0:_0x3c5a4a[_0x401a03(0x16c)])==null?void 0x0:_0x19fd6e['node'])||((_0x48f9f6=(_0x46c009=_0x43f896['process'])==null?void 0x0:_0x46c009['env'])==null?void 0x0:_0x48f9f6[_0x401a03(0x1ba)])===_0x401a03(0x1ed);(_0x188d9c===_0x401a03(0x177)||_0x188d9c===_0x401a03(0x192)||_0x188d9c===_0x401a03(0x212)||_0x188d9c===_0x401a03(0x142))&&(_0x188d9c+=_0x12ab8a?_0x401a03(0x1b0):_0x401a03(0x187));let _0x1e2f73='';_0x188d9c==='react-native'&&(_0x1e2f73=(((_0x5e5b35=(_0x3aa464=(_0x4f2fb0=_0x43f896[_0x401a03(0x21d)])==null?void 0x0:_0x4f2fb0[_0x401a03(0x178)])==null?void 0x0:_0x3aa464['ExpoDevice'])==null?void 0x0:_0x5e5b35[_0x401a03(0x131)])||'emulator')['toLowerCase'](),_0x1e2f73&&(_0x188d9c+='\\x20'+_0x1e2f73,(_0x1e2f73===_0x401a03(0x1a6)||_0x1e2f73==='emulator'&&((_0x28c6b8=_0x43f896[_0x401a03(0x1a8)])==null?void 0x0:_0x28c6b8[_0x401a03(0x176)])===_0x401a03(0x216))&&(_0x3f2f5a=_0x401a03(0x216)))),_0x43f896[_0x401a03(0x16b)]={'id':+new Date(),'tool':_0x188d9c},_0x44730f&&_0x188d9c&&!_0x12ab8a&&(_0x1e2f73?console[_0x401a03(0x169)](_0x401a03(0x1f5)+_0x1e2f73+_0x401a03(0x1eb)):console[_0x401a03(0x169)](_0x401a03(0x208)+(_0x188d9c[_0x401a03(0x181)](0x0)[_0x401a03(0x1ef)]()+_0x188d9c[_0x401a03(0x197)](0x1))+',','background:\\x20rgb(30,30,30);\\x20color:\\x20rgb(255,213,92)',_0x401a03(0x1d3)));}let _0xb4d9e8=new z(_0x43f896,_0x3f2f5a,_0xc6ed03,_0x3241a8,_0x4c2c16,_0x647db1);return _0xb4d9e8[_0x401a03(0x1ac)][_0x401a03(0x19d)](_0xb4d9e8);}catch(_0x442a97){return console[_0x401a03(0x1f8)](_0x401a03(0x132),_0x442a97&&_0x442a97[_0x401a03(0x218)]),()=>{};}});return _0xd71c01=>_0x1007b5[_0x3bb3cc(0x217)](_0x107bc8=>_0x107bc8(_0xd71c01));}function _0x5cf7(_0x4902ba,_0x15b27a){var _0x36d92a=_0x36d9();return _0x5cf7=function(_0x5cf752,_0xb98aab){_0x5cf752=_0x5cf752-0x12c;var _0xc44896=_0x36d92a[_0x5cf752];return _0xc44896;},_0x5cf7(_0x4902ba,_0x15b27a);}function ne(_0x555c7e,_0x5dc757,_0x561da1,_0x9c004d){var _0x1a4a8b=_0x27f4ea;_0x9c004d&&_0x555c7e===_0x1a4a8b(0x1ad)&&_0x561da1[_0x1a4a8b(0x1a8)]['reload']();}function b(_0xfaeee1){var _0x56d18c=_0x27f4ea,_0x188689,_0x5b92be;let _0x239e1b=function(_0x3eb629,_0x35dec7){return _0x35dec7-_0x3eb629;},_0x4baa4c;if(_0xfaeee1[_0x56d18c(0x189)])_0x4baa4c=function(){var _0x208582=_0x56d18c;return _0xfaeee1['performance'][_0x208582(0x1f6)]();};else{if(_0xfaeee1[_0x56d18c(0x17e)]&&_0xfaeee1[_0x56d18c(0x17e)][_0x56d18c(0x1f7)]&&((_0x5b92be=(_0x188689=_0xfaeee1['process'])==null?void 0x0:_0x188689[_0x56d18c(0x231)])==null?void 0x0:_0x5b92be['NEXT_RUNTIME'])!=='edge')_0x4baa4c=function(){var _0x408a1c=_0x56d18c;return _0xfaeee1[_0x408a1c(0x17e)][_0x408a1c(0x1f7)]();},_0x239e1b=function(_0x10287d,_0x486a40){return 0x3e8*(_0x486a40[0x0]-_0x10287d[0x0])+(_0x486a40[0x1]-_0x10287d[0x1])/0xf4240;};else try{let {performance:_0x173e16}=require(_0x56d18c(0x1cc));_0x4baa4c=function(){var _0x2af0e6=_0x56d18c;return _0x173e16[_0x2af0e6(0x1f6)]();};}catch{_0x4baa4c=function(){return+new Date();};}}return{'elapsed':_0x239e1b,'timeStamp':_0x4baa4c,'now':()=>Date[_0x56d18c(0x1f6)]()};}function X(_0x5acfc3,_0x43f290,_0x403f1a){var _0xc745c8=_0x27f4ea,_0xdb41c8,_0x409db3,_0x56987f,_0x522b44,_0x101e79,_0x272ca2,_0x16bceb;if(_0x5acfc3['_consoleNinjaAllowedToStart']!==void 0x0)return _0x5acfc3[_0xc745c8(0x199)];let _0x525d88=((_0x409db3=(_0xdb41c8=_0x5acfc3['process'])==null?void 0x0:_0xdb41c8[_0xc745c8(0x16c)])==null?void 0x0:_0x409db3[_0xc745c8(0x167)])||((_0x522b44=(_0x56987f=_0x5acfc3[_0xc745c8(0x17e)])==null?void 0x0:_0x56987f['env'])==null?void 0x0:_0x522b44[_0xc745c8(0x1ba)])===_0xc745c8(0x1ed),_0x288ae3=!!(_0x403f1a===_0xc745c8(0x161)&&((_0x101e79=_0x5acfc3['expo'])==null?void 0x0:_0x101e79[_0xc745c8(0x178)]));function _0x5badf3(_0x4edc3a){var _0x169944=_0xc745c8;if(_0x4edc3a[_0x169944(0x175)]('/')&&_0x4edc3a[_0x169944(0x149)]('/')){let _0x55c867=new RegExp(_0x4edc3a['slice'](0x1,-0x1));return _0x48fd8b=>_0x55c867['test'](_0x48fd8b);}else{if(_0x4edc3a['includes']('*')||_0x4edc3a[_0x169944(0x1ab)]('?')){let _0x42f4be=new RegExp('^'+_0x4edc3a[_0x169944(0x13a)](/\\./g,String[_0x169944(0x1cb)](0x5c)+'.')[_0x169944(0x13a)](/\\*/g,'.*')[_0x169944(0x13a)](/\\?/g,'.')+String[_0x169944(0x1cb)](0x24));return _0x169184=>_0x42f4be['test'](_0x169184);}else return _0xbfa32d=>_0xbfa32d===_0x4edc3a;}}let _0x1b436a=_0x43f290[_0xc745c8(0x20a)](_0x5badf3);return _0x5acfc3[_0xc745c8(0x199)]=_0x525d88||!_0x43f290,!_0x5acfc3[_0xc745c8(0x199)]&&((_0x272ca2=_0x5acfc3['location'])==null?void 0x0:_0x272ca2[_0xc745c8(0x176)])&&(_0x5acfc3[_0xc745c8(0x199)]=_0x1b436a[_0xc745c8(0x16a)](_0x2f1a62=>_0x2f1a62(_0x5acfc3[_0xc745c8(0x1a8)][_0xc745c8(0x176)]))),_0x288ae3&&!_0x5acfc3[_0xc745c8(0x199)]&&!((_0x16bceb=_0x5acfc3['location'])!=null&&_0x16bceb['hostname'])&&(_0x5acfc3[_0xc745c8(0x199)]=!0x0),_0x5acfc3[_0xc745c8(0x199)];}function J(_0x1b84cf,_0x22cb75,_0x10c330,_0x425029,_0x513131,_0x475afa){var _0x214696=_0x27f4ea;_0x1b84cf=_0x1b84cf,_0x22cb75=_0x22cb75,_0x10c330=_0x10c330,_0x425029=_0x425029,_0x513131=_0x513131,_0x513131=_0x513131||{},_0x513131[_0x214696(0x1b3)]=_0x513131[_0x214696(0x1b3)]||{},_0x513131[_0x214696(0x230)]=_0x513131[_0x214696(0x230)]||{},_0x513131['reducePolicy']=_0x513131[_0x214696(0x13f)]||{},_0x513131['reducePolicy'][_0x214696(0x1d0)]=_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)]||{},_0x513131[_0x214696(0x13f)]['global']=_0x513131[_0x214696(0x13f)]['global']||{};let _0x5f34e7={'perLogpoint':{'reduceOnCount':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x1ce)]||0x32,'reduceOnAccumulatedProcessingTimeMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x1aa)]||0x64,'resetWhenQuietMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x14b)]||0x1f4,'resetOnProcessingTimeAverageMs':_0x513131['reducePolicy'][_0x214696(0x1d0)][_0x214696(0x134)]||0x64},'global':{'reduceOnCount':_0x513131['reducePolicy'][_0x214696(0x1a5)][_0x214696(0x1ce)]||0x3e8,'reduceOnAccumulatedProcessingTimeMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1a5)][_0x214696(0x1aa)]||0x12c,'resetWhenQuietMs':_0x513131['reducePolicy']['global'][_0x214696(0x14b)]||0x32,'resetOnProcessingTimeAverageMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1a5)][_0x214696(0x134)]||0x64}},_0x1d7dff=b(_0x1b84cf),_0x48727a=_0x1d7dff['elapsed'],_0x5593f0=_0x1d7dff[_0x214696(0x171)];function _0x34ed1d(){var _0x1a49de=_0x214696;this[_0x1a49de(0x1b9)]=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this[_0x1a49de(0x1cf)]=/^(0|[1-9][0-9]*)$/,this[_0x1a49de(0x19c)]=/'([^\\\\']|\\\\')*'/,this[_0x1a49de(0x201)]=_0x1b84cf[_0x1a49de(0x224)],this[_0x1a49de(0x162)]=_0x1b84cf['HTMLAllCollection'],this['_getOwnPropertyDescriptor']=Object[_0x1a49de(0x18d)],this[_0x1a49de(0x1f2)]=Object[_0x1a49de(0x21a)],this['_Symbol']=_0x1b84cf[_0x1a49de(0x157)],this['_regExpToString']=RegExp[_0x1a49de(0x220)]['toString'],this[_0x1a49de(0x221)]=Date[_0x1a49de(0x220)][_0x1a49de(0x19a)];}_0x34ed1d[_0x214696(0x220)][_0x214696(0x17a)]=function(_0x4ed169,_0x7dca5e,_0x1ea1e7,_0x4ca839){var _0x5819cb=_0x214696,_0x2fffed=this,_0xd92b7e=_0x1ea1e7['autoExpand'];function _0x5f2c45(_0x5e761f,_0x4e1bc2,_0x2961a8){var _0x1114dc=_0x5cf7;_0x4e1bc2[_0x1114dc(0x203)]='unknown',_0x4e1bc2[_0x1114dc(0x1fb)]=_0x5e761f['message'],_0x552ab6=_0x2961a8[_0x1114dc(0x167)][_0x1114dc(0x146)],_0x2961a8[_0x1114dc(0x167)]['current']=_0x4e1bc2,_0x2fffed[_0x1114dc(0x1e7)](_0x4e1bc2,_0x2961a8);}let _0x238fcb,_0x5ae890,_0x16e6f7=_0x1b84cf[_0x5819cb(0x206)];_0x1b84cf[_0x5819cb(0x206)]=!0x0,_0x1b84cf[_0x5819cb(0x1cd)]&&(_0x238fcb=_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)],_0x5ae890=_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1f8)],_0x238fcb&&(_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)]=function(){}),_0x5ae890&&(_0x1b84cf['console'][_0x5819cb(0x1f8)]=function(){}));try{try{_0x1ea1e7['level']++,_0x1ea1e7[_0x5819cb(0x163)]&&_0x1ea1e7[_0x5819cb(0x1a4)][_0x5819cb(0x16e)](_0x7dca5e);var _0x16cf4c,_0x36291a,_0x424803,_0x54ac07,_0xd48a44=[],_0x4c8309=[],_0x1661dc,_0x24a5e8=this[_0x5819cb(0x147)](_0x7dca5e),_0x2d0e3c=_0x24a5e8===_0x5819cb(0x1b2),_0x5193fe=!0x1,_0x23c775=_0x24a5e8===_0x5819cb(0x140),_0x6e364c=this[_0x5819cb(0x229)](_0x24a5e8),_0x527786=this['_isPrimitiveWrapperType'](_0x24a5e8),_0x236245=_0x6e364c||_0x527786,_0x2e2de3={},_0x2236a3=0x0,_0x18b840=!0x1,_0x552ab6,_0x5056dd=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x1ea1e7[_0x5819cb(0x21e)]){if(_0x2d0e3c){if(_0x36291a=_0x7dca5e[_0x5819cb(0x153)],_0x36291a>_0x1ea1e7[_0x5819cb(0x145)]){for(_0x424803=0x0,_0x54ac07=_0x1ea1e7[_0x5819cb(0x145)],_0x16cf4c=_0x424803;_0x16cf4c<_0x54ac07;_0x16cf4c++)_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x1f4)](_0xd48a44,_0x7dca5e,_0x24a5e8,_0x16cf4c,_0x1ea1e7));_0x4ed169[_0x5819cb(0x20f)]=!0x0;}else{for(_0x424803=0x0,_0x54ac07=_0x36291a,_0x16cf4c=_0x424803;_0x16cf4c<_0x54ac07;_0x16cf4c++)_0x4c8309['push'](_0x2fffed[_0x5819cb(0x1f4)](_0xd48a44,_0x7dca5e,_0x24a5e8,_0x16cf4c,_0x1ea1e7));}_0x1ea1e7[_0x5819cb(0x148)]+=_0x4c8309[_0x5819cb(0x153)];}if(!(_0x24a5e8===_0x5819cb(0x1f3)||_0x24a5e8===_0x5819cb(0x224))&&!_0x6e364c&&_0x24a5e8!==_0x5819cb(0x12e)&&_0x24a5e8!==_0x5819cb(0x1c9)&&_0x24a5e8!==_0x5819cb(0x22f)){var _0x260439=_0x4ca839[_0x5819cb(0x210)]||_0x1ea1e7[_0x5819cb(0x210)];if(this['_isSet'](_0x7dca5e)?(_0x16cf4c=0x0,_0x7dca5e['forEach'](function(_0x3545fe){var _0x4f7e9a=_0x5819cb;if(_0x2236a3++,_0x1ea1e7[_0x4f7e9a(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;return;}if(!_0x1ea1e7[_0x4f7e9a(0x14a)]&&_0x1ea1e7[_0x4f7e9a(0x163)]&&_0x1ea1e7[_0x4f7e9a(0x148)]>_0x1ea1e7[_0x4f7e9a(0x1d4)]){_0x18b840=!0x0;return;}_0x4c8309[_0x4f7e9a(0x16e)](_0x2fffed[_0x4f7e9a(0x1f4)](_0xd48a44,_0x7dca5e,'Set',_0x16cf4c++,_0x1ea1e7,function(_0x28ca76){return function(){return _0x28ca76;};}(_0x3545fe)));})):this[_0x5819cb(0x14c)](_0x7dca5e)&&_0x7dca5e[_0x5819cb(0x217)](function(_0x430279,_0xddf0da){var _0x3b56da=_0x5819cb;if(_0x2236a3++,_0x1ea1e7[_0x3b56da(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;return;}if(!_0x1ea1e7['isExpressionToEvaluate']&&_0x1ea1e7[_0x3b56da(0x163)]&&_0x1ea1e7[_0x3b56da(0x148)]>_0x1ea1e7[_0x3b56da(0x1d4)]){_0x18b840=!0x0;return;}var _0x352a13=_0xddf0da[_0x3b56da(0x19a)]();_0x352a13[_0x3b56da(0x153)]>0x64&&(_0x352a13=_0x352a13['slice'](0x0,0x64)+'...'),_0x4c8309[_0x3b56da(0x16e)](_0x2fffed[_0x3b56da(0x1f4)](_0xd48a44,_0x7dca5e,'Map',_0x352a13,_0x1ea1e7,function(_0x1916ea){return function(){return _0x1916ea;};}(_0x430279)));}),!_0x5193fe){try{for(_0x1661dc in _0x7dca5e)if(!(_0x2d0e3c&&_0x5056dd[_0x5819cb(0x1b6)](_0x1661dc))&&!this[_0x5819cb(0x14e)](_0x7dca5e,_0x1661dc,_0x1ea1e7)){if(_0x2236a3++,_0x1ea1e7[_0x5819cb(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;break;}if(!_0x1ea1e7[_0x5819cb(0x14a)]&&_0x1ea1e7[_0x5819cb(0x163)]&&_0x1ea1e7[_0x5819cb(0x148)]>_0x1ea1e7[_0x5819cb(0x1d4)]){_0x18b840=!0x0;break;}_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x172)](_0xd48a44,_0x2e2de3,_0x7dca5e,_0x24a5e8,_0x1661dc,_0x1ea1e7));}}catch{}if(_0x2e2de3['_p_length']=!0x0,_0x23c775&&(_0x2e2de3[_0x5819cb(0x22d)]=!0x0),!_0x18b840){var _0x57a7fe=[][_0x5819cb(0x17f)](this[_0x5819cb(0x1f2)](_0x7dca5e))[_0x5819cb(0x17f)](this['_getOwnPropertySymbols'](_0x7dca5e));for(_0x16cf4c=0x0,_0x36291a=_0x57a7fe[_0x5819cb(0x153)];_0x16cf4c<_0x36291a;_0x16cf4c++)if(_0x1661dc=_0x57a7fe[_0x16cf4c],!(_0x2d0e3c&&_0x5056dd['test'](_0x1661dc[_0x5819cb(0x19a)]()))&&!this['_blacklistedProperty'](_0x7dca5e,_0x1661dc,_0x1ea1e7)&&!_0x2e2de3[typeof _0x1661dc!='symbol'?_0x5819cb(0x137)+_0x1661dc[_0x5819cb(0x19a)]():_0x1661dc]){if(_0x2236a3++,_0x1ea1e7['autoExpandPropertyCount']++,_0x2236a3>_0x260439){_0x18b840=!0x0;break;}if(!_0x1ea1e7['isExpressionToEvaluate']&&_0x1ea1e7['autoExpand']&&_0x1ea1e7[_0x5819cb(0x148)]>_0x1ea1e7[_0x5819cb(0x1d4)]){_0x18b840=!0x0;break;}_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x172)](_0xd48a44,_0x2e2de3,_0x7dca5e,_0x24a5e8,_0x1661dc,_0x1ea1e7));}}}}}if(_0x4ed169['type']=_0x24a5e8,_0x236245?(_0x4ed169[_0x5819cb(0x1e8)]=_0x7dca5e[_0x5819cb(0x1c5)](),this[_0x5819cb(0x1ca)](_0x24a5e8,_0x4ed169,_0x1ea1e7,_0x4ca839)):_0x24a5e8===_0x5819cb(0x1f0)?_0x4ed169['value']=this[_0x5819cb(0x221)][_0x5819cb(0x16f)](_0x7dca5e):_0x24a5e8===_0x5819cb(0x22f)?_0x4ed169[_0x5819cb(0x1e8)]=_0x7dca5e[_0x5819cb(0x19a)]():_0x24a5e8===_0x5819cb(0x15a)?_0x4ed169['value']=this[_0x5819cb(0x1e6)][_0x5819cb(0x16f)](_0x7dca5e):_0x24a5e8===_0x5819cb(0x1ec)&&this[_0x5819cb(0x20d)]?_0x4ed169[_0x5819cb(0x1e8)]=this['_Symbol'][_0x5819cb(0x220)][_0x5819cb(0x19a)][_0x5819cb(0x16f)](_0x7dca5e):!_0x1ea1e7['depth']&&!(_0x24a5e8==='null'||_0x24a5e8===_0x5819cb(0x224))&&(delete _0x4ed169[_0x5819cb(0x1e8)],_0x4ed169[_0x5819cb(0x182)]=!0x0),_0x18b840&&(_0x4ed169[_0x5819cb(0x195)]=!0x0),_0x552ab6=_0x1ea1e7[_0x5819cb(0x167)][_0x5819cb(0x146)],_0x1ea1e7['node'][_0x5819cb(0x146)]=_0x4ed169,this['_treeNodePropertiesBeforeFullValue'](_0x4ed169,_0x1ea1e7),_0x4c8309['length']){for(_0x16cf4c=0x0,_0x36291a=_0x4c8309[_0x5819cb(0x153)];_0x16cf4c<_0x36291a;_0x16cf4c++)_0x4c8309[_0x16cf4c](_0x16cf4c);}_0xd48a44[_0x5819cb(0x153)]&&(_0x4ed169['props']=_0xd48a44);}catch(_0xeed0f8){_0x5f2c45(_0xeed0f8,_0x4ed169,_0x1ea1e7);}this[_0x5819cb(0x141)](_0x7dca5e,_0x4ed169),this['_treeNodePropertiesAfterFullValue'](_0x4ed169,_0x1ea1e7),_0x1ea1e7[_0x5819cb(0x167)]['current']=_0x552ab6,_0x1ea1e7[_0x5819cb(0x207)]--,_0x1ea1e7[_0x5819cb(0x163)]=_0xd92b7e,_0x1ea1e7['autoExpand']&&_0x1ea1e7['autoExpandPreviousObjects'][_0x5819cb(0x1ff)]();}finally{_0x238fcb&&(_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)]=_0x238fcb),_0x5ae890&&(_0x1b84cf['console'][_0x5819cb(0x1f8)]=_0x5ae890),_0x1b84cf[_0x5819cb(0x206)]=_0x16e6f7;}return _0x4ed169;},_0x34ed1d[_0x214696(0x220)]['_getOwnPropertySymbols']=function(_0x4596fa){var _0x5925e1=_0x214696;return Object[_0x5925e1(0x196)]?Object['getOwnPropertySymbols'](_0x4596fa):[];},_0x34ed1d[_0x214696(0x220)][_0x214696(0x204)]=function(_0x92d40f){var _0x1ac919=_0x214696;return!!(_0x92d40f&&_0x1b84cf['Set']&&this[_0x1ac919(0x22e)](_0x92d40f)===_0x1ac919(0x12d)&&_0x92d40f[_0x1ac919(0x217)]);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x14e)]=function(_0x763159,_0x18e9ad,_0xd5905d){var _0x27605f=_0x214696;if(!_0xd5905d[_0x27605f(0x194)]){let _0x5a0af9=this[_0x27605f(0x138)](_0x763159,_0x18e9ad);if(_0x5a0af9&&_0x5a0af9['get'])return!0x0;}return _0xd5905d['noFunctions']?typeof _0x763159[_0x18e9ad]==_0x27605f(0x140):!0x1;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x147)]=function(_0x5f197d){var _0x3b9da1=_0x214696,_0x254abb='';return _0x254abb=typeof _0x5f197d,_0x254abb===_0x3b9da1(0x164)?this['_objectToString'](_0x5f197d)===_0x3b9da1(0x227)?_0x254abb=_0x3b9da1(0x1b2):this['_objectToString'](_0x5f197d)===_0x3b9da1(0x15c)?_0x254abb=_0x3b9da1(0x1f0):this[_0x3b9da1(0x22e)](_0x5f197d)===_0x3b9da1(0x21b)?_0x254abb=_0x3b9da1(0x22f):_0x5f197d===null?_0x254abb=_0x3b9da1(0x1f3):_0x5f197d['constructor']&&(_0x254abb=_0x5f197d[_0x3b9da1(0x12c)][_0x3b9da1(0x185)]||_0x254abb):_0x254abb===_0x3b9da1(0x224)&&this[_0x3b9da1(0x162)]&&_0x5f197d instanceof this[_0x3b9da1(0x162)]&&(_0x254abb=_0x3b9da1(0x1a7)),_0x254abb;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x22e)]=function(_0x4b3483){var _0x59323a=_0x214696;return Object['prototype'][_0x59323a(0x19a)][_0x59323a(0x16f)](_0x4b3483);},_0x34ed1d['prototype'][_0x214696(0x229)]=function(_0x3f12cc){var _0x14181c=_0x214696;return _0x3f12cc==='boolean'||_0x3f12cc==='string'||_0x3f12cc===_0x14181c(0x1ee);},_0x34ed1d['prototype'][_0x214696(0x1fd)]=function(_0x24d083){var _0x824253=_0x214696;return _0x24d083===_0x824253(0x19e)||_0x24d083===_0x824253(0x12e)||_0x24d083===_0x824253(0x1bf);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1f4)]=function(_0x52c9ee,_0x3dbfa6,_0x54d057,_0x695d62,_0x1e5016,_0x5936ab){var _0x3e21d7=this;return function(_0x59ef4f){var _0x27ad85=_0x5cf7,_0x20a41f=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x146)],_0x40b5f5=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x15e)],_0x4b6f6b=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x135)];_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x135)]=_0x20a41f,_0x1e5016['node'][_0x27ad85(0x15e)]=typeof _0x695d62==_0x27ad85(0x1ee)?_0x695d62:_0x59ef4f,_0x52c9ee[_0x27ad85(0x16e)](_0x3e21d7['_property'](_0x3dbfa6,_0x54d057,_0x695d62,_0x1e5016,_0x5936ab)),_0x1e5016[_0x27ad85(0x167)]['parent']=_0x4b6f6b,_0x1e5016[_0x27ad85(0x167)]['index']=_0x40b5f5;};},_0x34ed1d[_0x214696(0x220)][_0x214696(0x172)]=function(_0xff3dff,_0x328e71,_0x95c09a,_0x4ef89f,_0x5bbcff,_0xedb075,_0x2f75dd){var _0x33a8a3=_0x214696,_0x5283e9=this;return _0x328e71[typeof _0x5bbcff!=_0x33a8a3(0x1ec)?_0x33a8a3(0x137)+_0x5bbcff[_0x33a8a3(0x19a)]():_0x5bbcff]=!0x0,function(_0x811f2b){var _0x1ebac6=_0x33a8a3,_0x5659b7=_0xedb075['node'][_0x1ebac6(0x146)],_0x5b64e5=_0xedb075['node'][_0x1ebac6(0x15e)],_0x4ebd6c=_0xedb075['node'][_0x1ebac6(0x135)];_0xedb075[_0x1ebac6(0x167)]['parent']=_0x5659b7,_0xedb075[_0x1ebac6(0x167)][_0x1ebac6(0x15e)]=_0x811f2b,_0xff3dff[_0x1ebac6(0x16e)](_0x5283e9['_property'](_0x95c09a,_0x4ef89f,_0x5bbcff,_0xedb075,_0x2f75dd)),_0xedb075[_0x1ebac6(0x167)]['parent']=_0x4ebd6c,_0xedb075[_0x1ebac6(0x167)][_0x1ebac6(0x15e)]=_0x5b64e5;};},_0x34ed1d[_0x214696(0x220)]['_property']=function(_0x18b315,_0x3918ec,_0x5dfa18,_0x5319c6,_0x2d8fa5){var _0x53ed2c=_0x214696,_0x379c68=this;_0x2d8fa5||(_0x2d8fa5=function(_0x3ca008,_0x4b4854){return _0x3ca008[_0x4b4854];});var _0x3d7ff1=_0x5dfa18[_0x53ed2c(0x19a)](),_0x30d254=_0x5319c6['expressionsToEvaluate']||{},_0x155442=_0x5319c6[_0x53ed2c(0x21e)],_0x554fd1=_0x5319c6[_0x53ed2c(0x14a)];try{var _0x3237a0=this[_0x53ed2c(0x14c)](_0x18b315),_0x4e6244=_0x3d7ff1;_0x3237a0&&_0x4e6244[0x0]==='\\x27'&&(_0x4e6244=_0x4e6244[_0x53ed2c(0x197)](0x1,_0x4e6244[_0x53ed2c(0x153)]-0x2));var _0x30807e=_0x5319c6[_0x53ed2c(0x17c)]=_0x30d254[_0x53ed2c(0x137)+_0x4e6244];_0x30807e&&(_0x5319c6[_0x53ed2c(0x21e)]=_0x5319c6[_0x53ed2c(0x21e)]+0x1),_0x5319c6[_0x53ed2c(0x14a)]=!!_0x30807e;var _0x5e0092=typeof _0x5dfa18==_0x53ed2c(0x1ec),_0x4ca784={'name':_0x5e0092||_0x3237a0?_0x3d7ff1:this[_0x53ed2c(0x228)](_0x3d7ff1)};if(_0x5e0092&&(_0x4ca784['symbol']=!0x0),!(_0x3918ec===_0x53ed2c(0x1b2)||_0x3918ec==='Error')){var _0x509ba0=this['_getOwnPropertyDescriptor'](_0x18b315,_0x5dfa18);if(_0x509ba0&&(_0x509ba0['set']&&(_0x4ca784[_0x53ed2c(0x223)]=!0x0),_0x509ba0[_0x53ed2c(0x13c)]&&!_0x30807e&&!_0x5319c6[_0x53ed2c(0x194)]))return _0x4ca784['getter']=!0x0,this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6),_0x4ca784;}var _0x14805b;try{_0x14805b=_0x2d8fa5(_0x18b315,_0x5dfa18);}catch(_0x485eec){return _0x4ca784={'name':_0x3d7ff1,'type':_0x53ed2c(0x170),'error':_0x485eec[_0x53ed2c(0x218)]},this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6),_0x4ca784;}var _0x2cab07=this[_0x53ed2c(0x147)](_0x14805b),_0x5f522f=this[_0x53ed2c(0x229)](_0x2cab07);if(_0x4ca784[_0x53ed2c(0x203)]=_0x2cab07,_0x5f522f)this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6,_0x14805b,function(){var _0x2cdcf4=_0x53ed2c;_0x4ca784[_0x2cdcf4(0x1e8)]=_0x14805b['valueOf'](),!_0x30807e&&_0x379c68['_capIfString'](_0x2cab07,_0x4ca784,_0x5319c6,{});});else{var _0x18c4f5=_0x5319c6[_0x53ed2c(0x163)]&&_0x5319c6[_0x53ed2c(0x207)]<_0x5319c6[_0x53ed2c(0x225)]&&_0x5319c6[_0x53ed2c(0x1a4)]['indexOf'](_0x14805b)<0x0&&_0x2cab07!==_0x53ed2c(0x140)&&_0x5319c6[_0x53ed2c(0x148)]<_0x5319c6[_0x53ed2c(0x1d4)];_0x18c4f5||_0x5319c6[_0x53ed2c(0x207)]<_0x155442||_0x30807e?this[_0x53ed2c(0x17a)](_0x4ca784,_0x14805b,_0x5319c6,_0x30807e||{}):this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6,_0x14805b,function(){var _0x9606df=_0x53ed2c;_0x2cab07==='null'||_0x2cab07===_0x9606df(0x224)||(delete _0x4ca784[_0x9606df(0x1e8)],_0x4ca784[_0x9606df(0x182)]=!0x0);});}return _0x4ca784;}finally{_0x5319c6[_0x53ed2c(0x17c)]=_0x30d254,_0x5319c6['depth']=_0x155442,_0x5319c6[_0x53ed2c(0x14a)]=_0x554fd1;}},_0x34ed1d['prototype'][_0x214696(0x1ca)]=function(_0x26ccea,_0x6e0d21,_0x5a73cf,_0x21a5ae){var _0x38dead=_0x214696,_0x3514b6=_0x21a5ae['strLength']||_0x5a73cf[_0x38dead(0x1a0)];if((_0x26ccea===_0x38dead(0x19f)||_0x26ccea===_0x38dead(0x12e))&&_0x6e0d21['value']){let _0x4b9a3f=_0x6e0d21[_0x38dead(0x1e8)][_0x38dead(0x153)];_0x5a73cf[_0x38dead(0x191)]+=_0x4b9a3f,_0x5a73cf['allStrLength']>_0x5a73cf[_0x38dead(0x13e)]?(_0x6e0d21[_0x38dead(0x182)]='',delete _0x6e0d21[_0x38dead(0x1e8)]):_0x4b9a3f>_0x3514b6&&(_0x6e0d21[_0x38dead(0x182)]=_0x6e0d21[_0x38dead(0x1e8)][_0x38dead(0x197)](0x0,_0x3514b6),delete _0x6e0d21['value']);}},_0x34ed1d[_0x214696(0x220)][_0x214696(0x14c)]=function(_0x4c3992){var _0x2533b1=_0x214696;return!!(_0x4c3992&&_0x1b84cf[_0x2533b1(0x144)]&&this['_objectToString'](_0x4c3992)===_0x2533b1(0x1d8)&&_0x4c3992[_0x2533b1(0x217)]);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x228)]=function(_0x3eeb2c){var _0x20c0cd=_0x214696;if(_0x3eeb2c[_0x20c0cd(0x22b)](/^\\d+$/))return _0x3eeb2c;var _0x387e31;try{_0x387e31=JSON['stringify'](''+_0x3eeb2c);}catch{_0x387e31='\\x22'+this['_objectToString'](_0x3eeb2c)+'\\x22';}return _0x387e31[_0x20c0cd(0x22b)](/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)?_0x387e31=_0x387e31['substr'](0x1,_0x387e31[_0x20c0cd(0x153)]-0x2):_0x387e31=_0x387e31['replace'](/'/g,'\\x5c\\x27')[_0x20c0cd(0x13a)](/\\\\\"/g,'\\x22')[_0x20c0cd(0x13a)](/(^\"|\"$)/g,'\\x27'),_0x387e31;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x19b)]=function(_0x30b649,_0x4ffe49,_0x5f6329,_0x38e972){var _0x4d8b4d=_0x214696;this['_treeNodePropertiesBeforeFullValue'](_0x30b649,_0x4ffe49),_0x38e972&&_0x38e972(),this[_0x4d8b4d(0x141)](_0x5f6329,_0x30b649),this[_0x4d8b4d(0x1e9)](_0x30b649,_0x4ffe49);},_0x34ed1d[_0x214696(0x220)]['_treeNodePropertiesBeforeFullValue']=function(_0x5576c4,_0x3ebbfb){var _0x4c4b0a=_0x214696;this[_0x4c4b0a(0x1dd)](_0x5576c4,_0x3ebbfb),this['_setNodeQueryPath'](_0x5576c4,_0x3ebbfb),this['_setNodeExpressionPath'](_0x5576c4,_0x3ebbfb),this['_setNodePermissions'](_0x5576c4,_0x3ebbfb);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1dd)]=function(_0x20825e,_0x33577b){},_0x34ed1d['prototype'][_0x214696(0x22c)]=function(_0x25683b,_0x4784b5){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x154)]=function(_0x33bded,_0x1ca65a){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1ea)]=function(_0x5224eb){var _0x1075ea=_0x214696;return _0x5224eb===this[_0x1075ea(0x201)];},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1e9)]=function(_0x3bf243,_0x46d534){var _0x3c71e5=_0x214696;this[_0x3c71e5(0x154)](_0x3bf243,_0x46d534),this['_setNodeExpandableState'](_0x3bf243),_0x46d534[_0x3c71e5(0x1a3)]&&this['_sortProps'](_0x3bf243),this[_0x3c71e5(0x18a)](_0x3bf243,_0x46d534),this[_0x3c71e5(0x1e2)](_0x3bf243,_0x46d534),this[_0x3c71e5(0x1df)](_0x3bf243);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x141)]=function(_0x49892b,_0x2c9fcb){var _0x367b88=_0x214696;try{_0x49892b&&typeof _0x49892b['length']==_0x367b88(0x1ee)&&(_0x2c9fcb[_0x367b88(0x153)]=_0x49892b[_0x367b88(0x153)]);}catch{}if(_0x2c9fcb[_0x367b88(0x203)]==='number'||_0x2c9fcb['type']===_0x367b88(0x1bf)){if(isNaN(_0x2c9fcb[_0x367b88(0x1e8)]))_0x2c9fcb['nan']=!0x0,delete _0x2c9fcb[_0x367b88(0x1e8)];else switch(_0x2c9fcb[_0x367b88(0x1e8)]){case Number[_0x367b88(0x174)]:_0x2c9fcb[_0x367b88(0x17b)]=!0x0,delete _0x2c9fcb[_0x367b88(0x1e8)];break;case Number[_0x367b88(0x1c1)]:_0x2c9fcb[_0x367b88(0x211)]=!0x0,delete _0x2c9fcb['value'];break;case 0x0:this[_0x367b88(0x20b)](_0x2c9fcb[_0x367b88(0x1e8)])&&(_0x2c9fcb[_0x367b88(0x156)]=!0x0);break;}}else _0x2c9fcb[_0x367b88(0x203)]===_0x367b88(0x140)&&typeof _0x49892b['name']==_0x367b88(0x19f)&&_0x49892b[_0x367b88(0x185)]&&_0x2c9fcb[_0x367b88(0x185)]&&_0x49892b[_0x367b88(0x185)]!==_0x2c9fcb[_0x367b88(0x185)]&&(_0x2c9fcb[_0x367b88(0x165)]=_0x49892b[_0x367b88(0x185)]);},_0x34ed1d['prototype'][_0x214696(0x20b)]=function(_0x227af0){return 0x1/_0x227af0===Number['NEGATIVE_INFINITY'];},_0x34ed1d['prototype'][_0x214696(0x222)]=function(_0x27dce3){var _0x331cd8=_0x214696;!_0x27dce3[_0x331cd8(0x210)]||!_0x27dce3[_0x331cd8(0x210)][_0x331cd8(0x153)]||_0x27dce3[_0x331cd8(0x203)]===_0x331cd8(0x1b2)||_0x27dce3['type']===_0x331cd8(0x144)||_0x27dce3[_0x331cd8(0x203)]===_0x331cd8(0x1d7)||_0x27dce3[_0x331cd8(0x210)]['sort'](function(_0x1994d2,_0x317377){var _0x4191d5=_0x331cd8,_0x35525d=_0x1994d2[_0x4191d5(0x185)][_0x4191d5(0x1f9)](),_0x18ffb7=_0x317377[_0x4191d5(0x185)][_0x4191d5(0x1f9)]();return _0x35525d<_0x18ffb7?-0x1:_0x35525d>_0x18ffb7?0x1:0x0;});},_0x34ed1d[_0x214696(0x220)][_0x214696(0x18a)]=function(_0x5a52d9,_0x252462){var _0x1838f0=_0x214696;if(!(_0x252462[_0x1838f0(0x179)]||!_0x5a52d9['props']||!_0x5a52d9[_0x1838f0(0x210)]['length'])){for(var _0x25c031=[],_0x4fa983=[],_0x345970=0x0,_0x29561b=_0x5a52d9[_0x1838f0(0x210)][_0x1838f0(0x153)];_0x345970<_0x29561b;_0x345970++){var _0x18ce7d=_0x5a52d9[_0x1838f0(0x210)][_0x345970];_0x18ce7d[_0x1838f0(0x203)]==='function'?_0x25c031['push'](_0x18ce7d):_0x4fa983[_0x1838f0(0x16e)](_0x18ce7d);}if(!(!_0x4fa983[_0x1838f0(0x153)]||_0x25c031['length']<=0x1)){_0x5a52d9[_0x1838f0(0x210)]=_0x4fa983;var _0x1e2b92={'functionsNode':!0x0,'props':_0x25c031};this['_setNodeId'](_0x1e2b92,_0x252462),this[_0x1838f0(0x154)](_0x1e2b92,_0x252462),this['_setNodeExpandableState'](_0x1e2b92),this[_0x1838f0(0x184)](_0x1e2b92,_0x252462),_0x1e2b92['id']+='\\x20f',_0x5a52d9[_0x1838f0(0x210)]['unshift'](_0x1e2b92);}}},_0x34ed1d['prototype'][_0x214696(0x1e2)]=function(_0x34b99c,_0x45eb99){},_0x34ed1d[_0x214696(0x220)]['_setNodeExpandableState']=function(_0x5b55c3){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x180)]=function(_0x58cc5e){var _0xf4ba55=_0x214696;return Array[_0xf4ba55(0x1f1)](_0x58cc5e)||typeof _0x58cc5e==_0xf4ba55(0x164)&&this[_0xf4ba55(0x22e)](_0x58cc5e)===_0xf4ba55(0x227);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x184)]=function(_0x29d75c,_0xe2d021){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1df)]=function(_0xa023c9){var _0x589591=_0x214696;delete _0xa023c9[_0x589591(0x12f)],delete _0xa023c9[_0x589591(0x152)],delete _0xa023c9[_0x589591(0x193)];},_0x34ed1d['prototype'][_0x214696(0x1db)]=function(_0x2562a9,_0x2d27a2){};let _0x28f581=new _0x34ed1d(),_0x502a66={'props':_0x513131[_0x214696(0x1b3)][_0x214696(0x210)]||0x64,'elements':_0x513131[_0x214696(0x1b3)][_0x214696(0x145)]||0x64,'strLength':_0x513131[_0x214696(0x1b3)]['strLength']||0x400*0x32,'totalStrLength':_0x513131[_0x214696(0x1b3)][_0x214696(0x13e)]||0x400*0x32,'autoExpandLimit':_0x513131[_0x214696(0x1b3)]['autoExpandLimit']||0x1388,'autoExpandMaxDepth':_0x513131[_0x214696(0x1b3)][_0x214696(0x225)]||0xa},_0x13ef23={'props':_0x513131[_0x214696(0x230)][_0x214696(0x210)]||0x5,'elements':_0x513131['reducedLimits'][_0x214696(0x145)]||0x5,'strLength':_0x513131['reducedLimits'][_0x214696(0x1a0)]||0x100,'totalStrLength':_0x513131[_0x214696(0x230)]['totalStrLength']||0x100*0x3,'autoExpandLimit':_0x513131[_0x214696(0x230)][_0x214696(0x1d4)]||0x1e,'autoExpandMaxDepth':_0x513131['reducedLimits']['autoExpandMaxDepth']||0x2};if(_0x475afa){let _0x29800f=_0x28f581[_0x214696(0x17a)][_0x214696(0x19d)](_0x28f581);_0x28f581[_0x214696(0x17a)]=function(_0x10fd5b,_0x3e4059,_0x54184b,_0x152e04){return _0x29800f(_0x10fd5b,_0x475afa(_0x3e4059),_0x54184b,_0x152e04);};}function _0x2b3bff(_0x12d8f0,_0x4cf31e,_0x573668,_0x6b9276,_0x430332,_0x9e1f91){var _0x317b69=_0x214696;let _0x120eeb,_0x5a07b2;try{_0x5a07b2=_0x5593f0(),_0x120eeb=_0x10c330[_0x4cf31e],!_0x120eeb||_0x5a07b2-_0x120eeb['ts']>_0x5f34e7['perLogpoint'][_0x317b69(0x14b)]&&_0x120eeb[_0x317b69(0x215)]&&_0x120eeb[_0x317b69(0x1c8)]/_0x120eeb[_0x317b69(0x215)]<_0x5f34e7[_0x317b69(0x1d0)][_0x317b69(0x134)]?(_0x10c330[_0x4cf31e]=_0x120eeb={'count':0x0,'time':0x0,'ts':_0x5a07b2},_0x10c330[_0x317b69(0x1d6)]={}):_0x5a07b2-_0x10c330['hits']['ts']>_0x5f34e7[_0x317b69(0x1a5)][_0x317b69(0x14b)]&&_0x10c330[_0x317b69(0x1d6)]['count']&&_0x10c330[_0x317b69(0x1d6)]['time']/_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x215)]<_0x5f34e7['global'][_0x317b69(0x134)]&&(_0x10c330['hits']={});let _0x371293=[],_0x57f51c=_0x120eeb[_0x317b69(0x1da)]||_0x10c330[_0x317b69(0x1d6)]['reduceLimits']?_0x13ef23:_0x502a66,_0x1bcf5c=_0x91ed01=>{var _0x1aa6af=_0x317b69;let _0xc556ae={};return _0xc556ae[_0x1aa6af(0x210)]=_0x91ed01['props'],_0xc556ae[_0x1aa6af(0x145)]=_0x91ed01[_0x1aa6af(0x145)],_0xc556ae['strLength']=_0x91ed01[_0x1aa6af(0x1a0)],_0xc556ae[_0x1aa6af(0x13e)]=_0x91ed01[_0x1aa6af(0x13e)],_0xc556ae['autoExpandLimit']=_0x91ed01[_0x1aa6af(0x1d4)],_0xc556ae[_0x1aa6af(0x225)]=_0x91ed01[_0x1aa6af(0x225)],_0xc556ae['sortProps']=!0x1,_0xc556ae['noFunctions']=!_0x22cb75,_0xc556ae[_0x1aa6af(0x21e)]=0x1,_0xc556ae[_0x1aa6af(0x207)]=0x0,_0xc556ae['expId']=_0x1aa6af(0x1c3),_0xc556ae['rootExpression']='root_exp',_0xc556ae[_0x1aa6af(0x163)]=!0x0,_0xc556ae['autoExpandPreviousObjects']=[],_0xc556ae[_0x1aa6af(0x148)]=0x0,_0xc556ae[_0x1aa6af(0x194)]=_0x513131['resolveGetters'],_0xc556ae[_0x1aa6af(0x191)]=0x0,_0xc556ae[_0x1aa6af(0x167)]={'current':void 0x0,'parent':void 0x0,'index':0x0},_0xc556ae;};for(var _0x1b0099=0x0;_0x1b0099<_0x430332[_0x317b69(0x153)];_0x1b0099++)_0x371293['push'](_0x28f581[_0x317b69(0x17a)]({'timeNode':_0x12d8f0===_0x317b69(0x1c8)||void 0x0},_0x430332[_0x1b0099],_0x1bcf5c(_0x57f51c),{}));if(_0x12d8f0===_0x317b69(0x160)||_0x12d8f0===_0x317b69(0x1fb)){let _0x2d5716=Error[_0x317b69(0x18c)];try{Error[_0x317b69(0x18c)]=0x1/0x0,_0x371293[_0x317b69(0x16e)](_0x28f581['serialize']({'stackNode':!0x0},new Error()[_0x317b69(0x21f)],_0x1bcf5c(_0x57f51c),{'strLength':0x1/0x0}));}finally{Error[_0x317b69(0x18c)]=_0x2d5716;}}return{'method':_0x317b69(0x169),'version':_0x425029,'args':[{'ts':_0x573668,'session':_0x6b9276,'args':_0x371293,'id':_0x4cf31e,'context':_0x9e1f91}]};}catch(_0x40679d){return{'method':_0x317b69(0x169),'version':_0x425029,'args':[{'ts':_0x573668,'session':_0x6b9276,'args':[{'type':_0x317b69(0x170),'error':_0x40679d&&_0x40679d[_0x317b69(0x218)]}],'id':_0x4cf31e,'context':_0x9e1f91}]};}finally{try{if(_0x120eeb&&_0x5a07b2){let _0x27a114=_0x5593f0();_0x120eeb['count']++,_0x120eeb[_0x317b69(0x1c8)]+=_0x48727a(_0x5a07b2,_0x27a114),_0x120eeb['ts']=_0x27a114,_0x10c330['hits'][_0x317b69(0x215)]++,_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x1c8)]+=_0x48727a(_0x5a07b2,_0x27a114),_0x10c330[_0x317b69(0x1d6)]['ts']=_0x27a114,(_0x120eeb['count']>_0x5f34e7['perLogpoint'][_0x317b69(0x1ce)]||_0x120eeb['time']>_0x5f34e7['perLogpoint']['reduceOnAccumulatedProcessingTimeMs'])&&(_0x120eeb[_0x317b69(0x1da)]=!0x0),(_0x10c330['hits']['count']>_0x5f34e7['global'][_0x317b69(0x1ce)]||_0x10c330['hits'][_0x317b69(0x1c8)]>_0x5f34e7[_0x317b69(0x1a5)][_0x317b69(0x1aa)])&&(_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x1da)]=!0x0);}}catch{}}}return _0x2b3bff;}function G(_0x434b91){var _0x257403=_0x27f4ea;if(_0x434b91&&typeof _0x434b91=='object'&&_0x434b91[_0x257403(0x12c)])switch(_0x434b91['constructor']['name']){case _0x257403(0x1c0):return _0x434b91[_0x257403(0x1bc)](Symbol[_0x257403(0x15f)])?Promise[_0x257403(0x1d2)]():_0x434b91;case _0x257403(0x15d):return Promise[_0x257403(0x1d2)]();}return _0x434b91;}((_0xb12d58,_0x1c1888,_0x4be2b0,_0x6defa5,_0x3edf33,_0x39ddf7,_0x2e212d,_0x35551d,_0x1eb46e,_0x4e3e05,_0x219815,_0x40c102)=>{var _0x47ee38=_0x27f4ea;if(_0xb12d58[_0x47ee38(0x166)])return _0xb12d58[_0x47ee38(0x166)];let _0x41d96a={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}};if(!X(_0xb12d58,_0x35551d,_0x3edf33))return _0xb12d58[_0x47ee38(0x166)]=_0x41d96a,_0xb12d58[_0x47ee38(0x166)];let _0x5cf254=b(_0xb12d58),_0x211417=_0x5cf254['elapsed'],_0x120ed8=_0x5cf254[_0x47ee38(0x171)],_0x4d12ad=_0x5cf254[_0x47ee38(0x1f6)],_0x40a67f={'hits':{},'ts':{}},_0xbddbd0=J(_0xb12d58,_0x1eb46e,_0x40a67f,_0x39ddf7,_0x40c102,_0x3edf33===_0x47ee38(0x177)?G:void 0x0),_0x391c84=(_0x3a42bb,_0x4e5be3,_0x29339e,_0x59a5b4,_0x4e05b6,_0xeaaf9e)=>{var _0x5a78e6=_0x47ee38;let _0x2a987d=_0xb12d58[_0x5a78e6(0x166)];try{return _0xb12d58[_0x5a78e6(0x166)]=_0x41d96a,_0xbddbd0(_0x3a42bb,_0x4e5be3,_0x29339e,_0x59a5b4,_0x4e05b6,_0xeaaf9e);}finally{_0xb12d58[_0x5a78e6(0x166)]=_0x2a987d;}},_0x486373=_0x41f49c=>{_0x40a67f['ts'][_0x41f49c]=_0x120ed8();},_0x375f8a=(_0x586b6b,_0x281c49)=>{var _0x42f9bc=_0x47ee38;let _0x1de228=_0x40a67f['ts'][_0x281c49];if(delete _0x40a67f['ts'][_0x281c49],_0x1de228){let _0x3d4aab=_0x211417(_0x1de228,_0x120ed8());_0x3b4188(_0x391c84(_0x42f9bc(0x1c8),_0x586b6b,_0x4d12ad(),_0x39ea0c,[_0x3d4aab],_0x281c49));}},_0x36a5c5=_0x538015=>{var _0x2867b1=_0x47ee38,_0x3d1b72;return _0x3edf33===_0x2867b1(0x177)&&_0xb12d58[_0x2867b1(0x15b)]&&((_0x3d1b72=_0x538015==null?void 0x0:_0x538015[_0x2867b1(0x1bb)])==null?void 0x0:_0x3d1b72['length'])&&(_0x538015[_0x2867b1(0x1bb)][0x0]['origin']=_0xb12d58[_0x2867b1(0x15b)]),_0x538015;};_0xb12d58[_0x47ee38(0x166)]={'consoleLog':(_0x51ed74,_0xe11fc)=>{var _0x38ecd1=_0x47ee38;_0xb12d58[_0x38ecd1(0x1cd)]['log'][_0x38ecd1(0x185)]!==_0x38ecd1(0x158)&&_0x3b4188(_0x391c84(_0x38ecd1(0x169),_0x51ed74,_0x4d12ad(),_0x39ea0c,_0xe11fc));},'consoleTrace':(_0x137d17,_0x1d312d)=>{var _0x51cf82=_0x47ee38,_0x5b8a58,_0x41a828;_0xb12d58[_0x51cf82(0x1cd)][_0x51cf82(0x169)][_0x51cf82(0x185)]!==_0x51cf82(0x16d)&&((_0x41a828=(_0x5b8a58=_0xb12d58['process'])==null?void 0x0:_0x5b8a58[_0x51cf82(0x16c)])!=null&&_0x41a828['node']&&(_0xb12d58[_0x51cf82(0x155)]=!0x0),_0x3b4188(_0x36a5c5(_0x391c84(_0x51cf82(0x160),_0x137d17,_0x4d12ad(),_0x39ea0c,_0x1d312d))));},'consoleError':(_0x1f78e4,_0x2b1ba8)=>{var _0x13a967=_0x47ee38;_0xb12d58[_0x13a967(0x155)]=!0x0,_0x3b4188(_0x36a5c5(_0x391c84(_0x13a967(0x1fb),_0x1f78e4,_0x4d12ad(),_0x39ea0c,_0x2b1ba8)));},'consoleTime':_0x1a9247=>{_0x486373(_0x1a9247);},'consoleTimeEnd':(_0x5d368a,_0x200ddf)=>{_0x375f8a(_0x200ddf,_0x5d368a);},'autoLog':(_0x5d21fe,_0x1d28a4)=>{var _0x262f79=_0x47ee38;_0x3b4188(_0x391c84(_0x262f79(0x169),_0x1d28a4,_0x4d12ad(),_0x39ea0c,[_0x5d21fe]));},'autoLogMany':(_0x3c9460,_0x1c3a81)=>{_0x3b4188(_0x391c84('log',_0x3c9460,_0x4d12ad(),_0x39ea0c,_0x1c3a81));},'autoTrace':(_0x1e8e77,_0x45393a)=>{var _0x10935e=_0x47ee38;_0x3b4188(_0x36a5c5(_0x391c84(_0x10935e(0x160),_0x45393a,_0x4d12ad(),_0x39ea0c,[_0x1e8e77])));},'autoTraceMany':(_0x5e24f4,_0x2f9fe6)=>{var _0xfcca09=_0x47ee38;_0x3b4188(_0x36a5c5(_0x391c84(_0xfcca09(0x160),_0x5e24f4,_0x4d12ad(),_0x39ea0c,_0x2f9fe6)));},'autoTime':(_0x5efb2d,_0x485584,_0x2bb811)=>{_0x486373(_0x2bb811);},'autoTimeEnd':(_0x43da21,_0x51b33a,_0x2ed8c7)=>{_0x375f8a(_0x51b33a,_0x2ed8c7);},'coverage':_0x188923=>{var _0x35709e=_0x47ee38;_0x3b4188({'method':_0x35709e(0x1e1),'version':_0x39ddf7,'args':[{'id':_0x188923}]});}};let _0x3b4188=H(_0xb12d58,_0x1c1888,_0x4be2b0,_0x6defa5,_0x3edf33,_0x4e3e05,_0x219815),_0x39ea0c=_0xb12d58[_0x47ee38(0x16b)];return _0xb12d58[_0x47ee38(0x166)];})(globalThis,_0x27f4ea(0x159),'61485',_0x27f4ea(0x1e5),'webpack',_0x27f4ea(0x151),_0x27f4ea(0x1b7),_0x27f4ea(0x1bd),_0x27f4ea(0x1be),'','1',{\"resolveGetters\":false,\"defaultLimits\":{\"props\":100,\"elements\":100,\"strLength\":51200,\"totalStrLength\":51200,\"autoExpandLimit\":5000,\"autoExpandMaxDepth\":10},\"reducedLimits\":{\"props\":5,\"elements\":5,\"strLength\":256,\"totalStrLength\":768,\"autoExpandLimit\":30,\"autoExpandMaxDepth\":2},\"reducePolicy\":{\"perLogpoint\":{\"reduceOnCount\":50,\"reduceOnAccumulatedProcessingTimeMs\":100,\"resetWhenQuietMs\":500,\"resetOnProcessingTimeAverageMs\":100},\"global\":{\"reduceOnCount\":1000,\"reduceOnAccumulatedProcessingTimeMs\":300,\"resetWhenQuietMs\":50,\"resetOnProcessingTimeAverageMs\":100}}});");}catch(e){console.error(e);}};/* istanbul ignore next */function oo_oo(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleLog(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_tr(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleTrace(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_tx(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleError(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_ts(/**@type{any}**/v){try{oo_cm().consoleTime(v);}catch(e){} return v;};/* istanbul ignore next */function oo_te(/**@type{any}**/v, /**@type{any}**/i){try{oo_cm().consoleTimeEnd(v, i);}catch(e){} return v;};/*eslint unicorn/no-abusive-eslint-disable:,eslint-comments/disable-enable-pair:,eslint-comments/no-unlimited-disable:,eslint-comments/no-aggregating-enable:,eslint-comments/no-duplicate-disable:,eslint-comments/no-unused-disable:,eslint-comments/no-unused-enable:,*/</script>
