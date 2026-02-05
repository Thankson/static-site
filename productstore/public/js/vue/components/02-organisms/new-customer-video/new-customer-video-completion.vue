<template>
    <div class="o-ncvCompletion">
        <div class="o-ncvCompletion__wrapper">
            <div v-if="completeModal.Image" class="o-ncvCompletion__media">
                <img
                    :src="completeModal.Image.Url"
                    :alt="completeModal.Image.Alt"
                    class="o-ncvCompletion__img"
                >
            </div>
            <h2 v-if="completeModal.Title" class="o-ncvCompletion__title">{{ completeModal.Title }}</h2>
            <p class="o-ncvCompletion__desc" v-html="completeModal.Description"></p>

            <div class="o-ncvCompletion__footer">
                <a
                    class="o-ncvCompletion__cta -loadMore"
                    :href="completeModal.LearnMorePage.Url">
                    <span>{{ completeModal.LearnMorePage.Text }}</span>
                </a>

                <!-- Replay -->
                <button
                    class="o-ncvCompletion__cta -replay"
                    @click="replayVideo()">
                    <span class="o-ncvCompletion__icon -replay" aria-hidden="true">replay</span>
                    <span>{{ completeCta.ReplayVideo }}</span>
                </button>

            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ONewCustomerVideoCompletion',
        props: {
            completeModal: {
                type: Object,
                default () {
                    return {};
                }
            },
            completeCta: {
                type: Object,
                default () {
                    return {};
                }
            }
        },
        data() {
            return {
                hideVideo: true
            };
        },
        computed: {
        },
        mounted() {
        },
        methods: {
            replayVideo() {
                this.$emit('replayVideo');
            }
        }
    };
</script>
