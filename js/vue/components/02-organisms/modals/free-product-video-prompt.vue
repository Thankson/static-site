<template>
    <modal
        heading-class="text-sm text-gray-150 mb-25"
        width="370px">

        <template #heading>
            {{ titleLabel }}
        </template>

        <template #footer>
            <v-button
                class="px-18 py-10"
                data-index="VideoModalPrompt"
                @click="showVideoModal">

                {{ watchVideoLabel }}
            </v-button>
        </template>
    </modal>
</template>

<script>
    import { mapActions } from 'vuex';

    export default {
        name: 'OFreeProductVideoPrompt',
        props: {
            titleLabel: {
                type: String,
                default: 'Please watch the video to access the free products.'
            },
            watchVideoLabel: {
                type: String,
                default: 'Watch Video'
            }
        },
        methods: {
            ...mapActions('welcome', ['showVideoModal']),

            show() {
                this.$modal.show();
            }
        }
    };
</script>
