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
                    console.log('[CommissionDepositForm] HandleSubmit - Exception:');
                    console.log(e);
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
</script>
