<template>
    <!-- options -->
    <focus-trap v-model="isTrapped">
        <div v-clickoutside="handleOutside" class="m-cfdiListsOpts" :class="{'-open' : isOpen}" @keyup.esc="handleOutside">
            <div class="m-cfdiListsOpts__selected" :class="{'-open' : isOpen}" @click="handleDropdown">
                <!-- Selected Certificate -->
                <button
                    id="selected-certificate"
                    ref="selected-certificate"
                    class="m-cfdiListsOpts__button -selected"
                    aria-haspopup="listbox"
                    aria-labelledby="selected-certificate"
                    :aria-expanded="isOpen">
                    <span v-show="!selectedCertOption.certificate || isOpen" class="m-cfdiListsOpts__title" v-html="labels.ChooseCertificate"></span>
                    <span v-show="selectedCertOption.certificate && !isOpen" class="m-cfdiListsOpts__title flex">
                        <span class="font-light" v-html="selectedCertOption.name"></span>
                    </span>
                    <arrow
                        :direction="isOpen ? '-up' : '-down'"
                        size="-sm"
                        other-mods="-filled shadow-none pointer-events-none pl-5">
                    </arrow>
                </button>
            </div>
            <!-- Dropdown -->
            <div class="m-cfdiListsOpts__dropdown" :class="{'-open' : isOpen}">
                <div>
                    <div class="m-cfdiListsOpts__category" v-html="labels.MostCommonRegime"></div>
                    <ul>
                        <li v-for="(name,certificate) in commonCertificate" :key="certificate" class="m-cfdiListsOpts__list" :class="{'-selected': selectedCertOption.certificate === certificate}" role="listbox">
                            <button class="flex text-left" @click="selectOption(name, certificate)"><span class="font-light" v-html="name"></span></button>
                        </li>
                    </ul>
                    <hr class="m-cfdiListsOpts__divider" />
                    <div class="m-cfdiListsOpts__category" v-html="labels.AdditionalRegime"></div>
                    <ul>
                        <li v-for="(name,certificate) in additionalCertificate" :key="certificate" class=" m-cfdiListsOpts__list" :class="{'-selected': selectedCertOption.certificate === certificate}" role="listbox">
                            <button class="flex text-left" @click="selectOption(name, certificate)"><span class="font-light" v-html="name"></span></button>
                        </li>
                    </ul>

                </div>

            </div>

        </div>

    </focus-trap>
</template>

<script>
    export default {

        name: 'MCfdiCertificateOpts',
        directives: {
            clickoutside: {
                bind: function(el, binding, vnode) {
                    el.clickOutsideEvent = (event) => {
                        // Click outside the el and his childrens
                        if(!(el === event.target || el.contains(event.target))) {
                            // Call method provided in attribute value
                            vnode.context[binding.expression](event);
                        }
                    };
                    document.body.addEventListener('click', el.clickOutsideEvent);
                    document.body.addEventListener('touchstart', el.clickOutsideEvent);
                },
                unbind: function(el) {
                    document.body.removeEventListener('click', el.clickOutsideEvent);
                    document.body.removeEventListener('touchstart', el.clickOutsideEvent);
                },
                stopProp(event) {
                    event.stopPropagation();
                }
            }
        },
        props: {
            labels: {
                type: Object,
                default: () => ({})
            },
            commonCertificate: {
                type: Object,
                default: () => ({})
            },
            additionalCertificate: {
                type: Object,
                default: () => ({})
            },
            selectedCertOption: {
                type: Object,
                default: () => ({})
            }

        },
        data() {
            return {
                isTrapped: false,
                selected: '',
                isOpen: false,
                isDefaultCertificate: false,
                defaultCertName: ''

            };
        },
        watch: {
            isOpen() {
                this.isTrapped = this.isOpen;
            }
        },
        mounted() {
            this.checkDefaultCertificate();
        },
        methods: {
            checkDefaultCertificate() {
                if(this.labels.DefaultCertificate) {
                    this.isDefaultCertificate = true;
                }
            },
            selectOption(name, certificate) {
                // Set selected list
                this.selectedCertOption['certificate'] = certificate; // eslint-disable-line
                this.selectedCertOption['name'] = name; // eslint-disable-line
                this.$emit('selectedCertificate', this.selectedCertOption);
                // Close select
                this.handleDropdown();

                // Set focus
                this.$refs['selected-certificate'].focus();
            },

            handleDropdown() {
                // Open or close dropdown
                this.isOpen = !this.isOpen;
            },

            handleOutside() {
                if(this.isOpen) {
                    this.handleDropdown();
                }
            }
        }
    };
</script>
