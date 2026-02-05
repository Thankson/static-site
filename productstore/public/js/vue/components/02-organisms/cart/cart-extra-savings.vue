<template>
    <o-cart-accordion
        ref="accordion"
        class="mt-4"
        :title="labels.DropdownText"
        :mask-class="accordionMaskClass"
        @show="getSavings">

        <m-error-card
            v-if="error"
            mods="mb-25"
            :reload-text="labels.RefreshPage"
            :text="labels.GenericFailureMessage"
        />

        <ul class="o-recentlyPurchased">
            <li
                v-for="product in extraSavings.ExtraSavingProducts"
                :key="product.Sku"
                class="o-recentlyPurchased__item">

                <article class="m-recentProduct -extraSavings">
                    <div class="m-recentProduct__wrapper">
                        <img
                            :src="product.Image.Url"
                            :alt="product.Image.Alt"
                            class="m-recentProduct__img">
                    </div>

                    <div class="m-recentProduct__details">
                        <h3 class="m-recentProduct__title">
                            {{ getTitle(product.PriceRange.PackSavings) }}
                        </h3>
                        <p class="m-recentProduct__description">
                            {{ product.Title }}
                        </p>
                    </div>

                    <div v-if="product.PriceRange" class="m-recentProduct__add">
                        <p class="m-recentProduct__price">
                            <strong>{{ getPrice(product) }}</strong>
                        </p>
                        <!--Price/Unit-EU specific -->
                        <PricePerUnit
                            v-if="getPricePerUnit(product.PriceRange, 'Concentrated', viewMemberPrice)"
                            :label="concentratedLabel"
                            :price="getPricePerUnit(product.PriceRange, 'Concentrated', viewMemberPrice)"
                            :unit="product.PriceRange.ConcentratedPPUMeasurementType"
                            :tailwind-mods="`flex flex-col items-end text-sm text-gray font-normal leading-tight mt-3`"
                        />
                        <PricePerUnit
                            v-if="getPricePerUnit(product.PriceRange, 'Diluted', viewMemberPrice)"
                            :label="dilutedLabel"
                            :price="getPricePerUnit(product.PriceRange, 'Diluted', viewMemberPrice)"
                            :unit="product.PriceRange.DilutedPPUMeasurementType"
                            :tailwind-mods="`flex flex-col items-end text-sm text-gray font-normal leading-tight mb-3`"

                        />
                        <PricePerUnit
                            v-if="getPricePerUnit(product.PriceRange, 'Original', viewMemberPrice)"
                            :price="getPricePerUnit(product.PriceRange, 'Original', viewMemberPrice)"
                            :unit="product.PriceRange.OriginalPPUMeasurementType"
                            :tailwind-mods="`text-sm text-gray font-normal my-3`"
                        />
                        <p v-if="showPoints" class="m-recentProduct__points">{{ product.PriceRange.MinPoints }} {{ labels.Points }}</p>
                        <div class="m-recentProduct__add">
                            <o-shelf-configurator
                                :ref="product.Sku"
                                class="m-recentProduct__cart"
                                :sku="product.Sku"
                                :family-id="product.FamilyId">
                                <a-icon size="inherit">add</a-icon>
                                <a-icon size="inherit">shopping_cart</a-icon>
                            </o-shelf-configurator>
                        </div>
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
        name: 'OCartExtraSavings',
        components: {
            PricePerUnit
        },
        props: {
            concentratedLabel: {
                type: String,
                default: ''
            },
            dilutedLabel: {
                type: String,
                default: ''
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            accordionMaskClass: {
                type: String,
                default: null
            },
            userFlags: {
                type: Object,
                default: () => {}
            }
        },
        computed: {
            ...mapGetters('cart', ['extraSavings', 'error']),
            showPoints() {
                return this.userFlags?.ViewPoints && !this.userFlags?.IsGuest;
            }
        },
        methods: {
            ...mapActions('cart', ['getExtraSavings']),
            getPricePerUnit,

            getPrice: function (product) {
                if(this.userFlags?.ViewMemberPricing && !this.userFlags?.IsGuest) {
                    return product.PriceRange.MaxPreferredPrice;
                }
                return product.PriceRange.MaxRegularPrice;
            },
            getSavings: function() {
                this.getExtraSavings({filterOffsaleItems: true, hideRestrictedPacks: true});

                // GTM
                this.gtmTrackAction({id: 231, text: this.labels.DropdownText}, {});
            },
            getTitle: function (packSavings) {
                return this.labels.Save.replace('{0}', packSavings);
            },
            viewMemberPrice() {
                return this.userFlags?.ViewMemberPricing || false;
            }
        }
    };
</script>
