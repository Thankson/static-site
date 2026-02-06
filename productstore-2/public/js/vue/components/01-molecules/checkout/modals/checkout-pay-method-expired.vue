<template>
    <modal width="500px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-if="rteContent" v-html="rteContent"></div>
                <button
                    v-modal-hide
                    type="button"
                    class="a-button -white text-base text-center font-medium mt-10 pt-12 pb-7 md:py-12 px-25 "
                    @click="expandPaymentMethod">
                    {{ differentPayMethod }}
                </button>

                <a
                    :href="linkUrl"
                    class="a-button text-base text-center font-medium mt-18 py-12 px-40 md:px-25 mb-30 md:mb-0">

                    {{ linkText }}
                </a>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions, mapGetters, mapMutations } from 'vuex';
    import { get } from 'lodash';
    import checkoutTertiaryModal from '../../../../mixins/checkout-tertiary-modal';

    export default {
        name: 'MPayMethodExpired',
        mixins: [ checkoutTertiaryModal ],
        computed: {
            ...mapGetters('checkout', ['selectedPayMethod']),

            differentPayMethod() {
                return get(this.data, 'Data.PayMethodExpired.Modal.Data.DifferentPayMethod', '');
            },
            linkText() {
                return get(this.data, 'Data.PayMethodExpired.Modal.Data.UpdatePayMethod.Text', null);
            },
            linkUrl() {
                let url = get(this.data, 'Data.PayMethodExpired.Modal.Data.UpdatePayMethod.Url', '');

                if(url) {
                    // if url already includes url queries, then "&" will be our delimiter. otherwise we need to start a new url query string with "?"
                    const delimiter = url.includes('?') ? '&' : '?';
                    url = url + delimiter + `PayMethodId=${this.selectedPayMethod.PayMethodId}`;

                    // Concat Origin and Pathname to prevent Query Strings
                    const backTo = `${window.location.origin}${window.location.pathname}`;
                    url = url + `&backTo=${backTo}&fromCheckout=true`;
                }

                return url;
            },
            rteContent() {
                return get(this.data, 'Data.PayMethodExpired.Modal.RteContent', null);
            }
        },
        created() {
            this.SET_PAYMENT_METHOD_ERROR();
        },
        beforeDestroy() {
            this.SET_PAYMENT_METHOD_ERROR(false);
        },
        methods: {
            ...mapActions('checkoutAccordions', ['expandPaymentMethod']),
            ...mapMutations('checkoutAccordions', ['SET_PAYMENT_METHOD_ERROR'])
        }
    };
</script>
