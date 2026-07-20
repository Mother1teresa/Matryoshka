import {
  carBrands, bodyTypes, transmissions, engines, colors,
  landPurposes, houseMaterials, houseStates, dealTypes, communications,
  genders, employmentTypes, workFormats,
  activitySpheres, professions
} from '/src/data/sharedFieldOptions.js'

export const productFields = {
  tovary: {
    default: {
      main: [
        { key: "subcategory", label: "Категория", type: "select", options: ['Женская одежда','Женская обувь','Мужская одежда','Мужская обувь','Сумки','Аксессуары','Двери','Инструменты','Камины','Потолки','Окна','Косметика','Парфюм','Массажеры','Мед техника'] },
        { key: "priceFrom", label: "Цена: от", type: "number" },
        { key: "priceTo", label: "Цена: до", type: "number" }
      ],
      extra: []
    }
  },

  rabota: {
    jobs: {
      main: [
        { key: "subcategory", label: "Сфера деятельности", type: "select", options: activitySpheres },
        { key: "profession", label: "Профессия", type: "select", options: professions },
        { key: "experience", label: "Опыт работы", type: "select", options: ['Без опыта', 'От 1 года', 'От 3 лет', 'От 5 лет'] },
      ],
      extra: [
        { key: "employment", label: "Занятость", type: "chips", options: employmentTypes },
        { key: "workFormat", label: "Формат работы", type: "chips", options: workFormats },
      ]
    },
    resume: {
      main: [
        { key: "subcategory", label: "Сфера деятельности", type: "select", options: activitySpheres },
        { key: "profession", label: "Профессия", type: "select", options: professions },
        { key: "gender", label: "Пол", type: "select", options: genders },
        { key: "experience", label: "Опыт работы", type: "select", options: ['Без опыта', 'От 1 года', 'От 3 лет', 'От 5 лет'] },
      ],
      extra: [
        { key: "employment", label: "Желаемая занятость", type: "chips", options: ['Полная', 'Частичная', 'Проектная'] },
        { key: "workFormat", label: "График", type: "chips", options: ['Удалёнка', 'Полный день', 'Сменный'] },
      ]
    }
  },

  nedvizhimost: {
    apartments: {
      buy: {
        extraClass: 'grid-realty-buy',
        main: [
          { key: "subcategory", label: "Тип недвижимости", type: "select", options: ["Квартира", "Комната", "Доля"] },
          { key: "rooms", label: "Количество комнат", type: "select", options: ["1", "2", "3", "4+"] },
          { key: "priceFrom", label: "Цена: от", type: "number" },
          { key: "priceTo", label: "Цена: до", type: "number" },
          { key: "paymentType", label: "Форма оплаты", type: "select", options: ["Ипотека", "Наличные", "Мат. капитал"] },
          { key: "hasBalcony", label: "Балкон/Лоджия", type: "select", options: ["Есть", "Нет"] },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
          { key: "propertyType", label: "Тип дома", type: "select", options: ["Кирпичный", "Панельный", "Монолитный"] },
        ],
        extra: [
          { key: "hasElevator", label: "Лифт", type: "select", options: ["Пассажирский", "Грузовой", "Нет"] },
          { key: "hasParking", label: "Парковка", type: "select", options: ["Во дворе", "Подземная", "Шлагбаум"] },
          { key: "infrastructure", label: "Инфраструктура", type: "chips", options: ["Детская площадка", "Видеонаблюдение", "Спортивная площадка", "Наличие охраны"] },
          { key: "hasDocuments", label: "Документы", type: "chips", options: ["Свидетельство о собственности", "Отсутствие обременений"] }
        ]
      },
      rent: {
        extraClass: 'grid-realty-rent',
        main: [
          { key: "subcategory", label: "Тип недвижимости", type: "select", options: ["Квартира", "Комната", "Доля"] },
          { key: "rooms", label: "Количество комнат", type: "select", options: ["1", "2", "3", "4+"] },
          { key: "priceFrom", label: "Аренда: от", type: "number" },
          { key: "priceTo", label: "Аренда: до", type: "number" },
          { key: "paymentType", label: "Форма оплаты", type: "select", options: ["Наличные", "Безналичные"] },
          { key: "hasBalcony", label: "Балкон/Лоджия", type: "select", options: ["Есть", "Нет"] },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
          { key: "propertyType", label: "Тип дома", type: "select", options: ["Кирпичный", "Панельный", "Монолитный"] },
        ],
        extra: [
          { key: "hasElevator", label: "Лифт", type: "select", options: ["Пассажирский", "Грузовой", "Нет"] },
          { key: "hasParking", label: "Парковка", type: "select", options: ["Во дворе", "Подземная", "Шлагбаум"] },
          { key: "infrastructure", label: "Инфраструктура", type: "chips", options: ["Детская площадка", "Видеонаблюдение", "Спортивная площадка", "Наличие охраны"] },
          { key: "hasDocuments", label: "Документы", type: "chips", options: ["Договор аренды", "Отсутствие обременений"] }
        ]
      }
    },

    houses: {
      uchastok: {
        extraClass: 'grid-realty-land',
        main: [
          { key: "land_purpose", label: "Назначение земли", type: "select", options: landPurposes },
          { key: "houseState", label: "Состояние участка", type: "select", options: ["Чистый", "Застроен", "Запущен"] },
          { key: "paymentType", label: "Тип сделки", type: "select", options: dealTypes },
          { key: "priceFrom", label: "Цена от", type: "number" },
          { key: "priceTo", label: "Цена до", type: "number" },
          { key: "hasDocuments", label: "Документы", type: "select", options: ["Собственность", "Аренда", "Наследство"] },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
        ],
        extra: [
          { key: "communications", label: "Коммуникации", type: "chips", options: communications },
          { key: "additional", label: "Дополнительно", type: "chips", options: ["Кадастр", "Межевание", "Собственник", "Возможность ипотеки"] }
        ]
      },
      dom: {
        extraClass: 'grid-realty-home',
        main: [
          { key: "propertyType", label: "Материал стен", type: "select", options: houseMaterials },
          { key: "houseState", label: "Состояние", type: "select", options: houseStates },
          { key: "paymentType", label: "Тип сделки", type: "select", options: dealTypes },
          { key: "priceFrom", label: "Цена от", type: "number" },
          { key: "priceTo", label: "Цена до", type: "number" },
          { key: "mansard", label: "Мансарда", type: "select", options: ["Есть", "Нет"] }
        ],
        extra: [
          { key: "communications", label: "Коммуникации", type: "chips", options: communications },
          { key: "totalAreaFrom", titlelabel: "Участок", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", titlelabel: "Участок", label: "Площадь до", type: "number" },
          { key: "livingAreaFrom", titlelabel: "Дом", label: "Площадь от", type: "number" },
          { key: "livingAreaTo", titlelabel: "Дом", label: "Площадь до", type: "number" },
          { key: "floorsInHouse", label: "Кол-во санузлов", type: "select", options: ["1","2","3","4+"] },
          { key: "rooms", label: "Кол-во комнат", type: "select", options: ["1","2","3","4+"] },
          { key: "apartmentFloor", label: "Кол-во этажей", type: "select", options: ["1","2","3","4+"] }
        ]
      },
      kottedzh: 'dom',
      dacha: 'dom',
      townhouse: 'dom'
    },

    commercial: {
      office: {
        extraClass: 'grid-comm-office',
        main: [
          { key: "houseState", label: "Состояние офиса", type: "select", options: houseStates },
          { key: "priceFrom", label: "Цена: от", type: "number" },
          { key: "priceTo", label: "Цена: до", type: "number" },
          { key: "paymentType", label: "Тип сделки", type: "select", options: dealTypes },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
          { key: "floorsInHouse", label: "Кол-во этажей", type: "select", options: ["1","2","3","4+","5+"] },
        ],
        extra: [
          { key: "communications", label: "Коммуникации", type: "chips", options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"], gridClass: "comm-grid" },
          { key: "hasParking", label: "Парковка", type: "chips", options: ["Места на улице", "В здании"] },
        ]
      },
      retail: {
        extraClass: 'grid-comm-retail',
        main: [
          { key: "houseState", label: "Состояние", type: "select", options: houseStates },
          { key: "priceFrom", label: "Цена: от", type: "number" },
          { key: "priceTo", label: "Цена: до", type: "number" },
          { key: "paymentType", label: "Тип сделки", type: "select", options: dealTypes },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
          { key: "floorsInHouse", label: "Кол-во этажей", type: "select", options: ["1","2","3","4+","5+"] },
          { key: "heightFrom", label: "Высота потолков от", type: "number" },
          { key: "heightTo", label: "Высота потолков до", type: "number" },
        ],
        extra: [
          { key: "communications", label: "Коммуникации", type: "chips", options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"], gridClass: "comm-grid" },
          { key: "hasParking", label: "Парковка", type: "chips", options: ["Места на улице", "В здании"] },
        ]
      },
      warehouse: {
        extraClass: 'grid-comm-warehouse',
        main: [
          { key: "houseState", label: "Состояние помещения", type: "select", options: houseStates },
          { key: "priceFrom", label: "Цена: от", type: "number" },
          { key: "priceTo", label: "Цена: до", type: "number" },
          { key: "paymentType", label: "Тип сделки", type: "select", options: dealTypes },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
          { key: "apartmentFloor", label: "Этаж", type: "select", options: ["1","2","3","4+","5+"] },
          { key: "heightFrom", label: "Высота потолков от", type: "number" },
          { key: "heightTo", label: "Высота потолков до", type: "number" },
        ],
        extra: [
          { key: "communications", label: "Коммуникации", type: "chips", options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"], gridClass: "comm-grid" },
        ]
      },
      factory: {
        extraClass: 'grid-comm-factory',
        main: [
          { key: "houseState", label: "Состояние", type: "select", options: houseStates },
          { key: "priceFrom", label: "Цена: от", type: "number" },
          { key: "priceTo", label: "Цена: до", type: "number" },
          { key: "paymentType", label: "Тип сделки", type: "select", options: dealTypes },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
          { key: "floorsInHouse", label: "Кол-во этажей", type: "select", options: ["1","2","3","4+","5+"] },
          { key: "heightFrom", label: "Высота потолков от", type: "number" },
          { key: "heightTo", label: "Высота потолков до", type: "number" },
        ],
        extra: [
          { key: "communications", label: "Коммуникации", type: "chips", options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"], gridClass: "comm-grid" },
          { key: "voltage", label: "Напряжение", type: "chips", options: ["220 В", "380 В"], gridClass: "voltage-grid" },
          { key: "truck_access", label: "Подъезд для грузового транспорта", type: "chips", options: ["Есть", "Нет"], gridClass: "access-grid" },
        ]
      },
      free: {
        extraClass: 'grid-comm-free',
        main: [
          { key: "houseState", label: "Состояние", type: "select", options: houseStates },
          { key: "priceFrom", label: "Цена: от", type: "number" },
          { key: "priceTo", label: "Цена: до", type: "number" },
          { key: "paymentType", label: "Тип сделки", type: "select", options: dealTypes },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
          { key: "apartmentFloor", label: "Этаж", type: "select", options: ["1","2","3","4+","5+"] },
          { key: "heightFrom", label: "Высота потолков от", type: "number" },
          { key: "heightTo", label: "Высота потолков до", type: "number" },
        ],
        extra: [
          { key: "communications", label: "Коммуникации", type: "chips", options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"], gridClass: "comm-grid" },
          { key: "voltage", label: "Напряжение", type: "chips", options: ["220 В", "380 В"], gridClass: "voltage-grid" },
          { key: "truck_access", label: "Подъезд для грузового транспорта", type: "chips", options: ["Есть", "Нет"], gridClass: "access-grid" },
        ]
      }
    },

    parking: {
      garage: {
        extraClass: 'grid-parking',
        main: [
          { key: "propertyType", label: "Тип паркинга", type: "select", options: ["Гараж", "Машиноместо", "Бокс"] },
          { key: "priceFrom", label: "Цена от", type: "number" },
          { key: "priceTo", label: "Цена до", type: "number" },
          { key: "paymentType", label: "Тип сделки", type: "select", options: ["Купить", "Снять"] },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
          { key: "maxPassengers", label: "Кол-во машиномест", type: "select", options: ["1", "2", "3+"] },
          { key: "heightFrom", label: "Высота потолков от", type: "number" },
          { key: "heightTo", label: "Высота потолков до", type: "number" },
        ],
        extra: [
          { key: "communications", label: "Коммуникации", type: "chips", options: ["Охрана", "Отопление", "Освещение", "Видеонаблюдение", "Электричество", "Отсутствуют"] }
        ]
      },
      parking_place: {
        extraClass: 'grid-parking-open',
        main: [
          { key: "propertyType", label: "Тип паркинга", type: "select", options: ["Гараж", "Машиноместо", "Бокс"] },
          { key: "priceFrom", label: "Цена от", type: "number" },
          { key: "priceTo", label: "Цена до", type: "number" },
          { key: "paymentType", label: "Тип сделки", type: "select", options: ["Купить", "Снять"] },
          { key: "totalAreaFrom", label: "Площадь от", type: "number" },
          { key: "totalAreaTo", label: "Площадь до", type: "number" },
          { key: "maxPassengers", label: "Кол-во машиномест", type: "select", options: ["1", "2", "3+"] },
          { key: "heightFrom", label: "Высота потолков от", type: "number" },
          { key: "heightTo", label: "Высота потолков до", type: "number" },
        ],
        extra: [
          { key: "communications", label: "Коммуникации", type: "chips", options: ["Охрана", "Отопление", "Освещение", "Видеонаблюдение", "Электричество", "Отсутствуют"] }
        ]
      }
    }
  },

  uslugi: {
    all_services: {
      main: [
        { key: "subcategory", label: "Категория", type: "select", options: ['Ремонт техники','Уборка','Юридические услуги','Такси','Фотосъёмка','Дизайн','Грузоперевозки','Ремонт квартир','Клининг','Маникюр','Парикмахерские услуги','Педагоги','Уход за животными','Выгул собак','Аренда транспорта','IT-услуги','Психологическая помощь','Переводчик','PR-услуги','Реклама','Бухгалтерские','Видеосъёмка','Ремонт автомобилей','Дизайн интерьера','Ландшафтный дизайн','Организация праздников','Катеринг','Медицинские услуги','Строительство','Курьерские услуги','Ремонт обуви','Пошив одежды','Монтажные работы','Установка техники','Услуги сантехника','Услуги электрика','Бьюти-услуги','Фитнес-тренер'] },
        { key: "workExperience", label: "Опыт", type: "select", options: ['Без опыта','От 1 года','От 3 лет','От 5 лет','От 10 лет'] },
        { key: "priceFrom", label: "Цена: от", type: "number" },
        { key: "priceTo", label: "Цена: до", type: "number" }
      ],
      extra: []
    }
  },

  transport: {
    cars: {
      main: [
        { key: "brand", label: "Марка", type: "select", options: carBrands },
        { key: "model", label: "Модель", type: "select", options: [] },
        { key: "priceFrom", label: "Цена: от", type: "number" },
        { key: "priceTo", label: "Цена: до", type: "number" },
        { key: "yearOfManufactureFrom", label: "Год от", type: "number" },
        { key: "yearOfManufactureTo", label: "Год до", type: "number" },
        { key: "vehicleBodyType", label: "Кузов", type: "select", options: bodyTypes },
        { key: "vehicleKpp", label: "КПП", type: "select", options: transmissions },
        { key: "engineType", label: "Двигатель", type: "select", options: engines },
        { key: "mileageFrom", label: "Пробег от", type: "number" },
        { key: "mileageTo", label: "Пробег до", type: "number" },
      ],
      extra: [
        { key: "ownersPts", label: "Владельцев по ПТС", type: "chips", options: ['Один', 'До двух', 'До трёх', 'Не важно'] },
        { key: "condition", label: "Состояние", type: "chips", options: ['Все', 'Кроме битых', 'Битые'] },
        { key: "drive", label: "Привод", type: "chips", options: ['Передний', 'Задний', 'Полный'] },
        { key: "horsePowerFrom", titlelabel: "Мощность: от", label: "От", type: "number" },
        { key: "horsePowerTo", titlelabel: "Мощность: до", label: "До", type: "number" },
        { key: "engineCapacityFrom", titlelabel: "Объём двигателя: от", label: "От", type: "number" },
        { key: "engineCapacityTo", titlelabel: "Объём двигателя: до", label: "До", type: "number" },
        { key: "steeringWheel", label: "Руль", type: "chips", options: ['Не важно', 'Левый', 'Правый'] },
        { key: "color", label: "Цвет", type: "select", options: colors }
      ]
    },
    moto: {
      main: [
        { key: "country", label: "Страна производства", type: "select", options: ['Япония','Китай','Индия','Тайвань','Таиланд','Вьетнам','Германия','Австрия','Италия','Великобритания','Франция','Чехия','Россия','США','Мексика','Бразилия','Другое'] },
        { key: "vehicleBodyType", label: "Тип техники", type: "select", options: ['Дорожные','Туристические','Спортивные','Суперспортивные','Спорт-туризм','Naked','Стритфайтеры','Кроссовые','Эндуро','Мотард','Трюковые','Питбайки','Чоппер','Круизер','Дрэгстер','Трайк','Скутеры','Макроциклы'] },
        { key: "brand", label: "Марка", type: "select", options: ['Honda','Yamaha','Kawasaki','Suzuki','KTM','BMW Motorrad','Ducati','Triumph','Aprilia','Harley-Davidson','Polaris','Arctic Cat','Bajaj','BSE','Stels','Gaiakin','JHL MOTO','Sanhesh','Racer','Motoland','Другая'] },
        { key: "model", label: "Модель", type: "select", options: [] },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" },
        { key: "yearOfManufactureFrom", label: "Год выпуска: от", type: "number" },
        { key: "yearOfManufactureTo", label: "Год выпуска: до", type: "number" },
        { key: "mileageFrom", label: "Пробег: от", type: "number" },
        { key: "mileageTo", label: "Пробег: до", type: "number" }
      ],
      extra: [
        { key: "ownersPts", label: "Владельцев по ПТС", type: "chips", options: ["Один", "До двух", "До трёх", "Не важно"] },
        { key: "condition", label: "Состояние", type: "chips", options: ["Все", "Кроме битых", "Битые"] },
        { key: "vehicleKpp", label: "КПП", type: "select", options: transmissions },
        { key: "horsePowerFrom", label: "Мощность: от", type: "number" },
        { key: "horsePowerTo", label: "Мощность: до", type: "number" },
        { key: "engineType", label: "Тип двигателя", type: "select", options: ['Бензин','Дизель','Электро'] },
        { key: "cooling", label: "Охлаждение", type: "chips", options: ["Воздушное", "Жидкостное"] },
        { key: "color", label: "Цвет", type: "select", options: colors }
      ]
    },
    water: {
      yachts: {
        extraClass: 'grid-water-open',
        main: [
          { key: "country", label: "Страна производства", type: "select", options: ['Россия','США','Италия','Франция','Великобритания','Германия','Нидерланды','Турция','ОАЭ','Другое'] },
          { key: "brand", label: "Марка", type: "select", options: ['Azimut','Princess','Sunseeker','Ferretti','Pershing','Riva','Benetti','Lürssen','Amels','Oceanco','Heesen','Moonen','Feadship','Burger','Westport','Hargrave','Trinity','Codecasa','CRN','Mondomarine','Другая'] },
          { key: "model", label: "Модель", type: "select", options: [] },
          { key: "priceFrom", label: "Цена от", type: "number" },
          { key: "priceTo", label: "Цена до", type: "number" },
          { key: "yearOfManufactureFrom", label: "Год выпуска: от", type: "number" },
          { key: "yearOfManufactureTo", label: "Год выпуска: до", type: "number" },
          { key: "condition", label: "Состояние", type: "select", options: ["Все", "Кроме битых", "Битые"] },
        ],
        extra: [
          { key: "vesselLengthFrom", titlelabel: "Длина, м", label: "От", type: "number" },
          { key: "vesselLengthTo", label: "До", type: "number" },
          { key: "vesselDraftFrom", titlelabel: "Осадка, м", label: "От", type: "number" },
          { key: "vesselDraftTo", label: "До", type: "number" },
          { key: "vesselWidthFrom", titlelabel: "Ширина, м", label: "От", type: "number" },
          { key: "vesselWidthTo", label: "До", type: "number" },
          { key: "maxPassengersFrom", titlelabel: "Макс. число пассажиров", label: "От", type: "number" },
          { key: "maxPassengersTo", label: "До", type: "number" },
          { key: "vesselBodyMaterial", label: "Материал корпуса", type: "select", options: ['Сталь','Алюминий','Стеклопластик','Дерево','Карбон','Другое'] }
        ]
      },
      jetski: {
        extraClass: 'grid-water-open2',
        main: [
          { key: "country", label: "Страна производитель", type: "select", options: ['Япония','США','Канада','Россия','Китай','Другое'] },
          { key: "brand", label: "Марка", type: "select", options: ['Yamaha','Sea-Doo (BRP)','Kawasaki','Honda','Polaris','Tigershark','Arctic Cat','Другая'] },
          { key: "model", label: "Модель", type: "select", options: [] },
          { key: "priceFrom", label: "Цена от", type: "number" },
          { key: "priceTo", label: "Цена до", type: "number" },
          { key: "yearOfManufactureFrom", label: "Год выпуска: от", type: "number" },
          { key: "yearOfManufactureTo", label: "Год выпуска: до", type: "number" },
          { key: "condition", label: "Состояние", type: "select", options: ["Все", "Кроме битых", "Битые"] },
        ],
        extra: [
          { key: "horsePowerFrom", titlelabel: "Мощность: от", label: "От", type: "number" },
          { key: "horsePowerTo", titlelabel: "Мощность: до", label: "До", type: "number" },
          { key: "engineCapacityFrom", titlelabel: "Объём двигателя: от", label: "От", type: "number" },
          { key: "engineCapacityTo", titlelabel: "Объём двигателя: до", label: "До", type: "number" },
        ]
      }
    },
    trucks: {
      main: [
        { key: "country", label: "Страна производства", type: "select", options: ['Россия','США','Германия','Китай','Япония','Корея','Другое'] },
        { key: "vehicleBodyType", label: "Тип техники", type: "select", options: ['Грузовики','Седельные тягачи','Полуприцепы','Лёгкий коммерческий транспорт','Автобусы','Экскаваторы','Погрузчики','Экскаваторы-погрузчики','Автокраны','Автобетоносмесители','Дорожные катки','Тракторы','Мини-тракторы','Пресс-подборщики','Бороны','Косилки','Комбайны','Вилочные погрузчики','Штабелёры','Коммунальная техника','Ассенизаторы','Мусоровозы','Автогрейдеры','Автовышки','Другое'] },
        { key: "brand", label: "Марка", type: "select", options: ['Hyundai','HHI','JCB','Kato','Komatsu','Kubota','Rippa','Terex','Другая'] },
        { key: "model", label: "Модель", type: "select", options: [] },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" },
        { key: "yearOfManufactureFrom", label: "Год выпуска: от", type: "number" },
        { key: "yearOfManufactureTo", label: "Год выпуска: до", type: "number" },
        { key: "mileageFrom", label: "Пробег: от", type: "number" },
        { key: "mileageTo", label: "Пробег: до", type: "number" }
      ],
      extra: [
        { key: "ownersPts", label: "Владельцев по ПТС", type: "chips", options: ['Один', 'До двух', 'До трёх', 'Не важно'] },
        { key: "condition", label: "Состояние", type: "chips", options: ['Все', 'Кроме битых', 'Битые'] },
        { key: "engineType", label: "Двигатель", type: "select", options: ['Дизель','Бензин','Электро','Гибрид'] },
        { key: "vehicleKpp", label: "КПП", type: "select", options: transmissions },
        { key: "horsePowerFrom", titlelabel: "Мощность", label: "Мощность: от", type: "number" },
        { key: "horsePowerTo", label: "Мощность до", type: "number" },
        { key: "engineCapacityFrom", titlelabel: "Объём двигателя", label: "Объём двигателя: от", type: "number" },
        { key: "engineCapacityTo", label: "Объём двигателя: до", type: "number" },
        { key: "drive", label: "Привод", type: "chips", options: ['Передний', 'Задний', 'Полный'] },
      ]
    },
    parts: {
      main: [
        { key: "subcategory", label: "Категория", type: "select", options: ['Для легковых','Для грузовых','Для мото','Для спецтехники','Универсальные'] },
        { key: "condition", label: "Состояние", type: "select", options: ["Все", "Новая", "Б/у"] },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" },
      ],
      extra: []
    }
  },

  biznes: {
    ready_business: {
      main: [
        { key: "transactionScope", label: "Цель сделки", type: "select", options: ['В аренду','Продать','Найти партнёра'] },
        { key: "isProfitable", label: "Состояние бизнеса", type: "select", options: ['Прибыль','Убыток'] },
        { key: "payBackPeriod", label: "Срок окупаемости", type: "select", options: ['До 1 года','1-3 года','3-5 лет','Более 5 лет'] },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" },
        { key: "workExperience", label: "Возраст бизнеса", type: "select", options: ['До 1 года','1-3 года','3-5 лет','5-10 лет','Более 10 лет'] },
        { key: "businessForm", label: "Организационно-правовая форма", type: "select", options: ['ИП','ООО','АО','Другое'] }
      ],
      extra: []
    },
    equipment: {
      main: [
        { key: "subcategory", label: "Тип оборудования", type: "select", options: ['Станки','Торговое','Пищевое','Промышленное','Строительное','Производственное','Офисное','Медицинское','Кухонное','Холодильное','Клининговое','Парикмахерское','Автомобильное','Сварочное','Серверное','Сетевое','Телекоммуникационное','Печатное','Фотографическое','Электротехническое','Измерительное','Насосы','Компрессоры','Генераторы','Вентиляция','Отопление','Водоснабжение','Канализация','Подъемное','Погрузочное'] },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" }
      ],
      extra: []
    }
  },

  animals: {
    pets: {
      main: [
        { key: "subcategory", label: "Категория", type: "select", options: ['Собаки','Кошки','Птицы','Грызуны','Рыбы и амфибии','Сельскохозяйственные','Другие'] },
        { key: "gender", label: "Пол", type: "select", options: genders },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" },
        { key: "petColor", label: "Окрас", type: "select", options: colors },
        { key: "age", label: "Возраст", type: "select", options: ['До 1 года','1-3 года','3-5 лет','5-10 лет','Более 10 лет'] }
      ],
      extra: []
    },
    pet_products: {
      main: [
        { key: "subcategory", label: "Выберите категорию", type: "select", options: ['Корма и лакомства','Клетки, переноски, вольеры','Аквариумы и террариумы','Одежда и амуниция','Ветеринарные препараты'] },
        { key: "petBreed", label: "Вид животного", type: "select", options: ['Для собак','Для кошек','Для птиц','Для грызунов','Универсальное'] },
        { key: "petColor", label: "Тип корма", type: "select", options: ['Влажный корм','Сухой корм','Натуральный','Лакомства'] },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" },
      ],
      extra: []
    }
  },

  travel: {
    tours: {
      main: [
        { key: "offerType", label: "Тип предложения", type: "select", options: ['Тур','Экскурсия','Выходной тур','Авторский тур','Трансфер','Аренда жилья','Путешествие'] },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" }
      ],
      extra: []
    }
  }
}