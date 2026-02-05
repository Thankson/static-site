<template>
    <div class="m-detailHeader">
        <div class="m-detailHeader__left">
            <span class="m-detailHeader__info -date">
                <span class="material-icons" aria-hidden="true">
                    schedule
                </span>
                <span>{{ getLocalizationProp('Data.ArticleReleaseDate') }}</span>
            </span>
        </div>

        <div v-if="showFontsizeChanger" class="m-detailHeader__right">
            <button class="m-detailHeader__font -plus material-icons" :disabled="isChanging" aria-hidden="true" @click="changeFontSize('increase')">
                text_increase
            </button>
            <button class="m-detailHeader__font -minus material-icons" :disabled="isChanging" aria-hidden="true" @click="changeFontSize('decrease')">
                text_decrease
            </button>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MArticleDetailHeader',
        mixins: [localizationMixin],
        props: {
            minFontSize: {
                type: Number,
                default: 0
            },
            changeStep: {
                type: Number,
                default: 4
            }
        },
        data() {
            return {
                showFontsizeChanger: false,
                isChanging: false
            };
        },
        computed: {
            articleWrapEl() {
                return document.querySelector('.o-articleContent');
            }
        },
        mounted () {
            this.setShowFontsizeChanger();
        },
        methods: {
            setShowFontsizeChanger() {
                if(!this.articleWrapEl) return;
                const allEls = this.articleWrapEl.querySelectorAll('*');
                for (let i = 0, len = allEls.length; i < len; i++) {
                    const currentEl = allEls[i];
                    if(currentEl.textContent) {
                        this.showFontsizeChanger = true;
                        return;
                    }
                }
            },
            changeFontSize(action = 'increase') {
                if(this.isChanging) {
                    return;
                }
                if(!this.articleWrapEl) return;

                this.isChanging = true;
                const allEls = this.articleWrapEl.querySelectorAll('*');
                for (let i = 0, len = allEls.length; i < len; i++) {
                    const currentEl = allEls[i];
                    if(currentEl.textContent) {
                        const currentFontSize = window.getComputedStyle(currentEl).getPropertyValue('font-size');
                        const currentFontSizeNum = parseInt(currentFontSize.replace('px', ''));
                        let s = currentFontSize ? currentFontSizeNum : 16;
                        if(action === 'increase') {
                            s += this.changeStep;
                        } else if(action === 'decrease') {
                            s -= this.changeStep;

                            // if any element font-size less or equal zero, do not decrease
                            if(s <= this.minFontSize) {
                                this.isChanging = false;
                                return;
                            }
                        }
                        currentEl.fontSizeStore = s + 'px';
                    }
                }
                // update
                for (let i = 0, len = allEls.length; i < len; i++) {
                    const currentEl = allEls[i];
                    if(currentEl.fontSizeStore) {
                        currentEl.style.fontSize = currentEl.fontSizeStore;
                    }
                }
                this.isChanging = false;
            }
        }
    };
</script>
