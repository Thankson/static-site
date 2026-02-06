<template>
    <article
        :class="['m-prodCard',{'-isCn': isCn},cardVersion]"
        :data-productid="product.Data.Sku">

        <component
            :is="(isCn && isPromotion && lvipStatus === null) ? 'div' : ( pdpLink && 'a' || 'div' )"
            :href="(isCn && isPromotion && lvipStatus === null) ? false : pdpLink || false"
            class="m-prodCard__row -content"
            @click="onClick"
        >
            <!-- Start: Stamps moved for CN -->
            <div
                v-if="product.Data.Stamps && isCn"
                class="m-prodCard__tag">

                <div>
                    <em
                        class="a-stamp"
                        :class="product.Data.Stamps.Style">

                        {{ product.Data.Stamps.StampTitle }}
                    </em>
                </div>
            </div>
            <!-- End: Stamps -->

            <!-- Start: Header -->
            <div class="m-prodCard__header">
                <!-- Start: Stamps -->
                <div
                    v-if="product.Data.Stamps && !isCn"
                    class="m-prodCard__tag">

                    <div>
                        <em
                            class="a-stamp"
                            :class="product.Data.Stamps.Style">

                            {{ product.Data.Stamps.StampTitle }}
                        </em>
                    </div>
                </div>
                <!-- End: Stamps -->

                <!-- Start: Media -->
                <div
                    v-if="product.Data.Image && product.Data.Image.Url"
                    class="m-prodCard__media">

                    <img
                        class="m-prodCard__hero"
                        :src="product.Data.Image.Url"
                        :alt="product.Data.Image.Alt ? product.Data.Image.Alt : product.Data.Title"
                        :aria-hidden="isCarousel ? 'true' : 'false'" />
                </div>
                <!-- End: Media -->

                <!-- Start: Title -->
                <div class="m-prodCard__heading">
                    <em class="m-prodCard__title">
                        {{ product.Data.Title }}
                    </em>
                </div>
                <!-- End: Title -->

                <!-- Start: Shop More -->
                <div
                    v-if="shopMoreText"
                    class="m-prodCard__shop">

                    {{ shopMoreText }}
                </div>
                <!-- End: Shop More -->
            </div>
            <!-- End: Header -->

            <!-- Start: Body -->
            <div class="m-prodCard__body">
                <div class="m-prodCard__content -top">
                    <div
                        v-if="!isCarousel"
                        class="m-prodCard__save"
                        :class="[!userFlags.IsAuthenticated && !userFlags.IsGuestShoppingEnabled ? 'pr-0' : '', (isCn && isSearch) ? '-isSearch' : '' ]">

                        <template v-if="userFlags.IsAuthenticated || userFlags.IsGuestShoppingEnabled || isPromotion">
                            <!-- Start: Preferred Savings -->
                            <template v-if="!userFlags.ViewMemberPricing && !isPromotion">
                                <span class="m-prodCard__text -saveInfo" v-html="isCn ? savingsPackText(savingsLabelPreferredPromotion, priceRange.PreferredMemberSavings) : savingsPackText(savingsLabelPreferred, priceRange.PreferredMemberSavings)"></span>

                                <span
                                    v-if="$slots['learn-more-link']"
                                    class="m-prodCard__text -saveLearn">

                                    <slot name="learn-more-link" />
                                </span>
                            </template>
                            <!-- End: Preferred Savings -->

                            <!-- Start: Promotion Savings || !Promotion Savings && !isPreferred -->
                            <template v-if="isPromotion">
                                <template v-if="hideLvipTooltipWhenUnauthed">
                                    <span v-if="userFlags.IsAuthenticated" class="m-prodCard__text -saveInfo" v-html="savingsLabelPreferredPromotion"></span>
                                    <template v-else>
                                        <span class="m-prodCard__text -saveInfo" v-html="becomeMemberRtePromotion"></span>
                                        <a
                                            v-if="becomeMemberUrl"
                                            class="cursor-pointer text-sm text-green underline"
                                            :href="becomeMemberUrl"
                                            @click.stop.prevent="becomeMemberLink">
                                            {{ learnMoreLabel }}
                                        </a>
                                    </template>
                                </template>
                                <span v-else class="m-prodCard__text -saveInfo" v-html="savingsLabelPreferredPromotion"></span>

                                <span
                                    v-if="$slots['learn-more-link']"
                                    class="m-prodCard__text -saveLearn">

                                    <slot name="learn-more-link" />
                                </span>
                            </template>
                            <!-- End: Promotion Savings || !Promotion Savings && !ispreferred -->

                            <!-- Start: Pack Savings -->
                            <template v-if="userFlags.ViewMemberPricing && priceRange.HasPackSavings && !isPromotion">
                                <icon-tag />
                                <span class="m-prodCard__text -saveInfo" v-html="savingsPackText(savingsLabelPack, priceRange.PackSavings)"></span>
                            </template>
                            <!-- End: Pack Savings -->
                        </template>

                        <div v-else>
                            <div v-html="becomeMemberRtePromotion" />

                            <a
                                v-if="becomeMemberUrl"
                                class="cursor-pointer text-sm text-green underline"
                                :href="becomeMemberUrl"
                                @click.stop.prevent="becomeMemberLink">

                                {{ learnMoreLabel }}
                            </a>
                        </div>

                        <!-- Start: IsPromotion Tooltip -->
                        <template v-if="!(hideLvipTooltipWhenUnauthed && !userFlags.IsAuthenticated)">
                            <div
                                v-if="isPromotion && lvipStatus === null"
                                :class="isPromotion ? '-isPromotion' : ''"
                                class="m-prodCard__tooltip">
                                <m-tooltip :tooltip-icon="tooltipIcon">
                                    <div v-html="tooltipText" />
                                    <a
                                        v-if="tooltipUrl && !isPromotionCarousel && !hideBecomememberLinkWhenAuthed"
                                        :href="tooltipUrl"
                                        class="block pt-20 text-green text-sm"
                                        @click.stop.prevent="tooltipLink">
                                        {{ learnMoreLabel }}
                                    </a>
                                </m-tooltip>
                            </div>
                        </template>
                        <!-- End: IsPromotion Tooltip -->
                    </div>
                </div>

                <div class="m-prodCard__content -bottom">
                    <!-- Start: Pricing -->
                    <div
                        v-if="shouldShowPrice"
                        class="m-prodCard__pricing">
                        <div
                            v-if="showStrikethroughOriginalPrice" class="m-prodCard__text -pricingStrikethrough">
                            <div v-if="userFlags.ViewMemberPricing && originalPriceMember && $slots['preferred-price-label']">
                                <span class="font-bold line-through text-md">{{ originalPriceMember }}
                                    <slot name="preferred-price-label">
                                    </slot>
                                </span>
                            </div>
                            <div v-else-if="userFlags.ViewMemberPricing && originalPriceMember && $slots['promotion-preferred-price-label']">
                                <span class="font-bold line-through text-md">{{ originalPriceMember }}
                                    <slot name="promotion-preferred-price-label">
                                    </slot>
                                </span>
                            </div>
                            <div v-else-if="originalPriceNonMember && $slots['regular-price-label']">
                                <span class="font-bold line-through text-md">{{ originalPriceNonMember }}
                                    <slot name="regular-price-label">
                                    </slot>
                                </span>
                            </div>
                        </div>
                        <!-- Start: Non-Carousel Pricing -->
                        <template v-if="!isCarousel">
                            <m-product-card-price
                                :concentrated-label="concentratedLabel"
                                :concentrated-preferred-price-per-unit="concentratedPreferredPricePerUnit"
                                :concentrated-price-per-unit-measurement-type="concentratedPricePerUnitMeasurementType"
                                :concentrated-regular-price-per-unit="concentratedRegularPricePerUnit"
                                :diluted-label="dilutedLabel"
                                :diluted-preferred-price-per-unit="dilutedPreferredPricePerUnit"
                                :diluted-price-per-unit-measurement-type="dilutedPricePerUnitMeasurementType"
                                :diluted-regular-price-per-unit="dilutedRegularPricePerUnit"
                                :is-promotion="isPromotion"
                                :lvip-status="lvipStatus"
                                :lvip-price-type="lvipPriceType"
                                :original-preferred-price-per-unit="originalPreferredPricePerUnit"
                                :original-price-per-unit-measurement-type="originalPricePerUnitMeasurementType"
                                :original-regular-price-per-unit="originalRegularPricePerUnit"
                                :promotion-regular-price-label="isPromotion ? promotionRegularPriceLabel : ''"
                                :preferred-price="preferredPrice"
                                :regular-price="regularPrice"
                                :is-restricted-pack="isRestricted"
                                :view-member-pricing="userFlags.ViewMemberPricing || (!userFlags.IsAuthenticated && !userFlags.IsGuestShoppingEnabled) || isPromotion">

                                <template v-if="$slots['restricted-pack-label']" v-slot:restricted-pack-label>
                                    <slot name="restricted-pack-label">
                                        Member-Only Offer
                                    </slot>
                                </template>

                                <template v-if="$slots['preferred-price-label']" v-slot:preferred-price-label>
                                    <slot name="preferred-price-label">
                                        Member <span class="sr-only">Price</span>
                                    </slot>
                                </template>

                                <template v-if="$slots['regular-price-label']" v-slot:regular-price-label>
                                    <slot name="regular-price-label">
                                        Non-Member <span class="sr-only">Price</span>
                                    </slot>
                                </template>
                            </m-product-card-price>
                        </template>
                        <!-- End: Non-Carousel Pricing -->

                        <!-- Start: Carousel Pricing -->
                        <span
                            v-else-if="showCarouselPrice"
                            class="m-prodCard__text -price -mdBold">

                            <span class="m-prodCard__text -price -mdBold">
                                <span v-html="userFlags.ViewMemberPricing ? preferredPrice : regularPrice" />
                            </span>
                            <!-- Price/Unit-EU specific -->
                            <PricePerUnit
                                v-if="carouselConcentratedPricePerUnit"
                                :label="concentratedLabel"
                                :price="carouselConcentratedPricePerUnit"
                                :unit="concentratedPricePerUnitMeasurementType"
                                :tailwind-mods="`text-xs text-gray flex flex-col font-normal mt-5`"
                            />
                            <PricePerUnit
                                v-if="carouselDilutedPricePerUnit"
                                :label="dilutedLabel"
                                :price="carouselDilutedPricePerUnit"
                                :unit="dilutedPricePerUnitMeasurementType"
                                :tailwind-mods="`text-xs text-gray flex flex-col font-normal`"
                            />
                            <PricePerUnit
                                v-if="carouselOriginalPricePerUnit"
                                :price="carouselOriginalPricePerUnit"
                                :unit="originalPricePerUnitMeasurementType"
                                :tailwind-mods="`text-xs text-gray flex flex-col font-normal mt-5`"
                            />
                        </span>
                        <!-- End: Carousel Pricing -->
                    </div>
                    <!-- End: Pricing -->

                    <!-- Start: Points -->
                    <div
                        v-if="showPoints && userFlags.ViewPoints"
                        class="m-prodCard__points">

                        <span
                            class="m-prodCard__text -points"
                            :class="{ '-highlight': userFlags.ViewPointsHighlight }"
                            v-html="points" />
                    </div>
                    <!-- End: Points -->

                    <div v-if="isRestricted" class="text-sm text-gray-150 font-normal pr-10">
                        {{ memberOnlyLabel }}
                    </div>

                    <!-- Start: Carousel Preferred Savings -->
                    <template v-if="(userFlags.IsAuthenticated || userFlags.IsGuestShoppingEnabled) && !isRestricted">
                        <div
                            v-if="isCarousel && !userFlags.ViewMemberPricing"
                            class="m-prodCard__save">
                            <span class="m-prodCard__text -saveInfo">
                                {{ youCouldSaveLabel }}
                            </span>
                            <span class="m-prodCard__text -saveAmount"> {{ saveText }} </span>
                        </div>
                    </template>
                    <!-- End: Carousel Preferred Savings -->
                </div>
            </div>
            <!-- End: Body -->
        </component>

        <!-- Start: Tooltip -->
        <div
            v-if="isCarousel && !userFlags.ViewMemberPricing && !isPromotion"
            class="m-prodCard__tooltip">

            <m-tooltip :tooltip-icon="tooltipIcon">
                <div v-html="tooltipText" />

                <a
                    v-if="tooltipUrl && !canUpgradeAccount"
                    :href="tooltipUrl"
                    class="block pt-20 text-green text-sm"
                    @click.stop.prevent="tooltipLink">

                    {{ learnMoreLabel }}
                </a>
            </m-tooltip>
        </div>
        <!-- End: Tooltip -->

        <!-- Start: Actions -->
        <div class="m-prodCard__row -actions">
            <div class="m-prodCard__button -shelfToggle">
                <template v-if="showShelfConfigurator">
                    <!-- Start: Configurator Toggle -->
                    <o-shelf-configurator
                        v-if="!offSaleDisplay && (!isSavingPack || isSavingPack && eligibleForSavingPacks)"
                        class="a-button justify-center -shelfToggle"
                        :impressions-title="impressionsTitle"
                        :sku="sku"
                        :family-id="familyId"
                        :pre-selected-configurations="product.Data.ConfigurationSkus || product.Data.Configurations"
                        :gtm-id="415"
                        :button-label="shelfConfigAriaLabel(product.Data)"
                        :product-name="product.Data.Title"
                        :class="computeClassesOnSelect"
                        :promotion-id="productPromotionId"
                        :line-type="productLineType"
                        :pre-selected-sku="product.Data.Image && product.Data.Image.Sku">

                        <template v-if="!isBackupOrder || isPromotion">
                            <span class="flex justify-center items-center text-white" :class="((isSearch && isCn) || (isCategory && isCn)) ? 'md:block' : 'md:hidden'" aria-hidden="true">
                                <span class="font-global-sans inline-block text-3xl leading-none mr-4">+</span>
                                <span class="material-icons inline-block">shopping_cart</span>
                            </span>

                            <span class="sr-only md:not-sr-only" :class="((isSearch && isCn) || (isCategory && isCn)) ? 'hidden' : 'md:block'">
                                {{ cardCta }}
                            </span>
                        </template>

                        <template v-else>
                            <span class="flex justify-center items-center">{{ cardCta }}</span>
                        </template>
                    </o-shelf-configurator>
                    <!-- End: Configurator Toggle -->

                    <!-- Sold out / Off sale -->
                    <div
                        v-if="offSaleDisplay"
                        class="m-prodCard__disabled">
                        {{ offSaleDisplay }}
                    </div>

                    <!-- Start: Add to List (only for logged users) -->
                    <m-shoplists-add-item
                        v-if="viewLists"
                        class="h-36"
                        :class="[{'mr-10': !isSearch && isCn}, {'ml-10': !isCn}]"
                        :is-shelf="true"
                        :left-popup="(isCn && isSearch)"
                        :is-carousel="isCarousel"
                        :is-category-list="!isCarousel"
                        :is-preferred="isPreferred"
                        :aria-label-cta="addItemAriaLabel(product.Data)"
                        :add-list-mods="addListMods"
                        :carousel-size="carouselSize"
                        :product="product.Data"
                        :pre-selected-configurations="product.ConfigurationSkus"
                        :script-id-configurator="scriptIdConfigurator"
                        :is-shown-off-sale-display="offSaleDisplay && offSaleDisplay.length > 0"
                        @add-list-popup="handleAddListPopup">

                        <template v-slot:icon>
                            <span class="material-icons" aria-hidden="true">playlist_add</span>
                        </template>
                    </m-shoplists-add-item>
                    <!-- End: Add to List (only for logged users) -->
                    <div
                        v-if="isSavingPack && !eligibleForSavingPacks"
                        class="m-prodCard__disabled">
                        {{ pastEligibleDateMessage }}
                    </div>
                </template>

                <div v-else-if="isCarousel" class="leading-tight" :class="{'w-full':isCn}">
                    <div v-html="becomeMemberRtePromotion" />
                    <a
                        v-if="becomeMemberUrl"
                        :href="becomeMemberUrl"
                        class="text-sm text-green underline">

                        {{ learnMoreLabel }}
                    </a>
                </div>
            </div>
        </div>
        <!-- End: Actions -->
    </article>
</template>

<script>
    import PricePerUnit from '@productstore/source/js/vue/components/00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'MProductCard',
        components: {
            PricePerUnit
        },
        props: {
            addListMods: {
                type: String,
                default: null
            },
            addListLabel: {
                type: String,
                default: null
            },
            shelfConfigLabel: {
                type: String,
                default: null
            },
            becomeMemberUrl: {
                type: String,
                default: ''
            },
            becomeMemberRte: {
                type: String,
                default: '<span class="text-sm text-gray-120"><i>Purchase by becoming a member.</i>'
            },
            canUpgradeAccount: {
                type: Boolean,
                default: false
            },
            cardCta: {
                type: String,
                default: 'Add'
            },
            cardVersion: {
                type: String,
                default: '-grid'
            },
            carouselSize: {
                type: String,
                default: '-lg'
            },
            comboLabel: {
                type: String,
                default: 'Shop more options'
            },
            concentratedLabel: {
                type: String,
                default: ''
            },
            dilutedLabel: {
                type: String,
                default: ''
            },
            eligibleForSavingPacks: {
                type: Boolean,
                default: false
            },
            familyId: {
                type: String,
                default: null
            },
            familyLabel: {
                type: String,
                default: 'Shop {0} options'
            },
            familyOffSaleMessage: {
                type: String,
                default: 'Unavailable'
            },
            getStartedLabel: {
                type: String,
                default: 'Get Started'
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            isCategory: {
                type: Boolean,
                default: false
            },
            isPreferred: {
                type: Boolean,
                default: false
            },
            isSavingPack: {
                type: Boolean,
                default: false
            },
            isPromotion: {
                type: Boolean,
                default: false
            },
            isCarousel: {
                type: Boolean,
                default: false
            },
            isPromotionCarousel: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isKr: {
                type: Boolean,
                default: false
            },
            isBackupOrder: {
                type: Boolean,
                default: false
            },
            isErpDateValid: {
                type: Boolean,
                default: true
            },
            isInventoryControlled: {
                type: Boolean,
                default: false
            },
            isSearch: {
                type: Boolean,
                default: false
            },
            isSoldOutLabel: {
                type: String,
                default: 'Sold Out'
            },
            isOffSale: {
                type: Boolean,
                default: false
            },
            isRestrictedPack: {
                type: Boolean,
                default: false
            },
            learnMoreLabel: {
                type: String,
                default: 'Learn More'
            },
            lvipStatus: {
                type: String,
                default: null
            },
            lvipPriceType: {
                type: String,
                default: null
            },
            memberOnlyLabel: {
                type: String,
                default: ''
            },
            offSaleMessage: {
                type: String,
                default: ''
            },
            offSaleTitle: {
                type: String,
                default: ''
            },
            onlineEnrollmentUrl: {
                type: String,
                default: ''
            },
            pastEligibleDateMessage: {
                type: String,
                default: null
            },
            pdpLink: {
                type: String,
                default: null
            },
            pointsLabel: {
                type: String,
                default: ''
            },
            pointsLabelSingular: {
                type: String,
                default: ''
            },
            position: {
                type: Number,
                default: null
            },
            product: {
                type: Object,
                default: () => ({
                    Labels: Object,
                    Data: {
                        ItemId: String,
                        Image: {
                            Url: String,
                            Alt: String
                        },
                        Title: String,
                        Category: String,
                        Brand: String,
                        Variant: String,
                        PriceRange: {
                            MinRegularPrice: String,
                            MaxRegularPrice: String,
                            ShowRangeForRegularPrice: Boolean,
                            MinPreferredPrice: String,
                            MaxPreferredPrice: String,
                            ShowRangeForPreferredPrice: Boolean,
                            MinPoints: String,
                            MaxPoints: String,
                            ShowRangeForPoints: Boolean,
                            PreferredMemberSavings: String,
                            PackSavings: String,
                            HasPackSavings: Boolean
                        },
                        Stamps: {
                            SortOrder: String,
                            Style: String,
                            StampTitle: String
                        },
                        ShowPreferredSavings: Boolean,
                        PdpLink: String,
                        Sku: String
                    },
                    Id: String
                })
            },
            quantityAvailable: {
                type: Number,
                default: 0
            },
            rangeSrText: {
                type: String,
                default: 'to'
            },
            saveLabel: {
                type: String,
                default: 'Save'
            },
            saveUpToLabel: {
                type: String,
                default: 'Save up to'
            },
            savingsLabelPack: {
                type: String,
                default: 'vs buying individual products'
            },
            savingsLabelPreferred: {
                type: String,
                default: 'by becoming a Preferred Member'
            },
            showCta: {
                type: Boolean,
                default: true
            },
            showStrikethroughFeatureFlag: {
                type: Boolean,
                default: false
            },
            showPoints: {
                type: Boolean,
                default: true
            },
            showPrices: {
                type: Boolean,
                default: true
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            sku: {
                type: String,
                default: null
            },
            tooltipIcon: {
                type: String,
                default: 'info'
            },
            tooltipText: {
                type: String,
                default: 'Tooltip'
            },
            userFlags: {
                type: Object,
                default: () => ({
                    IsGuestShoppingEnabled: false,
                    IsGuest: false,
                    IsAuthenticated: false,
                    ViewLists: false,
                    ViewMemberPricing: false,
                    ViewPoints: false
                })
            },
            youCouldSaveLabel: {
                type: String,
                default: 'You could'
            },
            promotionRegularPriceLabel: {
                type: String,
                default: ''
            },
            hideBecomememberLinkWhenAuthed: {
                type: Boolean,
                default: false
            },
            hideLvipTooltipWhenUnauthed: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                orderType: 'order',
                isSoldOut: false
            };
        },
        computed: {
            becomeMemberRtePromotion() {
                return this.becomeMemberRte.replace('{0}', this.priceRange.PreferredMemberSavings);
            },
            carouselConcentratedPricePerUnit() {
                return this.userFlags.ViewMemberPricing ? this.concentratedPreferredPricePerUnit : this.concentratedRegularPricePerUnit;
            },
            carouselDilutedPricePerUnit() {
                return this.userFlags.ViewMemberPricing ? this.dilutedPreferredPricePerUnit : this.dilutedRegularPricePerUnit;
            },
            carouselOriginalPricePerUnit() {
                return this.userFlags.ViewMemberPricing ? this.originalPreferredPricePerUnit : this.originalRegularPricePerUnit;
            },
            cnPriceCheck() {
                // CN only shows prices when logged in, this is global for all cards
                // To do: China can also use UnAuthenticateCustomerHidePrices flag on sitecore
                return !this.isCn || this.userFlags.IsAuthenticated;
            },
            computeClassesOnSelect() {
                let conditionalClasses = [];
                if(this.isBackupOrder) conditionalClasses.push('-white');
                ((this.isSearch && this.isCn) || (this.isCategory && this.isCn) || this.cardVersion === '-carousel') ? conditionalClasses.push('w-auto') : conditionalClasses.push('w-full');
                return conditionalClasses;
            },
            impressionPrice() {
                return this.userFlags.ViewMemberPricing ? this.product.Data.PriceRange.RawMinPreferredPrice : this.product.Data.PriceRange.RawMinRegularPrice;
            },
            canPurchaseRestrictedPacks() {
                return this.isRestrictedPack ? this.userFlags.CanPurchaseRestrictedPacks : true;
            },
            concentratedPreferredPricePerUnit() {
                return this.priceRange?.ConcentratedPreferredPricePerUnit ??
                    '';
            },
            concentratedPricePerUnitMeasurementType() {
                return this.priceRange?.ConcentratedPPUMeasurementType ??
                    '';
            },
            concentratedRegularPricePerUnit() {
                return this.priceRange?.ConcentratedRegularPricePerUnit ??
                    '';
            },
            dilutedPreferredPricePerUnit() {
                return this.priceRange?.DilutedPreferredPricePerUnit ??
                    '';
            },
            dilutedPricePerUnitMeasurementType() {
                return this.priceRange?.DilutedPPUMeasurementType ??
                    '';
            },
            dilutedRegularPricePerUnit() {
                return this.priceRange?.DilutedRegularPricePerUnit ??
                    '';
            },
            originalPriceMember() {
                const originalPriceMember = this.priceRange.OriginalPriceMember || '';
                if(!originalPriceMember) {
                    return '';
                }

                return `${originalPriceMember}`;
            },
            originalPriceNonMember () {
                const originalPriceNonMember = this.priceRange.OriginalPriceNonMember || '';
                if(!originalPriceNonMember) {
                    return '';
                }

                return `${originalPriceNonMember}`;
            },
            originalPreferredPricePerUnit() {
                return this.priceRange?.OriginalPreferredPricePerUnit ??
                    '';
            },
            originalPricePerUnitMeasurementType() {
                return this.priceRange?.OriginalPPUMeasurementType ??
                    '';
            },
            originalRegularPricePerUnit() {
                return this.priceRange?.OriginalRegularPricePerUnit ??
                    '';
            },
            isRestricted() {
                return this.isRestrictedPack;
            },
            savingsLabelPreferredPromotion() {
                return this.savingsLabelPreferred.replace('{0}', this.priceRange.PreferredMemberSavings);
            },
            offSaleDisplay() {
                let offsaleDisplay = '';
                const products = this.product.Data.Products || [];

                // FamilyType logic for products with multiple SKUs, combo or kit (applied to all components except Carousel)
                if(!this.isCarousel && this.product.Data.FamilyType && products.length) {
                    return this.checkOffSaleFamily(this.product.Data.FamilyType, products);
                }

                // Check OffSale / SoldOut logic for Standalone Product
                offsaleDisplay = this.checkOffSale({
                    isErpDateValid: this.isErpDateValid,
                    isInventoryControlled: this.isInventoryControlled,
                    quantityAvailable: this.quantityAvailable,
                    isOffSale: this.isOffSale,
                    offSaleTitle: this.offSaleTitle
                });

                return offsaleDisplay;
            },
            points() {
                const minPoints = this.priceRange.MinPoints || '';
                const rawMinPoints = this.priceRange.RawMinPoints || 0;
                const showRange = this.priceRange.ShowRangeForPoints || false;
                const label = rawMinPoints === 1 && !showRange ? this.pointsLabelSingular : this.pointsLabel;
                const hasToken = label.includes('{0}');

                if(!showRange) {
                    return hasToken ? label.replace('{0}', minPoints) : `${minPoints} ${label}`;
                }

                return hasToken
                    ? this.pointsLabel.replace('{0}', `${minPoints} ${this.rangeSrMarkup} ${this.priceRange.MaxPoints}`)
                    : `${minPoints} ${this.rangeSrMarkup} ${this.priceRange.MaxPoints} ${label}`;
            },
            priceRange() {
                return this.product.Data?.PriceRange || {};
            },
            preferredPrice() {
                const minPreferredPrice = this.priceRange.MinPreferredPrice || '';

                if(!this.priceRange.ShowRangeForPreferredPrice) {
                    return minPreferredPrice;
                }

                return `${minPreferredPrice} ${this.rangeSrMarkup} ${this.priceRange.MaxPreferredPrice}`;
            },
            rangeSrMarkup() {
                return ` <span class="sr-only">${this.rangeSrText}</span><span aria-hidden="true">-</span> `;
            },
            regularPrice() {
                const minRegularPrice = this.priceRange.MinRegularPrice || '';

                if(!this.priceRange.ShowRangeForRegularPrice) {
                    return minRegularPrice;
                }

                return `${minRegularPrice} ${this.rangeSrMarkup} ${this.priceRange.MaxRegularPrice}`;
            },
            saveText() {
                const isValid = this.priceRange.HasMultiplePacks ?? false;
                return isValid && this.priceRange.HasMultiplePacks ? this.saveUpToLabel : this.saveLabel;
            },
            shopMoreText() {
                const { Data: product } = this.product;
                let shopMoreText = '';

                if(product.FamilyType === 'MultipleCombo' || product.FamilyType === 'SingleCombo') {
                    shopMoreText = product.OverrideMessage || this.comboLabel;
                } else {
                    if(product.SkuCount > 1) {
                        shopMoreText = product.OverrideMessage ? product.OverrideMessage : this.familyLabel;
                    }
                }

                return shopMoreText.replace('{0}', product.SkuCount);
            },
            showCarouselPrice() {
                return this.userFlags.ViewMemberPricing
                    ? !this.$env.ProductPricing?.HideProductMemberPrice
                    : !this.$env.ProductPricing?.HideProductNonMemberPrice;
            },
            showShelfConfigurator() {
                return this.showCta && this.canPurchaseRestrictedPacks &&
                    ((this.userFlags.IsAuthenticated && !this.isPromotion) ||
                        (this.userFlags.IsGuestShoppingEnabled && !this.isPromotion) ||
                        ((this.isPromotion && this.lvipStatus != null) && (this.userFlags.IsAuthenticated ||
                            this.userFlags.IsGuestShoppingEnabled)));
            },
            shouldShowPrice() {
                // Hide if UnAuthenticateCustomerHidePrices flag is on
                // Flag is per market requisite
                if(this.userFlags?.UnAuthenticateCustomerHidePrices && !this.userFlags?.IsAuthenticated) {
                    return false;
                }
                return this.showPrices && this.cnPriceCheck;
            },
            showStrikethroughOriginalPrice() {
                const isAuthenticated = this.userFlags?.IsAuthenticated === true;
                const hasFeatureFlag = this.showStrikethroughFeatureFlag === true;
                const pricesMatch = this.priceRange?.MaxRegularPrice === this.priceRange?.MinRegularPrice;

                return isAuthenticated && hasFeatureFlag && pricesMatch;
            },
            tooltipUrl() {
                return this.userFlags.IsGuestShoppingEnabled ? this.onlineEnrollmentUrl : this.becomeMemberUrl;
            },
            productPromotionId() {
                const childPromotionId = this.product?.Data?.Products?.length ? this.product.Data.Products[0].PromotionId : null;
                return this.product?.Data?.PromotionId || childPromotionId;
            },
            productLineType() {
                const childLineType = this.product?.Data?.Products?.length ? this.product.Data.Products[0].LineType : null;
                return this.product?.Data?.LineType || childLineType;
            },
            viewLists() {
                return this.userFlags.ViewLists && !this.isPromotion && (!this.isSavingPack || (this.isSavingPack && this.eligibleForSavingPacks)) && !this.isSoldOut;
            },
            productCardId() {
                const card = this.product.Data;
                return card?.Products?.length === 1 ? card.Products[0].Sku : card.FamilyID;
            }
        },
        methods: {
            checkOffSale(params) {
                let offsaleDisplay = '';
                const { isErpDateValid, isInventoryControlled, isOffSale, quantityAvailable, offSaleTitle } = params;

                if(isErpDateValid) {
                    if(isOffSale) {
                        if(isInventoryControlled && !(quantityAvailable > 0)) {
                            offsaleDisplay = offSaleTitle;
                        }
                    } else {
                        if(isInventoryControlled && !(quantityAvailable > 0)) {
                            offsaleDisplay = this.isSoldOutLabel;
                        }
                    }
                } else {
                    offsaleDisplay = isOffSale ? offSaleTitle : this.isSoldOutLabel;
                }

                if(offsaleDisplay === this.isSoldOutLabel) {
                    this.isSoldOut = true;
                }
                return offsaleDisplay;
            },
            checkOffSaleFamily(familyType, products = []) {
                // SingleCombo
                if(familyType === 'SingleCombo') {
                    let parentSkuOffSaleTitle = null;
                    let parentSkuOffSale = false;
                    let allFeatureIsOk = true;
                    let thereIsOne = false;

                    products.forEach((prod) => {
                        // Check if parent is OffSale / SoldOut (default logic)
                        parentSkuOffSaleTitle = this.checkOffSale({
                            isErpDateValid: prod.IsErpDateValid,
                            isInventoryControlled: prod.IsInventoryControlled,
                            quantityAvailable: prod.quantityAvailable, // Come from SoldOut API
                            isOffSale: prod.IsOffSale,
                            offSaleTitle: prod.OffSaleTitle
                        });

                        // If the product is OffSale or SoldOut
                        if(parentSkuOffSaleTitle) {
                            parentSkuOffSale = true;
                        }

                        // Check if each child of each FSkus is OffSale / SoldOut (new logic)
                        if(prod.FeatureSkus) {
                            for (let feature of prod.FeatureSkus) {
                                // If the feature has children, then check the inventory for each children
                                if(feature.AvailableSelections?.length) {
                                    thereIsOne = false;

                                    for (let selection of feature.AvailableSelections) {
                                        // If the item is NOT inventory controlled OR has quantity > 0, it means the item is NOT offsale/soldout
                                        // and the feature has at least one available item
                                        if(!selection.IsInventoryControlled || selection.quantityAvailable > 0) {
                                            thereIsOne = true;
                                            break;
                                        }
                                    }
                                } else {
                                    // If the feature there's no children, then consider the feature as NOT offsale/soldout, because
                                    // the inventory was not checked
                                    thereIsOne = true;
                                }

                                // If the feature has NO available children
                                if(!thereIsOne) {
                                    // If any of the features has NO available children, it means the whole family is unavailable
                                    allFeatureIsOk = false;
                                    break;
                                }
                            }
                        }
                    });

                    // Family is OffSale/SoldOut if there's some parent that is offsale OR there's some feature with NO available children
                    if(parentSkuOffSale || !allFeatureIsOk) {
                        // OffSaleTitle from parent (Products[key].OffSaleTitle) OR fallback message
                        return parentSkuOffSaleTitle || this.familyOffSaleMessage;
                    }

                // Other family type
                } else {
                    let familyOffSale = true;
                    let offSaleTitle = null;

                    for (let prod of products) {
                        // Check if sku is NOT OffSale / SoldOut (default logic)
                        offSaleTitle = this.checkOffSale({
                            isErpDateValid: prod.IsErpDateValid,
                            isInventoryControlled: prod.IsInventoryControlled,
                            quantityAvailable: prod.quantityAvailable, // Come from SoldOut API
                            isOffSale: prod.IsOffSale,
                            offSaleTitle: prod.OffSaleTitle
                        });

                        // If at least one sku is NOT OffSale / SoldOut, it means the family is NOT unavailable
                        if(!offSaleTitle) {
                            familyOffSale = false;

                            break;
                        }
                    }

                    // If the family is unavailable
                    if(familyOffSale) {
                        // If it's MultipleNotAKit/MultipleBasicKit/MultipleBasic, then return generic FamilyOffSaleMessage label
                        if(familyType === 'MultipleNotAKit' || familyType === 'MultipleBasicKit' || familyType === 'MultipleBasic') {
                            offSaleTitle = this.familyOffSaleMessage;
                        }

                        // Otherwise return parent offsale message defined inside FOR loop OR fallback message
                        return offSaleTitle || this.familyOffSaleMessage;
                    }
                }
            },
            addItemAriaLabel(prod) {
                return this.addListLabel?.replace('{0}', prod.Title);
            },
            shelfConfigAriaLabel(prod) {
                return this.shelfConfigLabel?.replace('{0}', prod.Title);
            },
            onClick(event) {
                if(this.isCn && this.isPromotion && this.lvipStatus === null) return;
                event.preventDefault();
                event.stopPropagation();
                const salesForceLink = this.product.Data.SalesForceLink;

                // if the carousel's product card has a `salesForceLink`, then we assume that this is carousel is a "recommended products carousel";
                // otherwise, we do not have any other mechanism to discern "recommended products" carousels from other carousels:
                if(this.isCarousel && salesForceLink) {
                    document.location = salesForceLink;
                }
                if(this.pdpLink) {
                    this.gtmClickPush();
                }
            },
            tooltipLink() {
                window.location.href = this.tooltipUrl;
            },
            // bug #75096 -  the parent div click was overwriting the become member link
            becomeMemberLink() {
                window.location.href = this.becomeMemberUrl;
            },
            gtmClickPush() {
                const card = this.product.Data;
                let cardLink = card?.PdpLink || card?.PdpUrl;
                if(!cardLink) cardLink = '';
                const data = {
                    'id': this.productCardId || '', // Product ID or SKU (string)  REQUIRED
                    'name': card?.Title || '', // Product name (string)       REQUIRED
                    'price': this.impressionPrice || '', // Product price (string)
                    'brand': card?.Brand || '', // Product brand (string)
                    'category': card?.Category || '', // Product category (string)
                    'variant': card?.Variant || '', // Product variant (string)
                    'position': this.position || '' // Product position (number)
                };

                if(!window.google_tag_manager) {
                    document.location = cardLink; // Product's Page URL (string)
                    return;
                }

                console.log('Click push card Data', data, cardLink);

                window.dataLayer && window.dataLayer.push({
                    'event': 'productClick',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '', // Local currency
                        'click': {
                            'actionField': {'list': this.impressionsTitle || this.$gtmList }, // Product list (string)
                            'products': [data]
                        }
                    },
                    'eventCallback': function() {
                        document.location = cardLink; // Product's Page URL (string)
                    }
                });
            },
            handleAddListPopup(payload) {
                this.$emit('add-list-popup', {
                    isOpen: payload.isOpen,
                    isLoaded: payload.isLoaded,
                    index: this.$attrs && this.$attrs['slide-number'] > -1 ? this.$attrs['slide-number'] : null
                });
            },
            savingsPackText(savingsLabel, savings) {
                const label = this.saveText;

                if(!this.isKr) {
                    let save = `<span class="text-red font-bold">${(label || 'Save {0}')}`;

                    if(save.indexOf('{0}') > -1) {
                        save = save.replace('{0}', savings + '</span>' + savingsLabel);
                    } else {
                        save = save + ' ' + savings + '</span> ' + savingsLabel;
                    }

                    return save;
                } else {
                    let save = `${(savingsLabel || '{0}')}`;
                    save = save.replace('{0}', savings);
                    return save;
                }
            }
        }
    };
</script>
