<template>
    <div v-if="!moveClosed" class="m-shoplistsGridItem">
        <!-- Show spinner while API is being loaded -->
        <div v-if="showLoading && removing && !product.Removed" class="m-shoplistsGridItem__loading">
            <a-loading-spinner
                :visible="true"
                class="m-shoplistsGridItem__loadingIcon"
                aria-hidden="true">
            </a-loading-spinner>
        </div>

        <!-- Display removed/moved item -->
        <div v-if="product.Removed || product.MovedTo" class="m-shoplistsGridItem__wrapper -item">
            <!-- Image -->
            <div class="m-shoplistsGridItem__picture">
                <img
                    v-if="product.Image && product.Image.Url"
                    class="m-shoplistsGridItem__img"
                    :src="product.Image.Url"
                    :alt="product.Image.Alt" />
            </div>
            <!-- Removed/Moved -->
            <div class="m-shoplistsGridItem__removed">
                <!-- Removed from list message -->
                <p v-if="!product.MovedTo" class="m-shoplistsGridItem__msg" role="alert">
                    {{ getLabels(localization, 'Labels.Removed', 'This item has been removed from the current list') }}
                </p>

                <!-- Moved to list message -->
                <p v-else class="m-shoplistsGridItem__msg" role="alert">
                    {{ getLabels(localization, 'Labels.Moved', 'This item has been moved to') }}
                    <a
                        class="text-green font-bold"
                        :href="myListsLink + '?listId=' + product.MovedToListId"
                        :class="isCn ? 'block' : 'inline'">
                        {{ product.MovedToListName }}
                    </a>
                </p>
            </div>
            <div
                class="m-shoplistsGridItem__actions">
                <div class="m-shoplistsGridItem__wrapper -actions" :class="{'-isCn':isCn}">
                    <button
                        v-if="!systemGenerated"
                        class="m-shoplistsGridItem__button -delete -removed"
                        :aria-label="replaceToken(getLabels(localization, 'Labels.RemoveItem', 'Remove') + ' {0}', product.Title)"
                        type="button"
                        @click="closeMove()">
                        <span class="material-icons" aria-hidden="true">clear</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Display list item -->
        <div v-else class="m-shoplistsGridItem__wrapper -item">
            <!-- Image -->
            <div class="m-shoplistsGridItem__picture">
                <a v-if="isPdpPageAvailable && (product.Image && product.Image.Url)" :href="product.PdpUrl">
                    <img
                        class="m-shoplistsGridItem__img"
                        :src="product.Image.Url"
                        :alt="product.Image.Alt" />
                </a>
                <img
                    v-else-if="product.Image && product.Image.Url"
                    class="m-shoplistsGridItem__img"
                    :src="product.Image.Url"
                    :alt="product.Image.Alt" />
            </div>

            <!-- Title, Sku, Size and Configurations -->
            <div class="m-shoplistsGridItem__description">
                <!-- Title -->
                <a v-if="isPdpPageAvailable" :href="product.PdpUrl">
                    <h4 class="m-shoplistsGridItem__title">{{ product.Title }}</h4>
                </a>
                <h4 v-else class="m-shoplistsGridItem__title">{{ product.Title }}</h4>

                <!-- Sku and Size -->
                <span class="m-shoplistsGridItem__skuSize">
                    {{ product.Sku }} | {{ getLabels(localization, 'Labels.Size', 'Size') }}: {{ product.Size }}
                </span>

                <!-- Selection Options -->
                <ul
                    v-if="product.SelectionOptions && product.SelectionOptions.length > 0"
                    class="m-shoplistsGridItem__configList"
                    :class="{ '-allVisible': readMore }">

                    <li
                        v-for="(option, index) in product.SelectionOptions"
                        :key="index"
                        class="m-shoplistsGridItem__configItem"
                        :class="{'not-italic' : isCn}">

                        {{ option.Title ? `${option.Title}: `: '' }}{{ option.Value }}
                    </li>
                </ul>
                <button v-if="product.SelectionOptions && product.SelectionOptions.length > 6" type="button" class="m-shoplistsGridItem__readMore" @click="readMore = !readMore">
                    {{ readMore ? getLabels(localization, 'Labels.ReadLess', 'Read Less') : getLabels(localization, 'Labels.ReadMore', 'Read More') }}
                </button>
            </div>

            <!-- Points and Price -->
            <div class="m-shoplistsGridItem__pointsPriceInfo">
                <!-- Points -->
                <span class="m-shoplistsGridItem__pointsPrice">
                    <span v-if="userFlags.ViewPoints">{{ product.PriceRange.MinPoints }}</span>
                    <span v-if="userFlags.ViewPoints">{{ getLabels(localization, 'Labels.PointsAbbrev', 'pts') }} | </span>{{ price }}
                </span>

                <!--Price/Unit-EU specific -->
                <PricePerUnit
                    v-if="getPricePerUnit(product.PriceRange, 'Concentrated', isPreferred)"
                    :label="getLabels(localization, 'Labels.Concentrated')"
                    :price="getPricePerUnit(product.PriceRange, 'Concentrated', isPreferred)"
                    :unit="product.PriceRange.ConcentratedPPUMeasurementType"
                    :tailwind-mods="`text-sm text-gray leading-tight`"
                />
                <PricePerUnit
                    v-if="getPricePerUnit(product.PriceRange, 'Diluted', isPreferred)"
                    :label="getLabels(localization, 'Labels.Diluted')"
                    :price="getPricePerUnit(product.PriceRange, 'Diluted', isPreferred)"
                    :unit="product.PriceRange.DilutedPPUMeasurementType"
                    :tailwind-mods="`text-sm text-gray leading-tight mb-5`"

                />
                <PricePerUnit
                    v-if="getPricePerUnit(product.PriceRange, 'Original', isPreferred)"
                    :price="getPricePerUnit(product.PriceRange, 'Original', isPreferred)"
                    :unit="product.PriceRange.OriginalPPUMeasurementType"
                    :tailwind-mods="`text-sm text-gray mb-5`"
                />

                <!-- Member Price -->
                <span v-if="isPreferred" class="m-shoplistsGridItem__priceType">
                    <template v-if="!isRestrictedPack">
                        {{ getLabels(localization, 'Labels.MemberPrice', 'Member Price') }}
                    </template>
                    <template v-else>
                        {{ getLabels(localization, 'Labels.MemberOnlyOffer', 'Member-Only Offer') }}
                    </template>
                </span>

                <!-- NOT Member and Restrict Pack -->
                <span v-else-if="isRestrictPackCantPurchase" class="m-shoplistsGridItem__priceType">
                    {{ getLabels(localization, 'Labels.MemberOnlyPrice', 'Member Only Price') }}
                </span>

                <!-- Regular Price -->
                <span v-else class="m-shoplistsGridItem__priceType">
                    {{ getLabels(localization, 'Labels.RegularPrice', 'Regular Price') }}
                </span>
            </div>

            <!-- Action buttons -->
            <div
                class="m-shoplistsGridItem__actions"
                :class="{'-purchased': listType === 'PurchasedItemsList', '-off': product.IsOffSale}">
                <div class="m-shoplistsGridItem__wrapper -actions" :class="{'-isCn' : isCn}">

                    <!-- Display date if it's PurchasedItemsList CN -->
                    <div v-if="listType === 'PurchasedItemsList' && isCn" class="m-shoplistsGridItem__purchasedDate">
                        <span class="m-shoplistsGridItem__purchased">
                            {{ getLabels(localization, 'Labels.Purchased', 'Purchased') }}:
                        </span>
                        <span class="m-shoplistsGridItem__date">{{ product.Date }}</span>
                    </div>

                    <!-- Add to Cart button or temporarily unavailable -->
                    <div class="m-shoplistsGridItem__wrapper -select" :class="{'-purchased': listType === 'PurchasedItemsList', '-isCn': isCn}">
                        <span v-if="storedLoadingInventory">
                            <a-loading-spinner :visible="true" aria-hidden="true" size="sm" />
                        </span>
                        <template v-else>
                            <!-- NOT Member and Restrict Pack -->
                            <span
                                v-if="isRestrictPackCantPurchase"
                                class="m-shoplistsGridItem__off -preferred"
                                v-html="getLabels(localization, 'Labels.PurchaseByBecomingAMember', 'Purchase by becoming a Member.')"
                            >
                            </span>
                            <!-- OffSale / SoldOut -->
                            <span v-else-if="offSaleDisplay" class="m-shoplistsGridItem__off">
                                {{ offSaleDisplay }}
                            </span>
                            <!-- Add to Card button -->
                            <o-shelf-configurator
                                v-else
                                class="m-shoplistsGridItem__button a-button -select"
                                :aria-label="replaceToken(getLabels(localization, 'Labels.Select', 'Select') + ' {0}', product.Title)"
                                :family-id="product.FamilyID"
                                :gtm-id="415"
                                :product-name="product.Title"
                                :sku="product.Sku"
                                :pre-selected-sku="product.Sku"
                                :pre-selected-configurations="product.Configurations"
                                :list-id="listId"
                                :script-id="scriptIdConfigurator">
                                <p :class="!isCn ? '' : 'hidden md:block'"> {{ getLabels(localization, 'Labels.Select', 'Select') }} </p>
                                <div v-if="isCn" class="block md:hidden">
                                    <a-icon size="inherit">add</a-icon>
                                    <a-icon size="inherit">shopping_cart</a-icon>
                                </div>
                            </o-shelf-configurator>
                        </template>
                    </div>

                    <!-- Display Move to List button if it's CustomerList -->
                    <m-shoplists-add-item
                        v-if="listType === 'CustomerList' && !isRestrictPackCantPurchase && !isSoldOut"
                        class="m-shoplistsGridItem__button -move"
                        :aria-label-cta="replaceToken(getLabels(localization, 'Labels.MoveItem'), product.Title)"
                        :is-shopping-lists="true"
                        :is-shelf="false"
                        :is-moving="true"
                        :is-preferred="isPreferred"
                        :original-list-id="listId"
                        :product="product"
                        :refresh-list="false"
                        :class="{'-isCn' : isCn}">
                        <template v-slot:icon>
                            <span class="material-icons" aria-hidden="true">playlist_play</span>
                        </template>
                    </m-shoplists-add-item>

                    <!-- Display Add to List button if it's PurchasedItemsList or SaveForLater or SystemList -->
                    <m-shoplists-add-item
                        v-if="listType !== 'CustomerList' && !isRestrictPackCantPurchase && !isSoldOut"
                        class="m-shoplistsGridItem__button -add"
                        :aria-label-cta="replaceToken(getLabels(localization, 'Labels.AddItem'), product.Title)"
                        :is-shopping-lists="true"
                        :is-shelf="false"
                        :is-preferred="isPreferred"
                        :original-list-id="listId"
                        :product="product"
                        :refresh-list="false">
                        <template v-slot:icon>
                            <span class="material-icons" aria-hidden="true">playlist_add</span>
                        </template>
                    </m-shoplists-add-item>

                    <!-- Display date if it's PurchasedItemsList -->
                    <div v-if="listType === 'PurchasedItemsList' && !isCn" class="m-shoplistsGridItem__purchasedDate">
                        <span class="m-shoplistsGridItem__purchased">
                            {{ getLabels(localization, 'Labels.Purchased', 'Purchased') }}:
                        </span>
                        <span class="m-shoplistsGridItem__date">{{ product.Date }}</span>
                    </div>

                    <!-- Display delete button if it's CustomerList or SaveForLater -->
                    <button
                        v-if="canDeleteItems"
                        class="m-shoplistsGridItem__button -delete"
                        :aria-label="replaceToken(getLabels(localization, 'Labels.RemoveItem', 'Remove') + ' {0}', product.Title)"
                        type="button"
                        @click="[removeItem(product.Sku), gtmTrackAction({id: 17}, $event)]">
                        <span class="material-icons" aria-hidden="true">clear</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { getPricePerUnit } from '../../../utils/get-price-per-unit';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import PricePerUnit from '../../00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'MShoplistsGridItem',
        components: {
            PricePerUnit
        },
        mixins: [ labels ],
        props: {
            isPreferred: {
                type: Boolean,
                default: null
            },
            listId: {
                type: [Number, String],
                default: null
            },
            listType: {
                type: String,
                default: null
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            },
            product: {
                type: Object,
                default() {
                    return {};
                }
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            systemGenerated: {
                type: Boolean,
                default: true
            },
            canDeleteItems: {
                type: Boolean,
                default: false
            },
            userFlags: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                removing: false,
                showLoading: false,
                readMore: false,
                moveClosed: false,
                isSoldOut: false
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedApiLoading', 'storedInventory', 'storedLoadingInventory']),

            myListsLink() {
                return this.localization?.Data?.ListsPage?.Url;
            },
            price() {
                let price = this.product.PriceRange.MinRegularPrice;

                if(this.isPreferred) {
                    price = this.product.PriceRange.MinPreferredPrice;
                }

                return price;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isRestrictPackCantPurchase() {
                return this.product.IsRestrictedPack && !this.userFlags?.CanPurchaseRestrictedPacks;
            },
            isRestrictedPack() {
                return this.product.IsRestrictedPack;
            },
            offSaleDisplay() {
                let offsaleDisplay = '';
                const inventoryProd = this.storedInventory.find(prodSku => prodSku.sku === this.product.Sku);
                const isSoldOutLabel = this.localization.Labels.SoldOut || 'Sold Out';

                if(this.product?.IsErpDateValid) {
                    if(this.product?.IsOffSale) {
                        if(inventoryProd && inventoryProd.isInventoryControlled && inventoryProd.quantityAvailable <= 0) {
                            offsaleDisplay = this.product.OffSaleTitle;
                        }
                    } else {
                        if(inventoryProd && inventoryProd.isInventoryControlled && inventoryProd.quantityAvailable <= 0) {
                            offsaleDisplay = isSoldOutLabel;
                        }
                    }
                } else {
                    offsaleDisplay = this.product?.IsOffSale ? this.product?.OffSaleTitle : null;
                }
                return offsaleDisplay;
            },
            isPdpPageAvailable() {
                return !!this.product.PdpUrl;
            }
        },
        watch: {
            storedApiLoading() {
                this.showLoading = this.storedApiLoading;
            },
            offSaleDisplay: {
                immediate: true,
                handler(val) {
                    const isSoldOutLabel = this.localization.Labels.SoldOut || 'Sold Out';
                    if(isSoldOutLabel === val) {
                        this.isSoldOut = true;
                    }
                }
            }
        },
        mounted() {
            this.removing = false;
        },
        methods: {
            ...mapActions('shoppingLists', ['removeFromList']),
            getPricePerUnit,

            closeMove() {
                this.moveClosed = true;
            },

            async removeItem(sku) {
                // Allow to delete an item if it's list type is CustomerList or
                // SaveForLater. This is what canDeleteItems tracks
                if(this.canDeleteItems) {
                    this.removing = true;

                    this.$emit('removed', true);

                    // Remove product from list
                    await this.removeFromList({
                        payload: {
                            ListId: this.listId,
                            Sku: sku
                        }
                    });

                    // Decrease items count in the list
                    this.$store.commit('shoppingLists/SET_ITEMS_COUNT', {
                        listId: this.listId,
                        decrease: true
                    });

                    this.removing = false;
                }
            },
            replaceToken
        }
    };
</script>
