<template>
    <div
        class="p-cart"
        :class="{'-isCnCart': isCn ,'-showImprovedCTACheckout': showImprovedCTACheckout}">
        <!-- Visa Credit card ad -->
        <div class="p-cart__ad -external mx-auto max-w-contain">
            <slot class="mx-auto max-w-contain" name="ad-top-banner" />
        </div>
        <div v-if="loading" class="p-cart__background">
            <div class="p-cart__loading">
                <a-loading-spinner :visible="loading" />
            </div>
        </div>

        <slot />

        <!-- Notice and banner used for CN -->
        <div v-if="isCn" ref="scrollTip" class="p-cart__banner md:hidden" :class="scrollTip">
            <o-cart-banner :banner="getLocalizationProp('Data.NoticeAndBanner', {})" :summary="summary" :shipping-fee="getLocalizationProp('Data.ShippingFee', {})"></o-cart-banner>
        </div>

        <div v-if="$slots['ad-variant-1']" class="p-cart__ad -external">
            <slot name="ad-variant-1" />
        </div>

        <div class="p-cart__container" :aria-live="!ready ? 'polite' : false">
            <div class="p-cart__header">
                <h1 class="p-cart__heading">
                    {{ getLocalizationProp('Data.CartShopping.PageTitle') }}
                </h1>

                <p v-if="!isEmpty && totalItems" class="p-cart__total">
                    {{ totalItems }}
                </p>
            </div>

            <div class="p-cart__link">
                <a
                    class="a-backLink"
                    :href="getLocalizationProp('Data.CartShopping.ContinueShoppingLink.Url')"
                    :target="getLocalizationProp('Data.CartShopping.ContinueShoppingLink.Target') || false">

                    <span class="a-backLink__icon" aria-hidden="true">navigate_before</span>
                    {{ getLocalizationProp('Data.CartShopping.ContinueShoppingLink.Text') }}
                </a>
            </div>

            <div v-if="ready" class="p-cart__content">
                <div class="p-cart__main">
                    <div v-if="!isEmpty" class="m-cartSumPrev">
                        <p class="m-cartSumPrev__subtotal">{{ getLocalizationProp('Labels.CartSummary.Subtotal') }} {{ summary.FormattedCartNetTotal }}</p>
                        <p v-if="!isCn" class="m-cartSumPrev__points">{{ summary.Points }} {{ getLocalizationProp('Labels.CartSummary.Points') }}</p>

                        <!-- Proceed to Checkout Button | using cart-attention-items as wrapper for handling non-AIF attention items -->
                        <m-cart-attention-items
                            ref="cart-attention-items"
                            :attention-items="attentionItems"
                            :disabled="loading"
                            :handler="proceedToCheckout"
                            :explicit-attention-items="explicitAttentionItems"
                            :should-fire-once="false">

                            <span v-html="getLocalizationProp('Data.CartSummary.CheckoutLink.Text')"></span>
                        </m-cart-attention-items>
                    </div>

                    <o-cart-point-summary
                        v-if="isPreferred && isCn"
                        class="md:hidden"
                        :labels="getLocalizationProp('Labels.PointSummary', {})"
                        :price-labels="getLocalizationProp('Data.PriceSummary', {})"
                        :enable-points-progress-bar="getLocalizationProp('Data.EnablePointsProgressBar', false)"
                        :lvip-popup="getLocalizationProp('Data.LvipPopup.RTEContent')"
                        :earned-points="summary.Points"
                        :has-max-service-points="hasMaxServicePoints"
                        :is-cn="isCn"
                        :max-points="monthlyPointCommitment"
                        :previous-order-points="pointsEarnedInCurrentMonth"
                        :member-services-points="pointsEarnedViaServicesInCurrentMonth"
                        :member-products-points="pointsEarnedViaProductsInCurrentMonth"
                        @lvipPopupModal="lvipPopupModal" />

                    <!-- Notice and banner used for CN -->
                    <div v-if="isCn" ref="scrollTip" class="md:hidden"></div>
                    <div v-if="isCn" class="p-cart__banner md:hidden" :class="scrollTip">
                        <o-cart-banner :banner="getLocalizationProp('Data.NoticeAndBanner', {})" :summary="summary" :shipping-fee="getLocalizationProp('Data.ShippingFee', {})" :is-preferred="isPreferred"></o-cart-banner>
                    </div>

                    <div>
                        <m-shipping-on-us
                            v-if="summary.ShippingOnUsEnabled && summary.Points > 0 && shippingConfigId"
                            ref="shipping-on-us"
                            :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                            :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                            :shipping-config-id="shippingConfigId"
                        ></m-shipping-on-us>
                        <m-cart-shipping-on-us-banner
                            v-else-if="freeShippingEnabled"
                            :sou-feature-on="freeShippingEnabled && summary.Points > 0"
                            :current-offer="freeShippingCurrentOffer"
                            :available-offers="freeShippingAvailableOffers"
                            :labels="getLocalizationProp('Labels.ShippingOnUs')"
                        ></m-cart-shipping-on-us-banner>
                        <m-cart-shipping-on-us-banner
                            v-else
                            :sou-feature-on="summary.ShippingOnUsEnabled && summary.Points > 0"
                            :current-offer="shippingOnUsCurrentOffer"
                            :available-offers="shippingOnUsAvailableOffers"
                            :labels="getLocalizationProp('Labels.ShippingOnUs')"
                        ></m-cart-shipping-on-us-banner>
                    </div>

                    <div v-if="!enableLSDSummaryEnhancement &&isCn && totalLsdBalance && !loading" class="text-xl text-green font-bold block relative -mt-30 md:hidden">
                        <p role="text">
                            <span v-if="totalLsdBalance" class="block mb-10" v-html="totalLsdDollars"></span>
                        </p>
                    </div>
                    <div v-if="enableLSDSummaryEnhancement && isCn && lsdAvailableToSpend && !loading" class="text-xl text-green font-bold block relative -mt-30 md:hidden">
                        <p role="text">
                            <span v-if="lsdAvailableToSpend" class="block mb-10" v-html="totalLsdDollars"></span>
                        </p>
                    </div>

                    <div v-if="$slots['ad-variant-2']" class="p-cart__ad">
                        <slot name="ad-variant-2" />
                    </div>
                    <div v-if="additionalContent" class="border-1 border-gray-50 bg-white rounded p-10 mb-40">
                        <p v-html="additionalContent"></p>
                    </div>

                    <template v-if="!isEmpty">
                        <o-cart-item
                            v-for="(item, index) in items"
                            :key="`${item.Sku}-${index}`"
                            :additional-label="item.AdditionalLabel"
                            :ad-context="item.Context"
                            :ad-family-id="item.FamilyIdToAdd"
                            :ad-sku="item.SkuToAdd"
                            :ad-type="item.AdType"
                            :brand="item.Brand"
                            :category="item.Category"
                            :configurations="item.Configurations"
                            :family-id="item.FamilyId"
                            :has-configurations="item.IsConfigurable"
                            :img-alt="item.Image ? (item.Image.Alt !== item.Title ? item.Image.Alt : '' ) : ''"
                            :img-src="item.Image ? item.Image.Url : ''"
                            :ino="item.InNextOrderId"
                            :ino-localization="inoLocalization"
                            :is-authenticated-guests="isAuthenticatedGuests"
                            :is-authenticated-non-intent-to-preferred="isAuthenticatedNonIntentToPreferred"
                            :is-cn="isCn"
                            :is-delete-disabled="item.IsDeleteDisabled"
                            :is-removed="item.IsRemoved"
                            :is-saved="item.IsSaved"
                            :is-unauthenticated-visitors="isUnauthenticatedVisitors"
                            :item-removed-label="getLocalizationProp('Labels.CartItem.ItemRemoved')"
                            :line-id="item.LineId"
                            :line-type="item.LineType"
                            :lsd-cc-qty-lmt-modal-labels="getLocalizationProp('Labels.LsdCcQtyLmtModal')"
                            :pdp-url="item.PdpUrl"
                            :position="item.Position"
                            :price="item.Price"
                            :price-range="item.PriceRange"
                            :promotion-id="item.PromotionId"
                            :quantity="item.Quantity"
                            :quantity-until-cc-limit="item.QuantityUntilCcLimit"
                            :quantity-until-lsd-limit="item.QuantityUntilLsdLimit"
                            :script-id="scriptId"
                            :show-ad="item.ShowAd"
                            :sku="item.Sku"
                            :stamp="item.Stamp"
                            :title="item.Title"
                            :user-flags="userFlags"
                            :variant="item.Variant"
                            :upsell="findUpsell(item.LineId)"
                            @openLsdOnlyOneProdModal="openLsdOnlyOneProdModal">

                            <template v-slot:info>
                                <span v-if="!item.HiddenSku">{{ getLocalizationProp('Labels.CartItem.Item') }} {{ item.Sku }} | </span>
                                {{ item.PriceRange.MaxPreferredPrice }} {{ getLocalizationProp('Labels.CartItem.Preferred') }}
                                <span v-if="item.PriceRange.OriginalPreferredPricePerUnit"> |
                                    <PricePerUnit
                                        :price="item.PriceRange.OriginalPreferredPricePerUnit"
                                        :unit="item.PriceRange.OriginalPPUMeasurementType"
                                        :tailwind-mods="`inline`"
                                    />
                                </span>
                                <span v-if="showInfoPoints"> | {{ item.PriceRange.MinPoints }} {{ getLocalizationProp('Labels.CartItem.Points') }}
                                </span>
                                <br />
                                <span
                                    v-if="item.PriceRange.ConcentratedPreferredPricePerUnit &&
                                        item.PriceRange.DilutedPreferredPricePerUnit" class="block md:flex">
                                    <PricePerUnit
                                        :label="getLocalizationProp('Labels.Concentrated')"
                                        :price="item.PriceRange.ConcentratedPreferredPricePerUnit"
                                        :unit="item.PriceRange.ConcentratedPPUMeasurementType"
                                    />
                                    <span class="hidden md:block">&nbsp;|&nbsp;</span>
                                    <PricePerUnit
                                        :label="getLocalizationProp('Labels.Diluted')"
                                        :price="item.PriceRange.DilutedPreferredPricePerUnit"
                                        :unit="item.PriceRange.DilutedPPUMeasurementType"
                                    />
                                </span>
                                <span v-if="item.IsRestrictedPack">
                                    {{ getLocalizationProp('Labels.CartItem.MemberOnlyOffer', 'Member-only') }}
                                </span>
                                <span v-else>
                                    {{ item.PriceRange.MaxRegularPrice }} {{ getLocalizationProp('Labels.CartItem.Regular') }}
                                    <span v-if="item.PriceRange.OriginalRegularPricePerUnit"> |
                                        <PricePerUnit
                                            :price="item.PriceRange.OriginalRegularPricePerUnit"
                                            :unit="item.PriceRange.OriginalPPUMeasurementType"
                                            :tailwind-mods="`inline`"
                                        />
                                    </span>
                                    <span v-if="!isAuthenticatedGuests && !isAuthenticatedNonIntentToPreferred && !isUnauthenticatedVisitors"> | {{ item.PriceRange.PreferredMemberSavings }} {{ getLocalizationProp('Labels.CartItem.Savings') }}</span>
                                    <span
                                        v-if="item.PriceRange.ConcentratedRegularPricePerUnit &&
                                            item.PriceRange.DilutedRegularPricePerUnit" class="block md:flex">
                                        <PricePerUnit
                                            :label="getLocalizationProp('Labels.Concentrated')"
                                            :price="item.PriceRange.ConcentratedRegularPricePerUnit"
                                            :unit="item.PriceRange.ConcentratedPPUMeasurementType"
                                        />
                                        <span class="hidden md:block">&nbsp;|&nbsp;</span>
                                        <PricePerUnit
                                            :label="getLocalizationProp('Labels.Diluted')"
                                            :price="item.PriceRange.DilutedRegularPricePerUnit"
                                            :unit="item.PriceRange.DilutedPPUMeasurementType"
                                        />
                                    </span>
                                </span>
                            </template>

                            <template v-slot:configurations>

                                <ul v-if="item.SelectionOptions && item.SelectionOptions.length > 0">
                                    <li
                                        v-for="(option, i) in item.SelectionOptions"
                                        :key="i"
                                        class="pr-5"
                                        :class="{'hidden':i > 5 && !item.showSelectionOptions}">
                                        {{ option.Title ? `${option.Title}: ` : '' }}{{ option.Value }}
                                    </li>
                                    <li v-if="item.SelectionOptions.length > 6">
                                        <button
                                            class="o-cartItem__link inline"
                                            :class="{'-showMore': isCn}"
                                            @click="toggleSelectionOptions(item)"
                                        >
                                            <span v-if="isCn">{{ item.showSelectionOptions ? getLocalizationProp('Labels.CartItem.HideSelectionOptions','Hide') : getLocalizationProp('Labels.CartItem.ShowSelectionOptions','Show More') }}</span>
                                            <span v-else class="p-cart__readMore">{{ item.showSelectionOptions ? getLocalizationProp('Labels.CartItem.ReadLess','ReadLess') : getLocalizationProp('Labels.CartItem.ReadMore','ReadMore') }}</span>
                                        </button>
                                    </li>
                                </ul>

                            </template>

                            <template
                                v-if="item.IsEditable && !item.IsDeleteDisabled"
                                v-slot:edit>
                                <span aria-hidden="true">{{ getLocalizationProp('Labels.CartItem.Edit') }}</span>
                                <span class="sr-only">{{ replaceToken(getLocalizationProp('Labels.CartItem.EditAriaLabel'), item.Title) }}</span>
                            </template>

                            <template v-slot:price>
                                <span v-if="showFree(item)">
                                    {{ getLocalizationProp('Labels.CartItem.Free','FREE') }}
                                </span>
                                <div v-else>
                                    <span v-if="isLsd(item) || isCC(item) || isWelcomeGift(item)" class="text-red text-base font-bold line-through block">{{ item.Price }}</span>
                                    <span>{{ adjustedPrice(item) }}</span>
                                </div>
                                <!--Price/Unit-EU specific -->
                                <PricePerUnit
                                    v-if="getPricePerUnit(item.PriceRange, 'Concentrated', viewPrice)"
                                    :label="getLocalizationProp('Labels.Concentrated')"
                                    :price="getPricePerUnit(item.PriceRange, 'Concentrated', viewPrice)"
                                    :unit="item.PriceRange.ConcentratedPPUMeasurementType"
                                    :tailwind-mods="`flex flex-col text-sm text-gray font-normal leading-tight`"
                                />
                                <PricePerUnit
                                    v-if="getPricePerUnit(item.PriceRange, 'Diluted', viewPrice)"
                                    :label="getLocalizationProp('Labels.Diluted')"
                                    :price="getPricePerUnit(item.PriceRange, 'Diluted', viewPrice)"
                                    :unit="item.PriceRange.DilutedPPUMeasurementType"
                                    :tailwind-mods="`flex flex-col text-sm text-gray font-normal leading-tight mb-5`"

                                />
                                <PricePerUnit
                                    v-if="getPricePerUnit(item.PriceRange, 'Original', viewPrice)"
                                    :price="getPricePerUnit(item.PriceRange, 'Original', viewPrice)"
                                    :unit="item.PriceRange.OriginalPPUMeasurementType"
                                    :tailwind-mods="`flex flex-col text-sm text-gray font-normal mb-5`"
                                />
                            </template>

                            <template v-slot:points>
                                {{ getPoints(item.Points) }}
                            </template>

                            <template v-slot:points-label>
                                {{ getLocalizationProp('Labels.CartItem.Points') }}
                            </template>

                            <template v-slot:lsd-caption>
                                <p v-if="isCn && isLsd(item)" class="p-cart__lsdCaption" v-html="getLocalizationProp('Labels.CartItem.LsdCaption')"></p>
                            </template>

                            <template v-slot:ino>
                                <span v-if="item.InNextOrderReason">{{ item.InNextOrderReason }}</span>
                            </template>

                            <template v-slot:remove>
                                {{ getLocalizationProp('Labels.CartItem.Remove') }}
                            </template>

                            <template v-slot:save>
                                {{ getLocalizationProp('Labels.CartItem.Save') }}
                            </template>

                            <template v-slot:accessories>
                                <o-shelf-configurator
                                    v-for="(accessory, i) in item.Accessories"
                                    :key="i"
                                    class="o-cartItem__btn"
                                    :aria-label="accessoryBtnText(accessory.Title)"
                                    :sku="accessory.Sku"
                                    :cart-position="item.Position + 1">
                                    {{ accessoryBtnText(accessory.Title) }}
                                </o-shelf-configurator>
                            </template>

                            <template
                                v-if="(isCC(item) || isLsd(item) || showLSDCheckbox(item) || showLSDTooltip(item) || showCCCheckbox(item) || showCCTooltip(item)) && !item.IsDeleteDisabled"
                                v-slot:payment="$payment">
                                <!-- Display LSD checkbox/tooltip -->
                                <!-- Disable tooltip if there's no LSD message -->
                                <m-tooltip
                                    v-if="!isUnauthenticatedVisitors && !isAuthenticatedGuests && (showLSDCheckbox(item) || showLSDTooltip(item) || isLsd(item))"
                                    :ref="`lsd-tooltip-${item.Sku}`"
                                    :disable-tooltip="!showLSDTooltip(item)">
                                    <!-- Disable LSD checkbox if item line type is CC, or user has no LSD balance or item is not eligible for LSD or there's some tooltip message -->
                                    <template v-slot:button>
                                        <m-checkbox
                                            class="-cartItem"
                                            name="BuyWithLsd"
                                            :disabled="$payment.loading || isCC(item) || showLSDTooltip(item)"
                                            :label="getLocalizationProp('Labels.CartItem.LsdLabel')"
                                            :value="isLsd(item)"
                                            @input="$payment.lsdPayment"
                                            @focus="$refs[`lsd-tooltip-${item.Sku}`][0].show()"
                                            @blur="$refs[`lsd-tooltip-${item.Sku}`][0].hide()" />
                                    </template>

                                    <!-- Display tooltip message if there's some LSD message on array -->
                                    <div v-if="showLSDTooltip(item)" v-html="getLSDTooltip(item)"></div>
                                </m-tooltip>

                                <!-- Display CC checkbox/tooltip -->
                                <!-- Disable tooltip if there's no CC message -->
                                <m-tooltip
                                    v-if="!isCn && (showCCCheckbox(item) || showCCTooltip(item) || isCC(item))"
                                    :ref="`cc-tooltip-${item.Sku}`"
                                    :disable-tooltip="!showCCTooltip(item)">
                                    <template v-slot:button>
                                        <!-- Disable CC checkbox if item line type is LSD, or user has no CC balance or item is not eligible for CC (#55975) -->
                                        <m-checkbox
                                            class="-cartItem"
                                            name="BuyWithCc"
                                            :disabled="$payment.loading || isLsd(item) || showCCTooltip(item)"
                                            :label="getLocalizationProp('Labels.CartItem.CcLabel')"
                                            :value="isCC(item)"
                                            @input="$payment.ccPayment"
                                            @focus="$refs[`cc-tooltip-${item.Sku}`][0].show()"
                                            @blur="$refs[`cc-tooltip-${item.Sku}`][0].hide()" />
                                    </template>

                                    <!-- Display tooltip message if there's some CC message on array -->
                                    <div v-if="showCCTooltip(item)" v-html="getCCTooltip(item)"></div>
                                </m-tooltip>
                            </template>

                            <template v-slot:item-removed>
                                {{ getLocalizationProp('Labels.CartItem.ItemRemoved') }}
                            </template>

                            <template v-slot:item-saved>
                                <span v-if="isCn" class="o-cartItem__preTitle" v-html="getLocalizationProp('Labels.CartItem.ItemHasBeenMoved')"></span>
                                <span v-else class="text-sm mt-15 mr-5" v-html="getLocalizationProp('Labels.CartItem.ItemSaved')"></span>
                            </template>

                            <template v-slot:undo-removed>
                                {{ getLocalizationProp('Labels.CartItem.UndoRemove') }}
                            </template>

                            <template v-slot:saved-for-later>
                                <div aria-live="polite">
                                    {{ getLocalizationProp('Labels.CartItem.SavedForLater') }}
                                </div>
                            </template>

                        </o-cart-item>
                    </template>

                    <div v-else-if="isEmpty && !error" class="o-cartEmpty">
                        <slot name="empty-cart-placeholder" />
                    </div>

                    <!-- API Error -->
                    <div v-else-if="isEmpty && error" class="o-cartEmpty__error">
                        <m-error-card
                            v-if="error"
                            mods="rounded border-gray-100 leading-tight"
                            :reload-text="getLocalizationProp('Labels.Cart.RefreshPage', 'Refresh Page')"
                            :text="getLocalizationProp('Labels.Cart.GenericFailureMessage', 'Looks like something went wrong. This part of the page had trouble loading.')"
                        />
                    </div>

                    <div
                        v-if="footerRte"
                        class="p-cart__rte"
                        v-html="footerRte" />
                </div>

                <div class="p-cart__side">
                    <div ref="cartSidebarRef" class="p-cart__sidebar">
                        <div v-if="!isCn">
                            <m-become-member-card
                                v-if="getLocalizationProp('Data.ShowBecomeMemberCard', false) && !userFlags.ViewMemberPricing"
                                mods="mb-20"
                                :become-member="getLocalizationProp('Labels.BecomeAMember', {})"
                                :online-enrollment="getLocalizationProp('Labels.OnlineEnrollmentLink', {})"
                                :user-flags="userFlags">
                            </m-become-member-card>

                            <div v-if="userFlags.IsAuthenticated">
                                <m-referral-code-box
                                    v-if="getLocalizationProp('Data.ShowReferralCodeBox', false)"
                                    :labels="getLocalizationProp('Labels.ReferralCodeBox', {})"
                                    tailwind-mods="mb-20">
                                </m-referral-code-box>

                                <!-- Coupons -->
                                <div v-if="showCoupons" class="p-cart__accordion">
                                    <div class="p-cart__item">
                                        <o-cart-coupons
                                            :labels="getLocalizationProp('Labels.Coupons')"
                                            :coupons-link="getLocalizationProp('Data.Coupons.CouponsLink')"
                                            accordion-mask-class="-gray25"
                                            :show-reminder-email="getLocalizationProp('Data.Coupons.ShowReminderEmail')"
                                            :reminder-days="getLocalizationProp('Data.Coupons.ReminderDays')"
                                            :user-flags="userFlags" />
                                    </div>
                                </div>

                                <!-- Buy it Again (Recently purchased) -->
                                <div class="p-cart__accordion">
                                    <div class="p-cart__item">
                                        <o-recently-purchased
                                            accordion-mask-class="-gray25"
                                            :add-aria-label="getLocalizationProp('Labels.RecentlyPurchased.AddToCartAriaLabel')"
                                            :concentrated-label="getLocalizationProp('Labels.Concentrated')"
                                            :diluted-label="getLocalizationProp('Labels.Diluted')"
                                            mods="-buyAgain"
                                            :points-label="getLocalizationProp('Labels.RecentlyPurchased.Points')"
                                            :title="getLocalizationProp('Labels.RecentlyPurchased.DropdownText')"
                                            :user-flags="userFlags"
                                        />
                                    </div>
                                </div>

                                <!-- Extra Savings -->
                                <div class="p-cart__accordion">
                                    <div class="p-cart__item">
                                        <o-cart-extra-savings
                                            :concentrated-label="getLocalizationProp('Labels.Concentrated')"
                                            :diluted-label="getLocalizationProp('Labels.Diluted')"
                                            :labels="getLocalizationProp('Labels.ExtraSavings')"
                                            accordion-mask-class="-gray25"
                                            :user-flags="userFlags"
                                        />
                                    </div>
                                </div>

                                <!-- Rewards / Ad -->
                                <div v-if="showAccordionAd" class="p-cart__accordion">
                                    <div class="p-cart__item">
                                        <o-cart-accordion-ad
                                            accordion-mask-class="-gray25"
                                            :accordion-data="getLocalizationProp('Data.AccordionAd')"
                                        >
                                        </o-cart-accordion-ad>
                                    </div>
                                </div>

                                <!-- L2E Videos -->
                                <div v-if="userFlags.ViewMemberPricing && userFlags.IsGuest === false" class="p-cart__accordion">
                                    <div class="p-cart__item">
                                        <o-cart-l2e-video
                                            accordion-mask-class="-gray25"
                                            :localization="getLocalizationProp('Labels.LearnToEarnVideos')"
                                            :l2e-video-data="getLocalizationProp('Data.LearnToEarnVideos')" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section below accordion -->
                        <div v-if="!isCn && !loading" class=" text-sm text-gray-150 block relative py-15">
                            <div v-if="hasLsdBalance || nonSkuGiftsInfo.length" class="flex flex-col pb-20 pl-20">
                                <span class="pb-2">{{ getLocalizationProp('Labels.PointSummary.LSD') }}</span>
                                <span v-if="totalLsdBalance"><span class="p-cart__additional">{{ getLocalizationProp('Labels.PointSummary.Available') }}</span>&nbsp;<strong>{{ formattedTotalLsdBalance }}</strong></span>
                                <span v-if="expiringThisMonth"><span class="p-cart__additional">{{ getLocalizationProp('Labels.PointSummary.ExpiringThisMonth') }}</span>&nbsp;<strong>{{ formattedExpiringThisMonth }}</strong></span>

                                <div v-if="nonSkuGiftsInfo.length" class="p-cart__gift">
                                    <div v-for="(gift, index) in nonSkuGiftsInfo" :key="gift.type + index">
                                        <span class="p-cart__additional" v-html="gift.RTE"></span>&nbsp;<strong>{{ gift.amount }}</strong>
                                    </div>
                                </div>
                            </div>
                            <div v-if="totalCcBalance || (totalCcBalance >= 0 && $custInfo && $custInfo.customerType === 'Employee')" class="flex flex-col pl-20">
                                <span class="pb-2">{{ getLocalizationProp('Labels.CertificateSummary.ConvenienceCertificate') }}</span>
                                <span><span class="p-cart__additional">{{ getLocalizationProp('Labels.CertificateSummary.Available') }}:</span>&nbsp;<strong>{{ formattedTotalCcBalance }}</strong></span>
                            </div>
                        </div>
                        <!-- Grey bottom separator -->
                        <div v-if="!isCn" class="rounded bg-gray-35 relative h-16 w-full"></div>

                        <!-- Notice and banner used for CN -->
                        <o-cart-point-summary
                            v-if="isPreferred && isCn"
                            class="hidden md:block"
                            :labels="getLocalizationProp('Labels.PointSummary', {})"
                            :price-labels="getLocalizationProp('Data.PriceSummary', {})"
                            :enable-points-progress-bar="getLocalizationProp('Data.EnablePointsProgressBar', false)"
                            :lvip-popup="getLocalizationProp('Data.LvipPopup.RTEContent')"
                            :earned-points="summary.Points"
                            :has-max-service-points="hasMaxServicePoints"
                            :is-cn="isCn"
                            :max-points="monthlyPointCommitment"
                            :previous-order-points="pointsEarnedInCurrentMonth"
                            :member-services-points="pointsEarnedViaServicesInCurrentMonth"
                            :member-products-points="pointsEarnedViaProductsInCurrentMonth"
                            @lvipPopupModal="lvipPopupModal" />
                        <div v-if="enableLSDSummaryEnhancement && isCn && !loading" class="text-sm text-gray-100">
                            <div class="flex flex-col pb-25 mb-25">
                                <div class="pb-2 text-gray-150 font-bold">{{ getLocalizationProp('Labels.PointSummary.LSD') }}</div>
                                <div v-if="lsdAvailableToSpend">{{ getLocalizationProp('Labels.PointSummary.Available') }}<span class="text-gray-150 font-bold">{{ formattedAvailableToSpend }}</span></div>
                                <div v-if="lsdExpiringThisMonth">{{ getLocalizationProp('Labels.PointSummary.ExpiringThisMonth') }}<span class="text-gray-150 font-bold">{{ formattedExpiringThisMonth }}</span></div>
                                <div v-if="lsdUsedThisOrder">{{ getLocalizationProp('Labels.PointSummary.UsedThisOrder') }}<span class="text-gray-150 font-bold">{{ formattedUsedThisOrder }}</span></div>
                                <div v-if="lsdRemaining">{{ getLocalizationProp('Labels.PointSummary.Remaining') }}<span class="text-gray-150 font-bold">{{ formattedRemaining }}</span></div>
                            </div>
                        </div>

                        <o-cart-banner
                            v-if="isCn"
                            class="p-cart__banner hidden md:block"
                            :banner="getLocalizationProp('Data.NoticeAndBanner', {})"
                            :summary="summary"
                            :shipping-fee="getLocalizationProp('Data.ShippingFee', {})"
                            :is-preferred="isPreferred">
                        </o-cart-banner>

                        <div v-if="!enableLSDSummaryEnhancement && isCn && totalLsdBalance && !loading" class="text-xl text-green font-bold block relative hidden md:block">
                            <p role="text">
                                <span v-if="totalLsdBalance" class="block mb-10" v-html="totalLsdDollars"></span>
                            </p>
                        </div>
                        <div v-if="enableLSDSummaryEnhancement && isCn && lsdAvailableToSpend && !loading" class="text-xl text-green font-bold block relative hidden md:block">
                            <p role="text">
                                <span v-if="lsdAvailableToSpend" class="block mb-10" v-html="totalLsdDollars"></span>
                            </p>
                        </div>

                        <div v-if="$slots['ad-variant-3']" class="p-cart__ad">
                            <slot name="ad-variant-3" />
                        </div>

                        <m-error-card
                            v-if="summaryApiError"
                            mods="mt-5"
                            :reload-text="getLocalizationProp('Labels.CartSummary.ErrorLabels.RefreshPage')"
                            :text="getLocalizationProp('Labels.CartSummary.ErrorLabels.GenericFailureMessage')"
                        />
                        <template v-else>
                            <!-- New Loyalty Program -->
                            <template v-if="newLoyaltyProgram && shippingOnUsEnabled && rewardsConfigId">
                                <ORewardTimelineNewLoyalty
                                    :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                                    :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                                    :reward-config-id="rewardsConfigId"
                                    :set-message-priority="false"
                                    :shipping-on-us-title="shippingOnUsTitle" />
                            </template>
                            <template v-if="!newLoyaltyProgram && summary.ShippingOnUsEnabled && rewardsConfigId">
                                <!-- Reward Tracker AUNZ -->
                                <p class="p-cart__title py-10">{{ shippingOnUsTitle }}</p>
                                <m-shipping-on-us
                                    ref="reward-tracker"
                                    :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                                    :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                                    :reward-config-id="rewardsConfigId"
                                >
                                    <o-reward-timeline />
                                </m-shipping-on-us>
                            </template>

                            <!-- MTD Cart Point Summary -->
                            <o-cart-point-summary
                                v-if="isPreferred && !isCn && !rewardsConfigId"
                                :labels="getLocalizationProp('Labels.PointSummary', {})"
                                :earned-points="summary.TotalCommitmentAmount"
                                :currency-formatted-points="summary.CurrencyFormattedPoints"
                                :has-max-service-points="hasMaxServicePoints"
                                :max-points="monthlyPointCommitment"
                                :previous-order-points="pointsEarnedInCurrentMonth"
                                :member-services-points="pointsEarnedViaServicesInCurrentMonth"
                                :show-currency-formatted-points="summary.ShowCurrencyFormattedPoints" />

                            <m-cart-summary
                                v-if="!isEmpty"
                                ref="cartSummaryComponent"
                                :cc-total="!isCn ? summary.ConvenienceCertificates.FormattedUsed : ''"
                                :commitment="commitment"
                                :show-gst-in-order-summary="false"
                                :hide-sales-tax="hideSalesTax"
                                :is-cart="true"
                                :is-cn="isCn"
                                :item-total="itemTotal"
                                :lsd-total="summary.LoyaltyShoppingDollars.FormattedUsed"
                                :lsd-used="lsdUsed"
                                :product-discount="productDiscount"
                                :points="points"
                                :redemption-fee="redemptionFee"
                                :sales-tax="summary.FormattedSalesTax"
                                :show-cc-total="!isCn ? isCCApplicable : false"
                                :show-purchase-commitment="showPurchaseCommitment"
                                :show-lsd-redemption-fee="showLsdRedemptionFee"
                                :show-lsd-total="showLsdTotal"
                                :show-gst-below-total="showGstBelowTotal"
                                :show-welcome-program-lsd="showWelcomeProgramLsd"
                                :pending-label="pendingLabel"
                                :subtotal="summary.FormattedCartNetTotal"
                                :total-discount="totalDiscount"
                                :is-preferred="isPreferred"
                                :view-points="userFlags.ViewPoints"
                                :welcome-program-lsd="summary.WelcomeProgramLsdAvailable && summary.WelcomeProgramLsdAvailable.FormattedUsed">

                                <template v-slot:heading>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.Heading')"></span>
                                </template>

                                <template v-slot:item-total>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.ItemTotal')"></span>
                                </template>

                                <template v-slot:welcome-program-lsd>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.WelcomeFreeProductsUsedInThisOrder')"></span>
                                </template>

                                <template v-slot:lsd-total>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.LsdTotal')"></span>
                                </template>

                                <template v-slot:lsd-redemption-fee>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.LsdRedemptionFee')"></span>
                                </template>

                                <template v-slot:cc-total>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.CcTotal')"></span>
                                </template>

                                <template v-slot:subtotal>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.Subtotal')"></span>
                                </template>

                                <template v-slot:commitment>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.Commitment')"></span>
                                </template>

                                <template v-slot:points>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.Points')"></span>
                                </template>

                                <template v-slot:product-discount>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.ProductDiscount')"></span>
                                </template>

                                <template v-slot:shipping-taxes>
                                    <span v-html="getLocalizationProp('Labels.CartSummary.ShippingTaxes')"></span>
                                </template>

                                <template v-slot:salex-taxes>
                                    <span v-html="gstTaxLabel"></span>
                                </template>
                            </m-cart-summary>

                            <p v-if="!!preferredSavings && isPreferred && isCn" class="m-cartSavings">
                                <span class="m-cartSavings__heading">
                                    <span v-html="getLocalizationProp('Labels.CartSummary.AsPreferred', 'As a Preferred Member,')"></span>
                                    <br />
                                </span>
                                <span v-html="preferredSavings"></span>
                            </p>

                            <!-- Hide on below large screen sizes when improved UX feature is enabled -->
                            <div :class="{'hidden lg:block': showImprovedCTACheckout}">
                                <!-- Proceed to Checkout Button | using cart-attention-items as wrapper for handling non-AIF attention items -->
                                <m-cart-attention-items
                                    v-show="!isEmpty"
                                    ref="cart-attention-items"
                                    :attention-items="attentionItems"
                                    :disabled="loading"
                                    :handler="proceedToCheckout"
                                    :explicit-attention-items="explicitAttentionItems"
                                    :should-fire-once="true">
                                    <span v-html="getLocalizationProp('Data.CartSummary.CheckoutLink.Text')"></span>
                                </m-cart-attention-items>

                                <div v-if="backDatingText" v-html="backDatingText"></div>

                            </div>
                            <p
                                v-if="showMemberBenefitMessage" class="m-cartSavings"
                                :class="{'mb-20':!showImprovedCTACheckout && shippingOnUsEnabled && shippingOnUsCurrentOffer.WillEarn}">
                                <span class="m-cartSavings__heading">
                                    <span v-html="getLocalizationProp('Labels.CartSummary.AsPreferred', 'As a Preferred Member,')"></span>
                                    <br v-if="!showImprovedCTACheckout" />
                                </span>
                                <span v-html="preferredSavings"></span>
                            </p>

                            <div v-if="shippingOnUsEnabled && shippingOnUsCurrentOffer.WillEarn && shippingBack">
                                <!-- shipping on us rebate value -->
                                <p v-if="showImprovedCTACheckout" class="text-base">
                                    <span>{{ shippingBack }}</span>
                                    <span><strong>{{ shippingOnUsCurrentOffer.FormattedReimbursementValue }}</strong></span>
                                </p>
                                <div v-else class="text-center p-20 md:mx-auto md:leading-tight">
                                    <p class="text-base md:text-xl">{{ shippingBack }}</p>
                                    <p class="text-base md:text-xl"><strong>{{ shippingOnUsCurrentOffer.FormattedReimbursementValue }}</strong></p>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="p-cart__savedLater">
                    <o-saved-later-carousel
                        :id="getLocalizationProp('Data.SavedForLater.UniqueId')"
                        :is-preferred="isPreferred"
                        :endpoint="getLocalizationProp('Data.SavedForLater.Endpoint')"
                        :user-flags="userFlags"
                        :labels="getLocalizationProp('Labels.SavedForLater')"
                        accordion-mask-class="-gray25" />
                </div>
            </div>
        </div>
        <MStickyToast
            v-if="showImprovedCTACheckout"
            class="lg:hidden px-10"
        >
            <template v-slot>
                <div
                    class="flex px-10 items-center justify-around">
                    <div>
                        <p class="font-bold text-base text-center">
                            {{ getLocalizationProp('Labels.CartSummary.Subtotal') }} <span v-html="summary.FormattedCartNetTotal" />
                        </p>
                        <p v-if="userFlags.ViewPoints" class="text-sm text-center">
                            <span v-html="summary.Points" /> {{ getLocalizationProp('Labels.CartSummary.Points') }}
                        </p>
                    </div>
                </div>
            </template>
            <template v-slot:alerts>
                <MCollapsedAlerts
                    class="flex flex-col px-0 md:px-40"
                    :attention-item-error-messages="attentionItemErrorMessages"
                    :additional-messages-for-sticky-toast="additionalMessagesForStickyToast"
                    :has-back-dating-note="backDatingText!==null"
                    :show-more-label="getLocalizationProp('Labels.Configurator.ShowMore')" />
            </template>
            <template v-slot:cta>
                <m-cart-attention-items
                    v-show="!isEmpty"
                    ref="cart-attention-items"
                    :attention-items="attentionItems"
                    :disabled="loading"
                    :handler="proceedToCheckout"
                    :explicit-attention-items="explicitAttentionItems"
                    :should-fire-once="true"
                    :is-sticky-toast-visible="true"
                >
                    <span>{{ getLocalizationProp('Data.CartSummary.CheckoutLink.Text') }} ({{ itemCount }}) </span>
                </m-cart-attention-items>
            </template>
        </MStickyToast>
        <!-- Quantity Limit Modal -->
        <modal id="quantity-limit" :heading-visible="false">
            <template v-slot:body>
                <div class="text-sm text-gray-120 pr-0 md:pr-15" v-html="limitModalContentToken"></div>
            </template>

            <template v-slot:footer>
                <button
                    class="uppercase text-white bg-green px-24 py-15 rounded-md"
                    @click="limitModalHide"
                >
                    {{ limitModalContent.Modal.Labels.CloseButonText }}
                </button>
            </template>
        </modal>

        <!-- LVIP Popup Modal CN Only-->
        <modal id="lvip-popup" :heading-visible="false">
            <template v-slot:body>
                <div v-html="lvipPopup.RTEContent"></div>
            </template>
        </modal>
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
    import { getPricePerUnit } from '../../../utils/get-price-per-unit';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import placeholderMixin from '@common/source/js/vue/mixins/placeholder';
    import PricePerUnit from '../../00-atoms/price-per-unit/price-per-unit.vue';
    import MCollapsedAlerts from '../../01-molecules/collapsed-alerts/collapsed-alerts.vue';
    import MStickyToast from '../../01-molecules/sticky-toast/sticky-toast.vue';
    import replaceToken, { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import MCartShippingOnUsBanner from '../../01-molecules/shipping-on-us/cart-shipping-on-us-banner.vue';
    import OCartAccordionAd from '../../02-organisms/cart/cart-accordion-ad.vue';
    import shippingOnUsMixin from '../../../mixins/shipping-on-us';
    import ORewardTimeline from '../../02-organisms/rewards/reward-timeline.vue';
    import ORewardTimelineNewLoyalty from '../../02-organisms/rewards/reward-timeline-new-loyalty.vue';

    export default {
        name: 'Cart', // eslint-disable-line
        components: {
            OCartAccordionAd,
            MCartShippingOnUsBanner,
            MCollapsedAlerts,
            MStickyToast,
            ORewardTimeline,
            ORewardTimelineNewLoyalty,
            PricePerUnit
        },
        mixins: [ localizationMixin, placeholderMixin, shippingOnUsMixin ],
        props: {
            /**
             * Override cart logic & display as empty cart
             * - Mostly for pl & testing purposes, but will most likely be useful for ee
             */
            empty: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                additionalMessagesForStickyToast: [],
                ready: false,
                scrollTip: ''
            };
        },
        computed: {
            ...mapState('attentionItems', ['footerRte']),
            ...mapState('cart', ['attentionItems', 'error', 'errorMsg', 'items', 'userFlags', 'loading', 'summary']),
            ...mapState('cartSummary', ['itemCount', 'points']),
            ...mapGetters('cartSummary', ['summaryApiError']),
            ...mapGetters('attentionItems', ['attentionItemErrorMessages']),
            ...mapGetters('cart', ['customerId', 'isBackDated', 'isPreferred', 'formattedExpiringThisMonth', 'expiringThisMonth', 'formattedBackDatingDate', 'formattedTotalLsdBalance', 'totalLsdBalance', 'hasLsdBalance', 'totalCcBalance',
                                   'formattedTotalCcBalance', 'showHasLoyaltyDollarsToSpend', 'summary', 'monthlyPointCommitment',
                                   'pointsEarnedInCurrentMonth', 'pointsEarnedViaServicesInCurrentMonth', 'pointsEarnedViaProductsInCurrentMonth', 'hasBogo', 'hasLimitModal',
                                   'hasLimitModalContent', 'hasMaxServicePoints', 'lsdAvailableToSpend', 'lsdExpiringThisMonth', 'lsdUsedThisOrder', 'lsdRemaining', 'formattedUsedThisOrder', 'formattedRemaining', 'formattedAvailableToSpend']),
            ...mapState('addToCart', ['upsells']),
            ...mapState('shippingOnUsV2', ['souData']),

            additionalContent() {
                return this.getLocalizationProp('Data.FreeShippingMessageRte', '');
            },
            backDatingText() {
                const text = this.getLocalizationProp('Labels.Cart.OrderBackDateText', null);
                return this.isBackDated && this.formattedBackDatingDate && text ? text.replace('{0}', this.formattedBackDatingDate) : null;
            },
            enableLSDSummaryEnhancement() {
                return this.getLocalizationProp('Data.EnableLSDSummaryEnhancement', false);
            },
            pendingLabel() {
                return this.showImprovedCTACheckout ? this.getLocalizationProp('Labels.CartSummary.Pending') : '--';
            },
            explicitAttentionItems() {
                return {
                    backDatingNote: {
                        active: this.getLocalizationProp('Data.UserFlags.ShowBackdatingWarningModal'),
                        data: this.localization,
                        forceLoad: true,
                        snippet: this.getLocalizationProp('Data.BackDatingNote.Snippets.Inline.RteContent'),
                        toggleLoad: false
                    },
                    lsdVideo: {
                        active: !!this.localization.Id && this.getLocalizationProp('Data.VideoModal.ShowPopup'),
                        data: this.localization,
                        forceLoad: true,
                        toggleLoad: false
                    }
                };
            },
            hidePoints() {
                return this.$env?.HidePoints || false;
            },
            hideSalesTax() {
                return this.getLocalizationProp('Data.HideSalesTax', false);
            },
            inoLocalization() {
                const inoLocalization = this.getLocalizationProp('Labels.INOModal');
                return inoLocalization ?? null;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isEmpty() {
                return this.empty ? this.empty : this.items.length === 0;
            },
            isCCApplicable() {
                return this.summary.ConvenienceCertificates.Used > 0;
            },
            isAuthenticatedGuests() {
                return this.userFlags.IsAuthenticated && this.userFlags.IsGuest;
            },
            isAuthenticatedNonIntentToPreferred() {
                return this.userFlags.IsAuthenticated && !this.userFlags.ViewMemberPricing;
            },
            isUnauthenticatedVisitors() {
                return !this.userFlags.IsAuthenticated;
            },
            lsdUsed() {
                return this.summary?.LoyaltyShoppingDollars?.Used || 0;
            },
            newLoyaltyProgram() {
                return this.souData?.IsNewLoyaltyRewardTracker &&
                    this.souData?.IsNewLoyaltyRewardTrackerEligible;
            },
            nonSkuGiftsInfo() {
                if(this.summary?.NonSKUGifts?.length) {
                    let gift = [];
                    this.summary.NonSKUGifts.forEach(apiObj => {
                        this.getLocalizationProp('Data.Gifts', []).forEach(dataObj => {
                            if(apiObj.GiftType === dataObj.GiftType) {
                                gift.push(
                                    {
                                        RTE: dataObj.RTE,
                                        amount: apiObj.FormattedPromotionAmount,
                                        type: dataObj.GiftType
                                    }
                                );
                            }
                        });
                    });
                    return gift;
                }
                return [];
            },
            preferredSavings() {
                const text = this.getLocalizationProp('Labels.CartSummary.YouSaved');
                return this.summary.FormattedPreferredSavings && text ? text.replace('{0}', this.summary.FormattedPreferredSavings) : null;
            },
            productDiscount() {
                return this.isCn ? this.summary.FormattedTotalDiscount : '';
            },
            rangeSrMarkup() {
                return ` <span class="sr-only">${this.rangeSrText}</span><span aria-hidden="true">-</span> `;
            },
            redemptionFee() {
                return this.summary?.LsdRedemptionFee?.FormattedPrice;
            },
            rewardsConfigId() {
                return this.getLocalizationProp('Data.RewardTrackerId', null);
            },
            shippingBack() {
                return this.getLocalizationProp('Labels.ShippingOnUs.ShippingBack');
            },
            shippingConfigId() {
                return this.getLocalizationProp('Data.ShippingOnUsTrackerId', null);
            },
            shippingOnUsTitle() {
                const totalPoints = this.hidePoints
                    ? (this.summary?.TotalCommitmentAmount + this.getLocalizationProp('Data.PaidMonthToDateCommitment', 0.0))
                    : (this.summary?.Points + this.pointsEarnedInCurrentMonth + this.pointsEarnedViaServicesInCurrentMonth);
                return this.replaceToken(this.getLocalizationProp('Labels.ShippingOnUs.Title', 'Your Product Point total this month is {0}'), Math.round(totalPoints));
            },
            // showAccordionAd determines whether to show the Accordion Ad/Review secton
            // openAccordion determines whether to default open the ad
            showAccordionAd() {
                return this.getLocalizationProp('Data.AccordionAd.ShowAccordionAd', false);
            },
            showLsdRedemptionFee() {
                return Boolean(this.summary?.LsdRedemptionFee?.Sku);
            },
            showLsdTotal() {
                return this.isCn ? this.isPreferred : this.isPreferred || this.summary.LoyaltyShoppingDollars.Used > 0;
            },
            showWelcomeProgramLsd() {
                return this.summary?.WelcomeProgramLsdAvailable?.IsUserInWelcomeProgram || false;
            },
            showPurchaseCommitment() {
                return this.userFlags?.ShowPurchaseCommitment;
            },
            totalItems() {
                const text = this.getLocalizationProp('Labels.Cart.TotalItems');
                return text ? text.replace('{0}', this.itemCount) : null;
            },
            totalLsdDollars() {
                const text = this.getLocalizationProp('Labels.PointSummary.Total');
                const val = this.enableLSDSummaryEnhancement ? this.formattedAvailableToSpend : this.formattedTotalLsdBalance;
                return val && text ? text.replace('{0}', val) : null;
            },
            showImprovedCTACheckout() {
                return this.getLocalizationProp('Data.ShowImprovedCTACheckout', false);
            },
            showLimitModal() {
                return this.hasLimitModal;
            },
            showMemberBenefitMessage() {
                return !!this.preferredSavings && this.isPreferred && !this.isCn;
            },
            limitModalContent() {
                return this.hasLimitModalContent;
            },
            limitModalContentToken() {
                return this.hasLimitModalContent ? this.replaceTokenArray(
                    this.limitModalContent.Modal.RteContent, this.limitModalContent.Modal.Parameters
                ) : '';
            },
            productsData() {
                let productsDataLayer = [];
                this.items.forEach(item => {
                    productsDataLayer.push({
                        id: item.Sku,
                        name: item.Title || item.FamilyTitle || '',
                        price: this.viewPrice ? item.PriceRange.RawMinPreferredPrice || '' : item.PriceRange.RawMinRegularPrice || '',
                        brand: item.Brand || '',
                        category: item.Category || '',
                        variant: item.Variant || '',
                        quantity: item.Quantity
                    });
                });
                return productsDataLayer;
            },
            viewPrice() {
                return this.userFlags.ViewMemberPricing;
            },
            lvipPopup() {
                return this.getLocalizationProp('Data.LvipPopup');
            },
            totalDiscount() {
                return this.isCn ? this.summary.TotalDiscount : 0;
            },
            commitment() {
                return this.isCn ? (this.isPreferred ? this.summary.FormattedTotalCommitment : '0') : this.summary.FormattedTotalCommitment;
            },
            showCoupons() {
                return this.userFlags.ViewMemberPricing && this.userFlags.IsGuest === false && this.getLocalizationProp('Data.IsCouponsReminderEnabled', false);
            },
            showInfoPoints() {
                return this.userFlags.ViewPoints && !this.isAuthenticatedGuests && !this.isAuthenticatedNonIntentToPreferred && !this.isUnauthenticatedVisitors;
            },
            itemTotal() {
                const signMoney = this.summary?.FormattedCartGrossTotal.replace(/[0-9,\\.]+/, '');

                return this.isCn ? (this.summary?.TotalDiscount === 0 ? this.summary?.FormattedCartGrossTotal : signMoney + parseFloat(this.summary?.CartGrossTotal - this.summary?.TotalDiscount).toFixed(2)) : this.summary?.FormattedCartGrossTotal;
            },
            gstTaxLabel() {
                const gstLabel = this.getLocalizationProp('Labels.GSTLabel');
                if(gstLabel && this.summary?.TaxBaseRate) {
                    return replaceToken(gstLabel, this.summary?.TaxBaseRate * 100);
                } else {
                    return gstLabel;
                }
            },
            showGstBelowTotal() {
                return this.summary?.FormattedSalesTax && this.getLocalizationProp('Data.ShowGSTBelowTotal', false);
            }
        },
        watch: {
            // add back dating note to sticky toast
            backDatingText(newValue) {
                newValue !== null && this.additionalMessagesForStickyToast.push(this.backDatingText);
            },
            ready() {
                this.triggerOnLoadModals();
            },
            showLimitModal(newValue) {
                if(newValue) {
                    this.$modal.show({
                        id: 'quantity-limit'
                    });
                }
            },
            'summary.ShippingOnUsEnabled': {
                handler(val) {
                    if(val) {
                        this.getSOU({ rewardId: this.localization?.Data?.RewardTrackerId, shippingId: this.localization?.Data?.ShippingOnUsTrackerId });
                    }
                }
            }
        },
        async mounted() {
            if(!this.items.length) {
                this.SET_LOADING();
                this.$store.commit('cart/SET_IS_CN', this.isCn);
                // Setting pagetype so that add to cart knows call came from cart page
                this.$store.commit('addToCart/SET_PAGE_TYPE', 'CART');
                await this.getData(this.getLocalizationProp('Labels.Params'));
                this.SET_LOADING(false);
            }

            this.$nextTick(() => (this.ready = true));

            this.SET_CHECKOUT_URL(this.getLocalizationProp('Data.CartSummary.CheckoutLink.Url', null));

            this.$modal.$on.hidden(() => {
                this.UPDATE_LIMIT_MODAL_SHOW(false);
            });
            this.sendCollectCode();
            this.getUpsells();

            // GA
            this.dataLayerPush();
            window.addEventListener('scroll', this.handleScroll);
        },
        destroyed() {
            document.removeEventListener('scroll', this.handleScroll);
        },
        methods: {
            ...mapActions('addToCart', ['getUpsells']),
            ...mapActions('cart', ['getData', 'sendCollectCode']),
            ...mapMutations('cart', ['SET_CHECKOUT_URL', 'SET_LOADING', 'UPDATE_LIMIT_MODAL_SHOW']),
            ...mapActions('shippingOnUsV2', ['getSOU']),
            getPricePerUnit,
            replaceTokenArray,
            replaceToken,

            accessoryBtnText(accessoryName) {
                const text = this.getLocalizationProp('Labels.Cart.AccessoryCta');
                return text ? text.replace('{0}', accessoryName) : null;
            },
            adjustedPrice(item) {
                if(this.isLsd(item)) return item?.LsdAdjustedPrice;
                else if(this.isCC(item)) return item?.ConvenienceCertificateAdjustedPrice;
                else if(this.isWelcomeGift(item) && item?.WelcomeProgramLsdAdjustedPrice === 0) return this.getLocalizationProp('Labels.CartItem.Free', 'FREE');
                else if(this.isWelcomeGift(item)) return item?.FormattedWelcomeProgramLsdAdjustedPrice;
                else return item?.Price;
            },
            dataLayerPush() {
                window.dataLayer && window.dataLayer.push({
                    'event': 'viewCart',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '', // Local currency
                        'checkout': {
                            'actionField': {
                                'step': 1, // Number of the step REQUIRED
                                'option': 'Cart',
                                'action': 'checkout'
                            },
                            'products': this.productsData
                        }
                    }
                });
            },
            findUpsell(lineId) {
                return this.upsells && this.upsells.find(upsell => upsell.LineId === parseInt(lineId));
            },
            getPoints(points) {
                return this.userFlags.ViewPoints ? points : '';
            },
            isCC(item) {
                return item.LineType === 'Certificate';
            },

            isLsd(item) {
                return item.LineType === 'LSD';
            },

            isWelcomeGift(item) {
                return item.LineType === 'WelcomeProgram';
            },

            // If PromotionGroup = "ReactivationIncentive", do not need to check for PromotionType
            // If PromotionGroup = "WelcomeGift" or "VIP", do need to check for PromotionType = "FreeGift"
            showFree(item) {
                const isWelcomeOrVip = item.PromotionGroup === 'WelcomeGift' || item.PromotionGroup === 'VIP';
                return (item.PromotionGroup === 'ReactivationIncentive') || (isWelcomeOrVip && item.PromotionType === 'FreeGift');
            },
            // Check if LSD checkbox can be displayed
            showLSDCheckbox(item) {
                const hasBalance = this.summary.LoyaltyShoppingDollars.Balance > 0;
                return item.LsdEligible && hasBalance && !this.userFlags.IsGuest;
            },

            // Check if there's some LSD tooltip message
            showLSDTooltip(item) {
                return item.LsdIneligibleReasons?.some(reason => reason.Message) ?? false;
            },

            // Get LSD tooltip message
            getLSDTooltip(item) {
                return this.getTooltipMsg(item.LsdIneligibleReasons);
            },

            // Check if CC checkbox can be displayed
            showCCCheckbox(item) {
                const hasBalance = this.summary.ConvenienceCertificates.Balance > 0;
                return item.ConvenienceCertificateEligible && hasBalance;
            },

            // Check if there's some CC tooltip message
            showCCTooltip(item) {
                return item.ConvenienceCertificateIneligibleReasons?.some(reason => reason.Message) ?? false;
            },

            // Get CC tooltip message
            getCCTooltip(item) {
                return this.getTooltipMsg(item.ConvenienceCertificateIneligibleReasons);
            },

            // Get LSD/CC tooltip message by code. If no code is provided, it will return the first message of array
            getTooltipMsg(reasons) {
                return reasons?.find(reason => reason.Message)?.Message || '';
            },

            proceedToCheckout() {
                const checkoutUrl = this.getLocalizationProp('Data.CartSummary.CheckoutLink.Url', null);
                const bogoUrl = this.getLocalizationProp('Data.CartSummary.BogoLink.Url', null);

                if(!checkoutUrl) {
                    return;
                }
                this.sendCollectCode();
                if(this.hasBogo && bogoUrl) {
                    window.location.href = bogoUrl;
                } else {
                    window.location.href = checkoutUrl;
                }
            },

            limitModalHide() {
                this.$modal.hide({
                    id: 'quantity-limit'
                });
            },

            triggerOnLoadModals() {
                if(this.ready && !this.loading) {
                    this.$nextTick(() => {
                        this.$refs['cart-attention-items'].$emit('onLoad');
                    });
                }
            },

            openLsdOnlyOneProdModal(payload) {
                const modalLsdOnly = this.$refs['cart-attention-items']?.$refs['attention-items']?.$children?.find(item => item.code === 'LSDOnlyOneProductPointItemInCart');
                if(modalLsdOnly) modalLsdOnly.open(payload);
            },

            toggleSelectionOptions(item) {
                item.showSelectionOptions = item.showSelectionOptions === undefined ? true : !item.showSelectionOptions;
                this.$forceUpdate();
            },

            handleScroll() {
                if(this.isCn) {
                    let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                    let scrollTipH = this.$refs.scrollTip.offsetTop;
                    if(scrollTop > scrollTipH) {
                        this.scrollTip = 'p-cart__tip';
                    } else {
                        this.scrollTip = '';
                    }
                }
                this.makeCartSummarySticky();
            },
            makeCartSummarySticky() {
                if(this.showImprovedCTACheckout) {
                    const cartSidebar = this.$refs.cartSidebarRef;
                    const cartSummary = this.$refs.cartSummaryComponent?.$refs?.cartSummaryRef;
                    const cartAttentionItemsComponent = this.$refs['cart-attention-items'];
                    const cartAttentionItems = cartAttentionItemsComponent?.$refs['attention-list'];
                    const cartSummaryTopSpacing = 8;
                    const cartSummaryBottomSpacing = 24;
                    const viewHeight = window.innerHeight;
                    if(cartSummary && cartSidebar && cartAttentionItems) {
                        const cartSidebarOffsetTop = cartSummary.offsetTop - cartSummaryTopSpacing;
                        const cartAttentionItemsHeight = cartAttentionItems.offsetHeight;
                        const cartSummaryOffsetTop = cartSummary.getBoundingClientRect().top - cartSummaryTopSpacing;
                        // Check if the 'Order Summary' title is at the top of the window.
                        if(cartSummaryOffsetTop < 0) {
                            const cartSummaryHeight = cartSummary.offsetHeight + cartAttentionItemsHeight;
                            const cartSummaryHeightDiff = cartSummaryHeight - viewHeight + cartSummaryBottomSpacing;
                            // Check if the height of the order summary exceeds the viewport height, and if so, make it sticky.
                            if(cartSummaryHeightDiff > 0) {
                                if(!cartAttentionItemsComponent?.isStickyAttentionItems) {
                                    cartAttentionItemsComponent.updateIsStickyAttentionItems(true);
                                }
                            }
                        } else {
                            if(cartAttentionItemsComponent?.isStickyAttentionItems) {
                                cartAttentionItemsComponent.updateIsStickyAttentionItems(false);
                            }
                        }
                        const newCartSummaryOffsetTop = `-${cartSidebarOffsetTop}px`;
                        if(cartSidebar.style.top !== newCartSummaryOffsetTop) {
                            cartSidebar.style.top = newCartSummaryOffsetTop;
                        }
                    }
                }
            },

            lvipPopupModal() {
                this.$modal.show({
                    id: 'lvip-popup'
                });
            }
        }
    };
</script>
