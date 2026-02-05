<template>
    <!-- Display list item -->
    <div class="m-favListItem">
        <div v-show="storedApiLoading && loading" class="m-favListItem__loading">
            <a-loading-spinner :visible="true" class="h-full flex items-center justify-center" aria-hidden="true" size="sm" mods="-m-0" />
        </div>
        <div class="m-favListItem__row">
            <!-- Image -->
            <div class="flex-shrink-0 w-40">
                <a v-if="favorite.PdpUrl && favorite.Image && favorite.Image.Url" :href="favorite.PdpUrl">
                    <img
                        class="w-full h-auto"
                        :src="favorite.Image.Url"
                        :alt="favorite.Image.Alt" />
                </a>
                <img
                    v-else-if="favorite.Image && favorite.Image.Url"
                    class="w-full h-auto"
                    :src="favorite.Image.Url"
                    :alt="favorite.Image.Alt" />
            </div>

            <!-- Title, Sku, Size and Configurations -->
            <div class="text-gray-120 pl-20 flex-grow">
                <!-- Title -->
                <a v-if="favorite.PdpUrl" :href="favorite.PdpUrl">
                    <h4 class="m-favListItem__title">{{ favorite.Title }}</h4>
                </a>
                <h4 v-else class="m-favListItem__title">{{ favorite.Title }}</h4>

                <!-- Items Label -->
                <span class="block italic text-xs text-gray-120">
                    {{ isFavorited ? favorite.Size : labels.Removed }}
                </span>
            </div>

            <!-- Action buttons -->
            <div
                class="pl-10"
                :class="{'-off': favorite.IsOffSale}">
                <div class="flex items-start">

                    <!-- Add to Cart button or temporarily unavailable -->
                    <div class="pt-1 pr-5">
                        <span v-if="storedLoadingInventory">
                            <a-loading-spinner :visible="true" aria-hidden="true" size="sm" />
                        </span>
                        <template v-else>
                            <!-- OffSale / SoldOut -->
                            <span v-if="offSale(favorite)" class="m-favListItem__off">
                                {{ offSale(favorite) }}
                            </span>
                            <!-- Add to Card button -->
                            <o-shelf-configurator
                                v-else
                                class="m-favListItem__button"
                                :aria-label="replaceToken(labels.AddToCartAriaLabel, favorite.Title)"
                                :family-id="favorite.FamilyID"
                                :gtm-id="415"
                                :product-name="favorite.Title"
                                :sku="favorite.Sku"
                                :pre-selected-sku="favorite.Sku"
                                :pre-selected-configurations="favorite.Configurations"
                                :list-id="storedListId"
                                script-id="data-shelf-configurator-localization"
                                @shelf-open="$emit('close-popup')"
                            >
                                <a-icon size="inherit">add</a-icon>
                                <a-icon size="inherit">shopping_cart</a-icon>
                            </o-shelf-configurator>
                        </template>
                    </div>
                    <!-- Display heart for favorite -->
                    <div class="m-favListItem__favorite">
                        <m-favorite-item
                            class="font-material text-2xl"
                            :label-unfavorite="replaceToken(labels.RemoveFavoriteAriaLabel, favorite.Title)"
                            :label-add-to-favorites="replaceToken(labels.AddFavoriteAriaLabel, favorite.Title)"
                            :script-id-configurator="scriptIdConfigurator"
                            :product="favorite"
                            @loading="(isLoading) => loading = isLoading"
                            @toggleFavorite="isFavorited = !isFavorited"
                        ></m-favorite-item>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import MFavoriteItem from '../favorites/favorite-item.vue';

    export default {
        name: 'MFavoriteListItem',
        components: {
            'm-favorite-item': MFavoriteItem
        },
        props: {
            favorite: {
                type: Object,
                default: () => {}
            },
            labels: {
                type: Object,
                default: () => {}
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            }
        },
        data() {
            return {
                isFavorited: true,
                loading: false
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedApiLoading', 'storedInventory', 'storedLoadingInventory', 'storedListId'])
        },
        methods: {
            replaceToken,
            offSale(product) {
                let offsaleDisplay = '';
                const inventoryProd = this.storedInventory.find(prodSku => prodSku.sku === product.Sku);
                const isSoldOutLabel = this.labels.SoldOut || 'Sold Out Label Missing';

                if(product?.IsErpDateValid) {
                    if(product?.IsOffSale) {
                        if(inventoryProd && inventoryProd.isInventoryControlled && inventoryProd.quantityAvailable <= 0) {
                            offsaleDisplay = product.OffSaleTitle;
                        }
                    } else {
                        if(inventoryProd && inventoryProd.isInventoryControlled && inventoryProd.quantityAvailable <= 0) {
                            offsaleDisplay = isSoldOutLabel;
                        }
                    }
                } else {
                    offsaleDisplay = product?.IsOffSale ? product?.OffSaleTitle : null;
                }
                return offsaleDisplay;
            }
        }
    };
</script>
