<template>
    <div class="o-cvsAddressSection">
        <section v-if="cvsFeatureFlag" class="o-acctCardSection">
            <h4 class="o-acctCardSection__title">{{ getLocalizationProp('Labels.SectionTitle') }}</h4>
            <ul class="o-acctCardSection__list">
                <li v-for="address in addresses" :key="address.AddressId" class="o-acctCardSection__col">
                    <m-cvs-address-cards
                        :script-id="scriptId"
                        :labels="localization.Labels"
                        :data="localization.Data"
                        :card="address"
                        @open-modal="onOpenModal"
                    >
                    </m-cvs-address-cards>
                </li></ul>

            <div class="lg:pr-20 lg:w-1_2">
                <a
                    :href="getLocalizationProp('Data.AddNewLink.Url', '#')"
                    :target="getLocalizationProp('Data.AddNewLink.Target', '#')"
                    class="o-acctCardSection__addNewBtn a-button -outline -large"
                >
                    <span class="mr-5">+</span>{{ getLocalizationProp('Labels.AddNewLabel') }}
                </a>
            </div>
        </section>
        <modal heading-class="o-acctCardSection__modalHeading">
            <template v-slot:heading>
                <div>
                    {{ getLocalizationProp('Labels.Modal.Title') }}
                </div>
            </template>

            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc">{{ getLocalizationProp('Labels.Modal.Details') }}</p>
            </template>

            <template v-slot:footer>
                <div class="o-acctCardSection__modalFooter">
                    <div class="o-acctCardSection__modalBtn -secondary">
                        <v-button v-modal-hide class="-white -full">{{ getLocalizationProp('Labels.Modal.Cancel') }}</v-button>
                    </div>

                    <div class="o-acctCardSection__modalBtn -primary">
                        <v-button class="-green -full" @click="onDeletedCvsAddress()">{{ getLocalizationProp('Labels.Delete') }}</v-button>
                    </div>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import { mapActions, mapState, mapMutations } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'OCvsAddressSection',
        mixins: [ localizationMixin],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                selectedModal: null
            };
        },
        computed: {
            ...mapState('cvsAddress', ['addresses']),
            cvsFeatureFlag() {
                return this.getLocalizationProp('Data.EnableCVSPickUp', false);
            }
        },

        mounted() {
            if(this.cvsFeatureFlag) {
                this.fetchAddresses();
            }
        },

        methods: {
            ...mapMutations('cvsAddress', ['UPDATE_ADDRESSES', 'DELETE_ADDRESS']),
            ...mapActions('cvsAddress', ['fetchAddresses', 'deleteAddress']),
            onDeletedCvsAddress() {
                this.$modal.hide();
                this.deleteAddress(this.selectedModal);
                this.selectedModal = null;
            },
            onOpenModal(id) {
                this.selectedModal = id;
                this.$modal.show();
            }
        }
    };
</script>
