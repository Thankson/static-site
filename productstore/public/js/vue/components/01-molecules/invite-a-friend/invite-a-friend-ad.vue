<template>
    <div
        class="o-inviteFriendAd"
        :class="{
            '-onlyRte': !productImage && !backgroundImage && !backgroundColor,
            '-border': borderColor,
            '-backgroundImage': backgroundImage,
            'px-20 pt-20 min-h-120': backgroundColor && !productImage
        }"
        :style="{
            borderColor: borderColor,
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : '',
            backgroundColor: backgroundColor
        }"
    >
        <div class="o-inviteFriendAd__column">
            <span class="o-inviteFriendAd__column__header" v-html="titleRte"></span>
            <span class="o-inviteFriendAd__column__content" v-html="descriptionRte"></span>
        </div>
        <img v-if="productImage" class="o-inviteFriendAd__productImage" :src="productImage" :alt="productImageAlt">
    </div>
</template>

<script>
    export default {
        name: 'MInviteAFriendAd',
        props: {
            borderColor: {
                type: String,
                default: ''
            },
            backgroundColor: {
                type: String,
                default: ''
            },
            backgroundImage: {
                type: String,
                default: ''
            },
            descriptionRte: {
                type: String,
                default: ''
            },
            productImageAlt: {
                type: String,
                default: ''
            },
            productImage: {
                type: String,
                default: ''
            },
            titleRte: {
                type: String,
                default: ''
            }
        }
    };
</script>
