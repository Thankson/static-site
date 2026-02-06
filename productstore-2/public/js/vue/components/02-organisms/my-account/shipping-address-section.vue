<template>
    <section class="o-acctCardSection">
        <h4 class="o-acctCardSection__title">{{ getLocalizationProp('Labels.SectionTitle', 'Shipping Addresses') }}</h4>
        <p v-if="getLocalizationProp('Labels.SubTitle') !== null" class="o-acctCardSection__subTitle mb-10" v-html="getLocalizationProp('Labels.SubTitle', '')"></p>
        <ul class="o-acctCardSection__list">
            <li v-for="address in addressesToShow" :key="address.AddressId" class="o-acctCardSection__col" :class="isBusiness ? '-isCn' : ''">
                <shipping-address-cards
                    :labels="localization.Labels"
                    :data="localization.Data"
                    :card="address"
                    :is-default="address.IsDefault"
                    :is-business="isBusiness"
                    :is-cn-address="isCn"
                    @open-modal="onOpenModal"
                    @open-modal-default="onOpenDefaultModal"
                >
                </shipping-address-cards>
            </li>
        </ul>

        <div v-if="!isBusiness" class="lg:pr-20 lg:w-1_2">
            <a :href="getLocalizationProp('Data.AddNewLink.Url', '#')" :target="getLocalizationProp('Data.AddNewLink.Target', '#')" class="o-acctCardSection__addNewBtn a-button -outline" :class="isCn ? '-isCn': '-large'" @click="gtmTrackAction({id: 204}, $event)">
                <span class="mr-5">+</span>{{ getLocalizationProp('Labels.AddNewLabel', 'Add New Shipping Address') }}
            </a>
        </div>

        <modal heading-class="o-acctCardSection__modalHeading">
            <template v-slot:heading>
                <div :class="{'px-30 text-2xl-2 md:text-4xl-2 md:px-0': isCn}">
                    {{ getLocalizationProp('Labels.ModalTitle', 'Are you sure?') }}
                </div>
            </template>

            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc" :class="{'px-30 text-base md:px-0': isCn}">{{ getLocalizationProp('Labels.ModalDetails', 'Deleting this saved address cannot be undone') }}</p>
            </template>

            <template v-slot:footer>
                <div class="o-acctCardSection__modalFooter" :class="{'px-30 pb-30 md:px-0 md:pb-0': isCn}">
                    <div class="o-acctCardSection__modalBtn -secondary" :class="{'-isCnDel': isCn}">
                        <v-button v-modal-hide class="-white" :class="[{' -full': !isCn}, {'px-25 py-16': isCn}]" @click="gtmTrackAction({id: 204}, $event)">{{ getLocalizationProp('Labels.Cancel', 'Cancel') }}</v-button>
                    </div>

                    <div class="o-acctCardSection__modalBtn -primary" :class="{'-isCnDel': isCn}">
                        <v-button class="-green" :class="[{' -full': !isCn}, {'px-25 py-16': isCn}]" @click="[onDeletedShippingAddress(), gtmTrackAction({id: 204}, $event)]">{{ getLocalizationProp('Labels.Delete', 'Delete') }}</v-button>
                    </div>
                </div>
            </template>
        </modal>

        <modal v-if="isCn" id="modal-delete-default-shipping-address" heading-class="px-30 md:px-0 text-2xl-2 leading-base font-semibold text-gray-150 md:text-4xl-2">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.DeleteDefaultErrorTitle', 'Delete Default Shipping Address') }}
            </template>

            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc -isCn text-base">{{ getLocalizationProp('Labels.DeleteDefaultError', 'Deleting this saved address cannot be undone') }}</p>
            </template>

            <template v-slot:footer>
                <div class="o-acctCardSection__modalFooter -isCn">
                    <div class="o-acctCardSection__modalBtn -secondary">
                        <v-button v-modal-hide class="text-sm px-25 py-16" @click="gtmTrackAction({id: 204}, $event)">{{ getLocalizationProp('Labels.Cancel', 'Cancel') }}</v-button>
                    </div>
                </div>
            </template>
        </modal>

        <!-- Cross Country Modal -->
        <modal id="modal-cross-country-shipping-address" width="630px">
            <template v-slot:heading>
                <div
                    class="m-rte"
                    v-html="crossCountryModalRTE">
                </div>
            </template>

            <template v-slot:footer>
                <div class="mt-30 w-full md:flex">
                    <v-button
                        v-modal-hide
                        type="button"
                        class="a-button -white block font-medium mb-20 py-12 text-base text-center w-full md:mb-0 md:mr-10 md:px-60 md:w-auto"
                    >
                        {{ getLocalizationProp('Labels.Cancel') }}
                    </v-button>
                    <button
                        type="button"
                        class="a-button block font-medium py-12 text-base text-center w-full md:px-20 md:w-auto"
                        @click="continueCrossCountryAddress()"
                    >
                        {{ crossCountryModalContinue }}
                    </button>
                </div>
            </template>
        </modal>

        <AddressPromptModal
            ref="addressPrompt"
            :cancel-label="labelCancel"
            :confirm-label="labelConfirm"
            :desc-label="labelDesc"
            :is-prompt-enabled="isDefaultPaymethodAddressPromptEnabled"
            :ok-label="labelOk"
            :title-label="labelTitle"
            :updated-label="labelUpdated"
        />
    </section>
</template>

<script>
    import { mapActions, mapState, mapMutations, mapGetters } from 'vuex';
    import AddressPromptModal from '../../02-organisms/modals/address-paymethod-prompt.vue';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import { compareAddress } from '../../../utils/format-address.js';

    export default {
        name: 'ShippingAddressSection',
        components: {
            AddressPromptModal
        },
        mixins: [ localizationMixin ],
        props: {
            title: {
                type: String,
                default: 'Shipping Addresses'
            },
            addNewLink: {
                type: String,
                default: '#'
            },
            addNewLabel: {
                type: String,
                default: 'Add new shipping Address'
            },
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                isDefaultChecked: false,
                selectedModal: null,
                isBusiness: false
            };
        },
        computed: {
            ...mapState('shippingAddress', ['addresses']),
            ...mapGetters('shippingAddress', ['crossCountryAddress']),
            addressesToShow() {
                if(this.isBusiness) return this.addresses;
                return this.addresses.filter(addr => addr.AddressType === 'ShippingAddress');
            },
            currentDefaultAddress() {
                var addressesArray = this.addresses;
                return addressesArray.find(item => item.IsDefault === true);
            },
            defaultAddress() {
                return this.addresses?.find(addr => addr.IsDefault);
            },
            isDefaultPaymethodAddressPromptEnabled() {
                return this.getLocalizationProp('Data.RiverbendPaymethodAddressPrompt');
            },
            labelCancel() {
                return this.getLocalizationProp('Labels.AddressPromptModel.ChangeOne');
            },
            labelConfirm() {
                return this.getLocalizationProp('Labels.AddressPromptModel.ChangeBoth');
            },
            labelDesc() {
                return this.getLocalizationProp('Labels.AddressPromptModel.Description');
            },
            labelOk() {
                return this.getLocalizationProp('Labels.AddressPromptModel.Ok', 'Ok');
            },
            labelTitle() {
                return this.getLocalizationProp('Labels.AddressPromptModel.Title');
            },
            labelUpdated() {
                return this.getLocalizationProp('Labels.AddressPromptModel.Updated');
            },
            showCrossCountryModal() {
                return this.crossCountryAddress;
            },
            crossCountryModalRTE() {
                return this.replaceTokenArray(
                    this.getLocalizationProp('Data.CrossCountryModal.RteDescription'),
                    [this.crossCountryAddress?.CountryDisplayName, this.currentDefaultAddress?.CountryDisplayName]
                );
            },
            crossCountryModalContinue() {
                return this.replaceTokenArray(
                    this.getLocalizationProp('Data.CrossCountryModal.ContinueToSite'),
                    [this.crossCountryAddress?.CountryDisplayName]
                );
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            defaultAddress(newValue, oldValue) {
                const riverbendAddress = this.addresses.find(addr => addr.AddressType === 'RiverbendAddress');
                if(!newValue || !oldValue) return;
                if(this.isDefaultPaymethodAddressPromptEnabled &&
                    riverbendAddress &&
                    !compareAddress(newValue, oldValue, this.$env.Country)) {
                    this.$refs?.addressPrompt.show(newValue, [riverbendAddress]);
                }
            },
            showCrossCountryModal(newValue) {
                if(newValue) {
                    this.$modal.show({
                        id: 'modal-cross-country-shipping-address'
                    });
                }
            }
        },
        created() {
            this.isBusiness = this.getLocalizationProp('Data.IsBusiness', false);
            if(this.isBusiness) {
                this.fetchAddresses('businessAddress');
            } else {
                this.fetchAllAddresses();
            }
        },
        methods: {
            ...mapMutations('shippingAddress', ['UPDATE_ADDRESSES', 'SET_DEFAULTADDRESS', 'DELETE_ADDRESS']),
            ...mapActions('shippingAddress', ['fetchAddresses', 'fetchAllAddresses', 'setDefaultAddress', 'deleteAddress', 'setDefaultCrossCountryAddress']),
            replaceTokenArray,
            onModalClose: function() {
                this.$modal.hide();
                this.selectedModal = null;
            },
            onDeletedShippingAddress: function() {
                this.$modal.hide();
                this.deleteAddress(this.selectedModal);
                this.selectedModal = null;
            },
            onOpenModal: function(id) {
                this.selectedModal = id;
                this.$modal.show();
            },
            onOpenDefaultModal: function() {
                this.$modal.show({ id: 'modal-delete-default-shipping-address' });
            },
            async continueCrossCountryAddress() {
                this.$modal.hide({ id: 'modal-cross-country-shipping-address' });
                this.setDefaultCrossCountryAddress({
                    AddressId: this.crossCountryAddress.AddressId,
                    Country: this.crossCountryAddress.Country
                });
            }
        }
    };
</script>
