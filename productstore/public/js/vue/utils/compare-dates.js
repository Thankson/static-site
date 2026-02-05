// Check the amount of time of a given date, until today
// Return true or false

const compareDates = function (dateCode, daysToCompare) {
    const setupDate = (data) => {
        const month = data.getUTCMonth() + 1;
        const day = data.getUTCDate();
        const year = data.getUTCFullYear();
        const newdate = month + '/' + day + '/' + year;
        return newdate;
    };

    const parseDate = (str) => {
        const mdy = str.split('/');
        return new Date(mdy[2], mdy[0] - 1, mdy[1]);
    };

    const datediff = (first, second) => {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    };

    const firstDate = setupDate(dateCode); // Convert date to mm/dd/yyyy
    const today = new Date();
    const secondDate = setupDate(today); // Convert date to mm/dd/yyyy
    const diff = datediff(parseDate(firstDate), parseDate(secondDate));

    if(diff > daysToCompare) {
        return true;
    } else {
        return false;
    }
};

export const isTimeReached = (data) => {
    const currentTime = Date.now();
    const eventTime = new Date(data).getTime();
    if(isNaN(eventTime)) {
        return false;
    }
    return currentTime >= eventTime;
};

export default compareDates;
