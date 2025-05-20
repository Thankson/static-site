import Vue from 'vue';
import Vuex from 'vuex';
import CommonComponents from '@common/source/js/vue/components';
import DsiboComponents from '@dsibo/source/js/vue/components';
import CommonDirectives from '@common/source/js/vue/directives';
import VueSlickCarousel from 'vue-slick-carousel';
import VueEnv from '@common/source/js/vue/plugins/env/plugin';
import VueCustInfo from '@common/source/js/vue/plugins/custInfo/plugin';
import VueGtm from '@common/source/js/vue/plugins/gtm/plugin';
import VueModal from '@common/source/js/vue/plugins/modal/plugin';
import VueShelf from '@common/source/js/vue/plugins/shelf/plugin';
import Vue2TouchEvents from 'vue2-touch-events';
import Vue2PerfectScrollbar from 'vue2-perfect-scrollbar';
import dsiboStores from '@dsibo/source/js/vue/stores/index';
import storesCommon from '@common/source/js/vue/stores/index';

import { FocusTrap } from 'focus-trap-vue';
import { preprocessBeforeCreate, preprocessMounted } from '@common/source/js/vue/utils/preprocess/preprocess-ee';

// Create a mock server only on dev env
if(process.env.MOCK_SERVER) {
    require('@api/_mock-data/mock-server').default();
}

const vApp = document.querySelector('#vApp');

// Plugins
Vue.use(VueEnv);
Vue.use(VueCustInfo);
Vue.use(VueGtm);
Vue.use(VueModal, { rootEl: vApp, globalNamespace: 'vApp' });
Vue.use(VueShelf, { rootEl: vApp });
Vue.use(Vuex);
Vue.use(Vue2TouchEvents, {
    // Disabled for desktop
    disableClick: true
});
Vue.use(Vue2PerfectScrollbar, {
    options: {
        wheelPropagation: false
    }
});

Vue.component('FocusTrap', FocusTrap);
Vue.component('VueSlickCarousel', VueSlickCarousel);
// Registering all common components
Object.values(CommonComponents).forEach(component => Vue.component(component.name, component));

// Registering all components
Object.values(DsiboComponents).forEach(component => Vue.component(component.name, component));

// Registering all directives
Object.values(CommonDirectives).forEach(directive => Vue.directive(directive.name, directive));

// eslint-disable-next-line no-undef
console.log('VueCarousel', VueSlickCarousel);
const allStores = Object.assign(dsiboStores, storesCommon);
console.log('vue', allStores);
if(vApp) {
    const store = new Vuex.Store({
        modules: allStores,
        strict: process.env.NODE_ENV !== 'production'
    });

    new Vue({
        el: vApp,
        store,
        data() {
            return {};
        },
        beforeCreate() {
            preprocessBeforeCreate();
            console.log(
                '%c -- Env -- ',
                'background-color:grey; color:white; border-radius: 2px;',
                this.$env
            );
        },
        mounted() {
            preprocessMounted();
            this.initScripts();
        },
        methods: {
            initScripts() {
                console.log(
                    '%c -- Mounted vApp -- ',
                    'background-color:#3d9a4f; color:white; border-radius: 2px;'
                );
            }
        }
    });
}
