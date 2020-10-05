<script>
import UiIconCross from '@n1/ui-kit/UiIcons/UiIconCross';
import Modal from '@n1/ui-kit/UiModalAbstract';
import UiButton from '@n1/ui-kit/UiButton';
import UiInput from '@n1/ui-kit/UiInput';
import UiPreloader from '@n1/ui-kit/UiPreloader';

import _ from 'lodash';

import SearchBar from './SearchBar.vue';
import SearchResults from './SearchResults.vue';
import ChooseRegionInfo from './ChooseRegionInfo.vue';

/** Компонет модального окна с выбором города/региона */
export default {
    components: {
        Modal,
        UiButton,
        UiIconCross,
        UiInput,
        SearchBar,
        SearchResults,
        ChooseRegionInfo,
        UiPreloader,
    },

    props: {
        /** Часто ищут */
        oftenSearchGeoItems: {
            type: Array,
            default: () => [],
        },
        /** Вы искали */
        lastSearchGeoItems: {
            type: Array,
            default: () => [],
        },
        /** Результаты поиска */
        searchResultGeoItems: {
            type: Array,
            default: () => [],
        },
        /** Состояние в процесе поиска */
        isLoading: {
            type: Boolean,
            default: false,
        },
        /** Показывать ли начальный экран */
        showStartDisplay: {
            type: Boolean,
            default: true,
        },
        /** Значение строки поиска */
        inputText: {
            type: String,
            default: '',
        },
    },

    watch: {
        isLoading(value) {
            if (!value) {
                this.scrollTop();
            }
        },
        showStartDisplay(value) {
            if (value) {
                this.scrollTop();
            }
        },
    },

    methods: {
        /** Эмитит в родителя, что окно нужно закрыть для vue1 и vue2 */
        requestClose() {
            this.$emit('request-close');
            this.$emit('requestClose');
        },

        scrollTop() {
            this.$refs.searchResultsContainer.scrollTop = 0;
        },

        /**
         * Отправляем событие раз в 500мс, чтобы не перегружать сервер запросами
         */
        updateResults: _.debounce(function emitSearhCities(value) {
            this.$emit('set-search-cities', { searchStr: value });
        }, 500),

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
modal.location-picker(
    :is-open="true",
    size="content",
    @request-close="requestClose"
)
    .location-picker-content
        header.location-search-header
            .cross(
                @click="requestClose",
                @click.native="requestClose"
            )
                ui-icon-cross.cross__icon
            .title
                | Местоположение
            search-bar(
                :value="inputText",
                @search="updateResults"
            )
        .search-results-container(ref="searchResultsContainer")
            .preloader(v-if="isLoading")
                ui-preloader
            .search-results
                template(v-if="showStartDisplay")
                    search-results(
                        v-if="lastSearchGeoItems.length",
                        title="Вы искали",
                        :items="lastSearchGeoItems",
                        @city-selected="selectItem",
                    )
                    search-results(
                        v-if="oftenSearchGeoItems.length",
                        title="Часто ищут",
                        :items="oftenSearchGeoItems",
                        @city-selected="selectItem",
                    )
                template(v-if="inputText && !showStartDisplay")
                    search-results(
                        v-if="searchResultGeoItems.length",
                        :items="searchResultGeoItems",
                        @city-selected="selectItem",
                    )
                    .no-results(v-if="!isLoading && !searchResultGeoItems.length") Ничего не нашлось...
                    choose-region-info(v-if="!isLoading")

</template>

<style lang="scss" scoped>
@import '~@n1/ui-kit/styles/color.scss';
@import '~@n1/ui-kit/styles/typography.scss';
@import '~@n1/ui-kit/styles/responsive.scss';
@import '~@n1/ui-kit/styles/rounding.scss';

$padding-modal: 24px;
$padding-modal-mobile: 16px;
$popup-width: 440px;
$popup-height: 564px;

.location-picker-content {
    @include ui-kit-typography-body-md;
    box-sizing: border-box;
    background-color: $ui-kit-color-white;
    border-radius: $ui-kit-rounding-md;
    box-shadow: 0px 12px 36px rgba(0, 0, 0, 0.4);
    width: $popup-width;
    height: $popup-height;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.cross {
    position: absolute;
    right: 16px;
    top: 16px;
    width: 20px;
    height: 20px;
    cursor: pointer;

    &__icon {
        width: 20px;
        height: 20px;
        opacity: 0.5;

        &:hover {
            opacity: 1;
        }
    }
}

.location-search-header {
    position: relative;
    padding: $padding-modal $padding-modal 0;
    box-sizing: border-box;
    border-bottom: 1px solid $ui-kit-color-gray80;
}

.title {
    @include ui-kit-typography-h4();
}

.search-results-container {
    overflow: auto;
    flex-grow: 1;
    position: relative;
}

.search-results {
    @include ui-kit-typography-body-md();
    padding-left: 24px;
    padding-top: 12px;
    padding-bottom: 18px;
    box-sizing: border-box;
}

.no-results {
    margin-top: 42px;
    text-align: center;
    color: $ui-kit-color-gray;
    padding-right: $padding-modal;
}

.preloader {
    position: absolute;
    top: 144px;
    left: 44%;
    box-sizing: border-box;
    background: $ui-kit-color-white;
    width: 36px;
    height: 36px;
    line-height: 30px;
    border-radius: 4px;
    text-align: center;
}

@include ui-kit-responsive-media(sm) {
    .location-picker-content {
        width: 100%;
        height: 100%;
        border-radius: 0;
    }

    .cross {
        right: 18px;
        top: 14px;
    }

    .location-search-header {
        padding: 12px $padding-modal-mobile 0;
        background-color: $ui-kit-color-white;
    }

    .title {
        @include ui-kit-typography-h6();
        text-align: center;
    }

    .search-results {
        padding-right: $padding-modal-mobile;
    }

    .preloader {
        top: 277px;
        position: fixed;
    }
}
</style>
