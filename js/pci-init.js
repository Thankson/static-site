// ===================================================
// pci-init.js - FOR PCI COMPONENTS (CSP COMPLIANT)
// ===================================================
// PCI/CSP-safe bootstrap: NO runtime template compilation anywhere.

import Vue from 'vue/dist/vue.runtime.esm';
import Vuex from 'vuex';

// --- Plugins from legacy init ---
import VueEnv from '../../../_common/source/js/vue/plugins/env/plugin';
import VueCustInfo from '../../../_common/source/js/vue/plugins/custInfo/plugin';
import VueGtm from '../../../_common/source/js/vue/plugins/gtm/plugin';
import VueModal from '../../../_common/source/js/vue/plugins/modal/plugin';
import VueShelf from '../../../_common/source/js/vue/plugins/shelf/plugin';
import Vue2TouchEvents from 'vue2-touch-events';
import Vue2PerfectScrollbar from 'vue2-perfect-scrollbar';

// Site Specific Modules
import './build/module-imports.js';

// Common Modules
import './../../../_common/source/js/module-imports';

// --- Global component/directive registries ---
import CommonComponents from '../../../_common/source/js/vue/components';
import MarketplaceComponents from '../../../marketplace/source/js/vue/components';
import Components from './vue/components';
import CommonDirectives from '../../../_common/source/js/vue/directives';
import MarketplaceDirectives from '../../../marketplace/source/js/vue/directives';
import Directives from './vue/directives';
import { FocusTrap } from 'focus-trap-vue';

// --- Vuex modules bundle ---
import stores from './vue/stores/index.js';
import marketplaceStores from '../../../marketplace/source/js/vue/stores';
import commonStores from '../../../_common/source/js/vue/stores';

// dev mock
if(process.env.MOCK_SERVER) {
    // eslint-disable-next-line global-require
    require('@api/_mock-data/mock-server').default();
}

(() => {
    const TAG = '[pci-init]';

    try {
        Vue.use(Vuex);

        // --- Install plugins (mirror legacy init-vue.js) ---
        const safeEnv = { market: {}, flags: {} };
        window.__PRODUCTSTORE_ENV__ = safeEnv;
        Vue.use(VueEnv);

        Vue.use(VueCustInfo);
        Vue.use(VueGtm);

        const vAppRoot = document.getElementById('vApp') || document.body;
        Vue.use(VueModal, { rootEl: vAppRoot, globalNamespace: 'vApp' });
        Vue.use(VueShelf, { rootEl: vAppRoot });

        Vue.use(Vue2TouchEvents, { disableClick: true });
        Vue.use(Vue2PerfectScrollbar, { options: { wheelPropagation: false } });

        // --- Global registrations from registries ---
        Object.values(CommonComponents || {}).forEach(c => c && c.name && Vue.component(c.name, c));
        Object.values(MarketplaceComponents || {}).forEach(c => c && c.name && Vue.component(c.name, c));

        Object.values(Components || {}).forEach(c => c && c.name && Vue.component(c.name, c));
        // Importing the directives in the main bundle
        Object.values(CommonDirectives || {}).forEach(d => d && d.name && Vue.directive(d.name, d));
        Object.values(MarketplaceDirectives || {}).forEach(d => d && d.name && Vue.directive(d.name, d));
        Object.values(Directives || {}).forEach(d => d && d.name && Vue.directive(d.name, d));
        Vue.component('FocusTrap', FocusTrap);

        const store = new Vuex.Store({
            modules: { ...stores, ...marketplaceStores, ...commonStores },
            strict: process.env.NODE_ENV !== 'production'
        });

        // Debug: Verify Vue version
        console.log(TAG, 'Vue build check - Has compiler:', typeof Vue.compile === 'function');
        if(typeof Vue.compile === 'function') {
            console.error(TAG, '⚠️ WARNING: PCI bundle has Vue compiler! This will cause CSP violations!');
        } else {
            console.log(TAG, '✅ Using runtime-only Vue (CSP compliant)');
        }

        // ---------- Helpers ----------
        const normalizeProps = (props = {}) => {
            if(props.dynamicScriptId && !props.scriptId) props.scriptId = props.dynamicScriptId;
            return props;
        };

        // ---- Shim: convert legacy component tags to a neutral island ----
        (function upgradeVueComponentTags() {
            const TAG_LOCAL = '[pci-init/component-shim]';
            // Add all component mappings here
            const componentMappings = [
                {
                    selector: 'p-checkout',
                    possibleNames: ['PCheckout', 'p-checkout']
                },
                {
                    selector: 'p-checkout-edit-account-info',
                    possibleNames: ['p-checkout-edit-account-info', 'PCheckoutEditAccountInfo']
                },
                {
                    selector: 'payment-form',
                    possibleNames: ['PaymentForm', 'payment-form']
                },
                {
                    selector: 'm-cart-icon',
                    possibleNames: ['MCartIcon', 'm-cart-icon']
                },
                {
                    selector: 'owing-balance',
                    possibleNames: ['owing-balance', 'OwingBalance']
                },
                {
                    selector: 'reenrollment-owing-balance',
                    possibleNames: ['reenrollment-owing-balance', 'ReenrollmentOwingBalance']
                },
                {
                    selector: 'o-site-header-ole',
                    possibleNames: ['o-site-header-ole', 'OSiteHeaderOle']
                },
                {
                    selector: 'm-mkt-add-banner',
                    possibleNames: ['m-mkt-add-banner', 'MMktAddBanner']
                },
                {
                    selector: 'a-cust-name-status',
                    possibleNames: ['a-cust-name-status', 'ACustNameStatus']
                },
                {
                    selector: 'o-top-navigation-carousel',
                    possibleNames: ['o-top-navigation-carousel', 'OTopNavigationCarousel']
                },
                {
                    selector: 'm-nav-menu-user',
                    possibleNames: ['m-nav-menu-user', 'MNavMenuUser']
                },
                {
                    selector: 'o-search-bar',
                    possibleNames: ['o-search-bar', 'OSearchBar']
                },
                {
                    selector: 'popup-orders',
                    possibleNames: ['popup-orders', 'PopupOrders']
                },
                {
                    selector: 'popup-lists',
                    possibleNames: ['popup-lists', 'PopupLists']
                },
                {
                    selector: 'popup-notifications',
                    possibleNames: ['popup-notifications', 'PopupNotifications']
                },
                {
                    selector: 'o-my-acc-popup',
                    possibleNames: ['o-my-acc-popup', 'OMyAccPopup']
                },
                {
                    selector: 'popup-message',
                    possibleNames: ['popup-message', 'PopupMessage']
                },
                {
                    selector: 'modal-master',
                    possibleNames: ['modal-master', 'ModalMaster']
                },
                {
                    selector: 'shelf-master',
                    possibleNames: ['shelf-master', 'ShelfMaster']
                },
                {
                    selector: 'o-menu-balance',
                    possibleNames: ['o-menu-balance', 'OMenuBalance']
                },
                {
                    selector: 'pwa-back-button',
                    possibleNames: ['pwa-back-button', 'PwaBackButton']
                },
                {
                    selector: 'a-banner-button',
                    possibleNames: ['a-banner-button', 'ABannerButton']
                },
                {
                    selector: 'a-main-spinner',
                    possibleNames: ['a-main-spinner', 'AMainSpinner']
                }

                // Add more component mappings here as needed
            ];

            // Helper function to find registered component name
            function findRegisteredName(possibleNames) {
                for (const name of possibleNames) {
                    if(Vue.options.components[name]) {
                        return name;
                    }
                }
                return null;
            }

            // Helper function to extract all attributes as props
            function extractProps(element) {
                const props = {};
                const attributes = element.attributes;

                for (let i = 0; i < attributes.length; i++) {
                    const attr = attributes[i];
                    const propName = attr.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

                    // Always pass as string, even for boolean attributes
                    // If attribute has no value (like <div hidden>), pass empty string
                    props[propName] = attr.value || '';
                }

                return normalizeProps(props);
            }

            // Helper function to check for slot content
            function extractSlotContent(element) {
                // Check if element has any meaningful content (not just whitespace)
                const hasContent = Array.from(element.childNodes).some(node => {
                    if(node.nodeType === Node.TEXT_NODE) {
                        return node.textContent.trim().length > 0;
                    }
                    return node.nodeType === Node.ELEMENT_NODE;
                });

                if(hasContent) {
                    return element.innerHTML;
                }
                return null;
            }

            // Process each component type
            let totalConverted = 0;
            componentMappings.forEach(({ selector, possibleNames }) => {
                const nodes = document.querySelectorAll(selector);

                if(nodes.length === 0) {
                    return;
                }

                console.log(TAG_LOCAL, `found ${nodes.length} <${selector}> tags`);

                const registeredName = findRegisteredName(possibleNames);

                if(!registeredName) {
                    console.error(TAG_LOCAL, `component not registered for selector: ${selector}. Tried names: ${possibleNames.join(', ')}`);
                    return;
                }

                nodes.forEach((el) => {
                    try {
                        // Extract props from all attributes
                        const props = extractProps(el);

                        // Extract slot content if present
                        const slotContent = extractSlotContent(el);

                        // Create mount point
                        const mount = document.createElement('div');
                        mount.setAttribute('data-vue-component', registeredName);
                        mount.setAttribute('data-vue-props', JSON.stringify(props));

                        // Store slot content as data attribute if present
                        if(slotContent) {
                            mount.setAttribute('data-vue-slots', slotContent);
                        }

                        // Add a class for easier identification/styling
                        mount.className = `vue-mount-${selector}`;

                        // Preserve any existing classes from the original element
                        if(el.className) {
                            mount.className += ' ' + el.className;
                        }

                        // Replace the original element
                        el.parentNode.replaceChild(mount, el);
                        totalConverted++;

                        // Log in development
                        if(process.env.NODE_ENV === 'development') {
                            console.log(TAG_LOCAL, `converted <${selector}> with props:`, props);
                        }
                    } catch (error) {
                        console.error(TAG_LOCAL, `error converting element <${selector}>:`, error);
                    }
                });
            });

            if(totalConverted > 0) {
                console.log(TAG_LOCAL, `converted ${totalConverted} total components`);
            }
        }());

        // Mount all islands with component constructors (no template compilation)
        const mountIslands = () => {
            const nodes = Array.from(document.querySelectorAll('[data-vue-component]'));
            console.log(TAG, 'islands found:', nodes.map(n => n.getAttribute('data-vue-component')));

            nodes.forEach((el) => {
                const name = el.getAttribute('data-vue-component');
                const raw = el.getAttribute('data-vue-props') || '{}';
                const slotContent = el.getAttribute('data-vue-slots');

                let props = {};
                try { props = JSON.parse(raw); } catch (e) { console.error(TAG, 'bad JSON in data-vue-props', e, raw); }

                // Props normalization already done in extractProps, but ensure it here too
                props = normalizeProps(props);

                const Ctor = Vue.options.components[name];
                if(!Ctor) {
                    console.error(TAG, 'component not registered:', name);
                    return;
                }

                // Create Vue instance with conditional slot rendering
                // eslint-disable-next-line no-new
                new Vue({
                    store,
                    render: h => {
                        // Check for slot content to pass
                        if(slotContent) {
                            // Pass slot content as default slot
                            return h(Ctor, { props }, [
                                h('div', { domProps: { innerHTML: slotContent } })
                            ]);
                        } else {
                            // No slots, just render component with props
                            return h(Ctor, { props });
                        }
                    }
                }).$mount(el);
            });

            return nodes.length;
        };

        // ---- Boot ----
        console.log(TAG, 'boot');

        // Try immediately, then a few retries in case markup lands slightly later
        let attempts = 0;
        const tick = () => {
            attempts += 1;
            if(mountIslands() > 0 || attempts >= 5) return;
            setTimeout(tick, 100);
        };
        if(document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tick, { once: true });
        } else {
            tick();
        }
    } catch (e) {
        console.error(TAG, 'fatal', e);
    }
})();
