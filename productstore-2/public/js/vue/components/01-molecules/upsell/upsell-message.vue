<template>
    <div class="m-upsellMessage">
        <a-icon class="mr-10" color="white" size="large">sell</a-icon>
        <span
            class="mr-25 flex-grow"
            v-html="text"
        ></span>
        <o-shelf-configurator
            :sku="sku"
            :line-id="lineId"
            :quantity="1"
            :savings="savingsValue"
            :pre-selected-sku="sku"
            :pre-selected-configurations="preSelectedConfigurations"
            :shelf-text="shelfText"
            :upsell="upsell"
            cart="upsell"
            class="m-upsellMessage__ctaBtn"
        >
            {{ buttonText }}
        </o-shelf-configurator>
    </div>
</template>

<script>
    export default {
        name: 'MUpsellMessage',
        props: {
            buttonText: {
                type: String,
                default: ''
            },
            lineId: {
                type: String,
                required: true
            },
            preSelectedSku: {
                type: String,
                default: null
            },
            /** @typedef {{ FeatureSku: string, SelectedSku: string }} Configuration */
            /** @type {Array<Configuration>} */
            preSelectedConfigurations: {
                type: Array,
                default: () => []
            },
            quantity: {
                type: Number,
                default: 0
            },
            savingsValue: {
                type: String,
                default: ''
            },
            sku: {
                type: String,
                default: null
            },
            shelfText: {
                type: String,
                default: null
            },
            text: {
                type: String,
                default: ''
            },
            upsell: {
                type: Object,
                default: () => {}
            }
        }
    };
</script>
