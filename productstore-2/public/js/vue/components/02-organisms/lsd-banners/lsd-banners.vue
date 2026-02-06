<template>
    <article
        class="m-varWindow"
        :class="size"
        data-testid="article-varWindow">

        <ul
            v-if="banners && banners.length"
            class="o-lsdBanners">

            <li
                v-for="(banner, index) in banners"
                :key="safeId(`lsdBanner_${index}`)"
                class="o-lsdBanners__item">

                <LsdBanner
                    class="md:bg-transparent"
                    :icon-alt="banner.BannerIcon && banner.BannerIcon.Alt"
                    :icon-url="banner.BannerIcon && banner.BannerIcon.Url"
                    :link="banner.BannerLink && banner.BannerLink.Url"
                    :text="banner.BannerText"
                />
            </li>
        </ul>
    </article>
</template>

<script>
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import LsdBanner from '../../01-molecules/lsd-banner/lsd-banner.vue';

    export default {
        name: 'OLsdBanners',
        components: {
            LsdBanner
        },
        mixins: [ localizationMixin, safeIdMixin ],
        computed: {
            banners() {
                return this.getLocalizationProp('Data.Banners', []);
            },
            size() {
                return this.getLocalizationProp('Data.SizeClasses', '-md');
            }
        }
    };
</script>
