<template>
    <div class="a-quantity" :class="disabled ? '-disabled': ''">
        <button
            class="a-quantity__btn"
            type="button"
            tabindex="-1"
            :aria-disabled="disabled"
            :aria-label="ariaLabelDecrease"
            data-testid="quantityDecrease-button"
            v-on="!disabled ? { click: decreaseByBase } : null">

            <a-icon size="inherit" :class="{'-circle' : showHover}">remove</a-icon>
        </button>

        <input
            ref="input"
            role="spinbutton"
            class="a-quantity__input"
            :class="inputClass"
            :aria-label="ariaLabelInput"
            :aria-valuenow="quantity"
            :aria-valuetext="quantity"
            :aria-valuemin="minValue"
            :aria-valuemax="maxValue"
            :aria-disabled="disabled"
            :value="quantity"
            :maxlength="maxLength"
            data-testid="quantity-input"
            @blur="updateQuantity($event)"
            @keypress="onKeypress($event)"
            @keydown="onKeydown($event)"
            @paste="onPaste($event)" />

        <button
            class="a-quantity__btn"
            type="button"
            tabindex="-1"
            :aria-label="ariaLabelIncrease"
            :aria-disabled="disabled"
            data-testid="quantityIncrease-button"
            v-on="!disabled ? { click: increaseByBase } : null">

            <a-icon size="inherit" :class="{'-circle' : showHover}">add</a-icon>
        </button>
    </div>
</template>

<script>
    import keyCodes from '@common/source/js/utils/key-codes';

    export default {
        name: 'AQuantity',
        props: {
            ariaLabelInput: {
                type: String,
                default: 'Quantity'
            },
            ariaLabelDecrease: {
                type: String,
                default: 'Decrease'
            },
            ariaLabelIncrease: {
                type: String,
                default: 'Increase'
            },
            disabled: {
                type: Boolean,
                default: false
            },
            incrementRange: {
                type: Number,
                default: 5
            },
            inputClass: {
                type: String,
                default: ''
            },
            maxLength: {
                type: Number,
                default: 2
            },
            maxValue: {
                type: Number,
                default: 99
            },
            minValue: {
                type: Number,
                default: 0
            },
            showHover: {
                type: Boolean,
                default: false
            },
            value: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                increment: 1, // could be a prop, but since this is a quantity it most likely won't change
                quantity: 0,
                ready: false, // true when component is fully mounted & initialized
                type: null,
                diff: null
            };
        },
        watch: {
            value() {
                this.setValue();
            },
            quantity() {
                if(this.ready) {
                    this.$emit('input', this.quantity, this.type, this.diff);
                }
            }
        },
        created() {
            this.$on('focus', this.onFocus);
        },
        mounted() {
            this.setValue();
            this.$nextTick(() => (this.ready = true));
        },
        methods: {
            min() {
                this.quantity = this.minValue;
            },
            max() {
                this.quantity = this.maxValue;
            },
            increase(value) {
                this.type = 'increase';
                this.diff = 1;
                this.quantity = value <= this.maxValue ? value : this.maxValue;
            },
            increaseByBase() {
                const value = this.quantity + this.increment;
                this.increase(value);
            },
            increaseByRange() {
                const value = this.quantity + this.incrementRange;
                this.increase(value);
            },
            decrease(value) {
                this.type = 'decrease';
                this.diff = 1;
                this.quantity = value >= this.minValue ? value : this.minValue;
            },
            decreaseByBase() {
                const value = this.quantity - this.increment;
                this.decrease(value);
            },
            decreaseByRange() {
                const value = this.quantity - this.incrementRange;
                this.decrease(value);
            },
            onFocus() {
                this.$refs['input'].focus();
            },
            onPaste(evt) {
                evt.preventDefault();
            },
            onKeypress(evt) {
                if(!this.disabled) {
                    const key = evt.which || evt.keyCode;

                    if(key < 48 || key > 57) {
                        evt.preventDefault();

                        // if "enter" key is pressed:
                        if(key === 13) {
                            this.updateQuantity(evt);
                        }
                    }
                } else {
                    evt.preventDefault();
                }
            },
            onKeydown(evt) {
                if(!this.disabled) {
                    const key = evt.which || evt.keyCode;

                    switch (key) {
                        case keyCodes.UP:
                            evt.preventDefault();
                            this.increaseByBase();
                            break;
                        case keyCodes.DOWN:
                            evt.preventDefault();
                            this.decreaseByBase();
                            break;
                        case keyCodes.HOME:
                            evt.preventDefault();
                            this.min();
                            break;
                        case keyCodes.END:
                            evt.preventDefault();
                            this.max();
                            break;
                        case keyCodes.PAGEUP:
                            evt.preventDefault();
                            this.increaseByRange();
                            break;
                        case keyCodes.PAGEDOWN:
                            evt.preventDefault();
                            this.decreaseByRange();
                            break;
                    }
                }
            },
            setValue() {
                if(typeof this.value !== 'number') return;

                switch (true) {
                    case this.value < this.minValue:
                        this.quantity = this.minValue;
                        break;
                    case this.value > this.maxValue:
                        this.quantity = this.maxValue;
                        break;
                    default:
                        this.quantity = this.value;
                }
            },
            updateQuantity(evt) {
                if(!this.disabled) {
                    const quantity = evt.target.value ? parseInt(event.target.value) : this.minValue;
                    if(typeof quantity === 'number') {
                        if(quantity >= this.minValue) {
                            /**
                             * recursive function to reduce quantity to valid value by number of digits
                             * - max amount of digits by default can be 2 (99 max)
                             *   - this can be overwritten by increasing maxValue property
                             * @param {number} qty most recently updated quantity
                             */
                            const reduceQty = qty => {
                                if(qty <= this.maxValue) {
                                    if(qty > this.quantity) {
                                        this.type = 'increase';
                                        this.diff = qty - this.quantity;
                                    } else {
                                        this.type = 'decrease';
                                        this.diff = this.quantity - qty;
                                    }
                                    this.quantity = qty;
                                    // need to force an update to prevent binded <input /> element from showing larger value
                                    this.$forceUpdate();
                                } else {
                                    // if quantity is higher than max, then convert to string and remove last digit
                                    const newQty = qty?.toString()?.slice(0, -1) || 0;
                                    // convert back to number and re-run reduceQty function
                                    reduceQty(parseInt(newQty));
                                }
                            };

                            // run reduceQty function to find max quantity value by amount of digits instead of total number value
                            reduceQty(quantity);
                        } else {
                            this.quantity = this.minValue;
                            // need to force an update to prevent binded <input /> element from showing lesser value
                            this.$forceUpdate();
                        }
                    }
                }
            }
        }
    };
</script>
