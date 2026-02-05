<template>
    <div class="text-xs text-gray leading-tight">
        <template v-if="viewMemberPricing">
            <div v-if="showMemberPrice">
                <span class="text-gray-150 text-xl font-bold" v-html="preferredPrice" />

                <slot v-if="!isPromotion && !isRestrictedPack" name="preferred-price-label"> Preferred <span class="sr-only">Price</span> </slot>
                <slot v-if="isPromotion && !isRestrictedPack" name="preferred-price-label"> {{ lvipPriceType }} <span class="sr-only">Price</span> </slot>
                <slot v-if="isRestrictedPack" name="restricted-price-label">
                    Member-Only Offer
                </slot>
                <!-- Preferred Price/Unit-EU specific -->
                <PricePerUnit
                    v-if="concentratedPreferredPricePerUnit"
                    :label="concentratedLabel"
                    :price="concentratedPreferredPricePerUnit"
                    :unit="concentratedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs`"
                />
                <PricePerUnit
                    v-if="dilutedPreferredPricePerUnit"
                    :label="dilutedLabel"
                    :price="dilutedPreferredPricePerUnit"
                    :unit="dilutedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
                <PricePerUnit
                    v-if="originalPreferredPricePerUnit"
                    :price="originalPreferredPricePerUnit"
                    :unit="originalPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
            </div>

            <div v-if="!isRestrictedPack && showNonMemberPrice">
                <span class="text-base font-bold" v-html="regularPrice" />

                <slot v-if="!isPromotion" name="regular-price-label"> Regular <span class="sr-only">Price</span> </slot>

                <slot v-if="isPromotion" name="regular-price-label"> {{ promotionRegularPriceLabel==='' ? 'Preferred' : promotionRegularPriceLabel }} <span class="sr-only">Price</span> </slot>
                <!-- Regular Price/Unit-EU specific -->
                <PricePerUnit
                    v-if="concentratedRegularPricePerUnit"
                    :label="concentratedLabel"
                    :price="concentratedRegularPricePerUnit"
                    :unit="concentratedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs`"
                />
                <PricePerUnit
                    v-if="dilutedRegularPricePerUnit"
                    :label="dilutedLabel"
                    :price="dilutedRegularPricePerUnit"
                    :unit="dilutedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
                <PricePerUnit
                    v-if="originalRegularPricePerUnit"
                    :price="originalRegularPricePerUnit"
                    :unit="originalPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
            </div>

        </template>
        <template v-else-if="isRestrictedPack">
            <div v-if="showMemberPrice">
                <span
                    class="text-gray-150 text-xl font-bold"
                    v-html="preferredPrice" />
                <slot v-if="isRestrictedPack" name="restricted-price-label">
                    Member-Only Offer
                </slot>
                <!-- Preferred Price/Unit-EU specific -->
                <PricePerUnit
                    v-if="concentratedPreferredPricePerUnit"
                    :label="concentratedLabel"
                    :price="concentratedPreferredPricePerUnit"
                    :unit="concentratedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs`"
                />
                <PricePerUnit
                    v-if="dilutedPreferredPricePerUnit"
                    :label="dilutedLabel"
                    :price="dilutedPreferredPricePerUnit"
                    :unit="dilutedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
                <PricePerUnit
                    v-if="originalPreferredPricePerUnit"
                    :price="originalPreferredPricePerUnit"
                    :unit="originalPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
            </div>

        </template>
        <template v-else>
            <div v-if="showNonMemberPrice">
                <span class="text-gray-150 text-xl font-bold" v-html="regularPrice" />

                <slot name="regular-price-label"> Regular <span class="sr-only">Price</span> </slot>
                <!-- Regular Price/Unit-EU specific -->
                <PricePerUnit
                    v-if="concentratedRegularPricePerUnit"
                    :label="concentratedLabel"
                    :price="concentratedRegularPricePerUnit"
                    :unit="concentratedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs`"
                />
                <PricePerUnit
                    v-if="dilutedRegularPricePerUnit"
                    :label="dilutedLabel"
                    :price="dilutedRegularPricePerUnit"
                    :unit="dilutedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
                <PricePerUnit
                    v-if="originalRegularPricePerUnit"
                    :price="originalRegularPricePerUnit"
                    :unit="originalPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
            </div>

            <div v-if="showMemberPrice">
                <span class="text-base font-bold" v-html="preferredPrice" />

                <slot name="preferred-price-label"> Preferred <span class="sr-only">Price</span> </slot>
                <!-- Preferred Price/Unit-EU specific -->
                <PricePerUnit
                    v-if="concentratedPreferredPricePerUnit"
                    :label="concentratedLabel"
                    :price="concentratedPreferredPricePerUnit"
                    :unit="concentratedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs`"
                />
                <PricePerUnit
                    v-if="dilutedPreferredPricePerUnit"
                    :label="dilutedLabel"
                    :price="dilutedPreferredPricePerUnit"
                    :unit="dilutedPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
                <PricePerUnit
                    v-if="originalPreferredPricePerUnit"
                    :price="originalPreferredPricePerUnit"
                    :unit="originalPricePerUnitMeasurementType"
                    :tailwind-mods="`text-xs mb-5`"
                />
            </div>
        </template>
    </div>
</template>

<script>
    import PricePerUnit from '@productstore/source/js/vue/components/00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'MProductCardPrice',
        components: {
            PricePerUnit
        },
        props: {
            preferredPrice: {
                type: String,
                required: true
            },
            regularPrice: {
                type: String,
                required: true
            },
            viewMemberPricing: {
                type: Boolean,
                default: false
            },
            isPromotion: {
                type: Boolean,
                default: false
            },
            lvipStatus: {
                type: String,
                default: ''
            },
            lvipPriceType: {
                type: String,
                default: ''
            },
            concentratedLabel: {
                type: String,
                default: ''
            },
            concentratedPreferredPricePerUnit: {
                type: String,
                default: ''
            },
            concentratedPricePerUnitMeasurementType: {
                type: String,
                default: ''
            },
            concentratedRegularPricePerUnit: {
                type: String,
                default: ''
            },
            dilutedLabel: {
                type: String,
                default: ''
            },
            dilutedPricePerUnitMeasurementType: {
                type: String,
                default: ''
            },
            dilutedPreferredPricePerUnit: {
                type: String,
                default: ''
            },
            dilutedRegularPricePerUnit: {
                type: String,
                default: ''
            },
            originalPricePerUnitMeasurementType: {
                type: String,
                default: ''
            },
            originalPreferredPricePerUnit: {
                type: String,
                default: ''
            },
            originalRegularPricePerUnit: {
                type: String,
                default: ''
            },
            isRestrictedPack: {
                type: Boolean,
                default: false
            },
            promotionRegularPriceLabel: {
                type: String,
                default: ''
            }
        },
        computed: {
            showMemberPrice() {
                return !this.$env.ProductPricing?.HideProductMemberPrice;
            },
            showNonMemberPrice() {
                return !this.$env.ProductPricing?.HideProductNonMemberPrice;
            }
        }
    };
</script>
