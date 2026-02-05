<template>
    <div class="m-cartAddConfig" :class="modClasses">
        <div v-if="showQtity" class="m-cartAddConfig__quantity" :class="{'-hidden': lineType == 'LSD'}">
            <a-quantity v-model="quantity" :min-value="1" />
        </div>

        <div class="m-cartAddConfig__btn">
            <v-button
                class="h-full w-full justify-center"
                :class="ctaClasses"
                :aria-label="buttonAriaLabel"
                :disabled="loading || disabled"
                @click="submitProduct">

                {{ buttonText }}
            </v-button>
        </div>

        <div class="m-cartAddConfig__loading" role="alert">
            <a-loading-spinner :visible="loading" size="sm" />
        </div>

        <div v-if="(hasCartErrors || hasConfigurationError) && cartErrorMsg" class="m-cartAddConfig__error" role="alert">
            <p>
                <span role="text" v-html="cartErrorMsg"></span>
            </p>
        </div>

        <shelf>
            <template v-slot:default>
                <component
                    :is="!isBackupOrder ? 'm-shelf-confirm-cart' : 'm-shelf-confirm-bou'"
                    v-if="showConfirmation"
                    :cart-position="cartPosition"
                    :impressions-title="impressionsTitle"
                    :is-free-product="isFreeProduct"
                    :list-id="listId"
                    :family-id="familyId"
                    :is-bogo="isBogo" />

                <div
                    v-if="!isFreeProduct"
                    class="m-cartAddConfig__carousel" :class="{ '-buo' : isBackupOrder }">

                    <o-product-carousel
                        v-if="showCarousel && !isCn && !hasRiverbendRecommendedScriptId"
                        :is-shelf="true"
                        :is-backup-order="isBackupOrder"
                        :products="isBackupOrder ? cartData.Products : null"
                        :flags="userFlags"
                        :settings="carouselSettings" />
                    <o-product-carousel-cn
                        v-if="showCarousel && isCn"
                        :is-shelf="true"
                        :is-backup-order="isBackupOrder"
                        :products="isBackupOrder ? cartData.Products : null"
                        :flags="userFlags"
                        :settings="carouselSettings" />
                    <o-featured-products
                        v-if="hasRiverbendRecommendedScriptId"
                        script-id="shelfRiverbendRecommendedProducts"
                        mods="-shelf"
                        :show-one-price="true"
                        :size-on-bottom="true"
                        :is-recommended="true" />
                </div>
            </template>
        </shelf>

        <!-- Modal - Result of Add to Cart (Upsell) -->
        <m-add-items-modal
            v-if="cartUnavailableItems && cartUnavailableItems.Items"
            :ref="modalAddItems"
            :is-cart="true"
            :is-upsell="true"
            :is-cn="isCn"
            :localization="labels"
            :modal-id="modalAddItems">
        </m-add-items-modal>
    </div>
</template>

<script>

    import { mapActions, mapMutations, mapState, mapGetters } from 'vuex';

    export default {
        name: 'MCartAddConfig',
        props: {
            bouButtonLabel: {
                type: String,
                default: 'ADD'
            },
            buttonAriaLabel: {
                type: String,
                default: null
            },
            buttonLabel: {
                type: String,
                default: 'ADD TO CART'
            },
            disabled: {
                type: Boolean,
                default: false
            },
            canOneStep: {
                type: Boolean,
                default: false
            },
            cartPosition: {
                type: Number,
                default: null
            },
            category: {
                type: String,
                default: null
            },
            /** @typedef {{ FeatureSku: string, SelectedSku: string }} Configuration */
            /** @type {Array<Configuration>} */
            configurations: {
                type: Array,
                default: null
            },
            /** @type {Array<string>} */
            configurationErrors: {
                type: Array,
                default: () => []
            },
            configurationIsValid: {
                type: Boolean,
                default: true
            },
            ctaClasses: {
                type: String,
                default: null
            },
            hasConfigurationError: {
                type: Boolean,
                default: false
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            isBogo: {
                type: Boolean,
                default: false
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
            familyId: {
                type: String,
                default: null
            },
            // Used only on PatternLab to display Service Failure message
            forceError: {
                type: Boolean,
                default: false
            },
            modClasses: {
                type: String,
                default: null
            },
            selectedFacets: {
                type: Object,
                default: () => {}
            },
            showCarouselOnConfirm: {
                type: Boolean,
                default: true
            },
            showQtity: {
                type: Boolean,
                default: true
            },
            sku: {
                type: String,
                default: null
            },
            updateLabel: {
                type: String,
                default: null
            },
            // Used when adding an item from SavedForLater list page
            listId: {
                type: [Number, String],
                default: null
            },
            labels: {
                type: Object,
                default: () => {}
            },
            preSelectedSku: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                quantity: 1,
                carouselSettings: {
                    arrows: true,
                    dots: false,
                    infinite: false,
                    speed: 500,
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    variableWidth: true,
                    responsive: [
                        {
                            breakpoint: 768,
                            settings: {
                                infinite: false,
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                variableWidth: true
                            }
                        }
                    ]
                },
                modalAddItems: 'upsell-error-modal'
            };
        },
        computed: {
            ...mapState('addToCart', [ 'cartData', 'cartType', 'cartErrorMsg', 'isEdit', 'loading', 'hasCartErrors', 'selectedLineId', 'selectedQuantity', 'lineType', 'oneStepEligible', 'promotionId', 'selectedSku', 'upgradeAdPrevLineId', 'userFlags', 'cartUnavailableItems']),
            ...mapGetters('addToCart', ['isBackupOrder', 'showConfirmation' ]),
            ...mapState('savedForLater', [ 'savedForLaterItems' ]),
            buttonText() {
                if(this.isBackupOrder) {
                    return this.bouButtonLabel;
                } else if(this.isEdit && this.canOneStep && this.updateLabel) {
                    return this.updateLabel;
                } else {
                    return this.buttonLabel;
                }
            },
            hasRiverbendRecommendedScriptId() {
                return Boolean(document.getElementById('shelfRiverbendRecommendedProducts'));
            },
            /**
             * generate html string from array of configuration errors
             * @returns {string}
             */
            parsedConfigurationErrors() {
                return this.configurationErrors.join('<br />');
            },
            singleItemPriceGtm() {
                return this.data?.UserFlags?.ViewMemberPricing ? this.cartData?.Item?.Details?.PriceRange?.RawMinPreferredPrice : this.cartData?.Item?.Details?.PriceRange?.RawMinRegularPrice;
            },
            showCarousel() {
                let show = false;

                if(this.showConfirmation && this.showCarouselOnConfirm && !this.isBogo) {
                    if(this.isBackupOrder) {
                        if(this.cartData?.Products?.length) {
                            show = true;
                        }
                    } else {
                        show = true;
                    }
                }

                return show;
            },
            isCn() {
                return this.$env.IsCn || false;
            }
        },
        watch: {
            hasConfigurationError() {
                if(this.hasConfigurationError) {
                    this.SHOW_CART_ERRORS({ message: this.parsedConfigurationErrors });
                } else {
                    this.SHOW_CART_ERRORS({ message: ''});
                }
            },
            /** need to update store whenever configuration a new configuration is selected when showing error message */
            parsedConfigurationErrors() {
                if(this.hasCartErrors) {
                    this.SHOW_CART_ERRORS({ message: this.parsedConfigurationErrors });
                }
                if(this.parsedConfigurationErrors) {
                    this.SET_NEEDS_CONFIGURATIONS(this.parsedConfigurationErrors);
                }
            },
            showConfirmation() {
                if(this.showConfirmation) {
                    this.$shelf.show();
                    this.$emit('confirmation');
                    if(this.isBackupOrder) {
                        this.dataLayerPush();
                    }
                }
            },
            cartUnavailableItems: {
                deep: true,
                handler() {
                    // If there's unavailable items, then open the modal
                    if(this.cartUnavailableItems?.Items) {
                        this.$nextTick(() => {
                            this.openUnavailableItemsModal();
                        });
                    }
                }
            }
        },
        mounted() {
            if(this.hasConfigurationError) {
                this.SHOW_CART_ERRORS({ message: this.parsedConfigurationErrors });
            }
            // for non-kits having preselected sku, set configuration to true initially
            if(this.preSelectedSku) {
                this.SET_NEEDS_CONFIGURATIONS(true);
            }

            if(this.parsedConfigurationErrors) {
                this.SET_NEEDS_CONFIGURATIONS(this.parsedConfigurationErrors);
            }
            // This is set from the shelf config when cart is edited
            if(this.selectedQuantity > 0) {
                this.quantity = this.selectedQuantity;
            }
            this.$nextTick(() => {
                this.checkOneStep();
            });
            // Set is Seasonal event
            if(this.isSeasonalPromotion) {
                this.$store.commit('addToCart/SET_IS_SEASONAL_EVENTS', this.isSeasonalPromotion);
            }
        },
        methods: {
            ...mapActions('addToCart', ['addToCart', 'updateCart']),
            ...mapActions('cart', ['removeItem']),
            ...mapActions('customBackupOrder', ['updateOrder']),
            ...mapMutations('addToCart', ['SHOW_CART_ERRORS', 'ADD_TO_CART', 'SET_NEEDS_CONFIGURATIONS']),
            ...mapActions('savedForLater', ['removeSavedForLater']),

            checkOneStep() {
                // preSelectedSku is passed only for non-kit products
                if(!this.preSelectedSku && (this.oneStepEligible || this.canOneStep) && !this.isEdit && !this.parsedConfigurationErrors) {
                    this.submitProduct();
                }
            },
            checkSavedForLater() {
                if(this.savedForLaterItems && this.savedForLaterItems.length) {
                    // Check if the product is already in Saved For Later
                    const product = this.savedForLaterItems.find(prod => prod.Sku === this.sku);

                    // Remove product from Saved For Later if it's there
                    if(product) {
                        this.removeSavedForLater(product.Sku);

                        // If the product is from a list, then decrease list count
                        if(this.listId !== null) {
                            // Decrease items count in the list
                            this.$store.commit('shoppingLists/SET_ITEMS_COUNT', {
                                listId: this.listId,
                                decrease: true
                            });
                        }
                    }
                }
            },
            dataLayerPush() {
                let productDetail = this.cartData?.Item?.Details;
                const quantity = productDetail?.Quantity;
                window.dataLayer && window.dataLayer.push({
                    'event': 'addToCart',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '',
                        'add': {
                            'products': [
                                {
                                    'id': productDetail?.Sku || '',
                                    'name': productDetail?.Title || '',
                                    'price': (this.singleItemPriceGtm * quantity) || '',
                                    'brand': productDetail?.Brand || '',
                                    'list': 'Customizedbackuporder', // Value can be accessed from pageType in sitecore REQUIRED
                                    'category': productDetail?.Category || '',
                                    'variant': productDetail?.Variant || '',
                                    'quantity': quantity || ''
                                }
                            ]
                        }
                    }
                });
            },
            async submitProduct() {
                if(!this.loading) {
                    let product = {};

                    if(this.quantity > this.qtyAvailable && this.isSeasonalPromotion) {
                        this.SHOW_CART_ERRORS({ message: this.maximumQtyTip });
                        return false;
                    }
                    if(this.sku && this.quantity && !this.hasConfigurationError) {
                        product = {
                            Sku: this.sku,
                            Quantity: this.quantity,
                            Configurations: this.configurations,
                            Category: this.category,
                            LineId: this.selectedLineId,
                            LineType: this.lineType,
                            Position: this.cartPosition,
                            PromotionId: this.promotionId,
                            LineItemId: this.selectedLineId // needed for backup order
                        };

                        // Needed for SavedForLater List Page
                        if(this.listId !== null) {
                            product.ListId = this.listId;
                        }

                        // Check if the product is already in Saved For Later
                        this.checkSavedForLater();

                        if(this.upgradeAdPrevLineId) {
                            await this.removeItem({ lineId: this.upgradeAdPrevLineId });

                            this.$store.commit('addToCart/SET_UPGRADE_AD_PREV_LINE_ID', null);

                            // ForceError is used only on PatternLab to display Service Failure message
                            this.addToCart({product, forceError: this.forceError});
                        } else {
                            // ForceError is used only on PatternLab to display Service Failure message
                            this.addToCart({product, forceError: this.forceError});
                            this.SHOW_CART_ERRORS({ message: this.parsedConfigurationErrors });
                        }
                    } else {
                        this.SHOW_CART_ERRORS({ message: this.parsedConfigurationErrors });
                        this.$emit('submitError');
                    }
                }
            },
            openUnavailableItemsModal() {
                // Close shelf
                this.$shelf.hide();

                // Open modal
                if(this.$refs[this.modalAddItems]) this.$refs[this.modalAddItems].open(this.modalAddItems);
            }
        }
    };
</script>
