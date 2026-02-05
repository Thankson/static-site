<template>
    <div v-if="summary && summary.TaxGroups && summary.TaxGroups.length > 0" class="m-additionalTax">
        <div class="m-checkoutLSD py-16">
            <h3 class="m-checkoutLSD__title">{{ labels.AdditionalTaxSummaryTitle || '' }}<span v-if="labels.AdditionalTaxSummaryText" class="m-checkoutLSD__addtnlText">({{ labels.AdditionalTaxSummaryText }})</span></h3>
            <ul class="m-checkoutLSD__text">
                <li v-for="taxGroup, idx in summary.TaxGroups" :key="taxGroup.TaxRate" class="m-additionalTax__listItem">
                    <span class="m-additionalTax__label">
                        {{ taxLabel(taxGroup, idx) }}
                    </span><span class="m-additionalTax__total">
                        {{ taxLabelTotal(taxGroup) }}
                    </span>
                </li>
                <li class="m-additionalTax__listItem -sum">
                    <span class="m-additionalTax__total font-bold">{{ totalTax }}</span>
                </li>
            </ul>
        </div>
        <p v-if="showIndicateTaxLabel" class="m-checkoutLSD__text pt-40">{{ labels.IndicateTax || '' }}</p>
    </div>
</template>
<script>
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MAdditionalTax',
        props: {
            labels: {
                type: Object,
                default: () => {}
            },
            summary: {
                type: Object,
                default: () => {}
            }

        },
        computed: {
            totalTax() {
                return this.replaceTokenArray(
                    this.labels?.TaxTotal,
                    [ this.summary?.TaxGroupTotal ]
                );
            },
            showIndicateTaxLabel() {
                const hasNonBaseRate = this.summary.TaxGroups.some(taxGroup => !taxGroup.IsBaseRate);
                return this.labels?.IndicateTax && hasNonBaseRate;
            }
        },
        methods: {
            replaceTokenArray,
            taxLabel(taxGroup, idx) {
                let label = this.labels?.Tax10;
                if(!taxGroup?.IsBaseRate) {
                    label = this.labels?.Tax8;
                }
                let formattedTax = (taxGroup?.TaxRate * 100);
                formattedTax = formattedTax % 1 === 0 ? formattedTax : formattedTax.toFixed(1);
                return this.replaceTokenArray(
                    label,
                    [
                        formattedTax,
                        taxGroup?.FormattedTotalTaxableAmountPlusTax
                    ]
                );
            },
            taxLabelTotal(taxGroup) {
                return this.replaceTokenArray(
                    this.labels?.Tax,
                    [
                        taxGroup?.FormattedTotalTax
                    ]
                );
            }
        }
    };

</script>
