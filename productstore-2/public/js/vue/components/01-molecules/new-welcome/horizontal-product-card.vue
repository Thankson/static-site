<template>
    <article
        class="m-horizProdCard">
        <div class="m-horizProdCard__row">
            <div class="m-horizProdCard__col -left">
                <div class="m-horizProdCard__media">
                    <div class="m-horizProdCard__hero">
                        <img
                            v-if="product.Image"
                            :src="product.Image.Url"
                            :alt="product.Image.Alt ? product.Image.Alt : product.Title"
                        />
                    </div>
                </div>
            </div>

            <div class="m-horizProdCard__col -right">
                <div v-if="title" class="m-horizProdCard__title">
                    <a
                        :href="product.PdpLink"
                        class="m-horizProdCard__link">
                        {{ title }}
                    </a>

                </div>

                <div id="reviews">
                    <div :id="snippetId">
                    </div>
                </div>

                <div class="m-horizProdCard__bottom">
                    <span class="m-horizProdCard__price">{{ price }}</span>
                    <template v-if="product">
                        <a-quantity
                            v-show="showQuantity"
                            :ref="`aquantity-${lineId}`"
                            :key="quantityKey"
                            class="-horizontalCard"
                            :disabled="loading"
                            :min-value="0"
                            :max-length="2"
                            :show-hover="true"
                            :value="updatedQuantity"
                            @input="updateQuantity" />

                        <o-shelf-configurator
                            v-show="!showQuantity"
                            ref="shelf-config"
                            class="m-horizProdCard__button"
                            :aria-label="addItemAriaLabel(product)"
                            :family-id="product.FamilyID"
                            :is-free-product="true"
                            :has-welcome-lsd-balance="hasWelcomeLsdBalance"
                            :line-type="hasWelcomeLsdBalance ? 'WelcomeProgram' : 'Normal'"
                            :prevent-default="true"
                            :sku="product.Sku"
                            script-id="data-shelf-configurator-localization"
                            @click="addProduct">
                            <span>+{{ labels.Cta }}</span>
                        </o-shelf-configurator>
                    </template>
                </div>
            </div>
        </div>

        <FreeProductValidationModal
            ref="validation-modal"
            :duplicate-products="duplicateProducts"
            :cancel-label="validationModalLabels.Cancel"
            :error-label="validationModalLabels.ErrorText"
            :family-id="product.FamilyID"
            :removed-label="validationModalLabels.RemovedText"
            :service-error-label="validationModalLabels.ServiceErrorText"
            :title-label="validationModalLabels.Title"
            :undo-label="validationModalLabels.Undo"
            :update-cart-label="validationModalLabels.UpdateCart"
        />

        <FreeProductVideoPrompt
            ref="video-prompt"
            :title-label="videoModalPromptLabels.Title"
            :watch-video-label="videoModalPromptLabels.WatchVideo"
        />
    </article>
</template>

<script>
    import FreeProductValidationModal from '../../02-organisms/modals/free-product-validation-modal.vue';
    import FreeProductVideoPrompt from '../../02-organisms/modals/free-product-video-prompt.vue';
    import { mapActions, mapGetters, mapState } from 'vuex';

    export default {
        name: 'HorizontalProductCard',
        components: {
            FreeProductValidationModal,
            FreeProductVideoPrompt
        },
        props: {
            product: {
                type: Object,
                default: () => ({
                    ItemId: String,
                    Image: {
                        Url: String,
                        Alt: String
                    },
                    Title: String,
                    Category: String,
                    Brand: String,
                    Variant: String,
                    FamilyId: String,
                    ShowPreferredSavings: Boolean,
                    PdpLink: String,
                    Sku: String
                })
            },
            labels: {
                type: Object,
                default: () => ({
                    AriaLabel: String,
                    Cta: String
                })
            },
            quantity: {
                type: Number,
                default: 0
            },
            validationModalLabels: {
                type: Object,
                default: () => ({
                    Cancel: String,
                    ErrorText: String,
                    RemovedText: String,
                    ServiceErrorText: String,
                    Title: String,
                    Undo: String,
                    UpdateCart: String
                })
            },
            videoModalPromptLabels: {
                type: Object,
                default: () => ({
                    Title: String,
                    WatchVideo: String
                })
            }
        },
        data() {
            return {
                updatedQuantity: 0
            };
        },
        computed: {
            ...mapState('cart', ['items', 'loading']),
            ...mapGetters('cart', ['hasWelcomeLsdBalance']),
            ...mapGetters('welcome', ['showVideoModal']),

            duplicateProducts() {
                return this.items.filter((item) => {
                    const familyIdMatch = item?.FamilyId === this.product?.FamilyID;
                    const accessoryMatch = this.product?.Accessories?.some(accessory => accessory?.Sku === item?.Sku);
                    return familyIdMatch || accessoryMatch;
                });
            },
            lineId() {
                return this.product?.LineId;
            },
            price() {
                const minPrice = this.product?.PriceRange?.MinPreferredPrice;
                const maxPrice = this.product?.PriceRange?.MaxPreferredPrice;
                if(minPrice === maxPrice) {
                    return maxPrice;
                } else {
                    return minPrice + ' - ' + maxPrice;
                }
            },
            quantityKey() {
                return this.quantity;
            },
            showQuantity() {
                return this.updatedQuantity > 0;
            },
            showValidationModal() {
                return this.duplicateProducts.length > 1;
            },
            snippetId() {
                return `category-snippet-${this.product?.ItemId}`;
            },
            title() {
                return this.product?.Title;
            }
        },
        watch: {
            quantity(newVal) {
                this.updatedQuantity = newVal;
            }
        },
        mounted() {
            this.updatedQuantity = this.quantity;
        },
        updated() {
            this.updatedQuantity = this.quantity;
        },
        methods: {
            ...mapActions('cart', { updateCartQuantity: 'updateQuantity' }),

            addItemAriaLabel(prod) {
                return this.addListLabel?.replace('{0}', prod.Title);
            },
            addProduct() {
                if(!this.showVideoModal) {
                    this.$refs[`shelf-config`]?.onButtonClick();
                } else {
                    this.$refs['video-prompt']?.show();
                }
            },
            dataLayerRemove(quantity) {
                const price = quantity ? (this.singleItemPriceGtm * quantity) : this.totalItemPriceGtm;
                window.dataLayer && window.dataLayer.push({
                    'event': 'removeFromCart',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '',
                        'remove': {
                            'products': [{
                                'id': this.sku || '',
                                'name': this.title || '',
                                'price': price || '',
                                'brand': this.brand || '',
                                'category': this.category || '',
                                'variant': this.variant || '',
                                'quantity': quantity || this.quantity || ''
                            }]
                        }
                    }
                });
            },
            dataLayerAdd(quantity) {
                window.dataLayer && window.dataLayer.push({
                    'event': 'addToCart',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '',
                        'add': {
                            'products': [{
                                'id': this.sku || '',
                                'name': this.title || '',
                                'price': (this.singleItemPriceGtm * quantity) || '',
                                'brand': this.brand || '',
                                'category': this.category || '',
                                'variant': this.variant || '',
                                'quantity': quantity || this.quantity || ''
                            }]
                        }
                    }
                });
            },
            decreaseQuantity() {
                if(this.loading) return;

                const product = this.duplicateProducts[0] || null;
                if(product) {
                    this.updateCartQuantity([{
                        lineId: product.LineId,
                        lineType: product.LineType,
                        position: product.Position,
                        quantity: product.Quantity - 1,
                        sku: product.Sku
                    }]);
                }
            },
            updateQuantity(payload, type, diff) {
                // force trigger updateQuantity on child thru focus
                this.$refs[`aquantity-${this.lineId}`].onFocus();
                // If the quantity add icon is clicked, trigger the shelf-configurator
                if(type === 'increase') {
                    this.addProduct();
                }

                // If the quantity remove icon is clicked, check if validation modal should show
                if(type === 'decrease') {
                    if(this.showValidationModal) {
                        this.$refs['validation-modal']?.show();
                    } else {
                        this.decreaseQuantity();
                    }
                }

                if(this.updatedQuantity !== payload) {
                    this.updateQuantityAction(payload, type, diff);
                }

                this.updatedQuantity = payload;
            },

            async updateQuantityAction(payload, type, diff) {
                if(type === 'decrease') {
                    this.dataLayerRemove(diff); // GA
                }

                if(type === 'increase') {
                    this.dataLayerAdd(diff); // GA
                }
            }
        }
    };
  </script>
