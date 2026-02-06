<template>
    <button
        type="button"
        :aria-label="buttonLabel"
        :aria-disabled="ariaDisabled"
        :tabindex="tabIndex"
        v-on="!preventDefault ? {
            click: (evt) => {
                checkGtm(evt);
                onButtonClick();
            }} : {
            click: (evt) => {
                checkGtm(evt);
                $emit('click');
            }
        }">

        <slot />

        <shelf>
            <template v-slot:default>
                <div class="o-shelfCart">
                    <a-loading-spinner
                        id="global-shelf-heading"
                        :visible="shelfLoading || loading || (!needsConfigurations && oneStepEligible)" />

                    <!-- Display Service Failure Message (ONLY for Shelf API) -->
                    <m-error-card
                        v-if="!Object.keys(data).length && !shelfLoading && !loading && !servicesSuccessShelf && !hasCartErrors"
                        class="mt-40"
                        :reload-text="getLocalizationProp('Labels.RefreshPage')"
                        :text="getLocalizationProp('Labels.GenericFailureMessage')"></m-error-card>

                    <!-- Display Configurator ONLY if there's no error on Shelf API -->
                    <o-product-configurator
                        v-if="Object.keys(data).length > 0"
                        :class="{'hidden': shelfLoading || loading || (!needsConfigurations && oneStepEligible)}"
                        :data="data"
                        :impressions-title="impressionsTitle"
                        :is-bogo="isBogo"
                        :is-seasonal-promotion="isSeasonalPromotion"
                        :qty-available="isSeasonalPromotion ? qtyAvailable : 0"
                        :maximum-qty-tip="isSeasonalPromotion ? maximumQtyTip : null"
                        :pre-selected-sku="preSelectedSku"
                        :pre-selected-configurations="preSelectedConfigurations"
                        :cart-position="cartPosition"
                        :category="category"
                        :is-free-product="isFreeProduct"
                        :labels="getLocalizationProp('Labels.Configurator', {})"
                        :one-step="oneStep"
                        :services-success="!cartRequestFail"
                        :script-id-configurator="scriptId"
                        :services-error-reload-text="getLocalizationProp('Labels.RefreshPage')"
                        :services-error-text="getLocalizationProp('Labels.GenericFailureMessage')"
                        :show-carousel-on-confirm="showCarouselOnConfirm"
                        :list-id="listId">

                        <template v-slot:before="$configurator">
                            <h2 id="global-shelf-heading" class="o-shelfCart__heading">
                                <span role="text">
                                    {{ $configurator.isKit ? $configurator.labels.YourChoices : $configurator.labels.YourChoice }}

                                    <br />
                                    <span class="o-shelfCart__for">{{ $configurator.labels.For }}</span>
                                </span>

                                <component
                                    :is="$configurator.pdpLink ? 'a' : 'span'"
                                    :href="$configurator.pdpLink || false"
                                    class="o-shelfCart__link"
                                    :class="!$configurator.pdpLink ? 'no-underline text-black' : ''">

                                    {{ $configurator.title }}
                                </component>
                            </h2>
                            <div class="m-productInfo">
                                <div class="m-productInfo__wrapper">
                                    <p class="m-productInfo__price">
                                        <template v-if="viewMemberPricing">
                                            <template v-if="isCn && isBogo && product">
                                                {{ product.CouponPrice > 0 ? product.FormattedCouponPrice : getSrLabel($configurator.preferredPrice) }}
                                            </template>
                                            <template v-else>
                                                <span v-html="getSrLabel($configurator.preferredPrice)"></span>
                                            </template>
                                        </template>
                                        <template v-else>
                                            <span v-html="getSrLabel($configurator.regularPrice)"></span>
                                        </template>
                                    </p>
                                    <p v-if="viewPoints" class="m-productInfo__points">
                                        {{ $configurator.labels.Points }}:
                                        <span class="m-productInfo__accent">
                                            <template v-if="showProductPoints">
                                                {{ $configurator.points }}
                                            </template>
                                            <template v-else>
                                                0
                                            </template>
                                        </span>
                                    </p>
                                </div>
                                <div v-if="viewMemberPricing">
                                    <PricePerUnit
                                        v-if="$configurator.originalPreferredPricePerUnit &&
                                            $configurator.originalPricePerUnitMeasurementType"
                                        :price="$configurator.originalPreferredPricePerUnit"
                                        :unit="$configurator.originalPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                    <PricePerUnit
                                        v-if="$configurator.concentratedPreferredPricePerUnit &&
                                            $configurator.concentratedPricePerUnitMeasurementType"
                                        :label="getLocalizationProp('Labels.Configurator.Concentrated')"
                                        :price="$configurator.concentratedPreferredPricePerUnit"
                                        :unit="$configurator.concentratedPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                    <PricePerUnit
                                        v-if="$configurator.dilutedPreferredPricePerUnit &&
                                            $configurator.dilutedPricePerUnitMeasurementType"
                                        :label="getLocalizationProp('Labels.Configurator.Diluted')"
                                        :price="$configurator.dilutedPreferredPricePerUnit"
                                        :unit="$configurator.dilutedPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                </div>
                                <div v-if="!viewMemberPricing">
                                    <PricePerUnit
                                        v-if="$configurator.originalRegularPricePerUnit &&
                                            $configurator.originalPricePerUnitMeasurementType"
                                        :price="$configurator.originalRegularPricePerUnit"
                                        :unit="$configurator.originalPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                    <PricePerUnit
                                        v-if="$configurator.concentratedRegularPricePerUnit &&
                                            $configurator.concentratedPricePerUnitMeasurementType"
                                        :label="getLocalizationProp('Labels.Configurator.Concentrated')"
                                        :price="$configurator.concentratedRegularPricePerUnit"
                                        :unit="$configurator.concentratedPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                    <PricePerUnit
                                        v-if="$configurator.dilutedRegularPricePerUnit &&
                                            $configurator.dilutedPricePerUnitMeasurementType"
                                        :label="getLocalizationProp('Labels.Configurator.Diluted')"
                                        :price="$configurator.dilutedRegularPricePerUnit"
                                        :unit="$configurator.dilutedPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                </div>
                            </div>
                        </template>
                        <template v-slot:after>
                            <div v-if="shelfText && !isFreeProduct" class="o-shelfCart__upsellText">
                                <a-icon class="mr-7 text-red align-middle" size="large">sell</a-icon>
                                <span v-html="replaceTokenArray(shelfText, [savings])"></span>
                            </div>
                        </template>
                    </o-product-configurator>
                </div>
            </template>
        </shelf>
    </button>
</template>

<script>
    import api from '@api/routes/shelf';
    import { mapActions, mapMutations, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import logError from '../../../utils/log-api-error';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import PricePerUnit from '@productstore/source/js/vue/components/00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'OShelfConfigurator',
        components: { PricePerUnit },
        mixins: [ localizationMixin ],
        props: {
            ariaDisabled: {
                type: Boolean,
                default: false
            },
            buttonLabel: {
                type: String,
                default: null
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            sku: {
                type: String,
                default: null
            },
            familyId: {
                type: String,
                default: null
            },
            hasWelcomeLsdBalance: {
                type: Boolean,
                default: false
            },
            lineId: {
                type: String,
                default: null
            },
            quantity: {
                type: Number,
                default: 0
            },
            lineType: {
                type: String,
                default: 'Normal'
            },
            isFreeProduct: {
                type: Boolean,
                default: false
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
            },
            isBogo: {
                type: Boolean,
                default: false
            },
            // Used when adding an item from SavedForLater list page
            listId: {
                type: [Number, String],
                default: null
            },
            isEdit: {
                type: Boolean,
                default: false
            },
            cart: {
                type: String,
                default: 'order'
            },
            category: {
                type: String,
                default: ''
            },
            cartPosition: {
                type: Number,
                default: null
            },
            closePreviousShelf: {
                type: Boolean,
                default: false
            },
            gtmId: {
                type: Number,
                default: null
            },
            preSelectedSku: {
                type: String,
                default: null
            },
            /** @typedef {{ FeatureSku: string, SelectedSku: string }} Configuration */
            /** @type {Array<Configuration>} */
            preSelectedConfigurations: {
                type: Array,
                default: () => []
            },
            preventDefault: {
                type: Boolean,
                default: false
            },
            productName: {
                type: String,
                default: ''
            },
            promotionId: {
                type: [Number, String],
                default: null
            },
            savings: {
                type: String,
                default: ''
            },
            scriptId: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            shelfText: {
                type: String,
                default: null
            },
            showCarouselOnConfirm: {
                type: Boolean,
                default: true
            },
            tabIndex: {
                type: Number,
                default: 0
            },
            upsell: {
                type: Object,
                default: () => {}
            },
            product: {
                type: Object,
                default: () => {}
            },
            /**
             * Temporary testing prop to control response object
             */
            ...(process.env.MOCK_SERVER && {
                configurator: {
                    type: String,
                    default: '3'
                }
            })
        },
        data() {
            return {
                data: {},
                shelfLoading: false,
                oneStep: {},
                servicesSuccessShelf: true
            };
        },
        computed: {
            ...mapState('addToCart', [ 'loading', 'hasCartErrors', 'oneStepEligible', 'cartRequestFail', 'needsConfigurations' ]),
            isCn() {
                return this.$env?.IsCn || false;
            },
            showProductPoints() {
                return !this.isFreeProduct || !this.hasWelcomeLsdBalance;
            },
            viewPoints() {
                return this.data.UserFlags?.ViewPoints || false;
            },
            viewMemberPricing() {
                return this.data.UserFlags?.ViewMemberPricing || false;
            }
        },
        mounted() {
            if(this.closePreviousShelf) {
                this.$shelf.hide();
            }
            this.$shelf.$on.hidden(() => {
                this.SET_CART_REQUEST_FAIL(false);
                this.data = {};
            });
        },
        methods: {
            ...mapMutations('addToCart', ['CLEAR_CART_ERRORS', 'SET_CAN_EDIT_MORE_THAN_QUANTITY', 'SET_CART_DATA', 'SET_IS_PREFERRED', 'SET_IS_EDIT', 'SET_USER_FLAGS', 'RESET_CONFIRMATION', 'SET_LOADING', 'SET_CART_REQUEST_FAIL', 'SET_IS_ONE_STEP_ELIGIBLE', 'SET_UPSELL', 'SET_BOGO_ADD_TO_CARD_PRODUCT']),
            ...mapActions('cart', { getCartData: 'getData' }),
            replaceTokenArray,

            checkGtm(event) {
                // Edit on Cart page
                if(this.cart === 'order' && this.isEdit) this.gtmTrackAction({id: 214}, event);
                else if(this.gtmId && this.productName) this.gtmTrackAction({id: this.gtmId, text: this.productName}, event);
                else if(this.gtmId) this.gtmTrackAction({id: this.gtmId}, event);
            },

            async getData() {
                this.$shelf.show();
                this.$emit('open', this.sku);
                this.CLEAR_CART_ERRORS();
                this.RESET_CONFIRMATION();
                this.SET_IS_ONE_STEP_ELIGIBLE(false);
                this.SET_BOGO_ADD_TO_CARD_PRODUCT(this.product);

                if(!this.shelfLoading) {
                    this.shelfLoading = true;

                    const params = {
                        Sku: this.sku,
                        FamilyId: this.familyId,
                        ...(process.env.MOCK_SERVER && { configurator: this.configurator }) // only for testing purposes
                    };
                    const [ response ] = await Promise.all([
                        api.query(params),
                        this.isFreeProduct ? this.getCartData() : null
                    ]);

                    if(response.success && response.data?.Success && response.data?.Data) {
                        this.SET_CART_DATA({
                            CartType: this.cart,
                            LineId: this.lineId,
                            Quantity: this.quantity,
                            LineType: this.lineType,
                            PromotionId: this.promotionId,
                            Sku: this.sku
                        });
                        this.data = response.data.Data;
                        this.oneStep = this.data.OneStep;
                        const canOneStep = this.data.OneStep?.IsEligible || (this.preSelectedSku !== null) || this.preSelectedConfigurations?.length > 0;

                        // Used only on PatternLabe to display Service Failure message
                        this.data.ForceErrorPatternLab = this.localization?.Data?.ForceErrorPatternLab || false;
                        this.shelfLoading = false;
                        this.servicesSuccessShelf = true;
                        this.SET_CAN_EDIT_MORE_THAN_QUANTITY(this.data.Configurations.length > 0);
                        this.SET_IS_PREFERRED(this.data.UserIsPreferred);
                        this.SET_IS_EDIT(this.isEdit);
                        // for upsell, we want to check the `IsEligible` property from the upsell API (not the shelf API):
                        if(this.upsell?.OneStep.IsEligible) {
                            this.SET_IS_ONE_STEP_ELIGIBLE(true);
                        } else {
                            this.SET_IS_ONE_STEP_ELIGIBLE(canOneStep);
                        }
                        this.SET_USER_FLAGS(this.data.UserFlags);
                    } else {
                        this.SET_LOADING(false);
                        this.shelfLoading = false;
                        this.servicesSuccessShelf = false;
                        const msg = response.data?.ErrorMessages || response.data?.ErrorMessage;
                        logError(api.route, response.error, msg);
                    }
                }
            },

            getSrLabel(details) {
                if(details.includes('-') && this.localization?.Labels?.Configurator?.RangeSrText) {
                    return '<span class="sr-only">' + details.replace('-', this.localization.Labels.Configurator.RangeSrText) + '</span> <span aria-hidden=true">' + details + '</span>';
                } else {
                    return details;
                }
            },

            onButtonClick() {
                this.$emit('shelf-open');

                // Because the cart page can have multiple upsell-message.vue components, we have to set the upsell
                // object to one that the user has selected. This happens when shelf-configurator's <button> is clicked:
                this.SET_UPSELL(this.upsell);

                this.getData();
            }
        }
    };
</script>
