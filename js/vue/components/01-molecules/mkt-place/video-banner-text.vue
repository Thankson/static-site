<template>
    <div class="m-mktVideoBannerText">
        <!-- Logo -->
        <div v-if="hasLogo" class="m-mktVideoBannerText__logo">
            <img
                :src="getLocalizationProp('Data.Logo.Url')"
                :alt="getLocalizationProp('Data.Logo.Alt')">
        </div>

        <!-- Title -->
        <div
            class="m-mktVideoBannerText__title"
            v-html="getLocalizationProp('Data.Title')"
        >
        </div>

        <!-- Description -->
        <div class="m-mktVideoBannerText__desc" v-html="getLocalizationProp('Data.Description')"></div>

        <!-- CTA -->
        <v-button
            v-if="hasCtaText && isCreditCardBanner"
            :cta="getLocalizationProp('Data.Cta.Text')"
            class="m-mktVideoBannerText__cta"
            :class="getLocalizationProp('Data.CtaTailwindClass')"
            :is-anchor="false"
            @click="update(true)" />
        <a
            v-else-if="hasCta && !isCreditCardBanner"
            :href="getLocalizationProp('Data.Cta.Url')"
            :target="getLocalizationProp('Data.Cta.Target')"
            class="m-mktVideoBannerText__cta"
            :class="getLocalizationProp('Data.CtaTailwindClass')"
        >
            {{ getLocalizationProp('Data.Cta.Text') }}
            <!-- Icon -->
            <span
                v-if="getLocalizationProp('Data.CtaShowIcon')" aria-hidden="true"
                class="m-mktVideoBannerText__icon">launch</span>
        </a>

        <!-- Small Links -->
        <div class="m-mktVideoBannerText__actions">
            <!-- Link 1 -->
            <a
                v-if="getLocalizationProp('Data.Link1.Text') && getLocalizationProp('Data.Link1.Url')"
                class="m-mktVideoBannerText__link"
                :class="getLocalizationProp('Data.Link1TailwindClass')"
                :href="getLocalizationProp('Data.Link1.Url')"
                :target="getLocalizationProp('Data.Link1.Target', '_self')"
            >
                {{ getLocalizationProp('Data.Link1.Text') }}
            </a>
            <!-- Link 2 -->
            <a
                v-if="getLocalizationProp('Data.Link2.Text') && getLocalizationProp('Data.Link2.Url')"
                class="m-mktVideoBannerText__link"
                :class="getLocalizationProp('Data.Link2TailwindClass')"
                :href="getLocalizationProp('Data.Link2.Url')"
                :target="getLocalizationProp('Data.Link2.Target', '_self')"
                :style="{color: getLocalizationProp('Data.Link2.TextColor')}"
            >
                {{ getLocalizationProp('Data.Link2.Text') }}
            </a>
        </div>
    </div>
</template>

<script>
    import { get } from 'lodash';
    import api from '@api/routes/productstore/fnbocreditcard/prefill';

    export default {
        name: 'MMktVideoBannerText',
        props: {
            localization: {
                type: Object,
                default: () => {}
            }
        },
        computed: {

            ccUrl() {
                return this.getLocalizationProp('Data.Cta.Url');
            },
            cta() {
                return this.getLocalizationProp('Data.Cta.Text');
            },
            hasCta() {
                return (this.getLocalizationProp('Data.Cta.Text') && this.getLocalizationProp('Data.Cta.Url'));
            },
            hasCtaText() {
                return this.getLocalizationProp('Data.Cta.Text');
            },
            hasLogo() {
                return this.getLocalizationProp('Data.Logo') && this.getLocalizationProp('Data.Logo.Url');
            },
            isCreditCardBanner() {
                return this.getLocalizationProp('Data.IsCreditCard');
            }
        },
        methods: {
            getCurrentUrlPath () {
                return window.location.pathname;
            },
            getLocalizationProp(path, fallback = '') {
                return get(this.localization, path, fallback);
            },
            goToPage(url) {
                // Note for FNBO page redirects back to Melaleuca after user submits application
                if(url) {
                    window.open(url, '_blank');
                } else {
                    window.open(this.ccUrl, '_blank');
                }
            },

            preparePayload() {
                let payload = {};
                let url = new URL(window.location.href);
                const backToPath = url.searchParams.get('backTo');
                const addedParam = '?IsFnboReturn=true';

                // If user is coming from another page after clicking Apply Now, use the backTo parameter, otherwise use current path
                if(backToPath) {
                    payload = {
                        returnRelativePath: backToPath + addedParam
                    };
                } else {
                    payload = {
                        returnRelativePath: this.getCurrentUrlPath() + addedParam
                    };
                }

                return payload;
            },
            async update(val) {
                const selection = val;
                this.fnboPayload = this.preparePayload();

                // ApplyNow to FNBO
                const response = await api.post(this.fnboPayload);

                if(selection) {
                    if(response.Success || response.data.Success) {
                        const url = response.data.Data.applicationUrl;
                        this.goToPage(url);
                    } else {
                        console.warn(`HTTP error! status: ${response.status}`);
                    }
                } else {
                    // the user has closed the modal and rejected applying for card
                }
            }
        }
    };
</script>
