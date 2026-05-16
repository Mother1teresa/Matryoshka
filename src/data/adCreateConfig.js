import {
  carBrands, carModels, bodyTypes, transmissions, engines, colors, ptsOwners,
  landPurposes, houseMaterials, houseStates, dealTypes, communications,
  genders, employmentTypes, workFormats, servicePriceUnits, salaryUnits,
  activitySpheres, professions
} from './sharedFieldOptions';

/**
 * Конфигурация полей для создания объявлений
 * 
 * Единое правило: под-подкатегория (subSubCategory) выбирается через chips
 * и НЕ дублируется внутри формы. Она отправляется в API отдельным полем.
 * 
 * Поле:
 * - key: string — ключ в form.attributes
 * - label: string — заголовок
 * - type: string — тип поля
 * - required?: boolean
 * - placeholder?: string
 * - options?: array — для select/chips
 * - dynamicOptions?: string — ключ из sharedFieldOptions
 * - suffix?: string — ₽, км, л. и т.д.
 * - unitOptions?: array — для price-with-unit, number-with-unit
 * - bindToTitle?: boolean — привязать к form.title
 * - hint?: string — подсказка рядом с label
 * - gridClass?: string — CSS класс для сетки chips
 * - searchable?: boolean — для multiselect
 */

export const adCreateConfig = {

  // ═══════════════════════════════════════════════════════════
  // ТОВАРЫ — простая категория
  // ═══════════════════════════════════════════════════════════
  tovary: {
    default: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название товара', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название товара',
              bindToTitle: true
            },
            { 
              key: 'category', 
              label: 'Категория товара', 
              type: 'select', 
              required: true,
              placeholder: 'Выберите из списка категорию',
              dynamic: true
            },
            { 
              key: 'price', 
              label: 'Цена товара', 
              type: 'number', 
              required: true, 
              placeholder: 'Введите цену товара',
              suffix: '₽'
            }
          ]
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════
  // УСЛУГИ
  // ═══════════════════════════════════════════════════════════
  uslugi: {
    default: {
      sections: [
        {
          title: 'Описание',
          fields: [
            { 
              key: 'service_name', 
              label: 'Название услуги', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название услуги',
              bindToTitle: true
            },
            { 
              key: 'service_catalog', 
              label: 'Каталог услуг', 
              type: 'select', 
              required: true,
              placeholder: 'Выберите вид услуги',
              options: [
                'Ремонт техники', 'Уборка', 'Юридические услуги', 'Такси', 
                'Фотосъёмка', 'Дизайн', 'Грузоперевозки', 'Ремонт квартир',
                'Клининг', 'Маникюр', 'Парикмахерские услуги', 'Педагоги',
                'Уход за животными', 'Выгул собак', 'Аренда транспорта',
                'IT-услуги', 'Психологическая помощь', 'Переводчик',
                'PR-услуги', 'Реклама', 'Бухгалтерские', 'Видеосъёмка',
                'Ремонт автомобилей', 'Дизайн интерьера', 'Ландшафтный дизайн',
                'Организация праздников', 'Катеринг', 'Медицинские услуги',
                'Строительство', 'Курьерские услуги', 'Ремонт обуви',
                'Пошив одежды', 'Монтажные работы', 'Установка техники',
                'Услуги сантехника', 'Услуги электрика', 'Бьюти-услуги',
                'Фитнес-тренер'
              ]
            },
            { 
              key: 'activity', 
              label: 'Чем вы занимаетесь', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите род деятельности'
            },
            { 
              key: 'service_types', 
              label: 'Виды предлагаемых услуг', 
              type: 'dynamic-list',
              placeholder: 'Введите название предлагаемой услуги',
              hint: '(не обязательно)'
            }
          ]
        },
        {
          title: null,
          fields: [
            { 
              key: 'price', 
              label: 'Стоимость услуги', 
              type: 'price-with-unit', 
              required: true,
              unitOptions: servicePriceUnits
            }
          ]
        },
        {
          title: 'График работы',
          fields: [
            { 
              key: 'work_days', 
              label: 'Рабочие дни', 
              type: 'days-checkbox',
              options: ['пн.', 'вт.', 'ср.', 'чт.', 'пт.', 'сб.', 'вс.']
            },
            { 
              key: 'work_time', 
              label: 'Рабочее время', 
              type: 'time-range'
            },
            { 
              key: 'experience', 
              label: 'Опыт работы', 
              type: 'number-with-unit',
              unitOptions: ['мес.', 'лет']
            }
          ]
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════
  // ТРАНСПОРТ
  // ═══════════════════════════════════════════════════════════
  transport: {
    // ───────── АВТОМОБИЛИ ─────────
    cars: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            { 
              key: 'brand', 
              label: 'Марка', 
              type: 'select', 
              required: true,
              placeholder: 'Введите или выберите марку автомобиля',
              options: carBrands,
              searchable: true
            },
            { 
              key: 'model', 
              label: 'Модель', 
              type: 'select', 
              required: true,
              placeholder: 'Введите или выберите модель автомобиля',
              dynamicOptions: 'carModels',
              searchable: true
            },
            { 
              key: 'year', 
              label: 'Год выпуска', 
              type: 'number', 
              required: true,
              placeholder: '0',
              suffix: 'г.'
            },
            { 
              key: 'color', 
              label: 'Цвет', 
              type: 'select',
              placeholder: 'Введите или выберите цвет автомобиля',
              options: colors,
              searchable: true
            },
            { 
              key: 'condition', 
              label: 'Состояние', 
              type: 'chips',
              options: ['На ходу', 'Не на ходу'],
              gridClass: 'chips-2'
            },
            { 
              key: 'body_type', 
              label: 'Кузов', 
              type: 'select',
              placeholder: 'Введите или выберите кузов автомобиля',
              options: bodyTypes
            },
            { 
              key: 'pts_owners', 
              label: 'Владельцев по ПТС', 
              type: 'select',
              placeholder: 'Введите или выберите кол-во владельцев по ПТС',
              options: ptsOwners
            },
            { 
              key: 'mileage', 
              label: 'Пробег', 
              type: 'number',
              placeholder: '0',
              suffix: 'км.'
            },
            { 
              key: 'engine', 
              label: 'Двигатель', 
              type: 'select',
              placeholder: 'Введите или выберите двигатель',
              options: engines
            },
            { 
              key: 'transmission', 
              label: 'КПП', 
              type: 'select',
              placeholder: 'Введите или выберите КПП',
              options: transmissions
            },
            { 
              key: 'engine_volume', 
              label: 'Объём двигателя', 
              type: 'number',
              placeholder: '0',
              suffix: 'л.'
            },
            { 
              key: 'power', 
              label: 'Мощность', 
              type: 'number',
              placeholder: '0',
              suffix: 'л.с.'
            },
            { 
              key: 'drive', 
              label: 'Привод', 
              type: 'chips',
              options: ['Передний', 'Задний', 'Полный'],
              gridClass: 'chips-3'
            },
            { 
              key: 'steering', 
              label: 'Руль', 
              type: 'chips',
              options: ['Левый', 'Правый'],
              gridClass: 'chips-2'
            }
          ]
        }
      ]
    },

    // ───────── МОТОЦИКЛЫ ─────────
    moto: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            { 
              key: 'country', 
              label: 'Страна производитель', 
              type: 'select', 
              placeholder: 'Введите или выберите страну производителя',
              options: [
                'Япония', 'Китай', 'Индия', 'Тайвань', 'Таиланд', 'Вьетнам', 
                'Германия', 'Австрия', 'Италия', 'Великобритания', 'Франция', 
                'Чехия', 'Россия', 'США', 'Мексика', 'Бразилия', 'Другое'
              ]
            },
            { 
              key: 'moto_type', 
              label: 'Тип техники', 
              type: 'select', 
              placeholder: 'Введите или выберите тип техники',
              options: [
                'Дорожные', 'Туристические', 'Спортивные', 'Суперспортивные', 
                'Спорт-туризм', 'Naked', 'Стритфайтеры', 'Кроссовые', 'Эндуро', 
                'Мотард', 'Трюковые', 'Питбайки', 'Чоппер', 'Круизер', 
                'Дрэгстер', 'Трайк', 'Скутеры', 'Макроциклы'
              ]
            },
            { 
              key: 'brand', 
              label: 'Марка', 
              type: 'select', 
              placeholder: 'Введите или выберите марку',
              options: [
                'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'KTM', 'BMW Motorrad', 
                'Ducati', 'Triumph', 'Aprilia', 'Harley-Davidson', 'Polaris', 
                'Arctic Cat', 'Bajaj', 'BSE', 'Stels', 'Gaiakin', 'JHL MOTO', 
                'Sanhesh', 'Racer', 'Motoland', 'Другая'
              ]
            },
            { 
              key: 'model', 
              label: 'Модель', 
              type: 'select', 
              placeholder: 'Введите или выберите модель',
              dynamic: true
            },
            { 
              key: 'year', 
              label: 'Год выпуска', 
              type: 'number', 
              suffix: 'г.' 
            },
            { 
              key: 'color', 
              label: 'Цвет', 
              type: 'select', 
              placeholder: 'Введите или выберите цвет',
              options: colors
            },
            { 
              key: 'condition', 
              label: 'Состояние', 
              type: 'chips', 
              options: ['На ходу', 'Не на ходу'], 
              gridClass: 'chips-2' 
            },
            { 
              key: 'pts_owners', 
              label: 'Владельцев по ПТС', 
              type: 'select', 
              placeholder: 'Введите или выберите кол-во владельцев',
              options: ['1', '2', '3+', 'Не важно']
            },
            { 
              key: 'mileage', 
              label: 'Пробег', 
              type: 'number', 
              suffix: 'км.' 
            },
            { 
              key: 'engine', 
              label: 'Двигатель', 
              type: 'select', 
              placeholder: 'Введите или выберите двигатель',
              options: ['Бензин', 'Дизель', 'Электро']
            },
            { 
              key: 'engine_volume', 
              label: 'Объём двигателя', 
              type: 'number', 
              suffix: 'см³' 
            },
            { 
              key: 'power', 
              label: 'Мощность', 
              type: 'number', 
              suffix: 'л.с.' 
            },
            { 
              key: 'cooling', 
              label: 'Охлаждение', 
              type: 'chips', 
              options: ['Воздушное', 'Жидкостное'], 
              gridClass: 'chips-2' 
            }
          ]
        }
      ]
    },

    // ───────── ВОДНЫЙ ТРАНСПОРТ ─────────
    water: {
      yachts: {
        sections: [
          {
            title: 'Основная информация',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { 
                key: 'country', 
                label: 'Страна производитель', 
                type: 'select', 
                placeholder: 'Введите или выберите страну производителя',
                options: [
                  'Россия', 'США', 'Италия', 'Франция', 'Великобритания', 
                  'Германия', 'Нидерланды', 'Турция', 'ОАЭ', 'Другое'
                ]
              },
              { 
                key: 'brand', 
                label: 'Марка', 
                type: 'select', 
                placeholder: 'Введите или выберите марку',
                options: [
                  'Azimut', 'Princess', 'Sunseeker', 'Ferretti', 'Pershing', 
                  'Riva', 'Benetti', 'Lürssen', 'Amels', 'Oceanco', 'Heesen', 
                  'Moonen', 'Feadship', 'Burger', 'Westport', 'Hargrave', 
                  'Trinity', 'Codecasa', 'CRN', 'Mondomarine', 'Другая'
                ]
              },
              { 
                key: 'vessel_type', 
                label: 'Тип судна', 
                type: 'select', 
                placeholder: 'Введите или выберите тип судна',
                options: [
                  'Моторная яхта', 'Парусная яхта', 'Катамаран', 'Тримаран', 
                  'Каютный катер', 'Рыболовное судно', 'Другое'
                ]
              },
              { 
                key: 'year', 
                label: 'Год выпуска', 
                type: 'number', 
                suffix: 'г.' 
              },
              { 
                key: 'length', 
                label: 'Длина', 
                type: 'number', 
                suffix: 'м.' 
              },
              { 
                key: 'width', 
                label: 'Ширина', 
                type: 'number', 
                suffix: 'м.' 
              },
              { 
                key: 'draft', 
                label: 'Осадка', 
                type: 'number', 
                suffix: 'м.' 
              },
              { 
                key: 'max_passengers', 
                label: 'Максимальное число пассажиров', 
                type: 'select', 
                placeholder: 'Введите или выберите макс. число пассажиров',
                options: ['1-5', '6-10', '11-20', '21-50', '50+']
              },
              { 
                key: 'hull_material', 
                label: 'Материал корпуса', 
                type: 'select', 
                placeholder: 'Введите или выберите материал',
                options: ['Сталь', 'Алюминий', 'Стеклопластик', 'Дерево', 'Карбон', 'Другое']
              },
              { 
                key: 'condition', 
                label: 'Состояние', 
                type: 'chips', 
                options: ['На ходу', 'Не на ходу'], 
                gridClass: 'chips-2' 
              }
            ]
          }
        ]
      },

      jetski: {
        sections: [
          {
            title: 'Основная информация',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { 
                key: 'country', 
                label: 'Страна', 
                type: 'select', 
                placeholder: 'Введите или выберите страну',
                options: ['Япония', 'США', 'Канада', 'Россия', 'Китай', 'Другое']
              },
              { 
                key: 'moto_type', 
                label: 'Тип', 
                type: 'select', 
                placeholder: 'Введите или выберите тип',
                options: [
                  'Спортивный', 'Гоночный', 'Туристический', 'Универсальный', 
                  'Детский', 'Трёхместный', 'Двухместный', 'Одноместный'
                ]
              },
              { 
                key: 'brand', 
                label: 'Марка', 
                type: 'select', 
                placeholder: 'Введите или выберите марку',
                options: [
                  'Yamaha', 'Sea-Doo (BRP)', 'Kawasaki', 'Honda', 'Polaris', 
                  'Tigershark', 'Arctic Cat', 'Другая'
                ]
              },
              { 
                key: 'model', 
                label: 'Модель', 
                type: 'select', 
                placeholder: 'Введите или выберите модель',
                dynamic: true
              },
              { 
                key: 'year', 
                label: 'Год выпуска', 
                type: 'number', 
                suffix: 'г.' 
              },
              { 
                key: 'power', 
                label: 'Мощность', 
                type: 'number', 
                suffix: 'л.с.' 
              },
              { 
                key: 'engine_volume', 
                label: 'Объём двигателя', 
                type: 'number', 
                suffix: 'л.' 
              },
              { 
                key: 'condition', 
                label: 'Состояние', 
                type: 'chips', 
                options: ['На ходу', 'Не на ходу'], 
                gridClass: 'chips-2' 
              },
              { 
                key: 'max_passengers', 
                label: 'Максимальное число пассажиров', 
                type: 'select', 
                placeholder: 'Введите или выберите макс. число пассажиров',
                options: ['1', '2', '3', '4+']
              }
            ]
          }
        ]
      }
    },
  
    // ───────── ГРУЗОВИКИ И СПЕЦТЕХНИКА ─────────
    trucks: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            { 
              key: 'tech_type', 
              label: 'Тип техники', 
              type: 'select', 
              placeholder: 'Введите или выберите тип техники',
              options: [
                'Грузовики', 'Седельные тягачи', 'Полуприцепы', 
                'Лёгкий коммерческий транспорт', 'Автобусы', 
                'Экскаваторы', 'Погрузчики', 'Экскаваторы-погрузчики', 
                'Автокраны', 'Автобетоносмесители', 'Дорожные катки', 
                'Тракторы', 'Мини-тракторы', 'Пресс-подборщики', 
                'Бороны', 'Косилки', 'Комбайны', 'Вилочные погрузчики', 
                'Штабелёры', 'Коммунальная техника', 'Ассенизаторы', 
                'Мусоровозы', 'Автогрейдеры', 'Автовышки', 'Другое'
              ]
            },
            { 
              key: 'brand', 
              label: 'Марка', 
              type: 'select', 
              placeholder: 'Введите или выберите марку',
              options: ['Hyundai', 'HHI', 'JCB', 'Kato', 'Komatsu', 'Kubota', 'Rippa', 'Terex', 'Другая']
            },
            { 
              key: 'year', 
              label: 'Год выпуска', 
              type: 'number', 
              suffix: 'г.' 
            },
            { 
              key: 'condition', 
              label: 'Состояние', 
              type: 'chips', 
              options: ['На ходу', 'Не на ходу'], 
              gridClass: 'chips-2' 
            },
            { 
              key: 'pts_owners', 
              label: 'Владельцев по ПТС или ПСМ', 
              type: 'select', 
              placeholder: 'Введите или выберите кол-во владельцев',
              options: ['1', '2', '3+', 'Не важно']
            },
            { 
              key: 'mileage', 
              label: 'Пробег', 
              type: 'number', 
              suffix: 'мт.ч.' 
            },
            { 
              key: 'engine_type', 
              label: 'Тип двигателя', 
              type: 'select', 
              placeholder: 'Выберите тип двигателя', 
              options: ['Дизель', 'Бензин', 'Электро', 'Гибрид'] 
            },
            { 
              key: 'drive', 
              label: 'Привод', 
              type: 'chips', 
              options: ['Передний', 'Задний', 'Полный'], 
              gridClass: 'chips-3' 
            },
            { 
              key: 'engine_volume', 
              label: 'Объём двигателя', 
              type: 'number', 
              suffix: 'л.' 
            },
            { 
              key: 'power', 
              label: 'Мощность', 
              type: 'number', 
              suffix: 'кВт.' 
            }
          ]
        }
      ]
    },

    // ───────── ЗАПЧАСТИ ─────────
    parts: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            { 
              key: 'category', 
              label: 'Категория', 
              type: 'select', 
              required: true,
              placeholder: 'Выберите категорию',
              options: ['Для легковых', 'Для грузовых', 'Для мото', 'Для спецтехники', 'Универсальные']
            },
            { 
              key: 'brand', 
              label: 'Марка', 
              type: 'select',
              placeholder: 'Введите или выберите марку',
              options: carBrands
            },
            { 
              key: 'condition', 
              label: 'Состояние', 
              type: 'chips', 
              options: ['Новое', 'Б/у'], 
              gridClass: 'chips-2' 
            },
            { 
              key: 'price', 
              label: 'Цена', 
              type: 'number', 
              required: true, 
              suffix: '₽' 
            }
          ]
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════
  // НЕДВИЖИМОСТЬ — структура по slug из categories.js
  // ═══════════════════════════════════════════════════════════
  nedvizhimost: {
    // ───────── КВАРТИРЫ: КУПИТЬ ─────────
    apartments: {
      buy: {
        sections: [
          {
            title: 'Основная информация',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { 
                key: 'subcategory', 
                label: 'Тип недвижимости', 
                type: 'select', 
                required: true,
                options: ['Квартира', 'Комната', 'Доля']
              },
              { 
                key: 'rooms', 
                label: 'Количество комнат', 
                type: 'select', 
                required: true,
                options: ['1', '2', '3', '4+']
              },
              { 
                key: 'price', 
                label: 'Цена', 
                type: 'number', 
                required: true,
                suffix: '₽'
              },
              { 
                key: 'payment_form', 
                label: 'Форма оплаты', 
                type: 'select', 
                options: ['Ипотека', 'Наличные', 'Мат. капитал']
              },
              { 
                key: 'balcony', 
                label: 'Балкон/Лоджия', 
                type: 'select', 
                options: ['Есть', 'Нет']
              },
              { 
                key: 'area', 
                label: 'Площадь', 
                type: 'number', 
                suffix: 'м²'
              },
              { 
                key: 'house_type', 
                label: 'Тип дома', 
                type: 'select', 
                options: ['Кирпичный', 'Панельный', 'Монолитный']
              }
            ]
          },
          {
            title: 'Дополнительно',
            fields: [
              { 
                key: 'elevator', 
                label: 'Лифт', 
                type: 'select', 
                options: ['Пассажирский', 'Грузовой', 'Нет']
              },
              { 
                key: 'parking', 
                label: 'Парковка', 
                type: 'select', 
                options: ['Во дворе', 'Подземная', 'Шлагбаум']
              },
              { 
                key: 'infrastructure', 
                label: 'Инфраструктура', 
                type: 'chips', 
                options: ['Детская площадка', 'Видеонаблюдение', 'Спортивная площадка', 'Наличие охраны'],
                gridClass: 'chips-4'
              },
              { 
                key: 'documents', 
                label: 'Документы', 
                type: 'chips', 
                options: ['Свидетельство о собственности', 'Отсутствие обременений'],
                gridClass: 'chips-2'
              }
            ]
          }
        ]
      },

      // ───────── КВАРТИРЫ: СНЯТЬ ─────────
      rent: {
        sections: [
          {
            title: 'Основная информация',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { 
                key: 'subcategory', 
                label: 'Тип недвижимости', 
                type: 'select', 
                required: true,
                options: ['Квартира', 'Комната', 'Доля']
              },
              { 
                key: 'rooms', 
                label: 'Количество комнат', 
                type: 'select', 
                required: true,
                options: ['1', '2', '3', '4+']
              },
              { 
                key: 'price', 
                label: 'Арендная плата', 
                type: 'number', 
                required: true,
                suffix: '₽/мес.'
              },
              { 
                key: 'payment_form', 
                label: 'Форма оплаты', 
                type: 'select', 
                options: ['Наличные', 'Безналичные']
              },
              { 
                key: 'balcony', 
                label: 'Балкон/Лоджия', 
                type: 'select', 
                options: ['Есть', 'Нет']
              },
              { 
                key: 'area', 
                label: 'Площадь', 
                type: 'number', 
                suffix: 'м²'
              },
              { 
                key: 'house_type', 
                label: 'Тип дома', 
                type: 'select', 
                options: ['Кирпичный', 'Панельный', 'Монолитный']
              }
            ]
          },
          {
            title: 'Дополнительно',
            fields: [
              { 
                key: 'elevator', 
                label: 'Лифт', 
                type: 'select', 
                options: ['Пассажирский', 'Грузовой', 'Нет']
              },
              { 
                key: 'parking', 
                label: 'Парковка', 
                type: 'select', 
                options: ['Во дворе', 'Подземная', 'Шлагбаум']
              },
              { 
                key: 'infrastructure', 
                label: 'Инфраструктура', 
                type: 'chips', 
                options: ['Детская площадка', 'Видеонаблюдение', 'Спортивная площадка', 'Наличие охраны'],
                gridClass: 'chips-4'
              },
              { 
                key: 'documents', 
                label: 'Документы', 
                type: 'chips', 
                options: ['Договор аренды', 'Отсутствие обременений'],
                gridClass: 'chips-2'
              }
            ]
          }
        ]
      }
    },

    // ───────── ЗАГОРОД И УЧАСТКИ ─────────
    houses: {
      // Участок
      uchastok: {
        sections: [
          {
            title: 'Характеристики участка',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { 
                key: 'land_purpose', 
                label: 'Назначение земли', 
                type: 'chips', 
                options: landPurposes, 
                gridClass: 'chips-4' 
              },
              { 
                key: 'area', 
                label: 'Площадь', 
                type: 'number-with-unit', 
                unitOptions: ['Соток'] 
              },
              { 
                key: 'status', 
                label: 'Состояние', 
                type: 'chips', 
                options: ['Свободный участок', 'Строение под ключ', 'Требуется ремонт'], 
                gridClass: 'chips-3' 
              },
              { 
                key: 'communications', 
                label: 'Коммуникации', 
                type: 'chips', 
                options: communications, 
                gridClass: 'chips-5' 
              },
              { 
                key: 'road', 
                label: 'Подъездная дорога', 
                type: 'chips', 
                options: ['Есть', 'Нет'], 
                gridClass: 'chips-2' 
              },
              { 
                key: 'distance_to_metro', 
                label: 'Расстояние до метро/остановок', 
                type: 'text', 
                placeholder: 'В минутах пешком' 
              },
              { 
                key: 'infrastructure_nearby', 
                label: 'Школы, детские сады, магазины', 
                type: 'chips', 
                options: ['Есть', 'Нет'], 
                gridClass: 'chips-2' 
              },
              { 
                key: 'documents', 
                label: 'Документы', 
                type: 'chips', 
                options: ['Кадастр', 'Межевание', 'Собственность', 'Ипотека'], 
                gridClass: 'chips-4' 
              },
              { 
                key: 'additional', 
                label: 'Дополнительно', 
                type: 'chips', 
                options: ['Огорожен забором', 'Есть плодовые деревья', 'Пруд'], 
                gridClass: 'chips-3' 
              }
            ]
          }
        ]
      },

      // Дом
      dom: {
        sections: [
          {
            title: 'Характеристики дома',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { 
                key: 'land_area', 
                label: 'Площадь участка', 
                type: 'number-with-unit', 
                unitOptions: ['Соток'] 
              },
              { 
                key: 'house_area', 
                label: 'Площадь дома', 
                type: 'number-with-unit', 
                unitOptions: ['м²'] 
              },
              { 
                key: 'rooms', 
                label: 'Кол-во комнат', 
                type: 'number' 
              },
              { 
                key: 'bathrooms', 
                label: 'Кол-во санузлов', 
                type: 'number' 
              },
              { 
                key: 'floors', 
                label: 'Кол-во этажей', 
                type: 'number' 
              },
              { 
                key: 'mansard', 
                label: 'Мансарда', 
                type: 'chips', 
                options: ['Есть', 'Нет'], 
                gridClass: 'chips-2' 
              },
              { 
                key: 'year_built', 
                label: 'Год постройки', 
                type: 'number', 
                suffix: 'г.' 
              },
              { 
                key: 'status', 
                label: 'Состояние', 
                type: 'chips', 
                options: houseStates, 
                gridClass: 'chips-3' 
              },
              { 
                key: 'wall_material', 
                label: 'Материал стен', 
                type: 'chips', 
                options: houseMaterials, 
                gridClass: 'chips-4' 
              },
              { 
                key: 'communications', 
                label: 'Коммуникации', 
                type: 'chips', 
                options: communications, 
                gridClass: 'chips-5' 
              }
            ]
          }
        ]
      },

      // ───────── Строки-ссылки: те же поля, что и "Дом" ─────────
      kottedzh: 'dom',
      dacha: 'dom',
      townhouse: 'dom'
    },

    // ───────── КОММЕРЧЕСКАЯ НЕДВИЖИМОСТЬ ─────────
    commercial: {
      office: {
        sections: [
          {
            title: 'Характеристики',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { key: 'area', label: 'Площадь', type: 'number', suffix: 'м²' },
              { key: 'floors', label: 'Кол-во этажей', type: 'number' },
              { key: 'ceiling_height', label: 'Высота потолков', type: 'number', suffix: 'м' },
              { key: 'status', label: 'Состояние', type: 'chips', options: ['Под ключ', 'Нужен ремонт'], gridClass: 'chips-2' },
              { key: 'parking', label: 'Парковка', type: 'chips', options: ['Места на улице', 'В здании'], gridClass: 'chips-2' },
              { key: 'communications', label: 'Коммуникации', type: 'chips', options: ['Электричество', 'Вентиляция', 'Кондиционер', 'Интернет', 'Охрана', 'Лифт', 'Отсутствуют'], gridClass: 'chips-4' },
              { key: 'deal_type', label: 'Тип сделки', type: 'chips', options: ['Аренда', 'Субаренда', 'Продажа'], gridClass: 'chips-3' }
            ]
          }
        ]
      },

      retail: {
        sections: [
          {
            title: 'Характеристики',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { key: 'area', label: 'Площадь', type: 'number', suffix: 'м²' },
              { key: 'floors', label: 'Кол-во этажей', type: 'number' },
              { key: 'ceiling_height', label: 'Высота потолков', type: 'number', suffix: 'м' },
              { key: 'status', label: 'Состояние', type: 'chips', options: ['Под ключ', 'Нужен ремонт'], gridClass: 'chips-2' },
              { key: 'parking', label: 'Парковка', type: 'chips', options: ['Места на улице', 'В здании'], gridClass: 'chips-2' },
              { key: 'communications', label: 'Коммуникации', type: 'chips', options: ['Электричество', 'Вентиляция', 'Кондиционер', 'Интернет', 'Охрана', 'Лифт', 'Отсутствуют'], gridClass: 'chips-4' },
              { key: 'deal_type', label: 'Тип сделки', type: 'chips', options: ['Аренда', 'Субаренда', 'Продажа'], gridClass: 'chips-3' }
            ]
          }
        ]
      },

      warehouse: {
        sections: [
          {
            title: 'Характеристики',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { key: 'warehouse_type', label: 'Тип склада', type: 'chips', options: ['Сухой', 'Холодильный', 'Открытая площадка'], gridClass: 'chips-3' },
              { key: 'area', label: 'Площадь', type: 'number', suffix: 'м²' },
              { key: 'floor', label: 'Этаж', type: 'number' },
              { key: 'ceiling_height', label: 'Высота потолков', type: 'number', suffix: 'м' },
              { key: 'communications', label: 'Коммуникации', type: 'chips', options: ['Электричество', 'Вентиляция', 'Кондиционер', 'Интернет', 'Охрана', 'Лифт', 'Отсутствуют'], gridClass: 'chips-4' },
              { key: 'deal_type', label: 'Тип сделки', type: 'chips', options: ['Аренда', 'Субаренда', 'Продажа'], gridClass: 'chips-3' }
            ]
          }
        ]
      },

      factory: {
        sections: [
          {
            title: 'Характеристики',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { key: 'area', label: 'Площадь', type: 'number', suffix: 'м²' },
              { key: 'ceiling_height', label: 'Высота потолков', type: 'number', suffix: 'м' },
              { key: 'power_capacity', label: 'Электромощность', type: 'number', suffix: 'кВт' },
              { key: 'voltage', label: 'Напряжение', type: 'chips', options: ['220В', '380В'], gridClass: 'chips-2' },
              { key: 'transformer', label: 'Трансформаторная подстанция', type: 'chips', options: ['Есть', 'Нету'], gridClass: 'chips-2' },
              { key: 'communications', label: 'Коммуникации', type: 'chips', options: ['Электричество', 'Вентиляция', 'Кондиционер', 'Интернет', 'Охрана', 'Лифт', 'Парковка', 'Отсутствуют'], gridClass: 'chips-4' },
              { key: 'equipment_list', label: 'Список оборудования', type: 'dynamic-list', placeholder: 'Введите название оборудования', hint: '(не обязательно)' },
              { key: 'truck_access', label: 'Подъезд пути для грузового транспорта', type: 'chips', options: ['Есть', 'Нет'], gridClass: 'chips-2' },
              { key: 'deal_type', label: 'Тип сделки', type: 'chips', options: ['Аренда', 'Субаренда', 'Продажа'], gridClass: 'chips-3' }
            ]
          }
        ]
      },

      free: {
        sections: [
          {
            title: 'Характеристики',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { key: 'purpose', label: 'Назначение помещения', type: 'chips', options: ['Офис', 'Магазин', 'Производство легкое', 'Свободное'], gridClass: 'chips-4' },
              { key: 'area', label: 'Площадь', type: 'number', suffix: 'м²' },
              { key: 'floor', label: 'Этаж', type: 'number' },
              { key: 'status', label: 'Состояние', type: 'chips', options: ['Под ключ', 'Нужен ремонт'], gridClass: 'chips-2' },
              { key: 'ceiling_height', label: 'Высота потолков', type: 'number', suffix: 'м' },
              { key: 'communications', label: 'Коммуникации', type: 'chips', options: ['Электричество', 'Вентиляция', 'Кондиционер', 'Интернет', 'Охрана', 'Лифт', 'Отсутствуют'], gridClass: 'chips-4' },
              { key: 'deal_type', label: 'Тип сделки', type: 'chips', options: ['Аренда', 'Субаренда', 'Продажа'], gridClass: 'chips-3' }
            ]
          }
        ]
      }
    },

    // ───────── ГАРАЖИ И ПАРКИНГ ─────────
    parking: {
      garage: {
        sections: [
          {
            title: 'Характеристики',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { key: 'area', label: 'Площадь', type: 'number', suffix: 'м²' },
              { key: 'material', label: 'Материал', type: 'chips', options: ['Металл', 'Кирпич', 'Бетон', 'ЖБИ'], gridClass: 'chips-4' },
              { key: 'ceiling_height', label: 'Высота потолков', type: 'number', suffix: 'м' },
              { key: 'communications', label: 'Коммуникации', type: 'chips', options: ['Электричество', 'Вода', 'Отопление', 'Освещение', 'Охрана'], gridClass: 'chips-5' },
              { key: 'deal_type', label: 'Тип сделки', type: 'chips', options: ['Аренда', 'Продажа'], gridClass: 'chips-2' },
              { key: 'car_capacity', label: 'Кол-во машиномест', type: 'chips', options: ['Один', 'Два', 'Три и более'], gridClass: 'chips-3' }
            ]
          }
        ]
      },

      parking_place: {
        sections: [
          {
            title: 'Характеристики',
            fields: [
              { 
                key: 'title', 
                label: 'Название объявления', 
                type: 'text', 
                required: true, 
                placeholder: 'Введите название объявления',
                bindToTitle: true
              },
              { key: 'area', label: 'Площадь', type: 'number', suffix: 'м²' },
              { key: 'parking_type', label: 'Тип паркинга', type: 'chips', options: ['Открытый', 'Подземный', 'Крытый'], gridClass: 'chips-3' },
              { key: 'ceiling_height', label: 'Высота потолков', type: 'number', suffix: 'м' },
              { key: 'car_capacity', label: 'Кол-во машиномест', type: 'number' },
              { key: 'communications', label: 'Коммуникации', type: 'chips', options: ['Охрана', 'Отопление', 'Освещение'], gridClass: 'chips-3' },
              { key: 'deal_type', label: 'Тип сделки', type: 'chips', options: ['Аренда', 'Продажа'], gridClass: 'chips-2' }
            ]
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════
  // РАБОТА
  // ═══════════════════════════════════════════════════════════
  rabota: {
    // ───────── РЕЗЮМЕ ─────────
    resume: {
      sections: [
        {
          title: 'Описание',
          fields: [
            { 
              key: 'desired_position', 
              label: 'Кем вы хотите работать?', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название должности',
              bindToTitle: true
            },
            { 
              key: 'profession', 
              label: 'Профессия', 
              type: 'select', 
              required: true,
              placeholder: 'Введите название профессии',
              options: professions,
              searchable: true
            },
            { 
              key: 'activity_sphere', 
              label: 'Сфера деятельности', 
              type: 'select', 
              required: true,
              placeholder: 'Введите сферу деятельности',
              options: activitySpheres
            },
            { 
              key: 'experience', 
              label: 'Опыт работы', 
              type: 'number-with-unit',
              unitOptions: ['мес.', 'лет']
            }
          ]
        },
        {
          title: 'Персональные данные',
          fields: [
            { key: 'last_name', label: 'Фамилия', type: 'text', placeholder: 'Фамилия' },
            { key: 'first_name', label: 'Имя', type: 'text', placeholder: 'Имя' },
            { key: 'middle_name', label: 'Отчество', type: 'text', placeholder: 'Отчество, если имеется' }
          ]
        },
        {
          title: null,
          fields: [
            { 
              key: 'gender', 
              label: 'Пол', 
              type: 'chips', 
              options: genders,
              gridClass: 'chips-2'
            },
            { 
              key: 'age', 
              label: 'Ваш возраст', 
              type: 'number',
              placeholder: '0'
            }
          ]
        },
        {
          title: null,
          fields: [
            { 
              key: 'salary', 
              label: 'Желаемая заработная плата', 
              type: 'price-with-unit',
              unitOptions: salaryUnits
            }
          ]
        },
        {
          title: null,
          fields: [
            { 
              key: 'employee_description', 
              label: 'Описание работника', 
              type: 'textarea', 
              placeholder: 'Напишите что-нибудь о работнике'
            }
          ]
        },
        {
          title: null,
          fields: [
            { 
              key: 'advantages', 
              label: 'Ваши преимущества', 
              type: 'textarea', 
              placeholder: 'Напишите, почему работодатели должны выбрать именно вас'
            }
          ]
        },
        {
          title: 'График работы',
          fields: [
            { 
              key: 'employment_type', 
              label: 'Занятость', 
              type: 'chips', 
              options: employmentTypes,
              gridClass: 'chips-4'
            },
            { 
              key: 'work_format', 
              label: 'Формат работы', 
              type: 'chips', 
              options: workFormats,
              gridClass: 'chips-3'
            }
          ]
        }
      ]
    },

    // ───────── ВАКАНСИЯ ─────────
    jobs: {
      sections: [
        {
          title: 'Описание',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            { 
              key: 'profession', 
              label: 'Профессия', 
              type: 'select', 
              required: true,
              placeholder: 'Введите название профессии',
              options: professions,
              searchable: true
            },
            { 
              key: 'activity_sphere', 
              label: 'Сфера деятельности', 
              type: 'select', 
              required: true,
              placeholder: 'Введите сферу деятельности',
              options: activitySpheres
            },
            { 
              key: 'salary', 
              label: 'Заработная плата', 
              type: 'price-with-unit',
              unitOptions: salaryUnits
            },
            { 
              key: 'experience_required', 
              label: 'Опыт работы', 
              type: 'number-with-unit',
              unitOptions: ['мес.', 'лет']
            }
          ]
        },
        {
          title: null,
          fields: [
            { 
              key: 'employer_description', 
              label: 'Описание работодателя', 
              type: 'textarea', 
              placeholder: 'Напишите что-нибудь о работодателе'
            }
          ]
        },
        {
          title: 'График работы',
          fields: [
            { 
              key: 'employment_type', 
              label: 'Занятость', 
              type: 'chips', 
              options: employmentTypes,
              gridClass: 'chips-4'
            },
            { 
              key: 'work_format', 
              label: 'Формат работы', 
              type: 'chips', 
              options: workFormats,
              gridClass: 'chips-3'
            }
          ]
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════
  // ЖИВОТНЫЕ — subSubCategory (вид животного) отправляется в API
  // ═══════════════════════════════════════════════════════════
  animals: {
    // Питомцы — убраны дубли: category и animal_type
    pets: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            // УБРАНО: category — уже определено через form.subCategory
            // УБРАНО: animal_type — уже определено через form.subSubCategory (dogs, cats...)
            { 
              key: 'breed', 
              label: 'Порода', 
              type: 'text', 
              placeholder: 'Введите название породы'
            },
            { 
              key: 'nickname', 
              label: 'Кличка', 
              type: 'text', 
              placeholder: 'Введите кличку'
            },
            { 
              key: 'gender', 
              label: 'Пол', 
              type: 'chips', 
              options: genders,
              gridClass: 'chips-2'
            },
            { 
              key: 'color', 
              label: 'Окрас', 
              type: 'text', 
              placeholder: 'Введите название окраса'
            },
            { 
              key: 'age', 
              label: 'Возраст', 
              type: 'number',
              placeholder: '0'
            }
          ]
        }
      ]
    },

    // Товары для животных
    pet_products: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            { 
              key: 'subcategory', 
              label: 'Подкатегория', 
              type: 'select', 
              required: true,
              options: ['Корма и лакомства', 'Клетки, переноски, вольеры', 'Аквариумы и террариумы', 'Одежда и амуниция', 'Ветеринарные препараты']
            },
            { 
              key: 'animal_category', 
              label: 'Для каких животных', 
              type: 'select',
              options: ['Для собак', 'Для кошек', 'Для птиц', 'Для грызунов', 'Универсальное']
            },
            { 
              key: 'food_type', 
              label: 'Тип корма', 
              type: 'select',
              options: ['Влажный корм', 'Сухой корм', 'Натуральный', 'Лакомства'],
              // Показываем только если subSubCategory === 'pet_food'
              // На фронте можно через v-if на основе form.subSubCategory
            }
          ]
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════
  // БИЗНЕС И ОБОРУДОВАНИЕ
  // ═══════════════════════════════════════════════════════════
  biznes: {
    ready_business: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            { 
              key: 'deal_goal', 
              label: 'Цель сделки', 
              type: 'chips', 
              options: ['В аренду', 'Продать', 'Найти партнёра'], 
              gridClass: 'chips-3' 
            },
            { 
              key: 'business_status', 
              label: 'Состояние бизнеса', 
              type: 'chips', 
              options: ['Прибыль', 'Убыток'], 
              gridClass: 'chips-2' 
            },
            { 
              key: 'payback_period', 
              label: 'Срок окупаемости', 
              type: 'text', 
              placeholder: 'Введите срок окупаемости' 
            },
            { 
              key: 'business_age', 
              label: 'Возраст бизнеса', 
              type: 'number', 
              placeholder: '0' 
            },
            { 
              key: 'legal_form', 
              label: 'Организационно-правовая форма', 
              type: 'chips', 
              options: ['ИП', 'ООО', 'АО', 'Другое'], 
              gridClass: 'chips-4' 
            }
          ]
        }
      ]
    },
    equipment: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            { 
              key: 'subcategory', 
              label: 'Тип оборудования', 
              type: 'select', 
              required: true, 
              placeholder: 'Выберите тип оборудования',
              dynamic: true
            },
            { 
              key: 'price', 
              label: 'Цена', 
              type: 'number', 
              required: true, 
              suffix: '₽' 
            }
          ]
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════
  // ПУТЕШЕСТВИЯ
  // ═══════════════════════════════════════════════════════════
  travel: {
    tours: {
      sections: [
        {
          title: 'Основная информация',
          fields: [
            { 
              key: 'title', 
              label: 'Название объявления', 
              type: 'text', 
              required: true, 
              placeholder: 'Введите название объявления',
              bindToTitle: true
            },
            { 
              key: 'travel_catalog', 
              label: 'Каталог', 
              type: 'select', 
              required: true,
              placeholder: 'Выберите из списка',
              options: [
                'Туры и экскурсии', 'Авиабилеты', 'Ж/Д и автобусные билеты',
                'Отели и жильё', 'Прокат транспорта', 'Визы и документы',
                'Трансферы и такси', 'Круизы', 'Экстрим и приключения',
                'Путеводители и гиды'
              ]
            },
            { 
              key: 'description', 
              label: 'Описание', 
              type: 'textarea', 
              required: true,
              placeholder: 'Напишите что-нибудь про путешествие'
            },
            { 
              key: 'price', 
              label: 'Цена', 
              type: 'number', 
              required: true,
              suffix: '₽'
            }
          ]
        }
      ]
    }
  }
};

// ═══════════════════════════════════════════════════════════
// ХЕЛПЕРЫ (обновлённые)
// ═══════════════════════════════════════════════════════════

/**
 * Получить конфиг для категории
 * Поддерживает строки-ссылки: если config === 'dom', резолвит как dom
 */
export function getAdConfig(mainCategory, subCategory, subSubCategory = null) {
  const catConfig = adCreateConfig[mainCategory];
  if (!catConfig) return null;

  // Для третьего уровня (water → yachts, nedvizhimost → houses → dom)
  if (subSubCategory && catConfig[subCategory]?.[subSubCategory]) {
    let config = catConfig[subCategory][subSubCategory];
    
    // Резолвим строки-ссылки (kottedzh: 'dom' → конфиг dom)
    if (typeof config === 'string') {
      config = catConfig[subCategory][config];
    }
    
    return config || null;
  }

  // Для второго уровня
  if (subCategory && catConfig[subCategory]) {
    return catConfig[subCategory];
  }

  // Дефолтный конфиг
  return catConfig.default || null;
}

/**
 * Получить секции из конфига
 * Упрощено: больше нет objectTypeSelector
 */
export function getSections(config) {
  if (!config) return [];
  return config.sections || [];
}

/**
 * Получить все доступные типы объектов
 * (устарело, оставлено для совместимости)
 */
export function getObjectTypeSelector(config) {
  return config?.objectTypeSelector || null;
}

export function getObjectTypes(config) {
  return config?.objectTypeSelector?.options || [];
}
