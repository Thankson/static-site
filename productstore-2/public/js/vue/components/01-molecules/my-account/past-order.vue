<template>
    <div class="m-po__wrapper" :class="isRiverbendOrder ? '-riverbendOrder': ''">

        <ul class="m-po__header" :class="{'-withGuiDetails':showGuiInfo}">
            <li class="m-po__date -col-md-2">
                <div class="m-po__date -wrapper">
                    <span :class="{'flex md:inline' : isCn }" role="text">
                        <em class="m-po__date -title">
                            {{ localization.Labels.OrderDate }}
                        </em>
                        <span class="m-po__date -value">
                            {{ formattedOrderEntryDate }}
                        </span>
                    </span>
                    <span v-if="pastOrder.IsBackDated" class="m-po__tooltip" :class="{'-isCn': isCn}">
                        <m-tooltip
                            tooltip-icon="info"
                            tooltip-icon-size="xs"
                            tooltip-popup-mod="-lg z-1"
                            :tooltip-aria-label="localization.Labels.TooltipAriaLabel"
                        >
                            <div
                                class="text-gray-150 text-bold text-sm"
                                v-html="replaceToken(localization.Labels.BackDatedTooltip, pastOrder.OrderDateString)"></div>
                        </m-tooltip>
                    </span>
                </div>
            </li>

            <li class="m-po__number -col-md-2" role="text" :class="{'-isCn' : isCn }">
                <em class="m-po__number -title">
                    {{ localization.Labels.OrderNumber }}
                </em>
                <span class="m-po__number -value">
                    {{ pastOrder.OrderNumber }}
                </span>
            </li>

            <li v-if="!isCn" class="m-po__total" :class="viewPoints ? '-col-md-2 -col-lg-1' : '-col-md-2 -col-lg-2'" role="text">
                <em class="m-po__total -title">
                    {{ localization.Labels.Total }}
                </em>
                <span class="m-po__total -value">
                    {{ pastOrder.OrderTotalFormatted }}
                </span>
            </li>

            <li v-if="!isCn && viewPoints" class="m-po__points -col-md-1" role="text">
                <em v-if="!isRiverbendOrder" class="m-po__points -title">
                    {{ localization.Labels.Points }}
                </em>
                <span v-if="!isRiverbendOrder" class="m-po__points -value">
                    {{ pastOrder.TotalPoints }}
                </span>
            </li>

            <li v-if="isCn" class="m-po__quantity -col-md-1" role="text">
                <em class="m-po__quantity -title">
                    {{ localization.Labels.Items }}
                </em>
                <span class="m-po__quantity -value">
                    {{ pastOrder.OrderItems ? pastOrder.OrderItems.length : 0 }}
                </span>
            </li>

            <li class="m-po__prefered" :class="preferedClass" role="text">
                <em class="m-po__prefered -title">
                    {{ preferedTitle }}
                </em>
                <span class="m-po__prefered -value">
                    {{ preferedValue }}
                </span>
            </li>

            <li v-if="isCn && viewPoints" class="m-po__points -col-md-1" role="text">
                <em class="m-po__points -title">
                    {{ localization.Labels.Points }}
                </em>
                <span class="m-po__points -value">
                    {{ pastOrder.TotalPoints }}
                </span>
            </li>

            <!-- #region Gui details -->
            <li v-if="showGuiInfo" class="m-po__guiDate -col-md-2">
                <div class="m-po__date -wrapper">
                    <span role="text">
                        <em class="m-po__date -title">
                            {{ localization.Labels.GUI.InvoiceIssueDate }}
                        </em>
                        <span v-if="hasGuiData" class="m-po__date -value">
                            {{ pastOrder.Guis[0].FormattedSaleDate }}
                        </span>
                    </span>
                </div>
            </li>

            <li v-if="showGuiInfo" class="m-po__guiNumber -col-md-2" role="text">
                <em class="m-po__number -title">
                    {{ localization.Labels.GUI.CarrierNumber }}
                </em>
                <span v-if="hasGuiData" class="m-po__number -value">
                    {{ pastOrder.Guis[0].GuiIdentifier }}
                </span>
            </li>

            <li v-if="showGuiInfo" class="m-po__guiNumber -col-md-2" role="text">
                <em class="m-po__number -title">
                    {{ localization.Labels.GUI.LoveCode }}
                </em>
                <span v-if="hasGuiData" class="m-po__number -value">
                    {{ pastOrder.Guis[0].GuiDoneeID }}
                </span>
            </li>
            <!-- #endregion -->

            <li v-if="isCn" class="m-po__status md:hidden" :class="{ '-pending' : pendingOrders}">
                {{ title }}
            </li>
            <li v-if="!isLimitOrderHistory" class="m-po__track -col-md-2" :class="{ '-isCn' : isCn }">
                <div v-if="isTrackButtonShown(pastOrder.OrderDate, pastOrder.OrderStatus, pastOrder.PackageInformation, pastOrder.OrderNumber)" class="m-po__track-inner">
                    <v-select
                        v-if="trackNumbers.length > 2 && !isCn"
                        :id="`track-order-${Math.random()}`"
                        ref="trackButton"
                        :options="trackNumbers.toString()"
                        :aria-label="localization.Labels.Track"
                        :values="trackUrls"
                        :hidden-first="true"
                        select-element-mod="uppercase -track"
                        select-mod="-md -green -center -rounded -padding-sm -hidden-first w-full"
                        arrow-tailwind-color="white" />

                    <v-button
                        v-else-if="showTrackButton && !useAltTrackingNumber"
                        type="button"
                        :cta="localization.Labels.Track"
                        :class="buttonClasses"
                        target="_blank"
                        is-anchor
                        :href="!isCn && pastOrder.PackageInformation[0].TrackingUrl"
                        @click="isCn && showTips()" />

                    <v-button
                        v-else-if="showTrackButton && useAltTrackingNumber"
                        type="button"
                        :cta="localization.Labels.Track"
                        :class="buttonClasses"
                        target="_blank"
                        is-anchor
                        :href="trackUrls[0]" />
                </div>

                <div v-else-if="isCn && pendingOrders && showPayButton" class="m-po__track-inner -payBtn" :class="{ '-isCn' : isCn }">
                    <v-button
                        :href="paybuttonLink"
                        type="button"
                        :cta="localization.Labels.Pay"
                        :class="paybuttonClasses"
                        is-anchor />
                </div>

                <div v-else-if="!isCn && pastOrder.ShowPayLink" class="m-po__track-inner" :class="{ '-payBtn' : !fourDayDirectDebitOrder }">
                    <v-button
                        :href="paybuttonLink"
                        type="button"
                        :cta="localization.Labels.Pay"
                        :class="paybuttonClasses"
                        is-anchor />
                </div>

                <div v-else-if="processingOrders || cancelledOrders" class="m-po__track-inner" :class="{ '-isCn' : isCn }">
                    <v-button
                        type="button"
                        :cta="localization.Labels.AddOrderToCart"
                        :class="addCartbuttonClasses"
                        target="_blank"
                        is-anchor
                        @click="[
                            handleAddItemsToCart(pastOrder.OrderItems, modalAddItems, true),
                            gtmTrackAction({id: gtmId}, $event)
                        ]" />
                </div>

                <div v-else-if="processedOrders || returnedOrders" class="m-po__track-inner" :class="{ '-isCn' : isCn }">
                    <v-button
                        type="button"
                        :cta="localization.Labels.PrintOrderHistory"
                        :class="addCartbuttonClasses"
                        target="_blank"
                        is-anchor
                        @click="[
                            printReceipt(),
                            gtmTrackAction({id: gtmId}, $event)
                        ]" />
                </div>

            </li>

            <li v-if="!isLimitOrderHistory" class="m-po__more -col-md-1" :class="{'-isCn' : isCn}">
                <button
                    v-if="!processedOrders && !returnedOrders"
                    class="m-po__more -btn"
                    :aria-label="prodAriaLabel(localization.Labels.ScreenReaderSecondaryMenu, pastOrder.OrderNumber)"
                    v-on:click.stop.prevent="togglePopUp('moremenu')">
                    ⋮
                </button>
                <popup
                    ref="moremenu"
                    :close-aria-label="prodAriaLabel(localization.Labels.ScreenReaderClosePopupMenu, pastOrder.OrderNumber)"
                    arrow-mods="-filled -shadow absolute -top-13 right-2 md:right-10"
                    :mod-content="'px-15 ' + (isCn ? 'py-20' : 'py-12')"
                    mods="right-8 top-60"
                    :header-visible="false"
                    :footer-visible="false">
                    <!-- Show loading while is printing receipt -->
                    <div
                        v-if="isPrintingReceipt && !printingReceiptLoaded"
                        class="m-po__loading m-po__loading border-none top-1 left-1 right-1 bottom-1">
                        <a-loading-spinner :visible="true" aria-hidden="true" size="sm" />
                    </div>

                    <ul :class="['m-po__more -list', { '-isCn' : isCn }]">
                        <li v-if="!isCn || processingOrders || shippingOrders" :class="['m-po__more -item', { 'order-4' : isCn }]">
                            <button
                                class="m-po__more -link text-left"
                                :aria-label="localization.Labels.PrintOrderHistory"
                                type="button"
                                @click="[printReceipt(), gtmTrackAction({id: gtmId}, $event)]">
                                {{ localization.Labels.PrintOrderHistory }}
                            </button>
                        </li>
                        <li v-if="!isCn && !hideOrderLinks" class="m-po__more -item">
                            <a
                                class="m-po__more -link text-left"
                                :href="localization.Data.ReturnItemsLink.Url"
                                target="_blank"
                                rel="noopener noreferrer"
                                @click="goToReturnItems($event)">
                                {{ localization.Labels.ReturnItems }}
                            </a>
                        </li>
                        <li
                            v-if="showCancelButton"
                            :class="['m-po__more -item', { 'order-2' : isCn }]">
                            <button
                                class="m-po__more -link text-left"
                                type="button"
                                @click="[
                                    openCancelModal(),
                                    gtmTrackAction({id: gtmId}, $event)
                                ]">
                                {{ localization.Labels.CancelOrder }}
                            </button>
                        </li>
                        <li
                            v-if="showMakeBackupOrder && pastOrder.CanAddToBuo && !hideOrderLinks"
                            :class="['m-po__more -item', { 'order-5' : isCn }]">
                            <button
                                class="m-po__more -link text-left"
                                :aria-label="makeThisMyBackupOrderAriaLabel"
                                type="button"
                                @click="[
                                    handleAddItemsToBuo(pastOrder.OrderItems, modalAddItems, true),
                                    gtmTrackAction({id: gtmId}, $event)
                                ]">
                                {{ localization.Labels.MakeThisMyBackupOrder }}
                            </button>
                        </li>
                        <li v-if="showSaveThisOrder" :class="['m-po__more -item', { 'order-3' : isCn }]">
                            <button
                                class="m-po__more -link text-left"
                                :aria-label="localization.Labels.SaveThisOrder"
                                type="button"
                                @click="[handleAddItemsToList(modalAddList, modalAddItems), gtmTrackAction({id: gtmId}, $event)]">
                                {{ localization.Labels.SaveThisOrder }}
                            </button>
                        </li>
                        <li
                            v-if="showAddItemToCartBtn && !hideOrderLinks"
                            :class="['m-po__more -item', { 'order-1' : isCn }]">
                            <button
                                class="m-po__more -link text-left"
                                :aria-label="localization.Labels.AddOrderToCart"
                                type="button"
                                @click="[
                                    handleAddItemsToCart(pastOrder.OrderItems, modalAddItems, true),
                                    gtmTrackAction({id: gtmId}, $event)
                                ]">
                                {{ localization.Labels.AddOrderToCart }}
                            </button>
                        </li>
                    </ul>
                </popup>

                <!-- Modal - Result of Add Order to Cart/BUO/List -->
                <m-add-items-modal
                    v-if="listAdded"
                    :ref="modalAddItems"
                    :from-past-order="true"
                    :is-cart="listAddingType === 'cart'"
                    :is-buo="listAddingType === 'buo'"
                    :is-list="listAddingType === 'list'"
                    :is-cn="isCn"
                    :localization="localization"
                    :modal-id="modalAddItems"
                    @adding-list-hide="[closeModal(modalAddItems), focusReturn()]">
                </m-add-items-modal>

                <!-- Modal - Add Order To List -->
                <m-shoplists-add-item-modal
                    v-if="listModalOpened"
                    :ref="modalAddList"
                    :items="pastOrder.OrderItems"
                    :modal-id="modalAddList"
                    @adding-list-hide="closeModal(modalAddList)"
                    @items-added="handleItemsAddedToList">
                </m-shoplists-add-item-modal>

                <!-- Modal - Cancel Order -->
                <modal id="cancel-modal">
                    <template v-slot:heading>
                        {{ localization.Labels.CancelModelHeader }}
                    </template>

                    <template v-slot:body>
                        <p>{{ localization.Labels.CancelModelDesc }}</p>
                    </template>

                    <template v-slot:footer>
                        <div>
                            <button class="a-button text-base font-medium py-12 px-30 mr-10 inline-block -white" type="button" @click="cancelOrder(pastOrder.OrderNumber)">
                                {{ localization.Labels.CancelModelCancelLabel }}
                            </button>
                            <button class="a-button text-base font-medium py-12 px-30 mr-10 inline-block" type="button" @click="closeCancel()">
                                {{ localization.Labels.CancelModelKeepLabel }}
                            </button>
                        </div>
                    </template>
                </modal>

                <modal v-if="isCn" id="no-tracking-modal" :heading-visible="false">

                    <template v-slot:body>
                        <p>{{ localization.Labels.NoTrackingInfo }}</p>
                    </template>

                    <template v-slot:footer>
                        <div>
                            <button class="a-button text-base font-medium py-12 px-40 inline-block" type="button" @click="closeNoTracking()">
                                {{ localization.Labels.NoTrackingInfoCancelLabel }}
                            </button>
                        </div>
                    </template>
                </modal>
            </li>

        </ul>

        <div class="m-po__body" :class="{'-isCn':isCn}">
            <accordion
                v-if="!isLimitOrderHistory"
                :arrow-size="arrowSize"
                :content-id="contentId + toggleId"
                :is-cn="isCn"
                :mod-content="modContent"
                :mod-first-title="pendingTitle"
                :mod-second-title="modSecondTitle"
                :end-title-aria-label="thirdTitleAriaLabel"
                :end-title-class="modThirdTitle"
                :end-title-url="receiptUrl"
                :mod-toggler="modToggler"
                :mod-wrapper-title="modWrapperTitle"
                :mod-arrow="modArrow"
                :past-order="pastOrder"
                :second-title="orderStatusString"
                :end-title="thirdTitle"
                :gtm-toggle-id="gtmId"
                :end-title-gtm-id="gtmId"
                :title="title"
                :toggle-id="toggleId"
                :wrapper-mods="wrapperMods"
                @show="showProducts">

                <div class="m-po__details -wrapper">
                    <div v-if="!hideShippingAddressHeader" class="m-po__details -header">
                        <div v-if="pastOrder.ShipToAddress" class="m-po__details -ship">
                            <button :aria-expanded="isExpanded('ship')" v-on:click.stop.prevent="togglePopUp('ship')">
                                {{ localization.Labels.ShipTo }}: <strong>{{ pastOrder.ShipToAddress.Address1 }}</strong>
                                <arrow
                                    direction="-down"
                                    size="-sm"
                                    tailwind-color="gray-120"
                                    other-mods="-filled ml-5"
                                ></arrow>
                            </button>
                            <popup
                                ref="ship"
                                mods="left-0 top-30"
                                :close-aria-label="prodAriaLabel(localization.Labels.CloseShipToPopupAriaLabel, pastOrder.OrderNumber)"
                                arrow-mods="-filled -shadow absolute -top-13 md:left-1_2"
                                mod-content="px-15 py-12"
                                :header-visible="false"
                                :footer-visible="false">

                                <ul :class="isCn ? 'text-sm' : 'text-xs'">
                                    <li v-if="!isCn">{{ pastOrder.ShipToAddress.NameOnAddress }}</li>
                                    <li v-else>{{ pastOrder.ShipToName }}</li>
                                    <li v-if="isCn">{{ pastOrder.ShipToAddress.DeliveryPhoneNumber }}</li>
                                    <li v-if="!isCn && pastOrder.ShipToAddress.Address1">{{ pastOrder.ShipToAddress.Address1 }}</li>
                                    <li v-if="!isCn && pastOrder.ShipToAddress.Address2">{{ pastOrder.ShipToAddress.Address2 }}</li>
                                    <li v-if="!isCn">{{ pastOrder.ShipToAddress.City }}, {{ pastOrder.ShipToAddress.State }} {{ pastOrder.ShipToAddress.PostalCode }}</li>
                                    <li v-else>{{ pastOrder.ShipToAddress.State }}{{ pastOrder.ShipToAddress.City }}{{ pastOrder.ShipToAddress.Address1 ? pastOrder.ShipToAddress.Address1 : '' }}{{ pastOrder.ShipToAddress.Address2 ? pastOrder.ShipToAddress.Address2 : '' }}</li>
                                    <li v-if="isCn">{{ pastOrder.ShipToAddress.PostalCode }}</li>
                                </ul>

                            </popup>
                        </div>

                        <div
                            v-if="isTrackButtonShown(pastOrder.OrderDate, pastOrder.OrderStatus, pastOrder.PackageInformation, pastOrder.OrderNumber)"
                            class="m-po__details -track">

                            {{ localization.Labels.TrackingNumber }}
                            <span
                                v-for="(track, i) in pastOrder.PackageInformation" :key="track.TrackingNumber + '-' + i"
                                class="m-po__details -track-number">

                                <a
                                    v-if="isCn"
                                    class="cursor-pointer"
                                    target="_blank"
                                    @click="showTips()">
                                    {{ track.TrackingNumber }}
                                </a>
                                <a v-else-if="hasWebTracking(track)" :href="orderTrackingUrl(track)" target="_blank">
                                    {{ track.TrackingNumber }}
                                </a>
                                <span v-else-if="hasNoWebTracking(track)">
                                    {{ track.TrackingNumber }}
                                </span>
                                <span v-if="i >= 0 && i < pastOrder.PackageInformation.length - 1"> | </span>
                            </span>

                        </div>
                    </div>

                    <ol v-if="pastOrder.OrderItems && pastOrder.OrderItems.length" class="m-po__details -list">

                        <!-- Start product list -->
                        <li
                            v-for="(prod, i) in pastOrder.OrderItems"
                            :key="prod.Sku"
                            class="m-po__details -listItem">

                            <div class="m-po__details -qty">
                                <div class="m-po__details -qty-inner">
                                    <span class="m-po__details -qty-title">{{ localization.Labels.QuantityAbbreviated }}</span>
                                    <span class="m-po__details -qty-number">{{ prod.Quantity }}</span>
                                </div>
                            </div>

                            <div class="m-po__details -img">
                                <img v-if="prod.Image && prod.Image.Url" :src="prod.Image.Url" :alt="prod.Image.Alt">
                            </div>

                            <div class="m-po__details -info">
                                <div v-if="!hideVerboseProductDetails" class="m-po__details -infoTitle" v-html="prod.Title"></div>
                                <div class="m-po__details -infoSku">{{ prod.Sku }}</div>
                                <div v-if="prod.UnitOfMeasureType" class="m-po__details -infoDivisor">|</div>
                                <div v-if="prod.UnitOfMeasureType" class="m-po__details -infoSize">
                                    <div class="m-po__details -infoSize-title">
                                        {{ localization.Labels.Size }}:
                                    </div>
                                    <div class="m-po__details -infoSize-value">
                                        {{ prod.UnitOfMeasureValue }} {{ prod.UnitOfMeasureType }}
                                    </div>
                                </div>
                                <ul
                                    v-if="prod.SelectionOptions && prod.SelectionOptions.length > 0 && !hideVerboseProductDetails"
                                    class="m-po__details -infoFacets"
                                    :class="{ '-allVisible': expandedItems.includes(i) }">

                                    <li
                                        v-for="(product, prodIndex) in prod.SelectionOptions"
                                        :key="product.Value + '-' + prodIndex">

                                        {{ product.Title ? `${product.Title}:` : '' }} {{ product.Value }}
                                    </li>
                                </ul>
                                <button
                                    v-if="prod.SelectionOptions && prod.SelectionOptions.length > 6"
                                    type="button" class="m-po__readMore"
                                    :class="{ 'w-full text-left' : isCn }"
                                    @click="setExpandedItems(i)">
                                    {{ expandedItems.includes(i) ? localization.Labels.ReadLess : localization.Labels.ReadMore }}
                                </button>
                                <!-- Accessories -->
                                <ul v-if="!isCn && prod.Accessories && prod.Accessories.length" class="mt-20 mb-15 md:mb-0">
                                    <li
                                        v-for="product in prod.Accessories"
                                        :key="product.Sku"
                                        class="text-sm font-thin">
                                        <span v-html="accessoryLabel(product)"></span>
                                        <o-shelf-configurator
                                            class="'text-green font-medium underline"
                                            :sku="product.Sku"
                                            :family-id="prod.FamilyId">
                                            {{ localization.Labels.AddToCart }}
                                        </o-shelf-configurator>
                                    </li>
                                </ul>
                                <ul v-else-if="isCn && prod.Accessories && prod.Accessories.length" class="mt-20 mb-15 w-full md:mb-0">
                                    <li
                                        v-for="product in prod.Accessories"
                                        :key="product.Sku"
                                        class="text-sm font-normal">
                                        {{ localization.Labels.NeedA }}<span>{{ product.ProductName }}?</span>
                                        <o-shelf-configurator
                                            class="text-green font-bold underline'"
                                            :sku="product.Sku"
                                            :family-id="prod.FamilyId">
                                            {{ localization.Labels.AddToCart }}
                                        </o-shelf-configurator>
                                    </li>
                                </ul>
                            </div>

                            <div v-if="showPointsPrice(prod)" class="m-po__details -pointsPrice">
                                <div v-if="viewPoints" class="m-po__details -points">
                                    {{ getPoints(prod) }} {{ localization.Labels.PointsAbbreviated }}
                                </div>
                                <div v-if="viewPoints" class="m-po__details -divisor">|</div>
                                <div class="m-po__details -price">{{ getPrice(prod) }}</div>
                                <!--Price/Unit-EU specific -->
                                <PricePerUnit
                                    v-if="getPricePerUnit(prod.PriceRange, 'Concentrated', userFlags.ViewMemberPricing)"
                                    :label="localization.Labels.Concentrated"
                                    :price="getPricePerUnit(prod.PriceRange, 'Concentrated', userFlags.ViewMemberPricing)"
                                    :unit="prod.PriceRange.ConcentratedPPUMeasurementType"
                                    :tailwind-mods="`text-xs text-gray font-normal leading-tight min-w-full`"
                                />
                                <PricePerUnit
                                    v-if="getPricePerUnit(prod.PriceRange, 'Diluted', userFlags.ViewMemberPricing)"
                                    :label="localization.Labels.Diluted"
                                    :price="getPricePerUnit(prod.PriceRange, 'Diluted', userFlags.ViewMemberPricing)"
                                    :unit="prod.PriceRange.DilutedPPUMeasurementType"
                                    :tailwind-mods="`text-xs text-gray font-normal leading-tight min-w-full`"
                                />
                                <PricePerUnit
                                    v-if="getPricePerUnit(prod.PriceRange, 'Original', userFlags.ViewMemberPricing)"
                                    :price="getPricePerUnit(prod.PriceRange, 'Original', userFlags.ViewMemberPricing)"
                                    :unit="prod.PriceRange.OriginalPPUMeasurementType"
                                    :tailwind-mods="`text-xs text-gray font-normal min-w-full`"
                                />
                                <div v-if="isFreeProductReward(prod)" class="m-po__details -isFreeProductReward">
                                    {{ localization.Labels.FreeProductReward }}
                                </div>
                                <div v-if="isLSD(prod)" class="m-po__details -caption">
                                    {{ localization.Labels.LoyaltyShoppingDollarsUsed }}
                                </div>
                                <div v-if="isCC(prod)" class="m-po__details -caption">
                                    {{ localization.Labels.ConvenienceCertificateUsed }}
                                </div>
                                <div v-if="prod.IsRestrictedPack" class="m-po__details -memberOnly">
                                    {{ localization.Labels.MemberOnlyOffer }}
                                </div>
                            </div>
                            <div v-else class="m-po__details -pointsPrice">
                                <!-- Maintain spacing with empty div -->
                            </div>

                            <!-- Buy Again -->
                            <!-- prod.AdditionalLabel indicates whether the product was purchased as some type of promotional item (i.e. coupon, promo) -->
                            <!-- Show AdditionalLabel value instead of Buy Again if present. Exception is LSD or CC values -->
                            <div
                                v-if="showBuyAgain(prod)" class="m-po__details -buyAgain">
                                <div v-if="!canAddRestrictedPack(prod)" class="m-po__details -becomeMember">
                                    <div class="inline" v-html="localization.Labels.BecomeAMember" />
                                    <a v-if="localization.Data.PreferredMemberLink" class="m-po__details -learnMore" :href="localization.Data.PreferredMemberLink.Url" :target=" localization.Data.PreferredMemberLink.Target">
                                        {{ localization.Data.PreferredMemberLink.Text }}
                                    </a>
                                </div>
                                <template v-else-if="loadingInventory">
                                    <a-loading-spinner :visible="true" aria-hidden="true" size="sm" />
                                </template>
                                <template v-else-if="showNextOrderMessage(prod)">
                                    <span class="m-po__details -nextOrder">{{ nextOrderDisplay(prod) }}</span>
                                </template>
                                <template v-else-if="showOffSaleOrBuyAgain(prod)">
                                    <span v-if="offSaleDisplay(prod)">
                                        {{ offSaleDisplay(prod) }}
                                    </span>
                                    <o-shelf-configurator
                                        v-else-if="canAddPromotionProduct(prod)"
                                        class="a-button -white"
                                        :sku="prod.Sku"
                                        :button-label="prodAriaLabel(localization.Labels.BuyAgainAriaLabel, prod.Title)"
                                        :family-id="prod.FamilyId"
                                        :pre-selected-configurations="prod.ConfigurationSkus">
                                        {{ localization.Labels.BuyAgain }}
                                    </o-shelf-configurator>
                                </template>
                            </div>
                            <div v-else-if="showAdditionalLabel(prod)" class="m-po__details -buyAgain">
                                <p v-html="prod.AdditionalLabel"></p>
                            </div>
                            <div v-else class="m-po__details -buyAgain">
                                <!-- Maintain spacing with empty div -->
                            </div>
                            <div
                                v-if="showAddList(prod)"
                                class="m-po__details -secMenu">
                                <!-- Display Add to List button if order is able to be added to list and item is NOT off sale-->
                                <m-shoplists-add-item
                                    v-if="!prod.IsPermanentlyUnavailable && userFlags.ViewLists && canAddPromotionProduct(prod)"
                                    class="m-po__details -addList"
                                    :aria-label-cta="prodAriaLabel(localization.Labels.AddToListAriaLabel, prod.Title)"
                                    :is-shelf="true"
                                    :is-order-history="true"
                                    :is-preferred="userFlags.ViewMemberPricing"
                                    :pre-selected-configurations="prod.ConfigurationSkus"
                                    :product="prod">
                                    <template v-slot:icon>
                                        <span class="material-icons" aria-hidden="true">playlist_add</span>
                                    </template>
                                </m-shoplists-add-item>
                            </div>
                            <div v-else class="m-po__details -secMenu">
                                <!-- Maintain spacing with empty div -->
                            </div>
                        </li>
                        <!-- End product list -->
                    </ol>
                </div>

            </accordion>
            <div v-else class="m-po__limitedWrapper">
                <span class="m-po__wrapperTitle ">
                    <span class="m-po__first-title font-medium" v-html="localization.Data.Title || title"></span>
                    <span v-if="!isCn" class="m-po__sec-title" v-html="orderStatusString || secondTitle">
                    </span>
                </span>
            </div>
        </div>

        <!-- Show loading while is adding an order to Cart or BUO -->
        <div v-if="listAdding" class="m-po__loading">
            <a-loading-spinner :visible="true" aria-hidden="true" />
        </div>

        <!-- Iframe used on Print Order -->
        <iframe
            v-if="showIframe"
            :id="`receiptId-${pastOrder.OrderNumber}`"
            :ref="`receiptId-${pastOrder.OrderNumber}`"
            target="_blank"
            :src="localization.Data.ReceiptPage.Url + '?orderId=' + pastOrder.OrderNumber"
            sandbox="allow-scripts allow-modals allow-same-origin"
            width="0"
            height="0"
            frameborder="0"
            tabindex="-1">
        </iframe>
    </div>
</template>

<script>
    import compareDates from '../../../utils/compare-dates';
    import { getPricePerUnit } from '../../../utils/get-price-per-unit';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import togglePopUpMixin from '../../../mixins/toggle-popup';
    import shoplistsModalMixin from '../../../mixins/shopping-lists-modal';
    import { mapState } from 'vuex';
    import envSoldOut from '../../../mixins/env'; // sets the domain (when necessary)
    import soldOutApi from '@api/routes/products';
    import cancelOrderApi from '@api/routes/cancelorder';
    import orderTakenBy from '@common/source/js/utils/order-taken-by';
    import PricePerUnit from '../../00-atoms/price-per-unit/price-per-unit.vue';

    // mock obj data
    const pastOrder = {
        CanAddToBuo: true,
        CanAddToCart: true,
        CanAddToList: true,
        OrderDate: '',
        OrderDateString: '',
        OrderId: 0,
        OrderNumber: '',
        OrderType: '',
        OrderEntryDate: '',
        OrderTotal: 0,
        OrderTotalFormatted: '$0',
        TotalPoints: 0,
        OrderStatus: '',
        ShipToName: '',
        ShipToAddress: {
            Address1: '',
            Address2: '',
            AddressReferences: '',
            DeliveryInstructions: '',
            CompanyNameOrAttention: '',
            Suburb: '',
            City: '',
            State: '',
            PostalCode: '',
            Country: '',
            NameOnAddress: '',
            IsDefault: true,
            AddressType: ''
        },
        PreferredMemberSavings: 0,
        PreferredMemberSavingsFormatted: '$0',
        PackageInformation: [
            {
                TrackingNumber: '',
                Carrier: '',
                TrackingUrl: null,
                EstimatedArrivalDateFrom: '/',
                EstimatedArrivalDateFromString: '',
                EstimatedArrivalDateTo: '/',
                EstimatedArrivalDateToString: '',
                DeliveredDate: '',
                DeliveredDateString: '',
                Items: [
                    {
                        Sku: '',
                        Quantity: 0,
                        LineType: '',
                        Price: 0,
                        Points: 0,
                        Title: '',
                        UnitOfMeasureType: '',
                        UnitOfMeasureValue: 0,
                        Image: {
                            Url: '',
                            Alt: ''
                        },
                        PackDetails: [
                            {
                                FeatureSku: '0',
                                SelectionSku: '0',
                                FeatureConfigProductName: null,
                                ProductOptionName: null
                            },
                            {
                                FeatureSku: '0',
                                SelectionSku: '0',
                                FeatureConfigProductName: null,
                                ProductOptionName: null
                            }
                        ],
                        Accessories: []
                    }
                ]
            }
        ]
    };
    const localization = {
        'Labels': {
            'AddOrderToCart': 'Add order to Cart',
            'AddToCart': 'Add to Cart',
            'AddToList': 'Add To List',
            'All': 'All',
            'Arrived': 'Arrived',
            'BacktoTop': 'Back to Top',
            'BuyAgain': 'Buy Again',
            'CancelOrder': 'Cancel Order',
            'ConvenienceCertificateUsed': 'Convenience Certificate Used',
            'Item': 'Item',
            'Items': 'Items',
            'Loading': 'Loading',
            'LoadMore': 'Load More',
            'LoyaltyShoppingDollarsUsed': 'Loyalty Shopping Dollars Used',
            'MakeThisMyBackupOrder': 'Make This My Backup Order',
            'MakeThisMyBackupOrderAriaLabel': 'Make this order {0} my backup order',
            'MostRecent': 'Most Recent',
            'NeedA': 'Need A',
            'NoOrderHistory': 'No Orders',
            'NoRecentOrders': 'No Recent Orders',
            'OrderDate': 'Order Date',
            'OrderNumber': 'Order #',
            'OrderStatusCancelled': 'Cancelled',
            'OrderStatusDelivered': 'Delivered',
            'OrderStatusPending': 'Pending',
            'OrderStatusProcessed': 'Processed',
            'OrderStatusProcessing': 'Processing',
            'OrderStatusShipped': 'Shipped',
            'OrderStatusNoOrders': 'Order Status No Orders',
            'OrderStatusEstimatedDeliveryText': 'Estimated Delivery',
            'OrderStatusDetailText': 'Order Status',
            'Pay': 'Pay',
            'Points': 'Points',
            'PointsAbbreviated': 'pts',
            'PreferredSavings': 'Preferred Savings',
            'PreshipArrivalDateInfo': 'Please allow<strong>24-48<strong> hours to track your order',
            'PrintOrderHistory': 'Print Order History',
            'QuantityAbbreviated': 'Qty.',
            'Regular': 'Regular',
            'ReturnItems': 'Return Items',
            'SaveThisOrder': 'SAVE this order',
            'ScreenReaderClosePopupMenu': 'Close Popup Menu',
            'ScreenReaderSecondaryMenu': 'Secondary Menu',
            'SearchBy': 'Search by product name and item #',
            'SeeDetails': 'Once you place an order, you can see the details here.',
            'SeeFullOrderReceipt': 'See Full Order Receipt',
            'SeeFullOrderReceiptAriaLabel': 'See Full Order Receipt for order number {0}',
            'ShipTo': 'Ship To',
            'Showing': 'Showing',
            'Size': 'Size',
            'SortBy': 'Sort By',
            'Total': 'Total',
            'Track': 'Track',
            'TrackingNumber': 'Tracking Number',
            'YourOrders': 'Your Orders',
            'BackDatedTooltip': 'This order was applied to {0}'
        },
        'Data': {
            'ReturnItemsLink': {
                'Url': '',
                'Text': '',
                'Target': ''
            },
            'OrderReceiptQueryString': 'orderid',
            'HideShippingAddress': true,
            'HideVerboseProductDetails': false,
            'HideProductCtas': false,
            'HideOrderLinks': false,
            'IsShippingCrossCountry': false,
            'ListsPage': {
                'Url': '//localhost:3030/patterns/03-pages-my-account-my-account-shopping-lists/03-pages-my-account-my-account-shopping-lists.rendered.html',
                'Title': ''
            },
            'CartPage': {
                'Url': '//localhost:3030/patterns/03-pages-cart-cart/03-pages-cart-cart.rendered.html',
                'Title': ''
            },
            'BuoPage': {
                'Url': '//localhost:3030/patterns/03-pages-my-account-custom-backup-order/03-pages-my-account-custom-backup-order.rendered.html',
                'Title': ''
            },
            'ReceiptPage': {
                'Url': '//localhost:3030/patterns/03-pages-receipt-receipt/03-pages-receipt-receipt.rendered.html',
                'Title': ''
            },
            'PayLink': {
                'Url': '//localhost:3030/patterns/03-pages-receipt-receipt/03-pages-receipt-receipt.rendered.html',
                'Title': ''
            }
        },
        'Id': '321cbc91-812e-4548-84a7-247dab9f1380'
    };

    export default {
        name: 'PastOrder',
        components: {
            PricePerUnit
        },
        mixins: [ togglePopUpMixin, shoplistsModalMixin, envSoldOut],

        props: {
            addToListIcon: {
                type: String,
                default: '//cdnsc1.melaleuca.com/na/images/common/icon-add-to-list.svg'
            },
            arrowSize: {
                type: String,
                default: '-md-ld'
            },
            buttonClasses: {
                type: String,
                default: 'flex justify-center w-120 h-30'
            },
            canAddToBackupOrder: {
                type: Boolean,
                default: false
            },
            contentId: {
                type: String,
                default: 'content-'
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isLimitOrderHistory: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default: () => localization
            },
            modArrow: {
                type: String,
                default: 'mt-2 ml-auto'
            },
            modContent: {
                type: String,
                default: ''
            },
            modFirstTitle: {
                type: String,
                default: 'm-po__first-title'
            },
            modFirstTitleForPending: {
                type: String,
                default: 'm-po__first-title -pending'
            },
            modSecondTitle: {
                type: String,
                default: 'm-po__sec-title'
            },
            modThirdTitle: {
                type: String,
                default: 'm-po__third-title'
            },
            modToggler: {
                type: String,
                default: 'm-po__accordionTogler'
            },
            modWrapperTitle: {
                type: String,
                default: 'm-po__wrapperTitle'
            },
            pastOrder: {
                type: Object,
                default: () => pastOrder
            },
            pastOrderIndex: {
                type: Number,
                default: 0
            },
            secondTitle: {
                type: String,
                default: ''
            },
            showGui: {
                type: Boolean,
                default: false
            },
            showTrackingNumberForNoUrl: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: 'Loading...'
            },
            thirdTitle: {
                type: String,
                default: 'See Full Order Receipt'
            },
            thirdTitleAriaLabel: {
                type: String,
                default: ''
            },
            toggleId: {
                type: String,
                default: 'toggleId'
            },
            useAltTrackingNumber: {
                type: Boolean,
                default: false
            },
            wrapperMods: {
                type: String,
                default: ''
            },
            yearOrder: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                isPassed90Days: null,
                itensQty: 0,
                orderStatusString: '',
                trackNumbers: [],
                trackUrls: [],
                modalAddItems: 'modal-add-items-result',
                modalAddList: 'modal-add-list',
                gtmId: 180,
                country: this.$env.Country ? this.$env.Country : 'UnitedStates',
                loadingInventory: false,
                inventoryData: [],
                isOpen: false,
                isPrintingReceipt: false,
                printingReceiptLoaded: false,
                expandedItems: []
            };
        },
        computed: {
            ...mapState('pastOrders', ['userFlags', 'alternateTrackingUrl', 'hideTrackingLink']),

            addCartbuttonClasses() {
                return !this.isCn ? this.buttonClasses : this.buttonClasses + ' w-150 bg-white text-green border-1 border-green cursor-pointer';
            },
            cancelledOrders() {
                return this.isCn && this.pastOrder.OrderStatus === 'Cancelled';
            },
            formattedOrderEntryDate() {
                const orderDate = new Date(this.pastOrder.OrderEntryDate);
                return !this.isCn ? this.pastOrder.FormattedOrderEntryDate : orderDate.getFullYear() + '-' + (orderDate.getMonth() + 1) + '-' + orderDate.getDate();
            },
            hasGuiData() {
                return this.pastOrder?.Guis?.length;
            },
            hideMakeThisMyBackupOrder() {
                return this.localization.Data?.HideMakeThisMyBackupOrder;
            },
            // Option to hide specific sections only if order is Home Security or Infoguard (OrderSubType === true)
            hideShippingAddressHeader() {
                return this.pastOrder.OrderSubType && this.pastOrder.HideShippingAddress;
            },

            hideVerboseProductDetails() {
                return this.pastOrder.OrderSubType && this.pastOrder.HideVerboseProductDetails;
            },

            hideProductCtas() {
                return this.pastOrder.OrderSubType && this.pastOrder.HideProductCtas;
            },

            hideOrderLinks() {
                return (this.pastOrder.OrderSubType && this.pastOrder.HideOrderLinks);
            },
            hideSkus(sku) {
                const skusToHide = [4050, 9918, 9919, 9921, 9924];
                return skusToHide.includes(sku);
            },
            isRiverbendOrder() {
                return /riverbend/i.test(this.pastOrder?.OrderType);
            },
            makeThisMyBackupOrderAriaLabel() {
                return this.localization?.Labels?.MakeThisMyBackupOrderAriaLabel?.replace('{0}', this.pastOrder.OrderNumber) || localization.Labels.MakeThisMyBackupOrderAriaLabel.replace('{0}', this.pastOrder.OrderNumber);
            },
            pendingOrders() {
                return this.pastOrder.OrderStatus === 'Pending';
            },
            processingOrders() {
                return this.isCn && this.pastOrder.OrderStatus === 'Processing';
            },
            processedOrders() {
                return this.isCn && this.pastOrder.OrderStatus === 'Processed';
            },
            fourDayDirectDebitOrder() {
                return this.pastOrder.OrderStatus === 'FourDayHoldDirectDebit';
            },
            paybuttonClasses() {
                return !this.isCn ? this.buttonClasses : this.buttonClasses + ' cursor-pointer -paybtn';
            },
            paybuttonLink() {
                return this.localization.Data?.PayLink?.Url + '?orderNumber=' + this.pastOrder.OrderNumber;
            },
            pendingTitle() {
                return this.pendingOrders ? this.modFirstTitleForPending : this.modFirstTitle;
            },
            preferedClass() {
                if(this.isCn) {
                    const preferedColStyle = this.viewPoints ? '-col-md-3' : '-col-md-4';
                    return `${preferedColStyle} -isCn`;
                } else if(this.viewPoints) {
                    return '-col-md-2 -col-lg-2';
                } else {
                    return '-col-md-2 -col-lg-3';
                }
            },
            preferedTitle() {
                const isMobile = (navigator.userAgent.toLowerCase().match(/mobile/i)) && (window.innerWidth <= 767);
                let totalLabel = isMobile ? this.localization.Labels.Total : this.localization.Labels.Total;
                return this.isCn ? totalLabel : this.localization.Labels.PreferredSavings;
            },
            preferedValue() {
                return this.isCn ? this.pastOrder.OrderTotalFormatted + ' (' + this.localization.Labels.PreferredSavings + this.pastOrder.PreferredMemberSavingsFormatted + ')' : this.pastOrder.PreferredMemberSavingsFormatted;
            },
            receiptUrl() {
                return this.isRiverbendOrder ? this.localization.Data.RiverbendReceiptPage.Url + '?orderId=' + this.pastOrder.OrderNumber : this.localization.Data.ReceiptPage.Url + '?orderId=' + this.pastOrder.OrderNumber;
            },
            returnedOrders() {
                return this.isCn && this.pastOrder.OrderStatus === 'Returned';
            },
            shippingOrders() {
                return this.isCn && this.pastOrder.OrderStatus === 'Shipped';
            },
            showMakeBackupOrder() {
                if(this.hideMakeThisMyBackupOrder) return false;

                return !this.localization?.Data?.IsShippingCrossCountry &&
                    this.pastOrder.ProcessedProductOrder &&
                    this.canAddToBackupOrder &&
                    !this.isRiverbendOrder;
            },
            showTrackButton() {
                // Track button URL is generated differently when useAltTrackingNumber is true, using the TrackPage.Url instead of TrackingUrl in Package Information
                if(this.useAltTrackingNumber && (!this.alternateTrackingUrl && !this.localization.Data?.TrackPage.Url)) return false;
                // Hide the button if there's a tracking number and the flag is on (trackNumbers.length equals 2, including 'Track' at index 0).
                if(this.trackNumbers.length <= 2 && this.showTrackingNumberForNoUrl && !this.useAltTrackingNumber) return false;
                return true;
            },
            showIframe() {
                return this.localization?.Data?.ReceiptPage?.Url && this.isPrintingReceipt;
            },
            showAddItemToCartBtn() {
                return ((!this.isCn && this.localization?.Data?.IsShippingCrossCountry === false && this.pastOrder?.ProcessedProductOrder && this.pastOrder?.CanAddToCart) || (this.isCn && (this.pastOrder?.OrderStatus !== 'Processing' && this.pastOrder?.OrderStatus !== 'Cancelled'))) && !this.isRiverbendOrder;
            },
            showCancelButton() {
                if(this.localization?.Data?.CanCancel30MinuteWindow && this.pastOrder.CanBeCancel) { return true; }
                return this.pendingOrders && this.pastOrder.CanBeCancel && !this.hideOrderLinks;
            },
            showGuiInfo() {
                return this.isLimitOrderHistory;
            },
            showPayButton() {
                let flag = false;
                if(this.isCn && this.pastOrder.OrderType === 'BackupOrder') {
                    flag = this.pastOrder.Payments.some((payment) => {
                        return payment.Balance > 0;
                    });
                } else {
                    flag = this.pastOrder.Payments.some((payment) => {
                        return payment.PaymethodType === 'VirtualCreditCard' && payment.Balance > 0;
                    });
                }
                return flag;
            },
            showSaveThisOrder() {
                return this.userFlags?.ViewLists && this.pastOrder?.ProcessedProductOrder && this.pastOrder?.CanAddToList && !this.hideOrderLinks && !this.isRiverbendOrder;
            },
            viewPoints() {
                return this.userFlags?.ViewPoints && !this.pastOrder.HideOrderHistoryProductPoints;
            }
        },
        watch: {
            isLoaded: {
                handler: 'infosOrder',
                immediate: true
            }
        },
        mounted() {
            // Track order select button
            if(!this.showTrackingNumberForNoUrl) {
                this.$el.onchange = (event) => {
                    if(event.target.classList.contains('a-select__field')) {
                        this.openUrl(event.target.value);
                        this.$refs['trackButton'].selectedVal = this.localization.Labels.Track;
                    }
                };
            }
        },
        methods: {
            getPricePerUnit,
            replaceToken,
            accessoryLabel(product) {
                // Bug 95652
                const label = this.localization?.Labels?.NeedA;
                const productName = '<em>' + product?.ProductName + '</em>';
                const questionMark = '?';
                if(label?.includes('{0}')) {
                    return this.replaceToken(label, productName);
                } else {
                    return label + ' ' + productName + ' ' + questionMark;
                }
            },
            canAddRestrictedPack(prod) {
                return prod.IsRestrictedPack ? this.userFlags.CanPurchaseRestrictedPacks : true;
            },

            async cancelOrder(orderNumber) {
                if(orderNumber) {
                    const res = await cancelOrderApi.post({ orderNumber: orderNumber, networkId: orderTakenBy()});
                    if(res.success) {
                        if(res.data) {
                            this.$modal.hide({id: 'cancel-modal'});
                            location.reload();
                            return true;
                        }
                    } else {
                        console.log('[CancelOrder] inventory response =>', res.error);
                        this.$modal.hide({id: 'cancel-modal'});
                        return false;
                    }
                }
            },
            closeNoTracking() {
                this.$modal.hide({id: 'no-tracking-modal'});
            },
            closeCancel() {
                this.$modal.hide({id: 'cancel-modal'});
            },
            focusReturn() {
                const secondaryButton = document.querySelectorAll('.m-po__more.-btn')[this.pastOrderIndex];
                secondaryButton.focus();
            },

            getPoints(prod) {
                let points = prod.PriceRange?.MinPoints || prod.Points.toString();
                if(this.isCn) {
                    points = prod.Points.toString() || prod.PriceRange?.MinPoints;
                }

                return points;
            },
            getPrice(prod) {
                let price = prod.PriceRange?.MinRegularPrice;

                if(this.isCn) {
                    if(prod.Quantity > 1) {
                        const signMoney = prod.FormattedPrice.replace(/[0-9,\\.]+/, '');
                        const unitPrice = Math.abs(parseFloat(prod.Price / prod.Quantity)).toFixed(2);
                        price = signMoney + unitPrice;
                    } else {
                        price = prod.FormattedPrice;
                    }
                } else {
                    if(this.userFlags.ViewMemberPricing) {
                        price = prod.PriceRange?.MinPreferredPrice;
                    }
                    if(this.isWelcomeGift(prod) || this.isFree(prod)) {
                        price = this.localization?.Labels?.Free;
                    }
                }

                return price;
            },
            hasWebTracking(track) {
                if(this.useAltTrackingNumber) {
                    return track.TrackingNumber;
                } else {
                    return track.TrackingNumber && track.TrackingUrl && !this.showTrackingNumberForNoUrl;
                }
            },
            hasNoWebTracking(track) {
                return track.TrackingNumber && this.showTrackingNumberForNoUrl;
            },
            infosOrder() {
                const pastOrderAPI = this.pastOrder;
                const pkgInfo = pastOrderAPI.PackageInformation;
                let deliveredStatus = '';
                this.itensQty = (pastOrderAPI.OrderItems) ? pastOrderAPI.OrderItems.length : 0;
                this.trackNumbers = [];
                this.trackUrls = [];
                this.trackNumbers.push(this.localization.Labels.Track);

                if(pkgInfo && pkgInfo.length) {
                    pkgInfo.map((element, index) => {
                        if(this.hasWebTracking(element)) {
                            const trackNumber = element.TrackingNumber;
                            this.trackNumbers.push(trackNumber);
                            // alternateTrackingUrl is currently only for NZ, and is from Order History api
                            const trackUrl = this.orderTrackingUrl(element);
                            this.trackUrls.push(trackUrl);
                        } else if(this.hasNoWebTracking(element)) {
                            const trackNumber = element.TrackingNumber;
                            this.trackNumbers.push(trackNumber);
                        }

                        // Order status string logic
                        const deliveredString = element.DeliveredDateString;
                        const itemOrItems = (this.itensQty > 1) ? this.localization.Labels.Items : this.localization.Labels.Item;

                        if(deliveredString) {
                            deliveredStatus = `| ${this.localization.Labels.Arrived}: <span class="font-bold text-black">${deliveredString}</span>`;
                        }

                        // Final string
                        this.orderStatusString = `<span class="italic">${this.itensQty} ${itemOrItems}</span> ${deliveredStatus}`;
                    });
                } else {
                    const itemOrItems = (this.itensQty > 1) ? this.localization.Labels.Items : this.localization.Labels.Item;
                    // Final string
                    this.orderStatusString = `<span class="italic">${this.itensQty} ${itemOrItems}</span>`;
                }
            },
            isExpanded(ref) {
                return String(this.$refs[ref]?.isVisible);
            },
            isLSD(prod) {
                return prod?.LineType && prod.LineType === 'LSD';
            },
            isCC(prod) {
                return prod?.LineType && prod.LineType === 'Certificate';
            },
            isFree(prod) {
                return prod?.PromotionGroup === 'ReactivationIncentive';
            },
            isFreeProductReward(prod) {
                return prod?.LineType && prod.LineType === 'WelcomeProgram';
            },
            isWelcomeGift(prod) {
                return prod?.GiftType === 'WelcomeGift';
            },
            openUrl(url) {
                const newWindow = window.open();

                // For built-in popup blockers (like Safari)
                if(newWindow === undefined || newWindow === null) {
                    alert('Please disable your popup blocker');
                }

                newWindow.location.href = url;
            },
            prodAriaLabel(ariaLabel, title) {
                return ariaLabel?.replace('{0}', title);
            },
            isTrackButtonShown(date, OrderStatus, packInfo, orderNumber) {
                try {
                    // First rule: if hideTrackingLink is true, don't show the button
                    if(this.hideTrackingLink) {
                        return false;
                    }

                    if(packInfo && packInfo.length) {
                        const isDateArrival = packInfo.map((el, i) => {
                            if(el.EstimatedArrivalDateFrom !== null || el.EstimatedArrivalDateFrom !== '') {
                                return true;
                            }
                        });

                        // Tracking Number && URL
                        // No check requried tracking URL in CN
                        // For NZ (useAltTrackingNumber = true), only tracking number should be passed
                        const hasTracking = (this.isCn ||
                            this.showTrackingNumberForNoUrl ||
                            this.useAltTrackingNumber)
                            ? packInfo.some(function (el) { return el.TrackingNumber; })
                            : packInfo.some(function (el) { return el.TrackingNumber && el.TrackingUrl; });

                        // How many days to show the Track Button: 90
                        // No check requried estimated arrival date in CN
                        if(OrderStatus === 'Shipped' && (this.isCn ? true : isDateArrival) && !compareDates(new Date(date), 90) && hasTracking) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                } catch (e) {
                    console.log('[pastOrder] isTrackButtonShown');
                    console.log(e);
                }
            },
            printReceipt() {
                this.isPrintingReceipt = true;
                this.printingReceiptLoaded = false;
                let timer = 0;

                // Wait for receipt page loading
                const interval = setInterval(() => {
                    // If 10 seconds has passed, then clear interval
                    if(timer >= 10000) {
                        clearInterval(interval);
                        this.printingReceiptLoaded = true;
                    } else {
                        const ifrm = this.$refs[`receiptId-${this.pastOrder.OrderNumber}`]?.contentWindow;

                        if(ifrm && ifrm?.document) {
                            const items = ifrm.document.querySelectorAll('.o-checkoutList__listItem');

                            // If iframe is loaded and receipt page endpoint is done
                            if(items && items?.length) {
                                clearInterval(interval);

                                this.printingReceiptLoaded = true;

                                const modal = ifrm.vApp?.$modal;
                                if(modal) {
                                    this.$nextTick(() => {
                                        modal.hide();
                                        setTimeout(() => { // waiting closing modal animation to finish.
                                            ifrm.focus();
                                            ifrm.print();
                                        }, 300);
                                    });
                                    return;
                                }
                                ifrm.focus();
                                ifrm.print();
                            }
                        }
                    }

                    timer = timer + 500;
                }, 500);
            },
            openCancelModal() {
                this.$modal.show({id: 'cancel-modal'});
            },
            openNoTrackingModal() {
                this.$modal.show({id: 'no-tracking-modal'});
            },
            orderTrackingUrl(track) {
                return this.useAltTrackingNumber ? this.alternateTrackingUrl + this.pastOrder.OrderNumber : track.TrackingUrl;
            },
            showAddList(prod) {
                return this.pastOrder?.CanAddToList && prod?.CanAddToCart && this.pastOrder?.ProcessedProductOrder && this.canAddRestrictedPack(prod) && !this.hideProductCtas && !this.isRiverbendOrder && !(this.isCn && prod?.Sku === '4050') && (this.isLSD(prod) || this.isCC(prod) || !this.showAdditionalLabel(prod)); // !(this.isCn && prod?.Sku === '4050') only for CN , the Sku is for "chunxiao" so does showBuyAgain
            },
            showAdditionalLabel(prod) {
                // Incase LSD or CC used is the value, do not show it instead show 'Buy Again' there if appicable by computing thru method showOffSaleOrBuyAgain
                return prod?.AdditionalLabel && !this.showAdditionalLabelUnderPointsAndPrice(prod);
            },
            showAdditionalLabelUnderPointsAndPrice(prod) {
                return this.isLSD(prod) || this.isCC(prod) || this.isFreeProductReward(prod);
            },
            showBuyAgain(prod) {
                const excludedSkus = ['9918', '9919', '9921', '9924'];
                return this.pastOrder?.CanAddToCart && prod?.CanAddToCart && this.pastOrder?.ProcessedProductOrder && this.isOpen && !this.hideProductCtas && !this.isRiverbendOrder && !(this.isCn && prod?.Sku === '4050') && !excludedSkus.includes(prod?.Sku) && !this.showAdditionalLabel(prod); // Excluded enrollment skus - which are one time charge
            },
            showNextOrderMessage(prod) {
                return this.isRiverbendOrder && prod?.InoItemMessage;
            },
            showOffSaleOrBuyAgain(prod) {
                return !this.loadingInventory && (this.showAdditionalLabelUnderPointsAndPrice(prod) || !prod.AdditionalLabel);
            },
            showPointsPrice(prod) {
                return this.pastOrder?.CanAddToCart && prod?.CanAddToCart && !this.hideVerboseProductDetails && !this.isRiverbendOrder;
            },
            showTips() {
                const isSFExpress = this.pastOrder.PackageInformation.every((packageInfo) => {
                    return packageInfo.Carrier === this.localization.Data.TrackCarrier;
                });

                if(!isSFExpress) {
                    this.openNoTrackingModal();
                } else {
                    window.location.href = this.alternateTrackingUrl + '?' + this.localization.Data.OrderReceiptQueryString + '=' + this.pastOrder.OrderNumber;
                }
            },

            goToReturnItems(event) {
                event.preventDefault();

                this.gtmTrackAction({id: this.gtmId}, event);

                if(this.localization?.Data?.ReturnItemsLink?.Url) {
                    window.open(this.localization.Data.ReturnItemsLink.Url, '_blank');
                }
            },
            async showProducts() {
                this.loadingInventory = true;
                this.isOpen = true;

                const warehouseGroup = window.dataLayer?.find(layer => layer.warehouseGroup)?.warehouseGroup || 'IdahoFalls';

                const skuQuery = this.pastOrder.OrderItems.filter(prod => prod.CanAddToCart);
                const skuParams = new URLSearchParams();

                skuQuery.forEach(prod => skuParams.append('skus', prod.Sku));
                skuParams.append('country', `${this.country}`);
                skuParams.append('warehouseGroup', warehouseGroup);

                if(skuQuery.length) {
                    const res = await soldOutApi.query(skuParams);

                    if(res.success) {
                        if(res.data && res.data.length && Array.isArray(res.data)) {
                            this.loadingInventory = false;
                            this.inventoryData = res.data;
                            return true;
                        }
                    } else {
                        console.log('[PastOrder] inventory response =>', res.error);
                        return false;
                    }
                }
            },
            nextOrderDisplay(prod) {
                if(prod?.InoItemMessage) {
                    return prod.InoItemMessage;
                } else {
                    return null;
                }
            },
            offSaleDisplay(prod) {
                let offsaleDisplay = '';

                if(prod.IsPermanentlyUnavailable) {
                    offsaleDisplay = prod.OffSaleTitle || 'Permanently OffSale Title Missing';
                } else {
                    const inventoryProd = this.inventoryData.find(prodSku => prodSku.sku === prod.Sku);
                    const isSoldOutLabel = this.localization?.Labels?.SoldOut || 'Sold Out Label Missing';

                    if(prod.IsErpDateValid) {
                        if(prod.IsOffSale) {
                            if(inventoryProd && inventoryProd.isInventoryControlled && inventoryProd.quantityAvailable <= 0) {
                                offsaleDisplay = prod.OffSaleTitle || 'OffSale Title Missing';
                            }
                        } else {
                            if(inventoryProd && inventoryProd.isInventoryControlled && inventoryProd.quantityAvailable <= 0) {
                                offsaleDisplay = isSoldOutLabel;
                            }
                        }
                    } else {
                        offsaleDisplay = prod.isOffSale ? prod.offSaleTitle : isSoldOutLabel;
                    }
                }

                return offsaleDisplay;
            },
            setExpandedItems(index) {
                if(!this.expandedItems.includes(index)) {
                    // Add to expanded list
                    this.expandedItems.push(index);
                } else {
                    // Remove from expanded list
                    this.expandedItems = this.expandedItems.filter(value => value !== index);
                }
            },
            canAddPromotionProduct(prod) {
                return this.isCn ? prod.LineType !== 'Promotion' : true;
            }
        }
    };
</script>
