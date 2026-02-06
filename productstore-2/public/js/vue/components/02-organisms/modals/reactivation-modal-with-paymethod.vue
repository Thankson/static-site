<template>
    <!-- Reactivation form and modal with paymethod currently only for KR -->
    <modal-content
        class="o-reactivationModal"
        width="630px"
        prevent-click-outside-close="true"
        heading-class="o-reactivationModal__heading">

        <template v-slot:before>
            <img
                class="absolute bottom-0 right-0 -z-1"
                :alt="getLocalizationProp('Data.Image.Alt')"
                :src="getLocalizationProp('Data.Image.Url')" />
        </template>

        <template v-slot:heading>
            <!-- No element tag because the <modal>/<modal-content> components render an <h2>. Class is defined on a prop -->
            {{ getLocalizationProp('Data.Heading') }}
        </template>

        <template v-slot:body>
            <p
                class="o-reactivationModal__description" :class="formVisible ? 'mb-25' : ''"
                v-html="getLocalizationProp('Data.Description')">
            </p>
            <div v-if="formVisible" class="o-reactivationModal__form">
                <fieldset
                    v-if="!hidePayMethod"
                    class="mb-25">
                    <legend v-if="showLegend" class="m-formField__label">
                        {{ getLocalizationProp('Labels.PaymentMethodType', 'Payment Method Type') }}
                    </legend>
                    <div class="o-reactivationModal__row">
                        <div v-if="showCardOnfile" class="reactivationModal__radio">
                            <input
                                id="defaultcreditcard"
                                v-model="paymentMethodType"
                                type="radio"
                                name="paymentMethodType"
                                class="a-input -radio"
                                :value="creditCardValue">
                            <label for="defaultcreditcard" class="m-formField__label -radio o-commPrefs__label">
                                <span v-if="defaultCreditCard.CreditCardDescription" class="tracking-tight">{{ defaultCreditCard.CreditCardDescription }} </span>
                                <span v-else-if="defaultCreditCard.AccountNickName" class="tracking-tight">{{ defaultCreditCard.AccountNickName }}</span>
                                <span v-if="defaultCreditCard.LastFourDigitsOfAccount && defaultCreditCard.AccountNickName" v-html="defaultCreditCard.MaskingCondensed"></span>&nbsp;
                                <span v-if="!defaultCreditCard.AccountNickName" v-html="defaultCreditCard.Masking"></span>
                                <span class="tracking-tight">{{ defaultCreditCard.LastFourDigitsOfAccount }}</span>
                            </label>
                        </div>

                        <div v-else class="reactivationModal__radio">
                            <input
                                id="creditcard"
                                v-model="paymentMethodType"
                                type="radio"
                                name="paymentMethodType"
                                class="a-input -radio"
                                :value="creditCardValue"
                            >
                            <label for="creditcard" class="m-formField__label -radio o-commPrefs__label">{{ getLocalizationProp('Labels.DebitCreditCard') }}</label>
                        </div>
                        <div v-if="showVirtualOption" class="reactivationModal__radio">
                            <input
                                id="virtualaccount"
                                v-model="paymentMethodType"
                                type="radio"
                                name="paymentMethodType"
                                class="a-input -radio"
                                :value="virtualAccountValue"
                            >
                            <label for="virtualaccount" class="m-formField__label -radio o-commPrefs__label">{{ getLocalizationProp('Labels.VirtualAccount') }}</label>
                        </div>
                    </div>
                </fieldset>

                <template v-if="!hideCcFields">
                    <div class="mb-25">
                        <label
                            class="m-formField__label"
                            :for="ccNameId">

                            {{ getLocalizationProp('Labels.CardholderName', 'Cardholder Name') }}
                        </label>

                        <v-select
                            :id="ccNameId"
                            :options="ccNames.join(',')"
                            :values="ccNames"
                            :initial="ccNames.length && ccNames[0]"
                            arrow-tailwind-color="gray-120"
                            arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                            select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                            @change="({ value }) => ccName = value" />
                    </div>

                    <div class="mb-25">
                        <label
                            class="m-formField__label"
                            :for="ccNumberId"
                            v-html="getLocalizationProp('Labels.CardNumber', 'Card Number')" />

                        <input-card-number
                            :id="ccNumberId"
                            v-model="ccNumber"
                            auto-complete="off"
                            name="CardNumber"
                            :tailwind-mods="$v.$dirty && $v.ccNumber.$invalid ? '-isInvalid' : ''"
                            value=""
                            :card-options="cardOptions"
                            :max-length="cardMaxLength"
                            :min-length="cardMinLength"
                            :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                            @card-number-error="onCardNumberError" />
                    </div>

                    <div class="flex mb-25">
                        <fieldset class="flex md:w-5_12">
                            <legend class="m-formField__label">
                                {{ getLocalizationProp('Labels.Expiration', 'Expiration') }}
                            </legend>

                            <v-select
                                :options="selectOptionsLabels(expirationMonths)"
                                :values="selectOptionsValues(expirationMonths)"
                                :initial="null"
                                :is-disabled="true"
                                :aria-label="getLocalizationProp('Labels.Month', 'Month')"
                                :class="{ '-isInvalid': $v.$dirty && $v.expirationMonth.$invalid }"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                :select-mod="`-sm-md -rounded -padding-md -bg-transparent w-full mr-5 ${$v.$dirty && $v.expirationMonth.$invalid ? '-error' : ''}`"
                                @change="({ value }) => expirationMonth = value" />

                            <v-select
                                :options="selectOptionsLabels(expirationYears)"
                                :values="selectOptionsValues(expirationYears)"
                                :initial="null"
                                :is-disabled="true"
                                :aria-label="getLocalizationProp('Labels.Year', 'Year')"
                                :class="{ '-isInvalid': $v.$dirty && $v.expirationYear.$invalid && !removeValidationFromCCNumber }"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                :select-mod="`-sm-md -rounded -padding-md -bg-transparent w-full ml-5 ${$v.$dirty && $v.expirationYear.$invalid ? '-error' : ''}`"
                                @change="({ value }) => expirationYear = value" />
                        </fieldset>

                        <div v-if="isJP" class="md:w-1_6 md:ml-10">
                            <label
                                class="m-formField__label"
                                :for="ccCvvId"
                                v-html="getLocalizationProp('CvvLabel', 'CVV')"
                            />

                            <input-basic
                                :id="ccCvvId"
                                ref="ccCvv"
                                v-model="ccCvv"
                                auto-complete="off"
                                name="CVV"
                                :max-length="cvvMaxLength"
                                :min-length="cvvMinLength"
                                :tailwind-mods="$v.ccCvv && $v.ccCvv.$error ? '-isInvalid' : null"
                            />
                        </div>
                    </div>
                </template>

                <CheckboxGroup
                    v-if="!isJP"
                    category-label-mods="text-sm font-medium mb-5"
                    category-mods="o-reactivationModal__checkbox"
                    category-wrapper-mods="ml-40"
                    :checkbox-categories="childCheckboxes"
                    checkbox-error-mods="-error"
                    checkbox-mods="-reactivation"
                    checkbox-wrapper-mods="mb-15"
                    :legend-label="getLocalizationProp('Data.ConsentHeading', 'Customer Agreements')"
                    legend-mods="o-reactivationModal__heading -consent"
                    :parent-label="getLocalizationProp('Data.ConsentDescription')"
                    parent-inner-mods="o-reactivationModal__description -consent"
                    parent-mods="-reactivation mr-0 mb-15"
                    :show-errors="$v.$dirty && $v.isConsent && $v.isConsent.$invalid"
                    @change="onCheckboxGroupChange"
                />

                <CheckboxList
                    v-if="isJP"
                    :checkboxes="checkboxes"
                    checkbox-error-mods="-error"
                    checkbox-mods="-top text-sm font-normal mb-5"
                    :show-errors="$v.$dirty && $v.isConsent && $v.isConsent.$invalid && !removeValidationFromCCNumber"
                    @change="onCheckboxListChange"
                />
            </div>
        </template>

        <template v-slot:footer>
            <v-button
                v-if="!formVisible"
                class="o-reactivationModal__button -reactivation"
                type="button"
                @click="formVisible = true; gtmTrackAction({id: 407}, $event)">

                {{ getLocalizationProp('Labels.ReactivateAccountLabel') }}
            </v-button>

            <div v-if="formVisible" class="o-reactivationModal__wrapper">
                <v-button
                    v-modal-hide
                    class="o-reactivationModal__button -cancelFull mb-10 md:ml-20"
                    type="button"
                    @click="gtmTrackAction({id: 407}, $event)">

                    {{ getLocalizationProp('Labels.NotNowLabel') }}
                </v-button>

                <v-button
                    type="button"
                    class="o-reactivationModal__button -reactivation"
                    :class="{ '-disabled': !isConsent }"
                    :aria-disabled="!isConsent || null"
                    v-on="isConsent ? {
                        click: ($event) => {
                            submit();
                            gtmTrackAction({id: 407}, $event);
                        }
                    } : null">

                    {{ getLocalizationProp('Labels.ReactivateAccountLabel') }}
                </v-button>
                <ul
                    v-if="($v.$dirty && $v.$invalid) || error"
                    class="e-formError__list mt-15"
                    role="alert"
                    aria-live="assertive">

                    <li
                        v-if="error" class="e-formError__item mt-0"
                        v-html="error">

                    </li>

                    <li
                        v-if="$v.ccNumber && $v.ccNumber.$invalid && !hidePayMethod"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('Labels.CardNumberError', 'Card Number field is required') }}
                    </li>

                    <li
                        v-if="$v.expirationMonth && $v.expirationMonth.$invalid && !hidePayMethod"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('Labels.ExpirationMonthError', 'Expiration Month field is required') }}
                    </li>

                    <li
                        v-if="$v.expirationYear && $v.expirationYear.$invalid && !hidePayMethod"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('Labels.ExpirationYearError', 'Expiration Year field is required') }}
                    </li>

                    <li
                        v-if="$v.ccCvv && $v.ccCvv.$invalid && !hidePayMethod"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('CvvRequired', 'CVV field is required') }}
                    </li>

                    <li
                        v-if="$v.isConsent && $v.isConsent.$invalid"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('Labels.error.requiredCheckbox', 'You need to agree to our terms of service before reactivating your account') }}
                    </li>
                </ul>

                <a-loading-spinner :visible="loading" size="sm" />
            </div>
        </template>
    </modal-content>
</template>

<script>
    import reactivationFormWithPaymethodMixin from '../../../mixins/reactivation-form-with-paymethod';

    export default {
        name: 'OReactivationModalWithPaymethod',
        mixins: [ reactivationFormWithPaymethodMixin ],
        data() {
            return {
                formVisible: false
            };
        },
        async mounted () {
            this.gtmTrackActionData(this.gtmData);
        }
    };
</script>
