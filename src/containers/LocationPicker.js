import {
    mapDynamicModuleState,
    mapDynamicModuleActions,
    mapDynamicModuleGetters,
} from '@n1/vuex-helpers';
import pick from 'lodash/pick';
import LocationPicker from '@/components/LocationPicker';

/**
 * Контейнеры должны поддерживать режим vue 2 и
 * vue 1 (с помощью vue2to1 из webapp), потому они
 * имеют расширение js
 *
 * @param {Function?} vue2to1 vue2to1 wrapper из webapp, включает режим совместимости с Vue 1
 * @return {VueComponent}
 */
export default function createContainer(vue2to1) {
    // Общие свойства для режимов vue 2 и vue 1
    const common = {
        props: {
            /** Путь до нашего стора, 'StoreModule/StoreSubmodule' */
            storePath: {
                type: String,
                required: true,
            },
        },

        computed: {
            ...mapDynamicModuleState('storePath', [
                'oftenSearchGeoItems',
                'lastSearchGeoItems',
                'selectedGeoItem',
            ]),
            ...mapDynamicModuleGetters('storePath', ['searchResultGeoItems']),
        },

        data() {
            return {
                isLoading: false,
                showStartDisplay: true,
                inputText: '',
            };
        },

        methods: {
            ...mapDynamicModuleActions('storePath', [
                'searchGeo',
                'saveCity',
                'addDomainToSelectedGeoItem',
                'saveLastLocation',
            ]),

            async selectCity(item) {
                // TO_DO убрать, когда в регионах появится домен
                await this.addDomainToSelectedGeoItem(item);
                await this.saveCity();
                this.saveLastLocation({ geoId: item.id, geoType: item.type });
                this.$emit('city-selected', this.selectedGeoItem);
            },

            closeModal() {
                this.$emit('request-close');
            },

            async setCities({ searchStr }) {
                this.inputText = searchStr;
                if (!searchStr.length) {
                    this.isLoading = false;
                    this.showStartDisplay = true;
                    return;
                }

                this.isLoading = true;
                await this.searchGeo({ term: searchStr });
                this.isLoading = false;
                this.showStartDisplay = false;
            },
        },
    };

    // Режим vue1 с использованием vue2to1 враппера из webapp
    if (vue2to1) {
        return {
            ...common,

            replace: true,

            components: {
                /**
                 * Если зарегать его без component, то тот, кто попытается заюзать контейнер как
                 * LocationPicker: createLocationPicker(...) получит call stack size limit reached, т.к.
                 * контейнер попытается рекурсивно отрендерить сам себя
                 */
                LocationPickerComponent: vue2to1(LocationPicker),
            },

            template: `
                <location-picker-component
                    :often-search-geo-items="oftenSearchGeoItems"
                    :last-search-geo-items="lastSearchGeoItems"
                    :search-result-geo-items="searchResultGeoItems"
                    :is-loading="isLoading"
                    :input-text="inputText"
                    :show-start-display="showStartDisplay"
                    @set-search-cities="setCities"
                    @city-selected="selectCity"
                    @request-close="closeModal"
                >
                </location-picker-component>
            `,
        };
    }

    // Нативный vue2 режим
    return {
        ...common,

        // Рендер функция должна быть еквивалентна темплейту режима vue2to1
        render(h) {
            return h(LocationPicker, {
                props: pick(this, Object.keys(LocationPicker.props)),

                on: {
                    'city-selected': item => {
                        this.selectCity(item);
                    },
                    'request-close': () => {
                        this.$emit('request-close');
                    },
                    'set-search-cities': ({ searchStr }) => {
                        this.setCities({ searchStr });
                    },
                },
            });
        },
    };
}
