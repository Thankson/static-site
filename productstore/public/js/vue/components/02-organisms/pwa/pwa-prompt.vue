<template>
    <div>
        <div v-show="showIosPrompt" role="alert" aria-modal="true" class="o-pwaPrompt--ios">
            <div :style="scrollTop" class="o-pwaPrompt__container">
                <div ref="prompt" class="o-pwaPrompt__modal">
                    <button :aria-label="getLocalizationProp('Labels.Close')" class="o-pwaPrompt__close" @click="closePrompt"><span class="text-sm text-gray-95 material-icons" aria-hidden="true">clear</span></button>
                    <p v-html="getLocalizationProp('Labels.IosDetails')">
                    </p>
                    <div class="o-pwaPrompt__caret">
                        <span class="-white material-icons" aria-hidden="true">arrow_drop_down</span>
                        <span class="-white material-icons -shadow" aria-hidden="true">arrow_drop_down</span></div>
                </div>
            </div>
        </div>

        <section v-show="showAndroidPrompt" class="o-pwaPrompt--android">
            <div class="o-pwaPrompt__wrapper">
                <div class="o-pwaPrompt__image">
                    <img src="https://cdnsc1.melaleuca.com/na/images/common/phone.png" alt="phone" />
                </div>
                <div class="o-pwaPrompt__content">
                    <p v-html="getLocalizationProp('Labels.AndroidDetails')"></p>
                </div>
            </div>
            <div class="o-pwaPrompt__actions">
                <a class="o-pwaPrompt__link" :href="getLocalizationProp('Data.GetInstructions.Url')">{{ getLocalizationProp('Data.GetInstructions.Text') }}</a>
            </div>
        </section>
    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'PwaPrompt',
        mixins: [ localizationMixin ],
        props: {
            scriptId: {
                type: String,
                default: 'data-localization'
            }
        },
        data() {
            return {
                showIosPrompt: false,
                showAndroidPrompt: false,
                deferredPrompt: null,
                isAppInstalled: false
            };
        },
        computed: {
            scrollTop() {
                const fixedPosition = (window.innerHeight - 160) + 'px';
                return { top: fixedPosition };
            },
            isInStandaloneMode() {
                return ('standalone' in window.navigator) && (window.navigator.standalone);
            }
        },
        watch: {
            isAppInstalled() {
                if(this.isAppInstalled) {
                    window.addEventListener('appinstalled', () => {
                        // Hide the app-provided install promotion
                        this.showIosPrompt = false;
                        this.showAndroidPrompt = false;
                        // Clear the deferredPrompt so it can be garbage collected
                        this.deferredPrompt = null;
                        // Optionally, send analytics event to indicate successful install
                        console.log('PWA was installed');
                    });
                }
            }
        },
        mounted() {
            console.log('Mounted PWA Banner');
            // since safari doesn't support beforeinstallprompt need to just detect if is pwa mode
            this.displayIosPrompt();
            // Initialize deferredPrompt for use later to show browser install prompt.
            window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent the mini-infobar from appearing on mobile
                e.preventDefault();
                // Stash the event so it can be triggered later.
                this.deferredPrompt = e;
                // Update UI notify the user they can install the PWA
                this.displayAndroidPrompt();
                // Optionally, send analytics event that PWA install promo was shown.
                console.log(`'beforeinstallprompt' event was fired.`, this.deferredPrompt);
            });
        },
        methods: {
            displayIosPrompt() {
                // Detects if device is on iOS
                const isIos = () => {
                    const userAgent = window.navigator.userAgent.toLowerCase();
                    return /iphone|ipad|ipod/.test(userAgent);
                };

                if(isIos() && !this.isInStandaloneMode) {
                    this.showIosPrompt = true;
                }
            },
            async displayAndroidPrompt() {
                const isAndroid = () => {
                    const userAgent = window.navigator.userAgent.toLowerCase();
                    return /android/.test(userAgent);
                };

                if(isAndroid() && !this.isInStandaloneMode) {
                    this.showAndroidPrompt = true;
                }
            },
            closePrompt() {
                this.showIosPrompt = false;
            }
        }
    };
</script>
