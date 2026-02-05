<template>
    <div class="m-shareTo">
        <m-popup>
            <template #trigger>
                <button class="m-shareTo__icon">
                    <span class="material-icons" :aria-label="getLocalizationProp('Labels.AriaLabels.ShareTo', 'Share to')">share</span>
                </button>
            </template>
            <template #panel>
                <div class="m-shareTo__panel">
                    <div class="m-shareTo__label">{{ getLocalizationProp('Labels.Share') }}</div>
                    <div class="m-shareTo__content">
                        <div class="m-shareTo__copyBtn">
                            <input class="m-shareTo__input" readonly :value="shareToLink" />
                            <button class="m-shareTo__btn" @click="copyShareLink">
                                {{ getLocalizationProp('Labels.Copy') }}
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </m-popup>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'MShareTo',
        mixins: [localizationMixin],
        data() {
            return {
            };
        },
        computed: {
            shareToLink() {
                return window.location.href;
            }
        },
        methods: {
            async copyShareLink() {
                try {
                    const shareLink = this.shareToLink;
                    await navigator.clipboard.writeText(shareLink);
                    this.$message({
                        type: 'success',
                        message: this.getLocalizationProp('Labels.CopiedToast')
                    });

                    // GA
                    window.dataLayer && window.dataLayer.push({
                        'event': 'user_event',
                        'eC': 'LIA Article Forward',
                        'eA': 'Forward',
                        'eL': window.location.pathname.replace(/.*\//, '')
                    });
                } catch (error) {
                    this.$message({
                        type: 'error',
                        message: error.message
                    });
                }
            }
        }
    };
</script>
