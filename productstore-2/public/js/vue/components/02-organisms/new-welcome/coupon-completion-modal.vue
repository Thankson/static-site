<template>
    <div class="o-couponCompletionModal" :class="modClass">
        <div class="o-couponCompletionModal__wrapper">
            <!-- Text Badge -->
            <div class="o-couponCompletionModal__badge">
                <a-icon-text-badge
                    :badge-text="badgeText"
                    icon-text="check"
                ></a-icon-text-badge>
            </div>

            <div class="o-couponCompletionModal__content">
                <!-- Title -->
                <h2
                    class="o-couponCompletionModal__heading"
                    v-html="titleText"
                ></h2>

                <!-- Description -->
                <p
                    class="o-couponCompletionModal__desc"
                    v-html="descriptionText"
                />

                <!-- Loading -->
                <div v-if="isLoadingWatchedApi" style="width: fit-content">
                    <a-loading-spinner :visible="true" />
                </div>

                <!-- CTA Button -->
                <button
                    v-else
                    v-modal-hide
                    class="o-couponCompletionModal__footer a-button -white"
                    @click="navigateToCouponPage"
                >
                    {{ buttonText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import AIconTextBadge from '../../00-atoms/icon-text-badge/icon-text-badge.vue';
    import { mapState } from 'vuex';

    export default {
        name: 'OCouponCompletionModal',

        components: {
            AIconTextBadge
        },

        props: {
            isVisible: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default: () => {}
            },
            modClass: {
                type: String,
                default: ''
            },
            videoData: {
                type: Object,
                default: () => {}
            }
        },

        computed: {
            ...mapState('lteVideos', ['isLoadingWatchedApi']),

            couponPageUrl() {
                return this.localization?.CompletionMessage?.Url;
            },
            badgeText() {
                return this.localization?.CompletionMessage?.BadgeText;
            },
            buttonText() {
                return this.localization?.CompletionMessage?.ButtonText;
            },

            descriptionText() {
                return this.replaceToken(
                    this.localization?.CompletionMessage?.Description,
                    this.videoData?.ProductName
                );
            },

            titleText() {
                const title = this.localization?.CompletionMessage?.Title;
                const productName = this.localization?.CompletionMessage
                    ?.ProductName;
                return title?.replace('{0}', productName);
            }
        },

        methods: {
            clickHandler() {
                this.$emit('continue');
                this.$modal.hide();
            },

            navigateToCouponPage() {
                window.location.href = this.couponPageUrl;
            },

            replaceToken
        }
    };
</script>
