<template>
    <div class="m-productDetailPrice">

        <template v-if="viewMemberPricing">
            <div v-if="showMemberPrice">
                <!-- Strikethrough original member price -->
                <p v-if="showStrikethroughOriginalPrice && originalPriceMember && !isPriceRange" class="m-productDetailPrice__originalPrice">
                    <span class="sr-only">{{ originalPriceScreenReader }}</span>
                    <s>
                        <span>{{ originalPriceMember }}</span>
                        <span v-if="preferredLabel && !isRestrictedPack" aria-hidden="true" class="m-productDetailPrice__primaryLabel"> {{ preferredLabel }}</span>
                    </s>
                </p>
                <p>
                    <span v-if="preferredSrText && !isRestrictedPack" class="sr-only">{{ preferredSrText }} </span>
                    <span class="m-productDetailPrice__primaryPrice">
                        {{ preferredPrice }}
                    </span>
                    <span v-if="preferredLabel && !isRestrictedPack" aria-hidden="true" class="m-productDetailPrice__primaryLabel"> {{ preferredLabel }}</span>
                    <span v-if="memberOnlyOfferLabel && isRestrictedPack" class="m-productDetailPrice__primaryLabel"> {{ memberOnlyOfferLabel }}</span>
                </p>
                <PricePerUnit
                    v-if="showConcentratedPreferredPricePerUnit"
                    :label="concentratedLabel"
                    :price="concentratedPreferredPricePerUnit"
                    :unit="concentratedPricePerUnitMeasurementType"
                />
                <PricePerUnit
                    v-if="showDilutedPreferredPricePerUnit"
                    :label="dilutedLabel"
                    :price="dilutedPreferredPricePerUnit"
                    :unit="dilutedPricePerUnitMeasurementType"
                    :tailwind-mods="'mb-3'"
                />
                <PricePerUnit
                    v-if="showOriginalPreferredPricePerUnit"
                    :price="originalPreferredPricePerUnit"
                    :unit="originalPricePerUnitMeasurementType"
                    :tailwind-mods="'mb-5'"
                />
            </div>
            <div v-if="!isRestrictedPack && showNonMemberPrice">
                <p class="m-productDetailPrice__secondaryPriceAndLabel">
                    <span v-if="regularLabel" class="sr-only">{{ regularLabel }} </span>
                    {{ regularPrice }}
                    <span v-if="regularLabel" aria-hidden="true"> {{ regularLabel }}</span>
                </p>
                <PricePerUnit
                    v-if="showConcentratedRegularPricePerUnit"
                    :label="concentratedLabel"
                    :price="concentratedRegularPricePerUnit"
                    :unit="concentratedPricePerUnitMeasurementType"
                />
                <PricePerUnit
                    v-if="showDilutedRegularPricePerUnit"
                    :label="dilutedLabel"
                    :price="dilutedRegularPricePerUnit"
                    :unit="dilutedPricePerUnitMeasurementType"
                    :tailwind-mods="'mb-4'"
                />
                <PricePerUnit
                    v-if="showOriginalRegularPricePerUnit"
                    :price="originalRegularPricePerUnit"
                    :unit="originalPricePerUnitMeasurementType"
                    :tailwind-mods="'mt-3 mb-4'"
                />
            </div>
        </template>
        <template v-else-if="isRestrictedPack">
            <div v-if="showMemberPrice">
                <span class="m-productDetailPrice__primaryPrice">
                    {{ preferredPrice }}
                </span>
                <slot v-if="isRestrictedPack" name="restricted-price-label">
                    Member-Only Offer
                </slot>
            </div>
            <PricePerUnit
                v-if="showConcentratedPreferredPricePerUnit"
                :label="concentratedLabel"
                :price="concentratedPreferredPricePerUnit"
                :unit="concentratedPricePerUnitMeasurementType"
            />
            <PricePerUnit
                v-if="showDilutedPreferredPricePerUnit"
                :label="dilutedLabel"
                :price="dilutedPreferredPricePerUnit"
                :unit="dilutedPricePerUnitMeasurementType"
                :tailwind-mods="'mb-5'"
            />
            <PricePerUnit
                v-if="showOriginalPreferredPricePerUnit"
                :price="originalPreferredPricePerUnit"
                :unit="originalPricePerUnitMeasurementType"
                :tailwind-mods="'mb-5'"
            />
        </template>
        <template v-else>
            <div v-if="showNonMemberPrice">
                <!-- Strikethrough original non-member price -->
                <p v-if="showStrikethroughOriginalPrice && originalPriceNonMember && !isPriceRange" class="m-productDetailPrice__originalPrice">
                    <span class="sr-only">{{ originalPriceScreenReader }}</span>
                    <s>
                        <span>{{ originalPriceNonMember }}</span>
                        <span v-if="regularLabel" aria-hidden="true" class="m-productDetailPrice__primaryLabel"> {{ regularLabel }}</span>
                    </s>
                </p>
                <p>
                    <span v-if="regularPrice" class="sr-only">{{ regularPrice }} </span>
                    <span class="m-productDetailPrice__primaryPrice">
                        {{ regularPrice }}
                    </span>
                    <span v-if="regularLabel" aria-hidden="true" class="m-productDetailPrice__primaryLabel"> {{ regularLabel }}</span>
                </p>
                <PricePerUnit
                    v-if="showConcentratedRegularPricePerUnit"
                    :label="concentratedLabel"
                    :price="concentratedRegularPricePerUnit"
                    :unit="concentratedPricePerUnitMeasurementType"
                />
                <PricePerUnit
                    v-if="showDilutedRegularPricePerUnit"
                    :label="dilutedLabel"
                    :price="dilutedRegularPricePerUnit"
                    :unit="dilutedPricePerUnitMeasurementType"
                    :tailwind-mods="'mb-3'"
                />
                <PricePerUnit
                    v-if="showOriginalRegularPricePerUnit"
                    :price="originalRegularPricePerUnit"
                    :unit="originalPricePerUnitMeasurementType"
                    :tailwind-mods="'mb-5'"
                />
            </div>
            <div v-if="showMemberPrice">
                <p class="m-productDetailPrice__secondaryPriceAndLabel">
                    <span v-if="preferredSrText" class="sr-only">{{ preferredSrText }} </span>
                    {{ preferredPrice }}
                    <span v-if="preferredLabel" aria-hidden="true"> {{ preferredLabel }}</span>
                </p>
                <PricePerUnit
                    v-if="showConcentratedPreferredPricePerUnit"
                    :label="concentratedLabel"
                    :price="concentratedPreferredPricePerUnit"
                    :unit="concentratedPricePerUnitMeasurementType"
                />
                <PricePerUnit
                    v-if="showDilutedPreferredPricePerUnit"
                    :label="dilutedLabel"
                    :price="dilutedPreferredPricePerUnit"
                    :unit="dilutedPricePerUnitMeasurementType"
                    :tailwind-mods="'mb-4'"
                />
                <PricePerUnit
                    v-if="showOriginalPreferredPricePerUnit"
                    :price="originalPreferredPricePerUnit"
                    :unit="originalPricePerUnitMeasurementType"
                    :tailwind-mods="'mt-3 mb-4'"
                />
            </div>
        </template>
    </div>
</template>

<script>
    import PricePerUnit from '@productstore/source/js/vue/components/00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'MProductDetailsPrice',
        components: { PricePerUnit },
        props: {
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
            dilutedPreferredPricePerUnit: {
                type: String,
                default: ''
            },
            dilutedPricePerUnitMeasurementType: {
                type: String,
                default: ''
            },
            dilutedRegularPricePerUnit: {
                type: String,
                default: ''
            },
            isPriceRange: {
                type: Boolean,
                default: false
            },
            originalPreferredPricePerUnit: {
                type: String,
                default: ''
            },
            originalPriceMember: {
                type: String,
                default: ''
            },
            originalPriceNonMember: {
                type: String,
                default: ''
            },
            originalPricePerUnitMeasurementType: {
                type: String,
                default: ''
            },
            originalPriceScreenReader: {
                type: String,
                default: 'Original price'
            },
            originalRegularPricePerUnit: {
                type: String,
                default: ''
            },
            preferredLabel: {
                type: String,
                default: ''
            },
            preferredPrice: {
                type: String,
                required: true
            },
            preferredSrText: {
                type: String,
                default: ''
            },
            regularLabel: {
                type: String,
                default: ''
            },
            regularPrice: {
                type: String,
                required: true
            },
            regularSrText: {
                type: String,
                default: ''
            },
            showStrikethroughOriginalPrice: {
                type: Boolean,
                default: false
            },
            viewMemberPricing: {
                type: Boolean,
                default: false
            },
            isRestrictedPack: {
                type: Boolean,
                default: false
            },
            memberOnlyOfferLabel: {
                type: String,
                default: ''
            }
        },
        computed: {
            showConcentratedPreferredPricePerUnit() {
                return this.concentratedPreferredPricePerUnit &&
                    this.concentratedPricePerUnitMeasurementType &&
                    this.concentratedLabel;
            },
            showConcentratedRegularPricePerUnit() {
                return this.concentratedRegularPricePerUnit &&
                    this.concentratedPricePerUnitMeasurementType &&
                    this.concentratedLabel;
            },
            showDilutedPreferredPricePerUnit() {
                return this.dilutedPreferredPricePerUnit &&
                    this.dilutedPricePerUnitMeasurementType &&
                    this.dilutedLabel;
            },
            showDilutedRegularPricePerUnit() {
                return this.dilutedRegularPricePerUnit &&
                    this.dilutedPricePerUnitMeasurementType &&
                    this.dilutedLabel;
            },
            showMemberPrice() {
                return !this.$env.ProductPricing?.HideProductMemberPrice;
            },
            showNonMemberPrice() {
                return !this.$env.ProductPricing?.HideProductNonMemberPrice;
            },
            showOriginalPreferredPricePerUnit() {
                return this.originalPreferredPricePerUnit &&
                    this.originalPricePerUnitMeasurementType;
            },
            showOriginalRegularPricePerUnit() {
                return this.originalRegularPricePerUnit &&
                    this.originalPricePerUnitMeasurementType;
            }
        }
    };
</script>
