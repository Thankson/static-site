<template>
    <div class="m-backToTop">
        <button
            v-show="showBackToTop"
            ref="backToTopButton"
            class="m-backToTop__button"
            :aria-label="getLocalizationProp('Labels.AriaLabels.BackToTop', 'Back to top')"
            @click="setDocumentScrollTop"
        >
            <span class="m-backToTop__icon material-icons" aria-hidden="true">vertical_align_top</span>
        </button>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'MBackToTop',
        mixins: [localizationMixin],
        data() {
            return {
                showBackToTop: false
            };
        },
        mounted () {
            window.onscroll = () => {
                if(this.getDocumentScrollTop() > (this.getViewportHeight() / 3)) {
                    this.showBackToTop = true;
                } else {
                    this.showBackToTop = false;
                }
            };
        },
        methods: {
            getDocumentScrollTop() {
                if(document.compatMode === 'BackCompat') {
                    return document.body.scrollTop;
                } else {
                    return document.documentElement.scrollTop;
                }
            },
            setDocumentScrollTop(value = 0) {
                if(document.compatMode === 'BackCompat') {
                    document.body.scrollTop = value;
                } else {
                    document.documentElement.scrollTop = value;
                }
            },
            getViewportHeight() {
                if(document.compatMode === 'BackCompat') {
                    return document.body.clientHeight;
                } else {
                    return document.documentElement.clientHeight;
                }
            }
        }
    };
</script>
