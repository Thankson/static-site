<template>
    <div class="a-iframe">
        <iframe
            v-if="showIframe"
            :id="iframeId"
            ref="iframeEL"
            :allowfullscreen="getLocalizationProp('Data.AllowFullScreen', false)"
            :class="['h-screen', getLocalizationProp('Data.Classes')]"
            frameborder="0"
            loading="lazy"
            :sandbox="sandbox"
            :src="getLocalizationProp('Data.IframeUrl')"
            :title="getLocalizationProp('Data.Title')"
            :style="{
                height: getLocalizationProp('Data.Height', '100%'),
                width: getLocalizationProp('Data.Width', '100%')
            }"
        />
    </div>
</template>

<script>

/**
 * This component renders a URL in an iframe and manages two-way communication with the iframe as required.
 */
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'AIframe',
        mixins: [ localizationMixin ],
        props: {

        },
        data() {
            return {
                iframeEL: null,
                showIframe: true,
                mutationObserver: null,
                resizeObserver: null
            };
        },
        computed: {
            iframeId() {
                return `iframe-${this._uid}__element`;
            },
            sandbox() {
                return this.getLocalizationProp('Data.Sandbox', '');
            },
            iframeHeight() {
                return this.getLocalizationProp('Data.Height', '100%');
            }
        },
        mounted() {
            this.initIframeLookup();
        },
        beforeDestroy() {
            if(this.mutationObserver) this.mutationObserver.disconnect();
            if(this.resizeObserver) this.resizeObserver.disconnect();
        },
        methods: {
            /**
             * Checks for the iframe element's existence in the DOM every 300ms
             */
            initIframeLookup() {
                let intervalId = setInterval(() => {
                    this.iframeEL = document.getElementById(this.iframeId);
                    if(this.iframeEL) {
                        this.manageIframeContent();
                        clearInterval(intervalId);
                    }
                }, 300);
            },
            attachOnLoadIFrameListener() {
                if(!this.iframeEL) return;

                this.iframeEL.addEventListener('error', () => {
                    this.manageIframeContent();
                });

                this.iframeEL.onload = () => {
                    const iframeEL = this.$refs.iframeEL;
                    const iframeLocation = iframeEL?.contentWindow?.location;

                    if(iframeEL?.contentWindow?.location?.pathname === '/account/signin') {
                        this.showIframe = false;
                        const growPath = window.location.pathname.split('/')?.[1];
                        const iframeSignInRoute = new URL(iframeLocation.href);

                        // Creates iframe sign-in URL by prefixing the grow route
                        const signInRoute = new URL(`${iframeSignInRoute.origin}/${growPath}${iframeSignInRoute.pathname}`);
                        const parentReturnUrl = window.location.origin + window.location.pathname;

                        signInRoute.searchParams.set('returnUrl', parentReturnUrl);
                        window.location.href = signInRoute.toString();
                    }
                    if(iframeEL.contentWindow && iframeEL.contentDocument) {
                        this.attachObservers(iframeEL.contentDocument);
                    }
                };
            },
            attachResizeObserver(iframeDocument) {
                this.resizeObserver = new ResizeObserver(() => {
                    this.resizeIframe(iframeDocument);
                });

                this.resizeObserver.observe(iframeDocument.body);
            },
            attachMutationObserver(iframeDocument) {
                this.mutationObserver = new MutationObserver(() => {
                    this.resizeIframe(iframeDocument);
                });

                this.mutationObserver.observe(iframeDocument.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            },
            attachObservers(iframeDocument) {
                if(!iframeDocument) return;

                this.attachResizeObserver(iframeDocument);
                this.attachMutationObserver(iframeDocument);

                // Initial resize
                this.resizeIframe(iframeDocument);
            },
            manageIframeContent() {
                this.iframeEL = document.getElementById(this.iframeId);
                this.attachOnLoadIFrameListener();
            },
            isIframeModalOverflowing() {
                // List of the pages which have a overlfowing modal in them
                const PAGES_LIST = [
                    '/BusinessCenter/LeadershipCompensation/'
                ];

                const iframeUrl = new URL(this.getLocalizationProp('Data.IframeUrl'));
                const {pathname} = iframeUrl;
                return PAGES_LIST.includes(pathname);
            },
            getModalHeight(selector) {
                const iframeEl = document.getElementById(this.iframeId);
                const modal = iframeEl?.contentDocument?.documentElement?.querySelector(selector);
                return modal ? modal?.offsetHeight : 0;
            },
            resizeIframe(iframeDocument) {
                if(!iframeDocument && !this.iframeEL) return;

                const body = iframeDocument.body;
                const html = iframeDocument.documentElement;

                let height = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.offsetHeight
                );

                if(this.isIframeModalOverflowing()) {
                    const modalHeight = this.getModalHeight('.modal[style*="display: block"]');
                    height += modalHeight;
                }

                // Buffer to prevent scrollbars
                const EXTRA_HEIGHT_BUFFER = 10;

                this.iframeEL.style.height = `${(height || this.iframeHeight) + EXTRA_HEIGHT_BUFFER}px`;
            }
        }
    };
</script>

<style></style>
