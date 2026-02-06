// ===================================================
// init-vue.js - FOR NON-PCI COMPONENTS
// ===================================================
import Vue from 'vue/dist/vue.esm';
import Vuex from 'vuex';
import Components from './vue/components';
import CommonComponents from '../../../_common/source/js/vue/components';
import MarketplaceComponents from '../../../marketplace/source/js/vue/components';
import CommonDirectives from '../../../_common/source/js/vue/directives';
import MarketplaceDirectives from '../../../marketplace/source/js/vue/directives';
import Directives from './vue/directives';
import stores from './vue/stores/index';
import marketplaceStores from '../../../marketplace/source/js/vue/stores';
import commonStores from '../../../_common/source/js/vue/stores';
import VueEnv from '../../../_common/source/js/vue/plugins/env/plugin';
import VueCustInfo from '../../../_common/source/js/vue/plugins/custInfo/plugin';
import VueGtm from '../../../_common/source/js/vue/plugins/gtm/plugin';
import VueModal from '../../../_common/source/js/vue/plugins/modal/plugin';
import VueShelf from '../../../_common/source/js/vue//plugins/shelf/plugin';
import Vue2TouchEvents from 'vue2-touch-events';
import Vue2PerfectScrollbar from 'vue2-perfect-scrollbar';
import VueSlickCarousel from 'vue-slick-carousel';
import { FocusTrap } from 'focus-trap-vue';
import { preprocessBeforeCreate, preprocessMounted } from './vue/utils/preprocess/preprocess-ee';

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
    disableClick: true
});
Vue.use(Vue2PerfectScrollbar, {
    options: {
        wheelPropagation: false
    }
});

// Registering all common components
Object.values(CommonComponents).forEach(component => Vue.component(component.name, component));
Object.values(MarketplaceComponents).forEach(component => Vue.component(component.name, component));

// Registering all components
Object.values(Components).forEach(component => Vue.component(component.name, component));
console.log('common directives', CommonDirectives);
// Registering all common directives
Object.values(CommonDirectives).forEach(directive => Vue.directive(directive.name, directive));
Object.values(MarketplaceDirectives).forEach(directive => Vue.directive(directive.name, directive));

// Registering all directives
Object.values(Directives).forEach(directive => Vue.directive(directive.name, directive));

Vue.component('FocusTrap', FocusTrap);
Vue.component('VueSlickCarousel', VueSlickCarousel);

if(vApp) {
    const store = new Vuex.Store({
        modules: { ...stores, ...marketplaceStores, ...commonStores },
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
            // Debug: Verify Vue version
            console.log(
                '%c -- Vue Build -- ',
                'background-color:#42b983; color:white; border-radius: 2px;',
                'Has compiler:', typeof Vue.compile === 'function'
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
