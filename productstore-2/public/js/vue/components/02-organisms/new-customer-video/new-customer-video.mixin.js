import api from '@api/routes/newcustomervideo/status';
import apiWatched from '@api/routes/newcustomervideo/watched';

export default {
    data() {
        return {
            viewedProgress: -1,
            staticVideoData: {
                playbackRateControls: [1, 1.5]
            }
        };
    },
    methods: {
        async getNewCustomerVideo() {
            api.setRoute('/api/v2/newcustomervideo');
            const response = await api.get(`status?MediaItemName=${this.videoData.MediaItemName}`);
            if(response.success && response.data.Success) {
                this.viewedProgress = response.data?.Data?.ViewedProgress || -1;
                const isViewedComplete = response.data?.Data?.ViewedComplete;
                this.preventSeekNcv = !(isViewedComplete) || this.preventSeek;
                this.shouldHideModal = isViewedComplete;
                this.isCompleted = isViewedComplete;
            }
        },
        async feedbackWatchedProgress(data) {
            await apiWatched.post(data);
        },
        onPlayProgressFeedbackFunction() {
            const coordinateCount = 4;
            const watchProgress = new Map();
            // init viewedProgressRecord
            let viewedProgressRecord = this.viewedProgress;
            // Report the progress of watching a video
            return (event) => {
                const { position, duration } = event;
                const onePiece = duration / coordinateCount;
                const coordinate = Math.floor(position / onePiece);
                const currentProgress = coordinate / coordinateCount;
                if(!watchProgress.has(coordinate) &&
                    (currentProgress > viewedProgressRecord) &&
                    currentProgress !== 1
                ) {
                    viewedProgressRecord = currentProgress;
                    watchProgress.set(coordinate, {
                        progress: currentProgress
                        // datetime: Date(),
                    });
                    this.feedbackWatchedProgress({
                        MediaItemName: this.videoData.MediaItemName,
                        ViewedProgress: currentProgress,
                        ViewedComplete: currentProgress === 1
                    });
                }
            };
        }
    }
};
