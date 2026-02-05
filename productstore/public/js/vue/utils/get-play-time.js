// getPlayTime - return minutes:seconds (5:33) from seconds (333).

const getPlayTime = function(time) {
    if(time) {
        let minutes = Math.floor(time % 3600 / 60);
        let seconds = Math.floor(time % 60);

        if(seconds <= 9) {
            seconds = '0' + seconds;
        }

        return `${minutes}:${seconds}`;
    } else {
        // If the time is Null, return 0:00
        // So we can track the problem
        return '0:00';
    }
};
export default getPlayTime;
