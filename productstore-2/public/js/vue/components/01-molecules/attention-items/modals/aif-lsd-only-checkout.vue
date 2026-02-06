<template>
    <modal width="630px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>

                <button
                    class="a-button text-base font-medium mt-10 py-12 px-25 mb-25 md:mb-0"
                    @click="goToCart"
                >
                    {{ labels.EditCart }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MLsdOnlyCheckoutModal',

        errorCodes: ['LSDNoProductPointsInCart', 'LsdItemsLowerThanRedemptionFee'],

        mixins: [ attentionItemModalMixin ],

        methods: {

            goToCart() {
                (this.data?.CartUrl) ? window.location.href = this.data.CartUrl : this.$modal.hide();
            }
        }
    };
</script>
