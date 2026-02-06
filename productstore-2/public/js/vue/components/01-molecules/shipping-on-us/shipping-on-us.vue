<template>
    <div class="m-shippingOnUs">
        <div v-show="souLoading">
            <a-loading-spinner :visible="true" />
        </div>
        <div v-if="!souLoading && rte && Object.keys(souData).length !== 0" class="m-shippingOnUs__wrapper" :class="wrapperMods">
            <div class="inline leading-tight text-sm text-gray-150" v-html="rte"></div>
            <m-read-more
                v-if="extraDetails"
                :less-label="lessLabel"
                :more-label="moreLabel"
                :comp-class-mods="compOverideStyles"
                more-class-mods="underline uppercase font-bold text-green text-sm"
                less-class-mods="underline uppercase font-bold text-green text-sm block mt-18 mb-5"
            >
                <template v-slot:description>
                    <div class="inline leading-tight text-sm text-gray-150" v-html="extraDetails">
                    </div>
                    <a
                        v-if="souData.ShippingOnUsLink && souData.ShippingOnUsLink.Url"
                        class="m-shippingOnUs__link"
                        :href="souData.ShippingOnUsLink.Url">
                        {{ souData.ShippingOnUsLink.Text }}
                    </a>
                </template>
            </m-read-more>

            <slot />
        </div>
    </div>
</template>
<script>
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: 'MShippingOnUs',
        props: {
            lessLabel: {
                type: String,
                default: 'Less'
            },
            moreLabel: {
                type: String,
                default: 'More'
            },
            shippingConfigId: {
                type: String,
                default: null
            },
            rewardConfigId: {
                type: String,
                default: null
            },
            wrapperMods: {
                type: String,
                default: null
            }
        },
        computed: {
            ...mapState('shippingOnUsV2', ['activeMilestone', 'souData', 'souLoading']),
            extraDetails() {
                return this.isReward ? this.activeMilestone?.VIPMoreDetails : this.souData?.SUOMoreDetails;
            },
            isReward() {
                return Boolean(this.rewardConfigId);
            },
            compOverideStyles() {
                return this.isReward ? 'mt-10' : 'text-sm';
            },
            rte() {
                return this.isReward ? this.activeMilestone?.VIPDetails : this.souData?.SUODetails;
            }
        },
        created() {
            if(this.shippingConfigId) {
                this.SET_SHIPPING_CONFIG_ID(this.shippingConfigId);
            } else {
                this.SET_REWARD_CONFIG_ID(this.rewardConfigId);
            }
        },
        methods: {
            ...mapMutations('shippingOnUsV2', ['SET_SHIPPING_CONFIG_ID', 'SET_REWARD_CONFIG_ID'])
        }
    };
</script>
