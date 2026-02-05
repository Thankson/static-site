<template>
    <div class="m-searchTopProducts">
        <div v-if="isLoadingTopProd" class="m-searchTopProducts__wrapper -loading">
            <a-loading-spinner :visible="true" />
        </div>
        <div v-else ref="topWrapper" class="m-searchTopProducts__wrapper">
            <!-- Title -->
            <div v-if="!isCn" class="m-searchTopProducts__title">
                {{ formattedSearchCopy }}
            </div>
            <div v-else class="m-searchTopProducts__title">
                <span v-if="catName">"{{ catName }}"{{ inLabel }}</span>"{{ term }}"{{ labels.TopResults }}
            </div>
            <!-- Products -->
            <ol class="m-searchTopProducts__list">
                <li
                    v-for="item in filteredTopProducts"
                    :key="item.sku"
                    class="m-searchTopProducts__item"
                    :class="{'-center': !isSignedIn && !isGuestShoppingEnabled}">

                    <!-- Thumb img -->
                    <a class="m-searchTopProducts__img" :href="pdpLinkGet(item)">
                        <img
                            v-if="imageGet(item)"
                            :src="`${cdnMediaUrl}/${imageGet(item).path}`"
                            :alt="imageGet(item).altText"
                        >
                        <img
                            v-else
                            src="https://cdnsc1.melaleuca.com/na/images/product-store/Image-Coming-Soon-Placeholder.jpg"
                            :alt="labels.ImageComingSoon"
                        >
                    </a>

                    <!-- Restricted Pack -->
                    <span
                        v-if="item._canBePurchased && item._isRestrictedPack"
                        class="w-1_2 italic text-xs pl-20 text-gray-150">
                        {{ labels.CannotPurchaseRestrictedPack || 'Restricted' }}
                    </span>

                    <!-- Buy cta -->
                    <o-shelf-configurator
                        v-if="item._canBePurchased && !item._isRestrictedPack"
                        :ref="item.sku"
                        class="m-searchTopProducts__cta -cart"
                        :aria-label="productAriaLabel(item)"
                        :sku="(item.sku) ? (item.sku).toString() : null"
                        :family-id="(item.familyId) ? (item.familyId).toString() : null"
                        script-id="data-shelf-configurator-localization"
                        configurator="1"
                        data-testid="button-searchTopProducts">
                        <a-icon size="inherit">add</a-icon>
                        <a-icon size="inherit">shopping_cart</a-icon>
                    </o-shelf-configurator>

                    <!-- Description -->
                    <div class="m-searchTopProducts__desc">
                        <a :href="pdpLinkGet(item)">
                            {{ item.title }}
                        </a>
                    </div>
                </li>
            </ol>
            <a class="m-searchTopProducts__cta" :href="viewResultsComp" data-testid="link-searchTopProducts">
                {{ labels.ViewResults }}
            </a>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import eventBus from '../../../mixins/event-bus';
    import {replaceTokenArray} from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MSearchTopProducts',

        props: {
            active: {
                type: Boolean,
                default: false
            },
            catName: {
                type: String,
                default: null
            },
            catId: {
                type: Number,
                default: null
            },
            cdnMediaUrl: {
                type: String,
                default: null
            },
            culture: {
                type: String,
                default: null
            },
            familyPdpLink: {
                type: String,
                default: null
            },
            inLabel: {
                type: String,
                default: 'in'
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isGuestShoppingEnabled: {
                type: Boolean,
                default: false
            },
            isSignedIn: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => {}
            },
            pdpLink: {
                type: String,
                default: null
            },
            searchPage: {
                type: String,
                default: null
            },
            term: {
                type: String,
                default: null
            },
            userFlags: {
                type: Object,
                default: () => {}
            }
        },

        data() {
            return {
                topProductsHeight: 0,
                resizeObserver: null
            };
        },

        computed: {
            ...mapState('search', ['isLoadingTopProd', 'topProducts']),

            viewResultsComp() {
                let searchUrl = `${this.searchPage}?searchTerm=${encodeURIComponent(this.term)}${this.catId ? `&categoryId=${this.catId}` : ''}${this.catName ? `&categoryName=${encodeURIComponent(this.catName)}` : ''}${this.culture ? `&culture=${this.culture}` : ''}`;

                return searchUrl;
            },
            filteredTopProducts() {
                let list = [];
                let restricted = {};
                this.topProducts.filter(item => {
                    // Adding restricted pack rules
                    restricted = {
                        // Check if the item is a restricted pack
                        _isRestrictedPack: this.isMemberOnly(item),

                        // Can be purchased if the user is logged OR if guest shopping is enable
                        _canBePurchased: this.isSignedIn || this.isGuestShoppingEnabled
                    };

                    // US, MX, CN logic
                    if(this.$env?.Country !== 'Canada') {
                        list.push({ ...item, ...restricted});

                    // CA logic
                    } else {
                        const authOnly = this.getAuthOnly(item);
                        if(!authOnly || (authOnly && this.userFlags?.IsAuthenticated)) {
                            list.push({ ...item, ...restricted});
                        }
                    }
                });
                return list;
            },
            formattedSearchCopy() {
                let topResults = this.labels.TopResults;
                let topResultsCategory = this.labels.TopResultsWithCategory;
                let categoryLabel = this.inLabel;
                let categoryName = `"${this.catName}"`;
                let searchTerm = `"${this.term}"`;
                var category = `${categoryLabel} ${categoryName}`;
                var product = `${topResults} ${searchTerm}`;

                if(this.catName) {
                    if(topResultsCategory.indexOf('{0}') > -1 || topResultsCategory.indexOf('{1}') > -1) {
                        product = this.replaceTokenArray(topResultsCategory, [searchTerm, categoryName]);
                    } else {
                        return `${product} ${category}`;
                    }
                } else {
                    if(topResults.indexOf('{0}') > -1) {
                        product = this.replaceTokenArray(topResults, [searchTerm]);
                    }
                }

                return product;
            }
        },

        watch: {
            active(val) {
                this.$nextTick(() => {
                    if(val && this.$refs.topWrapper) this.observe();
                });
            },
            isLoadingTopProd(val) {
                if(!val) {
                    this.$nextTick(() => {
                        if(this.$refs.topWrapper) {
                            this.observe();
                        }
                    });
                }
            },
            topProductsHeight(val) {
                this.topProductsHeight = val;
                eventBus.$emit('searchSuggestionHeight', val);
            }
        },

        created() {
            this.observe();
        },

        beforeDestroy() {
            if(this.$refs.topWrapper) this.resizeObserver.unobserve(this.$refs.topWrapper);
        },

        methods: {
            replaceTokenArray,
            isMemberOnly(item) {
                if(item.products?.length) {
                    // Set as NOT member only
                    let isMemberOnly = false;

                    // If is defined that can purchase restricted pack, then set as NOT member only
                    if(this.userFlags?.CanPurchaseRestrictedPacks === true) {
                        return isMemberOnly;
                    }

                    // Set as member only IF
                    // - all the subproducts have isMemberOnly === true AND
                    // - userFlags.CanPurchaseRestrictedPacks === false
                    // Check if there is at least one subproduct that is NOT member only
                    if(!item.products.some(i => !i.isMemberOnly)) {
                        isMemberOnly = true;
                    }

                    return isMemberOnly;
                }

                // By default set as NOT member only
                return false;
            },

            imageGet(item) {
                const productImageObj = item?.images?.find(image => image.imageType === 'ProductHeroImage');
                return productImageObj || item?.images[0];
            },

            getAuthOnly(item) {
                if(item.familyType.includes('MultipleBasic', 'MultipleNotAKit')) {
                    return item.products.every(prod => prod.authenticatedUsersOnly);
                }
                return item.products[0]?.authenticatedUsersOnly;
            },

            observe() {
                this.resizeObserver = new ResizeObserver((obj) => {
                    this.resize(obj[0].target.clientHeight);
                });

                this.$nextTick(() => {
                    if(this.$refs.topWrapper) {
                        this.resizeObserver.observe(this.$refs.topWrapper);
                        this.topProductsHeight = this.$refs.topWrapper.offsetHeight;
                    }
                });
            },

            pdpLinkGet(item) {
                let pdpPage = item.sku ? this.pdpLink : this.familyPdpLink;
                if(item.sku) {
                    return pdpPage.replace('{0}', item.sku);
                } else {
                    // item.familyId
                    return pdpPage.replace('{0}', item.familyId);
                }
            },

            productAriaLabel(product) {
                return this.labels.AddToCart.replace('{0}', product.title);
            },

            resize(val) {
                this.topProductsHeight = val;
            }
        }
    };
</script>
