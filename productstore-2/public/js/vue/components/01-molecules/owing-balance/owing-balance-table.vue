<template>
    <div class="m-balanceTable">
        <table class="m-balanceTable__table">
            <thead class="m-balanceTable__head">
                <tr class="m-balanceTable__row">
                    <th v-if="enableMultipleOrders && !limitOneOrder" class="m-balanceTable__col -head -date -multiorder">
                        <m-checkbox
                            v-model="selectAllOrders"
                            :label="columnOneTitle"
                            class="m-balanceTable__checkbox"
                            :name="columnOneTitle"
                            :aria-required="Boolean(false)"
                            @input="onSelectAll" />
                    </th>
                    <th v-else class="m-balanceTable__col -head -date">
                        {{ columnOneTitle }}
                    </th>
                    <th class="m-balanceTable__col -head -orderNum">
                        {{ columnTwoTitle }}
                    </th>
                    <th v-if="enableCancelOrder" class="m-balanceTable__col sr-only -head -cancel"></th>
                    <th class="m-balanceTable__col -head -balance">
                        {{ columnThreeTitle }}
                    </th>
                </tr>
            </thead>
            <tbody class="m-balanceTable__body">
                <tr v-for="(unpaid, index) in unpaidItems" :key="unpaid.OrderId" class="m-balanceTable__row">
                    <td v-if="enableMultipleOrders && !limitOneOrder" class="m-balanceTable__col -checkbox">
                        <m-checkbox
                            :id="`balance-${index}`"
                            ref="balance"
                            v-model="checkBoxStatus[index]"
                            :label="unpaid.FormattedOrderDate.toString()"
                            class="m-balanceTable__checkbox"
                            :name="`balance-${index}`"
                            :aria-required="Boolean(false)"
                            @input="onUpdateChoice(index)" />
                    </td>
                    <td v-else-if="limitOneOrder" class="m-balanceTable__col -checkbox">
                        <m-radio
                            ref="owingBalance"
                            v-model="selectedOrderId"
                            class="m-balanceTable__checkbox"
                            label-mods="font-bold"
                            :label="unpaid.FormattedOrderDate.toString()"
                            :input-value="unpaid.OrderId"
                            name="owingBalance"
                            @change="onUpdateSingleOrder(index)"
                        ></m-radio>
                    </td>
                    <td v-else class="m-balanceTable__col -date">{{ unpaid.FormattedOrderDate }}</td>
                    <td class="m-balanceTable__col -orderNum"><a :href="receiptPageUrl + '?orderId=' + unpaid.OrderNumber">{{ unpaid.OrderNumber }}</a></td>
                    <td v-if="enableCancelOrder" class="m-balanceTable__col -cancel">
                        <a
                            v-if="unpaid.CanBeCancel" class="underline" @click="[
                                cancelOrderNumber = unpaid.OrderNumber,
                                openCancelModal()
                            ]">
                            {{ localization.Labels.CancelOrder }}
                        </a>
                    </td>
                    <td class="m-balanceTable__col -balance">{{ unpaid.FormattedBalance }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Modal - Cancel Order -->
        <modal id="cancel-modal">
            <template v-slot:heading>
                {{ localization.Labels.CancelModelHeader }}
            </template>

            <template v-slot:body>
                <p>{{ localization.Labels.CancelModelDesc }}</p>
            </template>

            <template v-slot:footer>
                <div>
                    <button class="a-button text-base font-medium py-12 px-40 mx-10 inline-block -white" type="button" @click="cancelOrder()">
                        {{ localization.Labels.CancelModelCancelLabel }}
                    </button>
                    <button class="a-button text-base font-medium py-12 px-40 mx-10 inline-block" type="button" @click="closeCancel()">
                        {{ localization.Labels.CancelModelKeepLabel }}
                    </button>
                </div>
            </template>
        </modal>

        <p class="m-balanceTable__text">
            <span role="text" class="flex md:block">
                <span class="m-balanceTable__total -text">
                    {{ balanceOwed }}
                </span>
                <span class="m-balanceTable__total -num">{{ totalBalance }}</span>
            </span>
        </p>
    </div>
</template>

<script>
    import cancelOrderApi from '@api/routes/cancelorder';
    import orderTakenBy from '@common/source/js/utils/order-taken-by';
    import { portal } from '@productstore/source/js/vue/utils/payment-types';

    export default {
        name: 'OwingBalanceTable',
        props: {
            balanceOwed: {
                type: String,
                default: ''
            },
            columnOneTitle: {
                type: String,
                default: ''
            },
            columnTwoTitle: {
                type: String,
                default: ''
            },
            columnThreeTitle: {
                type: String,
                default: ''
            },
            enableCancelOrder: {
                type: Boolean,
                default: false
            },
            enableMultipleOrders: {
                type: Boolean,
                default: false
            },
            limitOneOrder: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default: () => {
                    return {
                        'Data': {
                            'OrderLink': {
                                'Url': window.location.origin + '/receipt'
                            }
                        }
                    };
                }
            },
            payMethod: {
                type: String,
                default: ''
            },
            totalBalance: {
                type: String,
                default: ''
            },
            unpaidItems: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                cancelOrderNumber: null,
                checkBoxStatus: [],
                isInitialized: false,
                selectAllOrders: false,
                selectedOrderId: null
            };
        },
        computed: {
            receiptPageUrl() {
                // to test locally, use the string, '//localhost:3030/patterns/03-pages-receipt-receipt/03-pages-receipt-receipt.rendered.html':
                return this.localization?.Data?.OrderLink?.Url || (window.location.origin + '/receipt');
            }
        },
        watch: {
            payMethod(val) {
                if(this.isInitialized) {
                    this.updateCheckboxes(val);
                }
            },
            unpaidItems(val) {
                // set the initial state
                if(this.isInitialized) return;
                const num = this.unpaidItems.length;
                this.checkBoxStatus = Array(num);
                if(val.length === this.unpaidItems.length && !this.isInitialized) {
                    this.updateCheckboxes(this.payMethod);
                }
            }
        },
        mounted() {
            this.$modal.$on.hidden(() => {
                this.cancelOrderNumber = null;
            });
        },
        methods: {
            emitStatus(orders, action) {
                this.$emit('update', { order: orders, action: action });
            },
            openCancelModal() {
                this.$modal.show({id: 'cancel-modal'});
            },
            closeCancel() {
                this.$modal.hide({id: 'cancel-modal'});
            },
            async cancelOrder() {
                if(this.cancelOrderNumber) {
                    const res = await cancelOrderApi.post({ orderNumber: this.cancelOrderNumber, networkId: orderTakenBy()});
                    if(res.success) {
                        if(res.data) {
                            this.$modal.hide({id: 'cancel-modal'});
                            location.reload();
                            return true;
                        }
                    } else {
                        console.log('[CancelOrder] inventory response =>', res.error);
                        this.$modal.hide({id: 'cancel-modal'});
                        return false;
                    }
                }
            },
            onSelectAll(state) {
                this.selectAllOrders = state;
                const orders = this.unpaidItems.map(x => x.OrderId);
                this.setCheckboxState(state);
                this.emitStatus(orders, state ? 'all' : 'remove-all');
            },
            onUpdateSingleOrder(index) {
                const orders = this.unpaidItems.map(x => x.OrderId);
                let selectedBill = this.unpaidItems[index];
                this.selectedOrderId = selectedBill.OrderId;
                this.emitStatus(orders, 'remove-all');
                this.emitStatus(this.selectedOrderId, 'add');
            },
            onUpdateChoice(index) {
                this.selectAllOrders = false;
                let selectedBill = this.unpaidItems[index];
                this.emitStatus(selectedBill?.OrderId, this.checkBoxStatus[index] ? 'add' : 'remove');
            },
            setCheckboxState(state) {
                this.checkBoxStatus.fill(state);
                this.isInitialized = true;
            },
            updateCheckboxes(_pay) {
                if(_pay === portal) {
                    this.onSelectAll(false);
                    this.checkBoxStatus[0] = true;
                    this.onUpdateChoice(0);
                } else if(this.limitOneOrder) {
                    this.onUpdateSingleOrder(0);
                } else {
                    this.onSelectAll(true);
                }
            }
        }
    };
</script>
