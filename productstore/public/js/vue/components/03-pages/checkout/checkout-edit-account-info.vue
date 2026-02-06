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

                    <!-- Ship To -->
                    <form
                        @submit.prevent>
                        <OSequentialSection
                            ref="shippingAddressSequence"
                            container-type="fieldset"
                            title-type="legend"
                            :title-copy="getLocalizationProp('Labels.Checkout.ShippingAddress')"
                            :sequence-index="0"
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
                                :is-in-checkout="isInCheckout"
                                :show-address-edit-view="showAddressEditView"
                                :is-business="false"
                                :script-id="scriptId"
                                :has-business-address="hasBusinessAddress"
                                :has-shipping-address="hasShippingAddress"
                                :mx-address-entry-enhancement-enabled="mxAddressEntryEnhancementEnabled"
                                :show-shipping-add-form="isShowShippingAddForm"
                                :show-business-add-form="isShowBusinessAddForm"
                                @completedStatus="updateAddressStatus"
                                @getDataAgain="getDataAgain"
                                @isAddressFormOpen="(isOpen) => isAddressFormOpen = isOpen"
                                @shippingAndBusinessAddress="updateAddresses"
                                @openAddressEditDelete="setAddressEditComp"
                                @hasAddresses="setAvailableAddresses"
                                @setAddressFormProps="setaddressFormProps"
                                @cross-country-address="openCrossCountryAddress"
                                @update="updateInfo"
                            />
                        </OSequentialSection>

                        <OSequentialSection
                            ref="shipMethodSequence"
                            container-type="fieldset"
                            title-type="legend"
                            :title-copy="getLocalizationProp('Labels.Checkout.ShipMethod')"
                            :highlighted-extra-title-info="getExtraTitle"
                            :sequence-index="1"
                            :hide-change-button="hasOneShipOption"
                            :change-label="getLocalizationProp('Labels.ShippingSection.Change')"

                        >
                            <template v-if="hasShippingMethod" v-slot:selctedTitle>
                                <div>
                                    <div class="mt-40">
                                        <m-checkout-shipping-label
                                            :carrier="selectedShippingOption.Carrier || selectedShippingOption.CarrierDisplayName"
                                            :date="selectedShippingOption.FormattedEstimatedDateTo"
                                            :get-by-label="getByLabel"
                                            :hide-carrier="selectedShippingOption.HideCarrier"
                                            :hide-ship-method="getLocalizationProp('Data.HideShipMethod', false)"
                                            :quote="selectedShippingOption.FormattedShipMethodQuote"
                                            :ship-method="selectedShippingOption.FormattedShipMethod ? selectedShippingOption.FormattedShipMethod : selectedShippingOption.ShipMethod" />
                                    </div>
                                    <div v-if="hasQualifiedForOffer && !shippingConfigId" class="p-checkout__rmbrsmntLsd" v-html="reimbursedInLsd"></div>
                                </div>

                            </template>
                            <OCheckoutShippingMethodsConfigurable
                                v-if="!loading && !endpointError"
                                :index="1"
                                :get-by-label="getLocalizationProp('Labels.Checkout.GetBy')"
                                :title="getLocalizationProp('Labels.Checkout.Shipping', 'Shipping')"
                                :continue-label="getLocalizationProp('Labels.CTA.Continue', 'Save')"
                                :current-offer="shippingOnUsCurrentOffer"
                                :has-shipping-method="hasShippingMethod"
                                :hide-ship-method="getLocalizationProp('Data.HideShipMethod', false)"
                                :reimbursed-in-lsd="reimbursedInLsd"
                                @completedStatus="updateStatus"
                                @update="updateInfo"
                            >
                            </OCheckoutShippingMethodsConfigurable>
                        </OSequentialSection>
                        <!-- Shipping on Us Banner -->
                        <div v-if="!hasQualifiedForOffer" class="p-checkout__shippingOnUsBanner">
                            <m-shipping-on-us
                                v-if="shippingOnUsEnabled && summary.Points !== 0 && shippingConfigId"
                                :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                                :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                                :shipping-config-id="shippingConfigId"
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

                        <OSequentialSection
                            ref="payMethodSequence"
                            class="px-5 sm:px-10 md:px-20"
                            :class="computedSiblingClass"
                            container-type="fieldset"
                            content-mods="-mx-12"
                            title-type="legend"
                            :title-copy="getLocalizationProp('Labels.Checkout.PayMethod', 'Pay Method')"
                            :sequence-index="2"
                            :change-label="getLocalizationProp('Labels.PayMethodSection.Change', 'Change')"
                            :hide-change-button="!hasShippingMethod"
                            @shown="onListShown('paymentMethods')"
                        >
                            <template v-if="hasPayMethod && hasShippingMethod" v-slot:selctedTitle>
                                <div class="mt-50" />

                                <!-- SHOWN WHILE COLLAPSED -->
                                <div role="alert">
                                    <div
                                        v-if="hasInlinePayMethodError"
                                        class="text-red text-sm mb-25"
                                        v-html="getLocalizationProp('Labels.PayMethodSection.CheckingPaperworkError', '<p>To continue using electronic checking, please upload a voided check.</p>')"
                                    />
                                </div>

                                <p
                                    v-if="showExpirationMsg"
                                    class="text-red text-sm mb-20"
                                    v-html="expirationMsg"
                                />

                                <MCheckoutPayLabel
                                    :expired-label="getLocalizationProp('Labels.Checkout.Expired', 'Expired')"
                                    :expires-label="getLocalizationProp('Labels.Checkout.Expires', 'Expires')"
                                    :show-expired-date="true"
                                />

                                <!-- Needs top margin when not in payment form -->
                                <expandable-message
                                    v-if="showExpandableMessage"
                                    :message-text="expandableMessageText"
                                    :message-text-expanded="expandableMessageTextFull"
                                    :mods="'mt-15'"
                                    :less-text="getLabels('Labels.PaymentForm.Checking.Less')"
                                    :more-text="getLabels('Labels.PaymentForm.Checking.More')">
                                </expandable-message>
                            </template>

                            <!-- SHOWN WHILE EXPANDED -->
                            <div role="alert">
                                <div
                                    v-if="hasInlinePayMethodError"
                                    class="text-red text-sm mt-5 mb-25 ml-16"
                                    v-html="getLocalizationProp('Labels.PayMethodSection.CheckingPaperworkError', '<p>To continue using electronic checking, please upload a voided check.</p>')"
                                />
                            </div>

                            <p
                                v-if="showExpirationMsg"
                                class="text-red text-sm mt-5 mb-20 px-16"
                                v-html="expirationMsg"
                            />

                            <OCheckoutPaymentMethodsConfigurable
                                ref="paymentMethods"
                                class="px-16"
                                :has-cvv-error="hasCvvError"
                                :has-pay-method="hasPayMethod"
                                :index="2"
                                :invalid-cvv="invalidCvv"
                                :is-cn="isCn"
                                :is-guest-shopping="isGuestShopping"
                                :is-kr="isKr"
                                :modal-labels-delete-pay-method="modalLabelsDeletePayMethod"
                                :script-id="scriptId"
                                @payment-form-visible="isPaymentFormVisible = $event"
                                @payment-saved="onPaymentSaved"
                                @update="updateInfo"
                            />
                        </OSequentialSection>

                        <div v-if="showSeparateCvvField" class="p-checkout__cvv">
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
                                    :tailwind-mods="`bg-clear p-checkout__input ${hasCvvError && invalidCvv ? '-isInvalid' : ''}`"
                                    model-name="cvvCode"
                                    aria-required="true"
                                    @keydown="handleInteger">
                                </input-basic>
                            </div>
                        </div>
                    </form>

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
                            @coaApply="coaApply"
                            @coaReset="coaReset" />
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
                                    :is-receipt="false"
                                    :free-label="getLocalizationProp('Labels.Checkout.Free')"
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

                    <div v-if="shippingOnUsEnabled" class="m-checkoutLSD">
                        <h3 class="m-checkoutLSD__title">
                            {{ getLocalizationProp("Labels.LsdBalance.LoyaltyShoppingDollars") }}
                        </h3>

                        <p class="m-checkoutLSD__text">
                            {{ getLocalizationProp("Labels.LsdBalance.ToSpend") }}
                            <span v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__amount">
                                {{ summary.LoyaltyShoppingDollars.FormattedAvailableToSpend }}
                            </span>
                        </p>
                        <p
                            v-if="!isCn && summary.LoyaltyShoppingDollars && summary.LoyaltyShoppingDollars.AvailableToActivate > 0"
                            class="m-checkoutLSD__text"
                        >
                            {{ getLocalizationProp("Labels.LsdBalance.AvailableToActivate") }}
                            <span v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__amount">
                                {{ summary.LoyaltyShoppingDollars.FormattedAvailableToActivate }}
                            </span>
                        </p>
                        <p v-if="shippingOnUsCurrentOffer.WillEarn" class="m-checkoutLSD__text">
                            {{ getLocalizationProp("Labels.LsdBalance.EarnedThisOrder") }}
                            <span class="m-checkoutLSD__amount">
                                {{ shippingOnUsCurrentOffer.FormattedReimbursementValue }}
                            </span>
                        </p>
                        <p v-if="summary.LoyaltyShoppingDollars && summary.LoyaltyShoppingDollars.LsdExpiringInCurrentMonth" class="m-checkoutLSD__text">
                            {{ getLocalizationProp("Labels.LsdBalance.ExpiringThisMonth") }}
                            <span class="m-checkoutLSD__amount">
                                {{ summary.LoyaltyShoppingDollars.FormattedLsdExpiringInCurrentMonth }}
                            </span>
                        </p>
                    </div>
                    <div v-else>
                        <!-- todo: hide based on user type  -->
                        <div v-if="showLsdBanner || (summary.ConvenienceCertificates && summary.ConvenienceCertificates.Balance && !isCn)" class="m-checkoutLSD">
                            <template v-if="showLsdBanner">
                                <h3 class="m-checkoutLSD__title">{{ getLocalizationProp('Labels.LsdBalance.LoyaltyShoppingDollars', 'LOYALTY SHOPPING DOLLARS') }}</h3>
                                <p v-if="isCn ? summary.LoyaltyShoppingDollars.Earned >= 0 : summary.LoyaltyShoppingDollars.Earned" class="m-checkoutLSD__text">
                                    {{ getLocalizationProp('Labels.LsdBalance.Earned', 'Earned this order:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedEarned }}</span>
                                </p>
                                <template v-if="!isCn">
                                    <p v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__text">
                                        {{ getLocalizationProp('Labels.LsdBalance.AvailableToActivate', 'Available To Activate:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedAvailableToActivate }}</span>
                                    </p>
                                    <p v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__text">
                                        {{ getLocalizationProp('Labels.LsdBalance.AvailableToSpend', 'Available To Spend:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedAvailableToSpend }}</span>
                                    </p>
                                </template>
                                <template v-if="isCn">
                                    <p v-if="isCn ? summary.LoyaltyShoppingDollars.Balance >= 0 : summary.LoyaltyShoppingDollars.Balance" class="m-checkoutLSD__text">
                                        {{ getLocalizationProp('Labels.LsdBalance.NewBalance', 'New balance:') }} <span class="m-checkoutLSD__amount">{{ summary.LoyaltyShoppingDollars.FormattedNewBalance }}</span>
                                    </p>
                                </template>
                            </template>

                            <template v-if="summary.ConvenienceCertificates && summary.ConvenienceCertificates.Balance && !isCn">
                                <h3 class="m-checkoutLSD__title">{{ getLocalizationProp('Labels.CcBalance.ConvenienceCertificates', 'CONVENIENCE CERTIFICATES') }}</h3>
                                <p class="m-checkoutLSD__text">
                                    {{ getLocalizationProp('Labels.CcBalance.NewBalance', 'New balance:') }} <span class="m-checkoutLSD__amount">{{ summary.ConvenienceCertificates.FormattedBalance }}</span>
                                </p>
                            </template>
                        </div>
                    </div>

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
                            :show-lsd-total="isPreferred"
                            :lsd-total="lsdTotal"
                            :lsd-used="lsdUsed"
                            :show-cc-total="isCCApplicable"
                            :cc-total="ccTotal"
                            :total="totalCompFormatted"
                            :subtotal="subTotal"
                            :coa-formatted="coaFormatted"
                            :points="summary.Points"
                            :sales-tax="formattedSalesTax"
                            :hide-sales-tax="hideSalesTax"
                            :shipping-handling="formattedShippingMethodQuote"
                            :is-cn="isCn"
                            :redemption-fee="redemptionFee"
                            :show-lsd-redemption-fee="showLsdRedemptionFee"
                            :show-welcome-program-lsd="showWelcomeProgramLsd"
                            :product-discount="productDiscount"
                            :total-discount="totalDiscount"
                            :is-preferred="isPreferred"
                            :shipping-on-us-marker="summary.ShippingOnUsMarker"
                            :show-shipping-on-us-marker="summary.ShowShippingOnUsMarker"
                            :view-points="userFlags.ViewPoints"
                            :welcome-program-lsd="summary.WelcomeProgramLsdAvailable && summary.WelcomeProgramLsdAvailable.FormattedUsed"
                            @place-order="placeOrder">

                            <template v-slot:heading>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.Heading')"></span>
                            </template>

                            <template v-slot:item-total>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.ItemTotal')"></span>
                            </template>

                            <template v-slot:welcome-program-lsd>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.WelcomeFreeProductsUsedInThisOrder')"></span>
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

                            <template v-if="!isCn" v-slot:points>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.Points')"></span>
                            </template>

                            <template v-if="isCn" v-slot:commitment>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.Commitment')"></span>
                            </template>

                            <template v-slot:shipping-handling>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.ShippingTaxes')"></span>
                                <span v-if="!formattedShippingMethodQuote">
                                    {{ getLocalizationProp('Labels.CheckoutSummary.Calculated') }}
                                </span>
                            </template>

                            <template v-slot:sales-tax>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.SalesTax')"></span>
                                <span v-if="!formattedSalesTax">
                                    {{ getLocalizationProp('Labels.CheckoutSummary.Calculated') }}
                                </span>
                            </template>

                            <template v-slot:product-discount>
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.ProductDiscount')"></span>
                            </template>

                        </m-cart-summary>

                        <p v-if="!!preferredSavings && isPreferred && isCn" class="m-cartSavings">
                            <span class="m-cartSavings__heading">
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.AsPreferred', 'As a Preferred Member,')"></span>
                                <br />
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
                                :hide="Boolean(shippingMessage)"
                                :attention-items="attentionItems"
                                :disabled="loading || checkoutPreferencesLoading || loadingOrder"
                                :handler="placeOrder"
                                :has-sequence-open-error="hasSequenceOpenError"
                                :show-sequence-open-error-on-checkout="showSequenceOpenAttentionItemError"
                                :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                                :is-checkout-edit-account-info="true"
                                :excluded-inline-attention-items="excludedInlineAttentionItems"
                                :explicit-attention-items="explicitAttentionItems"
                                :visually-disabled="isVisuallyDisabled">
                                <span v-html="getLocalizationProp('Labels.CheckoutSummary.PlaceOrder')"></span>

                                <template v-slot:between>
                                    <a-loading-spinner :visible="loadingOrder" />
                                    <template v-if="showPaymentDeclineMessage">
                                        <em v-for="error in apiErrors" :key="uniqid(error.Original)" class="p-checkout__error mb-0 pb-0" role="alert">
                                            <span v-if="error.Translation">{{ error.Translation }}</span>
                                        </em>
                                    </template>
                                </template>
                            </m-checkout-attention-items>

                            <em v-if="showSequenceOpenErrorOnCheckout && activeSequenceErrorMessage" class="p-checkout__error" role="alert">
                                {{ activeSequenceErrorMessage }}
                            </em>

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

                        <div v-if="shippingOnUsEnabled && shippingOnUsCurrentOffer.WillEarn">
                            <!-- shipping on us rebate value -->
                            <p v-if="showImprovedCTACheckout" class="text-base">
                                <span v-if="summary.ShowShippingOnUsMarker">{{ summary.ShippingOnUsMarker }}&nbsp;</span>
                                {{ getLocalizationProp('Labels.ShippingOnUs.ShippingBack') }}
                                <span><strong>{{ shippingOnUsCurrentOffer.FormattedReimbursementValue }}</strong></span>
                            </p>
                            <div v-else class="text-center my-20 md:mx-auto md:w-5_6 md:leading-tight">
                                <p class="text-base md:text-xl"><span v-if="summary.ShowShippingOnUsMarker">{{ summary.ShippingOnUsMarker }}&nbsp;</span>{{ getLocalizationProp('Labels.ShippingOnUs.ShippingBack') }}</p>
                                <p class="text-base md:text-xl"><strong>{{ shippingOnUsCurrentOffer.FormattedReimbursementValue }}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <modal id="modal-rap-deposit" width="600px">
                <template v-slot:content>
                    <div v-html="getLocalizationProp('Data.RAPDepositModal.RAPDepositModalText')"></div>
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

            <!-- Modal used in case of payment fails - for PayPal pay method only -->
            <modal id="modal-payment-failed-paypal" width="600px">
                <template v-slot:content>
                    <div class="px-30 md:px-0">
                        <h2
                            id="global-modal-heading"
                            class="font-bold text-2xl text-gray-150 md:font-normal md:text-4xl md:text-dark leading-tight md:mb-5">
                            {{ paymentFailedPaypalModal.title }}
                        </h2>
                        <div class="text-sm text-gray-120">{{ paymentFailedPaypalModal.description }}</div>
                        <PayPal
                            :is-checkout="true"
                            :paypal-billing-agreement-label="paypalBillingAgreementLabel"
                            :paypal-client-token="paypalClientToken"
                            @paypal-data="handlePayPalCheckoutData"
                        />
                    </div>
                </template>
            </modal>

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
        </div>
        <MStickyToast
            v-if="showImprovedCTACheckout"
            class="lg:hidden px-10"
            :loading="loading">
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
                    :sequence-open-error-messages-for-sticky-toast="sequenceOpenErrorMessagesForStickyToast"
                    :additional-messages-for-sticky-toast="additionalMessagesForStickyToast"
                    :has-back-dating-note="backDatingText!==null"
                    :has-sequence-open-error="hasSequenceOpenError"
                    :show-sequence-open-error-on-checkout="showSequenceOpenError"
                    :show-more-label="getLocalizationProp('Labels.CTA.ShowMore')" />
            </template>
            <template v-slot:cta>
                <m-checkout-attention-items
                    ref="checkout-attention-items"
                    :hide="Boolean(shippingMessage)"
                    :attention-items="attentionItems"
                    :disabled="loading || checkoutPreferencesLoading || loadingOrder"
                    :handler="placeOrder"
                    :has-sequence-open-error="hasSequenceOpenError"
                    :show-sequence-open-error-on-checkout="showSequenceOpenError"
                    :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                    :is-checkout-edit-account-info="true"
                    :excluded-inline-attention-items="excludedInlineAttentionItems"
                    :explicit-attention-items="explicitAttentionItems"
                    :is-sticky-toast-visible="true"
                    :visually-disabled="isVisuallyDisabled">
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
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
    import AifInvalidShippingAddress from '../../01-molecules/attention-items/modals/aif-invalid-shipping-address.vue';
    import AifNoPayMethod from '../../01-molecules/attention-items/modals/aif-no-pay-method.vue';
    import ExpandableMessage from '../../01-molecules/expandable-message/expandable-message.vue';
    import MCheckoutPayLabel from '../../01-molecules/checkout/checkout-pay-label.vue';
    import MCollapsedAlerts from '../../01-molecules/collapsed-alerts/collapsed-alerts.vue';
    import MStickyToast from '../../01-molecules/sticky-toast/sticky-toast.vue';
    import OSequentialSection from '../../02-organisms/sequential-section/sequential-section.vue';
    import OCheckoutPaymentMethodsConfigurable from '../../02-organisms/checkout/checkout-payment-methods-configurable.vue';
    import OCheckoutShippingAddressesConfigurable from '../../02-organisms/checkout/checkout-shipping-addresses-configurable.vue';
    import OCheckoutShippingMethodsConfigurable from '../../02-organisms/checkout/checkout-shipping-methods-configurable.vue';
    import PayPal from '../../01-molecules/my-account/paypal.vue';
    import checkoutLogic from '../../../mixins/checkout-logic';
    import * as paymentTypes from '../../../utils/payment-types';

    export default {
        name: 'PCheckoutEditAccountInfo',
        components: {
            ExpandableMessage,
            MCheckoutPayLabel,
            MCollapsedAlerts,
            MStickyToast,
            OCheckoutPaymentMethodsConfigurable,
            OCheckoutShippingAddressesConfigurable,
            OSequentialSection,
            OCheckoutShippingMethodsConfigurable,
            PayPal
        },
        mixins: [checkoutLogic],
        props: {
            getByLabel: {
                type: String,
                default: 'Get it by'
            }
        },
        data() {
            return {
                savedAddress: {},
                showAddressEditView: false,
                hasBusinessAddress: false,
                hasInlinePayMethodError: false,
                hasShippingAddress: false,
                isPaymentFormVisible: false,
                isShowShippingAddForm: true,
                isShowBusinessAddForm: false,
                isInCheckout: true
            };
        },
        computed: {
            ...mapGetters('checkout', ['selectedPayMethod']),
            ...mapGetters('shippingAddress', ['addressMatches', 'openAddEditAddressForm']),
            ...mapState('attentionItems', ['dirty']),
            ...mapState('checkout', ['hasACHDelay', 'selectedPayMethodId', 'selectedShippingOption', 'shippingOptions', 'selectedShippingAddressId']),
            ...mapState('paymentMethod', ['storedPayMethods', 'storedExternalPayMethods']),
            ...mapState('shippingAddress', ['addresses']),

            computedSiblingClass() {
                return this.showCvv && !this.isCn ? '-hasSibling' : '';
            },
            excludedInlineAttentionItems() {
                const payMethods = !this.$env.IsCn ? this.storedPayMethods : this.storedExternalPayMethods;
                const excludedInlineShippingAttentionItem = !this.$env.IsCn && this.showImprovedCTACheckout && !this.hasShippingAddress && !this.dirty;
                const excludedMessages = [];

                if(!payMethods.length && !this.dirty) {
                    excludedMessages.push(...AifNoPayMethod.errorCodes);
                }
                if(excludedInlineShippingAttentionItem) {
                    excludedMessages.push(...AifInvalidShippingAddress.errorCodes);
                }
                return excludedMessages;
            },
            expandableMessageText() {
                return this.getLocalizationProp('Labels.PaymentForm.Checking.ExpandableMessage.Text');
            },
            expandableMessageTextFull() {
                return this.getLocalizationProp('Labels.PaymentForm.Checking.ExpandableMessage.ExpandedText');
            },
            expirationMsg() {
                return this.getLocalizationProp('Data.PayMethodExpired.Modal.Data.UpdatePayMethod.Text', 'Please update your default pay method.');
            },
            formattedSalesTax() {
                if(this.hasShippingMethod) {
                    return this.summary?.FormattedSalesTax;
                } else {
                    return this.showImprovedCTACheckout ? this.getLocalizationProp('Labels.CheckoutSummary.Pending', '--') : '--';
                }
            },
            formattedShippingMethodQuote() {
                if(this.hasShippingMethod) {
                    return this.selectedShippingOption?.FormattedShipMethodQuote;
                } else {
                    return this.showImprovedCTACheckout ? this.getLocalizationProp('Labels.CheckoutSummary.Pending', '--') : '--';
                }
            },
            getExtraTitle() {
                return this.hasShippingMethod ? '' : this.reimbursedInLsd;
            },
            hasOneShipOption() {
                return this.shippingOptions.length === 1;
            },
            hasShippingMethod() {
                return this.selectedShippingAddressId !== 0;
            },
            hasPayMethod() {
                return Boolean(this.selectedPayMethodId && this.selectedPayMethod?.PayMethodId);
            },
            hasQualifiedForOffer() {
                return this.shippingOnUsCurrentOffer.WillEarn;
            },
            isACH() {
                // Check if pay method type is ach checking, direct debit or checking
                const achPaymentTypes = [
                    paymentTypes.achChecking,
                    paymentTypes.checking,
                    paymentTypes.directDebit,
                    'checking'
                ];

                return achPaymentTypes.includes(this.selectedPayMethod.PayMethodType);
            },
            isSavedAddress() {
                return this.savedAddress.business && this.savedAddress.shipping;
            },
            isVisuallyDisabled() {
                return this.showImprovedCTACheckout && (!this.hasShippingAddress || !this.hasPayMethod);
            },
            paypalBillingAgreementLabel() {
                return this.getLabels('Labels.PaymentForm.PayPal.BillingAgreementDescription');
            },
            reimbursedInLsd() {
                if(this.hasQualifiedForOffer) {
                    const text = this.getLocalizationProp('Labels.Checkout.ReimbursedInLsd');
                    return this.shippingOnUsCurrentOffer.FormattedReimbursementValue && text ? text.replace('{0}', this.shippingOnUsCurrentOffer.FormattedReimbursementValue) : '';
                }
                return '';
            },
            showACHDelayedShippingMessage() {
                const showACHDelayedShipping = this.getLocalizationProp('Data.ShowAchDelayedShipping', false);
                return !!(this.hasACHDelay && showACHDelayedShipping && this.isACH);
            },
            showExpandableMessage() {
                return !!(this.showACHDelayedShippingMessage && this.expandableMessageText && this.expandableMessageTextFull);
            },
            showExpirationMsg() {
                return this.selectedPayMethod.Expired || this.selectedPayMethod.ExpiresSoon;
            },
            showSeparateCvvField() {
                return !(this.showImprovedCTACheckout && this.isPaymentFormVisible && this.isMexico) &&
                    this.showCvv && !this.isCn;
            },
            showSequenceOpenAttentionItemError() {
                return this.showSequenceOpenErrorOnCheckout && this.activeSequenceErrorMessage !== null;
            }
        },
        watch: {
            selectedPayMethod() {
                const checkingTypes = [
                    paymentTypes.achChecking,
                    paymentTypes.achSaving,
                    paymentTypes.directDebit
                ];

                if(!checkingTypes.includes(this.selectedPayMethod.PayMethodType)) {
                    this.hasInlinePayMethodError = false;
                }
            },
            openAddEditAddressForm(addressId) {
                const selectedAddress = this.addresses.find((address) => address.AddressId === addressId);
                this.setBusinessAddEditOrShippingAddress();
                if(selectedAddress.AddressId) {
                    this.$refs['shippingAddress']?.setAddNewAddressView(selectedAddress);
                }
            }
        },
        mounted() {
            this.initializeSequence(3);
            this.setIsOleChekout();
        },
        destroyed() {
            document.removeEventListener('scroll', this.handleScroll);
        },
        methods: {
            ...mapActions('sequentialSections', ['initializeSequence', 'completeSequence', 'updateSequence', 'setSpecificSequenceObjectActive']),
            ...mapActions('shippingAddress', ['fetchAddresses', 'fetchAllAddresses']),
            ...mapActions('checkout', ['getCheckout']),
            ...mapActions('paymentMethod', ['getCountryInfo', 'getPayMethods']),

            ...mapMutations('checkout', ['SET_OLE_CHECKOUT_INITIAL_CALL']),
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
                if(newAddress && newAddress?.AddressId) {
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
            handleErrorStatus(data) {
                this.showPaymentDeclineMessage = data?.ShowPaymentDeclineMessage;
                if(data?.ShowPaymentDeclineMessage && data?.DetailedErrorMessage) {
                    // Handle detailed decline message
                    this.apiErrors.push({
                        Original: data?.MessageCode || 'Unknown',
                        Translation: data?.DetailedErrorMessage
                    });
                } else if(data.MessageCode === 'InvalidPaymethodMissingRequiredPaperwork') {
                    this.hasInlinePayMethodError = true;
                } else if(data?.ErrorMessage?.DeclineCode === 'PaypalAgreementRevokedByCustomerModal') {
                    this.paymentFailedPaypalModal = {
                        title: data.ErrorMessage.Header,
                        description: data.ErrorMessage.Body
                    };
                    // Show PayPal-specific modal
                    this.$modal.show({ id: 'modal-payment-failed-paypal' });
                    this.loadingOrder = false;
                } else if(data.ErrorMessage) {
                    this.paymentFailedModal = {
                        title: data.ErrorMessage.Header,
                        description: data.ErrorMessage.Body,
                        cta: this.getLocalizationProp('Labels.PaymentFailedModal.Cta', null)
                    };
                    this.$modal.show({ id: 'modal-payment-failed' });
                    this.loadingOrder = false;
                }
            },
            onListShown(ref) {
                this.$refs[ref]?.updateScroll();
            },
            async onPaymentSaved({ customerId, payMethodId }) {
                await this.getPayMethods({ customerId, checkout: true });

                // logs for higher env testing of first time user accounts
                console.log('pay method saved - after refresh', this.storedPayMethods);
                console.log('selected checkout pay method', this.selectedPayMethodId);

                const payMethod = this.storedPayMethods?.find((method) => method.PayMethodId === payMethodId);
                if(payMethod) {
                    this.updateInfo({
                        PayMethodId: payMethodId
                    });
                }
                this.getCountryInfo({ country: this.$env.Country });
            },
            updateAddressStatus(sequenceInfo) {
                this.updateStatus(sequenceInfo);
            },
            updateStatus(sequenceInfo) {
                if(sequenceInfo.completed) {
                    this.completeSequence(sequenceInfo);
                } else {
                    this.updateSequence(sequenceInfo);
                }
            },
            updateAddresses(value) {
                this.savedAddress = value;
            },
            setAddressEditComp() {
                this.showAddressEditView = true;
                this.setSpecificSequenceObjectActive(0);
            },
            setBusinessAddEditOrShippingAddress() {
                if(this.isSavedAddress) {
                    this.showAddressEditView = false;
                    this.setSpecificSequenceObjectActive(0);
                } else {
                    this.setAddressEditComp();
                }
            },
            setIsOleChekout() {
                // set isInCheckout to get all addresses(shipping or business) for initial call
                this.SET_OLE_CHECKOUT_INITIAL_CALL(true);
            },
            setAvailableAddresses(ship, bus) {
                this.hasShippingAddress = ship;
                this.hasBusinessAddress = bus;
            },
            setaddressFormProps(e) {
                this.isShowShippingAddForm = e.shippingAddressForm;
                this.isShowBusinessAddForm = e.businessAddressForm;
            }
        }
    };
</script>
