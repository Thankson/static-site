<template>
    <div>
        <div v-if="showSuccessMessages" class="o-backupOrder__confirmation" :class="{'-isCn' : isCn}">
            <p v-show="successfulSave && cardUpdated && !hasError" role="alert">{{ getLocalizationProp('Labels.ConfirmationSuccess') }}</p>
        </div>

        <m-error-card
            v-if="cardError && getLocalizationProp('Labels.ErrorCard')"
            :reload-text="getLocalizationProp('Labels.ErrorCard.RefreshPage')"
            :text="getLocalizationProp('Labels.ErrorCard.GenericFailureMessage')"
        />

        <ul v-else ref="cardHolder" class="o-backupOrder__row -card">
            <slot></slot>
        </ul>

        <div class="o-backupOrder__row -actions" :class="{'-isCn' : isCn}">
            <v-button
                :is-anchor="true"
                :cta="backToAccountText"
                class="-backupOrder lg:mr-20 -center -white md:mb-0"
                :href="getLocalizationProp('Data.BackToAccountLink.Url', 'http://melaleuca.com')"
                @click="gtmTrackAction({ id: 210, text: backToAccountText }, $event)"
            >
            </v-button>
            <v-button
                :cta="updateOrderText"
                :class="[{ '-disabled': disabledButtonState }, '-backupOrder -center md:mb-0 lg:mr-20']"
                @click="[saveOrder(), track(backupOrder.key, $event)]"
            >
                <span v-if="selectedCard === 0" class="sr-only">{{ getLocalizationProp('Labels.UpdateBackupOrderAria', '') }}</span>
            </v-button>
        </div>

        <div v-if="hasError" class="o-backupOrder__row -error" role="alert">
            <span class="o-backupOrder__error"><span aria-hidden="true" class="a-icon o-backupOrder__icon material-icons -error -inherit">error_outline</span> <span v-html="errorMessage"></span></span>
        </div>
    </div>
</template>

<script>
    import vButton from '../../00-atoms/buttons/button.vue';
    import { mapState, mapActions } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OBackupOrder',
        components: {
            vButton
        },
        mixins: [ localizationMixin ],
        props: {
            scriptId: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                isButtonDisabled: true,
                cardUpdated: false,
                selectedCard: -1,
                selectedKey: null,
                selectedCardIsCustom: false,
                hasCustomOrder: false,
                cardError: false
            };
        },
        computed: {
            ...mapState('customBackupOrder', ['backupOrder', 'errorMessage', 'hasError', 'savedBackupOrder', 'successfulSave']),
            disabledButtonState() {
                let orderNotSelected = !this.backupOrder?.index;
                let orderSaved = this.successfulSave && (this.savedBackupOrder.key === this.selectedKey) &&
                    (this.savedBackupOrder.index === this.selectedCard); // item currently selected
                return (orderNotSelected || orderSaved);
            },
            backToAccountText() {
                const text = this.getLocalizationProp('Data.BackToAccountLink.Text', 'Back to Account');
                return text;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            updateOrderText() {
                const text = this.getLocalizationProp('Labels.UpdateBackupOrder', 'Update Your Backup Order');
                return text;
            },
            showSuccessMessages() {
                return !this.isCn || (this.isCn && this.successfulSave && this.cardUpdated && !this.hasError);
            }
        },
        watch: {
            backupOrder() {
                if(this.backupOrder.key) {
                    this.selectedCard = this.backupOrder.index;
                    this.selectedKey = this.backupOrder.key;
                    this.selectedCardIsCustom = this.backupOrder.isCustomCard;
                }
                if(this.hasError) {
                    const status = this.successfulSave;
                    this.clearErrorMessages(status);
                }
            }
        },
        mounted() {
            this.setChildIndexes();

            this.$nextTick(function() {
                this.isOrderCustomized();
            });
        },
        methods: {
            ...mapActions('customBackupOrder', ['saveBackupOrder', 'clearErrorMessages', 'showErrorMessages']),
            dataLayerPush(packName) {
                window.dataLayer && window.dataLayer.push(
                    {
                        'event': 'userEvent',
                        'eC': 'BUO',
                        'eA': 'BUO Updated',
                        'eL': packName
                    });
            },
            isOrderCustomized() {
                const params = new URLSearchParams(window.location.search);
                if(params.get('type') === 'custom') {
                    this.hasCustomOrder = true;
                    this.cardUpdated = true;
                }
            },
            saveOrder() {
                if(this.disabledButtonState) return;

                const isCustomOrder = !this.hasCustomOrder && this.selectedCardIsCustom;
                if(isCustomOrder) {
                    const errorMsg = this.getLocalizationProp('Labels.ErrorCustomizeOrder', 'You must first customize your order..');
                    this.showErrorMessages({ msg: errorMsg, status: true });
                    return true;
                }
                this.clearErrorMessages();
                this.saveBackupOrder({ key: this.backupOrder.key, index: this.backupOrder.index });
                this.cardUpdated = true;
            },
            setChildIndexes() {
                const items = this.$children.filter(child => child.$refs.productCard);
                const that = this;
                items.forEach(function(item, i) {
                    item.index = i;
                    if(!item.localization?.Data?.Success) {
                        that.cardError = true;
                    }
                });
            },
            track(packName, event) {
                this.gtmTrackAction({ id: 210, text: this.updateOrderText }, event);
                this.dataLayerPush(packName);
            }
        }
    };
</script>
