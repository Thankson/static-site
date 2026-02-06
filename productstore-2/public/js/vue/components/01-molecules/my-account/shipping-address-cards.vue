<template>
    <div class="m-acctCard" :class="{'-isCnAddress' : isCnAddress}">
        <div class="m-acctCard__card">
            <div :class="[{'py-30': !isCnAddress}, {'pt-0 px-0 pb-30 md:pb-48 md:mb-36 md:px-20 md:pt-30' : isCnAddress}]" v-html="card.FormattedAddress"></div>
            <ul v-if="!isBusiness" class="m-acctCard__actions">
                <li class="m-acctCard__button">
                    <a
                        :href="editCardLink"
                        :aria-label="customAriaLabel(labels.EditAriaLabel, labels.Edit)"
                        @click="gtmTrackAction({id: 204}, $event)"
                    >
                        {{ labels.Edit }}
                    </a>
                    <span class="px-5" aria-hidden="true">|</span>
                </li>
                <li>
                    <button
                        class="m-acctCard__button"
                        :aria-label="customAriaLabel(labels.DeleteAriaLabel, labels.Delete)"
                        @click="[openModal(), gtmTrackAction({id: 204}, $event)]"
                    >
                        {{ labels.Delete }}
                    </button>
                </li>
                <li class="m-acctCard__makeDefault">
                    <p v-if="isDefault" class="font-bold uppercase text-gray-150">{{ labels.Default }}</p>
                    <button
                        v-else
                        class="m-acctCard__button"
                        :aria-label="customAriaLabel(labels.MakeDefaultAriaLabel, labels.MakeDefault)"
                        @click="[setAsDefaultAddress(), gtmTrackAction({id: 204}, $event)]"
                    >{{ labels.MakeDefault }}</button>
                </li>
            </ul>
        </div>
        <div
            v-show="showDefaultError"
            class="e-formError__item float-left text-left w-full mt-20 not-italic"
            role="alert"
        >{{ labels.DeleteDefaultError }}</div>
    </div>
</template>

<script>
    import { mapActions, mapMutations } from 'vuex';

    export default {
        name: 'ShippingAddressCards',

        props: {
            card: {
                type: Object,
                default: () => ({
                    FormattedAddress:
                        '<p>701 E 36th Ave</p>\r\n<p></p>\r\n<p>ANCHORAGE, Alaska 99503</p>\r\n<p>Attn: </p>',
                    AddressId: 38797096,
                    IsDefault: true,
                    id: '11'
                })
            },
            data: {
                type: Object,
                default: () => ({
                    EditLink: { Url: '', Text: '', Target: '' },
                    AddNewLink: { Url: '', Text: '', Target: '' }
                })
            },
            labels: {
                type: Object,
                default: () => ({
                    DeleteDefaultError:
                        'You cannot delete a Default Address. Edit another address and make default.',
                    SectionTitle: 'Shipping Addresses',
                    Default: 'Default',
                    DefaultShippingAddress: 'Default Shipping Address',
                    Delete: 'Delete',
                    DeliveryInstructions: 'Delivery Instructions',
                    Edit: 'Edit',
                    EditBusinessAddress: 'Edit Business Address',
                    MakeDefault: 'Make Default',
                    MakeThisDefaultShipping: 'Make This Default Shipping',
                    AddNewLabel: 'Add New Shipping Address',
                    ModalDetails: 'Deleting this saved address cannot be undone.',
                    ModalTitle: 'Are you sure?',
                    Cancel: 'Cancel'
                })
            },
            isCnAddress: {
                type: Boolean,
                default: false
            },
            isDefault: {
                type: Boolean,
                default: false
            },
            isBusiness: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                isDefaultChecked: false,
                showDefaultError: false
            };
        },
        computed: {

            editCardLink: function() {
                return (
                    this.data.EditLink.Url +
                    '?' +
                    this.data.AddressIdQueryParamName +
                    '=' +
                    this.card.AddressId
                );
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            isDefault(newVal, oldVal) {
                this.isDefaultChecked = newVal;
                this.showDefaultError = false;
            }
        },
        mounted() {
            this.isDefaultChecked = this.isDefault;
        },
        methods: {
            ...mapMutations('shippingAddress', ['UPDATE_ADDRESSES', 'SET_DEFAULTADDRESS', 'SET_CROSS_COUNTRY_ADDRESS']),
            ...mapActions('shippingAddress', ['setDefaultAddress']),
            customAriaLabel: function(label, defaultLabel) {
                if(label) {
                    return label.replace('{0}', this.card.NameOnAddress);
                }
                return `${defaultLabel} ${this.card.NameOnAddress}`;
            },
            setAsDefaultAddress() {
                // If the selected address is from another country
                if(this.card.WithinCurrentCountry === false) {
                    this.SET_CROSS_COUNTRY_ADDRESS({
                        AddressId: this.card.AddressId,
                        Country: this.card.Country,
                        CountryDisplayName: this.card.CountryDisplayName
                    });

                // If the selected address is from user's country
                } else {
                    this.showDefaultError = false;
                    this.setDefaultAddress(this.card);
                }
            },
            openModal: function() {
                if(this.isDefaultChecked && this.isCn) {
                    this.openModalDefault();
                    return;
                }
                if(this.isDefaultChecked) {
                    this.showDefaultError = true;
                    return;
                }
                this.$emit('open-modal', this.card.AddressId);
            },
            openModalDefault: function() {
                this.$emit('open-modal-default');
            }
        }
    };
</script>
