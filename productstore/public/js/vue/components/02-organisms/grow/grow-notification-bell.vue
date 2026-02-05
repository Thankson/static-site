<template>
    <button
        type="button"
        class="o-growNotificationBell relative inline-block border-none bg-transparent cursor-pointer p-0"
        :aria-label="ariaLabel"
        @click="handleClick"
    >
        <slot>
            <img
                class="max-w-30 block"
                :src="iconUrl"
                :alt="iconAlt"
            />
        </slot>
        <span
            v-if="hasUnreadNotifications"
            class="o-growNotificationBell__indicator"
        >
            <span class="sr-only">{{ unreadScreenReaderText }}</span>
        </span>
    </button>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OGrowNotificationBell',
        mixins: [localizationMixin],
        data() {
            return {
                hasUnreadNotifications: false
            };
        },
        computed: {
            iconUrl() {
                return this.getLocalizationProp('Data.Image.Url');
            },
            iconAlt() {
                return this.getLocalizationProp('Data.Image.Alt');
            },
            ariaLabel() {
                return this.getLocalizationProp('Labels.AriaLabel');
            },
            unreadScreenReaderText() {
                return this.getLocalizationProp('Labels.UnreadScreenReader');
            }
        },
        mounted() {
            this.checkUnreadState();
        },
        methods: {
            checkUnreadState() {
                if(window.Grow && typeof window.Grow.hasUnreadNotifications === 'function') {
                    this.hasUnreadNotifications = window.Grow.hasUnreadNotifications();
                }
            },
            handleClick() {
                if(window.Grow && typeof window.Grow.toggleNotificationCenter === 'function') {
                    window.Grow.toggleNotificationCenter();
                }
            }
        }
    };
</script>
