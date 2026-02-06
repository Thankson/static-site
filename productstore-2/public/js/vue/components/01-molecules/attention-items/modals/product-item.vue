<template>
    <div class="m-productItem" :class="{'-bottom': isBottom, '-restrictPack': showRestrictedPacksMessage, '-isCn': isCn}">
        <div
            v-if="line.Image && line.Image.Url"
            class="m-productItem__media">

            <img
                :src="line.Image.Url"
                :alt="line.Image.Alt || line.Title"
                class="m-productItem__img">
        </div>

        <div class="m-productItem__col -title">
            <span class="m-productItem__text -title" v-html="line.Title"></span>
            <span class="m-productItem__text -configTitle" v-html="getConfigTitle(line)"></span>
        </div>

        <div class="m-productItem__col -pay ">
            <p class="m-productItem__text -price">{{ price }}</p>
            <p v-if="!hidePoints" class="m-productItem__text -points">{{ pointsLabel }}</p>
            <p class="m-productItem__text -quantity">{{ replaceToken(labels.Quantity, line.Quantity) }}</p>
        </div>

        <div v-if="showRestrictedPacksMessage" class="m-productItem__col -restrictPacks">
            <p class="m-productItem__text" v-html="labels.PurchaseByBecomingAMember"></p>
        </div>
    </div>
</template>

<script>
    import replaceToken from '@common/source/js/vue/utils/replace-token.js';
    import { mapGetters } from 'vuex';

    export default {
        name: 'MAifProductItem',
        props: {
            isBottom: {
                type: Boolean,
                default: false
            },
            line: {
                type: Object,
                default: function() {}
            },
            labels: {
                type: Object,
                default: function() {}
            },
            price: {
                type: String,
                default: ''
            }
        },
        computed: {
            ...mapGetters('cartSummary', ['getUserFlags']),

            showRestrictedPacksMessage() {
                return !this.isCn && !this.getUserFlags.CanPurchaseRestrictedPacks && this.line.IsRestrictedPack;
            },

            viewPointsFlag() {
                return this.getUserFlags.ViewPoints || false;
            },

            pointsLabel() {
                let pointsLabel = '';

                if(!this.viewPointsFlag && this.labels.NonMember) {
                    pointsLabel = this.labels.NonMember;
                } else if(this.line.Points) {
                    pointsLabel = this.replaceToken(this.labels.Points, this.line.Points);
                }

                return pointsLabel;
            },

            hidePoints() {
                return this.$env?.HidePoints || false;
            },

            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        methods: {
            replaceToken,
            getConfigTitle(line) {
                let configuration = '';
                if(line.Configurations && line.Configurations.length) {
                    line.Configurations.forEach((title, idx) => {
                        configuration += title.Title;
                        if(idx !== line.Configurations.length) {
                            configuration += '<br/>';
                        }
                    });
                } else {
                    if(this.labels.Size && line.Size) configuration = this.labels.Size + ' ' + line.Size + '<br/>';
                    if(line.OptionTitle) configuration += line.OptionTitle;
                }
                return configuration;
            }
        }
    };
</script>
