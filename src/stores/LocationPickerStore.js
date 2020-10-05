import { createMutations } from '@n1/vuex-helpers';
import { get, map, includes, cloneDeep } from 'lodash';

const lastSearchGeoItemsCookieName = 'last_search_cities';
/**
 * Стор для работы с гео-объектами попапа
 * @return {StoreModule}
 */

export const OFTEN_SEARCH_GEO_ITEMS = [
    {
        title: 'Архангельск',
        id: 5569,
        regionName: 'Архангельская область',
        domain: 'arhangelsk.n1.ru',
        type: 'city',
    },
    {
        title: 'Екатеринбург',
        id: 147660,
        regionName: 'Свердловская область',
        domain: 'ekaterinburg.n1.ru',
        type: 'city',
    },
    {
        title: 'Красноярск',
        id: 55779,
        regionName: 'Красноярский край',
        domain: 'krasnoyarsk.n1.ru',
        type: 'city',
    },
    {
        title: 'Новосибирск',
        id: 89026,
        regionName: 'Новосибирская область',
        domain: 'novosibirsk.n1.ru',
        type: 'city',
    },
    {
        title: 'Омск',
        id: 90832,
        regionName: 'Омская область',
        domain: 'omsk.n1.ru',
        type: 'city',
    },
    {
        title: 'Пермь',
        id: 99178,
        regionName: 'Пермский край',
        domain: 'perm.n1.ru',
        type: 'city',
    },
    {
        title: 'Тюмень',
        id: 173855,
        regionName: 'Тюменская область',
        domain: 'tumen.n1.ru',
        type: 'city',
    },
    {
        title: 'Челябинск',
        id: 182022,
        regionName: 'Челябинская область',
        domain: 'chelyabinsk.n1.ru',
        type: 'city',
    },
];

export default function LocationPickerStore({
    envType = '',
    geoService,
    logger,
    cookie,
    lastLocationCookieName = 'n1_last_location',
}) {
    const geoFields = [
        'id',
        'name_ru',
        'type',
        'area',
        'region',
        'abbr_raw_ru',
        'params',
        'country',
        'rank',
        'name_seo',
    ].join(',');

    const getTitle = geo => {
        const delim = geo.abbr_raw_ru ? '. ' : '';
        return `${get(geo, 'abbr_raw_ru', '') || ''}${delim}${geo.name_ru}`;
    };

    const getSubtitle = geo => {
        if (geo.type === 'region') {
            return 'Выбрать весь регион';
        }

        const areaNameRu = get(geo, 'area.name_ru', '') || '';
        const delim = areaNameRu !== '' ? ', ' : '';
        return `${areaNameRu}${delim}${get(geo, 'region.name_ru', '') || ''}`;
    };

    const mapGeoItem = (geoItem, currentCityId, currentRegionId, currentContext) => ({
        id: geoItem.id,
        title: getTitle(geoItem),
        subtitle: getSubtitle(geoItem),
        type: geoItem.type,
        checked: isChecked({
            item: geoItem,
            currentCityId,
            currentRegionId,
            currentContext,
        }),
        domain: get(geoItem, 'params.domain'),
        region: geoItem.region,
        params: geoItem.params,
        name_seo: geoItem.name_seo,
    });

    return {
        namespaced: true,

        // State должен быть функцией, чтобы стор можно было подключать несколько раз
        state: () => ({
            /** Текущий регион из геоконтекста */
            currentRegionId: '',
            /** Текущий город из геоконтекста */
            currentCityId: '',
            /** Текущий контекст из геоконтекста */
            currentContext: '',
            /** Вы искали */
            lastSearchGeoItems: [],
            /** id городов с предыдущими поисками */
            lastSearchGeoItemsIds: [],
            /** Часто ищут */
            oftenSearchGeoItems: OFTEN_SEARCH_GEO_ITEMS,
            /** Результаты поиска */
            searchResultGeo: [],
            /** Текущий выбранный гео-объект */
            selectedGeoItem: {},
        }),

        mutations: {
            ...createMutations([
                'lastSearchGeoItems',
                'oftenSearchGeoItems',
                'searchResultGeo',
                'selectedGeoItem',
                'lastSearchGeoItemsIds',
                'currentRegionId',
                'currentCityId',
                'currentContext',
            ]),
        },

        getters: {
            /**
             * Отформатированный список с результатами поиска длы вывода в компоненте
             * @param {Object} state
             * @return {Array}
             */
            searchResultGeoItems({
                searchResultGeo,
                currentCityId,
                currentRegionId,
                currentContext,
            }) {
                if (!searchResultGeo.length) {
                    return [];
                }

                return searchResultGeo.map(geoItem =>
                    mapGeoItem(geoItem, currentCityId, currentRegionId, currentContext),
                );
            },
        },

        actions: {
            /** Инициализируем стейт */
            async initState(
                {
                    commit,
                    state: { oftenSearchGeoItems },
                    dispatch,
                },
                { geo },
            ) {
                const currentRegionId = geo.getRegionId() || null;
                const currentCityId = get(geo.getCities(), '0.id') || null;
                const currentContext = geo.getSearchContext();
                commit('currentRegionId', currentRegionId);
                commit('currentCityId', currentCityId);
                commit('currentContext', currentContext);

                await dispatch('initLastSearchGeoItems');

                const checkedOftenSearchGeoItems = oftenSearchGeoItems.map(geoItem => ({
                    ...geoItem,
                    checked: isChecked({
                        item: geoItem,
                        currentCityId,
                        currentRegionId,
                        currentContext,
                    }),
                }));
                commit('oftenSearchGeoItems', checkedOftenSearchGeoItems);
            },

            /** Получает последние выбранные гео-объекты */
            async initLastSearchGeoItems({
                commit,
                state: { currentCityId, currentRegionId, currentContext },
            }) {
                // В куках хранится массив с айдишниками гео-объектов
                const lastSearchGeoItemsIds = cookie.getValue(lastSearchGeoItemsCookieName) || [];
                if (!lastSearchGeoItemsIds.length) {
                    return;
                }
                const { result: geoObjects } = await geoService.getObjects({
                    ids: lastSearchGeoItemsIds,
                    fields: geoFields,
                });
                const mappedGeoObjects = geoObjects.map(geoItem =>
                    mapGeoItem(geoItem, currentCityId, currentRegionId, currentContext),
                );
                commit('lastSearchGeoItems', mappedGeoObjects);
                commit('lastSearchGeoItemsIds', lastSearchGeoItemsIds);
            },

            /** Метод выполняет поиск в гео кодере */
            async searchGeo(
                {
                    commit,
                    state: { currentRegionId },
                },
                { term },
            ) {
                if (!term.length) {
                    commit('searchResultGeo', []);
                }

                const regionQuery = {
                    region_id: currentRegionId,
                    q: term,
                    limit: 50,
                    fields: geoFields,
                };

                const RUSSIAN_GEO_ID = 643;
                const countryQuery = {
                    q: term,
                    context: {
                        parent_type: 'country',
                        parent_id: RUSSIAN_GEO_ID,
                    },
                    types: ['city', 'region'],
                    limit: 50,
                    fields: geoFields,
                };

                /**
                 * Логика поиска:
                 * 1. Ищем города по префиксному поиску в рамках текущего выбранного региона
                 * 2. Ищем города и регионы в контексте страны в геокодере
                 * 3. Склеиваем результаты поиска исключая дубли во втором запросе
                 */
                try {
                    const [
                        { result: citiesByRegionContext },
                        { result: citiesAndRegionsByGeocoder },
                    ] = await Promise.all([
                        geoService.getCities(regionQuery),
                        geoService.searchGeoObjectsByGeocoder(countryQuery),
                    ]);

                    /** Гео объекты с 10 ранком по бОльшей части СНТ, которые очень сильно захламляют выдачу */
                    const citiesWithoutRank10 = citiesByRegionContext.filter(
                        ({ rank }) => rank !== 10,
                    );

                    /** Исключим из выдачи города, которые мы получили в первом запросе, чтобы избежать дублирования */
                    const citiesIds = map(citiesWithoutRank10, 'id');
                    const uniqСitiesAndRegionsByGeocoder = citiesAndRegionsByGeocoder.filter(
                        ({ id }) => !includes(citiesIds, id),
                    );

                    commit('searchResultGeo', [
                        ...citiesWithoutRank10,
                        ...uniqСitiesAndRegionsByGeocoder,
                    ]);
                } catch (e) {
                    logger.error(e);
                    commit('searchResultGeo', []);
                }
            },

            /**
             * Выбирает текущий город и дополнет его доменом
             * @param {Object} context
             * @param {Object} geoItem
             */
            async addDomainToSelectedGeoItem({ commit }, geoItem) {
                const geoItemWithDomain = cloneDeep(geoItem);
                const hasOwnDomain = geoItemWithDomain.domain || false;
                const isRegion = geoItem.type === 'region';
                if (!hasOwnDomain || isRegion) {
                    geoItemWithDomain.domain_second_part = `${geoItemWithDomain.type}-${
                        geoItemWithDomain.name_seo
                    }/`;
                }
                if (!hasOwnDomain) {
                    const domain = await getGeoItemDomain({
                        geoService,
                        geoItem,
                        envType,
                    });

                    geoItemWithDomain.domain = `//${domain}${envType}/`;
                    geoItemWithDomain.full_domain = getDomainUrl({
                        ...geoItemWithDomain,
                        domain: geoItemWithDomain.domain,
                    });
                    commit('selectedGeoItem', geoItemWithDomain);
                    return;
                }
                const domain = `//${geoItemWithDomain.domain}${envType}/`;
                geoItemWithDomain.domain = domain;

                if (!isRegion) {
                    commit('selectedGeoItem', {
                        ...geoItemWithDomain,
                        full_domain: domain,
                    });
                    return;
                }
                geoItemWithDomain.full_domain = getDomainUrl({
                    ...geoItemWithDomain,
                });
                commit('selectedGeoItem', geoItemWithDomain);
            },

            /**
             * Сохраняет в куку выбранный город
             * @param {Object} context
             * @param {Object} geoItem
             */
            async saveCity({ state: { lastSearchGeoItemsIds, selectedGeoItem }, commit }) {
                if (lastSearchGeoItemsIds.includes(selectedGeoItem.id)) {
                    return;
                }
                const newLastSearchGeoItemsIds = cloneDeep(lastSearchGeoItemsIds);
                newLastSearchGeoItemsIds.unshift(selectedGeoItem.id);
                cookie.setValue(lastSearchGeoItemsCookieName, newLastSearchGeoItemsIds, {
                    expires: 365,
                    domain: `.n1.ru${envType}`,
                });
                commit('lastSearchGeoItemsIds', newLastSearchGeoItemsIds);
            },

            /**
             *  Сохраняет в куки последний выбранный город или регион, на который произошел редирект
             * @param {Object} context
             * @param {Object} params
             * @param {string} params.geoId - идентификатор последнего выбранного гео объекта
             * @param {string} params.geoType - тип гео объекта (город или регион)
             */
            saveLastLocation(context, { geoId, geoType }) {
                cookie.setValue(
                    lastLocationCookieName,
                    { id: geoId, type: geoType },
                    { domain: `.n1.ru${envType}` },
                );
            },
        },
    };
}

/**
 * Строит url для выбранного города
 * @param {Object} params
 * @return {Promise<string>}
 */
async function getGeoItemDomain({ geoService, geoItem }) {
    const region = await geoService.getRegions({
        ids: get(geoItem, 'region.id', ''),
        fields: ['params.domain'],
    });
    return get(region.result[0], 'params.domain');
}
/**
 * Возвращает отформатированный домен
 * @param {Object} params
 * @return {string}
 */
function getDomainUrl({ domain, name_seo: nameSeo, type }) {
    return `${domain}${type}-${nameSeo}`;
}
/**
 * Определяет, является ли гео-объект выделенным
 * @param {Object} params
 * @return {boolean}
 */
function isChecked({ item, currentRegionId, currentCityId, currentContext }) {
    if (currentContext !== item.type) {
        return false;
    }
    if (item.type === 'region' && currentRegionId === item.id) {
        return true;
    }
    if (item.type === 'city' && currentCityId === item.id) {
        return true;
    }
    return false;
}
