<template>
    <div class="m-payForm">
        <!-- Card Brands (only for add mode) -->
        <div v-if="showCardBrands && cardOptions && cardOptions.length" class="m-payForm__cards flex-wrap to-md:pb-20">
            <p class="m-payForm__title to-md:w-full" v-html="getLabels('Labels.Card.Accepts', cardTitle)"></p>
            <ul class="m-payForm__list to-md:w-full to-md:ml-0">
                <li v-for="(card, index) in cardOptions" :key="index" class="m-payForm__item">
                    <img
                        :alt="card.Alt ? card.Alt : null"
                        :src="card.Src ? card.Src : null"
                        class="mr-10 w-36 h-auto inline-block align-top self-start">
                </li>
            </ul>
        </div>
        <div :class="{'m-payForm__rowGroup -half': isRiverbendSubscription && !isEditing}">
            <div v-if="showCardHolderName" class="m-payForm__row">
                <!-- Cardholder Field (only for add mode) -->
                <div v-if="!isEditing" :class="{'m-payForm__nameContainer': isMX}">
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label to-md:text-xs"
                            :for="cardHolder.Id"
                            v-html="getLabels('Labels.Card.CardholderName', cardHolder.Label)">
                        </label>

                        <v-input
                            v-if="!isKR && !isJP"
                            :id="cardHolder.Id"
                            ref="cardHolder"
                            v-model="cardHolderValue"
                            auto-complete="off"
                            :name="cardHolder.Name"
                            :max-length="cardHolder.MaxLength"
                            :min-length="cardHolder.MinLength"
                            :placeholder="enableNameValidateFlag?getLabels('Labels.Card.CardholderNamePlaceholder', '') : cardHolder.Placeholder"
                            :tailwind-mods="$v.cardHolderValue.$error ? '-isInvalid' : null"
                            :aria-describedby="$v.cardHolderValue.$error ? 'cardholdername-error' : false"
                            :value="getInitialValue(cardHolder, 'CardHolderName', cardHolderValue)"
                            class="to-md:text-sm"
                            @input="updateModel('cardHolderValue', enableNameValidateFlag)"
                            @blur="handleBlur('cardHolderValue')">
                        </v-input>

                        <v-select
                            v-else
                            :id="cardHolder.id"
                            ref="cardHolder"
                            vmodel="cardHolderValue"
                            :options="selectOptionsLabels(cardHolderNameOptions)"
                            :values="selectOptionsValues(cardHolderNameOptions)"
                            :initial="getInitialValue(cardHolder, 'CardHolderName', cardHolderValue) || selectOptionsValues(cardHolderNameOptions)[0] || ''"
                            :name="cardHolder.Name"
                            :aria-label="getLabels('Labels.Card.CardholderName', cardHolder.Label)"
                            :select-mod="cardHolder.SelectMod"
                            select-element-mod="py-10 px-15"
                            :arrow-direction="cardHolder.Arrow.Direction || null"
                            :arrow-size="cardHolder.Arrow.Size || null"
                            :arrow-tailwind-color="cardHolder.Arrow.TailwindColor || null"
                            :arrow-other-mods="cardHolder.Arrow.OtherMods || null"
                            @change="updateModel"
                            @blur="handleBlur('cardHolderValue')"
                        />
                        <div
                            v-if="$v.cardHolderValue.$error" class="e-formError__item"
                            :class="{ '-rbAddress': isRiverbendSubscription }"
                        >
                            <p v-if="!$v.cardHolderValue.required">
                                {{ getLabels('Labels.ErrorMessages.CardholderName.Required', '') }}
                            </p>
                            <p v-else-if="enableNameValidateFlag && !$v.cardHolderValue.isValidEnNameValue">
                                {{ getLabels('Labels.ErrorMessages.CardholderName.Invalid', 'Card Holder is Invalid') }}
                            </p>
                            <p v-if="!$v.cardHolderValue.allowed">
                                {{ getLabels('Labels.ErrorMessages.CardholderName.Invalid', 'Card Holder is Invalid') }}
                            </p>
                            <p v-else-if="!$v.cardHolderValue.max">
                                {{ getLabels('Labels.ErrorMessages.CardholderName.MaxLength', '') }}
                            </p>
                        </div>
                    </div>
                    <div v-if="isMX" class="m-formField -text pt-10 sm:pt-0">
                        <label
                            class="m-formField__label to-md:text-xs"
                            :for="cardHolderLast.Id"
                            v-html="getLabels('Labels.Card.LastName', '')">
                        </label>

                        <v-input
                            :id="cardHolderLast.Id"
                            ref="cardHolderLast"
                            v-model="cardHolderLastValue"
                            auto-complete="off"
                            :name="cardHolderLast.Name"
                            :max-length="cardHolderLast.MaxLength"
                            :min-length="cardHolderLast.MinLength"
                            :placeholder="cardHolderLast.Placeholder"
                            :tailwind-mods="$v.cardHolderLastValue && $v.cardHolderLastValue.$error ? '-isInvalid' : null"
                            :aria-describedby="$v.cardHolderLastValue && $v.cardHolderLastValue.$error ? 'cardholderlastname-error' : false"
                            :value="getInitialValue(cardHolderLast, 'CardHolderLastName', cardHolderLastValue)"
                            class="to-md:text-sm"
                            @input="updateModel('cardHolderLastValue')"
                            @blur="handleBlur('cardHolderLastValue')">
                        </v-input>
                        <div
                            v-if="$v.cardHolderLastValue && $v.cardHolderLastValue.$error" class="e-formError__item"
                            :class="{ '-rbAddress': isRiverbendSubscription }"
                        >
                            <p v-if="!$v.cardHolderLastValue.required">
                                {{ getLabels('Labels.ErrorMessages.LastName.Required', '') }}
                            </p>
                            <p v-if="!$v.cardHolderLastValue.allowed">
                                {{ getLabels('Labels.ErrorMessages.LastName.Invalid', 'Card Holder is Invalid') }}
                            </p>
                            <p v-else-if="!$v.cardHolderLastValue.max">
                                {{ getLabels('Labels.ErrorMessages.LastName.MaxLength', '') }}
                            </p>
                        </div>
                    </div>
                </div>

                <div v-else class="m-formField -text">
                    <h2
                        class="m-formField__label to-md:text-xs"
                        :for="cardHolder.Id"
                        v-html="getLabels('Labels.Card.CardholderName', cardHolder.Label)">
                    </h2>
                    <input-basic-pseudo
                        class="to-md:text-sm"
                        :value="getInitialValue(cardHolder, 'CardHolderName', cardHolderValue)"
                        @input="updateModel('cardHolderValue')">
                    </input-basic-pseudo>
                </div>
            </div>

            <div v-if="cardOptions && cardOptions.length" class="m-payForm__row">
                <!-- Cardnumber Field (only for add mode) -->
                <div v-if="!isEditing" class="m-formField -text">
                    <label
                        class="m-formField__label to-md:text-xs"
                        :for="cardNumber.Id"
                        v-html="getLabels('Labels.Card.CardNumber', cardNumber.Label)">
                    </label>
                    <input-card-number
                        :id="cardNumber.Id"
                        ref="cardNumber"
                        v-model="cardNumberValue"
                        auto-complete="off"
                        :name="cardNumber.Name"
                        mask="creditcardnumber"
                        :mask-on-blur="maskCardNumber"
                        :unmask-on-focus="maskCardNumber"
                        :max-length="cardNumber.MaxLength"
                        :min-length="cardNumber.MinLength"
                        :placeholder="cardNumber.Placeholder"
                        :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                        :tailwind-mods="$v.$dirty && $v.cardNumberValue.$error ? '-isInvalid' : null"
                        :aria-describedby="$v.$dirty && $v.cardNumberValue.$error ? 'cardnumber-error' : false"
                        :value="getInitialValue(cardNumber, 'CardNumber', cardNumberValue)"
                        :card-options="cardOptions"
                        class="to-md:text-sm"
                        @input="updateModel('cardNumberValue')"
                        @blur="handleBlur('cardNumberValue')"
                        @card-number-error="handleCardNumber">
                    </input-card-number>
                    <div
                        v-if="$v.cardNumberValue.$error" class="e-formError__item"
                        :class="{ '-rbAddress': isRiverbendSubscription }"
                    >
                        <p v-if="!$v.cardNumberValue.required">
                            {{ getLabels('Labels.ErrorMessages.CardNumber.Required', '') }}
                        </p>
                        <p v-else-if="!showImprovedCTACheckout && !$v.cardNumberValue.integer">
                            {{ getLabels('Labels.ErrorMessages.CardNumber.Integer', '') }}
                        </p>
                        <p v-else-if="!$v.cardNumberValue.min">
                            {{ getLabels('Labels.ErrorMessages.CardNumber.MinLength', '') }}
                        </p>
                        <p v-else-if="!$v.cardNumberValue.max">
                            {{ getLabels('Labels.ErrorMessages.CardNumber.MaxLength', '') }}
                        </p>
                        <p v-else-if="!$v.cardNumberValue.allowed">
                            {{ getLabels('Labels.ErrorMessages.CardNumber.Invalid', '') }}
                        </p>
                    </div>
                </div>
                <div v-else class="m-formField -text">
                    <h2
                        v-if="!isRiverbendSubscription"
                        class="m-formField__label to-md:text-xs"
                        :for="cardNumber.Id"
                        v-html="getLabels('Labels.Card.CardNumber', cardNumber.Label)">
                    </h2>
                    <input-card-number-pseudo
                        class="to-md:text-sm"
                        :card-brand-image-src="cardBrandImageSrc"
                        :card-expiration="storedPayMethod.ExpirationDisplay"
                        :card-expiration-label="expirationLabel"
                        :card-expiration-near="storedPayMethod.ExpiresSoon"
                        :card-expired="storedPayMethod.Expired"
                        :card-options="cardOptions"
                        :value="getInitialValue(cardNumber, 'CardNumber', cardNumberValue)"
                        :brand-static="brandStatic"
                        :is-riverbend-subscription="isRiverbendSubscription"
                    />
                </div>
            </div>
        </div>

        <div class="m-payForm__rowGroup justify-between" :class="{'-halfGroups': isRiverbendSubscription}">
            <div
                class="m-payForm__row flex w-full"
                :class="expirationMods">

                <div v-if="isReadonlyExpiration" class="m-payForm__col pr-10 w-1_2">
                    <p
                        class="m-formField__label to-md:text-xs"
                        v-html="getLabels('Labels.Card.Expiration', expMonth.Label)"
                    />
                    <p>
                        {{ getInitialValue(expMonth, 'ExpMonth', expMonthValue) }}/{{ getInitialValue(expYear, 'ExpYear', expYearValue) }}
                    </p>
                </div>

                <div v-show="!isReadonlyExpiration" class="m-payForm__col pr-10 w-1_2">
                    <!-- Expiration Month Field -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label to-md:text-xs whitespace-no-wrap"
                            :for="expMonth.Id"
                            v-html="getLabels('Labels.Card.Expiration', expMonth.Label)">
                        </label>
                        <v-select
                            v-if="localization && localization.Labels"
                            :id="expMonth.Id"
                            ref="expMonth"
                            vmodel="expMonthValue"
                            :options="selectOptionsLabels(expMonthOptions)"
                            :aria-describedby="$v.expMonthValue.$error ? 'expirationmonth-error' : false"
                            :values="selectOptionsValues(expMonthOptions)"
                            :aria-label="expMonthLabel"
                            :select-mod="expMonth.SelectMod"
                            :select-element-mod="`py-10 px-15 ${$v.expMonthValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('ExpirationDate')) ? '-error' : ''}`"
                            :initial="getInitialValue(expMonth, 'ExpMonth', expMonthValue)"
                            :name="expMonth.Name"
                            :arrow-direction="expMonth.Arrow.Direction || null"
                            :arrow-size="expMonth.Arrow.Size || null"
                            :arrow-tailwind-color="expMonth.Arrow.TailwindColor || null"
                            :arrow-other-mods="expMonth.Arrow.OtherMods || null"
                            @change="updateModel"
                            @blur="handleBlur('expMonthValue')">
                        </v-select>
                        <div
                            v-if="$v.expMonthValue.$error" class="e-formError__item"
                            :class="{ '-rbAddress': isRiverbendSubscription }"
                        >
                            <p v-if="!$v.expMonthValue.required">
                                {{ getLabels('Labels.ErrorMessages.ExpirationMonth.Required', '') }}
                            </p>
                        </div>
                    </div>
                </div>

                <div v-show="!isReadonlyExpiration" class="m-payForm__col pt-20 mt-2 md:pt-25 md:mt-1 w-1_2">
                    <!-- Expiration Year Field -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label to-md:text-xs -hidden"
                            :for="expYear.Id"
                            v-html="getLabels('Labels.Card.Expiration', expYear.Label)">
                        </label>
                        <v-select
                            v-if="localization && localization.Labels"
                            :id="expYear.Id"
                            ref="expYear"
                            vmodel="expYearValue"
                            :options="selectOptionsLabels(expYearOptions)"
                            :aria-describedby="$v.expYearValue.$error ? 'expirationyear-error' : false"
                            :values="selectOptionsValues(expYearOptions)"
                            :aria-label="expYearLabel"
                            :select-mod="expYear.SelectMod"
                            :select-element-mod="`py-10 px-15 ${$v.expYearValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('ExpirationDate')) ? '-error' : null}`"
                            :initial="getInitialValue(expYear, 'ExpYear', expYearValue)"
                            :name="expYear.Name"
                            :arrow-direction="expYear.Arrow.Direction || null"
                            :arrow-size="expYear.Arrow.Size || null"
                            :arrow-tailwind-color="expYear.Arrow.TailwindColor || null"
                            :arrow-other-mods="expYear.Arrow.OtherMods || null"
                            @change="updateModel"
                            @blur="handleBlur('expYearValue')">
                        </v-select>
                        <div
                            v-if="$v.expYearValue.$error" class="e-formError__item"
                            :class="{ '-rbAddress': isRiverbendSubscription }"
                        >
                            <p v-if="!$v.expYearValue.required">
                                {{ getLabels('Labels.ErrorMessages.ExpirationYear.Required', '') }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-if="(!isEditing || isJP) && useCvv"
                class="m-payForm__row"
                :class="cvvMods">
                <!-- CVV Field -->
                <div class="m-formField -text">
                    <label
                        class="m-formField__label"
                        :for="cvv.Id"
                        v-html="getLabels('Labels.Card.Cvc', cvv.Label)">
                    </label>
                    <v-input
                        :id="cvv.Id"
                        ref="cvv"
                        v-model="cvvValue"
                        auto-complete="off"
                        :class="isJP ? 'm-formField__cvv' : ''"
                        :name="cvv.Name"
                        :max-length="cvv.MaxLength"
                        :min-length="cvv.MinLength"
                        model-name="cvvValue"
                        :placeholder="cvv.Placeholder"
                        :tailwind-mods="$v.cvvValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('CVVCode')) ? '-isInvalid' : null"
                        :aria-invalid="$v.cvvValue && $v.cvvValue.$error"
                        :aria-describedby="$v.cvvValue.$error ? 'cvv-error' : false"
                        :value="getInitialValue(cvv, 'CVV', cvvValue)"
                        @input="updateModel('cvvValue')"
                        @blur="handleBlur('cvvValue')"
                        @keydown="handleInteger">
                    </v-input>
                    <div
                        v-if="$v.cvvValue.$error" class="e-formError__item"
                        :class="{ '-rbAddress': isRiverbendSubscription }"
                    >
                        <p v-if="!$v.cvvValue.required">
                            {{ getLabels('Labels.ErrorMessages.CVV.Required', '') }}
                        </p>
                        <p v-else-if="!$v.cvvValue.integer">
                            {{ getLabels('Labels.ErrorMessages.CVV.Integer', '') }}
                        </p>
                        <p v-else-if="!$v.cvvValue.min">
                            {{ getLabels('Labels.ErrorMessages.CVV.MinLength', '') }}
                        </p>
                        <p v-else-if="!$v.cvvValue.max">
                            {{ getLabels('Labels.ErrorMessages.CVV.MaxLength', '') }}
                        </p>
                    </div>
                </div>
                <div v-if="showCvvIcon" class="m-formField__cvvIcon">
                    <img src="https://cdnsc1.melaleuca.com/global/images/cvv-icon.svg" alt="">
                </div>
            </div>

            <div
                v-if="!isEditing && useZipcode"
                class="m-payForm__row w-1_2"
                :class="isGuestOrEnrollment ? 'lg:w-1_3' : 'md:w-1_3'">
                <!-- Billing Zip Code Field (US and CA only) -->
                <div class="m-formField -text">
                    <label
                        class="m-formField__label to-md:text-xs"
                        :for="zip.Id"
                        v-html="getLabels('Labels.Card.BillingZipCode', zip.Label)">
                    </label>
                    <v-input
                        :id="zip.Id"
                        ref="zip"
                        v-model="zipValue"
                        auto-complete="off"
                        :name="zip.Name"
                        :max-length="zip.MaxLength"
                        :min-length="zip.MinLength"
                        model-name="zipValue"
                        :placeholder="zip.Placeholder"
                        :tailwind-mods="$v.zipValue.$error ? '-isInvalid' : null"
                        :aria-describedby="$v.zipValue.$error ? 'billingzipcode-error' : false"
                        :value="getInitialValue(zip, 'BillingZipCode', zipValue)"
                        @input="updateModel('zipValue')"
                        @blur="handleBlur('zipValue')">
                    </v-input>
                    <div
                        v-if="$v.zipValue.$error" class="e-formError__item"
                        :class="{ '-rbAddress': isRiverbendSubscription }"
                    >
                        <p v-if="!$v.zipValue.required">
                            {{ getLabels('Labels.ErrorMessages.BillingZipCode.Required', '') }}
                        </p>
                        <p v-else-if="!$v.zipValue.integer">
                            {{ getLabels('Labels.ErrorMessages.BillingZipCode.Integer', '') }}
                        </p>
                        <p v-else-if="!$v.zipValue.min">
                            {{ getLabels('Labels.ErrorMessages.BillingZipCode.MinLength', '') }}
                        </p>
                        <p v-else-if="!$v.zipValue.max">
                            {{ getLabels('Labels.ErrorMessages.BillingZipCode.MaxLength', '') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showNickName" class="m-payForm__row">
            <!-- Nickname Field -->
            <div class="m-formField -text">
                <label
                    class="m-formField__label to-md:text-xs"
                    :for="nickname.Id"
                    v-html="getLabels('Labels.Card.Nickname', nickname.Label)">
                </label>
                <v-input
                    :id="nickname.Id"
                    ref="nickname"
                    v-model="nicknameValue"
                    auto-complete="off"
                    :name="nickname.Name"
                    :max-length="nickname.MaxLength"
                    :min-length="nickname.MinLength"
                    :placeholder="nickname.Placeholder"
                    :tailwind-mods="$v.nicknameValue.$error ? '-isInvalid' : null"
                    :aria-describedby="$v.nicknameValue.$error ? 'nickname-error' : false"
                    :value="getInitialValue(nickname, 'Nickname', nicknameValue)"
                    @input="updateModel('nicknameValue')"
                    @blur="handleBlur('nicknameValue')">
                </v-input>
            </div>
        </div>
    </div>
</template>

<script>
    import paymentFormCreditMixin from '../../../mixins/payment-form-credit';
    export default {
        name: 'PaymentFormCredit',
        mixins: [ paymentFormCreditMixin ]
    };
</script>
