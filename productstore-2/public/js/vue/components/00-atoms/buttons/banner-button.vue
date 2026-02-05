<template>
    <a
        ref="aButton"
        class="a-button -darkMode"
        :aria-label="ariaLabel"
        :class="disabled ? '-disabled': ''"
        :aria-disabled="disabled || null"
        :disabled="disabled"
        :href="linkUrl"
        @click="$emit('click', $event)"
    >
        {{ cta }}
        <slot />
    </a>
</template>

<script>
    export default {
        name: 'ABannerButton',
        props: {
            ariaLabel: {
                type: String,
                default: null
            },
            isAnchor: {
                type: Boolean,
                default: false
            },
            cta: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            href: {
                type: String,
                default: ''
            }
        },
        computed: {
            /**
             * Formatted href link
             *
             * If customerId is set, then function replaces href's query params to use the customerId.
             * @returns {String|null}
             */
            linkUrl() {
                let linkUrl = this.href || null;

                if(window.dataLayer && linkUrl) {
                    const customerId = window.dataLayer.find(element => element.customerID)?.customerID;

                    if(customerId) {
                        linkUrl = linkUrl.replace(/(gl=)[^&]+/, '$1' + customerId);
                    }
                }
                return linkUrl;
            }
        }
    };
</script>
