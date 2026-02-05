<template>
    <div class="m-cvsAddressCards m-acctCard">
        <div class="m-acctCard__card -cvs">
            <div class="pb-25" v-html="formattedAddress"></div>
            <div class="m-acctCard__actions">
                <button
                    class="m-acctCard__button"
                    @click="openModal()"
                >
                    {{ labels.Delete }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'MCvsAddressCards',
        mixins: [ localizationMixin],
        props: {
            card: {
                type: Object,
                default: () => ({})
            },
            labels: {
                type: Object,
                default: () => ({
                    Delete: 'Delete'
                })
            }
        },
        computed: {
            formattedAddress() {
                const { CvsAddress = {}, ChannelDisplayName, StoreName } = this.card;
                const { NameOnAddress = '', PhoneNumber = '', City = '', Suburb = '', AddressLine1 = '', Country = '' } = CvsAddress;
                return `
                    <p class="font-medium">${NameOnAddress} ${PhoneNumber}</p>
                    <p>${ChannelDisplayName} ${StoreName}</p>
                    <p>${City} ${Suburb}</p>
                    <p>${AddressLine1}</p>
                    <p>${Country}</p>
                `;
            }
        },
        methods: {
            openModal() {
                this.$emit('open-modal', this.card.CustomerConvenienceStoreHistoryId);
            }
        }
    };
</script>
