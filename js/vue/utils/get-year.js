// getYear - return the year from string like: '/Date(1554886845000)/'
const getYear = function(yearCode) {
    if(yearCode) {
        const yearString = yearCode.replace(/[^0-9]/g, '');
        const yearDate = new Date(Number(yearString));
        const yearFull = yearDate.getFullYear();
        return yearFull;
    } else {
        // If the yearCode was Null return 0
        // So we can track the problem
        return 0;
    }
};
export default getYear;
