<!-- TO DO: Convert authorButton to a vue component -->
<template>
    <article class="m-couponAd">
        <div class="m-couponAd__wrapper">
            <!-- Start: Media block -->
            <div class="m-couponAd__image -desktop" :style="`background-image: url(${backgroundImageDesktop})`" role="img"></div>
            <div class="m-couponAd__image -mobile" :style="`background-image: url(${backgroundImageMobile})`" role="img">
            </div>
            <!-- End: Media block -->
            <div class="m-couponAd__col">
                <div class="m-couponAd__content">
                    <div class="m-rte" v-html="couponAd.RTEContent"></div>
                </div>

                <!-- Styling separate for Mobile and Desktop -->
                <div class="m-couponAd__cta">
                    <author-button
                        :aria-label="isDesktop? `${ couponAd.Images.Desktop.Alt }` : `${ couponAd.Images.Mobile.Alt }`"
                        :class-mods="`${ authorBtnClass }`"
                        :style-mods="`color: ${ textColor}`"
                        :cta="`${ couponAd.AuthorBtn.Text }`"
                        :href="`${ couponAd.AuthorBtn.Url }`"
                    />
                </div>
            </div>
        </div>
    </article>
</template>

<script>
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';

    export default {
        name: 'MCouponAd',
        mixins: [isDesktop],
        props: {
            couponAd: {
                type: Object,
                default: function() {
                    return {};
                }
            }
        },
        computed: {
            authorBtnClass() {
                const screenSpecificClasses = this.isDesktop ? `${this.couponAd.AuthorBtn.XDesktopPadding} ${this.couponAd.AuthorBtn.DesktopWidth}` : `${this.couponAd.AuthorBtn.XMobilePadding} ${this.couponAd.AuthorBtn.MobileWidth}`;
                return `${screenSpecificClasses} ${this.couponAd.AuthorBtn.Border} ${this.couponAd.AuthorBtn.BgColor} ${this.couponAd.AuthorBtn.Casing} ${this.couponAd.AuthorBtn.CornerType} ${this.couponAd.AuthorBtn.Size}`;
            },
            ctaText() {
                return this.couponAd.AuthorBtn.Text;
            },
            backgroundImageDesktop() {
                return this.couponAd.Images.Desktop.Url;
            },
            backgroundImageMobile() {
                return this.couponAd.Images.Mobile.Url;
            },
            textColor() {
                return this.couponAd.AuthorBtn.TextColor;
            }
        }
    };
</script>
