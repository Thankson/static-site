<template>
    <div class="a-iconTextBadge">
        <img v-if="badgeImage && badgeImage.Url" class="a-iconTextBadge__badge" :src="badgeImage.Url" :alt="badgeImage.Alt">
        <span v-else-if="iconText" class="a-iconTextBadge__icon material-icons text-white">
            {{ iconText }}
        </span>
        <span class="a-iconTextBadge__text">
            {{ badgeText }}
        </span>
    </div>
</template>

<script>
    export default {
        name: 'AIconTextBadge',
        props: {
            badgeText: {
                type: String,
                default: ''
            },
            badgeImage: {
                type: Object,
                default: () => ({
                    'Url': '',
                    'Alt': ''
                })
            },
            iconText: {
                type: String,
                default: ''
            }

        }
    };
</script>
