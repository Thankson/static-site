<template>
    <div class="p-checkout" :class="isCn ? '-isCnCheckout' : ''">

        <!-- Message Banner -->
        <m-checkout-banner
            v-if="isPuertoRico && puertoRicoBannerMessage"
            :message="puertoRicoBannerMessage"
        >
        </m-checkout-banner>

        <div
            class="p-checkout__wrapper"
            :class="{'-showImprovedCTACheckout': showImprovedCTACheckout}"
            :aria-live="!ready ? 'polite' : false">
            <!-- Header -->
            <div class="p-checkout__header">
                <h1 class="p-checkout__heading">
                    {{ getLocalizationProp('Labels.Checkout.OrderReview') }}
                </h1>
            </div>
            <div class="p-checkout__link">
                <a
                    class="a-backLink"
                    :href="getLocalizationProp('Data.Checkout.BackToCartLink.Url')"
                    :target="getLocalizationProp('Data.Checkout.BackToCartLink.Target') || false">

                    <span class="a-backLink__icon" aria-hidden="true">navigate_before</span>
                    {{ getLocalizationProp('Data.Checkout.BackToCartLink.Text') }}
                </a>
            </div>

            <a-loading-spinner v-if="loading && !ready" :visible="loading" />

            <!-- Content columns -->
            <div v-if="ready" class="p-checkout__content">
                <!-- Left Column -->
                <div class="p-checkout__main">

                    <!-- Shipping -->
                    <div v-if="!isCn" class="p-checkout__accordion" :class="{'-sou': (shippingOnUsEnabled && shippingConfigId) || staticShippingHandlingText}">
                        <o-checkout-shipping-methods
                            v-if="!loading && !endpointError"
                            :get-by-label="getLocalizationProp('Labels.Checkout.GetBy')"
                            :title="getLocalizationProp('Labels.Checkout.Shipping', 'Shipping')"
                            :error-aria-label="getLocalizationProp('Labels.Checkout.ErrorAriaLabel.ShippingMethods', 'Error attention required')"
                            :has-shipping-unavailable-error="hasShippingUnavailableError"
                            :hide-ship-method="getLocalizationProp('Data.HideShipMethod', false)"
                            :error-shipping-unavailable-label="modalInvalidShippingUnavailableText"
                            :error-learn-why-label="modalInvalidShippingLearnWhyText"
                            :use-sequence-style="enableCvsPickUp"
                            :sequence-index="0"
                            :title-copy="getLocalizationProp('Labels.Checkout.Shipping', 'Shipping')"
                            :script-id="scriptId"
                            @open-modal="openCannotShipToAddressModal"
                            @update="updateInfo" />
                        <p v-if="shippingMessage" class="p-checkout__message">{{ shippingMessage }}</p>
                    </div>
                    <!-- EU markets not having SOU feature -->
                    <div
                        v-if="staticShippingHandlingText"
                        class="border-1 border-gray-50 rounded bg-white p-10 mb-16 text-sm" v-html="staticShippingHandlingText">
                    </div>
                    <div>
                        <m-shipping-on-us
                            v-if="shippingOnUsEnabled && summary.Points !== 0 && shippingConfigId"
                            :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                            :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                            :shipping-config-id="shippingConfigId"
                        />
                        <m-cart-shipping-on-us-banner
                            v-else-if="freeShippingEnabled"
                            :sou-feature-on="freeShippingEnabled && summary.Points !== 0"
                            :current-offer="freeShippingCurrentOffer"
                            :available-offers="freeShippingAvailableOffers"
                            :labels="getLocalizationProp('Labels.ShippingOnUs')"
                        />
                        <CheckoutShippingOnUsBanner
                            v-else
                            :sou-feature-on="shippingOnUsEnabled && summary.Points !== 0"
                            :current-offer="shippingOnUsCurrentOffer"
                            :available-offers="shippingOnUsAvailableOffers"
                            :labels="getLocalizationProp('Labels.ShippingOnUs')"
                            :link="getLocalizationProp('Data.Checkout.ShippingOnUsKeepShoppingLink', {})"
                        />
                    </div>

                    <!-- Notice and banner used for CN -->
                    <div v-if="isCn" ref="scrollBannerTip" class="md:hidden"></div>
                    <div v-if="isCn" class="p-cart__banner md:hidden" :class="scrollBannerTip">
                        <o-cart-banner
                            :banner="getLocalizationProp('Data.NoticeAndBanner', {})"
                            :summary="summary"
                            :is-checkout="true"
                            :shipping-fee="getLocalizationProp('Data.ShippingFee', {})"
                            :is-preferred="isPreferred">
                        </o-cart-banner>
                    </div>

                    <!-- Ship To -->
                    <template v-if="isCheckoutEditAccountInfo">
                        <OSequentialSection
                            container-type="fieldset"
                            title-type="legend"
                            :title-copy="getLocalizationProp('Labels.Checkout.ShippingAddress')"
                            :sequence-index="shippingAddressesSequenceIndex"
                            :shipping-addresses-sequence-index="shippingAddressesSequenceIndex"
                            :is-ole-checkout-flow="true"
                            :change-label="getLocalizationProp('Labels.ShippingSection.Change')"
                            @openAddressEdit="setBusinessAddEditOrShippingAddress"
                            @shown="onListShown('shippingAddress')"
                        >
                            <template v-slot:selctedTitle>
                                <!-- this slot to be rendered only when shipping and business address different -->
                                <div v-if="!showAddressEditView && isSavedAddress" class="o-shippingAddressCheckout__address" data-testid="container-addressContainer">
                                    <div>
                                        <div v-html="savedAddress.shipping"></div>
                                        <button class="o-shippingAddressCheckout__buttonLink" @click="[setAddressEditComp(), gtmTrackAction({id: 453, text: getLocalizationProp('Labels.ShippingSection.Change', 'Change')}, $event)]">{{ getLocalizationProp('Labels.ShippingSection.Change', 'Change') }}</button>
                                    </div>
                                    <div>
                                        <p class="font-semibold mt-20">{{ getLocalizationProp('Labels.ShippingSection.BusinessPermanentAddress', 'Business/Permanent Address') }}</p>
                                        <div v-html="savedAddress.business"></div>
                                    </div>
                                </div>
                            </template>

                            <OCheckoutShippingAddressesConfigurable
                                ref="shippingAddress"
                                :enable-cvs-pick-up="enableCvsPickUp"
                                :is-in-checkout="isInCheckout"
                                :show-address-edit-view="showAddressEditView"
                                :is-business="false"
                                :script-id="scriptId"
                                :has-business-address="hasBusinessAddress"
                                :has-shipping-address="hasShippingAddress"
                                :sequence-index="shippingAddressesSequenceIndex"
                                :show-shipping-add-form="isShowShippingAddForm"
                                :show-business-add-form="isShowBusinessAddForm"
                                @completedStatus="updateStatus"
                                @getDataAgain="getDataAgain"
                                @isAddressFormOpen="(isOpen) => isAddressFormOpen = isOpen"
                                @shippingAndBusinessAddress="updateAddresses"
                                @openAddressEditDelete="setAddressEditComp"
                                @hasAddresses="setAvailableAddresses"
                                @setAddressFormProps="setaddressFormProps"
                                @cross-country-address="openCrossCountryAddress"
                                @updateShipAddress="updateShipAddress"
                                @update="updateInfo"
                            />

                        </OSequentialSection>
                    </template>
                    <template v-else>
                        <div v-if="addresses.length || !shippingAddressLoading" class="p-checkout__accordion">
                            <o-checkout-shipping-addresses
                                :edit-label="getLocalizationProp('Labels.Checkout.Edit')"
                                :edit-link="getLocalizationProp('Data.Checkout.EditShippingAddressLink.Url', null)"
                                :edit-guest-link="getLocalizationProp('Data.Checkout.GuestShippingAddressLink', null)"
                                :title="getLocalizationProp('Labels.Checkout.ShipTo', 'Ship To')"
                                :error-aria-label="getLocalizationProp('Labels.Checkout.ErrorAriaLabel.ShippingAddresses', 'Error attention required')"
                                :is-cn="isCn"
                                :is-first-time-checkout="isFirstTimeCheckout"
                                :is-guest="isGuestShopping"
                                :modal-labels-delete-addr="modalLabelsDeleteAddr"
                                @update="updateInfo"
                                @checkCity="checkCity"
                                @cross-country-address="openCrossCountryAddress"
                                @updateShipAddress="updateShipAddress">

                                <template v-if="getLocalizationProp('Data.Checkout.AddShippingAddressLink.Url', null)">
                                    <div class="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center">
                                        <a
                                            class="a-button -white rounded px-15 md:py-10 md:px-30 md:text-base mb-20 md:mb-0"
                                            :href="addShippingAddressLink"
                                            @click="gtmTrackAction({id: 249, text: getLocalizationProp('Data.Checkout.AddShippingAddressLink.Text')}, $event)">

                                            {{ getLocalizationProp('Data.Checkout.AddShippingAddressLink.Text') }}
                                        </a>
                                        <a class="text-green uppercase underline text-sm" :href="getLocalizationProp('Data.Checkout.ManageShippingAddressLink.Url')">{{ getLocalizationProp('Data.Checkout.ManageShippingAddressLink.Text') }}</a>
                                    </div>
                                </template>
                            </o-checkout-shipping-addresses>
                            <!-- CN only -->
                            <p v-if="selectedShipAddress && isCn" ref="scrollAddressTip" class="text-sm hidden" :class="scrollAddressTip">
                                {{ selectedShipAddress }}
                            </p>
                        </div>
                    </template>

                    <!-- Use Credit on Account - COA -->
                    <div v-if="showCoa && isCn" class="p-checkout__accordion">
                        <o-checkout-coa
                            v-if="showCoa && isCn"
                            ref="checkoutCoa"
                            :labels="getLocalizationProp('Labels.Coa')"
                            :credits="summary.CreditOnAccount"
                            :total="summary.CartNetTotal"
                            :error-msgs="getLocalizationProp('Labels.Coa.ErrorMessages', coaErrorMessages)"
                            :is-cn="isCn"
                            :show-currency="isCn"
                            :whole-numbers-only="wholeNumbersOnly"
                            @coaApply="coaApply"
                            @coaReset="coaReset" />
                    </div>

                    <!-- Pay with -->
                    <div v-show="!storedApiLoading && storedApiCheckoutLoaded && !isTotalPaidWithCoa" class="p-checkout__accordion">
                        <o-checkout-payment-methods
                            v-show="!isDeletingPayMethods"
                            class="-payMethods"
                            :class="{'-cvvError': hasCvvError && invalidCvv}"
                            :edit-label="getLocalizationProp('Labels.Checkout.Edit')"
                            :edit-link="getLocalizationProp('Data.Checkout.EditPayMethodsLink.Url', null)"
                            :edit-guest-link="getLocalizationProp('Data.Checkout.GuestPaymentLink', null)"
                            :expires-label="getLocalizationProp('Labels.Checkout.Expires')"
                            :expired-label="getLocalizationProp('Labels.Checkout.Expired')"
                            :hide-default-paymethod-link="hideDefaultPaymethodLink"
                            :hide-delete-default-paymethod-link="hideDeleteDefaultPaymethodLink"
                            :is-guest="isGuestShopping"
                            :modal-labels-delete-pay-method="modalLabelsDeletePayMethod"
                            :title="getLocalizationProp('Labels.Checkout.PayWith', 'Pay With')"
                            :error-aria-label="getLocalizationProp('Labels.Checkout.ErrorAriaLabel.PaymentMethods', 'Error attention required')"
                            :use-sequence-style="enableCvsPickUp"
                            :sequence-index="2"
                            :title-copy="getLocalizationProp('Labels.Checkout.PayMethod', 'Pay Method')"
                            :script-id="scriptId"
                            @deleting-pay-method="deletingPayMethod"
                            @update="updateInfo">

                            <template v-if="getLocalizationProp('Data.Checkout.AddPaymentLink.Url', null) && !isCn">
                                <div class="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center">
                                    <a
                                        class="a-button -white rounded-md py-10 px-15 md:px-20 text-sm md:text-base font-medium tracking-wide mt-6 mb-20 md:mb-0"
                                        :href="addPaymentLink"
                                        @click="gtmTrackAction({id: 249, text: getLocalizationProp('Data.Checkout.AddPaymentLink.Text')}, $event)">

                                        {{ getLocalizationProp('Data.Checkout.AddPaymentLink.Text') }}
                                    </a>
                                    <a class="text-green uppercase underline text-sm" :href="getLocalizationProp('Data.Checkout.ManagePayMethodsLink.Url')">{{ getLocalizationProp('Data.Checkout.ManagePayMethodsLink.Text') }}</a>
                                </div>
                            </template>
                        </o-checkout-payment-methods>

                        <CheckoutConvenienceStore
                            v-if="showConvenienceStorePayment"
                            ref="convenience-store"
                            :raw-total="parseFloat(totalComp)"
                            :info-label="getLocalizationProp('Data.ConvenienceStore.ConvenienceStoreLinkLabel', '')"
                            :modal-content="getLocalizationProp('Data.ConvenienceStore.ConvenienceStoreInformation', '')"
                            :store-error-label="getLocalizationProp('Data.ConvenienceStore.ConvenienceStoreError', '')"
                            :store-label="getLocalizationProp('Data.ConvenienceStore.SelectConvenienceStore', '')"
                            @update="onConvenienceStoreUpdate"
                        />

                        <!-- Installment Options -->
                        <CheckoutInstallment
                            v-if="showInstallment"
                            ref="installment"
                            :labels="getLocalizationProp('Labels.Installments', {})"
                            :rte="getLocalizationProp('Data.Installments', {})"
                            :installment-options="getLocalizationProp('Data.Installments.List')"
                            :pay-method-type="selectedPayMethod.PayMethodType"
                            @update="onPortalPaymentUpdate"
                        />

                        <!-- FPX Banks -->
                        <CheckoutFpxBanks
                            v-if="showFpx"
                            ref="fpx-bank"
                            :bank-error-label="getLocalizationProp('Labels.VirtualPayment.CardSelectionError', 'Please select a bank.')"
                            :bank-label="getLocalizationProp('Labels.VirtualPayment.CardSelection', 'Select Bank')"
                            :bank-placeholder="getLocalizationProp('Labels.VirtualPayment.SelectBank', 'Select Bank')"
                            :bank-offline-label="getLocalizationProp('Labels.BankOffline', '{0} (Offline)')"
                            @update="onFpxUpdate"
                        />

                        <CheckoutVirtualPayment
                            v-else-if="showVirtualPayment"
                            ref="virtual-payment"
                            :bank-error-label="getLocalizationProp('Labels.VirtualPayment.CardSelectionError', 'Please select a bank.')"
                            :bank-label="getLocalizationProp('Labels.VirtualPayment.CardSelection', 'Bank Choice')"
                            :bank-placeholder="getLocalizationProp('Labels.VirtualPayment.SelectBank', 'Select Bank')"
                            :business-number-label="getLocalizationProp('Labels.VirtualPayment.BusinessRegistrationNumber', 'Business Registration Number')"
                            :business-number-error-label="getLocalizationProp('Labels.VirtualPayment.BusinessRegistrationNumberError', 'Please enter a valid business registration number.')"
                            :mobile-number-label="getLocalizationProp('Labels.VirtualPayment.MobileNumber', 'Mobile Number')"
                            :mobile-number-error-label="getLocalizationProp('Labels.VirtualPayment.MobileNumberError', 'Please enter a valid mobile number.')"
                            :mobile-number-value="selectedPayMethod.PersonalIncomeIssueNumber || ''"
                            :notice-label="getLocalizationProp('Labels.VirtualPayment.NoticeMessageText', '')"
                            :receipt-label="getLocalizationProp('Labels.VirtualPayment.CashReceipt', 'Cash Receipt')"
                            :receipt-options="cashReceiptOptions.map((option) => ({ text: option.Text, value: option.Value }))"
                            @update="onVirtualPaymentUpdate"
                        />

                        <a-loading-spinner :visible="isDeletingPayMethods" />

                        <div v-if="showCvv && !isCn" class="p-checkout__cvv flex flex-col" :class="{'-isInvalid': hasCvvError && invalidCvv}">
                            <div class="flex item-start flex-row">
                                <span class="p-checkout__title -cvv">{{ getLocalizationProp('Labels.Cvv.Title') }}</span>
                                <div class="p-checkout__form">
                                    <label class="p-checkout__label" for="cvvCode">{{ getLocalizationProp('Labels.Cvv.Label') }}</label>
                                    <input-basic
                                        id="cvvCode"
                                        ref="cvvCode"
                                        v-model="cvvCode"
                                        name="cvvCode"
                                        :min-length="getLocalizationProp('Data.Cvv.MinLength')"
                                        :max-length="getLocalizationProp('Data.Cvv.MaxLength')"
                                        tailwind-mods="bg-clear p-checkout__input"
                                        model-name="cvvCode"
                                        aria-required="true"
                                        @keydown="handleInteger">
                                    </input-basic>
                                </div>
                            </div>
                            <div class="showCvvWhatIs">
                                <button class="p-checkout__cvvWhatIs" @click="openCvvModal"> {{ getLocalizationProp('Labels.Cvv.CvvModal.WhatIsThisTitle') }}</button>
                            </div>
                        </div>

                        <div v-show="needFurtherPaymentValidation" class="p-checkout__payMethodInfo">
                            <m-pay-method-info
                                ref="payMethodInfoRef"
                                :script-id="scriptId"
                                @validated="isPayMethodInfoValid = $event"
                                @notSatisfiedWithAtLeastOneInfo="notSatisfiedWithAtLeastOneInfo = $event"
                                @updateErrorInfo="payMethodErrorInfo = $event"
                            />
                        </div>
                    </div>

                    <!-- Gui-carrier -->
                    <div v-if="showGui && guiCarrierTypes && guiCarrierTypes[0]" class="p-checkout__accordion -guiCarrier">
                        <CheckoutGuiCarrier
                            :edit-gui="getLocalizationProp('Data.Checkout.EditGUI')"
                            :donation-code="donationCode"
                            :gui-labels="getLocalizationProp('Labels.GUI')"
                            :gui-carrier-types="guiCarrierTypes"
                            :is-corporate="getLocalizationProp('Data.IsCorporate')"
                            :use-sequence-style="enableCvsPickUp"
                            :sequence-index="3"
                            :title-copy="getLocalizationProp('Labels.GUI.Title')"
                            :script-id="scriptId"
                            @setGuiType="setGuiCarrierType"
                        />
                    </div>

                    <a-loading-spinner :visible="checkoutPreferencesLoading" />

                    <!-- Use Credit on Account - COA -->
                    <o-checkout-coa
                        v-if="showCoa && !isCn"
                        ref="checkoutCoa"
                        :labels="getLocalizationProp('Labels.Coa')"
                        :credits="summary.CreditOnAccount"
                        :total="summary.CartNetTotal"
                        :error-msgs="getLocalizationProp('Labels.Coa.ErrorMessages', coaErrorMessages)"
                        :show-currency="getLocalizationProp('Data.Coa.ShowCurrency', false)"
                        :whole-numbers-only="wholeNumbersOnly"
                        @coaApply="coaApply"
                        @coaReset="coaReset"
                    />

                    <m-become-member-card
                        v-if="showBecomeMemberCard"
                        mods="-mobile"
                        :labels="getLocalizationProp('Labels.BecomeMember', {})">
                    </m-become-member-card>

                    <!-- Items -->
                    <article class="o-checkoutList">
                        <h2 class="o-checkoutList__heading">{{ getLocalizationProp('Labels.Checkout.YourItems', 'Your Items') }}</h2>
                        <ul class="o-checkoutList__list">
                            <li
                                v-for="item in items"
                                :key="item.LineId"
                                class="o-checkoutList__listItem">

                                <m-checkout-item
                                    :asterisk="item && item.HasReducedTaxRate && getLocalizationProp('Labels.AdditionalTaxSummary.AsteriskSymbol', '*') || ''"
                                    :concentrated-label="getLocalizationProp('Labels.Concentrated')"
                                    :diluted-label="getLocalizationProp('Labels.Diluted')"
                                    :free-label="getLocalizationProp('Labels.CheckoutSummary.Free')"
                                    :is-free="showFree(item)"
                                    :is-receipt="false"
                                    :item="item"
                                    :points-label="getLocalizationProp('Labels.CheckoutItem.Points')"
                                    :quantity-label="getLocalizationProp('Labels.CheckoutItem.Qty')"
                                    :size-label="getLocalizationProp('Labels.CheckoutItem.Size')"
                                    :read-more-label="getLocalizationProp('Labels.CheckoutItem.ReadMoreLabel')"
                                    :read-less-label="getLocalizationProp('Labels.CheckoutItem.ReadLessLabel')"
                                    :is-cn="isCn"
                                    :lsd-used-label="getLocalizationProp('Labels.CheckoutItem.LsdUsedLabel')"
                                    :user-flags="userFlags" />
                            </li>
                        </ul>
                    </article>

                    <!-- E-invoice -->
                    <div v-if="!shippingAddressLoading && isCn" class="p-checkout__accordion -invoice">
                        <o-checkout-invoice-cn
                            :title="getLocalizationProp('Labels.Checkout.NeedInvoice', '发票')"
                            :need-invoice-name="getLocalizationProp('Data.Invoice.Name', null)"
                            :need-invoice-label="getLocalizationProp('Data.Invoice.Label', null)"
                            :is-invoice="getLocalizationProp('Data.Invoice.Value', null)"
                            :is-attention="invoiceUpdated"
                            :attention-invoice="getLocalizationProp('Data.Invoice.Attention', null)"
                            @update="updateInvoiceType"
                            @updateChecked="updateInvoice"
                        >
                        </o-checkout-invoice-cn>
                    </div>

                    <!-- LSD Section -->
                    <div v-if="shippingOnUsEnabled" class="m-checkoutLSD">
                        <div class="inline-flex items-center">
                            <h3 class="m-checkoutLSD__title" :class="{ 'text-sm': enableLSDSummaryEnhancement }">
                                {{ getLocalizationProp("Labels.LsdBalance.LoyaltyShoppingDollars") }}
                            </h3>
                            <m-tooltip v-if="lsdTitleToolTip" class="ml-2" tooltip-icon="help" tooltip-icon-size="xs">
                                <div v-html="lsdTitleToolTip"></div>
                            </m-tooltip>
                        </div>
                        <template v-if="isCn && !enableLSDSummaryEnhancement">
                            <p class="m-checkoutLSD__text">
                                {{ getLocalizationProp('Labels.LsdBalance.NewBalance', 'New balance:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedNewBalance }}</span>
                            </p>
                            <p class="m-checkoutLSD__text">
                                {{ getLocalizationProp('Labels.LsdBalance.Earned', 'Earned this order:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedEarned }}</span>
                            </p>
                        </template>
                        <template v-else-if="isCn && enableLSDSummaryEnhancement">
                            <p v-if="hasLsdItemVal('AvailableToSpend')" class="m-checkoutLSD__text text-sm text-gray-100">
                                {{ getLocalizationProp('Labels.LsdBalance.Available') }} <span class="m-checkoutLSD__amount text-gray-150">{{ formatLsdItem('AvailableToSpend') }}</span>
                            </p>
                            <p v-if="hasLsdItemVal('ExpiringThisMonth')" class="m-checkoutLSD__text text-sm text-gray-100">
                                {{ getLocalizationProp('Labels.LsdBalance.ExpiringThisMonthWithColon') }} <span class="m-checkoutLSD__amount text-gray-150">{{ formatLsdItem('ExpiringThisMonth') }}</span>
                            </p>
                            <p v-if="hasLsdItemVal('Used')" class="m-checkoutLSD__text text-sm text-gray-100">
                                {{ getLocalizationProp('Labels.LsdBalance.UsedThisOrder') }} <span class="m-checkoutLSD__amount text-gray-150">{{ formatLsdItem('Used') }}</span>
                            </p>
                            <p v-if="hasLsdItemVal('Remaining')" class="m-checkoutLSD__text text-sm text-gray-100">
                                {{ getLocalizationProp('Labels.LsdBalance.Remaining') }} <span class="m-checkoutLSD__amount text-gray-150">{{ formatLsdItem('Remaining') }}</span>
                            </p>
                        </template>
                        <template v-else>
                            <p class="m-checkoutLSD__text">
                                {{ getLocalizationProp("Labels.LsdBalance.ToSpend") }}
                                <span v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__amount">
                                    {{ summary.LoyaltyShoppingDollars.FormattedAvailableToSpend }}
                                </span>
                            </p>
                            <p
                                v-if="summary.LoyaltyShoppingDollars && summary.LoyaltyShoppingDollars.AvailableToActivate > 0"
                                class="m-checkoutLSD__text"
                            >
                                {{ getLocalizationProp("Labels.LsdBalance.AvailableToActivate") }}
                                <span v-if="summary.LoyaltyShoppingDollars && !isKr" class="m-checkoutLSD__amount">
                                    {{ summary.LoyaltyShoppingDollars.FormattedAvailableToActivate }}
                                </span>
                            </p>
                            <p v-if="lsdEarned" class="m-checkoutLSD__text">
                                {{ getLocalizationProp("Labels.LsdBalance.EarnedThisOrder") }}
                                <span class="m-checkoutLSD__amount">
                                    {{ lsdEarned }}
                                </span>
                            </p>
                            <p v-if="showLsdExpiringInCurrentMonth" class="m-checkoutLSD__text">
                                {{ getLocalizationProp("Labels.LsdBalance.ExpiringThisMonth") }}
                                <span class="m-checkoutLSD__amount">
                                    {{ summary.LoyaltyShoppingDollars.FormattedLsdExpiringInCurrentMonth }}
                                </span>
                            </p>
                        </template>
                    </div>
                    <div v-else>
                        <!-- todo: hide based on user type  -->
                        <div v-if="showLsdBanner || (summary.ConvenienceCertificates && summary.ConvenienceCertificates.Balance && !isCn)" class="m-checkoutLSD">
                            <template v-if="showLsdBanner">
                                <div class="inline-flex items-center">
                                    <h3 class="m-checkoutLSD__title" :class="{ 'text-sm': enableLSDSummaryEnhancement }">
                                        {{ getLocalizationProp('Labels.LsdBalance.LoyaltyShoppingDollars', 'LOYALTY SHOPPING DOLLARS') }}
                                    </h3>
                                    <m-tooltip v-if="lsdTitleToolTip" class="ml-2" tooltip-icon="help" tooltip-icon-size="xs">
                                        <div v-html="lsdTitleToolTip"></div>
                                    </m-tooltip>
                                </div>
                                <template v-if="isCn && !enableLSDSummaryEnhancement">
                                    <p class="m-checkoutLSD__text">
                                        {{ getLocalizationProp('Labels.LsdBalance.NewBalance', 'New balance:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedNewBalance }}</span>
                                    </p>
                                    <p class="m-checkoutLSD__text">
                                        {{ getLocalizationProp('Labels.LsdBalance.Earned', 'Earned this order:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedEarned }}</span>
                                    </p>
                                </template>
                                <template v-if="isCn && enableLSDSummaryEnhancement">
                                    <p v-if="hasLsdItemVal('AvailableToSpend')" class="m-checkoutLSD__text text-sm text-gray-100">
                                        {{ getLocalizationProp('Labels.LsdBalance.Available') }} <span class="text-gray-150 font-bold">{{ formatLsdItem('AvailableToSpend') }}</span>
                                    </p>
                                    <p v-if="hasLsdItemVal('ExpiringThisMonth')" class="m-checkoutLSD__text text-sm text-gray-100">
                                        {{ getLocalizationProp('Labels.LsdBalance.ExpiringThisMonthWithColon') }} <span class="text-gray-150 font-bold">{{ formatLsdItem('ExpiringThisMonth') }}</span>
                                    </p>
                                    <p v-if="hasLsdItemVal('Used')" class="m-checkoutLSD__text text-sm text-gray-100">
                                        {{ getLocalizationProp('Labels.LsdBalance.UsedThisOrder') }} <span class="text-gray-150 font-bold">{{ formatLsdItem('Used') }}</span>
                                    </p>
                                    <p v-if="hasLsdItemVal('Remaining')" class="m-checkoutLSD__text text-sm text-gray-100">
                                        {{ getLocalizationProp('Labels.LsdBalance.Remaining') }} <span class="text-gray-150 font-bold">{{ formatLsdItem('Remaining') }}</span>
                                    </p>
                                </template>

                                <template v-if="!isCn">
                                    <p v-if="summary.LoyaltyShoppingDollars && !isKr" class="m-checkoutLSD__text">
                                        {{ getLocalizationProp('Labels.LsdBalance.AvailableToActivate', 'Available To Activate:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedAvailableToActivate }}</span>
                                    </p>
                                    <p v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__text">
                                        {{ getLocalizationProp('Labels.LsdBalance.ToSpend', 'Available To Spend:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedNewBalance }}</span>
                                    </p>
                                </template>
                                <p v-if="!isCn && lsdEarned" class="m-checkoutLSD__text">
                                    {{ getLocalizationProp('Labels.LsdBalance.Earned', 'Earned this order:') }} <span class="m-checkoutLSD__amount">{{ lsdEarned }}</span>
                                </p>
                            </template>

                            <template v-if="summary.ConvenienceCertificates && summary.ConvenienceCertificates.Balance && !isCn">
                                <h3 class="m-checkoutLSD__title">{{ getLocalizationProp('Labels.CcBalance.ConvenienceCertificates', 'CONVENIENCE CERTIFICATES') }}</h3>
                                <p class="m-checkoutLSD__text">
                                    {{ getLocalizationProp('Labels.CcBalance.NewBalance', 'New balance:') }} <span class="m-checkoutLSD__amount">{{ summary.ConvenienceCertificates.FormattedBalance }}</span>
                                </p>
                            </template>
                        </div>
                    </div>
                    <div v-if="shippingOnUsEnabled" class="mt-10">
                        <m-shipping-on-us
                            v-if="rewardsConfigId"
                            :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                            :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                            :reward-config-id="rewardsConfigId"
                        >
                        </m-shipping-on-us>
                    </div>
                    <MAdditionalTax
                        v-if="summary.TaxGroups && (showGstBelowTotal || showVatBelowTotal)"
                        :labels="getLocalizationProp('Labels.AdditionalTaxSummary', {})"
                        :summary="summary"
                    />

                    <div
                        v-if="footerMessages"
                        class="p-checkout__rte"
                        v-html="footerMessages">
                    </div>
                </div>

                <!-- Right Column -->
                <div class="p-checkout__side" aria-live="polite">
                    <div class="p-checkout__sidebar">
                        <a-loading-spinner :visible="loading || checkoutPreferencesLoading" />

                        <m-become-member-card
                            v-if="showBecomeMemberCard && !isCn"
                            mods="-desktop"
                            :labels="getLocalizationProp('Labels.BecomeMember', {})">
                        </m-become-member-card>

                        <!-- Notice and banner used for CN -->
                        <o-cart-banner
                            v-if="isCn"
                            class="p-cart__banner hidden md:block"
                            :banner="getLocalizationProp('Data.NoticeAndBanner', {})"
                            :summary="summary"
                            :is-checkout="true"
                            :shipping-fee="getLocalizationProp('Data.ShippingFee', {})"
                            :is-preferred="isPreferred">
                        </o-cart-banner>

                        <m-cart-summary
                            v-if="showCartSummary"
                            :commitment="commitment"
                            :item-total="itemTotal"
                            :lsd-total="lsdTotal"
                            :lsd-used="lsdUsed"
                            :cc-total="ccTotal"
                            :coa-formatted="coaFormatted"
                            :show-gst-in-order-summary="showGstInOrderSummary"
                            :hide-sales-tax="hideSalesTax"
                            :is-preferred="isPreferred"
                            :is-cn="isCn"
                            :points="summary.Points"
                            :product-discount="productDiscount"
                            :pending-label="pendingLabel"
                            :redemption-fee="redemptionFee"
                            :sales-tax="summary.FormattedSalesTax"
                            :service-tax="serviceTaxFormatted"
                            :show-cc-total="isCCApplicable"
                            :show-lsd-total="isPreferred"
                            :show-lsd-redemption-fee="showLsdRedemptionFee"
                            :shipping-handling="selectedShippingOption.FormattedShipMethodQuote"
                            :shipping-on-us-marker="summary.ShippingOnUsMarker"
                            :show-shipping-on-us-marker="summary.ShowShippingOnUsMarker"
                            :show-purchase-commitment="showPurchaseCommitment"
                            :show-vat-in-order-summary="showVatInOrderSummary"
                            :subtotal="subTotal"
                            :total="totalCompFormatted"
                            :total-discount="totalDiscount"
                            :view-points="userFlags.ViewPoints"
                            @place-order="placeOrder">

                            <template v-slot:heading>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.Heading')"></span>
                            </template>

                            <template v-slot:item-total>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.ItemTotal')"></span>
                            </template>

                            <template v-slot:lsd-total>
                                <span role="text" v-html="getLocalizationProp('Labels.CheckoutSummary.LsdTotal')"></span>
                            </template>

                            <template v-slot:lsd-redemption-fee>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.LsdRedemptionFee')"></span>
                            </template>

                            <template v-slot:cc-total>
                                <span role="text" v-html="getLocalizationProp('Labels.CheckoutSummary.CcTotal')"></span>
                            </template>

                            <template v-slot:subtotal>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.SubTotal')"></span>
                            </template>

                            <template v-slot:coa>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.Coa')"></span>
                            </template>

                            <template v-slot:total>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.Total')"></span>
                            </template>

                            <template v-slot:points>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.Points')"></span>
                            </template>

                            <template v-slot:commitment>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.Commitment')"></span>
                            </template>

                            <template v-slot:shipping-handling>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.ShippingTaxes')"></span>
                            </template>

                            <template v-slot:sales-tax>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.SalesTax')"></span>
                            </template>

                            <template v-slot:product-discount>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.ProductDiscount')"></span>
                            </template>

                            <template v-slot:salex-taxes>
                                <span v-html="gstTaxLabel"></span>
                            </template>

                            <template v-slot:service-tax>
                                <span v-html="serviceTaxPercentageLabel"></span>
                            </template>

                            <template v-slot:vat-taxes>
                                <span v-html="vatLabel"></span>
                            </template>
                        </m-cart-summary>

                        <p v-if="!!preferredSavings && isPreferred && isCn" class="m-cartSavings">
                            <span class="m-cartSavings__heading">
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.AsPreferred', 'As a Preferred Member,')"></span>
                            </span>
                            <span v-html="preferredSavings"></span>
                        </p>

                        <!-- Guest Shopping - Terms and Conditions -->
                        <div v-if="showTermsConditions" class="p-checkout__terms">
                            <div class=" m-formField -checkbox">
                                <input
                                    v-model="termsIsChecked"
                                    class="a-input -checkbox"
                                    type="checkbox"
                                    name="terms"
                                    value=""
                                    aria-hidden="true">
                                <label
                                    for="terms"
                                    class="m-formField__label -checkbox"
                                    :class="{'-error': hasTermsError}"
                                    @click="termsConditions()">
                                    <span class="sr-only">
                                        {{ getLocalizationProp('Labels.TermsConditions.Checkbox.AriaLabel', 'By placing this order, I agree to abide by Melaleuca\'s Terms and Conditions') }}
                                    </span>
                                </label>
                                <button
                                    class="p-checkout__showTerms"
                                    @click="showTermsConditionsModal"
                                    v-html="getLocalizationProp('Labels.TermsConditions.Checkbox.Text')"></button>
                            </div>
                            <div v-if="hasTermsError" class="p-checkout__error mt-15 mb-0" role="alert">{{ getLocalizationProp('Labels.TermsConditions.Required') }}</div>
                        </div>

                        <div :class="{'hidden lg:block': showImprovedCTACheckout}">
                            <!-- Place Order Button | using checkout-attention-items as wrapper for handling non-AIF attention items -->
                            <m-checkout-attention-items
                                ref="checkout-attention-items"
                                :attention-items="attentionItems"
                                :disabled="loading || checkoutPreferencesLoading || loadingOrder || invalidCvv || paymentMethodError"
                                :handler="placeOrder"
                                :is-checkout-edit-account-info="isCheckoutEditAccountInfo"
                                :explicit-attention-items="explicitAttentionItems">

                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.PlaceOrder')"></span>

                                <template v-slot:between>
                                    <a-loading-spinner :visible="loadingOrder" />
                                    <template v-if="needFurtherPaymentValidation">
                                        <FormFieldErrorMessage
                                            modifier-classes="-icon-font-normal mt-10"
                                            :is-visible="payMethodErrorInfo.isPhoneNumberError"
                                            :msg="payMethodErrorInfo.phoneNumberErrorMsg"
                                        />
                                        <FormFieldErrorMessage
                                            modifier-classes="-icon-font-normal mt-10"
                                            :is-visible="payMethodErrorInfo.isEmailError"
                                            :msg="payMethodErrorInfo.emailErrorMsg"
                                        />
                                        <FormFieldErrorMessage
                                            modifier-classes="-icon-font-normal mt-10"
                                            :is-visible="notSatisfiedWithAtLeastOneInfo"
                                            :msg="getLocalizationProp('Labels.CardholderInfo.ErrorMessages.MobileOrEmailRequired')"
                                        />
                                    </template>
                                    <template v-if="showPaymentDeclineMessage">
                                        <em v-for="error in apiErrors" :key="uniqid(error.Original)" class="p-checkout__error mb-0 pb-0" role="alert">
                                            <span v-if="error.Translation">{{ error.Translation }}</span>
                                        </em>
                                    </template>
                                </template>

                            </m-checkout-attention-items>

                            <div v-if="showBackDatingText" v-html="backDatingText"></div>

                            <template v-if="!showPaymentDeclineMessage">
                                <em v-for="error in apiErrors" :key="uniqid(error.Original)" class="p-checkout__error" role="alert">
                                    <span v-if="error.Translation">{{ error.Translation }}</span>
                                </em>
                            </template>

                            <em v-if="hasFirstTimeCheckoutError && isCn" class="p-checkout__error" role="alert">
                                {{ getLocalizationProp('Labels.Checkout.SelectAddress') }}
                            </em>

                            <em v-if="hasCvvError && invalidCvv" class="p-checkout__error" role="alert">
                                {{ getLocalizationProp('Labels.Cvv.ErrorMessages.Empty') }}
                            </em>

                            <em v-if="hasTermsError" class="p-checkout__error mt-20" role="alert">
                                {{ getLocalizationProp('Labels.TermsConditions.Error') }}
                            </em>

                            <p
                                v-if="showMemberBenefitMessage && !isCn" class="m-cartSavings"
                                :class="{'mb-16':!showImprovedCTACheckout && shippingOnUsEnabled && shippingOnUsCurrentOffer.WillEarn}">
                                <span class="m-cartSavings__heading">
                                    <span v-html="getLocalizationProp('Labels.CheckoutSummary.AsPreferred', 'As a Preferred Member,')"></span>
                                    <br v-if="!showImprovedCTACheckout" />
                                </span>
                                <span v-html="preferredSavings"></span>
                            </p>
                        </div>

                        <!-- Order Summary VAT -->
                        <div v-if="showVAT" class="md:flex flex-col items-center">
                            <div class="md:flex">
                                <p class="p-checkout__seeDetail" v-html="getLocalizationProp('Data.VATSubText', 'Order Totals include VAT.')"></p>
                                <button
                                    type="button"
                                    class="p-checkout__seeDetail -link"
                                    @click="openVATModal()">
                                    {{ getLocalizationProp('Data.VATLinkText', 'See Details') }}
                                </button>
                            </div>
                        </div>

                        <!-- fpx terms-->
                        <div v-if="showFpx">
                            <p class="text-xs text-gray-150 italic pt-30 px-25 text-center md:text-left md:p-0" v-html="getLocalizationProp('Labels.CheckoutSummary.FpxTerms')"></p>
                        </div>

                        <!-- Shipping and handling section under Place Order button, for countries such as KR -->
                        <div v-if="shippingAndHandling" class="mt-30 md:mt-10">
                            <div
                                class="p-checkout__shippingAndHandling"
                                :class="{ '-allVisible': readMoreShipping }"
                                v-html="shippingAndHandling">
                            </div>
                            <button
                                type="button"
                                class="p-checkout__readMore"
                                @click="readMoreShipping = !readMoreShipping">
                                {{ readMoreShipping ? getLocalizationProp('Labels.CheckoutItem.ReadLessLabel') : getLocalizationProp('Labels.CheckoutItem.ReadMoreLabel') }}
                            </button>
                        </div>

                        <!-- International - Terms and Conditions -->
                        <o-accordion-modal script-id="accordionModal" />

                        <div v-if="shippingOnUsEnabled && shippingOnUsCurrentOffer.WillEarn && shippingBack">
                            <!-- shipping on us rebate value -->
                            <p v-if="showImprovedCTACheckout" class="text-base">
                                <span v-if="summary.ShowShippingOnUsMarker">{{ summary.ShippingOnUsMarker }}&nbsp;</span>
                                {{ shippingBack }}
                                <span><strong>{{ shippingOnUsCurrentOffer.FormattedReimbursementValue }}</strong></span>
                            </p>
                            <div v-else class="text-center my-20 md:mx-auto md:w-5_6 md:leading-tight">
                                <p class="text-base md:text-xl"><span v-if="summary.ShowShippingOnUsMarker">{{ summary.ShippingOnUsMarker }}&nbsp;</span>{{ shippingBack }}</p>
                                <p class="text-base md:text-xl"><strong>{{ shippingOnUsCurrentOffer.FormattedReimbursementValue }}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3D Payment Portal Iframe -->
            <EasypayPortal
                ref="portal"
                :is-visible="showPortal"
                :pay-info="portalData"
                :card-id="cardChoice"
                :install-id="installmentChoice"
                :url="getLocalizationProp('Data.Easypay.Url', '')"
            />

            <!-- FPX Payment -->
            <FpxPayment
                ref="fpx"
                :is-visible="showFpx"
                :pay-info="fpxData"
            />

            <!-- Dragon Pay -->
            <DragonPay
                ref="dragon"
                :is-visible="showDragonPay"
                :pay-info="dragonData"
            />

            <!-- OptIframe Payment Portal Iframe -->
            <OtpPayment
                ref="otp"
                :is-visible="showOtp"
                :pay-info="otpData"
                :token-info="otpTokenInfo"
                v-on:sessionIdAvailable="onSessionIdAvailable"
            />

            <!-- CVV Modal -->
            <modal id="modal-cvv" width="400px">
                <template v-slot:content>
                    <div class="m-termsModal__body" v-html="getLocalizationProp('Labels.Cvv.CvvModal.CvvModalContent')"></div>

                    <button
                        v-modal-hide
                        type="button"
                        class="a-button p-checkout__cvvModalBtn">
                        {{ getLocalizationProp('Labels.Checkout.Close', 'Close') }}
                    </button>
                </template>
            </modal>

            <modal id="modal-rap-deposit" width="600px">
                <template v-slot:content>
                    <div v-html="getLocalizationProp('Data.RAPDepositModal.RAPDepositModalText')"></div>
                </template>
            </modal>

            <modal id="modal-poland-wire-transfer" width="700px">
                <template v-slot:content>
                    <div
                        v-html="getLocalizationProp(
                            'Data.PolandWireTransfer.PolandWireTransferMessage'
                        )"
                    />
                </template>
            </modal>

            <!-- Modal used in case of payment fail -->
            <modal id="modal-payment-failed" width="600px">
                <template v-slot:content>
                    <div class="px-30 md:px-0">
                        <h2
                            id="global-modal-heading"
                            class="font-bold text-2xl text-gray-150 md:font-normal md:text-4xl md:text-dark leading-tight md:mb-5">
                            {{ paymentFailedModal.title }}
                        </h2>
                        <div class="text-sm text-gray-120">{{ paymentFailedModal.description }}</div>
                        <button
                            v-modal-hide
                            type="button"
                            class="a-button -green text-base text-center font-medium mt-30 mb-30 md:mb-0 pt-12 pb-7 md:py-12 px-40">
                            {{ paymentFailedModal.cta }}
                        </button>
                    </div>
                </template>
            </modal>

            <!-- TO DO - Add modal-payment-failed-paypal -->

            <!-- Cross country address modal -->
            <modal id="modal-cross-country-address" width="630px">
                <template v-slot:content>
                    <div class="px-30 md:px-0">
                        <div
                            class="m-rte"
                            role="text"
                            v-html="crossCountryModalRTE">
                        </div>
                        <div class="flex flex-col md:flex-row mt-30">
                            <button
                                v-modal-hide
                                type="button"
                                class="a-button -white justify-center text-base text-center font-medium mr-10 py-12 px-60 mb-20 md:mb-0">
                                {{ getLocalizationProp('Data.CrossCountryModal.Cancel') }}
                            </button>

                            <button
                                type="button"
                                class="a-button -green justify-center text-base text-center font-medium py-12 px-15 mr-10"
                                @click="continueCrossCountryAddress">
                                {{ crossCountryModalContinue }}
                            </button>

                            <a-loading-spinner v-if="crossCountryAddressLoading" :visible="crossCountryAddressLoading" size="sm" />
                        </div>
                    </div>
                </template>
            </modal>

            <!-- Service Failure Modal -->
            <modal id="modal-service-failure" width="630px">
                <template v-if="getLocalizationProp('Labels.ServiceFailure', {})" v-slot:content>
                    <h2 class="p-checkout__errorTitle" v-html="getLocalizationProp('Labels.ServiceFailure.Title', '')"></h2>
                    <p class="p-checkout__errorText" v-html="getLocalizationProp('Labels.ServiceFailure.GenericFailureMessage', '')"></p>
                    <v-button class="p-checkout__errorButton" @click="reloadPage">
                        {{ getLocalizationProp('Labels.ServiceFailure.RefreshPage', '') }}
                    </v-button>
                </template>
            </modal>

            <modal id="modal-invalid-shipping" width="500px">
                <template v-slot:content>
                    <div v-html="modalInvalidShippingRte"></div>

                    <v-button class="p-checkout__errorButton -white mb-20" @click="onChooseAddressButtonClick">
                        {{ modalInvalidShippingButtonChooseAddressText }}
                    </v-button>
                    <a :href="modalInvalidShippingButtonVerifyAddressUrl">
                        <v-button class="p-checkout__errorButton">
                            {{ modalInvalidShippingButtonVerifyAddressText }}
                        </v-button>
                    </a>
                </template>
            </modal>

            <!-- Guest Terms & Conditions Modal -->
            <modal id="terms-conditions" width="900px" heading-class="m-termsModal__heading">
                <template v-slot:heading>
                    {{ getLocalizationProp('Labels.TermsConditions.Modal.Heading', 'Customer Membership Agreement Terms & Conditions') }}
                </template>

                <template v-slot:body>
                    <div class="m-termsModal__body" v-html="getLocalizationProp('Labels.TermsConditions.Modal.Body')">
                    </div>
                </template>

                <template v-slot:footer>
                    <button
                        v-modal-hide
                        type="button"
                        class="m-termsModal__footer a-button -white">
                        {{ getLocalizationProp('Labels.TermsConditions.Modal.ButtonText', 'Close') }}
                    </button>
                </template>
            </modal>

            <!-- VAT popup modal -->
            <modal id="vat-popup" width="500px">
                <template v-slot:heading>
                    {{ getLocalizationProp('Data.VATPopupModal.VATModelText', 'Order Summary.') }}
                </template>

                <template v-slot:body>
                    <div class="flex justify-between py-10">
                        <p>{{ getVatSubTotalLabel }}</p>
                        <p>{{ getCartGrossTotal }}</p>
                    </div>
                    <div class="flex justify-between py-10">
                        <p>{{ getVatPointTotal }}</p>
                        <p>{{ getSalesTax }}</p>
                    </div>
                    <hr class="my-5" />
                    <div class="flex justify-between py-10 font-bold">
                        <p>{{ getLocalizationProp('Data.VATPopupModal.GrandTotal', 'Grand Total') }}</p>
                        <p>{{ getCartNetTotal }}</p>
                    </div>
                </template>

                <template v-slot:footer>
                    <div class="md:flex">
                        <button
                            class="a-button text-base font-medium py-12 px-30 mr-10 inline-block mb-10 md:px-40 md:mb-0"
                            type="button"
                            @click="closeVATModal()"
                        >
                            {{ getLocalizationProp('Data.VATPopupModal.Close', 'Close') }}
                        </button>
                    </div>
                </template>
            </modal>

        </div>
        <MStickyToast
            v-if="showImprovedCTACheckout"
            :loading="loading"
            leave-space
            class="lg:hidden px-10">
            <template v-slot:default>
                <div
                    class="flex px-10 items-center"
                    :class="showMemberBenefitMessage ? 'justify-between md:justify-center' : 'justify-around'">
                    <div>
                        <div class="font-bold text-base">
                            <span>{{ getLocalizationProp('Labels.CheckoutSummary.Total') }}</span>
                            <span v-html="totalCompFormatted"></span>
                        </div>
                        <div v-if="userFlags.ViewPoints" class="text-sm" :class="{ 'text-center': !showMemberBenefitMessage }">
                            <span>{{ summary.Points }}</span>
                            <span>{{ getLocalizationProp('Labels.CheckoutItem.Points') }}</span>
                        </div>
                    </div>
                    <p
                        v-if="showMemberBenefitMessage"
                        class="ml-0 md:ml-1_12 text-right text-sm">
                        <span>
                            <span>{{ getLocalizationProp('Labels.CheckoutSummary.AsPreferred') }}</span>
                            <br />
                        </span>
                        <span class="text-red" v-html="preferredSavings"></span>
                    </p>
                </div>
            </template>
            <template v-slot:alerts>
                <MCollapsedAlerts
                    class="flex flex-col px-0 md:px-40"
                    :attention-item-error-messages="attentionItemErrorMessages"
                    :additional-messages-for-sticky-toast="additionalMessagesForStickyToast"
                    :has-back-dating-note="backDatingText!==null"
                    :show-more-label="getLocalizationProp('Labels.CheckoutSummary.ShowMore')" />
            </template>
            <template v-slot:cta>
                <m-checkout-attention-items
                    ref="checkout-attention-items"
                    :attention-items="attentionItems"
                    :disabled="loading || checkoutPreferencesLoading || loadingOrder|| invalidCvv || paymentMethodError"
                    :handler="placeOrder"
                    :is-checkout-edit-account-info="isCheckoutEditAccountInfo"
                    :explicit-attention-items="explicitAttentionItems"
                    :invalid-cvv="invalidCvv"
                    :is-sticky-toast-visible="true">
                    <span v-html="getLocalizationProp('Labels.CheckoutSummary.PlaceOrder')"></span>
                    <template v-slot:between>
                        <a-loading-spinner :visible="loadingOrder" />
                    </template>
                </m-checkout-attention-items>
            </template>
        </MStickyToast>
    </div>

</template>

<script>
    import { mapActions, mapMutations, mapState, mapGetters } from 'vuex';
    import CheckoutConvenienceStore from '../../02-organisms/checkout/checkout-convenience-store.vue';
    import CheckoutFpxBanks from '../../02-organisms/checkout/checkout-fpx-banks.vue';
    import CheckoutGuiCarrier from '../../02-organisms/checkout/checkout-gui-carrier.vue';
    import CheckoutInstallment from '../../02-organisms/checkout/checkout-installment.vue';
    import CheckoutVirtualPayment from '../../02-organisms/checkout/checkout-virtual-payment.vue';
    import DragonPay from '../../02-organisms/dragon-pay/dragon-pay.vue';
    import EasypayPortal from '../../02-organisms/easy-pay/easy-pay.vue';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import FpxPayment from '../../02-organisms/fpx-payment/fpx-payment.vue';
    import MAdditionalTax from '../../01-molecules/additional-tax/additional-tax.vue';
    import MCollapsedAlerts from '../../01-molecules/collapsed-alerts/collapsed-alerts.vue';
    import MStickyToast from '../../01-molecules/sticky-toast/sticky-toast.vue';
    import MCartShippingOnUsBanner from '../../01-molecules/shipping-on-us/cart-shipping-on-us-banner.vue';
    import OtpPayment from '../../02-organisms/otp-payment/otp-payment.vue';
    import checkoutLogic from '../../../mixins/checkout-logic';
    import OSequentialSection from '../../02-organisms/sequential-section/sequential-section.vue';
    import OCheckoutShippingAddressesConfigurable from '../../02-organisms/checkout/checkout-shipping-addresses-configurable.vue';

    export default {
        name: 'PCheckout',
        components: {
            CheckoutConvenienceStore,
            CheckoutFpxBanks,
            CheckoutGuiCarrier,
            CheckoutInstallment,
            CheckoutVirtualPayment,
            DragonPay,
            EasypayPortal,
            FormFieldErrorMessage,
            FpxPayment,
            MAdditionalTax,
            MCollapsedAlerts,
            MStickyToast,
            MCartShippingOnUsBanner,
            OtpPayment,
            OSequentialSection,
            OCheckoutShippingAddressesConfigurable
        },
        mixins: [ checkoutLogic ],
        data() {
            return {
                savedAddress: {},
                showAddressEditView: false,
                hasBusinessAddress: false,
                hasShippingAddress: false,
                isShowShippingAddForm: true,
                isShowBusinessAddForm: false,
                isInCheckout: true
            };
        },
        computed: {
            ...mapState('shippingAddress', ['addresses']),
            ...mapGetters('checkoutAccordions', ['paymentMethodError']),
            enableCvsPickUp() {
                return this.getLocalizationProp('Data.EnableCVSPickUp', false);
            },
            enableLSDSummaryEnhancement() {
                return this.getLocalizationProp('Data.EnableLSDSummaryEnhancement', false);
            },
            isCheckoutEditAccountInfo() {
                return this.useOleShippingAddressFeatureFlag || this.enableCvsPickUp;
            },
            isSavedAddress() {
                return this.savedAddress.business && this.savedAddress.shipping;
            },
            lsdTitleToolTip() {
                return this.getLocalizationProp('Labels.LsdBalance.TitleToolTip');
            },
            shippingAddressesSequenceIndex() {
                return this.enableCvsPickUp ? 1 : 0;
            },
            shippingBack() {
                return this.getLocalizationProp('Labels.ShippingOnUs.ShippingBack');
            },
            useOleShippingAddressFeatureFlag() {
                return this.getLocalizationProp('Data.UseOleShippingAddressFeatureFlag');
            },
            pendingLabel() {
                return this.showImprovedCTACheckout ? this.getLocalizationProp('Labels.CheckoutSummary.Pending') : '--';
            }
        },
        mounted() {
            if(this.useOleShippingAddressFeatureFlag) {
                this.initializeSequence(1);
                this.setIsOleCheckout();
            }
            if(this.enableCvsPickUp) {
                this.initializeSequence(4);
                this.setIsOleCheckout();
            }
        },
        methods: {
            ...mapActions('sequentialSections', ['initializeSequence', 'completeSequence', 'updateSequence', 'setSpecificSequenceObjectActive']),
            ...mapActions('shippingAddress', ['fetchAddresses', 'fetchAllAddresses']),
            ...mapActions('checkout', ['getCheckout']),

            ...mapMutations('checkout', ['SET_OLE_CHECKOUT_INITIAL_CALL']),
            formatLsdItem(key) {
                return this.summary?.LoyaltyShoppingDollars?.[`Formatted${key}`];
            },
            async getDataAgain(isBusiness, newAddressId) {
                // get business address also when gets added thru business address form
                const addressType = isBusiness ? 'businessAddress' : 'shippingAddress';
                // get only shipping address next time onwards
                this.SET_OLE_CHECKOUT_INITIAL_CALL(false);
                if(isBusiness) {
                    await this.fetchAddresses(addressType);
                } else {
                    await this.fetchAllAddresses();
                }

                const newAddress = this.addresses.find((address) => address.AddressId === newAddressId);
                if(newAddress && newAddress.AddressId) {
                    // update checkout to select newly added shipping address
                    this.updateInfo({
                        Country: newAddress.Country,
                        LastVerifiedDateTime: newAddress.LastVerifiedDateTime,
                        ShippingAddressId: newAddress.AddressId,
                        WarehouseGroupName: newAddress.WarehouseGroupName,
                        WithinCurrentCountry: newAddress.WithinCurrentCountry
                    });
                } else {
                    this.getCheckout();
                }
            },
            hasLsdItemVal(key) {
                const lsdVal = this.summary?.LoyaltyShoppingDollars?.[key];
                return typeof lsdVal === 'number' && lsdVal >= 0;
            },
            onListShown(ref) {
                this.$refs[ref]?.updateScroll();
            },
            setAddressEditComp() {
                this.showAddressEditView = true;
                this.setSpecificSequenceObjectActive(this.shippingAddressesSequenceIndex);
            },
            setaddressFormProps(e) {
                this.isShowShippingAddForm = e.shippingAddressForm;
                this.isShowBusinessAddForm = e.businessAddressForm;
            },
            setAvailableAddresses(ship, bus) {
                this.hasShippingAddress = ship;
                this.hasBusinessAddress = bus;
            },
            setBusinessAddEditOrShippingAddress() {
                if(this.isSavedAddress) {
                    this.showAddressEditView = false;
                    this.setSpecificSequenceObjectActive(this.shippingAddressesSequenceIndex);
                } else {
                    this.setAddressEditComp();
                }
            },
            setIsOleCheckout() {
                // set isInCheckout to get all addresses(shipping or business) for initial call
                this.SET_OLE_CHECKOUT_INITIAL_CALL(true);
            },
            updateAddresses(value) {
                this.savedAddress = value;
            },
            updateStatus(sequenceInfo) {
                if(sequenceInfo.completed) {
                    this.completeSequence(sequenceInfo);
                } else {
                    this.updateSequence(sequenceInfo);
                }
            }
        }
    };

</script>
