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
                console.log('installments', installments);
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
                console.log('error add to BUO: ', error);

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
                        console.error('There was an issue with the request:', response.data?.ErrorMessages || '');
                    }
                } catch (error) {
                    console.error('Some Network issue:', error);
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
                    console.log(response, response.data);
                    if(response.success) {
                        // handled in try/catch because of the possibility of non-binary data
                        try {
                            // ensure blob from response has the correct MIME type
                            const pdf = new Blob([response.data], { type: 'application/pdf' });
                            const url = window.URL.createObjectURL(pdf);
                            window.open(url);
                        } catch (err) {
                            console.log('Invoice PDF Error:', err);
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

                    console.log('Receipt Action & Items', actionField, products);

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
                    console.log('error cancel order: ', error);
                }
            },
            checkDevice() {
                const isMobile = (navigator.userAgent.toLowerCase().match(/mobile/i)) || (/Mobi|Android|iPhone/i.test(navigator.userAgent));
                return isMobile ? 'Mobile' : 'Desktop';
            }
        }
    };
</script>
