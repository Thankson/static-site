<template>
    <a-badge
        v-if="badge"
        :aria-label="badge.AriaLabel"
        :background-color="badge.BackgroundColor"
        :badge-position="badge.BadgePosition"
        :tailwind-classes="badge.TailwindClasses"
        :text-color="badge.TextColor"
        :title="badge.Title"
        :is-grow-premium-popup="badge.IsGrowPremiumPopup"
    >
        <component
            :is="renderTag"
            v-bind="renderTag === 'a' ? { href: url } : {}"
            class="m-searchResultItem"
        >
            <img
                v-if="image"
                :src="image"
                :alt="alt"
                class="m-searchResultItem__img"
            />
            <div class="m-searchResultItem__content">
                <h3 class="m-searchResultItem__title">{{ title }}</h3>
                <p class="m-searchResultItem__description">{{ description }}</p>
            </div>
        </component>
    </a-badge>
    <component
        :is="renderTag"
        v-else
        v-bind="renderTag === 'a' ? { href: url } : {}"
        class="m-searchResultItem"
    >
        <img
            v-if="image"
            :src="image"
            :alt="alt"
            class="m-searchResultItem__img"
        />
        <div class="m-searchResultItem__content">
            <h3 class="m-searchResultItem__title">{{ title }}</h3>
            <p class="m-searchResultItem__description">{{ description }}</p>
        </div>
    </component>
</template>

<script>
    export default {
        name: 'MSearchResultItemWithImage',
        props: {
            alt: {
                type: String,
                default: ''
            },
            badge: {
                type: Object,
                default: () => null
            },
            description: {
                type: String,
                default: ''
            },
            image: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            },
            url: {
                type: String,
                default: ''
            }
        },
        computed: {
            renderTag() {
                return this.url ? 'a' : 'div';
            }
        }
    };
</script>
