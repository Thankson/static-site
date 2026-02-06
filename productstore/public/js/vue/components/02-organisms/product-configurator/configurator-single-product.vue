<template>
    <div>
        <slot
            name="before"
            v-bind="slotProps" />

        <m-refiner-image
            v-if="!isPdp && servicesSuccess"
            root-el="div"
            title-el="p"
            :title="product.OptionName"
            :image-url="data.Image && data.Image.Url ? data.Image.Url : null"
            :image-alt="data.Image && data.Image.Alt ? data.Image.Alt : product.OptionName"
            :selected="true" />

        <hr v-if="isPdp && servicesSuccess" class="o-productDetails__divider" />

        <m-error-card v-if="!servicesSuccess" :reload-text="servicesErrorReloadText" :text="servicesErrorText"></m-error-card>

        <slot
            name="between"
            v-bind="slotProps" />

        <o-configurator-included
            v-if="visibleIncludedConfigurations && visibleIncludedConfigurations.length > 0 && isRiverbend"
            :included-configurations="visibleIncludedConfigurations"
            :included-label="labels.Includes"
            :show-less-label="labels.ShowLess"
            :show-more-label="labels.ShowMore" />

        <template v-if="!readonly && servicesSuccess">
            <m-cart-add-config
                v-if="isCart || isPdp"
                :bou-button-label="labels.BuoAddToCart"
                :button-label="labels.AddToCart"
                :can-one-step="!isPdp"
                :category="category"
                :cart-position="cartPosition"
                :configurations="included"
                :configuration-errors="configurationErrors"
                :disabled="isOffsale"
                :family-id="product.FamilyId"
                :has-configuration-error="isOffsale"
                :impressions-title="impressionsTitle"
                :is-bogo="isBogo"
                :is-free-product="isFreeProduct"
                :is-seasonal-promotion="isSeasonalPromotion"
                :qty-available="isSeasonalPromotion ? qtyAvailable : 0"
                :maximum-qty-tip="isSeasonalPromotion ? maximumQtyTip : null"
                :list-id="listId"
                :line-item="data.LineItem"
                :show-carousel-on-confirm="showCarouselOnConfirm"
                :sku="product.Sku"
                :update-label="labels.UpdateCart"
                :labels="labels"
                :force-error="data.ForceErrorPatternLab || false" />

            <m-shoplists-add-config
                v-if="isAddList"
                :configurations="included"
                :configuration-errors="configurationErrors"
                :family-id="product.FamilyId"
                :is-offsale="isOffsale"
                :list-id="listId"
                :list-name="listName"
                :localization="labels"
                :options="data.Configurations"
                :product="product"
                :pre-selected-configurations="product.ConfigurationSkus"
                :price="data.UserFlags && data.UserFlags.ViewMemberPricing ? preferredPrice : regularPrice"
                :points="points"
                :script-id-configurator="scriptIdConfigurator"
                :show-preferred-pricing="data.UserFlags && data.UserFlags.ViewMemberPricing"
                :sku="product.Sku"
                :view-points="data.UserFlags && data.UserFlags.ViewPoints"
            />
        </template>

        <slot
            name="after"
            v-bind="slotProps" />
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import configuratorMixin from '../../../mixins/configurator';

    export default {
        name: 'ConfiguratorSingleProduct',
        mixins: [ configuratorMixin ],
        props: {
            data: {
                type: Object,
                default: () => {}
            },
            isBogo: {
                type: Boolean,
                default: false
            },
            isPdp: {
                type: Boolean,
                default: false
            },
            isCart: {
                type: Boolean,
                default: true
            },
            isAddList: {
                type: Boolean,
                default: false
            },
            isRiverbend: {
                type: Boolean,
                default: false
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            labels: {
                type: Object,
                default: () => {}
            },
            listId: {
                type: [Number, String],
                default: null
            },
            listName: {
                type: String,
                default: null
            },
            cartPosition: {
                type: Number,
                default: null
            },
            /** can't add to cart, add to list, or add to bou */
            readonly: {
                type: Boolean,
                default: false
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            servicesSuccess: {
                type: Boolean,
                default: true
            },
            servicesErrorReloadText: {
                type: String,
                default: ''
            },
            servicesErrorText: {
                type: String,
                default: ''
            },
            showCarouselOnConfirm: {
                type: Boolean,
                default: true
            },
            isSeasonalPromotion: {
                type: Boolean,
                default: false
            },
            qtyAvailable: {
                type: Number,
                default: 0
            },
            maximumQtyTip: {
                type: String,
                default: null
            }
        },
        computed: {
            ...mapState('customBackupOrder', ['selectedCategory']),
            category() {
                return this.selectedCategory !== 0 ? this.selectedCategory : '';
            },
            configurationErrors() {
                console.log('offsale: ', this.isOffsale);
                console.log('offsale product label: ', this.product.Offsale);
                console.log('labels: ', this.labels);
                console.log('offsale generic label: ', this.labels.OffSaleGenericMessage);
                return this.isOffsale ? [ this.product.Offsale || this.labels.OffSaleGenericMessage || 'Unavailable' ] : [];
            },
            isOffsale() {
                // For Add to List, offsale/sold out will always be false
                if(this.isAddList) {
                    return false;
                }

                return !!this.product.Offsale || this.product.IsSoldOut;
            },
            concentratedLabel() {
                return this.labels?.Concentrated;
            },
            concentratedPricePerUnitMeasurementType() {
                return this.product?.PriceRange?.ConcentratedPPUMeasurementType;
            },
            concentratedPreferredPricePerUnit() {
                return this.product?.PriceRange?.ConcentratedPreferredPricePerUnit;
            },
            concentratedRegularPricePerUnit() {
                return this.product?.PriceRange?.ConcentratedRegularPricePerUnit;
            },
            dilutedLabel() {
                return this.labels?.Diluted;
            },
            dilutedPricePerUnitMeasurementType() {
                return this.product?.PriceRange?.DilutedPPUMeasurementType;
            },
            dilutedPreferredPricePerUnit() {
                return this.product?.PriceRange?.DilutedPreferredPricePerUnit;
            },
            dilutedRegularPricePerUnit() {
                return this.product?.PriceRange?.DilutedRegularPricePerUnit;
            },
            originalPriceMember() {
                return this.product?.PriceRange?.OriginalPriceMember;
            },
            originalPriceNonMember() {
                return this.product?.PriceRange?.OriginalPriceNonMember;
            },
            originalPricePerUnitMeasurementType() {
                return this.product?.PriceRange?.OriginalPPUMeasurementType;
            },
            originalPreferredPricePerUnit() {
                return this.product?.PriceRange?.OriginalPreferredPricePerUnit;
            },
            originalRegularPricePerUnit() {
                return this.product?.PriceRange?.OriginalRegularPricePerUnit;
            },
            preferredPrice() {
                const price = this.product.PriceRange?.MinPreferredPrice || '';
                return !this.isFreeProduct ? price : this.getFreeProductPriceLabel(price, this.product.PriceRange?.RawMinPreferredPrice || 0);
            },
            preferredSavings() {
                if(this.labels.PreferredMemberSaving && this.product.PriceRange) {
                    return this.labels.PreferredMemberSaving.replace('{0}', this.product.PriceRange.PreferredMemberSavings);
                } else {
                    return '';
                }
            },
            product() {
                return this.data.Products?.[0] || {};
            },
            points() {
                return this.product.PriceRange?.MinPoints;
            },
            rawPoints() {
                return this.product.PriceRange?.RawMinPoints;
            },
            regularPrice() {
                const price = this.product.PriceRange?.MinRegularPrice || '';
                return !this.isFreeProduct ? price : this.getFreeProductPriceLabel(price, this.product.PriceRange?.RawMinRegularPrice || 0);
            },
            slotProps() {
                return {
                    accessories: this.product.Accessories,
                    description: this.product.Description,
                    hasPackSavings: this.product.PriceRange.HasPackSavings,
                    concentratedLabel: this.concentratedLabel,
                    concentratedPricePerUnitMeasurementType: this.concentratedPricePerUnitMeasurementType,
                    concentratedPreferredPricePerUnit: this.concentratedPreferredPricePerUnit,
                    concentratedRegularPricePerUnit: this.concentratedRegularPricePerUnit,
                    dilutedLabel: this.dilutedLabel,
                    dilutedPricePerUnitMeasurementType: this.dilutedPricePerUnitMeasurementType,
                    dilutedPreferredPricePerUnit: this.dilutedPreferredPricePerUnit,
                    dilutedRegularPricePerUnit: this.dilutedRegularPricePerUnit,
                    originalPriceMember: this.originalPriceMember,
                    originalPriceNonMember: this.originalPriceNonMember,
                    originalPricePerUnitMeasurementType: this.originalPricePerUnitMeasurementType,
                    originalPreferredPricePerUnit: this.originalPreferredPricePerUnit,
                    originalRegularPricePerUnit: this.originalRegularPricePerUnit,
                    packSavings: this.product.PriceRange.PackSavings,
                    preferredPrice: this.preferredPrice,
                    preferredSavings: this.preferredSavings,
                    points: this.points,
                    pdpLink: this.product.Url,
                    isOffsale: this.isOffsale,
                    isPreferred: this.data.UserIsPreferred,
                    // this is hard coded as false, because this component will never return a price range
                    isPriceRange: false,
                    rawPoints: this.rawPoints,
                    regularPrice: this.regularPrice,
                    size: this.product.Size,
                    sku: this.product.Sku,
                    stamps: this.product.Stamps,
                    title: this.product.Name || '',
                    labels: this.labels
                };
            }
        },
        mounted() {
            if(this.isPdp) {
                this.setProduct({
                    sku: this.product.Sku,
                    name: this.product.Name,
                    url: this.product.Url,
                    size: this.product.Size,
                    stamps: this.product.Stamps,
                    userFlags: this.data.UserFlags,
                    // the property "weight" is being used in riverbend
                    weight: this.product.Weight
                });
            }
        },
        methods: {
            ...mapActions('productDetailPage', ['setProduct'])
        }
    };
</script>
