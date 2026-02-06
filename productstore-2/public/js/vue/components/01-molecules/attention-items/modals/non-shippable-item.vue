<template>
    <div class="m-noShipItem">
        <div class="relative w-full">
            <div v-show="itemLoading" class="m-noShipItem__loading">
                <a-loading-spinner :visible="itemLoading" />
            </div>
            <div
                v-show="(isRemoved || isSubstituted) && !error"
                class="m-noShipItem__wrapper"
                :class="[{'-isRemoved': isRemoved}, {'-isSubstituted': isSubstituted}]"
            >
                <div class="flex self-center items-center">
                    <img
                        :src="isRemoved ? productDetails.Product.Image.Url : productDetails.Substitution && productDetails.Substitution.Image.Url"
                        :alt="isRemoved ? productDetails.Product.Image.Alt || productDetails.Product.Title : productDetails.Substitution && (productDetails.Substitution.Image.Alt || productDetails.Substitution.Title)"
                        class="m-nonShippable__img"
                    >
                    <div class="m-nonShippable__message">
                        <span class="m-nonShippable__text -removed">{{ isRemoved ? labels.ItemRemoved : productDetails.Substitution && replaceTokenArray(labels.ItemSubstituted, [productDetails.Product.Title, productDetails.Substitution.Title]) }}</span>
                        <button class="m-nonShippable__button" @click="undo(productDetails)">{{ labels.Undo }} </button>
                    </div>
                </div>
            </div>
            <div
                v-show="(!isRemoved && !isSubstituted) || error"
                class="m-noShipItem__wrapper"
                :class="[{'-isRemoved': isRemoved}, {'-error': error}]"
            >
                <div class="m-nonShippable__container -productItem">
                    <m-aif-product-item
                        :line="productDetails.Product"
                        :labels="labels"
                        :price="productDetails.Product.Price"
                        class="pb-12 md:pb-16"
                    ></m-aif-product-item>
                    <div class="m-nonShippable__action -remove">
                        <v-button
                            class="-white text-xs font-medium w-full md:w-100 text-center block"
                            :aria-label="labels.RemoveAriaLabel"
                            @click="remove(productDetails)"
                        >
                            {{ labels.Remove }}
                        </v-button>
                    </div>
                </div>

                <div v-if="productDetails.Substitution" class="m-nonShippable__container  alternative">
                    <span class="m-nonShippable__split">
                        <span class="m-nonShippable__bullets -left" aria-hidden="true"></span>
                        {{ labels.Or }}
                        <span class="m-nonShippable__bullets" aria-hidden="true"></span>
                    </span>
                    <div class="m-nonShippable__product">
                        <div class="m-nonShippable__action -substitute">
                            <v-button
                                class="w-full font-medium block text-center"
                                :aria-label="labels.AcceptSubstituteAriaLabel"
                                @click="alternativeProduct(productDetails.Substitution, productDetails.Product.LineId, true)"
                            >
                                {{ labels.AcceptSubstitute }}
                            </v-button>
                        </div>
                        <m-aif-product-item
                            :is-bottom="true"
                            class="w-full md:w-auto md:pl-8 order-none md:order-1"
                            :line="productDetails.Substitution"
                            :labels="labels"
                            :price="findPrice(productDetails.Substitution.PriceRange)"
                        ></m-aif-product-item>
                    </div>
                </div>
            </div>
        </div>
        <div v-show="error">
            <p class="text-red text-sm" role="alert">
                <span aria-hidden="true" class="font-material">error_outline</span>
                {{ isRemoved ? labels.CantRemove : labels.CantSubstitute }}
            </p>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState, mapMutations, mapGetters } from 'vuex';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'NonShippableItem',
        props: {
            labels: {
                type: Object,
                default: function() {}

            },
            productData: {
                type: Object,
                default: function() {}

            },
            productDetails: {
                type: Object,
                default: function() {}

            }
        },
        data() {
            return {
                isRemoved: false,
                isSubstituted: false
            };
        },
        computed: {
            ...mapState('addToCart', ['hasCartErrors', 'hasCartErrors', 'errorIds', 'loadingLineIds']),
            ...mapGetters('cartSummary', ['getUserFlags']),

            lineItems() {
                let lineItems = [];

                const productList = this.sections.EditableProductList;
                if(productList && Array.isArray(productList.Data)) {
                    productList.Data.forEach(product => {
                        lineItems.push(product);
                    });
                }
                return lineItems;
            },
            error() {
                return (this.productDetails.Substitution && this.errorIds.includes(this.productDetails?.Substitution.LineId)) || this.errorIds.includes(this.productDetails.Product.LineId);
            },
            itemLoading() {
                return this.loadingLineIds.includes(this.productDetails.Product.LineId) || (this.productDetails.Substitution && this.loadingLineIds.includes(this.productDetails?.Substitution.LineId));
            }
        },
        methods: {
            ...mapActions('cart', ['refreshData']),
            ...mapActions('addToCart', ['replaceItem', 'removeItem', 'undoItem']),
            ...mapMutations('cart', ['SET_LOADING']),
            ...mapMutations('addToCart', ['REMOVE_ERROR_IDS']),
            async alternativeProduct(newProduct, oldLineId, isSub) {
                this.REMOVE_ERROR_IDS([oldLineId, newProduct.LineId]);
                const addToCartData = {
                    oldLineId: oldLineId,
                    product: newProduct
                };
                await this.replaceItem(addToCartData);
                this.$emit(isSub ? 'remove' : 'undo');
                this.isSubstituted = isSub;
            },
            findPrice(priceRange) {
                let price = '';
                if(this.getUserFlags?.ViewMemberPricing) {
                    price = priceRange.MaxPreferredPrice;
                } else {
                    price = priceRange.MaxRegularPrice;
                }
                return price;
            },
            async remove(line) {
                this.REMOVE_ERROR_IDS([line.Product.LineId, line?.Substitution?.LineId]);
                const lineId = line.Product.LineId;
                await this.removeItem({lineId: lineId});
                this.isRemoved = true;
                this.SET_LOADING();
                await this.refreshData();
                this.SET_LOADING(false);
                this.$emit('remove');
            },
            replaceTokenArray,
            async undo(line) {
                if(this.isRemoved) {
                    this.REMOVE_ERROR_IDS([line.Product.LineId]);
                    await this.undoItem({
                        sku: line.Product.Sku,
                        quantity: line.Product.Quantity,
                        lineId: line.Product.LineId,
                        lineType: line.Product.LineType,
                        position: line.Product.Position
                    });
                    this.$emit('undo');
                    if(!this.error) {
                        this.isRemoved = false;
                        this.isSubstituted = false;
                    }
                } else {
                    this.alternativeProduct(line.Product, line.Substitution.LineId, false);
                }
            }
        }
    };
</script>
