<template>
    <li
        ref="productCard"
        :class="[
            'o-backupOrder__listItem',
            {'-isCn' : isCn},
            {'-disabled': customCard},
            { '-active': isClicked, '-error': hasError && isClicked}
        ]"
        v-on:keyup.enter="onClick($event)"
        @click="[onClick($event), track(card.BackupOrderTypes[selectedOption].Product.Title)]"
    >
        <div
            class="m-backupOrder__card"
            role="button"
            :aria-pressed="isClicked ? 'true' : 'false'"
            tabindex="0"
        >
            <div class="m-backupOrder__status">
                <span v-show="isClicked && (backupOrder.key === savedBackupOrder.key) && !hasError && successfulSave" class="m-backupOrder__icon font-material">check</span>
                <span v-show="isClicked && hasError" aria-hidden="true" class="m-backupOrder__icon a-icon material-icons -error -inherit">error_outline</span>
            </div>

            <figure v-if="card" class="m-backupOrder__fig">
                <img :src="imageInfo.imageUrl" :alt="imageInfo.imageAlt" class="m-backupOrder__img" />
            </figure>
            <perfect-scrollbar>
                <div class="m-backupOrder__summary">
                    <h3 class="m-backupOrder__title">{{ card.BackupOrderTypes[selectedOption].Product.Title }}</h3>
                    <div class="m-backupOrder__description" v-html="`${card.BackupOrderTypes[selectedOption].Product.Description}`"></div>
                </div>
            </perfect-scrollbar>
            <div
                v-if="!isCn && card.BackupOrderTypes[selectedOption].Product.PriceRange.RawMaxPreferredPrice > 0 &&
                    card.BackupOrderTypes[selectedOption].Product.PriceRange.RawMaxPoints > 0"
                class="m-backupOrder__details">

                <span class="m-backupOrder__points">{{ card.BackupOrderTypes[selectedOption].Product.PriceRange.MaxPreferredPrice }}</span>
                <span v-if="viewPoints" class="m-backupOrder__separator"></span>
                <span v-if="viewPoints" class="m-backupOrder__price">{{ card.BackupOrderTypes[selectedOption].Product.PriceRange.MaxPoints }} {{ getLocalizationProp('Labels.Points') }}</span>
            </div>
            <template v-if="isCn">
                <div
                    v-if="(card.BackupOrderTypes[selectedOption].Product.PriceRange.RawMaxPreferredPrice > 0 &&
                        card.BackupOrderTypes[selectedOption].Product.PriceRange.RawMaxPoints > 0)
                        || card.BackupOrderTypes[selectedOption].Product.PriceRange.RawMaxPreferredPrice == 0"
                    class="m-backupOrder__details">

                    <span v-if="viewPoints" class="m-backupOrder__price">
                        <span>{{ card.BackupOrderTypes[selectedOption].Product.PriceRange.RawMaxPreferredPrice == 0 ?
                            parseInt(card.BackupOrderTypes[selectedOption].Product.PriceRange.RawMaxPoints) : card.BackupOrderTypes[selectedOption].Product.PriceRange.MaxPoints }}</span>
                        <span class="m-backupOrder__label">{{ getLocalizationProp('Labels.Points') }}</span>
                    </span>
                    <span v-if="viewPoints" class="m-backupOrder__separator"></span>
                    <span class="m-backupOrder__points">
                        <span>{{ card.BackupOrderTypes[selectedOption].Product.PriceRange.MaxPreferredPrice }}</span>
                        <span class="m-backupOrder__label">{{ getLocalizationProp('Labels.Total') }}</span>
                    </span>
                </div>
                <div>
                    <span class="m-backupOrder__commitment">
                        {{ card.BackupOrderTypes[selectedOption].Product.PriceRange.MaxPreferredCommitmentPrice || card.BackupOrderTypes[selectedOption].Product.PriceRange.MaxPreferredPrice }}
                    </span>
                    <div class="m-backupOrder__label leading-base md:inline">{{ getLocalizationProp('Labels.Commitment') }}</div>
                </div>
            </template>
            <div class="m-backupOrder__actions">
                <template v-if="customizeUrl">
                    <a
                        class="m-backupOrder__link a-button -center -full"
                        :href="customizeUrl"
                    >{{ getLocalizationProp('Data.CustomizeLink.Text') }}</a>
                </template>
                <template v-else>
                    <div v-if="card.BackupOrderTypes.length > 1" class="m-backupOrder__wrapper">
                        <label class="sr-only" for="unique_id">{{ getLocalizationProp('Labels.SelectAriaLabel') }}</label>
                        <select
                            id="unique_id"
                            class="m-backupOrder__dropdown"
                            name="product-name-select"
                            @change="[updatePricing($event), gtmTrackAction({ id: 209 }, $event, true)]"
                        >
                            <template v-for="(product, p) in card.BackupOrderTypes">
                                <option :key="p" :value="product.Product.Sku" :selected="product.Selected">{{ product.Selection }}</option>
                            </template>
                        </select>
                    </div>
                </template>
            </div>
        </div>
    </li>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: 'BackupOrderCard',
        mixins: [ localizationMixin ],
        props: {
            saveStatus: {
                type: Boolean,
                default: false
            },
            scriptId: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                isClicked: false,
                selectedOption: 0,
                customCard: false,
                selectedCard: 0,
                singleCardView: false,
                card: {
                    'BackupOrderTypes': [
                        {
                            'Selection': 'Members Choice 35 pp',
                            'Key': 'BackupOrderWithoutVitality',
                            'Selected': false,
                            'Image': {
                                'Url': 'https://cdnsc1.melaleuca.com/na/images/my-account/backup-orders/1004h-01-enus.png',
                                'Alt': ''
                            },
                            'Product': {
                                'Title': 'Member’s Choice Pack',
                                'Description': 'Includes a rotating assortment of wellness products',
                                'PriceRange': {
                                },
                                'Selected': false,
                                'Sku': '1004',
                                'Image': {
                                    'Url': '//cdnsc1test.melaleuca.com/cdn-cgi/image/width=200height=200,quality=85,format=auto/global/products/1017198149.png',
                                    'Alt': 'Member’s Choice Pack'
                                }
                            }
                        }
                    ]},
                hasBackupOrder: [],
                index: null
            };
        },
        computed: {
            ...mapState('customBackupOrder', ['backupOrder', 'errorMessage', 'hasError', 'savedBackupOrder', 'successfulSave']),
            ...mapState('userFlags', ['userFlags']),
            pointsLabel() {
                return this.getLocalizationProp('Labels.Points');
            },
            selectAriaLabel() {
                return this.getLocalizationProp('Labels.SelectAriaLabel');
            },
            customizeUrl() {
                return this.customCard ? this.getLocalizationProp('Data.CustomizeLink.Url') : '';
            },
            isCn() {
                return this.$env.IsCn || false;
            },
            imageInfo() {
                const order = this.card.BackupOrderTypes?.[this.selectedOption];
                const selectedProduct = order?.Product;
                const imageUrl = selectedProduct?.Image?.Url ?? order?.Image?.Url;
                const imageAlt = selectedProduct?.Image?.Alt ?? order?.Image?.Alt;
                return { imageUrl, imageAlt };
            },
            viewPoints() {
                return !this.$env?.HidePoints && this.userFlags?.ViewPoints;
            }
        },
        watch: {
            localization() {
                this.card = this.getLocalizationProp('Data');
                this.customCard = this.getLocalizationProp('Data.CustomizeLink') !== '';
                this.singleCardView = !!this.localization;
                this.setCardSelection();
            }
        },
        updated() {
        },
        mounted() {
            this.$root.$on('card-clicked', () => {
                this.isClicked = false;
                this.$emit('toggle', this.isClicked, this);
            });
        },
        methods: {
            ...mapMutations('customBackupOrder', ['SAVE_BACKUP_ORDER', 'SET_BACKUP_ORDER_CARDS']),
            dataLayerPush(eventlabel) {
                window.dataLayer && window.dataLayer.push(
                    {
                        'event': 'userEvent',
                        'eC': 'BUO',
                        'eA': 'Select',
                        'eL': eventlabel
                    });
            },
            onClick(e) {
                this.$root.$emit('card-clicked', this.isClicked);
                this.isClicked = !this.isClicked;
                this.updateSave(this.card.BackupOrderTypes[this.selectedOption].Key, this.index, this.customCard);
            },
            setCardSelection() {
                const backupOrderCards = this.getLocalizationProp('Data.BackupOrderTypes');
                if(backupOrderCards.length < 0) return;

                backupOrderCards.forEach((card, i) => {
                    if(card.Product === null) return;
                    if(card.Selected) {
                        this.isClicked = true;
                        this.selectedOption = i;
                        this.updateSave(this.card.BackupOrderTypes[this.selectedOption].Key, this.index, this.customCard);
                        this.hasBackupOrder = this.backupOrder;
                        this.$store.commit('customBackupOrder/SAVE_BACKUP_ORDER', { params: { key: this.hasBackupOrder.key, index: this.hasBackupOrder.index, isCustomCard: this.customCard }});
                    }
                });
            },
            track(title) {
                this.dataLayerPush(title);
            },
            updatePricing(event) {
                if(this.selectedOption === event.target.selectedIndex) return;
                this.selectedOption = event.target.selectedIndex;
                this.updateSave(this.card.BackupOrderTypes[this.selectedOption].Key, this.index, this.customCard);
            },
            updateSave(_key, _index, _isCustomCard) {
                this.$store.commit('customBackupOrder/SET_BACKUP_ORDER_CARDS', { key: _key, index: _index, isCustomCard: _isCustomCard });
            }
        }
    };
</script>
