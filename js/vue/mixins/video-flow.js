// video-flow-mixin.js
import { mapActions } from 'vuex';
export default {
    data() {
        return {
            isVideoLoaded: false,
            isVideoWatched: false,
            shouldShowLoading: true,
            allowVideoPlay: true
        };
    },

    methods: {
        ...mapActions('lteVideos', ['updateNonL2eVideos']),

        callPlayer() {
            // Call melaPlayer
            this.$nextTick(() => {
                if(this.$refs.couponVideoPlayer) this.$refs.couponVideoPlayer.callPlayer();
            });
        },

        handleContinue() {
            this.closeModal();
        },

        handleVideoCompleted(payload) {
            if(payload && this.isVideoLoaded) {
                this.isVideoWatched = true;
                this.$emit('videoWatched', true);
                this.showModalCompletion();
                this.updateNonL2eVideos({ vItemId: this.id, vId: this.videoData.MediaId });
                this.allowVideoPlay = false;
            }
        },

        setVideoLoaded() {
            this.isVideoLoaded = true;
        },

        setVideoUnloaded() {
            this.isVideoLoaded = false;
        },

        showModalCompletion() {
            const showCompletion = () => {
                this.modalSize('default');
                this.showComponent('showCompletion');
                window.vueMelaPlayer.Player.stop();

                // Emit completion event
                this.$emit('completionStep');
            };

            // Show completion modal
            showCompletion();
        },

        showComponent(el) {
            // Hide all and show the chosen one: el
            // Only one modal can be shown at a time
            this.showCompletion = el === 'showCompletion';
            this.showVidPlayer = el === 'showVidPlayer';
            this.showExitConfirm = false;

            this[el] = true;
        },

        modalSize(val) {
            if(val === 'video') {
                val = '640px';
            } else if(val === 'default') {
                val = '900px';
            }

            this.$emit('changeModalSize', val);
        },

        closeModal() {
            this.$emit('setShouldHideModal');
            this.$modal.hide();
            this.$emit('closeVideo');
        }
    }
};
