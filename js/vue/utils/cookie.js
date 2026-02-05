export default {
    getCookie(cname) {
        const name = cname + '=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieList = decodedCookie.split(';');
        let cookie = null;

        for (let i = 0; i < cookieList.length; i++) {
            cookie = cookieList[i];

            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }

            if(cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }

        return null;
    },

    setCookie(keyword) {
        var searchHistorys = localStorage.getItem('searchHistory');
        if(searchHistorys == null) {
            searchHistorys = '';
        }
        if(searchHistorys.indexOf(keyword) < 0) {
            searchHistorys += ',' + keyword;
            localStorage.setItem('searchHistory', searchHistorys);
        }
        if(searchHistorys !== null) {
            if(searchHistorys.indexOf(',') !== -1) {
                var keys = searchHistorys.split(',');
                if(keys[0] === '') {
                    keys.splice(0, 1);
                }
                // 当搜索历史的长度大于5时，去掉最早的一条记录
                if(keys.length > 10) {
                    keys.splice(0, 1);
                }
                searchHistorys = keys.join(',');
            }
        }
        localStorage.setItem('searchHistory', searchHistorys);
        if(this.getCookie('search_history')) {
            // 清除cookie
            document.cookie = 'search_history=' + null + ';path=/';
        }
        // expires代表过期时间（day）。path，设置cookie的路径，‘/’时整个项目都可用
        document.cookie = 'search_history=' + searchHistorys + ';expires=7;path=/';
    },

    delCookie() {
        localStorage.setItem('searchHistory', null);
        document.cookie = 'search_history=' + null + ';path=/';
    }
};
