<template>
    <div class="o-productAnnouncement">
        <div
            class="o-productAnnouncement__content"
        >
            <div
                class="o-productAnnouncement__title"
            >
                <img
                    :src="getLocalizationProp('IconInfo.IconImage')"
                    :alt="getLocalizationProp('IconInfo.AltText')"
                    class="o-productAnnouncement__icon"
                />
                <span class="o-productAnnouncement__name">
                    {{ getLocalizationProp("Title") }}
                </span>
            </div>

            <ul class="o-productAnnouncement__list">
                <li
                    v-for="item in getLocalizationProp('LinkItems')"
                    :key="item.LinkTitle"
                    class="o-productAnnouncement__item"
                >
                    <a
                        class="o-productAnnouncement__link"
                        :href="item.LinkUrl"
                    >
                        {{ item.LinkTitle }}
                        <span aria-hidden="true" class="a-arrow -sm -right -filled  ml-3">
                            <span class="a-arrow__icon border-white"></span>
                        </span>
                    </a>
                </li>
            </ul>
            <div class="o-productAnnouncement__more">
                <a class="o-productAnnouncement__link" :href="getLocalizationProp('Link.LinkUrl')">
                    {{ getLocalizationProp("Link.LinkTitle") }}
                </a>
            </div>
        </div>
    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'OProductAnnouncement',
        mixins: [localizationMixin]
    };
</script>
