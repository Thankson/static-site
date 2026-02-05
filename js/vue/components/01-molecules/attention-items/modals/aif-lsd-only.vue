<template>
    <modal ref="aif-lsd-only" width="470px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>

                <button
                    class="a-button text-base font-medium mt-10 py-12 px-25 mb-25 md:mb-0"
                    @click="setLsdOnlyOneProd"
                >
                    {{ labels.Continue }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';
    import eventBus from '../../../../mixins/event-bus';

    export default {
        name: 'MLsdOnlyModal',

        errorCodes: ['LSDOnlyOneProductPointItemInCart'],

        mixins: [ attentionItemModalMixin ],

        data() {
            return {
                lineId: null,
                type: null
            };
        },
        watch: {
            sections() {
                this.verifyLineId();
            }
        },
        mounted() {
            this.verifyLineId();

            this.$modal.$on.hidden(() => {
                if(this.type === 'update') {
                    eventBus.$emit('setInputCartItemValue', 1);
                }
            });
        },
        methods: {
            ...mapActions('cart', ['setLsdOnlyOneProductId']),
            open(payload) {
                this.type = payload;
                this.$modal.show();
            },
            setLsdOnlyOneProd() {
                this.$modal.hide();
            },
            verifyLineId() {
                this.lineId = this.sections.ReadonlyProductList?.Data[0]?.Product?.LineId;

                this.setLsdOnlyOneProductId({lineId: this.lineId});
            }
        }
    };
</script>
