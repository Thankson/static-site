<template>
    <modal width="470px" :prevent-close="!isCn">
        <template v-slot:default>
            <div class="bg-white p-40" :class="{'o-modal__content': isCn}">
                <div v-if="rteContent" v-html="rteContent"></div>
                <button
                    v-modal-hide
                    class="a-button block md:w-auto"
                    :class="{'mt-20 px-25 py-16 md:mt-15' : isCn, ' py-12 mt-30 w-full md:mt-20 md:px-50': !isCn}"
                    type="button"
                    @click="gtmTrackAction({ id: 407 }, $event)"
                >
                    {{ continueButton }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { get } from 'lodash';
    import cartTertiaryModal from '../../../../mixins/cart-tertiary-modal';

    export default {
        name: 'MBackDatingNote',
        mixins: [ cartTertiaryModal ],
        computed: {
            ...mapGetters('cart', ['formattedBackDatingDate']),
            continueButton() {
                return get(this.data, 'Data.BackDatingNote.Modal.Data.ContinueButton', '');
            },
            rteContent() {
                const text = get(this.data, 'Data.BackDatingNote.Modal.RteContent', null);
                return text ? text.replace('{0}', this.formattedBackDatingDate) : null;
            },
            isCn: function () {
                return this.$env?.IsCn || false;
            }
        },
        mounted() {
            this.$modal.$on.shown(() => {
                window.dataLayer && window.dataLayer.push({
                    'event': 'OrderBackdating',
                    'eC': 'Order Backdating impressions'
                });
            });
        }
    };
</script>
