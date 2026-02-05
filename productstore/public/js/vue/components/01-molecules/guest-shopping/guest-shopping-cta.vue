<template>
    <div
        :class="mods"
        class="m-guestShoppingCta">

        <div
            class="m-guestShoppingCta__rte m-rte"
            role="text"
            v-html="becomeMemberRte" />

        <div
            v-if="becomeMemberLink && becomeMemberLink.Url"
            class="m-guestShoppingCta__button">

            <v-button
                :cta="becomeMemberLink.Text"
                :href="isEnrollment && onlineEnrollmentUrl ? onlineEnrollmentUrl : becomeMemberLink.Url"
                type="button"
                class="a-button -guestShopping"
                is-anchor />
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MGuestShoppingCta',
        props: {
            becomeMemberLink: {
                type: Object,
                default: () => ({
                    Url: '',
                    Text: ''
                })
            },
            becomeMemberRte: {
                type: String,
                default: ''
            },
            isEnrollment: {
                type: Boolean,
                default: false
            },
            mods: {
                type: String,
                default: ''
            },
            onlineEnrollmentUrl: {
                type: String,
                default: ''
            }
        }
    };
</script>
