<template>
    <div class="p-rewards">
        <div v-if="isMember" class="p-rewards__header">
            <slot name="header" />
        </div>
        <a-loading-spinner
            :visible="!hasLoaded"
            size="lg"
            aria-hidden="true">
        </a-loading-spinner>
        <div v-show="hasLoaded" class="p-rewards__modules">
            <slot name="modules" @register="registerComp" />
        </div>
    </div>
</template>
<script>
    import { mapState, mapActions } from 'vuex';

    export default {
        name: 'PRewards',
        components: {},
        props: {
        },
        data() {
            return {
                giftMonths: 0
            };
        },
        computed: {
            ...mapState('lsd', ['isLsdLoaded']),
            ...mapState('shippingOnUsV2', ['souLoading']),
            ...mapState('rewards', ['welcomeGiftMonths', 'isWelcomeGiftEligible', 'isGiftLoading', 'isIntroVideoWatched']),
            isMember() {
                return this.$custInfo?.viewMemberPricing;
            },
            hasLoaded() {
                return this.isLsdLoaded && !this.souLoading && !this.isGiftLoading;
            }
        },
        watch: {
            hasLoaded(newVal) {
                // wait until the API calls are finished
                if(newVal) {
                    this.$nextTick(() => {
                        const module = new URLSearchParams(window.location.search).get('module');
                        if(module) {
                            const el = document.getElementById(`${module}`);
                            el?.scrollIntoView({behavior: 'smooth'});
                        }
                    });
                }
            }
        },
        mounted() {
            this.positionWelcomeGiftAndIntroVideo();
        },
        methods: {
            ...mapActions('rewards', ['getGiftMonths']),

            async positionWelcomeGiftAndIntroVideo() {
                await this.getGiftMonths();
                if(!this.isWelcomeGiftEligible) {
                    // user outside of welcome gift period move to the last module
                    // [or second last if introvideo is present]
                    const giftModule = this.$el.querySelector('.-welcomeGift');
                    const parent = giftModule.parentNode;
                    parent.removeChild(giftModule);
                    parent.appendChild(giftModule);
                }
                // If user has watched the intro video, move to the last module
                const introVideoModule = this.$el.querySelector('.-introVideo') || false;
                if(introVideoModule && this.isIntroVideoWatched) {
                    const parent = introVideoModule.parentNode;
                    parent.removeChild(introVideoModule);
                    parent.appendChild(introVideoModule);
                }
            }
        }
    };
</script>
