<template>
    <modal ref="aif-pue" width="500px" :prevent-close="true">
        <template v-slot:content>
            <div class="px-30 md:px-0 pb-20 md:pb-0">
                <div v-html="rteContent"></div>
                <div class="md:flex pb-10 pt-4 md:pt-0">
                    <a-quantity
                        v-model="inputValue"
                        class="pr-16 block pb-20 md:pb-0"
                        :input-class="ErrorPUE ? 'border-red' : ''"
                        :value="data.Value"
                        :min-value="data.MinValue"
                        :max-value="data.MaxValue"
                        @input="trackUpdateQuantity" />
                    <button
                        type="button"
                        class="a-button text-base font-medium py-12 px-24 block w-full md:w-auto mr-0 md:mr-10"
                        @click="pue">
                        {{ labels.UpdateMyAccount }}
                    </button>

                    <a-loading-spinner v-if="loading" :visible="loading" size="sm" />
                </div>
                <div v-show="ErrorPUE" class="text-sm text-red pl-0 md:pl-36 text-center md:text-left">
                    <a-icon color="red" size="inherit">error_outline</a-icon>
                    <span class="pl-2">
                        {{ labels.Error.SelectNumber }}
                    </span>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';
    import api from '@api/routes/pue/householdcount';

    export default {
        name: 'MPue',
        errorCodes: ['PUEExemptionAttentionItem'],
        mixins: [ attentionItemModalMixin ],
        props: {
            checkout: {
                type: Function,
                required: true
            }
        },
        data() {
            return {
                ErrorPUE: false,
                inputValue: 10,
                loading: false
            };
        },
        computed: {
            ...mapState('riverbendSubscription', ['isRiverbendSubscription'])
        },
        watch: {
            inputValue() {
                if(this.inputValue > 0) {
                    this.ErrorPUE = false;
                }
            }
        },
        mounted() {
            this.inputValue = this.data?.Value;
            this.$modal.$on.hidden(() => {
                this.ErrorPUE = false;
                this.loading = false;
            });
            if(this.isRiverbendSubscription) {
                window.trackAction && window.trackAction({ id: 433 });
            }
        },
        methods: {
            ...mapActions('checkout', ['getCheckout']),
            ...mapActions('cart', ['getData']),
            ...mapActions('riverbendSubscription', ['setIsPueSubReady']),

            async pue() {
                if(this.inputValue > 0) {
                    this.loading = true;

                    // Save user's household
                    const response = await api.post({ HouseHoldCount: this.inputValue });
                    if(response.success) {
                        // If it's Riverbend, place subscription
                        if(this.isRiverbendSubscription) {
                            this.setIsPueSubReady(true);
                            window.trackAction && window.trackAction({ id: 434, eL: this.labels.UpdateMyAccount });
                        } else {
                            // If it's checkout page
                            if(this.$refs['aif-pue'].$el.parentElement.closest('.p-checkout')) {
                                this.getCheckout();

                            // If it's cart page
                            } else {
                                this.getData();
                            }
                        }

                        // Close the modal
                        this.$modal.hide();
                    }
                } else {
                    this.ErrorPUE = true;
                }
            },
            trackUpdateQuantity(payload, type) {
                if(this.isRiverbendSubscription) {
                    if(type === 'decrease') {
                        window.trackAction && window.trackAction({ id: 435, eL: '-' });
                    }

                    if(type === 'increase') {
                        window.trackAction && window.trackAction({ id: 435, eL: '+' });
                    }
                }
            }
        }
    };
</script>
