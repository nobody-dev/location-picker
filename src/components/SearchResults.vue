<script>
import SearchResultsItem from './SearchResultsItem.vue';

/** Компонент выводит результаты поиска */
export default {
    components: {
        SearchResultsItem,
    },

    props: {
        /** Заголовок результатов поиска */
        title: {
            type: String,
            default: '',
        },
        /** Массив с результатами поиска */
        items: {
            type: Array,
            requried: true,
            default: () => [],
        },
    },

    methods: {
        /**
         * Эмитит в родителя, что гео-объект был выбран
         * @param {Object} item - выбранный гео-объект
         */
        selectItem(item) {
            this.$emit('city-selected', item);
        },
    },
};
</script>

<template lang="pug">
.search-list
    .search-list-title(v-if="title") {{title}}

    search-results-item(
        v-for="(item, index) in items",
        :key="index",
        :item="item",
        @city-selected="selectItem",
    )

</template>

<style lang="scss" scoped>
@import '~@n1/ui-kit/styles/typography.scss';
@import '~@n1/ui-kit/styles/responsive.scss';

.search-list {
    @include ui-kit-typography-body-md-tight();
    margin-bottom: 24px;
    width: 392px;
    text-align: left;

    &:last-child {
        margin-bottom: 0;
    }
}

.search-list-title {
    font-weight: bold;
    padding: 8px 0;
}

@include ui-kit-responsive-media(sm) {
    .search-list {
        width: 100%;
    }
}
</style>
