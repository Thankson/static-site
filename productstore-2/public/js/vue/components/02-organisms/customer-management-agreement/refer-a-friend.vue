<template>
    <div class="o-referAFriend">
        <p class="mb-20">{{ getLocalizationProp("Labels.LearnWhy") }}</p>
        <div
            class="o-referAFriend__videoWrapper"
            :style="{
                backgroundImage: `url(${videoData.ThumbnailImageUrl})`
            }"
        >
            <button
                v-if="isVideoCompleted && !isVideoReplayed"
                class="o-referAFriend__rewatchButton"
                @click="replayVideo()"
            >
                <span
                    class="material-icons md-light text-lg pt-2"
                    aria-hidden="true"
                >replay</span
                >
                <span>{{ getLocalizationProp("Labels.RewatchVideo") }}</span>
            </button>
            <button
                v-if="!showVideo && !showBecomeMemberButtonOnTop"
                class="o-referAFriend__playButton"
                @click="callPlayerInline"
            >
                play_circle_outline
            </button>
            <v-button
                v-if="showBecomeMemberButtonOnTop && !isVideoReplayed"
                :is-anchor="true"
                class="o-referAFriend__becomeMemberButton"
                :href="getLocalizationProp('Data.CmaFormUrl')"
                :type="null"
            >
                {{ getLocalizationProp("Labels.BecomeAMember") }}
            </v-button>
            <m-vid-player
                v-if="showVideo"
                :id="videoData.MediaId"
                ref="videoPlayer"
                :is-refer-a-friend-video="true"
                :prevent-seek="!isVideoCompleted"
                :video-data="videoData"
                :video-item-id="videoData.MediaId"
                @videoWatched="handleVideoCompleted"
            />
        </div>
        <v-button
            v-if="isVideoCompleted && isVideoReplayed"
            :is-anchor="true"
            class="px-36 mt-40 py-16 text-xl-2"
            :href="getLocalizationProp('Data.CmaFormUrl')"
            :type="null"
        >
            {{ getLocalizationProp("Labels.BecomeAMember") }}
        </v-button>
    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/customer/recordVideoWatched';

    export default {
        name: 'OReferAFriend',
        mixins: [localizationMixin],
        data() {
            return {
                isVideoCompleted: false,
                isVideoReplayed: false,
                showBecomeMemberButtonOnTop: false,
                showVideo: false
            };
        },
        computed: {
            invitationCode() {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get('id') || '';
            },
            videoData() {
                return this.localization?.Data?.Video?.VirtualVideo || {};
            }
        },
        methods: {
            async registerVideoAsWatched(val) {
                api.setRoute('api/customer/recordVideoWatched/');
                console.log('registerVideoAsWatched api', api);

                if(val && this.invitationCode) {
                    try {
                        const response = await api.post({invitationCode: this.invitationCode});
                        if(!response?.success || !response?.data?.Success) {
                            console.error('Error in registering video as watched');
                        }
                    } catch (error) {
                        console.error('Failed to register video as watched:', error);
                    }
                } else if(!this.invitationCode) {
                    console.error('No invitation code id found in URL');
                }
            },
            callPlayerInline() {
                this.showVideo = true;
                // Call melaPlayer
                this.$nextTick(() => {
                    if(this.$refs.videoPlayer) this.$refs.videoPlayer.callPlayer();
                });
            },
            handleVideoCompleted(val) {
                if(!this.isVideoCompleted) {
                    this.registerVideoAsWatched(val);
                    this.isVideoCompleted = true;
                }
                this.showVideo = false;
                this.isVideoReplayed = false;
                this.showBecomeMemberButtonOnTop = true;
            },
            replayVideo() {
                this.isVideoReplayed = true;
                this.callPlayerInline();
            }
        }
    };
</script>
