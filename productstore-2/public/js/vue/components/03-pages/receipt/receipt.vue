<template>
    <div class="p-receipt" :class="isCn ? '-isCnReceipt' : ''">
        <div class="p-receipt__wrapper" :class="isCn ? '-isCn' : ''">
            <!-- Header - Print -->
            <div class="p-receipt__header -print">
                <header-print :title="printTitle"></header-print>
            </div>

            <slot />

            <div v-if="$slots['banner-variant-1'] && isCn" class="p-receipt__bd">
                <slot name="banner-variant-1" />
            </div>

            <div v-if="$slots['credit-ad']" class="p-receipt__bd">
                <slot name="credit-ad" />
            </div>

            <!-- Header -->
            <div class="p-receipt__header">
                <h1 class="p-receipt__heading" :class="headingClasses">{{ title }}</h1>
                <p class="p-receipt__subtitle" v-html="subTitle"></p>
                <p
                    v-if="showGui && invoiceReminder"
                    class="p-receipt__subtitle mt-15"
                    v-html="invoiceReminder"
                />
            </div>

            <!-- Content columns -->
            <a-loading-spinner v-if="!isLoaded" :visible="!isLoaded" />
            <div
                v-else-if="!isCn"
                class="p-receipt__estimated"
            >
                <!--
                    Keeping in case we need to add it back in the near future:

                    <h2 class="p-receipt__estimated -title">
                    {{ getLocalizationProp("Labels.Estimated.Title") }}
                    {{ data.PackageInformation[0].EstimatedArrivalDateTo }}
                </h2> -->
                <p class="o-receipt__estimated -text">
                    {{ getLocalizationProp("Labels.Estimated.OrderDate") }}
                    <span class="font-bold">{{ data.FormattedOrderEntryDate }}</span>
                    <span v-if="data.IsOrderBackdated" class="italic text-gray-150">{{ replaceToken(getLocalizationProp("Labels.Estimated.Backdate"), data.OrderDateText) }}</span>
                </p>
                <p class="o-receipt__estimated -text">
                    {{ getLocalizationProp("Labels.Estimated.OrderNumber") }}
                    <span class="font-bold">{{ data.OrderNumber }}</span>
                </p>
                <p v-if="data.AppliedDate && data.AppliedDateText" class="o-receipt__estimated -text">
                    {{ getLocalizationProp("Labels.Estimated.AppliedDate") }}
                    <span class="font-bold">{{ data.AppliedDateText }}</span>
                </p>
            </div>
            <div v-if="isLoaded" class="p-receipt__content">
                <!-- Left Column -->
                <div class="p-receipt__main" :class="{'-oleCheckoutFlow' : isOleCheckoutFlow}">
                    <div
                        v-if="isCn"
                        class="p-receipt__estimated"
                    >
                        <!--
                            Keeping in case we need to add it back in the near future:

                            <h2 class="p-receipt__estimated -title">
                            {{ getLocalizationProp("Labels.Estimated.Title") }}
                            {{ data.PackageInformation[0].EstimatedArrivalDateTo }}
                        </h2> -->
                        <p class="o-receipt__estimated -text">
                            {{ getLocalizationProp("Labels.Estimated.OrderDate") }}
                            <span class="font-bold">{{ data.FormattedOrderEntryDate }}</span>
                            <span v-if="data.IsOrderBackdated" class="italic text-gray-150">{{ replaceToken(getLocalizationProp("Labels.Estimated.Backdate"), data.OrderDateText) }}</span>
                        </p>
                        <p class="o-receipt__estimated -text">
                            {{ getLocalizationProp("Labels.Estimated.OrderNumber") }}
                            <span class="font-bold">{{ data.OrderNumber }}</span>
                        </p>
                    </div>
                    <slot v-if="!isGuest" name="coupon-reminder"></slot>
                    <!-- Receipt cards -->
                    <!-- Shipping card - when not OLE-->
                    <div v-if="!isOleCheckoutFlow">
                        <div v-if="!isCn" class="p-receipt__card" :class="{'-sou': shippingOnUsEnabled && shippingConfigId}">
                            <span class="p-receipt__title -left">
                                {{ getLocalizationProp("Labels.Shipping.Title") }}
                            </span>
                            <span class="p-receipt__title -right">
                                <span v-if="hasPackageInfo ? !data.PackageInformation[0].HideCarrier : ''" class="p-receipt__carrier">
                                    {{ hasPackageInfo ? data.PackageInformation[0].CarrierDisplayName || data.PackageInformation[0].Carrier : '' }} -
                                </span>
                                <span v-if="!hideShipMethod" class="pr-5">{{ hasPackageInfo ? data.PackageInformation[0].ShipMethodDisplayName || data.PackageInformation[0].ShipMethod: getLocalizationProp("Labels.PackageInformation.NoShipMethod") }}
                                </span>
                                ({{
                                    data.FormattedShipMethodQuote
                                }})
                            <!--
                                Keeping in case we need to add it back in the near future:

                                <span
                                v-if="hasPackageInfo"
                                class="p-receipt__getby"
                            >
                                {{ getLocalizationProp("Labels.Shipping.GetBy") }}
                                {{ data.PackageInformation[0].EstimatedArrivalDateTo !== 'undefined' ? data.PackageInformation[0].EstimatedArrivalDateTo : 'Not Available' }}
                            </span> -->
                            </span>
                        </div>
                        <div>
                            <!-- shipping on us banner -->
                            <m-shipping-on-us
                                v-if="shippingOnUsEnabled && (shippingConfigId || hasNewLoyaltySOU)"
                                :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                                :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                                :shipping-config-id="shippingConfigId"
                            >
                            </m-shipping-on-us>
                            <!-- shipping on us receipt banner -->
                            <m-receipt-shipping-on-us-banner
                                v-else
                                :sou-feature-on="shippingOnUsEnabled && !isCn"
                                :current-offer="shippingOnUsCurrentOffer"
                                :available-offers="shippingOnUsAvailableOffers"
                                :labels="getLocalizationProp('Labels.ShippingOnUs', {})"
                                :link="getLocalizationProp('Data.ShippingOnUsDetailsLink', {})"
                                :ship-method="hasPackageInfo ? data.PackageInformation[0].ShipMethod : ''"
                                :default-shipping-method-used="data.DefaultShippingMethodUsed"
                            ></m-receipt-shipping-on-us-banner>
                        </div>
                    </div>
                    <!-- Ship method Card -->
                    <div class="p-receipt__card">
                        <span class="p-receipt__title -left">
                            {{ getLocalizationProp("Labels.ShipTo.Title") }}
                        </span>
                        <span class="p-receipt__title -right">
                            <span class="md:flex pb-12">
                                <address v-if="isCn" class="w-full md:w-400 not-italic">
                                    <span class="font-bold block leading-tight text-base">
                                        {{ data.ShipToName }}
                                        <span class="px-10 font-normal inline-block">{{ data.ShipToAddress.DeliveryPhoneNumber }}</span>
                                    </span>

                                    <span class="text-base font-normal block leading-tight">
                                        {{ data.ShipToAddress.State }}{{ data.ShipToAddress.City }}{{ data.ShipToAddress.Address1 }}
                                    </span>

                                    <span class="text-base font-normal block md:pt-3 leading-tight">
                                        {{ data.ShipToAddress.PostalCode }}
                                    </span>
                                </address>
                                <address
                                    v-else-if="data && data.ShipToAddress && data.ShipToAddress.FormattedAddress"
                                    class="p-receipt__address"
                                    v-html="data.ShipToAddress.FormattedAddress">
                                </address>
                                <o-shipping-address
                                    v-else
                                    :order-data="data"
                                    :is-ole-checkout-flow="isOleCheckoutFlow"
                                    :show-country="showCountry"
                                    :show-state="showState"
                                />
                            </span>
                        </span>
                    </div>

                    <!-- Shipping card - when OLE-->
                    <div v-if="isOleCheckoutFlow">
                        <div v-if="!isCn" class="p-receipt__card">
                            <span class="p-receipt__title -left">
                                {{ getLocalizationProp("Labels.Shipping.Title") }}
                            </span>
                            <span class="p-receipt__title -right">
                                <span v-if="hasPackageInfo ? !data.PackageInformation[0].HideCarrier : ''" class="p-receipt__carrier -">
                                    {{ hasPackageInfo ? data.PackageInformation[0].Carrier : '' }} -
                                </span>
                                <span v-if="!hideShipMethod" class="pr-5">{{ hasPackageInfo ? data.PackageInformation[0].ShipMethod : getLocalizationProp("Labels.PackageInformation.NoShipMethod") }}
                                </span>
                                ({{
                                    data.FormattedShipMethodQuote
                                }})
                            </span>
                            <div v-if="hasQualifiedForOffer" class="p-receipt__rmbrsmntLsd" v-html="reimbursedInLsd"></div>

                        </div>

                        <div>
                            <!-- shipping on us receipt banner -->
                            <m-receipt-shipping-on-us-banner
                                v-if="!hasQualifiedForOffer"
                                class="mt-16"
                                :sou-feature-on="shippingOnUsEnabled && !isCn"
                                :current-offer="shippingOnUsCurrentOffer"
                                :available-offers="shippingOnUsAvailableOffers"
                                :labels="getLocalizationProp('Labels.ShippingOnUs', {})"
                                :link="getLocalizationProp('Data.ShippingOnUsDetailsLink', {})"
                                :ship-method="hasPackageInfo ? data.PackageInformation[0].ShipMethod : ''"
                                :default-shipping-method-used="data.DefaultShippingMethodUsed"
                            ></m-receipt-shipping-on-us-banner>
                        </div>
                    </div>
                    <!-- Pay With -->
                    <div v-if="payMethod && !isCn" class="p-receipt__card">
                        <span class="p-receipt__title -left">
                            {{ getLocalizationProp("Labels.PayWith.Title") }}
                        </span>
                        <span class="p-receipt__title -right">
                            <!-- is RAP -->
                            <span v-if="isRapDeposit" class="p-receipt__payMth flex items-start -rapDeposit">
                                <span class="relative md:flex">
                                    <span class="flex flex-wrap md:w-400 pr-20 md:pr-0">
                                        <!-- Service number -->
                                        <span class="flex flex-wrap items-center w-full">
                                            <span class="font-bold pr-5" :class="setFontSize">{{ getLocalizationProp('Labels.PayWith.RapDeposit.RapDeposit') }}</span>
                                            <span :class="setFontSize">- {{ getLocalizationProp('Labels.PayWith.RapDeposit.ServiceNumber') }} {{ getLocalizationProp('Data.MeleleucaServiceNumber') }}</span>
                                        </span>

                                        <!-- Reference number -->
                                        <span class="flex flex-wrap items-center w-full">
                                            <span class="font-bold pr-5" :class="setFontSize">
                                                {{ getLocalizationProp('Labels.PayWith.RapDeposit.ReferenceNumber') }}
                                            </span>
                                            <span :class="setFontSize">- {{ payMethod.VirtualAccountNumber }}</span>
                                        </span>

                                        <!-- Status -->
                                        <span class="flex flex-wrap items-center">
                                            <span class="font-bold pr-5" :class="setFontSize">{{ getLocalizationProp('Labels.PayWith.RapDeposit.Status') }}</span>
                                            <span v-if="data" :class="setFontSize">- {{ data.OrderStatusLabel }}</span>
                                        </span>
                                    </span>
                                </span>
                            </span>
                            <!-- is FPX Online banking Account -->
                            <span v-if="isVirtualAccount && isFPX3DPortal" class="p-receipt__payMth items-center -creditCard">
                                <img
                                    v-if="isPayMethodImage"
                                    class="inline pr-10 w-60"
                                    :alt="payMethod.PayMethodImage.Alt"
                                    :src="payMethod.PayMethodImage.Url"
                                />
                            </span>
                            <!-- is Virtual Account -->
                            <span v-else-if="isVirtualAccount" class="p-receipt__payMth text-base -virtualAccount" role="text">
                                <!-- Payment Type Display -->
                                <span class="block font-bold mb-10 pt-5 md:mb-15 md:pt-0" :class="setFontSize">
                                    {{ getLocalizationProp('Labels.PayMethod.VirtualPaymethod.VirtualAccountText', 'Virtual Account') }}
                                </span>

                                <!-- Bank Name -->
                                <span class="flex mb-10 md:mb-5">
                                    <span class="flex-shrink-0 pr-5">
                                        {{ getLocalizationProp('Labels.PayMethod.VirtualPaymethod.NameOfBank', 'Name of Bank') }}:
                                    </span>
                                    <span class="font-bold">
                                        {{ payMethod.VirtualAccountBankName }}
                                    </span>
                                </span>

                                <!-- Virtual Account Number -->
                                <span class="flex mb-10 md:mb-5">
                                    <span class="flex-shrink-0 pr-5">
                                        {{ getLocalizationProp('Labels.PayMethod.VirtualPaymethod.Number', 'Number') }}:
                                    </span>
                                    <span class="font-bold">
                                        {{ payMethod.VirtualAccountNumber }}
                                    </span>
                                </span>

                                <!-- Virtual Account Expiration Date -->
                                <span class="flex mb-10 md:mb-5">
                                    <span class="flex-shrink-0 pr-5">
                                        {{ getLocalizationProp('Labels.PayMethod.VirtualPaymethod.DepositDeadline', 'Deposit Deadline') }}:
                                    </span>
                                    <span class="font-bold">
                                        {{ formattedDepositDeadline }}
                                    </span>
                                </span>
                            </span>

                            <!-- 3D Portal -->
                            <!-- Note payMethodType for 3D Portal is VirtualCreditCard as opposed to Virtual Account -->
                            <span v-else-if="is3DPortal" class="p-receipt__payMth items-center -virtualCard">
                                <span class="relative">
                                    <span class="w-auto pr-10">
                                        <span class="w-auto">
                                            <span class="font-bold leading-base pr-5" :class="setFontSize">
                                                {{ payMethod.CreditCardDescription }}
                                            </span>
                                        </span>
                                    </span>
                                </span>
                            </span>

                            <!-- Convenience Store Payment -->
                            <span v-else-if="isConvenienceStore" class="p-receipt__payMth text-base -virtualAccount" role="text">
                                <!-- Payment Type Display -->
                                <span class="block font-bold mb-10 pt-5 md:mb-15 md:pt-0" :class="setFontSize">
                                    {{ payMethod.PaymethodNameDisplay }}
                                </span>

                                <!-- Store Name -->
                                <span class="flex mb-10 md:mb-5">
                                    <span class="flex-shrink-0 pr-5">
                                        {{ getLocalizationProp('Labels.ConvenienceStore.StoreName', 'Store Name') }}:
                                    </span>
                                    <span class="font-bold">
                                        {{ payMethod.CardIssuerDescription }}
                                    </span>
                                </span>

                                <!-- Payment Method -->
                                <span class="flex mb-10 md:mb-5">
                                    <span class="flex-shrink-0 pr-5">
                                        {{ getLocalizationProp('Labels.ConvenienceStore.PaymentMethod', 'Payment Method') }}:
                                    </span>
                                    <a
                                        class="font-bold underline"
                                        :href="payMethod.PartnerPaymentReferenceUrl">

                                        {{ payMethod.PartnerPaymentReferenceUrlText }}
                                    </a>
                                </span>

                                <!-- Payment Method -->
                                <span v-if="payMethod && payMethod.PartnerCompanyCode" class="flex mb-10 md:mb-5">
                                    <span class="flex-shrink-0 pr-5">
                                        {{ getLocalizationProp('Labels.ConvenienceStore.CompanyNumber', 'Company Number') }}:
                                    </span>
                                    <span class="font-bold">
                                        {{ payMethod.PartnerCompanyCode }}
                                    </span>
                                </span>

                                <!-- Payment Slip Number -->
                                <span class="flex mb-10 md:mb-5">
                                    <span class="flex-shrink-0 pr-5">
                                        {{ getLocalizationProp('Labels.ConvenienceStore.PaymentSlipNumber', 'Payment Slip Number') }}:
                                    </span>
                                    <span class="font-bold">
                                        {{ payMethod.VirtualAccountNumber }}
                                    </span>
                                </span>

                                <!-- Payment Deadline -->
                                <span class="flex mb-10 md:mb-5">
                                    <span class="flex-shrink-0 pr-5">
                                        {{ getLocalizationProp('Labels.ConvenienceStore.PaymentDeadline', 'Payment Deadline') }}:
                                    </span>
                                    <span class="font-bold">
                                        {{ formattedPaymentDeadline }}
                                    </span>
                                </span>
                            </span>

                            <span
                                v-else-if="isPayPal">
                                <a-pay-label
                                    class="flex"
                                    :display-name="payMethod.PaymethodNameDisplay"
                                    :image="payMethod.PayMethodImage"
                                    :type="payMethod.PayMethodType"
                                    :name-on-account="payMethod.NameOnAccount"
                                />
                            </span>

                            <!-- Regular pay-->
                            <span v-else class="p-receipt__payMth items-center -creditCard">
                                <!-- In Korea, do not use credit card image -->
                                <img
                                    v-if="isPayMethodImage && !payMethod.CreditCardDescription"
                                    class="inline pr-10 w-60"
                                    :alt="payMethod.PayMethodImage.Alt"
                                    :src="payMethod.PayMethodImage.Url"
                                />
                                <span class="relative">
                                    <span class="w-auto pr-20">
                                        <span class="items-center mr-6" :class="payMethod.CreditCardDescription ? 'md:w-250' : 'md:w-200'">
                                            <!-- In Korea, use Credit Card Brand name instead of Pay Method Type -->
                                            <span v-if="payMethod.CreditCardDescription" class="font-bold leading-base pr-5" :class="setFontSize">
                                                {{ payMethod.CreditCardDescription }}
                                            </span>
                                            <span v-else class="font-bold leading-base pr-5" :class="setFontSize">
                                                {{ payMethod.PaymethodNameDisplay ? payMethod.PaymethodNameDisplay : payMethod.PayMethodType }}
                                            </span>
                                            <span class="font-normal" :class="setFontSize" v-html="maskedCardNumber">
                                            </span>
                                        </span>
                                    </span>
                                </span>
                            </span>

                            <!-- Installment -->
                            <span v-if="showInstallment" class="p-receipt__payMth flex items-center -installment" :class="setFontSize">{{ installmentPeriod }}</span>
                        </span>
                        <!-- Delayed Shipping message - for Checking Only -->
                        <expandable-message
                            v-if="showExpandableMessage"
                            :add-top-margin="true"
                            :is-printed="printInvoiceAsPdf"
                            :message-text="expandableMessageText"
                            :message-text-expanded="expandableMessageTextFull"
                            :mods="'mt-15'"
                            :less-text="getLocalizationProp('Labels.PayWith.Less')"
                            :more-text="getLocalizationProp('Labels.PayWith.More')"
                        />
                    </div>
                    <div v-if="payMethodCN && isCn" class="p-receipt__card">
                        <span class="p-receipt__title -left">
                            {{ getLocalizationProp("Labels.PayWith.Title") }}
                        </span>
                        <span class="p-receipt__title -right">
                            <a-pay-label
                                class="flex"
                                :display-name="payMethodCN.Text || payMethodLabel"
                                :image="payMethodCN.Image"
                                :is-cn="isCn" />
                        </span>
                    </div>
                    <div v-if="eInvoice" class="p-receipt__card">
                        <span class="p-receipt__title -left">
                            {{ getLocalizationProp('Labels.EInvoice.EInvoiceLabel') }}
                        </span>
                        <div class="p-receipt__title -right flex flex-col items-start">
                            <div class="p-receipt__eInvoice">
                                {{ getLocalizationProp('Labels.EInvoice.EInvoiceDateLabel') }}
                                <span class="font-bold">
                                    {{ eInvoiceDate }}
                                </span>
                            </div>
                            <div class="p-receipt__eInvoice">
                                {{ getLocalizationProp('Labels.EInvoice.EInvoiceStatusLabel') }}
                                <component
                                    :is="eInvoiceAvailable ? 'a' : 'span'"
                                    class="font-bold"
                                    :class="{'-eInvoiceAvailable': eInvoiceAvailable}"
                                    :disabled="!eInvoiceAvailable"
                                    :href="eInvoiceAvailable ? '#download-eInvoice' : undefined"
                                >
                                    {{ eInvoiceFormattedStatus }}
                                </component>
                            </div>
                            <span v-if="eInvoiceStatus === 'Unavailable'" class="text-red text-sm">
                                {{ eInvoiceUnAvailable }}
                            </span>
                            <span v-if="eInvoiceStatus === 'Processing'" class="p-receipt__eInvoiceError">
                                {{ eInvoiceProcessing }}
                            </span>
                        </div>
                    </div>
                    <div v-if="showGui" class="p-receipt__card">
                        <span class="p-receipt__title -left">
                            {{ getLocalizationProp('Labels.GUI.InvoiceInformation', 'Invoice Information') }}
                        </span>
                        <span class="p-receipt__title -right flex-wrap">
                            <GuiReceiptInfo
                                v-for="gui in guiList"
                                :key="gui.GuiIdentifier"
                                :carrier-number-label="getLocalizationProp('Labels.GUI.CarrierNumber', 'Carrier Number:')"
                                :carrier-type-label="getLocalizationProp('Labels.GUI.CarrierType', 'Carrier Type:')"
                                :gui="gui"
                                :invoice-issue-date-label="getLocalizationProp('Labels.GUI.InvoiceIssueDate', 'Invoice Issue Date:')"
                                :invoice-track-number-label="getLocalizationProp('Labels.GUI.InvoiceTrackNumber', 'Invoice Track Number:')"
                                :love-code-label="getLocalizationProp('Labels.GUI.LoveCode', 'Love Code:')"
                                :random-code-label="getLocalizationProp('Labels.GUI.RandomCode', 'Random Code:')"
                            />
                        </span>
                    </div>
                    <!-- <slot name="items" /> -->
                    <div v-if="data.Items" class="o-checkoutList">
                        <h2 class="o-checkoutList__heading">
                            {{ getLocalizationProp("Labels.Items.Title") }}
                        </h2>
                        <ul class="o-checkoutList__list">
                            <li
                                v-for="item in data.Items"
                                :key="item.LineId"
                                class="o-checkoutList__listItem"
                            >
                                <m-checkout-item
                                    :asterisk="item && item.HasReducedTaxRate && getLocalizationProp('Labels.AdditionalTaxSummary.AsteriskSymbol', '*') || ''"
                                    :is-receipt="true"
                                    :is-free="item && (item.GiftType === 'WelcomeGift' || item.PromotionGroup === 'ReactivationIncentive')"
                                    :free-label="getLocalizationProp('Labels.CartSummary.Free')"
                                    :item="item"
                                    :points-label="getLocalizationProp('Labels.Items.Points')"
                                    :quantity-label="getLocalizationProp('Labels.Items.Quantity')"
                                    :is-cn="isCn"
                                    :user-flags="userFlags"
                                    :lsd-used-label="getLocalizationProp('Labels.Lsd.LsdUsedLabel')"
                                    :read-more-label="getLocalizationProp('Data.ReadMore.Text')"
                                    :read-less-label="getLocalizationProp('Data.ReadLess.Text')"
                                    :is-return="data.OrderStatus === 'Returned'"
                                    :hide-order-history-product-points="hideOrderHistoryProductPoints"
                                />
                            </li>
                        </ul>
                    </div>
                    <div v-if="isPreferred && !hideBuoLink" class="m-checkoutBackup u-printHidden">
                        <p class="m-checkoutBackup__text">
                            {{ getLocalizationProp("Labels.BackupOrder.PreLinkText") }}
                            {{ getLocalizationProp("Data.BackupOrder.LinkText") }}
                            {{ getLocalizationProp("Labels.BackupOrder.PostLinkText") }}
                            <button
                                class="m-checkoutBackup__link"
                                @click="[addToBackupOrderList($event), gtmTrackAction({ id: 191, text: getLocalizationProp('Labels.BackupOrder.LinkText') }, $event)]"
                            >{{ getLocalizationProp("Labels.BackupOrder.LinkText") }}
                            </button>
                        </p>
                    </div>

                    <div v-if="shippingOnUsEnabled" class="m-checkoutLSD">
                        <div class="inline-flex items-center">
                            <h3 class="m-checkoutLSD__title">
                                {{ getLocalizationProp("Labels.Lsd.Title") }}
                            </h3>
                            <m-tooltip v-if="lsdTitleToolTip" class="ml-2" tooltip-icon="help" tooltip-icon-size="xs">
                                <div v-html="lsdTitleToolTip"></div>
                            </m-tooltip>
                        </div>

                        <p v-if="showToSpend && !enableLSDSummaryEnhancement" class="m-checkoutLSD__text">
                            {{ getLocalizationProp("Labels.Lsd.ToSpend") }}
                            <span v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__amount">
                                {{ summary.LoyaltyShoppingDollars.FormattedAvailableToSpend }}
                            </span>
                        </p>
                        <p
                            v-if="!isCn && summary.FromOrderFlow && summary.LoyaltyShoppingDollars.AvailableToActivate && !hideDollarsToActivate"
                            class="m-checkoutLSD__text"
                        >
                            {{ getLocalizationProp("Labels.Lsd.AvailableToActivate") }}
                            <span v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__amount">
                                {{ summary.LoyaltyShoppingDollars.FormattedAvailableToActivate }}
                            </span>
                        </p>
                        <p v-if="lsdEarned" class="m-checkoutLSD__text">
                            {{ isCn ? getLocalizationProp("Labels.Lsd.Earned") : getLocalizationProp("Labels.Lsd.EarnedThisOrder") }}
                            <span class="m-checkoutLSD__amount">
                                {{ lsdEarned }}
                            </span>
                        </p>
                        <p v-if="!isCn && summary.FromOrderFlow && summary.LoyaltyShoppingDollars && summary.LoyaltyShoppingDollars.LsdExpiringInCurrentMonth" class="m-checkoutLSD__text">
                            {{ getLocalizationProp("Labels.Lsd.ExpiringThisMonth") }}
                            <span class="m-checkoutLSD__amount">
                                {{ summary.LoyaltyShoppingDollars.FormattedLsdExpiringInCurrentMonth }}
                            </span>
                        </p>
                    </div>
                    <div v-else>
                        <div v-if="showLsdCard" class="m-checkoutLSD">
                            <div class="inline-flex items-center">
                                <h3 class="m-checkoutLSD__title">
                                    {{ getLocalizationProp("Labels.Lsd.Title") }}
                                </h3>
                                <m-tooltip v-if="lsdTitleToolTip" class="ml-2" tooltip-icon="help" tooltip-icon-size="xs">
                                    <div v-html="lsdTitleToolTip"></div>
                                </m-tooltip>
                            </div>
                            <p v-if="showToSpend && !enableLSDSummaryEnhancement" class="m-checkoutLSD__text">
                                {{ getLocalizationProp("Labels.Lsd.ToSpend") }}
                                <span v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__amount">
                                    {{ summary.LoyaltyShoppingDollars.FormattedAvailableToSpend }}
                                </span>
                            </p>
                            <p class="m-checkoutLSD__text">
                                {{ getLocalizationProp("Labels.Lsd.Earned") }}
                                <span v-if="lsdEarned" class="m-checkoutLSD__amount">
                                    {{ lsdEarned }}
                                </span>
                            </p>
                            <p v-if="summary.FromOrderFlow && !isCn && !hideDollarsToActivate" class="m-checkoutLSD__text">
                                {{ getLocalizationProp("Labels.Lsd.AvailableToActivate") }}
                                <span v-if="summary.LoyaltyShoppingDollars" class="m-checkoutLSD__amount">
                                    {{ summary.LoyaltyShoppingDollars.FormattedAvailableToActivate }}
                                </span>
                            </p>

                        </div>
                    </div>

                    <MAdditionalTax
                        v-if="summary.TaxGroups && (showGstBelowTotal || showVatBelowTotal)"
                        :labels="getLocalizationProp('Labels.AdditionalTaxSummary', {})"
                        :summary="summary"
                    />

                    <div v-if="!isCn" class="p-receipt__actions">
                        <v-button
                            :is-anchor="true"
                            :cta="getLocalizationProp('Data.ContinueShopping.Text')"
                            class="-backupOrder -center mb-16 md:mr-20 md:mb-0"
                            :href="getLocalizationProp('Data.ContinueShopping.Url')"
                            @click="gtmTrackAction({ id: 191, text: getLocalizationProp('Data.ContinueShopping.Text') }, $event)"
                        />
                        <v-button
                            v-if="!(data.OrderStatus === 'Cancelled')"
                            :cta="getLocalizationProp('Labels.Print')"
                            class="-backupOrder -center -white md:mb-0"
                            @click="[print($event), gtmTrackAction({ id: 191, text: getLocalizationProp('Labels.Print') }, $event)]"
                        />
                        <div class="inline-flex flex-col w-full md:w-auto md:ml-20">
                            <v-button
                                v-if="isValidInvoice"
                                id="download-eInvoice"
                                :cta="getLocalizationProp('Labels.DownloadEinvoice')"
                                class="-eInvoice -center -white mt-16 md:mt-0"
                                :disabled="!eInvoiceAvailable"
                                @click="[print($event, isValidInvoice), gtmTrackAction({ id: 191, text: getLocalizationProp('Labels.DownloadEinvoice') }, $event)]"
                            />
                            <p
                                v-if="isValidInvoice && !eInvoiceAvailable"
                                class="p-receipt__eInvoiceError">
                                {{ eInvoiceNotGenerated }}
                            </p>
                        </div>
                    </div>

                    <o-cfdi
                        v-if="!isCn && !showCfdiProductInvoice"
                        :labels="getLocalizationProp('Data.Cfdi')"
                        :order-date="data.OrderDate"
                        :order-number="data.OrderNumber"
                        :order-status="data.OrderStatus"
                    />
                    <template v-else-if="shouldShowCfdiProductInvoiceMx">
                        <div v-if="loadingCfdiStatus">
                            <a-loading-spinner :visible="true" size="sm" />
                        </div>
                        <OCfdiProductInvoice
                            v-if="!loadingCfdiStatus && canRequestCfdiComp"
                            :cfdi-data="cfdiData"
                            :has-multiple-pay-methods="hasMultiplePayMethods"
                            :labels="getLocalizationProp('Labels.CfdiProductInvoice')"
                            :pay-method="payMethod.PayMethodType"
                            :postal-code="shiptoaddress.PostalCode"
                            :order-number="data.OrderNumber"
                            :cfdi-use-value="getLocalizationProp('Data.CfdiUseValue')"
                        />
                    </template>
                </div>

                <!-- Right Column -->
                <div class="p-receipt__side">
                    <m-cart-summary
                        :cc-total="summary.ConvenienceCertificates.FormattedUsed"
                        :coa-formatted="coaFormatted"
                        :commitment="commitment"
                        :item-total="itemTotal"
                        :show-gst-in-order-summary="showGstInOrderSummary"
                        :hide-sales-tax="hideSalesTax"
                        :is-preferred="isPreferred"
                        :lsd-total="lsdTotal"
                        :lsd-used="lsdUsed"
                        :is-cn="isCn"
                        :points="summary.Points"
                        :product-discount="productDiscount"
                        :redemption-fee="redemptionFee"
                        :show-cc-total="isCCApplicable"
                        :show-lsd-total="isCn ? isPreferred : true"
                        :show-checkout="false"
                        :show-place-order="true"
                        :show-savings="!!preferredSavings"
                        :sales-tax="summary.FormattedSalesTax"
                        :service-tax="serviceTaxFormatted"
                        :shipping-handling="summary.FormattedShipMethodQuote"
                        :shipping-on-us-marker="summary.ShippingOnUsMarker"
                        :show-shipping-on-us-marker="summary.ShowShippingOnUsMarker"
                        :show-lsd-redemption-fee="showLsdRedemptionFee"
                        :show-purchase-commitment="showPurchaseCommitment"
                        :show-vat-in-order-summary="showVatInOrderSummary"
                        :show-welcome-program-lsd="showWelcomeProgramLsd"
                        :subtotal="subTotal"
                        :total="totalCompFormatted"
                        :total-discount="totalDiscount"
                        :view-points="userFlags.ViewPoints"
                        :welcome-program-lsd="summary.WelcomeProgramLsdAvailable && summary.WelcomeProgramLsdAvailable.FormattedUsed"
                        :hide-order-history-product-points="hideOrderHistoryProductPoints"
                    >
                        <template v-slot:heading>
                            <span
                                v-html="getLocalizationProp('Labels.CartSummary.Heading')"
                            ></span>
                        </template>

                        <template v-slot:item-total>
                            <span
                                v-html="getLocalizationProp('Labels.CartSummary.ItemTotal')"
                            ></span>
                        </template>

                        <template v-slot:welcome-program-lsd>
                            <span v-html="getLocalizationProp('Labels.CartSummary.WelcomeFreeProductsUsedInThisOrder')"></span>
                        </template>

                        <template v-slot:lsd-total>
                            <span v-html="lsdTotalWithLink || getLocalizationProp('Labels.CartSummary.LsdTotal')"
                            ></span>
                        </template>

                        <template v-slot:cc-total>
                            <span
                                v-html="getLocalizationProp('Labels.CartSummary.CcTotal')"
                            ></span>
                        </template>

                        <!-- Delete cntotal instead of the total -->

                        <template v-slot:coa>
                            <span v-html="getLocalizationProp('Labels.CartSummary.CoaTotal')"></span>
                        </template>

                        <template v-slot:total>
                            <span
                                v-html="getLocalizationProp('Labels.CartSummary.Total')"
                            ></span>
                        </template>

                        <template v-slot:points>
                            <span
                                v-html="getLocalizationProp('Labels.CartSummary.Points')"
                            ></span>
                        </template>

                        <template v-slot:shipping-handling>
                            <span
                                v-html="getLocalizationProp('Labels.CartSummary.ShippingTaxes')"
                            ></span>
                        </template>

                        <template v-slot:service-tax>
                            <span
                                v-html="serviceTaxPercentageLabel"
                            ></span>
                        </template>

                        <template v-slot:sales-tax>
                            <span
                                v-html="getLocalizationProp('Labels.CartSummary.SalesTax')"
                            ></span>
                        </template>

                        <template v-slot:savings-heading>
                            <span
                                v-html="getLocalizationProp('Labels.CartSummary.AsPreferred')"
                            ></span>
                        </template>

                        <template v-slot:commitment>
                            <span v-html="getLocalizationProp('Labels.CartSummary.Commitment')"></span>
                        </template>

                        <template v-slot:savings>
                            <span v-html="preferredSavings"></span>
                        </template>

                        <template v-slot:product-discount>
                            <span v-html="getLocalizationProp('Labels.CartSummary.ProductDiscount')"></span>
                        </template>

                        <template v-slot:subtotal>
                            <span v-html="getLocalizationProp('Labels.CartSummary.SubTotal')"></span>
                        </template>

                        <template v-slot:lsd-redemption-fee>
                            <span v-html="getLocalizationProp('Labels.CartSummary.LsdRedemptionFee')"></span>
                        </template>

                        <template v-slot:salex-taxes>
                            <span v-html="gstTaxLabel"></span>
                        </template>

                        <template v-slot:vat-taxes>
                            <span v-html="vatLabel"></span>
                        </template>
                    </m-cart-summary>
                    <div v-if="!isCn && !shippingOnUsEnabled" class="p-receipt__readmore">
                        <p class="p-receipt__readmore -text" v-html="getLocalizationProp('Labels.ReadMore.Preview')"></p>
                        <transition name="fadeHeight" mode="out-in">
                            <p v-show="readMoreOpen" class="p-receipt__readmore -text" v-html="getLocalizationProp('Labels.ReadMore.Text')"></p>
                        </transition>
                        <button
                            class="p-receipt__readmore -link"
                            :aria-label="getLocalizationProp('Labels.ReadMore.AriaLabel')"
                            :aria-expanded="String(readMoreOpen)"
                            @click="readMoreOpen = !readMoreOpen"
                        >
                            {{
                                readMoreOpen
                                    ? getLocalizationProp("Data.ReadLess.Text")
                                    : getLocalizationProp("Data.ReadMore.Text")
                            }}
                        </button>
                    </div>

                    <m-become-member-card
                        v-if="showBecomeMemberCard && !isCn"
                        mods="mt-30 md:mt-40"
                        :labels="getLocalizationProp('Labels.BecomeMember', {})">
                    </m-become-member-card>

                    <p v-if="!!preferredSavings && isPreferred" class="m-cartSavings" :class="{'mb-16':shippingOnUsEnabled && shippingOnUsCurrentOffer.WillEarn}">
                        <span class="m-cartSavings__heading">
                            <span v-html="getLocalizationProp('Labels.CartSummary.AsPreferred', 'As a Preferred Member,')"></span>
                            <br />
                        </span>
                        <span v-html="preferredSavings"></span>
                    </p>

                    <div v-if="shippingOnUsEnabled && shippingOnUsCurrentOffer.WillEarn && shippingBack" class="text-center my-20 md:mx-auto md:w-5_6 md:leading-tight">
                        <!-- shipping on us rebate value -->
                        <p class="text-base md:text-xl"><span v-if="summary.ShowShippingOnUsMarker">{{ summary.ShippingOnUsMarker }}&nbsp;</span>{{ shippingBack }}</p>
                        <p class="text-base md:text-xl"><strong>{{ shippingOnUsCurrentOffer.FormattedReimbursementValue }}</strong></p>
                    </div>

                    <!-- Order Summary VAT -->
                    <div v-if="showVAT" class="md:flex flex-col items-center">
                        <div class="md:flex">
                            <p class="p-receipt__seeDetail" v-html="getLocalizationProp('Data.VATSubText', 'Order Totals include VAT.')"></p>
                            <button
                                type="button"
                                class="p-receipt__seeDetail -link"
                                @click="openVATModal()">
                                {{ getLocalizationProp('Data.VATLinkText', 'See Details') }}
                            </button>
                        </div>
                    </div>

                    <div v-if="isCn" class="p-receipt__actions">
                        <div v-if="!(data.OrderStatus === 'Pending')" class="mb-20">
                            <v-button
                                :is-anchor="true"
                                :cta="getLocalizationProp('Data.ContinueShopping.Text')"
                                class="-downloadInvoice w-full -center mb-16 md:mr-20 md:mb-0"
                                :href="getLocalizationProp('Data.ContinueShopping.Url')"
                                @click="gtmTrackAction({ id: 191, text: getLocalizationProp('Data.ContinueShopping.Text') }, $event)"
                            />
                        </div>
                        <div v-if="!(data.OrderStatus === 'Pending') && !(data.OrderStatus === 'Cancelled')" class="mb-20">
                            <v-button
                                v-if="eInvoiceStatus === 'AvailableForDownload'"
                                :is-anchor="true"
                                :cta="getLocalizationProp('Labels.DownloadEinvoice','Download E Invoice')"
                                class="-downloadInvoice w-full -white -center md:mb-0"
                                :href="eInvoiceUrl"
                            />
                            <p v-if="eInvoiceStatus === 'AvailableForDownload'" class="my-10 text-xs" v-html="getLocalizationProp('Labels.InvoiceDays','InvoiceDays')"></p>
                            <v-button
                                v-if="eInvoiceStatus === 'HasNotBeenGenerated'"
                                :is-anchor="true"
                                :cta="getLocalizationProp('Labels.DownloadEinvoice','Download E Invoice')"
                                class="-downloadInvoice w-full -disabled -disabled -isCn -center md:mb-0"
                                :href="'javascript:;'"
                            />
                            <p v-if="eInvoiceStatus === 'HasNotBeenGenerated'" class="my-10 text-xs" v-html="getLocalizationProp('Labels.InvoiceNotGenerated','InvoiceNotGenerated')"></p>
                        </div>
                        <div v-if="data.OrderStatus === 'Pending'" class="mb-20">
                            <v-button
                                :is-anchor="true"
                                :cta="getLocalizationProp('Labels.Payment')"
                                class="-backupOrder w-full -center mb-16 md:mr-20 md:mb-0"
                                @click="goToPayment()"
                            />
                        </div>
                        <div v-if="data.OrderStatus === 'Pending' && data.OrderType !== 'BackupOrder'" class="mb-20">
                            <v-button
                                :is-anchor="true"
                                :cta="getLocalizationProp('Labels.Cancel')"
                                class="-backupOrder w-full -center -white md:mb-0"
                                @click="openCancelModal()"
                            />
                        </div>
                        <button
                            v-if="data.OrderStatus !== 'Pending' && data.OrderStatus !== 'Cancelled'"
                            class="m-checkoutBackup__link w-full mx-auto"
                            @click="[print($event), gtmTrackAction({ id: 191, text: getLocalizationProp('Labels.Print') }, $event)]"
                        >{{ getLocalizationProp('Labels.Print') }}</button>
                        <p v-if="data.OrderStatus === 'Shipped' || data.OrderStatus === 'Returned'" class="my-20 md:my-40 text-xs" v-html="getLocalizationProp('Labels.ReturnedInstructionMsg')"></p>
                    </div>
                    <div v-else class="p-receipt__actions">
                        <div v-if="canBePaid && showPayLink" class="mb-20">
                            <v-button
                                :is-anchor="true"
                                :cta="getLocalizationProp('Labels.Payment')"
                                class="-backupOrder w-full -center mb-16 md:mr-20 md:mb-0"
                                @click="goToPayment()"
                            />
                        </div>
                        <div v-if="canBeCancelled && showCancelLink" class="mb-20">
                            <v-button
                                :is-anchor="false"
                                :cta="getLocalizationProp('Labels.Cancel')"
                                class="-backupOrder w-full -center -white md:mb-0"
                                @click="openCancelModal()"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <modal id="cancel-modal">
                <template v-slot:content>
                    <div class="to-md:px-30 to-md:pb-20">
                        <h2 class="text-gray-150 text-2xl-2 leading-tight pb-10">{{ getLocalizationProp('Data.CancelModel.Title', '你确定要取消本订单吗？') }}</h2>
                        <p class="text-gray-120 text-base mb-30">{{ getLocalizationProp('Data.CancelModel.Description', '本订单不再计入您的阅读消费承诺') }}</p>
                        <div class="md:flex">
                            <button class="a-button text-base font-medium py-12 px-30 mr-10 inline-block mb-10 md:px-40 md:mb-0 -white " type="button" @click="cancelOrder()">
                                {{ getLocalizationProp('Data.CancelModel.CancelBtn', '取消订单') }}
                            </button>
                            <button class="a-button text-base font-medium py-12 inline-block px-30 md:px-40 md:ml-10" type="button" @click="closeCancel()">
                                {{ getLocalizationProp('Data.CancelModel.KeepbBtn', '保留订单') }}
                            </button>
                        </div>
                    </div>
                </template>
            </modal>
            <modal id="m-unavailable" :heading-class="isCn ? 'text-gray-150 text-2xl font-semibold leading-tight pb-10' : ''">
                <template v-slot:heading>
                    {{ getLocalizationProp("Labels.BackupOrder.ModalHeader", "Some items could not be added to your Backup Order.") }}
                </template>

                <template v-slot:body>
                    <m-unavailable-items
                        ref="unavailable-items"
                        :class="{'-isCn' : isCn}"
                        :items="itemsNotAvailable"
                        :localization="localization"
                        :max-height="310">
                    </m-unavailable-items>
                </template>

                <template v-slot:footer>
                    <a
                        :href="getLocalizationProp('Data.BackupOrderPageLink.Url', '#')"
                        class="a-button flex justify-center w-1_2" :class="{'py-16 px-25 mb-32' : isCn}">
                        {{ getLocalizationProp("Data.BackupOrderPageLink.Text", "Continue") }}
                    </a>

                    <!-- Footnotes -->
                    <div
                        v-if="getLocalizationProp('Labels.BackupOrder.ModalUnavailableProductsFootNotes')"
                        class="text-gray-100 text-sm"
                        :class="{'not-italic mt-0 mb-30 md:mb-0' : isCn , 'mt-20' : !isCn}"
                        v-html="getLocalizationProp('Labels.BackupOrder.ModalUnavailableProductsFootNotes', '')">
                    </div>
                </template>
            </modal>
            <modal id="pending-payment-modal">
                <template v-slot:content>
                    <div class="to-md:px-30 to-md:pb-20">
                        <h2 class="text-gray-150 text-2xl-2 leading-tight pb-10">{{ paymentPendingModalHeaderTitle }}</h2>
                        <p class="text-gray-120 text-base mb-30" v-html="paymentPendingModalContent"></p>
                        <div class="md:flex">
                            <button class="a-button text-base font-medium py-12 inline-block px-30 md:px-40 md:ml-10" type="button" @click="closePendingPaymentModal()">
                                {{ getLocalizationProp('Labels.PendingPaymentModal.CloseButtonText', 'Close') }}
                            </button>
                        </div>
                    </div>
                </template>
            </modal>
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
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import placeholderMixin from '@common/source/js/vue/mixins/placeholder';
    import headerPrint from '../../01-molecules/print/print-header.vue';
    import api from '@api/routes/receipt';
    import apiBuo from '@api/routes/backuporder/cart/list';
    import apiCancelOrder from '@api/routes/cancelorder';
    import apiCfdiStatus from '@api/routes/cfdi/orderCfdi';
    import apiInvoice from '@api/routes/invoice';
    import apiInvoicePdf from '@api/routes/invoice/pdf';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import Button from '../../00-atoms/buttons/button.vue';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import { mapActions, mapState } from 'vuex';
    import * as paymentTypes from '../../../utils/payment-types';
    import shippingOnUsMixin from '../../../mixins/shipping-on-us';
    import ExpandableMessage from '../../01-molecules/expandable-message/expandable-message.vue';
    import MReceiptShippingOnUsBanner from '../../01-molecules/shipping-on-us/receipt-shipping-on-us-banner.vue';
    import OCfdiProductInvoice from '../../02-organisms/receipt/cfdi-product-invoice.vue';
    import oShippingAddress from '../../02-organisms/receipt/shipping-address.vue';
    import MAdditionalTax from '../../01-molecules/additional-tax/additional-tax.vue';
    import GuiReceiptInfo from '../../01-molecules/gui-receipt-info/gui-receipt-info.vue';

    export default {
        name: 'PReceipt',
        components: {
            headerPrint,
            MReceiptShippingOnUsBanner,
            oShippingAddress,
            MAdditionalTax,
            ExpandableMessage,
            GuiReceiptInfo,
            OCfdiProductInvoice
        },
        mixins: [ localizationMixin, isDesktop, placeholderMixin, shippingOnUsMixin ],
        Button,
        provide() {
            const appData = {};
            Object.defineProperty(appData, 'orderId', {
                enumerable: true,
                get: () => this.orderId
            });
            return { appData };
        },
        data() {
            return {
                data: {},
                itemsNotAvailable: {},
                payMethod: {},
                isLoaded: false,
                isRapDeposit: null,
                orderStatus: null,
                canBeCancelled: null,
                canBePaid: null,
                cfdiData: {},
                printTitle: null,
                readMoreOpen: false,
                summary: {},
                urlParams: null,
                eInvoice: null,
                eInvoiceAvailable: null,
                eInvoiceFormattedStatus: null,
                eInvoiceNotGenerated: null,
                eInvoiceStatus: null,
                eInvoiceProcessing: null,
                eInvoiceUnAvailable: null,
                eInvoiceUrl: null,
                loadingCfdiStatus: false,
                newLoyaltySOU: null,
                title: null,
                subTitle: null,
                userFlags: {},
                payMethodCN: {},
                subTotal: null,
                payMethodLabel: '',
                slotHeadingContent: ''
            };
        },
        computed: {
            ...mapState('paymentMethod', ['storedExternalPayMethods']),
            ...mapState('navigation', ['profileData']),
            ...mapState('pastOrders', ['pastOrdersArr']),

            canRequestCfdiComp() {
                return !((this.cfdiData?.Status === 3 && !this.cfdiData?.CanRequestCfdi) ||
                    (this.data?.OrderType || '').toLowerCase() === 'credit');
            },
            coaFormatted() {
                if(this.summary.CreditOnAccount?.Used === 0) {
                    return null;
                }
                const formattedUsed = this.summary.CreditOnAccount.FormattedUsed;
                return formattedUsed.includes('-') ? formattedUsed : `-${formattedUsed}`;
            },
            commitment() {
                return this.isCn ? this.summary.Commitment : this.summary.FormattedTotalCommitment;
            },
            enableLSDSummaryEnhancement() {
                return this.getLocalizationProp('Data.EnableLSDSummaryEnhancement', false);
            },
            expandableMessageText() {
                return this.getLocalizationProp('Labels.PayWith.ExpandableMessage.Text');
            },
            expandableMessageTextFull() {
                return this.getLocalizationProp('Labels.PayWith.ExpandableMessage.ExpandedText');
            },
            formattedDepositDeadline() {
                const dateStr = this.payMethod.VirtualAccountExpirationDate;
                const date = new Date(dateStr);
                date.setSeconds(0, 0);
                const year = date.getFullYear();
                const day = date.getDate();
                const hours = date.getHours();
                const month = this.getMonthValue(date.getMonth());
                const minutes = date.getMinutes();
                return `${year} ${this.localization.Labels.PayMethod.VirtualPaymethod.Year}
                ${month} ${this.localization.Labels.PayMethod.VirtualPaymethod.Month}
                ${day} ${this.localization.Labels.PayMethod.VirtualPaymethod.Day} 
                ${hours} ${this.localization.Labels.PayMethod.VirtualPaymethod.Hour}
                ${minutes} ${this.localization.Labels.PayMethod.VirtualPaymethod.Minutes}`;
            },
            formattedPaymentDeadline() {
                const dateStr = this.payMethod.VirtualAccountExpirationDate;
                const date = new Date(dateStr);
                return date.toLocaleDateString('ja-JP');
            },
            getVatSubTotalLabel() {
                const vatSubTotalLabel = this.getLocalizationProp('Data.VATPopupModal.VATPopupSubTotal', 'Total before {0}% VAT');
                const taxRate = this.summary?.TaxBaseRate;
                if(vatSubTotalLabel && taxRate) {
                    return replaceToken(vatSubTotalLabel, taxRate * 100);
                } else {
                    return vatSubTotalLabel;
                }
            },
            getVatPointTotal () {
                const vatPointTotal = this.getLocalizationProp('Data.VATPopupModal.VATPopupTaxTotal', '{0}% VAT');
                const taxRate = this.summary?.TaxBaseRate;
                if(vatPointTotal && taxRate) {
                    return replaceToken(vatPointTotal, taxRate * 100);
                } else {
                    return vatPointTotal;
                }
            },
            guiList() {
                return this.data.Guis || [];
            },
            hasNewLoyaltySOU() {
                return this.newLoyaltySOU;
            },
            hasQualifiedForOffer() {
                return this.shippingOnUsCurrentOffer.WillEarn;
            },
            headingClasses() {
                return [
                    this.isCn || this.isJP ? '-cn' : '',
                    this.showGui ? '-extended' : ''
                ];
            },
            // Option to hide specific sections only if order is Home Security or Infoguard (OrderSubType === true)
            hideBuoLink() {
                return this.data.HideBuoLink;
            },
            hideDollarsToActivate() {
                return this.getLocalizationProp('Data.HideDollarsToActivate', false);
            },
            isACH() {
                // Check if pay method type is ach checking, direct debit or checking
                const achPaymentTypes = [
                    paymentTypes.achChecking,
                    paymentTypes.checking,
                    paymentTypes.directDebit,
                    'checking'
                ];
                return achPaymentTypes.includes(this.payMethod?.PayMethodType);
            },
            isShippingCrossCountry() {
                return this.localization.Data?.IsShippingCrossCountry;
            },
            isPayPal() {
                return this.payMethod?.PayMethodType.toLowerCase() === 'paypal';
            },
            isPh() {
                return this.$env.Country === 'Philippines';
            },
            isValidInvoice() {
                return this.eInvoice && Object.keys(this.eInvoice).length > 0;
            },
            hideNameInCongratulationsText() {
                return this.getLocalizationProp('Labels.PendingPaymentModal.HideNameInCongratulationsText', false);
            },
            hideOrderHistoryProductPoints() {
                return this.data?.HideOrderHistoryProductPoints;
            },
            // For countries where Sales Tax should not be displayed, such as KR
            hideSalesTax() {
                return this.getLocalizationProp('Data.HideSalesTax', false);
            },
            hideShipMethod() {
                return this.localization?.Data?.HideShipMethod || false;
            },
            installmentPeriod() {
                if(this.payMethod?.Installment === null) {
                    return '';
                }
                const installmentId = this.payMethod?.Installment;
                const installments = this.getLocalizationProp('Data.Installments', []);
                /* eslint-disable */console.log(...oo_oo(`765144263_1206_16_1206_57_4`,'installments', installments));
                const period = installments.find(installment => installment.Value === installmentId.toString());

                return period?.Text;
            },
            invoiceReminder() {
                return this.getLocalizationProp('Labels.GUI.InvoiceReminder', '');
            },
            isKr() {
                return this.$env.Country === 'Korea';
            },
            isOleCheckoutFlow() {
                return this.getLocalizationProp('Data.IsOleCheckoutFlow', false);
            },
            isGuest() {
                return this.userFlags?.IsGuest;
            },
            isCCApplicable() {
                return this.summary.ConvenienceCertificates.Used > 0;
            },
            isConvenienceStore() {
                return this.payMethod?.PayMethodType === paymentTypes.convenienceStore;
            },
            isPreferred() {
                return this.data.CanAddToBackupOrder; // It was asked to use this one as BE said is the same as IsPreferedMember.
            },
            hasPackageInfo() {
                let _packageData = this.data.PackageInformation[0] !== undefined;

                return _packageData;
            },
            itemTotal() {
                const signMoney = this.summary?.FormattedCartGrossTotal.replace(/[0-9,\\.]+/, '');

                return this.isCn ? (this.summary?.Discount === 0 ? this.summary?.FormattedCartGrossTotal : signMoney + parseFloat(this.summary?.CartGrossTotal - this.summary?.Discount).toFixed(2)) : this.summary?.FormattedCartGrossTotal;
            },
            isPayMethodImage() {
                return this.payMethod?.PayMethodImage?.Url;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isJP() {
                return this.$env?.Country === 'Japan' || false;
            },
            isVirtualAccount() {
                return this.payMethod?.PayMethodType === paymentTypes.virtualPayment;
            },
            is3DPortal() {
                return this.payMethod?.PayMethodType === paymentTypes.portal;
            },
            isFPX3DPortal() {
                return this.payMethod?.CollectionsProcessorType === 'FPX3DPortal' || false;
            },
            lsdEarned() {
                return this.isCn
                    ? this.summary?.LoyaltyShoppingDollars?.FormattedEarned
                    : this.summary?.LoyaltyShoppingDollars?.FormattedEarnedThisOrder;
            },
            lsdTitleToolTip() {
                return this.getLocalizationProp('Labels.Lsd.TitleToolTip');
            },
            lsdTotal() {
                return this.summary.LoyaltyShoppingDollars?.FormattedUsed;
            },
            lsdUsed() {
                return this.summary?.LoyaltyShoppingDollars?.Used || 0;
            },
            lsdTotalWithLink() {
                const lsdUrl = this.getLocalizationProp('Data.CartSummary.LsdLink.Url');
                const lsdText = this.getLocalizationProp('Data.CartSummary.LsdLink.Text');
                return this.getLocalizationProp('Labels.CartSummary.LsdTotal').replace('{0}', '<a class="underline" href="' + lsdUrl + '">' + lsdText + '</a>');
            },
            maskedCardNumber() {
                const lastFourDigits = this.payMethod?.LastFourDigitsOfAccount || '';
                return this.payMethod.MaskingCondensed + ' ' + lastFourDigits;
            },
            orderId () {
                return this.getUrlParam('orderid') || this.getLocalizationProp('Data.OrderId');
            },
            productDiscount() {
                return this.isCn ? this.summary.FormattedDiscount : '';
            },
            preferredSavings() {
                const text = this.getLocalizationProp('Labels.CartSummary.YouSaved');
                return this.summary.FormattedPreferredSavings && text ? text.replace('{0}', this.summary.FormattedPreferredSavings) : null;
            },
            printInvoiceAsPdf() {
                return this.localization?.Data?.PrintAsPDF || false;
            },
            redemptionFee() {
                return this.summary?.LsdRedemptionFee?.FormattedPrice;
            },
            serviceTaxFormatted() {
                return this.summary?.ServiceTaxes?.[0]?.FormattedTaxAmount;
            },
            serviceTaxPercentageLabel() {
                const serviceTaxLabel = this.getLocalizationProp('Labels.ServiceTaxLabel');
                const taxRate = this.summary?.ServiceTaxes?.[0]?.TaxRate || 0;
                const formattedTax = (taxRate * 100).toFixed(0);
                return replaceToken(serviceTaxLabel, formattedTax);
            },
            shippingBack() {
                return this.getLocalizationProp('Labels.ShippingOnUs.ShippingBack');
            },
            showACHDelayedShippingMessage() {
                const showACHDelayedShipping = this.getLocalizationProp('Data.ShowAchDelayedShipping', false);
                return !!(this.data.HasACHDelay && showACHDelayedShipping && this.isACH);
            },
            showPurchaseCommitment() {
                return this.userFlags?.ShowPurchaseCommitment;
            },
            showVAT() {
                return this.getLocalizationProp('Data.VAT.ShowVATPopup', false);
            },
            showBackupCard() {
                if(this.$env?.IsCn) {
                    return !this.getLocalizationProp('Data.IsShippingCrossCountry', true) && this.userFlags?.ViewMemberPricing && this.data.ShowBackupOrderCard;
                }
                return !this.getLocalizationProp('Data.IsShippingCrossCountry', true) && this.userFlags?.ViewMemberPricing;
            },
            shouldShowCfdiProductInvoiceMx() {
                return this.showCfdiProductInvoice && !this.isShippingCrossCountry && this.shiptoaddress?.Country === 'MX';
            },
            showBecomeMemberCard() {
                return !this.userFlags?.ViewMemberPricing && this.getLocalizationProp('Labels.BecomeMember');
            },
            showCfdiProductInvoice() {
                return this.getLocalizationProp('Data.ShowCfdiProductInvoice', false);
            },
            showExpandableMessage() {
                return !!(this.showACHDelayedShippingMessage && this.expandableMessageText && this.expandableMessageTextFull);
            },
            // Note showGstInOrderSummary is for the GST in the order summary section. Note that this replaces HideGST.
            // ShowGSTBelowTotal is used for the display of the GST Summary section below the order detail.
            showGstInOrderSummary() {
                return this.getLocalizationProp('Data.ShowGSTInOrderSummary', false);
            },
            showLsdCard() {
                return this.userFlags?.ViewMemberPricing && !this.userFlags?.IsGuest;
            },
            totalCompFormatted() {
                return this.summary.FormattedCartNetTotal;
            },

            shippingConfigId() {
                return this.getLocalizationProp('Data.ShippingOnUsTrackerId', null);
            },
            // AU, NZ, TW, HK Address format will always display with the country.
            showCountry() {
                const showCountryList = ['australia', 'new zealand', 'taiwan', 'hong kong'];
                let country = this.shiptoaddress.Country.toLowerCase();
                return showCountryList.includes(country);
            },
            showInstallment() {
                return this.payMethod.AllowedForInstallment;
            },
            showState() {
                return this.shiptoaddress.Country.toLowerCase() !== 'new zealand';
            },
            showPayLink() {
                return this.getLocalizationProp('Data.ShowPayLink', true);
            },
            showCancelLink() {
                return this.getLocalizationProp('Data.ShowCancelLink', true);
            },
            showLsdRedemptionFee() {
                return Boolean(this.summary?.LsdRedemptionFee?.Sku);
            },
            // The ShowToSpend flag was added for JP, but previous cultures used FromOrderFlow
            // ToSpend should never show for KR
            showToSpend() {
                if(this.getLocalizationProp('Data.ShowToSpend') === false || this.isKr) {
                    return false;
                } else if(this.getLocalizationProp('Data.ShowToSpend') || this.summary.FromOrderFlow) {
                    return true;
                }
                return false;
            },
            showVatInOrderSummary() {
                return this.getLocalizationProp('Data.VAT.ShowVATInOrderSummary', false);
            },
            showWelcomeProgramLsd() {
                return this.data.Items.some(item => item.LineType === 'WelcomeProgram');
            },
            totalDiscount() {
                return this.isCn ? this.summary.Discount : 0;
            },
            gstTaxLabel() {
                const gstLabel = this.getLocalizationProp('Labels.GSTLabel');
                return this.taxPercentageLabel(gstLabel);
            },
            showGstBelowTotal() {
                return this.summary?.FormattedSalesTax && this.getLocalizationProp('Data.ShowGSTBelowTotal', false);
            },
            showVatBelowTotal() {
                return this.summary?.FormattedSalesTax && this.getLocalizationProp('Data.ShowVatBelowTotal', false);
            },
            showGui() {
                return this.getLocalizationProp('Data.ShowGui', false) && this.guiList.length;
            },
            setFontSize() {
                return this.isOleCheckoutFlow ? 'text-base' : 'text-lg';
            },
            reimbursedInLsd() {
                if(this.hasQualifiedForOffer) {
                    const text = this.getLocalizationProp('Labels.Lsd.ReimbursedInLsd');
                    return this.shippingOnUsCurrentOffer.FormattedReimbursementValue && text ? text.replace('{0}', this.shippingOnUsCurrentOffer.FormattedReimbursementValue) : '';
                }
                return '';
            },
            reActivationIncomplete() {
                // Bug 123679, 128724 - Business only wants this modal to appear when the account isn't activated and there is a pending payment.
                // If both of these two values, canBeCancelled and canBePaid, are true, we are assuming that the payment is pending.
                return this.profileData?.Restrictions?.ReActivationIncomplete && this.canBeCancelled && this.canBePaid;
            },
            hasMultiplePayMethods() {
                return (this.data?.PayMethods?.length ?? 0) > 1;
            },
            paymentPendingModalHeaderTitle() {
                const title = this.getLocalizationProp('Labels.PendingPaymentModal.CongratulationText', 'Congratulation');
                const name = this.profileData?.CustomerNames?.CustomerFirstName ?? '';
                if(this.hideNameInCongratulationsText) {
                    return `${title}`;
                } else if(title.includes('{0}')) {
                    return `${title.replace('{0}', name)}!`;
                } else {
                    return `${title} ${name}!`;
                }
            },
            paymentPendingModalContent() {
                let orderNumber = '';
                if(this.pastOrdersArr && this.pastOrdersArr.length > 0) {
                    orderNumber = this.pastOrdersArr[0].OrderNumber || '';
                }
                return replaceToken(this.getLocalizationProp('Labels.PendingPaymentModal.PendingPaymentModalText', ''), orderNumber);
            },
            getCartGrossTotal() {
                return this.summary?.FormattedCartGrossTotal || 0;
            },
            getSalesTax() {
                return this.summary?.FormattedSalesTax || 0;
            },
            getCartNetTotal() {
                return this.summary?.FormattedCartNetTotal || 0;
            },
            vatLabel() {
                const vatLabel = this.getLocalizationProp('Data.VAT.VATInlineSummaryLabel', '{0}% VAT Inclusive');
                return this.taxPercentageLabel(vatLabel);
            }
        },
        watch: {
            itemsNotAvailable() {
                if(this.itemsNotAvailable !== null && this.itemsNotAvailable.length > 0) {
                    this.$modal.show({ id: 'm-unavailable' });
                } else {
                    const redirectLink = this.getLocalizationProp('Data.BackupOrderPageLink.Url', 'https://melaleuca.com');
                    window.location.assign(redirectLink);
                }
            },
            shippingOnUsEnabled(newVal) {
                if(newVal) {
                    this.getSOU({ rewardId: this.localization?.Data?.RewardsConfigId, shippingId: this.localization?.Data?.ShippingOnUsTrackerId, orderId: this.orderId, isReceipt: true, hasNewLoyaltySOU: this.hasNewLoyaltySOU });
                }
            },
            reActivationIncomplete(val) {
                if(val) {
                    this.$modal.show({id: 'pending-payment-modal'});
                }
            }
        },
        mounted() {
            if(!this.isLoaded) this.getData();
            this.urlParams = new URLSearchParams(window.location.search);
        },
        methods: {
            ...mapActions('paymentMethod', ['getExternalPayMethod']),
            ...mapActions('shippingOnUsV2', ['getSOU']),
            ...mapActions('navigation', ['getNavigation']),
            ...mapActions('pastOrders', ['getPastOrderData']),

            replaceToken,
            async addToBackupOrderList(e) {
                e.preventDefault();
                let itemList = [];
                let result = null;
                let error = [];
                let product = {};

                this.data.Items.forEach(item => {
                    product = {
                        Sku: item.Sku,
                        Quantity: item.Quantity,
                        Configurations: item.Configurations || item.ConfigurationSkus,
                        Category: null,
                        LineId: null,
                        LineType: item.LineType
                    };

                    itemList.push(product);
                });

                const response = await apiBuo.post(itemList);

                if(response.success && response?.data?.Success) {
                    result = response?.data?.Data;
                } else {
                    result = null;

                    if(response?.data?.ErrorMessages) {
                        error = this.parseError(response.data.ErrorMessages);
                    }
                }
                /* eslint-disable */console.log(...oo_oo(`765144263_1519_16_1519_56_4`,'error add to BUO: ', error));

                if(result && result.Items) {
                    // Get all items with non-empty validation
                    this.itemsNotAvailable = result.Items.filter(item => item.Validation && item.Validation.length) ? result.Items.filter(item => item.Validation && item.Validation.length) : null;
                }
            },
            parseError: function(errorMessages) {
                let error = [];
                if(Array.isArray(errorMessages)) {
                    errorMessages.forEach(e => {
                        error.push(e.Translation || e);
                    });
                } else {
                    error = [errorMessages];
                }
                return error;
            },
            async getOrderCfdiStatus() {
                this.loadingCfdiStatus = true;
                try {
                    const response = await apiCfdiStatus.get(`?orderNumber=${this.data.OrderNumber}`);
                    if(response.success && response.data?.Success) {
                        this.cfdiData = response.data?.Data || {};
                    } else {
                        /* eslint-disable */console.error(...oo_tx(`765144263_1544_24_1544_113_11`,'There was an issue with the request:', response.data?.ErrorMessages || ''));
                    }
                } catch (error) {
                    /* eslint-disable */console.error(...oo_tx(`765144263_1547_20_1547_63_11`,'Some Network issue:', error));
                } finally {
                    this.loadingCfdiStatus = false;
                }
            },
            getData: async function() {
                const orderId = this.getUrlParam('orderId') || this.getLocalizationProp('Data.OrderId');
                const params = new URLSearchParams(window.location.search);

                if(orderId) {
                    api.setRoute(`/api/receipt/${orderId}`);
                    apiInvoice.setRoute(`/api/invoice/${orderId}`);
                    // Note that api will set FromOrderFlow to true in this case. Otherwise default is false.
                }
                let sendParams = {};
                if(JSON.parse(params.get('trackConversion'))) {
                    sendParams.onOrderFlow = true;
                }
                const response = await api.query(sendParams);
                if(response.success) {
                    this.summary = response.data?.Data?.Summary;
                    this.shiptoaddress = response.data?.Data?.ShipToAddress;
                    this.data = response.data?.Data;
                    this.eInvoice = this.data?.EInvoice;
                    this.eInvoiceAvailable = this.data?.EInvoice?.IsEInvoiceAvailable;
                    this.eInvoiceDate = this.data?.EInvoice?.FormattedEInvoiceDate;
                    this.eInvoiceStatus = this.data?.EInvoice?.EInvoiceStatus;
                    this.eInvoiceFormattedStatus = this.data?.EInvoice?.FormattedEInvoiceStatus;
                    this.eInvoiceNotGenerated = this.data?.EInvoice?.InvoiceNotGenerated;
                    this.eInvoiceProcessing = this.data?.EInvoice?.InvoiceProcessing;
                    this.eInvoiceUnAvailable = this.data?.EInvoice?.InvoiceUnAvailable;
                    this.userFlags = response.data?.Data?.UserFlags;
                    this.payMethod = this.isCn ? this.data.PayMethods[this.data.PayMethods.length - 1] : this.data.PayMethods[0];
                    this.orderStatus = this.data.OrderStatus;
                    this.canBeCancelled = this.data.CanBeCancel;
                    this.canBePaid = this.data.CanBePaid;
                    this.isRapDeposit = this.data.IsRapDeposit;
                    this.isLoaded = true;
                    this.newLoyaltySOU = this.data.NewLoyaltySOU;
                    this.title = this.data.ConfirmationTitle;
                    this.subTitle = this.data.ConfirmationSubTitle;
                    this.pushPurchase(this.data);
                    if(this.shouldShowCfdiProductInvoiceMx && this.data?.OrderNumber) {
                        this.getOrderCfdiStatus();
                    }
                    if(this.isCn) {
                        const invoiceResponse = await apiInvoice.get();
                        if(invoiceResponse.success) {
                            if(invoiceResponse.data?.Success) {
                                this.eInvoiceStatus = invoiceResponse.data?.Data?.PdfGenerateStatus;
                                this.eInvoiceUrl = invoiceResponse.data?.Data?.PdfUrl;
                            }
                        }
                    }

                    if(this.summary?.CreditOnAccount?.Used > 0 && this.isCn) {
                        const signMoney = this.summary.FormattedCartNetTotal.replace(/[0-9,\\.]+/, '');
                        // Subtotal
                        this.subTotal = signMoney + parseFloat(this.summary.CartNetTotal + this.summary?.CreditOnAccount?.Used).toFixed(2);
                    }
                }

                if(this.isCn) {
                    // Get all external payment methods of the customer used in CN
                    await this.getExternalPayMethod({isReceipt: true});

                    if(this.data.PayMethods.length === 1) {
                        const resPayMethod = this.data.PayMethods[this.data.PayMethods.length - 1];
                        const filterPayMethods = this.storedExternalPayMethods?.PayMethods.filter(item => { return item.CollectionProcessorType === resPayMethod.CollectionsProcessorType; });
                        this.payMethodCN = filterPayMethods.length > 0 ? filterPayMethods[0] : {};

                        if(this.payMethod.CollectionsProcessorType === null || this.payMethod.CollectionsProcessorType.toLowerCase().indexOf('unknow') >= 0) {
                            if(this.payMethod.PayMethodType === 'VirtualCreditCard') {
                                this.payMethodLabel += this.getLocalizationProp('Labels.PayMethod.CancelOrderLabel') + (this.summary?.LoyaltyShoppingDollars?.Used > 0 ? ', ' : '');
                            } else if(this.payMethod.PayMethodType === 'CreditOnAccount') {
                                this.payMethodLabel += this.getLocalizationProp('Labels.PayMethod.COALabel') + (this.summary?.LoyaltyShoppingDollars?.Used > 0 ? ', ' : '');
                            } else if(this.payMethod.PayMethodType === 'Cash') {
                                this.payMethodLabel += this.getLocalizationProp('Labels.PayMethod.CashLabel') + (this.summary?.LoyaltyShoppingDollars?.Used > 0 ? ', ' : '');
                            } else if(this.payMethod.PayMethodType === 'WireTransferFromCustomer') {
                                this.payMethodLabel += this.getLocalizationProp('Labels.PayMethod.WireTransferFromCustomerLabel') + (this.summary?.LoyaltyShoppingDollars?.Used > 0 ? ', ' : '');
                            }
                        }
                    } else if(this.data.PayMethods.length > 1) {
                        this.data.PayMethods.filter((pm, index) => {
                            if(pm.CollectionsProcessorType === null || pm.CollectionsProcessorType.toLowerCase().indexOf('unknow') >= 0) {
                                if(pm.PayMethodType === 'VirtualCreditCard') {
                                    this.payMethodLabel += this.getLocalizationProp('Labels.PayMethod.CancelOrderLabel') + (this.summary?.LoyaltyShoppingDollars?.Used > 0 || this.data.PayMethods.length !== index + 1 ? ', ' : '');
                                } else if(pm.PayMethodType === 'CreditOnAccount') {
                                    this.payMethodLabel += this.getLocalizationProp('Labels.PayMethod.COALabel') + (this.summary?.LoyaltyShoppingDollars?.Used > 0 || this.data.PayMethods.length !== index + 1 ? ', ' : '');
                                } else if(pm.PayMethodType === 'Cash') {
                                    this.payMethodLabel += this.getLocalizationProp('Labels.PayMethod.CashLabel') + (this.summary?.LoyaltyShoppingDollars?.Used > 0 || this.data.PayMethods.length !== index + 1 ? ', ' : '');
                                } else if(pm.PayMethodType === 'WireTransferFromCustomer') {
                                    this.payMethodLabel += this.getLocalizationProp('Labels.PayMethod.WireTransferFromCustomerLabel') + (this.summary?.LoyaltyShoppingDollars?.Used > 0 || this.data.PayMethods.length !== index + 1 ? ', ' : '');
                                }
                            } else {
                                const filterPayMethods = this.storedExternalPayMethods?.PayMethods?.filter(item => { return item.CollectionProcessorType === pm.CollectionsProcessorType; });
                                this.payMethodLabel += filterPayMethods.length > 0 ? filterPayMethods[0].Text + (this.summary?.LoyaltyShoppingDollars?.Used > 0 || this.data.PayMethods.length !== index + 1 ? ', ' : '') : '';
                            }
                        });
                    }

                    if(this.summary?.LoyaltyShoppingDollars?.Used > 0) {
                        if(this.payMethodCN.Text) {
                            this.payMethodLabel += this.payMethodCN.Text + ', ';
                            this.payMethodCN = {};
                        }
                        this.payMethodLabel += this.getLocalizationProp('Labels.PayMethod.LSDUsedLabel');
                    }

                    // Get commitment profile used in CN
                    this.$store.dispatch('commitmentProfile/getData', true, { root: true });
                }
                if(JSON.parse(params.get('trackConversion'))) {
                    this.sendCollectCode();
                }

                // Get navigation data
                await this.getNavigation();

                // Get past orders
                await this.getPastOrderData({
                    baseApiAddress: null,
                    orderHistory: null,
                    page: 1,
                    year: null,
                    init: true // check initial value
                });
            },
            getMonthValue(index) {
                let val = index + 1;
                if(index === 11) {
                    return 12;
                } else if(index >= 0) {
                    return val;
                }
            },
            getUrlParam: function(param) {
                if(this.urlParams) {
                    return this.urlParams.get(param);
                }
            },
            async print(event, isValidInvoice = false) {
                event.preventDefault();

                if(this.isPh || this.printInvoiceAsPdf || isValidInvoice) {
                    // this should automatically download pdf returned from service
                    // no error handling until the endpoint can be properly tested
                    const response = await apiInvoicePdf.get(this.data.OrderNumber, {
                        responseType: 'blob',
                        headers: {
                            'Accept': 'application/octet-stream'
                        }
                    });
                    /* eslint-disable */console.log(...oo_oo(`765144263_1700_20_1700_56_4`,response, response.data));
                    if(response.success) {
                        // handled in try/catch because of the possibility of non-binary data
                        try {
                            // ensure blob from response has the correct MIME type
                            const pdf = new Blob([response.data], { type: 'application/pdf' });
                            const url = window.URL.createObjectURL(pdf);
                            window.open(url);
                        } catch (err) {
                            /* eslint-disable */console.log(...oo_oo(`765144263_1709_28_1709_66_4`,'Invoice PDF Error:', err));
                        }
                    }
                } else window.print();
            },
            pushPurchase(data) {
                const referPathname = document.referrer.split('/')[3];
                const paid = this.getUrlParam('paid');
                if(referPathname === 'checkout' || (this.isCn && paid === 'true')) {
                    const actionField = {
                        'id': data.OrderNumber, // Transaction ID - REQUIRED
                        'revenue': data.Summary.CartNetTotal, // Total trans. value (incl. tax and shipping)
                        'tax': data.Summary.SalesTax,
                        'shipping': data.Summary.ShipMethodQuote,
                        'coupon': '', // IF used on the whole order (doesn't exist yet)
                        'affiliation': 'Online Store'
                    };
                    const items = data.Items;
                    let products = [];
                    for (const item of items) {
                        products.push({
                            'id': item.Sku, // Product ID or SKU (string) - REQUIRED
                            'name': (item.Title || '').replace(/<\/?[^>]+>/gi, ''), // Product name (string) - REQUIRED
                            'price': item.Price / item.Quantity, // Product price (string)
                            'coupon': (item.PromotionId || '').toString(),
                            'brand': item.Brand || '', // Product brand (string)
                            'category': item.Category || '', // Product category (string)
                            'variant': item.Variant || '', // Product variant (string)
                            'quantity': item.Quantity, // Product quantity (number)
                            'metric1': item.Points || 0, // Points (number) See notes above
                            'promotionId': item.PromotionId || 0
                        });
                    }

                    /* eslint-disable */console.log(...oo_oo(`765144263_1743_20_1743_80_4`,'Receipt Action & Items', actionField, products));

                    window.dataLayer && window.dataLayer.push({
                        'event': 'purchase',
                        'ecommerce': {
                            'currencyCode': this.$env?.CurrencyCode || '', // Local currency of the market purch
                            'purchase': {
                                'actionField': actionField,
                                'products': products
                            }
                        }
                    });
                }
            },
            sendCollectCode: function() {
                const items = this.data.Items.map(item => {
                    return {
                        item: `${item.Sku}-${this.data.CountryInitial}`,
                        quantity: item.Quantity,
                        price: item.Price,
                        unique_id: item.Sku
                    };
                });
                if(window._etmc) {
                    window._etmc.push(['trackConversion', {'cart': items}]);
                }
            },
            taxPercentageLabel(label) {
                const taxRate = this.summary?.TaxGroups?.[0]?.TaxRate;
                if(label && taxRate) {
                    const formattedTax = (taxRate * 100).toFixed(0);
                    return replaceToken(label, formattedTax);
                } else {
                    return label;
                }
            },
            openCancelModal() {
                this.$modal.show({id: 'cancel-modal'});
            },
            closeCancel() {
                this.$modal.hide({id: 'cancel-modal'});
            },
            closePendingPaymentModal() {
                this.$modal.hide({id: 'pending-payment-modal'});
            },
            openVATModal() {
                this.$modal.show({id: 'vat-popup'});
            },
            closeVATModal() {
                this.$modal.hide({id: 'vat-popup'});
            },
            goToPayment() {
                window.location.href = this.getLocalizationProp('Data.Payment.Url') + '?orderNumber=' + this.getUrlParam('orderId');
            },
            async cancelOrder() {
                let error = [];
                const params = {
                    orderNumber: this.getUrlParam('orderId') || this.getUrlParam('orderid'),
                    networkId: this.checkDevice()
                };

                this.closeCancel();
                this.isLoaded = false;

                const response = await apiCancelOrder.post(params);

                if(response.success && response?.data?.Success) {
                    window.location.reload();
                } else {
                    if(response?.data?.ErrorMessages) {
                        error = this.parseError(response.data.ErrorMessages);
                    }
                    this.isLoaded = true;
                    /* eslint-disable */console.log(...oo_oo(`765144263_1816_20_1816_62_4`,'error cancel order: ', error));
                }
            },
            checkDevice() {
                const isMobile = (navigator.userAgent.toLowerCase().match(/mobile/i)) || (/Mobi|Android|iPhone/i.test(navigator.userAgent));
                return isMobile ? 'Mobile' : 'Desktop';
            }
        }
    };
/* istanbul ignore next *//* c8 ignore start *//* eslint-disable */;function oo_cm(){try{return (0,eval)("globalThis._console_ninja") || (0,eval)("/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x27f4ea=_0x5cf7;function _0x36d9(){var _0x2a7840=['690392SBBGXD','ninjaSuppressConsole','level','%c\\x20Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','_connected','map','_isNegativeZero','getWebSocketClass','_Symbol','5016Girvng','cappedElements','props','negativeInfinity','astro','split','_socket','count','10.0.2.2','forEach','message','85491CEGaSW','getOwnPropertyNames','[object\\x20BigInt]','onopen','expo','depth','stack','prototype','_dateToString','_sortProps','setter','undefined','autoExpandMaxDepth','_reconnectTimeout','[object\\x20Array]','_propertyName','_isPrimitiveType','url','match','_setNodeQueryPath','_p_name','_objectToString','bigint','reducedLimits','env','constructor','[object\\x20Set]','String','_hasSymbolPropertyOnItsPath','196xjkxBf','osName','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host','_connectAttemptCount','resetOnProcessingTimeAverageMs','parent','_ws','_p_','_getOwnPropertyDescriptor','_sendErrorMessage','replace','readyState','get','data','totalStrLength','reducePolicy','function','_additionalMetadata','angular','failed\\x20to\\x20connect\\x20to\\x20host:\\x20','Map','elements','current','_type','autoExpandPropertyCount','endsWith','isExpressionToEvaluate','resetWhenQuietMs','_isMap','_inBrowser','_blacklistedProperty','host','_maxConnectAttemptCount','1.0.0','_hasSetOnItsPath','length','_setNodeLabel','_ninjaIgnoreNextError','negativeZero','Symbol','disabledLog','127.0.0.1','RegExp','origin','[object\\x20Date]','bound\\x20Promise','index','iterator','trace','react-native','_HTMLAllCollection','autoExpand','object','funcName','_console_ninja','node','WebSocket','log','some','_console_ninja_session','versions','disabledTrace','push','call','unknown','timeStamp','_addObjectProperty','_connecting','POSITIVE_INFINITY','startsWith','hostname','next.js','modules','noFunctions','serialize','positiveInfinity','expressionsToEvaluate','_disposeWebsocket','process','concat','_isArray','charAt','capped','return\\x20import(url.pathToFileURL(path.join(nodeModules,\\x20\\x27ws/index.js\\x27)).toString());','_setNodePermissions','name','gateway.docker.internal','\\x20browser','import(\\x27path\\x27)','performance','_addFunctionsNode','onmessage','stackTraceLimit','getOwnPropertyDescriptor','10816xJVhzh','_webSocketErrorDocsLink','_WebSocket','allStrLength','remix','_hasMapOnItsPath','resolveGetters','cappedProps','getOwnPropertySymbols','substr','_connectToHostNow','_consoleNinjaAllowedToStart','toString','_processTreeNodeResult','_quotedRegExp','bind','Boolean','string','strLength','dockerizedApp','eventReceivedCallback','sortProps','autoExpandPreviousObjects','global','android','HTMLAllCollection','location','catch','reduceOnAccumulatedProcessingTimeMs','includes','send','reload','6410qFSoKL','_inNextEdge','\\x20server','default','array','defaultLimits','ws://','unref','test','1770272872048','_allowedToSend','_keyStrRegExp','NEXT_RUNTIME','args','hasOwnProperty',[\"localhost\",\"127.0.0.1\",\"example.cypress.io\",\"10.0.2.2\",\"CNHODWIT013W40C\",\"10.136.130.192\",\"172.28.64.1\"],'','Number','Promise','NEGATIVE_INFINITY','_extendedWarning','root_exp_id','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','valueOf','https://tinyurl.com/37x8b79t','close','time','Buffer','_capIfString','fromCharCode','perf_hooks','console','reduceOnCount','_numberRegExp','perLogpoint','_attemptToReconnectShortly','resolve','see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','autoExpandLimit','_WebSocketClass','hits','Set','[object\\x20Map]','failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket','reduceLimits','_setNodeExpressionPath','78anopaZ','_setNodeId','import(\\x27url\\x27)','_cleanNode','_allowedToConnectOnSend','coverage','_addLoadNode','284330UEndtY','nodeModules',\"c:\\\\Users\\\\cn4095\\\\.vscode\\\\extensions\\\\wallabyjs.console-ninja-1.0.515\\\\node_modules\",'_regExpToString','_treeNodePropertiesBeforeFullValue','value','_treeNodePropertiesAfterFullValue','_isUndefined',',\\x20see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','symbol','edge','number','toUpperCase','date','isArray','_getOwnPropertyNames','null','_addProperty','Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','now','hrtime','warn','toLowerCase','stringify','error','475200jRFXVC','_isPrimitiveWrapperType','onerror','pop','12429FzEnku','_undefined','onclose','type','_isSet'];_0x36d9=function(){return _0x2a7840;};return _0x36d9();}(function(_0x247d5a,_0x341b8b){var _0x3f55d1=_0x5cf7,_0x36495b=_0x247d5a();while(!![]){try{var _0x14d248=-parseInt(_0x3f55d1(0x1dc))/0x1*(-parseInt(_0x3f55d1(0x18e))/0x2)+-parseInt(_0x3f55d1(0x20e))/0x3*(parseInt(_0x3f55d1(0x130))/0x4)+-parseInt(_0x3f55d1(0x1e3))/0x5+-parseInt(_0x3f55d1(0x1fc))/0x6+-parseInt(_0x3f55d1(0x219))/0x7+-parseInt(_0x3f55d1(0x205))/0x8+parseInt(_0x3f55d1(0x200))/0x9*(parseInt(_0x3f55d1(0x1ae))/0xa);if(_0x14d248===_0x341b8b)break;else _0x36495b['push'](_0x36495b['shift']());}catch(_0x4c7c25){_0x36495b['push'](_0x36495b['shift']());}}}(_0x36d9,0xf1d4b));function z(_0x22e966,_0x2a08d4,_0x1d9d5f,_0x18eca4,_0x226865,_0x14e3c8){var _0x3d90b1=_0x5cf7,_0x4c08d3,_0x3dfd9f,_0x48683c,_0x7da6d3;this[_0x3d90b1(0x1a5)]=_0x22e966,this[_0x3d90b1(0x14f)]=_0x2a08d4,this['port']=_0x1d9d5f,this['nodeModules']=_0x18eca4,this[_0x3d90b1(0x1a1)]=_0x226865,this[_0x3d90b1(0x1a2)]=_0x14e3c8,this[_0x3d90b1(0x1b8)]=!0x0,this[_0x3d90b1(0x1e0)]=!0x0,this[_0x3d90b1(0x209)]=!0x1,this[_0x3d90b1(0x173)]=!0x1,this['_inNextEdge']=((_0x3dfd9f=(_0x4c08d3=_0x22e966[_0x3d90b1(0x17e)])==null?void 0x0:_0x4c08d3[_0x3d90b1(0x231)])==null?void 0x0:_0x3dfd9f[_0x3d90b1(0x1ba)])==='edge',this[_0x3d90b1(0x14d)]=!((_0x7da6d3=(_0x48683c=this[_0x3d90b1(0x1a5)][_0x3d90b1(0x17e)])==null?void 0x0:_0x48683c[_0x3d90b1(0x16c)])!=null&&_0x7da6d3['node'])&&!this['_inNextEdge'],this[_0x3d90b1(0x1d5)]=null,this['_connectAttemptCount']=0x0,this[_0x3d90b1(0x150)]=0x14,this['_webSocketErrorDocsLink']=_0x3d90b1(0x1c6),this[_0x3d90b1(0x139)]=(this[_0x3d90b1(0x14d)]?_0x3d90b1(0x1c4):'Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20')+this[_0x3d90b1(0x18f)];}z[_0x27f4ea(0x220)][_0x27f4ea(0x20c)]=async function(){var _0x4e9ea2=_0x27f4ea,_0x1bd897,_0x37180d;if(this[_0x4e9ea2(0x1d5)])return this[_0x4e9ea2(0x1d5)];let _0x5520cf;if(this['_inBrowser']||this[_0x4e9ea2(0x1af)])_0x5520cf=this[_0x4e9ea2(0x1a5)][_0x4e9ea2(0x168)];else{if((_0x1bd897=this['global'][_0x4e9ea2(0x17e)])!=null&&_0x1bd897[_0x4e9ea2(0x190)])_0x5520cf=(_0x37180d=this[_0x4e9ea2(0x1a5)][_0x4e9ea2(0x17e)])==null?void 0x0:_0x37180d[_0x4e9ea2(0x190)];else try{_0x5520cf=(await new Function('path',_0x4e9ea2(0x22a),'nodeModules',_0x4e9ea2(0x183))(await(0x0,eval)(_0x4e9ea2(0x188)),await(0x0,eval)(_0x4e9ea2(0x1de)),this[_0x4e9ea2(0x1e4)]))[_0x4e9ea2(0x1b1)];}catch{try{_0x5520cf=require(require('path')['join'](this['nodeModules'],'ws'));}catch{throw new Error(_0x4e9ea2(0x1d9));}}}return this[_0x4e9ea2(0x1d5)]=_0x5520cf,_0x5520cf;},z[_0x27f4ea(0x220)][_0x27f4ea(0x198)]=function(){var _0x80449b=_0x27f4ea;this[_0x80449b(0x173)]||this[_0x80449b(0x209)]||this[_0x80449b(0x133)]>=this[_0x80449b(0x150)]||(this[_0x80449b(0x1e0)]=!0x1,this[_0x80449b(0x173)]=!0x0,this[_0x80449b(0x133)]++,this[_0x80449b(0x136)]=new Promise((_0x3afb54,_0x4b1721)=>{var _0x5882d6=_0x80449b;this['getWebSocketClass']()['then'](_0xa2a631=>{var _0x427cc4=_0x5cf7;let _0x50f21b=new _0xa2a631(_0x427cc4(0x1b4)+(!this[_0x427cc4(0x14d)]&&this[_0x427cc4(0x1a1)]?_0x427cc4(0x186):this['host'])+':'+this['port']);_0x50f21b[_0x427cc4(0x1fe)]=()=>{var _0x4a2b6b=_0x427cc4;this[_0x4a2b6b(0x1b8)]=!0x1,this[_0x4a2b6b(0x17d)](_0x50f21b),this[_0x4a2b6b(0x1d1)](),_0x4b1721(new Error('logger\\x20websocket\\x20error'));},_0x50f21b[_0x427cc4(0x21c)]=()=>{var _0x765837=_0x427cc4;this[_0x765837(0x14d)]||_0x50f21b['_socket']&&_0x50f21b['_socket'][_0x765837(0x1b5)]&&_0x50f21b[_0x765837(0x214)]['unref'](),_0x3afb54(_0x50f21b);},_0x50f21b[_0x427cc4(0x202)]=()=>{var _0x1f14a0=_0x427cc4;this[_0x1f14a0(0x1e0)]=!0x0,this['_disposeWebsocket'](_0x50f21b),this['_attemptToReconnectShortly']();},_0x50f21b[_0x427cc4(0x18b)]=_0x20f72d=>{var _0x2c8687=_0x427cc4;try{if(!(_0x20f72d!=null&&_0x20f72d[_0x2c8687(0x13d)])||!this[_0x2c8687(0x1a2)])return;let _0x31e1bb=JSON['parse'](_0x20f72d[_0x2c8687(0x13d)]);this['eventReceivedCallback'](_0x31e1bb['method'],_0x31e1bb[_0x2c8687(0x1bb)],this[_0x2c8687(0x1a5)],this[_0x2c8687(0x14d)]);}catch{}};})['then'](_0x47392a=>(this[_0x5882d6(0x209)]=!0x0,this[_0x5882d6(0x173)]=!0x1,this[_0x5882d6(0x1e0)]=!0x1,this[_0x5882d6(0x1b8)]=!0x0,this['_connectAttemptCount']=0x0,_0x47392a))['catch'](_0x557458=>(this['_connected']=!0x1,this[_0x5882d6(0x173)]=!0x1,console[_0x5882d6(0x1f8)]('logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20'+this[_0x5882d6(0x18f)]),_0x4b1721(new Error(_0x5882d6(0x143)+(_0x557458&&_0x557458[_0x5882d6(0x218)])))));}));},z['prototype'][_0x27f4ea(0x17d)]=function(_0x1f0a2c){var _0x4bf2ff=_0x27f4ea;this[_0x4bf2ff(0x209)]=!0x1,this['_connecting']=!0x1;try{_0x1f0a2c[_0x4bf2ff(0x202)]=null,_0x1f0a2c[_0x4bf2ff(0x1fe)]=null,_0x1f0a2c[_0x4bf2ff(0x21c)]=null;}catch{}try{_0x1f0a2c[_0x4bf2ff(0x13b)]<0x2&&_0x1f0a2c[_0x4bf2ff(0x1c7)]();}catch{}},z['prototype'][_0x27f4ea(0x1d1)]=function(){var _0x341bb2=_0x27f4ea;clearTimeout(this['_reconnectTimeout']),!(this[_0x341bb2(0x133)]>=this['_maxConnectAttemptCount'])&&(this[_0x341bb2(0x226)]=setTimeout(()=>{var _0x43bebd=_0x341bb2,_0x5a79f4;this[_0x43bebd(0x209)]||this[_0x43bebd(0x173)]||(this[_0x43bebd(0x198)](),(_0x5a79f4=this[_0x43bebd(0x136)])==null||_0x5a79f4[_0x43bebd(0x1a9)](()=>this['_attemptToReconnectShortly']()));},0x1f4),this[_0x341bb2(0x226)]['unref']&&this[_0x341bb2(0x226)]['unref']());},z[_0x27f4ea(0x220)]['send']=async function(_0x1313ed){var _0x479ef0=_0x27f4ea;try{if(!this[_0x479ef0(0x1b8)])return;this[_0x479ef0(0x1e0)]&&this[_0x479ef0(0x198)](),(await this[_0x479ef0(0x136)])[_0x479ef0(0x1ac)](JSON[_0x479ef0(0x1fa)](_0x1313ed));}catch(_0x11a87c){this[_0x479ef0(0x1c2)]?console[_0x479ef0(0x1f8)](this['_sendErrorMessage']+':\\x20'+(_0x11a87c&&_0x11a87c['message'])):(this[_0x479ef0(0x1c2)]=!0x0,console['warn'](this[_0x479ef0(0x139)]+':\\x20'+(_0x11a87c&&_0x11a87c['message']),_0x1313ed)),this[_0x479ef0(0x1b8)]=!0x1,this['_attemptToReconnectShortly']();}};function H(_0x43f896,_0x3f2f5a,_0x564161,_0x3241a8,_0x188d9c,_0x4c2c16,_0x44730f,_0x647db1=ne){var _0x3bb3cc=_0x27f4ea;let _0x1007b5=_0x564161[_0x3bb3cc(0x213)](',')[_0x3bb3cc(0x20a)](_0xc6ed03=>{var _0x401a03=_0x3bb3cc,_0x3c5a4a,_0x19fd6e,_0x46c009,_0x48f9f6,_0x4f2fb0,_0x3aa464,_0x5e5b35,_0x28c6b8;try{if(!_0x43f896[_0x401a03(0x16b)]){let _0x12ab8a=((_0x19fd6e=(_0x3c5a4a=_0x43f896[_0x401a03(0x17e)])==null?void 0x0:_0x3c5a4a[_0x401a03(0x16c)])==null?void 0x0:_0x19fd6e['node'])||((_0x48f9f6=(_0x46c009=_0x43f896['process'])==null?void 0x0:_0x46c009['env'])==null?void 0x0:_0x48f9f6[_0x401a03(0x1ba)])===_0x401a03(0x1ed);(_0x188d9c===_0x401a03(0x177)||_0x188d9c===_0x401a03(0x192)||_0x188d9c===_0x401a03(0x212)||_0x188d9c===_0x401a03(0x142))&&(_0x188d9c+=_0x12ab8a?_0x401a03(0x1b0):_0x401a03(0x187));let _0x1e2f73='';_0x188d9c==='react-native'&&(_0x1e2f73=(((_0x5e5b35=(_0x3aa464=(_0x4f2fb0=_0x43f896[_0x401a03(0x21d)])==null?void 0x0:_0x4f2fb0[_0x401a03(0x178)])==null?void 0x0:_0x3aa464['ExpoDevice'])==null?void 0x0:_0x5e5b35[_0x401a03(0x131)])||'emulator')['toLowerCase'](),_0x1e2f73&&(_0x188d9c+='\\x20'+_0x1e2f73,(_0x1e2f73===_0x401a03(0x1a6)||_0x1e2f73==='emulator'&&((_0x28c6b8=_0x43f896[_0x401a03(0x1a8)])==null?void 0x0:_0x28c6b8[_0x401a03(0x176)])===_0x401a03(0x216))&&(_0x3f2f5a=_0x401a03(0x216)))),_0x43f896[_0x401a03(0x16b)]={'id':+new Date(),'tool':_0x188d9c},_0x44730f&&_0x188d9c&&!_0x12ab8a&&(_0x1e2f73?console[_0x401a03(0x169)](_0x401a03(0x1f5)+_0x1e2f73+_0x401a03(0x1eb)):console[_0x401a03(0x169)](_0x401a03(0x208)+(_0x188d9c[_0x401a03(0x181)](0x0)[_0x401a03(0x1ef)]()+_0x188d9c[_0x401a03(0x197)](0x1))+',','background:\\x20rgb(30,30,30);\\x20color:\\x20rgb(255,213,92)',_0x401a03(0x1d3)));}let _0xb4d9e8=new z(_0x43f896,_0x3f2f5a,_0xc6ed03,_0x3241a8,_0x4c2c16,_0x647db1);return _0xb4d9e8[_0x401a03(0x1ac)][_0x401a03(0x19d)](_0xb4d9e8);}catch(_0x442a97){return console[_0x401a03(0x1f8)](_0x401a03(0x132),_0x442a97&&_0x442a97[_0x401a03(0x218)]),()=>{};}});return _0xd71c01=>_0x1007b5[_0x3bb3cc(0x217)](_0x107bc8=>_0x107bc8(_0xd71c01));}function _0x5cf7(_0x4902ba,_0x15b27a){var _0x36d92a=_0x36d9();return _0x5cf7=function(_0x5cf752,_0xb98aab){_0x5cf752=_0x5cf752-0x12c;var _0xc44896=_0x36d92a[_0x5cf752];return _0xc44896;},_0x5cf7(_0x4902ba,_0x15b27a);}function ne(_0x555c7e,_0x5dc757,_0x561da1,_0x9c004d){var _0x1a4a8b=_0x27f4ea;_0x9c004d&&_0x555c7e===_0x1a4a8b(0x1ad)&&_0x561da1[_0x1a4a8b(0x1a8)]['reload']();}function b(_0xfaeee1){var _0x56d18c=_0x27f4ea,_0x188689,_0x5b92be;let _0x239e1b=function(_0x3eb629,_0x35dec7){return _0x35dec7-_0x3eb629;},_0x4baa4c;if(_0xfaeee1[_0x56d18c(0x189)])_0x4baa4c=function(){var _0x208582=_0x56d18c;return _0xfaeee1['performance'][_0x208582(0x1f6)]();};else{if(_0xfaeee1[_0x56d18c(0x17e)]&&_0xfaeee1[_0x56d18c(0x17e)][_0x56d18c(0x1f7)]&&((_0x5b92be=(_0x188689=_0xfaeee1['process'])==null?void 0x0:_0x188689[_0x56d18c(0x231)])==null?void 0x0:_0x5b92be['NEXT_RUNTIME'])!=='edge')_0x4baa4c=function(){var _0x408a1c=_0x56d18c;return _0xfaeee1[_0x408a1c(0x17e)][_0x408a1c(0x1f7)]();},_0x239e1b=function(_0x10287d,_0x486a40){return 0x3e8*(_0x486a40[0x0]-_0x10287d[0x0])+(_0x486a40[0x1]-_0x10287d[0x1])/0xf4240;};else try{let {performance:_0x173e16}=require(_0x56d18c(0x1cc));_0x4baa4c=function(){var _0x2af0e6=_0x56d18c;return _0x173e16[_0x2af0e6(0x1f6)]();};}catch{_0x4baa4c=function(){return+new Date();};}}return{'elapsed':_0x239e1b,'timeStamp':_0x4baa4c,'now':()=>Date[_0x56d18c(0x1f6)]()};}function X(_0x5acfc3,_0x43f290,_0x403f1a){var _0xc745c8=_0x27f4ea,_0xdb41c8,_0x409db3,_0x56987f,_0x522b44,_0x101e79,_0x272ca2,_0x16bceb;if(_0x5acfc3['_consoleNinjaAllowedToStart']!==void 0x0)return _0x5acfc3[_0xc745c8(0x199)];let _0x525d88=((_0x409db3=(_0xdb41c8=_0x5acfc3['process'])==null?void 0x0:_0xdb41c8[_0xc745c8(0x16c)])==null?void 0x0:_0x409db3[_0xc745c8(0x167)])||((_0x522b44=(_0x56987f=_0x5acfc3[_0xc745c8(0x17e)])==null?void 0x0:_0x56987f['env'])==null?void 0x0:_0x522b44[_0xc745c8(0x1ba)])===_0xc745c8(0x1ed),_0x288ae3=!!(_0x403f1a===_0xc745c8(0x161)&&((_0x101e79=_0x5acfc3['expo'])==null?void 0x0:_0x101e79[_0xc745c8(0x178)]));function _0x5badf3(_0x4edc3a){var _0x169944=_0xc745c8;if(_0x4edc3a[_0x169944(0x175)]('/')&&_0x4edc3a[_0x169944(0x149)]('/')){let _0x55c867=new RegExp(_0x4edc3a['slice'](0x1,-0x1));return _0x48fd8b=>_0x55c867['test'](_0x48fd8b);}else{if(_0x4edc3a['includes']('*')||_0x4edc3a[_0x169944(0x1ab)]('?')){let _0x42f4be=new RegExp('^'+_0x4edc3a[_0x169944(0x13a)](/\\./g,String[_0x169944(0x1cb)](0x5c)+'.')[_0x169944(0x13a)](/\\*/g,'.*')[_0x169944(0x13a)](/\\?/g,'.')+String[_0x169944(0x1cb)](0x24));return _0x169184=>_0x42f4be['test'](_0x169184);}else return _0xbfa32d=>_0xbfa32d===_0x4edc3a;}}let _0x1b436a=_0x43f290[_0xc745c8(0x20a)](_0x5badf3);return _0x5acfc3[_0xc745c8(0x199)]=_0x525d88||!_0x43f290,!_0x5acfc3[_0xc745c8(0x199)]&&((_0x272ca2=_0x5acfc3['location'])==null?void 0x0:_0x272ca2[_0xc745c8(0x176)])&&(_0x5acfc3[_0xc745c8(0x199)]=_0x1b436a[_0xc745c8(0x16a)](_0x2f1a62=>_0x2f1a62(_0x5acfc3[_0xc745c8(0x1a8)][_0xc745c8(0x176)]))),_0x288ae3&&!_0x5acfc3[_0xc745c8(0x199)]&&!((_0x16bceb=_0x5acfc3['location'])!=null&&_0x16bceb['hostname'])&&(_0x5acfc3[_0xc745c8(0x199)]=!0x0),_0x5acfc3[_0xc745c8(0x199)];}function J(_0x1b84cf,_0x22cb75,_0x10c330,_0x425029,_0x513131,_0x475afa){var _0x214696=_0x27f4ea;_0x1b84cf=_0x1b84cf,_0x22cb75=_0x22cb75,_0x10c330=_0x10c330,_0x425029=_0x425029,_0x513131=_0x513131,_0x513131=_0x513131||{},_0x513131[_0x214696(0x1b3)]=_0x513131[_0x214696(0x1b3)]||{},_0x513131[_0x214696(0x230)]=_0x513131[_0x214696(0x230)]||{},_0x513131['reducePolicy']=_0x513131[_0x214696(0x13f)]||{},_0x513131['reducePolicy'][_0x214696(0x1d0)]=_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)]||{},_0x513131[_0x214696(0x13f)]['global']=_0x513131[_0x214696(0x13f)]['global']||{};let _0x5f34e7={'perLogpoint':{'reduceOnCount':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x1ce)]||0x32,'reduceOnAccumulatedProcessingTimeMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x1aa)]||0x64,'resetWhenQuietMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x14b)]||0x1f4,'resetOnProcessingTimeAverageMs':_0x513131['reducePolicy'][_0x214696(0x1d0)][_0x214696(0x134)]||0x64},'global':{'reduceOnCount':_0x513131['reducePolicy'][_0x214696(0x1a5)][_0x214696(0x1ce)]||0x3e8,'reduceOnAccumulatedProcessingTimeMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1a5)][_0x214696(0x1aa)]||0x12c,'resetWhenQuietMs':_0x513131['reducePolicy']['global'][_0x214696(0x14b)]||0x32,'resetOnProcessingTimeAverageMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1a5)][_0x214696(0x134)]||0x64}},_0x1d7dff=b(_0x1b84cf),_0x48727a=_0x1d7dff['elapsed'],_0x5593f0=_0x1d7dff[_0x214696(0x171)];function _0x34ed1d(){var _0x1a49de=_0x214696;this[_0x1a49de(0x1b9)]=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this[_0x1a49de(0x1cf)]=/^(0|[1-9][0-9]*)$/,this[_0x1a49de(0x19c)]=/'([^\\\\']|\\\\')*'/,this[_0x1a49de(0x201)]=_0x1b84cf[_0x1a49de(0x224)],this[_0x1a49de(0x162)]=_0x1b84cf['HTMLAllCollection'],this['_getOwnPropertyDescriptor']=Object[_0x1a49de(0x18d)],this[_0x1a49de(0x1f2)]=Object[_0x1a49de(0x21a)],this['_Symbol']=_0x1b84cf[_0x1a49de(0x157)],this['_regExpToString']=RegExp[_0x1a49de(0x220)]['toString'],this[_0x1a49de(0x221)]=Date[_0x1a49de(0x220)][_0x1a49de(0x19a)];}_0x34ed1d[_0x214696(0x220)][_0x214696(0x17a)]=function(_0x4ed169,_0x7dca5e,_0x1ea1e7,_0x4ca839){var _0x5819cb=_0x214696,_0x2fffed=this,_0xd92b7e=_0x1ea1e7['autoExpand'];function _0x5f2c45(_0x5e761f,_0x4e1bc2,_0x2961a8){var _0x1114dc=_0x5cf7;_0x4e1bc2[_0x1114dc(0x203)]='unknown',_0x4e1bc2[_0x1114dc(0x1fb)]=_0x5e761f['message'],_0x552ab6=_0x2961a8[_0x1114dc(0x167)][_0x1114dc(0x146)],_0x2961a8[_0x1114dc(0x167)]['current']=_0x4e1bc2,_0x2fffed[_0x1114dc(0x1e7)](_0x4e1bc2,_0x2961a8);}let _0x238fcb,_0x5ae890,_0x16e6f7=_0x1b84cf[_0x5819cb(0x206)];_0x1b84cf[_0x5819cb(0x206)]=!0x0,_0x1b84cf[_0x5819cb(0x1cd)]&&(_0x238fcb=_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)],_0x5ae890=_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1f8)],_0x238fcb&&(_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)]=function(){}),_0x5ae890&&(_0x1b84cf['console'][_0x5819cb(0x1f8)]=function(){}));try{try{_0x1ea1e7['level']++,_0x1ea1e7[_0x5819cb(0x163)]&&_0x1ea1e7[_0x5819cb(0x1a4)][_0x5819cb(0x16e)](_0x7dca5e);var _0x16cf4c,_0x36291a,_0x424803,_0x54ac07,_0xd48a44=[],_0x4c8309=[],_0x1661dc,_0x24a5e8=this[_0x5819cb(0x147)](_0x7dca5e),_0x2d0e3c=_0x24a5e8===_0x5819cb(0x1b2),_0x5193fe=!0x1,_0x23c775=_0x24a5e8===_0x5819cb(0x140),_0x6e364c=this[_0x5819cb(0x229)](_0x24a5e8),_0x527786=this['_isPrimitiveWrapperType'](_0x24a5e8),_0x236245=_0x6e364c||_0x527786,_0x2e2de3={},_0x2236a3=0x0,_0x18b840=!0x1,_0x552ab6,_0x5056dd=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x1ea1e7[_0x5819cb(0x21e)]){if(_0x2d0e3c){if(_0x36291a=_0x7dca5e[_0x5819cb(0x153)],_0x36291a>_0x1ea1e7[_0x5819cb(0x145)]){for(_0x424803=0x0,_0x54ac07=_0x1ea1e7[_0x5819cb(0x145)],_0x16cf4c=_0x424803;_0x16cf4c<_0x54ac07;_0x16cf4c++)_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x1f4)](_0xd48a44,_0x7dca5e,_0x24a5e8,_0x16cf4c,_0x1ea1e7));_0x4ed169[_0x5819cb(0x20f)]=!0x0;}else{for(_0x424803=0x0,_0x54ac07=_0x36291a,_0x16cf4c=_0x424803;_0x16cf4c<_0x54ac07;_0x16cf4c++)_0x4c8309['push'](_0x2fffed[_0x5819cb(0x1f4)](_0xd48a44,_0x7dca5e,_0x24a5e8,_0x16cf4c,_0x1ea1e7));}_0x1ea1e7[_0x5819cb(0x148)]+=_0x4c8309[_0x5819cb(0x153)];}if(!(_0x24a5e8===_0x5819cb(0x1f3)||_0x24a5e8===_0x5819cb(0x224))&&!_0x6e364c&&_0x24a5e8!==_0x5819cb(0x12e)&&_0x24a5e8!==_0x5819cb(0x1c9)&&_0x24a5e8!==_0x5819cb(0x22f)){var _0x260439=_0x4ca839[_0x5819cb(0x210)]||_0x1ea1e7[_0x5819cb(0x210)];if(this['_isSet'](_0x7dca5e)?(_0x16cf4c=0x0,_0x7dca5e['forEach'](function(_0x3545fe){var _0x4f7e9a=_0x5819cb;if(_0x2236a3++,_0x1ea1e7[_0x4f7e9a(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;return;}if(!_0x1ea1e7[_0x4f7e9a(0x14a)]&&_0x1ea1e7[_0x4f7e9a(0x163)]&&_0x1ea1e7[_0x4f7e9a(0x148)]>_0x1ea1e7[_0x4f7e9a(0x1d4)]){_0x18b840=!0x0;return;}_0x4c8309[_0x4f7e9a(0x16e)](_0x2fffed[_0x4f7e9a(0x1f4)](_0xd48a44,_0x7dca5e,'Set',_0x16cf4c++,_0x1ea1e7,function(_0x28ca76){return function(){return _0x28ca76;};}(_0x3545fe)));})):this[_0x5819cb(0x14c)](_0x7dca5e)&&_0x7dca5e[_0x5819cb(0x217)](function(_0x430279,_0xddf0da){var _0x3b56da=_0x5819cb;if(_0x2236a3++,_0x1ea1e7[_0x3b56da(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;return;}if(!_0x1ea1e7['isExpressionToEvaluate']&&_0x1ea1e7[_0x3b56da(0x163)]&&_0x1ea1e7[_0x3b56da(0x148)]>_0x1ea1e7[_0x3b56da(0x1d4)]){_0x18b840=!0x0;return;}var _0x352a13=_0xddf0da[_0x3b56da(0x19a)]();_0x352a13[_0x3b56da(0x153)]>0x64&&(_0x352a13=_0x352a13['slice'](0x0,0x64)+'...'),_0x4c8309[_0x3b56da(0x16e)](_0x2fffed[_0x3b56da(0x1f4)](_0xd48a44,_0x7dca5e,'Map',_0x352a13,_0x1ea1e7,function(_0x1916ea){return function(){return _0x1916ea;};}(_0x430279)));}),!_0x5193fe){try{for(_0x1661dc in _0x7dca5e)if(!(_0x2d0e3c&&_0x5056dd[_0x5819cb(0x1b6)](_0x1661dc))&&!this[_0x5819cb(0x14e)](_0x7dca5e,_0x1661dc,_0x1ea1e7)){if(_0x2236a3++,_0x1ea1e7[_0x5819cb(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;break;}if(!_0x1ea1e7[_0x5819cb(0x14a)]&&_0x1ea1e7[_0x5819cb(0x163)]&&_0x1ea1e7[_0x5819cb(0x148)]>_0x1ea1e7[_0x5819cb(0x1d4)]){_0x18b840=!0x0;break;}_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x172)](_0xd48a44,_0x2e2de3,_0x7dca5e,_0x24a5e8,_0x1661dc,_0x1ea1e7));}}catch{}if(_0x2e2de3['_p_length']=!0x0,_0x23c775&&(_0x2e2de3[_0x5819cb(0x22d)]=!0x0),!_0x18b840){var _0x57a7fe=[][_0x5819cb(0x17f)](this[_0x5819cb(0x1f2)](_0x7dca5e))[_0x5819cb(0x17f)](this['_getOwnPropertySymbols'](_0x7dca5e));for(_0x16cf4c=0x0,_0x36291a=_0x57a7fe[_0x5819cb(0x153)];_0x16cf4c<_0x36291a;_0x16cf4c++)if(_0x1661dc=_0x57a7fe[_0x16cf4c],!(_0x2d0e3c&&_0x5056dd['test'](_0x1661dc[_0x5819cb(0x19a)]()))&&!this['_blacklistedProperty'](_0x7dca5e,_0x1661dc,_0x1ea1e7)&&!_0x2e2de3[typeof _0x1661dc!='symbol'?_0x5819cb(0x137)+_0x1661dc[_0x5819cb(0x19a)]():_0x1661dc]){if(_0x2236a3++,_0x1ea1e7['autoExpandPropertyCount']++,_0x2236a3>_0x260439){_0x18b840=!0x0;break;}if(!_0x1ea1e7['isExpressionToEvaluate']&&_0x1ea1e7['autoExpand']&&_0x1ea1e7[_0x5819cb(0x148)]>_0x1ea1e7[_0x5819cb(0x1d4)]){_0x18b840=!0x0;break;}_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x172)](_0xd48a44,_0x2e2de3,_0x7dca5e,_0x24a5e8,_0x1661dc,_0x1ea1e7));}}}}}if(_0x4ed169['type']=_0x24a5e8,_0x236245?(_0x4ed169[_0x5819cb(0x1e8)]=_0x7dca5e[_0x5819cb(0x1c5)](),this[_0x5819cb(0x1ca)](_0x24a5e8,_0x4ed169,_0x1ea1e7,_0x4ca839)):_0x24a5e8===_0x5819cb(0x1f0)?_0x4ed169['value']=this[_0x5819cb(0x221)][_0x5819cb(0x16f)](_0x7dca5e):_0x24a5e8===_0x5819cb(0x22f)?_0x4ed169[_0x5819cb(0x1e8)]=_0x7dca5e[_0x5819cb(0x19a)]():_0x24a5e8===_0x5819cb(0x15a)?_0x4ed169['value']=this[_0x5819cb(0x1e6)][_0x5819cb(0x16f)](_0x7dca5e):_0x24a5e8===_0x5819cb(0x1ec)&&this[_0x5819cb(0x20d)]?_0x4ed169[_0x5819cb(0x1e8)]=this['_Symbol'][_0x5819cb(0x220)][_0x5819cb(0x19a)][_0x5819cb(0x16f)](_0x7dca5e):!_0x1ea1e7['depth']&&!(_0x24a5e8==='null'||_0x24a5e8===_0x5819cb(0x224))&&(delete _0x4ed169[_0x5819cb(0x1e8)],_0x4ed169[_0x5819cb(0x182)]=!0x0),_0x18b840&&(_0x4ed169[_0x5819cb(0x195)]=!0x0),_0x552ab6=_0x1ea1e7[_0x5819cb(0x167)][_0x5819cb(0x146)],_0x1ea1e7['node'][_0x5819cb(0x146)]=_0x4ed169,this['_treeNodePropertiesBeforeFullValue'](_0x4ed169,_0x1ea1e7),_0x4c8309['length']){for(_0x16cf4c=0x0,_0x36291a=_0x4c8309[_0x5819cb(0x153)];_0x16cf4c<_0x36291a;_0x16cf4c++)_0x4c8309[_0x16cf4c](_0x16cf4c);}_0xd48a44[_0x5819cb(0x153)]&&(_0x4ed169['props']=_0xd48a44);}catch(_0xeed0f8){_0x5f2c45(_0xeed0f8,_0x4ed169,_0x1ea1e7);}this[_0x5819cb(0x141)](_0x7dca5e,_0x4ed169),this['_treeNodePropertiesAfterFullValue'](_0x4ed169,_0x1ea1e7),_0x1ea1e7[_0x5819cb(0x167)]['current']=_0x552ab6,_0x1ea1e7[_0x5819cb(0x207)]--,_0x1ea1e7[_0x5819cb(0x163)]=_0xd92b7e,_0x1ea1e7['autoExpand']&&_0x1ea1e7['autoExpandPreviousObjects'][_0x5819cb(0x1ff)]();}finally{_0x238fcb&&(_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)]=_0x238fcb),_0x5ae890&&(_0x1b84cf['console'][_0x5819cb(0x1f8)]=_0x5ae890),_0x1b84cf[_0x5819cb(0x206)]=_0x16e6f7;}return _0x4ed169;},_0x34ed1d[_0x214696(0x220)]['_getOwnPropertySymbols']=function(_0x4596fa){var _0x5925e1=_0x214696;return Object[_0x5925e1(0x196)]?Object['getOwnPropertySymbols'](_0x4596fa):[];},_0x34ed1d[_0x214696(0x220)][_0x214696(0x204)]=function(_0x92d40f){var _0x1ac919=_0x214696;return!!(_0x92d40f&&_0x1b84cf['Set']&&this[_0x1ac919(0x22e)](_0x92d40f)===_0x1ac919(0x12d)&&_0x92d40f[_0x1ac919(0x217)]);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x14e)]=function(_0x763159,_0x18e9ad,_0xd5905d){var _0x27605f=_0x214696;if(!_0xd5905d[_0x27605f(0x194)]){let _0x5a0af9=this[_0x27605f(0x138)](_0x763159,_0x18e9ad);if(_0x5a0af9&&_0x5a0af9['get'])return!0x0;}return _0xd5905d['noFunctions']?typeof _0x763159[_0x18e9ad]==_0x27605f(0x140):!0x1;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x147)]=function(_0x5f197d){var _0x3b9da1=_0x214696,_0x254abb='';return _0x254abb=typeof _0x5f197d,_0x254abb===_0x3b9da1(0x164)?this['_objectToString'](_0x5f197d)===_0x3b9da1(0x227)?_0x254abb=_0x3b9da1(0x1b2):this['_objectToString'](_0x5f197d)===_0x3b9da1(0x15c)?_0x254abb=_0x3b9da1(0x1f0):this[_0x3b9da1(0x22e)](_0x5f197d)===_0x3b9da1(0x21b)?_0x254abb=_0x3b9da1(0x22f):_0x5f197d===null?_0x254abb=_0x3b9da1(0x1f3):_0x5f197d['constructor']&&(_0x254abb=_0x5f197d[_0x3b9da1(0x12c)][_0x3b9da1(0x185)]||_0x254abb):_0x254abb===_0x3b9da1(0x224)&&this[_0x3b9da1(0x162)]&&_0x5f197d instanceof this[_0x3b9da1(0x162)]&&(_0x254abb=_0x3b9da1(0x1a7)),_0x254abb;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x22e)]=function(_0x4b3483){var _0x59323a=_0x214696;return Object['prototype'][_0x59323a(0x19a)][_0x59323a(0x16f)](_0x4b3483);},_0x34ed1d['prototype'][_0x214696(0x229)]=function(_0x3f12cc){var _0x14181c=_0x214696;return _0x3f12cc==='boolean'||_0x3f12cc==='string'||_0x3f12cc===_0x14181c(0x1ee);},_0x34ed1d['prototype'][_0x214696(0x1fd)]=function(_0x24d083){var _0x824253=_0x214696;return _0x24d083===_0x824253(0x19e)||_0x24d083===_0x824253(0x12e)||_0x24d083===_0x824253(0x1bf);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1f4)]=function(_0x52c9ee,_0x3dbfa6,_0x54d057,_0x695d62,_0x1e5016,_0x5936ab){var _0x3e21d7=this;return function(_0x59ef4f){var _0x27ad85=_0x5cf7,_0x20a41f=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x146)],_0x40b5f5=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x15e)],_0x4b6f6b=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x135)];_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x135)]=_0x20a41f,_0x1e5016['node'][_0x27ad85(0x15e)]=typeof _0x695d62==_0x27ad85(0x1ee)?_0x695d62:_0x59ef4f,_0x52c9ee[_0x27ad85(0x16e)](_0x3e21d7['_property'](_0x3dbfa6,_0x54d057,_0x695d62,_0x1e5016,_0x5936ab)),_0x1e5016[_0x27ad85(0x167)]['parent']=_0x4b6f6b,_0x1e5016[_0x27ad85(0x167)]['index']=_0x40b5f5;};},_0x34ed1d[_0x214696(0x220)][_0x214696(0x172)]=function(_0xff3dff,_0x328e71,_0x95c09a,_0x4ef89f,_0x5bbcff,_0xedb075,_0x2f75dd){var _0x33a8a3=_0x214696,_0x5283e9=this;return _0x328e71[typeof _0x5bbcff!=_0x33a8a3(0x1ec)?_0x33a8a3(0x137)+_0x5bbcff[_0x33a8a3(0x19a)]():_0x5bbcff]=!0x0,function(_0x811f2b){var _0x1ebac6=_0x33a8a3,_0x5659b7=_0xedb075['node'][_0x1ebac6(0x146)],_0x5b64e5=_0xedb075['node'][_0x1ebac6(0x15e)],_0x4ebd6c=_0xedb075['node'][_0x1ebac6(0x135)];_0xedb075[_0x1ebac6(0x167)]['parent']=_0x5659b7,_0xedb075[_0x1ebac6(0x167)][_0x1ebac6(0x15e)]=_0x811f2b,_0xff3dff[_0x1ebac6(0x16e)](_0x5283e9['_property'](_0x95c09a,_0x4ef89f,_0x5bbcff,_0xedb075,_0x2f75dd)),_0xedb075[_0x1ebac6(0x167)]['parent']=_0x4ebd6c,_0xedb075[_0x1ebac6(0x167)][_0x1ebac6(0x15e)]=_0x5b64e5;};},_0x34ed1d[_0x214696(0x220)]['_property']=function(_0x18b315,_0x3918ec,_0x5dfa18,_0x5319c6,_0x2d8fa5){var _0x53ed2c=_0x214696,_0x379c68=this;_0x2d8fa5||(_0x2d8fa5=function(_0x3ca008,_0x4b4854){return _0x3ca008[_0x4b4854];});var _0x3d7ff1=_0x5dfa18[_0x53ed2c(0x19a)](),_0x30d254=_0x5319c6['expressionsToEvaluate']||{},_0x155442=_0x5319c6[_0x53ed2c(0x21e)],_0x554fd1=_0x5319c6[_0x53ed2c(0x14a)];try{var _0x3237a0=this[_0x53ed2c(0x14c)](_0x18b315),_0x4e6244=_0x3d7ff1;_0x3237a0&&_0x4e6244[0x0]==='\\x27'&&(_0x4e6244=_0x4e6244[_0x53ed2c(0x197)](0x1,_0x4e6244[_0x53ed2c(0x153)]-0x2));var _0x30807e=_0x5319c6[_0x53ed2c(0x17c)]=_0x30d254[_0x53ed2c(0x137)+_0x4e6244];_0x30807e&&(_0x5319c6[_0x53ed2c(0x21e)]=_0x5319c6[_0x53ed2c(0x21e)]+0x1),_0x5319c6[_0x53ed2c(0x14a)]=!!_0x30807e;var _0x5e0092=typeof _0x5dfa18==_0x53ed2c(0x1ec),_0x4ca784={'name':_0x5e0092||_0x3237a0?_0x3d7ff1:this[_0x53ed2c(0x228)](_0x3d7ff1)};if(_0x5e0092&&(_0x4ca784['symbol']=!0x0),!(_0x3918ec===_0x53ed2c(0x1b2)||_0x3918ec==='Error')){var _0x509ba0=this['_getOwnPropertyDescriptor'](_0x18b315,_0x5dfa18);if(_0x509ba0&&(_0x509ba0['set']&&(_0x4ca784[_0x53ed2c(0x223)]=!0x0),_0x509ba0[_0x53ed2c(0x13c)]&&!_0x30807e&&!_0x5319c6[_0x53ed2c(0x194)]))return _0x4ca784['getter']=!0x0,this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6),_0x4ca784;}var _0x14805b;try{_0x14805b=_0x2d8fa5(_0x18b315,_0x5dfa18);}catch(_0x485eec){return _0x4ca784={'name':_0x3d7ff1,'type':_0x53ed2c(0x170),'error':_0x485eec[_0x53ed2c(0x218)]},this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6),_0x4ca784;}var _0x2cab07=this[_0x53ed2c(0x147)](_0x14805b),_0x5f522f=this[_0x53ed2c(0x229)](_0x2cab07);if(_0x4ca784[_0x53ed2c(0x203)]=_0x2cab07,_0x5f522f)this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6,_0x14805b,function(){var _0x2cdcf4=_0x53ed2c;_0x4ca784[_0x2cdcf4(0x1e8)]=_0x14805b['valueOf'](),!_0x30807e&&_0x379c68['_capIfString'](_0x2cab07,_0x4ca784,_0x5319c6,{});});else{var _0x18c4f5=_0x5319c6[_0x53ed2c(0x163)]&&_0x5319c6[_0x53ed2c(0x207)]<_0x5319c6[_0x53ed2c(0x225)]&&_0x5319c6[_0x53ed2c(0x1a4)]['indexOf'](_0x14805b)<0x0&&_0x2cab07!==_0x53ed2c(0x140)&&_0x5319c6[_0x53ed2c(0x148)]<_0x5319c6[_0x53ed2c(0x1d4)];_0x18c4f5||_0x5319c6[_0x53ed2c(0x207)]<_0x155442||_0x30807e?this[_0x53ed2c(0x17a)](_0x4ca784,_0x14805b,_0x5319c6,_0x30807e||{}):this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6,_0x14805b,function(){var _0x9606df=_0x53ed2c;_0x2cab07==='null'||_0x2cab07===_0x9606df(0x224)||(delete _0x4ca784[_0x9606df(0x1e8)],_0x4ca784[_0x9606df(0x182)]=!0x0);});}return _0x4ca784;}finally{_0x5319c6[_0x53ed2c(0x17c)]=_0x30d254,_0x5319c6['depth']=_0x155442,_0x5319c6[_0x53ed2c(0x14a)]=_0x554fd1;}},_0x34ed1d['prototype'][_0x214696(0x1ca)]=function(_0x26ccea,_0x6e0d21,_0x5a73cf,_0x21a5ae){var _0x38dead=_0x214696,_0x3514b6=_0x21a5ae['strLength']||_0x5a73cf[_0x38dead(0x1a0)];if((_0x26ccea===_0x38dead(0x19f)||_0x26ccea===_0x38dead(0x12e))&&_0x6e0d21['value']){let _0x4b9a3f=_0x6e0d21[_0x38dead(0x1e8)][_0x38dead(0x153)];_0x5a73cf[_0x38dead(0x191)]+=_0x4b9a3f,_0x5a73cf['allStrLength']>_0x5a73cf[_0x38dead(0x13e)]?(_0x6e0d21[_0x38dead(0x182)]='',delete _0x6e0d21[_0x38dead(0x1e8)]):_0x4b9a3f>_0x3514b6&&(_0x6e0d21[_0x38dead(0x182)]=_0x6e0d21[_0x38dead(0x1e8)][_0x38dead(0x197)](0x0,_0x3514b6),delete _0x6e0d21['value']);}},_0x34ed1d[_0x214696(0x220)][_0x214696(0x14c)]=function(_0x4c3992){var _0x2533b1=_0x214696;return!!(_0x4c3992&&_0x1b84cf[_0x2533b1(0x144)]&&this['_objectToString'](_0x4c3992)===_0x2533b1(0x1d8)&&_0x4c3992[_0x2533b1(0x217)]);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x228)]=function(_0x3eeb2c){var _0x20c0cd=_0x214696;if(_0x3eeb2c[_0x20c0cd(0x22b)](/^\\d+$/))return _0x3eeb2c;var _0x387e31;try{_0x387e31=JSON['stringify'](''+_0x3eeb2c);}catch{_0x387e31='\\x22'+this['_objectToString'](_0x3eeb2c)+'\\x22';}return _0x387e31[_0x20c0cd(0x22b)](/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)?_0x387e31=_0x387e31['substr'](0x1,_0x387e31[_0x20c0cd(0x153)]-0x2):_0x387e31=_0x387e31['replace'](/'/g,'\\x5c\\x27')[_0x20c0cd(0x13a)](/\\\\\"/g,'\\x22')[_0x20c0cd(0x13a)](/(^\"|\"$)/g,'\\x27'),_0x387e31;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x19b)]=function(_0x30b649,_0x4ffe49,_0x5f6329,_0x38e972){var _0x4d8b4d=_0x214696;this['_treeNodePropertiesBeforeFullValue'](_0x30b649,_0x4ffe49),_0x38e972&&_0x38e972(),this[_0x4d8b4d(0x141)](_0x5f6329,_0x30b649),this[_0x4d8b4d(0x1e9)](_0x30b649,_0x4ffe49);},_0x34ed1d[_0x214696(0x220)]['_treeNodePropertiesBeforeFullValue']=function(_0x5576c4,_0x3ebbfb){var _0x4c4b0a=_0x214696;this[_0x4c4b0a(0x1dd)](_0x5576c4,_0x3ebbfb),this['_setNodeQueryPath'](_0x5576c4,_0x3ebbfb),this['_setNodeExpressionPath'](_0x5576c4,_0x3ebbfb),this['_setNodePermissions'](_0x5576c4,_0x3ebbfb);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1dd)]=function(_0x20825e,_0x33577b){},_0x34ed1d['prototype'][_0x214696(0x22c)]=function(_0x25683b,_0x4784b5){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x154)]=function(_0x33bded,_0x1ca65a){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1ea)]=function(_0x5224eb){var _0x1075ea=_0x214696;return _0x5224eb===this[_0x1075ea(0x201)];},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1e9)]=function(_0x3bf243,_0x46d534){var _0x3c71e5=_0x214696;this[_0x3c71e5(0x154)](_0x3bf243,_0x46d534),this['_setNodeExpandableState'](_0x3bf243),_0x46d534[_0x3c71e5(0x1a3)]&&this['_sortProps'](_0x3bf243),this[_0x3c71e5(0x18a)](_0x3bf243,_0x46d534),this[_0x3c71e5(0x1e2)](_0x3bf243,_0x46d534),this[_0x3c71e5(0x1df)](_0x3bf243);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x141)]=function(_0x49892b,_0x2c9fcb){var _0x367b88=_0x214696;try{_0x49892b&&typeof _0x49892b['length']==_0x367b88(0x1ee)&&(_0x2c9fcb[_0x367b88(0x153)]=_0x49892b[_0x367b88(0x153)]);}catch{}if(_0x2c9fcb[_0x367b88(0x203)]==='number'||_0x2c9fcb['type']===_0x367b88(0x1bf)){if(isNaN(_0x2c9fcb[_0x367b88(0x1e8)]))_0x2c9fcb['nan']=!0x0,delete _0x2c9fcb[_0x367b88(0x1e8)];else switch(_0x2c9fcb[_0x367b88(0x1e8)]){case Number[_0x367b88(0x174)]:_0x2c9fcb[_0x367b88(0x17b)]=!0x0,delete _0x2c9fcb[_0x367b88(0x1e8)];break;case Number[_0x367b88(0x1c1)]:_0x2c9fcb[_0x367b88(0x211)]=!0x0,delete _0x2c9fcb['value'];break;case 0x0:this[_0x367b88(0x20b)](_0x2c9fcb[_0x367b88(0x1e8)])&&(_0x2c9fcb[_0x367b88(0x156)]=!0x0);break;}}else _0x2c9fcb[_0x367b88(0x203)]===_0x367b88(0x140)&&typeof _0x49892b['name']==_0x367b88(0x19f)&&_0x49892b[_0x367b88(0x185)]&&_0x2c9fcb[_0x367b88(0x185)]&&_0x49892b[_0x367b88(0x185)]!==_0x2c9fcb[_0x367b88(0x185)]&&(_0x2c9fcb[_0x367b88(0x165)]=_0x49892b[_0x367b88(0x185)]);},_0x34ed1d['prototype'][_0x214696(0x20b)]=function(_0x227af0){return 0x1/_0x227af0===Number['NEGATIVE_INFINITY'];},_0x34ed1d['prototype'][_0x214696(0x222)]=function(_0x27dce3){var _0x331cd8=_0x214696;!_0x27dce3[_0x331cd8(0x210)]||!_0x27dce3[_0x331cd8(0x210)][_0x331cd8(0x153)]||_0x27dce3[_0x331cd8(0x203)]===_0x331cd8(0x1b2)||_0x27dce3['type']===_0x331cd8(0x144)||_0x27dce3[_0x331cd8(0x203)]===_0x331cd8(0x1d7)||_0x27dce3[_0x331cd8(0x210)]['sort'](function(_0x1994d2,_0x317377){var _0x4191d5=_0x331cd8,_0x35525d=_0x1994d2[_0x4191d5(0x185)][_0x4191d5(0x1f9)](),_0x18ffb7=_0x317377[_0x4191d5(0x185)][_0x4191d5(0x1f9)]();return _0x35525d<_0x18ffb7?-0x1:_0x35525d>_0x18ffb7?0x1:0x0;});},_0x34ed1d[_0x214696(0x220)][_0x214696(0x18a)]=function(_0x5a52d9,_0x252462){var _0x1838f0=_0x214696;if(!(_0x252462[_0x1838f0(0x179)]||!_0x5a52d9['props']||!_0x5a52d9[_0x1838f0(0x210)]['length'])){for(var _0x25c031=[],_0x4fa983=[],_0x345970=0x0,_0x29561b=_0x5a52d9[_0x1838f0(0x210)][_0x1838f0(0x153)];_0x345970<_0x29561b;_0x345970++){var _0x18ce7d=_0x5a52d9[_0x1838f0(0x210)][_0x345970];_0x18ce7d[_0x1838f0(0x203)]==='function'?_0x25c031['push'](_0x18ce7d):_0x4fa983[_0x1838f0(0x16e)](_0x18ce7d);}if(!(!_0x4fa983[_0x1838f0(0x153)]||_0x25c031['length']<=0x1)){_0x5a52d9[_0x1838f0(0x210)]=_0x4fa983;var _0x1e2b92={'functionsNode':!0x0,'props':_0x25c031};this['_setNodeId'](_0x1e2b92,_0x252462),this[_0x1838f0(0x154)](_0x1e2b92,_0x252462),this['_setNodeExpandableState'](_0x1e2b92),this[_0x1838f0(0x184)](_0x1e2b92,_0x252462),_0x1e2b92['id']+='\\x20f',_0x5a52d9[_0x1838f0(0x210)]['unshift'](_0x1e2b92);}}},_0x34ed1d['prototype'][_0x214696(0x1e2)]=function(_0x34b99c,_0x45eb99){},_0x34ed1d[_0x214696(0x220)]['_setNodeExpandableState']=function(_0x5b55c3){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x180)]=function(_0x58cc5e){var _0xf4ba55=_0x214696;return Array[_0xf4ba55(0x1f1)](_0x58cc5e)||typeof _0x58cc5e==_0xf4ba55(0x164)&&this[_0xf4ba55(0x22e)](_0x58cc5e)===_0xf4ba55(0x227);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x184)]=function(_0x29d75c,_0xe2d021){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1df)]=function(_0xa023c9){var _0x589591=_0x214696;delete _0xa023c9[_0x589591(0x12f)],delete _0xa023c9[_0x589591(0x152)],delete _0xa023c9[_0x589591(0x193)];},_0x34ed1d['prototype'][_0x214696(0x1db)]=function(_0x2562a9,_0x2d27a2){};let _0x28f581=new _0x34ed1d(),_0x502a66={'props':_0x513131[_0x214696(0x1b3)][_0x214696(0x210)]||0x64,'elements':_0x513131[_0x214696(0x1b3)][_0x214696(0x145)]||0x64,'strLength':_0x513131[_0x214696(0x1b3)]['strLength']||0x400*0x32,'totalStrLength':_0x513131[_0x214696(0x1b3)][_0x214696(0x13e)]||0x400*0x32,'autoExpandLimit':_0x513131[_0x214696(0x1b3)]['autoExpandLimit']||0x1388,'autoExpandMaxDepth':_0x513131[_0x214696(0x1b3)][_0x214696(0x225)]||0xa},_0x13ef23={'props':_0x513131[_0x214696(0x230)][_0x214696(0x210)]||0x5,'elements':_0x513131['reducedLimits'][_0x214696(0x145)]||0x5,'strLength':_0x513131['reducedLimits'][_0x214696(0x1a0)]||0x100,'totalStrLength':_0x513131[_0x214696(0x230)]['totalStrLength']||0x100*0x3,'autoExpandLimit':_0x513131[_0x214696(0x230)][_0x214696(0x1d4)]||0x1e,'autoExpandMaxDepth':_0x513131['reducedLimits']['autoExpandMaxDepth']||0x2};if(_0x475afa){let _0x29800f=_0x28f581[_0x214696(0x17a)][_0x214696(0x19d)](_0x28f581);_0x28f581[_0x214696(0x17a)]=function(_0x10fd5b,_0x3e4059,_0x54184b,_0x152e04){return _0x29800f(_0x10fd5b,_0x475afa(_0x3e4059),_0x54184b,_0x152e04);};}function _0x2b3bff(_0x12d8f0,_0x4cf31e,_0x573668,_0x6b9276,_0x430332,_0x9e1f91){var _0x317b69=_0x214696;let _0x120eeb,_0x5a07b2;try{_0x5a07b2=_0x5593f0(),_0x120eeb=_0x10c330[_0x4cf31e],!_0x120eeb||_0x5a07b2-_0x120eeb['ts']>_0x5f34e7['perLogpoint'][_0x317b69(0x14b)]&&_0x120eeb[_0x317b69(0x215)]&&_0x120eeb[_0x317b69(0x1c8)]/_0x120eeb[_0x317b69(0x215)]<_0x5f34e7[_0x317b69(0x1d0)][_0x317b69(0x134)]?(_0x10c330[_0x4cf31e]=_0x120eeb={'count':0x0,'time':0x0,'ts':_0x5a07b2},_0x10c330[_0x317b69(0x1d6)]={}):_0x5a07b2-_0x10c330['hits']['ts']>_0x5f34e7[_0x317b69(0x1a5)][_0x317b69(0x14b)]&&_0x10c330[_0x317b69(0x1d6)]['count']&&_0x10c330[_0x317b69(0x1d6)]['time']/_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x215)]<_0x5f34e7['global'][_0x317b69(0x134)]&&(_0x10c330['hits']={});let _0x371293=[],_0x57f51c=_0x120eeb[_0x317b69(0x1da)]||_0x10c330[_0x317b69(0x1d6)]['reduceLimits']?_0x13ef23:_0x502a66,_0x1bcf5c=_0x91ed01=>{var _0x1aa6af=_0x317b69;let _0xc556ae={};return _0xc556ae[_0x1aa6af(0x210)]=_0x91ed01['props'],_0xc556ae[_0x1aa6af(0x145)]=_0x91ed01[_0x1aa6af(0x145)],_0xc556ae['strLength']=_0x91ed01[_0x1aa6af(0x1a0)],_0xc556ae[_0x1aa6af(0x13e)]=_0x91ed01[_0x1aa6af(0x13e)],_0xc556ae['autoExpandLimit']=_0x91ed01[_0x1aa6af(0x1d4)],_0xc556ae[_0x1aa6af(0x225)]=_0x91ed01[_0x1aa6af(0x225)],_0xc556ae['sortProps']=!0x1,_0xc556ae['noFunctions']=!_0x22cb75,_0xc556ae[_0x1aa6af(0x21e)]=0x1,_0xc556ae[_0x1aa6af(0x207)]=0x0,_0xc556ae['expId']=_0x1aa6af(0x1c3),_0xc556ae['rootExpression']='root_exp',_0xc556ae[_0x1aa6af(0x163)]=!0x0,_0xc556ae['autoExpandPreviousObjects']=[],_0xc556ae[_0x1aa6af(0x148)]=0x0,_0xc556ae[_0x1aa6af(0x194)]=_0x513131['resolveGetters'],_0xc556ae[_0x1aa6af(0x191)]=0x0,_0xc556ae[_0x1aa6af(0x167)]={'current':void 0x0,'parent':void 0x0,'index':0x0},_0xc556ae;};for(var _0x1b0099=0x0;_0x1b0099<_0x430332[_0x317b69(0x153)];_0x1b0099++)_0x371293['push'](_0x28f581[_0x317b69(0x17a)]({'timeNode':_0x12d8f0===_0x317b69(0x1c8)||void 0x0},_0x430332[_0x1b0099],_0x1bcf5c(_0x57f51c),{}));if(_0x12d8f0===_0x317b69(0x160)||_0x12d8f0===_0x317b69(0x1fb)){let _0x2d5716=Error[_0x317b69(0x18c)];try{Error[_0x317b69(0x18c)]=0x1/0x0,_0x371293[_0x317b69(0x16e)](_0x28f581['serialize']({'stackNode':!0x0},new Error()[_0x317b69(0x21f)],_0x1bcf5c(_0x57f51c),{'strLength':0x1/0x0}));}finally{Error[_0x317b69(0x18c)]=_0x2d5716;}}return{'method':_0x317b69(0x169),'version':_0x425029,'args':[{'ts':_0x573668,'session':_0x6b9276,'args':_0x371293,'id':_0x4cf31e,'context':_0x9e1f91}]};}catch(_0x40679d){return{'method':_0x317b69(0x169),'version':_0x425029,'args':[{'ts':_0x573668,'session':_0x6b9276,'args':[{'type':_0x317b69(0x170),'error':_0x40679d&&_0x40679d[_0x317b69(0x218)]}],'id':_0x4cf31e,'context':_0x9e1f91}]};}finally{try{if(_0x120eeb&&_0x5a07b2){let _0x27a114=_0x5593f0();_0x120eeb['count']++,_0x120eeb[_0x317b69(0x1c8)]+=_0x48727a(_0x5a07b2,_0x27a114),_0x120eeb['ts']=_0x27a114,_0x10c330['hits'][_0x317b69(0x215)]++,_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x1c8)]+=_0x48727a(_0x5a07b2,_0x27a114),_0x10c330[_0x317b69(0x1d6)]['ts']=_0x27a114,(_0x120eeb['count']>_0x5f34e7['perLogpoint'][_0x317b69(0x1ce)]||_0x120eeb['time']>_0x5f34e7['perLogpoint']['reduceOnAccumulatedProcessingTimeMs'])&&(_0x120eeb[_0x317b69(0x1da)]=!0x0),(_0x10c330['hits']['count']>_0x5f34e7['global'][_0x317b69(0x1ce)]||_0x10c330['hits'][_0x317b69(0x1c8)]>_0x5f34e7[_0x317b69(0x1a5)][_0x317b69(0x1aa)])&&(_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x1da)]=!0x0);}}catch{}}}return _0x2b3bff;}function G(_0x434b91){var _0x257403=_0x27f4ea;if(_0x434b91&&typeof _0x434b91=='object'&&_0x434b91[_0x257403(0x12c)])switch(_0x434b91['constructor']['name']){case _0x257403(0x1c0):return _0x434b91[_0x257403(0x1bc)](Symbol[_0x257403(0x15f)])?Promise[_0x257403(0x1d2)]():_0x434b91;case _0x257403(0x15d):return Promise[_0x257403(0x1d2)]();}return _0x434b91;}((_0xb12d58,_0x1c1888,_0x4be2b0,_0x6defa5,_0x3edf33,_0x39ddf7,_0x2e212d,_0x35551d,_0x1eb46e,_0x4e3e05,_0x219815,_0x40c102)=>{var _0x47ee38=_0x27f4ea;if(_0xb12d58[_0x47ee38(0x166)])return _0xb12d58[_0x47ee38(0x166)];let _0x41d96a={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}};if(!X(_0xb12d58,_0x35551d,_0x3edf33))return _0xb12d58[_0x47ee38(0x166)]=_0x41d96a,_0xb12d58[_0x47ee38(0x166)];let _0x5cf254=b(_0xb12d58),_0x211417=_0x5cf254['elapsed'],_0x120ed8=_0x5cf254[_0x47ee38(0x171)],_0x4d12ad=_0x5cf254[_0x47ee38(0x1f6)],_0x40a67f={'hits':{},'ts':{}},_0xbddbd0=J(_0xb12d58,_0x1eb46e,_0x40a67f,_0x39ddf7,_0x40c102,_0x3edf33===_0x47ee38(0x177)?G:void 0x0),_0x391c84=(_0x3a42bb,_0x4e5be3,_0x29339e,_0x59a5b4,_0x4e05b6,_0xeaaf9e)=>{var _0x5a78e6=_0x47ee38;let _0x2a987d=_0xb12d58[_0x5a78e6(0x166)];try{return _0xb12d58[_0x5a78e6(0x166)]=_0x41d96a,_0xbddbd0(_0x3a42bb,_0x4e5be3,_0x29339e,_0x59a5b4,_0x4e05b6,_0xeaaf9e);}finally{_0xb12d58[_0x5a78e6(0x166)]=_0x2a987d;}},_0x486373=_0x41f49c=>{_0x40a67f['ts'][_0x41f49c]=_0x120ed8();},_0x375f8a=(_0x586b6b,_0x281c49)=>{var _0x42f9bc=_0x47ee38;let _0x1de228=_0x40a67f['ts'][_0x281c49];if(delete _0x40a67f['ts'][_0x281c49],_0x1de228){let _0x3d4aab=_0x211417(_0x1de228,_0x120ed8());_0x3b4188(_0x391c84(_0x42f9bc(0x1c8),_0x586b6b,_0x4d12ad(),_0x39ea0c,[_0x3d4aab],_0x281c49));}},_0x36a5c5=_0x538015=>{var _0x2867b1=_0x47ee38,_0x3d1b72;return _0x3edf33===_0x2867b1(0x177)&&_0xb12d58[_0x2867b1(0x15b)]&&((_0x3d1b72=_0x538015==null?void 0x0:_0x538015[_0x2867b1(0x1bb)])==null?void 0x0:_0x3d1b72['length'])&&(_0x538015[_0x2867b1(0x1bb)][0x0]['origin']=_0xb12d58[_0x2867b1(0x15b)]),_0x538015;};_0xb12d58[_0x47ee38(0x166)]={'consoleLog':(_0x51ed74,_0xe11fc)=>{var _0x38ecd1=_0x47ee38;_0xb12d58[_0x38ecd1(0x1cd)]['log'][_0x38ecd1(0x185)]!==_0x38ecd1(0x158)&&_0x3b4188(_0x391c84(_0x38ecd1(0x169),_0x51ed74,_0x4d12ad(),_0x39ea0c,_0xe11fc));},'consoleTrace':(_0x137d17,_0x1d312d)=>{var _0x51cf82=_0x47ee38,_0x5b8a58,_0x41a828;_0xb12d58[_0x51cf82(0x1cd)][_0x51cf82(0x169)][_0x51cf82(0x185)]!==_0x51cf82(0x16d)&&((_0x41a828=(_0x5b8a58=_0xb12d58['process'])==null?void 0x0:_0x5b8a58[_0x51cf82(0x16c)])!=null&&_0x41a828['node']&&(_0xb12d58[_0x51cf82(0x155)]=!0x0),_0x3b4188(_0x36a5c5(_0x391c84(_0x51cf82(0x160),_0x137d17,_0x4d12ad(),_0x39ea0c,_0x1d312d))));},'consoleError':(_0x1f78e4,_0x2b1ba8)=>{var _0x13a967=_0x47ee38;_0xb12d58[_0x13a967(0x155)]=!0x0,_0x3b4188(_0x36a5c5(_0x391c84(_0x13a967(0x1fb),_0x1f78e4,_0x4d12ad(),_0x39ea0c,_0x2b1ba8)));},'consoleTime':_0x1a9247=>{_0x486373(_0x1a9247);},'consoleTimeEnd':(_0x5d368a,_0x200ddf)=>{_0x375f8a(_0x200ddf,_0x5d368a);},'autoLog':(_0x5d21fe,_0x1d28a4)=>{var _0x262f79=_0x47ee38;_0x3b4188(_0x391c84(_0x262f79(0x169),_0x1d28a4,_0x4d12ad(),_0x39ea0c,[_0x5d21fe]));},'autoLogMany':(_0x3c9460,_0x1c3a81)=>{_0x3b4188(_0x391c84('log',_0x3c9460,_0x4d12ad(),_0x39ea0c,_0x1c3a81));},'autoTrace':(_0x1e8e77,_0x45393a)=>{var _0x10935e=_0x47ee38;_0x3b4188(_0x36a5c5(_0x391c84(_0x10935e(0x160),_0x45393a,_0x4d12ad(),_0x39ea0c,[_0x1e8e77])));},'autoTraceMany':(_0x5e24f4,_0x2f9fe6)=>{var _0xfcca09=_0x47ee38;_0x3b4188(_0x36a5c5(_0x391c84(_0xfcca09(0x160),_0x5e24f4,_0x4d12ad(),_0x39ea0c,_0x2f9fe6)));},'autoTime':(_0x5efb2d,_0x485584,_0x2bb811)=>{_0x486373(_0x2bb811);},'autoTimeEnd':(_0x43da21,_0x51b33a,_0x2ed8c7)=>{_0x375f8a(_0x51b33a,_0x2ed8c7);},'coverage':_0x188923=>{var _0x35709e=_0x47ee38;_0x3b4188({'method':_0x35709e(0x1e1),'version':_0x39ddf7,'args':[{'id':_0x188923}]});}};let _0x3b4188=H(_0xb12d58,_0x1c1888,_0x4be2b0,_0x6defa5,_0x3edf33,_0x4e3e05,_0x219815),_0x39ea0c=_0xb12d58[_0x47ee38(0x16b)];return _0xb12d58[_0x47ee38(0x166)];})(globalThis,_0x27f4ea(0x159),'61485',_0x27f4ea(0x1e5),'webpack',_0x27f4ea(0x151),_0x27f4ea(0x1b7),_0x27f4ea(0x1bd),_0x27f4ea(0x1be),'','1',{\"resolveGetters\":false,\"defaultLimits\":{\"props\":100,\"elements\":100,\"strLength\":51200,\"totalStrLength\":51200,\"autoExpandLimit\":5000,\"autoExpandMaxDepth\":10},\"reducedLimits\":{\"props\":5,\"elements\":5,\"strLength\":256,\"totalStrLength\":768,\"autoExpandLimit\":30,\"autoExpandMaxDepth\":2},\"reducePolicy\":{\"perLogpoint\":{\"reduceOnCount\":50,\"reduceOnAccumulatedProcessingTimeMs\":100,\"resetWhenQuietMs\":500,\"resetOnProcessingTimeAverageMs\":100},\"global\":{\"reduceOnCount\":1000,\"reduceOnAccumulatedProcessingTimeMs\":300,\"resetWhenQuietMs\":50,\"resetOnProcessingTimeAverageMs\":100}}});");}catch(e){console.error(e);}};/* istanbul ignore next */function oo_oo(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleLog(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_tr(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleTrace(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_tx(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleError(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_ts(/**@type{any}**/v){try{oo_cm().consoleTime(v);}catch(e){} return v;};/* istanbul ignore next */function oo_te(/**@type{any}**/v, /**@type{any}**/i){try{oo_cm().consoleTimeEnd(v, i);}catch(e){} return v;};/*eslint unicorn/no-abusive-eslint-disable:,eslint-comments/disable-enable-pair:,eslint-comments/no-unlimited-disable:,eslint-comments/no-aggregating-enable:,eslint-comments/no-duplicate-disable:,eslint-comments/no-unused-disable:,eslint-comments/no-unused-enable:,*/</script>
