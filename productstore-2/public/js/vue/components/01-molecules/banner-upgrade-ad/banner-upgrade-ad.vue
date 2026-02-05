<template>
    <article class="m-bannerUpgrade" :class="[context.Data.BannerVersion]" :style="bannerBackgroundImage">
        <div class="m-bannerUpgrade__rte" v-html="context.Data.Rte"></div>

        <div class="m-bannerUpgrade__content">
            <div class="m-bannerUpgrade__upgrade">
                <p class="m-bannerUpgrade__title">{{ context.Labels.UpgradeFrom }}</p>
                <img :src="context.Data.ProductImage.One.Url" :alt="context.Data.ProductImage.One.Alt" class="m-bannerUpgrade__image -first" style="max-height: 99px">
            </div>

            <div class="m-bannerUpgrade__upgrade">
                <p class="m-bannerUpgrade__title">{{ context.Labels.ToGet }}</p>
                <img :src="context.Data.ProductImage.Two.Url" :alt="context.Data.ProductImage.Two.Alt" class="m-bannerUpgrade__image" style="max-height: 85px">
            </div>

            <div class="m-bannerUpgrade__detailsWrapper">
                <div class="m-bannerUpgrade__details">
                    <template v-if="userFlags.ViewMemberPricing">
                        <p class="font-bold">{{ context.Data.MemberPrice }} {{ context.Labels.Member }}</p>
                        <p>{{ context.Data.RegularPrice }} {{ context.Labels.Regular }}</p>
                        <p>{{ context.Data.Savings }} {{ context.Labels.Savings }}</p>
                    </template>
                    <template v-else>
                        <p class="font-bold">{{ context.Data.RegularPrice }}</p>
                        <p class="font-bold">{{ context.Labels.Regular }}</p>
                    </template>
                    <p v-if="userFlags.ViewPoints">{{ context.Data.Points }} {{ context.Labels.Points }}</p>
                    <o-shelf-configurator
                        class="m-bannerUpgrade__cta"
                        :aria-label="context.Data.UpgradeStatus"
                        :family-id="familyId"
                        :sku="sku"
                        @open="addRemoval">

                        {{ context.Data.UpgradeNow }}
                    </o-shelf-configurator>
                </div>
            </div>

            <div class="m-bannerUpgrade__detailsImage">
                <img :src="context.Data.ProductImage.Three.Url" :alt="context.Data.ProductImage.Three.Alt" class="m-bannerUpgrade__image" style="max-height: 147px">
            </div>
        </div>
    </article>
</template>

<script>
    export default {
        name: 'MBannerUpgradeAd',
        props: {
            context: {
                type: Object,
                default: () => {}
            },
            familyId: {
                type: String,
                default: null
            },
            sku: {
                type: String,
                default: null
            },
            lineIdRemove: {
                type: String,
                default: null
            },
            userFlags: {
                type: Object,
                default: () => {}
            }
        },
        computed: {
            bannerBackgroundImage: function() {
                const isMobile = (navigator.userAgent.toLowerCase().match(/mobile/i)) && (window.innerWidth <= 767);
                let backgroundImage = this.context?.Data?.BackgroundImage?.length > 0 ? {'background-image': `url(${this.context?.Data?.BackgroundImage})`} : {'background': `${this.context?.Data?.BackgroundColor}`};
                if(this.isCn && isMobile) {
                    backgroundImage = this.context?.Data?.MobileBackgroundImage?.length > 0 ? {'background-image': `url(${this.context?.Data?.MobileBackgroundImage})`} : {'background': `${this.context?.Data?.BackgroundColor}`};
                }
                return backgroundImage;
            },
            isCn: function () {
                return this.$env?.IsCn || false;
            }
        },
        mounted() {
            this.clearRemoval();

            this.$shelf.$on.hidden(() => this.clearRemoval());
        },
        methods: {
            addRemoval() {
                this.$store.commit('addToCart/SET_UPGRADE_AD_PREV_LINE_ID', this.lineIdRemove);
            },
            clearRemoval() {
                this.$store.commit('addToCart/SET_UPGRADE_AD_PREV_LINE_ID', null);
            }
        }
    };
</script>
