<template>
    <div :class="classname" class="m-favoriteItem">
        <button v-if="favoritedSku" class="m-favoriteItem__button" @click.stop.prevent="unfavorite">
            <span class="material-icons text-red" style="font-size: inherit">favorite</span>
            <span v-if="hasVisibleCopy" aria-hidden="true" class="m-favoriteItem__text">{{ labelUnfavoriteVisible }}</span>
            <span class="sr-only">{{ labelUnfavorite }}</span>
        </button>

        <span v-else>
            <o-shelf-configurator-add-list
                ref="shelf-configurator"
                class="m-favoriteItem__button"
                :script-id="scriptIdConfigurator"
                :list-id="parseInt(storedListId)"
                :list-labels="listLabels"
                :family-id="productFamilyId"
                :sku="singleSku"
                :title="getLocalizationProp('Labels.AddToFavorites', 'Add To Favorites')"
                :pre-selected-configurations="product && product.ConfigurationSkus"
            >
                <span class="material-icons text-gray-160" style="font-size: inherit">favorite_border</span>
                <span v-if="hasVisibleCopy" aria-hidden="true" class="m-favoriteItem__text">{{ labelAddToFavoritesVisible }}</span>
                <span class="sr-only">{{ labelAddToFavorites }}</span>
            </o-shelf-configurator-add-list>
        </span>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import eventBus from '../../../mixins/event-bus';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MFavoriteItem',
        mixins: [
            localizationMixin
        ],
        props: {
            hasVisibleCopy: {
                type: Boolean,
                default: false
            },
            labelAddToFavorites: {
                type: String,
                default: 'Add to favorites'
            },
            labelAddToFavoritesVisible: {
                type: String,
                default: 'Add to favorites'
            },
            labelUnfavorite: {
                type: String,
                default: 'Unfavorite'
            },
            labelUnfavoriteVisible: {
                type: String,
                default: 'Favorited!'
            },
            product: {
                type: Object,
                default: () => {}
            },
            scriptId: {
                type: String,
                default: 'riverbend-header-favorites'
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            }
        },
        data() {
            return {
                classname: '',
                favoritedSku: null
            };
        },
        computed: {
            // storedListItems => array of items in the favorited lists.
            ...mapState('shoppingLists', ['storedListId', 'storedListItems', 'storedItemConfirmation', 'storedLocalizationLists']),
            listLabels() {
                const shelfListLabels = this.storedLocalizationLists?.Labels;
                return {
                    Labels: {
                        ...shelfListLabels,
                        AddToList: this.localization?.Labels?.AddToFavorites,
                        UpdateList: this.localization?.Labels?.UpdateFavorites,
                        UpdatedList: this.localization?.Labels?.UpdatedFavorites,
                        AddedToList: this.localization?.Labels?.AddedToFavorites
                    }
                };
            },
            singleSku() {
                return this.productSkuData?.length === 1 ? this.productSkuData[0].Sku || this.productSkuData[0].sku : null;
            },
            productFamilyId() {
                return this.product?.FamilyId || this.product?.FamilyID || this.product?.FamilyInfo?.Id;
            },
            productSkuData() {
                return this.product?.Data?.Products || this.product?.Products || [this.product];
            }
        },
        watch: {
            storedListItems() {
                this.checkIfFavorited();
            }
        },
        mounted() {
            this.setEventBus();
            this.checkIfFavorited();
        },
        methods: {
            ...mapActions('shoppingLists', ['removeFromList']),
            checkIfFavorited() {
                // When items are added to the favorites list, this checks if this sku was favorited.
                if(this.productSkuData && this.storedListItems.length > 0) {
                    this.storedListItems.forEach(favoritedProduct => {
                        this.productSkuData?.forEach(product => {
                            if(product.Sku === favoritedProduct.Sku || product.sku === favoritedProduct.Sku) {
                                this.favoritedSku = favoritedProduct.Sku;
                            }
                        });
                    });
                }
            },
            async unfavorite() {
                this.$emit('loading', true);
                await this.removeFromList({
                    payload: {
                        ListId: this.storedListId,
                        Sku: this.favoritedSku
                    }
                });
                this.favoritedSku = null;
                this.$emit('toggleFavorite', this.favoritedSku);
                this.$emit('loading', false);
            },
            setEventBus() {
                // ToDo: needs to be refactored when moving to Vue3. We would want to use a provide/inject here. Getting the event from shelf-confirm-list.vue
                eventBus.$on('add-to-list-successful', (payload) => {
                    this.productSkuData?.forEach(product => {
                        if(product?.Sku === payload || product?.sku === payload) {
                            this.favoritedSku = payload;
                        }
                    });
                });
            }
        }
    };
</script>
