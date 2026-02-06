<template>
    <o-cart-accordion
        v-if="isAuthenticated && recentlyPurchased && recentlyPurchased.length > 0"
        ref="accordion"
        :title="title"
        :mask-class="accordionMaskClass"
        @show="gtmTrackAction({ id: 230, text: title }, {})">

        <ul class="o-recentlyPurchased">
            <li
                v-for="(product, index) in recentlyPurchased"
                :key="`${product.Sku}-${index}`"
                class="o-recentlyPurchased__item">

                <article class="m-recentProduct" :class="mods">
                    <div class="m-recentProduct__wrapper">
                        <img
                            v-if="product.Image && product.Image.Url"
                            :src="product.Image.Url"
                            :alt="product.Image.Alt !== product.Title ? product.Image.Alt : ''"
                            class="m-recentProduct__img" />
                    </div>

                    <div class="m-recentProduct__details">
                        <h3 class="m-recentProduct__title">
                            <a :href="product.PdpUrl">{{ product.Title }}</a>
                        </h3>

                        <p class="m-recentProduct__price">
                            <strong>{{ getPrice(product) }}</strong>
                        </p>
                        <!--Price/Unit-EU specific -->
                        <PricePerUnit
                            v-if="getPricePerUnit(product.PriceRange, 'Concentrated', viewMemberPricing)"
                            :label="concentratedLabel"
                            :price="getPricePerUnit(product.PriceRange, 'Concentrated', viewMemberPricing)"
                            :unit="product.PriceRange.ConcentratedPPUMeasurementType"
                            :tailwind-mods="`flex flex-col text-sm text-gray font-normal leading-tight`"
                        />
                        <PricePerUnit
                            v-if="getPricePerUnit(product.PriceRange, 'Diluted', viewMemberPricing)"
                            :label="dilutedLabel"
                            :price="getPricePerUnit(product.PriceRange, 'Diluted', viewMemberPricing)"
                            :unit="product.PriceRange.DilutedPPUMeasurementType"
                            :tailwind-mods="`flex flex-col text-sm text-gray font-normal leading-tight mb-3`"
                        />
                        <PricePerUnit
                            v-if="getPricePerUnit(product.PriceRange, 'Original', viewMemberPricing)"
                            :price="getPricePerUnit(product.PriceRange, 'Original', viewMemberPricing)"
                            :unit="product.PriceRange.OriginalPPUMeasurementType"
                            :tailwind-mods="`text-sm text-gray font-normal my-3`"
                        />

                        <!-- Points -->
                        <p
                            v-if="viewPoints"
                            class="m-recentProduct__points">

                            {{ product.PriceRange.MinPoints }} {{ pointsLabel }}
                        </p>
                    </div>

                    <div class="m-recentProduct__add">
                        <o-shelf-configurator
                            :ref="product.Sku"
                            class="m-recentProduct__cart"
                            :aria-label="addAriaLabel"
                            :sku="product.Sku"
                            :family-id="product.FamilyId"
                            :pre-selected-configurations="product.Configurations"
                            script-id="data-shelf-configurator-localization">

                            <a-icon size="inherit">add</a-icon>
                            <a-icon size="inherit">shopping_cart</a-icon>
                        </o-shelf-configurator>
                    </div>

                </article>

            </li>
        </ul>

    </o-cart-accordion>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex';
    import { getPricePerUnit } from '../../../utils/get-price-per-unit';
    import PricePerUnit from '../../00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'ORecentlyPurchased',
        components: {
            PricePerUnit
        },
        props: {
            accordionMaskClass: {
                type: String,
                default: null
            },
            addAriaLabel: {
                type: String,
                default: 'Add to Cart'
            },
            concentratedLabel: {
                type: String,
                default: ''
            },
            dilutedLabel: {
                type: String,
                default: ''
            },
            errorMsg: {
                type: String,
                default: 'Uh oh, there was an error loading your request.<br />Please try again later or contact us if the issue persists.'
            },
            mods: {
                type: String,
                default: ''
            },
            pointsLabel: {
                type: String,
                default: 'Points'
            },
            title: {
                type: String,
                default: 'Buy It Again'
            },
            userFlags: {
                type: Object,
                default: () => {}
            }
        },
        computed: {
            ...mapGetters('recentlyPurchasedProducts', ['recentlyPurchased']),

            isAuthenticated() {
                return this.userFlags?.IsAuthenticated;
            },

            viewMemberPricing() {
                return this.userFlags?.ViewMemberPricing;
            },

            viewPoints() {
                return this.userFlags?.ViewPoints && !this.userFlags?.IsGuest;
            }
        },
        watch: {
            recentlyPurchased() {
                console.log('products: ', JSON.parse(JSON.stringify(this.recentlyPurchased)));
            }
        },
        created() {
            if(this.isAuthenticated) {
                this.getData({ filterOffSale: true, hideRestrictedPacks: true });
            }
        },
        methods: {
            ...mapActions('recentlyPurchasedProducts', ['getData']),
            getPricePerUnit,
            getPrice: function (product) {
                if(this.userFlags?.ViewMemberPricing && !this.userFlags?.IsGuest) {
                    return product.PriceRange.MaxPreferredPrice;
                }
                return product.PriceRange.MaxRegularPrice;
            }
        }
    };
</script>
