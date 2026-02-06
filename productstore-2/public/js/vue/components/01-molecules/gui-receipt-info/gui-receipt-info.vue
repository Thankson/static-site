<template>
    <ul class="m-guiReceiptInfo">
        <li class="m-guiReceiptInfo__item">
            <span>{{ invoiceIssueDateLabel }}</span>
            <span class="m-guiReceiptInfo__desc">{{ formattedDate }}</span>
        </li>

        <li class="m-guiReceiptInfo__item">
            <span>{{ invoiceTrackNumberLabel }}</span>
            <span class="m-guiReceiptInfo__desc">{{ guiId }}</span>
        </li>

        <li class="m-guiReceiptInfo__item">
            <span>{{ randomCodeLabel }}</span>
            <span class="m-guiReceiptInfo__desc">{{ gui.RandomNumber }}</span>
        </li>

        <template v-if="!loveCode">
            <li class="m-guiReceiptInfo__item">
                <span>{{ carrierTypeLabel }}</span>
                <span class="m-guiReceiptInfo__desc">{{ gui.CarrierTypeDisplayName }}</span>
            </li>

            <li class="m-guiReceiptInfo__item">
                <span>{{ carrierNumberLabel }}</span>
                <span class="m-guiReceiptInfo__desc">{{ gui.GuiCarrierImplicitID }}</span>
            </li>
        </template>

        <li v-else class="m-guiReceiptInfo__item">
            <span>{{ loveCodeLabel }}</span>
            <span class="m-guiReceiptInfo__desc">{{ loveCode }}</span>
        </li>
    </ul>
</template>

<script>
    export default {
        name: 'MGuiReceiptInfo',
        props: {
            carrierNumberLabel: {
                type: String,
                default: 'Carrier Number:'
            },
            carrierTypeLabel: {
                type: String,
                default: 'Carrier Type:'
            },
            gui: {
                type: Object,
                default: () => {}
            },
            invoiceIssueDateLabel: {
                type: String,
                default: 'Invoice Issue Date:'
            },
            invoiceTrackNumberLabel: {
                type: String,
                default: 'Invoice Track Number:'
            },
            loveCodeLabel: {
                type: String,
                default: 'Love Code:'
            },
            randomCodeLabel: {
                type: String,
                default: 'Random Code:'
            }
        },
        computed: {
            formattedDate() {
                if(!this.gui.SaleDate) return '';

                return new Date(this.gui.SaleDate).toLocaleDateString(this.$custInfo.culture, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            },
            guiId() {
                if(!this.loveCode) return this.gui.GuiIdentifier;

                // mask last 3 chars if love code was used
                const guiId = this.gui.GuiIdentifier?.slice(0, -3);
                return guiId + '***';
            },
            loveCode() {
                return this.gui.GuiDoneeID || null;
            }
        }
    };
</script>
