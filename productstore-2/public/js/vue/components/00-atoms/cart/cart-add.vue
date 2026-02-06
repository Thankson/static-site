<template>
    <button type="button" @click="addToCart">
        <slot />
    </button>
</template>

<script>
    import customEvents from '../../../utils/custom-events';

    export default {
        name: 'ACartAdd',
        props: {
            gtmId: {
                type: Number,
                default: null
            },
            productName: {
                type: String,
                default: ''
            },
            sku: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }
        },
        methods: {
            addToCart(event) {
                if(this.gtmId && this.productName) this.gtmTrackAction({id: this.gtmId, text: this.productName}, event);
                else if(this.gtmId) this.gtmTrackAction({id: this.gtmId}, event);

                // todo: handle cart actions (hit api, setup shelf based off of configurators, etc etc)
                console.log(`Adding product to cart - sku: ${this.sku} quantity: ${this.quantity}`);

                // this opens shelf that will display configurator options
                this.$root.$emit(customEvents.shelf.show, { el: this.$el });
            }
        }
    };
</script>
