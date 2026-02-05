<template>
    <span class="m-checkoutShippingLabel" role="text">
        <span class="m-checkoutShippingLabel__carrier">
            <span v-if="!hideCarrier">{{ carrier }} -
            </span>
            <span class="m-checkoutShippingLabel__quote">
                <span v-if="!hideShipMethod">{{ shipMethod }}</span>
                ({{ quote }})
            </span>
        </span>

        <span v-if="hasShippingDate" class="m-checkoutShippingLabel__date">
            {{ getByLabel }} {{ date }}
        </span>
    </span>
</template>

<script>
    export default {
        name: 'MCheckoutShippingLabel',
        props: {
            carrier: {
                type: String,
                required: true,
                default: ''
            },
            date: {
                type: String,
                default: ''
            },
            getByLabel: {
                type: String,
                default: 'Get it by'
            },
            hasShippingDate: {
                type: Boolean,
                default: false
            },
            hideShipMethod: {
                type: Boolean,
                default: false
            },
            quote: {
                type: String,
                required: true
            },
            shipMethod: {
                type: String,
                required: true
            },
            hideCarrier: {
                type: Boolean,
                default: false
            }
        }
    };
</script>
