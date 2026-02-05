// getBrowser - return the device mobile or desktop
const getBrowser = function(uiCulture) {
    return {
        colorDepth: screen.colorDepth,
        javaScriptEnabled: true,
        language: uiCulture,
        localTime: new Date().toISOString(),
        screenHeight: screen.availHeight,
        screenWidth: screen.availWidth,
        userAgentHeader: window.navigator.userAgent
    };
};
export default getBrowser;
