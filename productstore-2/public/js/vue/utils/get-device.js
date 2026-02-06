// getDevice - return the device mobile or desktop
const getDevice = function() {
    if(window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPad|iPod|ios|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
        return 'mobile';
    } else {
        return 'desktop';
    }
};
export default getDevice;
