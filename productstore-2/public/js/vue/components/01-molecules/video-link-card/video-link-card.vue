<template>
    <div class="m-vidLinkCard">
        <div class="m-vidLinkCard__wrapper">

            <!-- CTA -->
            <a
                ref="callFlowBtn"
                class="m-vidLinkCard__cta"
                :data-index="dataIndex"
                :tabindex="tabIndex"
                :aria-hidden="ariaHidden"
                :href="link"
            >
                <slot name="cta">
                    <div class="m-vidLinkCard__row -header" :data-index="dataIndex">
                        <div class="m-vidLinkCard__header">
                            <div class="m-vidLinkCard__tags">

                                <!-- LSD amount -->
                                <div
                                    v-if="(!isWatched || hasReset) && amountValueComp > 0"
                                    class="m-vidLinkCard__amount">
                                    <span class="sr-only">
                                        {{ amountFormattedComp }} {{ checkLocalization('LoyaltyShoppingDollars') }}
                                    </span>
                                    <span aria-hidden="true">{{ amountFormattedComp }}</span>
                                </div>

                                <!-- Video Status: New/Watched -->
                                <div v-if="setVideoStatus" class="m-vidLinkCard__status">
                                    <span class="sr-only">{{ setVideoStatus }} {{ checkLocalization('Video') }}</span>
                                    <span aria-hidden="true">{{ setVideoStatus }}</span>
                                </div>

                                <!-- Play time -->
                                <span v-if="setPlayTime" class="sr-only">
                                    {{ checkLocalization('PlayTime') }} : {{ getPlayTimeResult(setPlayTime) }}
                                </span>
                                <div v-if="setPlayTime" class="a-runTime -play" aria-hidden="true">
                                    <span class="a-runTime__num">{{ getPlayTimeResult(setPlayTime) }}</span>
                                </div>
                                <span class="sr-only">{{ checkLocalization('ClickToWatch') }}</span>
                            </div>

                            <!-- Image -->
                            <div class="m-vidLinkCard__media">
                                <img
                                    v-if="videoData && videoData.ThumbnailImageUrl"
                                    :src="videoData.ThumbnailImageUrl"
                                    :alt="videoData.Title + '-' + checkLocalization('ClickToWatch')"
                                    class="m-vidLinkCard__img"
                                >
                                <img
                                    v-else
                                    :src="thumbImgDefault"
                                    alt=""
                                    class="m-vidLinkCard__img"
                                >
                            </div>

                        </div>
                    </div>
                </slot>
                <slot name="extra-content">
                    <div class="m-vidLinkCard__row -body">
                        <div v-if="title" class="m-vidLinkCard__title">
                            {{ title }}
                        </div>
                        <div v-if="desc" class="m-vidLinkCard__desc" v-html="desc"></div>
                    </div>
                </slot>
            </a>
        </div>
    </div>
</template>

<script>
    import videoModal from '../../../mixins/video-modal';

    export default {
        name: 'MVidlinkCard',

        mixins: [ videoModal ],

        props: {
            link: {
                type: String,
                default: ''
            },
            thumbImgDefault: {
                type: String,
                default: 'https://cdnsc1.melaleuca.com/na/images/product-store/Image-Coming-Soon-Placeholder.jpg'
            }
        }
    };
</script>
