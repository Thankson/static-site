<template>
    <!-- shipping on us -->
    <transition name="souFade">
        <div v-if="show" class="o-souToast" :class="{'-expandedSouToast': expanded}">

            <dialog class="o-souToast__inner">
                <button class="o-souToast__button" @click="expandToast">
                    <div class="o-souToast__heading" v-html="toastHeading"></div>
                    <span class="o-souToast__hint">{{ getLocalizationProp('Labels.Hint') }}</span>
                </button>
                <focus-trap v-model="focusTrapActive" :initial-focus="() => $refs.close.$el">
                    <div>
                        <a-close-x ref="close" class="o-souToast__close" @click="hide">
                            <span class="sr-only">{{ getLocalizationProp('Labels.Close') }}</span>
                        </a-close-x>

                        <transition-expand>
                            <div v-if="expanded" class="o-souToast__body" aria-atomic="true" aria-live="polite">
                                <div class="o-souToast__copy" v-html="toastCopy"> </div>
                                <a class="o-souToast__link" href="linkObj.Url" @click.prevent="goToLink">
                                    {{ linkObj.Text }} <a-loading-spinner class="o-souToast__spinner" :visible="waitingForResponse"></a-loading-spinner>
                                </a>
                            </div>
                        </transition-expand>
                    </div>
                </focus-trap>
            </dialog>
        </div>
    </transition>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import toastApi from '@api/routes/toast/interaction';
    import showToastApi from '@api/routes/toast/showSouToast';

    export default {
        name: 'OShippingOnUsToast',
        mixins: [localizationMixin],
        data() {
            return {
                expanded: false,
                show: false,
                focusTrapActive: false,
                waitingForResponse: false
            };
        },
        computed: {
            toastCopy() {
                return this.getLocalizationProp('Data.SubtitleRTE');
            },
            toastHeading() {
                return this.getLocalizationProp('Data.TitleRTE');
            },
            interactionPayload() {
                return {
                    'Id': this.getLocalizationProp('Data.DatasourceId')
                };
            },
            linkObj() {
                return this.getLocalizationProp('Data.DetailsLink');
            }
        },
        mounted() {
            this.getToastToShow();
        },
        methods: {
            expandToast(e) {
                this.expanded = true;
                this.focusTrapActive = true;
                this.dataLayerPush(e.target.innerText);
            },
            async hide(e) {
                this.show = false;
                this.dataLayerPush(e.target.innerText);
                const result = await this.recordInteraction();
                if(!result.data?.Success) {
                    // if it fails try one more time
                    this.recordInteraction();
                }
            },
            async goToLink(e) {
                this.waitingForResponse = true;
                await this.recordInteraction();
                window.location.href = this.linkObj.Url;
                this.dataLayerPush(e.target.innerText);
            },
            recordInteraction() {
                return toastApi.post(this.interactionPayload);
            },
            dataLayerPush(eventlabel) {
                window.dataLayer && window.dataLayer.push(
                    {
                        'event': 'Toast Clicks',
                        'eventaction': 'CTA',
                        eventlabel
                    });
            },
            getToastToShow: async function() {
                const response = await showToastApi.get();
                if(response.data.Data) {
                    this.show = true;
                }
            }

        }
    };
</script>
