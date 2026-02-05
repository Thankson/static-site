<template>
    <modal-content id="id" width="370px">
        <template v-slot:content>
            <div class="m-rte pb-30" v-html="getLocalizationProp('Data.VisaModal.RteDescription')"></div>
            <!-- CTA -->
            <v-button
                :cta="getLocalizationProp('Labels.ApplyNow')"
                :is-anchor="false"
                @click="goToPage()" />
            <a
                :target="getLocalizationProp('Data.VisaModal.ApplyNowTarget')"
                :href="getLocalizationProp('Data.VisaModal.ApplyNowLink')"
                class="a-button font-medium inline-block px-25 py-12 text-base text-center w-auto"
            >
                {{ getLocalizationProp('Labels.ApplyNow') }}
            </a>
        </template>
    </modal-content>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OVisaModal',
        mixins: [ localizationMixin ],
        computed: {
            ccUrl() {
                return this.getLocalizationProp('Data.VisaModal.ApplyNowLink');
            }
        },
        methods: {
            getBackTo () {
                return window.location.pathname;
            },
            goToPage() {
                const backTo = this.getBackTo();
                const redirectUrl = this.ccUrl + '?backTo=' + backTo;
                window.open(redirectUrl);
            }
        }
    };
</script>
