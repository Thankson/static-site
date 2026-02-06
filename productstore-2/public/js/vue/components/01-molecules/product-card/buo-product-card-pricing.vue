<template>
    <div class="m-buoProductCardPricing">
        <div class="m-prodCard__pricing">
            <span class="m-prodCard__row -price -standard">
                <span v-if="isPreferred" class="m-prodCard__text -price -mdBold" v-html="preferredPrice" />
                <span v-if="regularPrice" class="m-prodCard__text -price">
                    <slot name="regular-price-label">
                        <span class="m-prodCard__text -label">{{ regularPriceLabel }}</span>
                        <span class="sr-only">Price</span>
                    </slot>
                </span>
                <span v-else class="m-prodCard__text -price -mdBold">
                    <span v-if="isRegularPriceNotARange" v-html="regularPrice" />
                </span>
            </span>
        </div>
        <div v-if="showPoints" class="m-prodCard__points">
            <span class="m-prodCard__text -points" :class="{ '-highlight': viewPointsHighlight }" v-html="points" />
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MBuoProductCardPricing',
        props: {
            isRegularPriceNotARange: {
                type: Boolean,
                default: false
            },
            isPreferred: {
                type: Boolean,
                default: false
            },
            points: {
                type: String,
                default: ''
            },
            preferredPrice: {
                type: String,
                default: ''
            },
            regularPrice: {
                type: String,
                default: ''
            },
            regularPriceLabel: {
                type: String,
                default: ''
            },
            showPoints: {
                type: Boolean,
                default: false
            },
            viewPointsHighlight: {
                type: Boolean,
                default: false
            }
        }
    };
</script>
