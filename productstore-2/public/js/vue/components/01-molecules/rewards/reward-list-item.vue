<template>
    <component
        :is="rootElement"
        class="m-rewardListItem">

        <div v-if="iconUrl" class="m-rewardListItem__icon">
            <img
                v-if="!$slots.icon"
                :alt="iconAlt"
                :src="iconUrl"
            />

            <slot name="icon" />
        </div>

        <div class="m-rewardListItem__main" :class="modClass">
            <div class="m-rewardListItem__content" :class="modClass">
                <p
                    v-if="label && !$slots.default"
                    class="m-rewardListItem__label"
                    v-html="label"
                />

                <slot />
            </div>

            <div v-if="!hideMoreCta" class="m-rewardListItem__cta">
                <component
                    :is="ctaLink ? 'a' : 'button'"
                    v-if="!$slots.cta && ctaLabel && !showMonthStatus"
                    class="m-rewardListItem__btn"
                    :class="!ctaLink ? '-noBorder' : ctaMods"
                    :type="!ctaLink ? 'button' : null"
                    :href="ctaLink || null"
                    @click="onClick"
                    v-html="ctaLabel"
                />

                <slot name="cta" />
            </div>
            <!-- Currently this section is only for New Free Products  -->
            <!-- For month status, each value has a different meaning null (non-award section item): -1 [Not completed, can start], 0 [Complete], 1 [Not Completed (and not availabe)], 2 [Not Started] -->
            <!-- Checkmark equals completed. Dash means not completed and unavailable -->
            <!-- No mark shown if not completed and available to start (MonthStatus === -1) -->
            <div v-if="showMonthStatus && monthStatus === 0" class="m-rewardListItem__monthStatus">
                check
            </div>
            <div v-else-if="showMonthStatus && monthStatus === 1" class="m-rewardListItem__monthStatus">
                minimize
            </div>
        </div>
    </component>
</template>

<script>
    export default {
        name: 'MRewardListItem',
        props: {
            ctaLink: {
                type: String,
                default: null
            },
            ctaLabel: {
                type: String,
                default: 'MORE'
            },
            ctaMods: {
                type: String,
                default: '-white'
            },
            hideMoreCta: {
                type: Boolean,
                default: false
            },
            iconAlt: {
                type: String,
                default: ''
            },
            iconUrl: {
                type: String,
                default: ''
            },
            label: {
                type: String,
                default: ''
            },
            modClass: {
                type: String,
                default: '-quarterlyRewards'
            },
            monthStatus: {
                type: Number,
                default: null
            },
            rootElement: {
                type: String,
                default: 'div'
            },
            showMonthStatus: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            onClick() {
                if(!this.ctaLink) {
                    this.$emit('click');
                }
            }
        }
    };
</script>
