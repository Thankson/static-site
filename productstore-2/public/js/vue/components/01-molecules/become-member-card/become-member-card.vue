<template>
    <article class="m-becomeMemberCard" :class="mods">
        <h3 v-if="becomeMember.Title" class="m-becomeMemberCard__title" v-html="becomeMember.Title"></h3>
        <p v-if="becomeMember.Text" class="m-becomeMemberCard__text" v-html="becomeMember.Text"></p>
        <a
            v-if="linkData"
            class="a-button m-becomeMemberCard__link"
            :href="linkData.Url"
            :target="linkData.Target"
        >
            {{ linkData.Text }}
        </a>
    </article>
</template>
<script>
    export default {
        name: 'MBecomeMemberCard',
        props: {
            becomeMember: {
                type: Object,
                default: () => ({})
            },
            mods: {
                type: String,
                default: ''
            },
            onlineEnrollment: {
                type: Object,
                default: () => ({})
            },
            userFlags: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                linkData: {}
            };
        },
        mounted() {
            if(this.userFlags && this.userFlags.IsGuest && this.userFlags.IsGuestShoppingEnabled) {
                this.linkData = this.onlineEnrollment;
            } else {
                this.linkData = this.becomeMember.Link;
            }
        }
    };
</script>
