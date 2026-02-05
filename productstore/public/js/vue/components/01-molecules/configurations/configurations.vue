<template>
    <ul v-if="item.SelectionOptions && item.SelectionOptions.length > 0">
        <li
            v-for="(option, i) in item.SelectionOptions"
            :key="i"
            class="pr-5"
            :class="{'hidden':i > 5 && !item.showSelectionOptions}">
            {{ option.Title ? `${option.Title}: ` : '' }}{{ option.Value }}
        </li>
        <li v-if="item.SelectionOptions.length > 6">
            <button
                class="o-cartItem__link inline"
                @click="toggleSelectionOptions(item)"
            >
                <span v-if="isCn">{{ item.showSelectionOptions ? labels.HideSelectionOptions : labels.ShowMoreSelectionOptions }}</span>
                <span v-else class="p-cart__readMore">{{ item.showSelectionOptions ? labels.ReadLess : labels.ReadMore }}</span>
            </button>
        </li>
    </ul>
</template>

<script>
    export default {
        name: 'MConfigurations',
        props: {
            item: {
                type: Object,
                default: () => {}
            },
            labels: {
                type: Object,
                default: () => {}
            }
        },
        computed: {
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        methods: {
            toggleSelectionOptions(item) {
                item.showSelectionOptions = item.showSelectionOptions === undefined ? true : !item.showSelectionOptions;
                this.$forceUpdate();
            }
        }
    };
</script>
