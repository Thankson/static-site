<template>
    <div class="o-checkoutCoa" :class="isCn ? '-isCn':''">
        <div v-if="!showComp" class="o-checkoutCoa__action">
            <button
                class="o-checkoutCoa__cta"
                :aria-label="labels.UseCreditAriaLabel"
                @click="showCoa"
            >
                {{ labels.UseCreditOnAccount }}
            </button>
        </div>

        <div v-else class="o-checkoutCoa__balance">
            <form class="o-checkoutCoa__form">
                <label for="credit">
                    <!-- Balance value -->
                    {{ labels.YourBalance }}
                    <span class="o-checkoutCoa__value">
                        {{ coaFormattedComp }}
                    </span>
                </label>
                <div class="o-checkoutCoa__col" :class="{relative:showCurrency}">
                    <!-- Input -->
                    <input-basic
                        id="credit"
                        ref="Credit"
                        :value="inputValue"
                        class="o-checkoutCoa__input"
                        :class="{'-hasRmb': (showCurrency && inputValue)}"
                        name="credit"
                        model-name="inputValue"
                        aria-describedby="o-checkoutCoa__error"
                        @keydown="handleInput"
                        @input="setValue"
                    />
                    <span v-if="showCurrency && inputValue" class="o-checkoutCoa__rmb">{{ currency }}</span>

                    <!-- Apply -->
                    <button
                        class="o-checkoutCoa__apply"
                        :aria-label="labels.ApplyAriaLabel"
                        @click.stop.prevent="applyCoa()"
                    >
                        {{ labels.Apply }}
                    </button>

                    <!-- Reset -->
                    <button
                        v-if="showReset"
                        class="o-checkoutCoa__reset"
                        :aria-label="labels.ResetAriaLabel"
                        @click.stop.prevent="[resetCoa(), resetField()]"
                    >
                        {{ labels.Reset }}
                    </button>
                </div>
                <!-- Error messages -->
                <em v-if="error && !isCn" id="o-checkoutCoa__error" class="o-checkoutCoa__error" role="alert" v-html="error"></em>
            </form>
        </div>
        <em v-if="error && isCn" id="o-checkoutCoa__error" class="o-checkoutCoa__error" role="alert" v-html="error"></em>
    </div>
</template>

<script>
    export default {
        name: 'OCheckoutCoa',
        props: {
            credits: {
                type: Object,
                default: () => {}
            },
            errorMsgs: {
                type: Object,
                default: () => {}
            },
            labels: {
                type: Object,
                default: () => {}
            },
            total: {
                type: Number,
                default: null
            },
            isCn: {
                type: Boolean,
                default: false
            },
            showCurrency: {
                type: Boolean,
                default: false
            },
            wholeNumbersOnly: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                coaFormatted: null,
                error: false,
                inputValue: null,
                showComp: false,
                showReset: false
            };
        },
        computed: {
            allowedKeys() {
                return [8, 9, 13, 35, 36, 37, 39, 46];
            },
            coaFormattedComp() {
                return this.coaFormatted ?? this.credits.FormattedBalance;
            },
            currency() {
                return this.isCn ? '￥' : this.credits.FormattedBalance.replace(/[0-9,\\.]+/, '');
            }
        },
        methods: {
            changeBalanceAndEmit(val) {
                const coaVal = this.credits.Balance;
                const signMoney = this.credits.FormattedBalance.replace(/[0-9,\\.]+/, '');
                const signMoneyindex = this.credits.FormattedBalance.indexOf(signMoney) > 0 ? 'end' : 'ini';

                // calc: balance - input
                const newCoaVal = (coaVal - val);
                const newCoaValCents = this.formatTotal(newCoaVal);
                const newCoaValCentsFormatted = signMoneyindex === 'ini' ? (signMoney + newCoaValCents) : (newCoaValCents + signMoney);

                if(isNaN(newCoaVal)) {
                    this.resetCoa();
                    this.error = this.errorMsgs.Invalid;
                    this.dataLayerPushError();
                } else {
                    this.error = null;
                    this.coaFormatted = newCoaValCentsFormatted;
                    // Emit
                    this.$emit('coaApply', parseFloat(val).toFixed(2), signMoney, signMoneyindex);
                }
            },
            checkMoney(val) {
                return RegExp(/^[0-9\\.,]+$/).test(val);
            },
            dataLayerPushError() {
                window.dataLayer && window.dataLayer.push({
                    'event': 'Error State',
                    'errorType': 'Checkout Error',
                    'errorMessage': this.error
                });
            },
            formatTotal(total) {
                const culture = this.$custInfo.uiCulture || 'en-US';
                if(this.wholeNumbersOnly) {
                    const totalFormatted = Number(total).toFixed(0);
                    return Number(totalFormatted).toLocaleString(culture);
                } else {
                    if(culture === 'fr-CA') { // Bug 167106
                        // With explicit fraction digits, maintain 2 decimal places
                        const totalFormatted = new Intl.NumberFormat(culture, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total);
                        return totalFormatted;
                    }
                    return Number(total).toFixed(2);
                }
            },
            handleInput(event, payload) {
                const keyPressed = event.key;
                const keyCode = event.which ?? event.keyCode;

                if(!this.allowedKeys.includes(keyCode) && !this.checkMoney(keyPressed)) {
                    event.preventDefault();
                }
            },
            resetCoa() {
                this.error = null;
                this.showReset = false;
                this.$refs.Credit.$el.focus();
                this.coaFormatted = null;
                this.$emit('coaReset');
            },
            resetField() {
                this.$refs.Credit.$el.value = null;
                this.inputValue = '';
            },
            setValue(value) {
                this.inputValue = value;
            },
            applyCoa() {
                const coaAmount = this.inputValue.replace(',', '');
                const coaAmountCents = this.wholeNumbersOnly ? coaAmount : parseFloat(coaAmount).toFixed(2);

                // Showing the proper value on input
                if(!isNaN(coaAmountCents)) this.$refs.Credit.$el.value = this.formatTotal(coaAmountCents);

                // Errors
                if(!coaAmount || coaAmountCents <= 0) {
                    this.resetCoa();
                    this.error = this.errorMsgs.Empty;
                    this.dataLayerPushError();
                } else if(coaAmountCents > this.credits.Balance) {
                    this.resetCoa();
                    this.error = this.errorMsgs.MoreThanHave;
                    this.dataLayerPushError();
                } else if(coaAmountCents > this.total) {
                    this.resetCoa();
                    this.error = this.errorMsgs.MoreThanTotal;
                    this.dataLayerPushError();
                } else if(!this.checkMoney(coaAmountCents) || isNaN(coaAmountCents)) {
                    this.resetCoa();
                    this.error = this.errorMsgs.Invalid;
                    this.dataLayerPushError();
                } else {
                    this.error = null;
                    this.changeBalanceAndEmit(coaAmount);
                }

                this.showReset = true;
            },
            showCoa() {
                this.showComp = true;
                this.$nextTick(() => {
                    this.$refs.Credit.$el.focus();
                });
            }
        }
    };
</script>
