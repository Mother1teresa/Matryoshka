export const productFields = {
  tovary: { default: {
      main: [
        { key: "subcategory", label: "Категория", type: "select" },
        { key: "priceFrom", label: "Цена: от", type: "number" },
        { key: "priceTo", label: "Цена: до", type: "number" }
      ],
    extra: []}},
    rabota: {
    jobs: {
      main: [
        { key: "subcategory", label: "Сфера деятельности", type: "select" },
        { key: "profession", label: "Профессия", type: "select" },
        { key: "experience", label: "Опыт работы", type: "select", options: ['Без опыта', 'От 1 года', 'От 3 лет', 'От 5 лет'] },
      ],
      extra: [
        { key: "employment", label: "Занятость", type: "chips", options: ['Полная', 'Частичная', 'Временная'] },
        { key: "schedule", label: "Формат работы", type: "chips", options: ['Удалённо', 'В офисе', 'Гибкий'] },
      ]
    },
    resume: {
      main: [
        { key: "subcategory", label: "Сфера деятельности", type: "select" },
        { key: "profession", label: "Профессия", type: "select" },
        { key: "gender", label: "Пол", type: "select", options: ['Мужской', 'Женский'] },
        { key: "experience", label: "Опыт работы", type: "select", options: ['Без опыта', 'От 1 года', 'От 3 лет', 'От 5 лет'] },
      ],
      extra: [
        { key: "employment", label: "Желаемая занятость", type: "chips", options: ['Полная', 'Частичная', 'Проектная'] },
        { key: "schedule", label: "График", type: "chips", options: ['Удалёнка', 'Полный день', 'Сменный'] },
      ]
    }
  },
nedvizhimost: {
apartments: { 
  buy:{
      extraClass: 'grid-realty-buy',
      main: [{ key: "subcategory", label: "Тип недвижимости", type: "select", options: ["Квартира", "Комната", "Доля"] },
        { key: "rooms", label: "Количество комнат", type: "select", options: ["1", "2", "3", "4+"] },
        // { key: "docym", label: "Тип договора", type: "select", showIf: "rent"  },
        { key: "priceFrom", label: "Цена: от", type: "number" },
        { key: "priceTo", label: "Цена: до", type: "number" },
        { key: "paymentForm", label: "Форма оплаты", type: "select", options: ["Ипотека", "Наличные", "Мат. капитал"] },
        { key: "balcony", label: "Балкон/Лоджия", type: "select", options: ["Есть", "Нет"] },
        { key: "areaFrom", label: "Площадь от", type: "number" },
        { key: "areaTo", label: "Площадь до", type: "number" },
        { key: "houseType", label: "Тип дома", type: "select", options: ["Кирпичный", "Панельный", "Монолитный"] },],
      extra: [
        { key: "elevator", label: "Лифт", type: "select", options: ["Пассажирский", "Грузовой", "Нет"] },
        { key: "parking", label: "Парковка", type: "select", options: ["Во дворе", "Подземная", "Шлагбаум"] },
        { key: "infrastructure",  label: "Инфраструктура",  type: "chips",  options: ["Детская площадка", "Видеонаблюдение", "Спортивная площадка", "Наличие охраны"] },
        { key: "documents", label: "Документы", type: "chips", options: ["Свидетельство о собственности", "Отсутствие обременений"]}]},
rent:{ extraClass: 'grid-realty-rent', main: [{ key: "subcategory", label: "Тип недвижимости", type: "select", options: ["Квартира", "Комната", "Доля"] },
        { key: "rooms", label: "Количество комнат", type: "select", options: ["1", "2", "3", "4+"] },
        // { key: "docym", label: "Тип договора", type: "select", showIf: "rent"  },
        { key: "priceFrom", label: "Аренда: от", type: "number" },
        { key: "priceTo", label: "Аренда: до", type: "number" },
        { key: "paymentForm", label: "Форма оплаты", type: "select", options: ["Ипотека", "Наличные", "Мат. капитал"] },
        { key: "balcony", label: "Балкон/Лоджия", type: "select", options: ["Есть", "Нет"] },
        { key: "areaFrom", label: "Площадь от", type: "number" },
        { key: "areaTo", label: "Площадь до", type: "number" },
        { key: "houseType", label: "Тип дома", type: "select", options: ["Кирпичный", "Панельный", "Монолитный"] },],
extra: [{ key: "elevator", label: "Лифт", type: "select", options: ["Пассажирский", "Грузовой", "Нет"] },
        { key: "parking", label: "Парковка", type: "select", options: ["Во дворе", "Подземная", "Шлагбаум"] },
        { key: "infrastructure", label: "Инфраструктура", type: "chips", options: ["Детская площадка", "Видеонаблюдение", "Спортивная площадка", "Наличие охраны"] },
        { key: "documents", label: "Документы", type: "chips", options: ["Свидетельство о собственности", "Отсутствие обременений"]}]},
},
houses: {
uchastok: {
  extraClass: 'grid-realty-land',
  main: [{ key: "land_purpose", label: "Назначение земли", type: "select", options: ["ИЖС", "СНТ", "ДНП"] },
      { key: "status", label: "Состояние участка", type: "select", options: ["Чистый", "Застроен", "Запущен"] },
      { key: "dealType", label: "Тип сделки", type: "select", options: ["Продажа", "Аренда"] },
      { key: "priceFrom", label: "Цена от", type: "number" },
      { key: "priceTo", label: "Цена до", type: "number" },
      { key: "documents", label: "Документы", type: "select", options: ["Собственность", "Аренда", "Наследство"] },
      { key: "areaFrom", label: "Площадь от", type: "number" },
      { key: "areaTo", label: "Площадь до", type: "number" },],
    extra: [{  key: "communications", label: "Коммуникации",  type: "chips", options: ["Электричество", "Вода", "Газ", "Канализация", "Отсутствуют"] },{ key: "additional",  label: "Дополнительно", type: "chips", options: ["Кадастр", "Межевание", "Собственник", "Возможность ипотеки"] }]
},
dom: {
 extraClass: 'grid-realty-home',
  main: [{ key: "land_purpose", label: "Назначение земли", type: "select", options: ["ИЖС", "СНТ", "ДНП"] },
      { key: "status", label: "Состояние участка", type: "select", options: ["Чистый", "Застроен", "Запущен"] },
      { key: "dealType", label: "Тип сделки", type: "select", options: ["Продажа", "Аренда"] },
      { key: "priceFrom", label: "Цена от", type: "number" },
      { key: "priceTo", label: "Цена до", type: "number" },
      { key: "documents", label: "Документы", type: "select", options: ["Собственность", "Аренда", "Наследство"] },
      { key: "areaFrom", label: "Площадь от", type: "number" },
      { key: "areaTo", label: "Площадь до", type: "number" },],
    extra: [{  key: "communications", label: "Коммуникации",  type: "chips", options: ["Электричество", "Вода", "Газ", "Канализация", "Отсутствуют"] },{ key: "additional",  label: "Дополнительно", type: "chips", options: ["Кадастр", "Межевание", "Собственник", "Возможность ипотеки"] }]
},
kottedzh: {
 extraClass: 'grid-realty-kottedzh',
  main: [{ key: "land_purpose", label: "Назначение земли", type: "select", options: ["ИЖС", "СНТ", "ДНП"] },
      { key: "status", label: "Состояние участка", type: "select", options: ["Чистый", "Застроен", "Запущен"] },
      { key: "dealType", label: "Тип сделки", type: "select", options: ["Продажа", "Аренда"] },
      { key: "priceFrom", label: "Цена от", type: "number" },
      { key: "priceTo", label: "Цена до", type: "number" },
      { key: "documents", label: "Документы", type: "select", options: ["Собственность", "Аренда", "Наследство"] },
      { key: "areaFrom", label: "Площадь от", type: "number" },
      { key: "areaTo", label: "Площадь до", type: "number" },],
    extra: [{  key: "communications", label: "Коммуникации",  type: "chips", options: ["Электричество", "Вода", "Газ", "Канализация", "Отсутствуют"] },{ key: "additional",  label: "Дополнительно", type: "chips", options: ["Кадастр", "Межевание", "Собственник", "Возможность ипотеки"] }]
},
dacha: {
 extraClass: 'grid-realty-dacha',
  main: [{ key: "land_purpose", label: "Назначение земли", type: "select", options: ["ИЖС", "СНТ", "ДНП"] },
      { key: "status", label: "Состояние участка", type: "select", options: ["Чистый", "Застроен", "Запущен"] },
      { key: "dealType", label: "Тип сделки", type: "select", options: ["Продажа", "Аренда"] },
      { key: "priceFrom", label: "Цена от", type: "number" },
      { key: "priceTo", label: "Цена до", type: "number" },
      { key: "documents", label: "Документы", type: "select", options: ["Собственность", "Аренда", "Наследство"] },
      { key: "areaFrom", label: "Площадь от", type: "number" },
      { key: "areaTo", label: "Площадь до", type: "number" },],
    extra: [{  key: "communications", label: "Коммуникации",  type: "chips", options: ["Электричество", "Вода", "Газ", "Канализация", "Отсутствуют"] },{ key: "additional",  label: "Дополнительно", type: "chips", options: ["Кадастр", "Межевание", "Собственник", "Возможность ипотеки"] }]
},
townhouse: {
 extraClass: 'grid-realty-townhouse',
  main: [{ key: "land_purpose", label: "Назначение земли", type: "select", options: ["ИЖС", "СНТ", "ДНП"] },
      { key: "status", label: "Состояние участка", type: "select", options: ["Чистый", "Застроен", "Запущен"] },
      { key: "dealType", label: "Тип сделки", type: "select", options: ["Продажа", "Аренда"] },
      { key: "priceFrom", label: "Цена от", type: "number" },
      { key: "priceTo", label: "Цена до", type: "number" },
      { key: "documents", label: "Документы", type: "select", options: ["Собственность", "Аренда", "Наследство"] },
      { key: "areaFrom", label: "Площадь от", type: "number" },
      { key: "areaTo", label: "Площадь до", type: "number" },],
    extra: [{  key: "communications", label: "Коммуникации",  type: "chips", options: ["Электричество", "Вода", "Газ", "Канализация", "Отсутствуют"] },{ key: "additional",  label: "Дополнительно", type: "chips", options: ["Кадастр", "Межевание", "Собственник", "Возможность ипотеки"] }]
},},
commercial: {
office: {
  extraClass: 'grid-comm-office',
  main: [{ key: "office_status", label: "Состояние офиса", type: "select" },
    { key: "priceFrom", label: "Цена: от", type: "number" },
    { key: "priceTo", label: "Цена: до", type: "number" },
    { key: "dealType", label: "Тип сделки", type: "select" },
    { key: "areaFrom", label: "Площадь от", type: "number" },
    { key: "areaTo", label: "Площадь до", type: "number" },
    { key: "floors", label: "Кол-во этажей", type: "number" },],
  extra: [{ key: "communications", label: "Коммуникации", type: "chips",  options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"],gridClass: "comm-grid"},{ key: "voltage", label: "Напряжение", type: "chips", options: ["220 В", "360 В"],gridClass: "voltage-grid"},
    { key: "truck_access", label: "Подъезд пути для грузового транспорта", type: "chips", options: ["Есть", "Нет"],gridClass: "access-grid"}]
},
retail: {
  extraClass: 'grid-comm-retail',
  main: [{ key: "office_status", label: "Состояние офиса", type: "select" },
    { key: "priceFrom", label: "Цена: от", type: "number" },
    { key: "priceTo", label: "Цена: до", type: "number" },
    { key: "dealType", label: "Тип сделки", type: "select" },
    { key: "areaFrom", label: "Площадь от", type: "number" },
    { key: "areaTo", label: "Площадь до", type: "number" },
    { key: "floors", label: "Кол-во этажей", type: "number" },],
  extra: [{ key: "communications", label: "Коммуникации", type: "chips",  options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"],gridClass: "comm-grid"},{ key: "voltage", label: "Напряжение", type: "chips", options: ["220 В", "360 В"],gridClass: "voltage-grid"},
    { key: "truck_access", label: "Подъезд пути для грузового транспорта", type: "chips", options: ["Есть", "Нет"],gridClass: "access-grid"}]
},
warehouse: {
  extraClass: 'grid-comm-warehouse',
  main: [{ key: "office_status", label: "Состояние офиса", type: "select" },
    { key: "priceFrom", label: "Цена: от", type: "number" },
    { key: "priceTo", label: "Цена: до", type: "number" },
    { key: "dealType", label: "Тип сделки", type: "select" },
    { key: "areaFrom", label: "Площадь от", type: "number" },
    { key: "areaTo", label: "Площадь до", type: "number" },
    { key: "floors", label: "Кол-во этажей", type: "number" },],
  extra: [{ key: "communications", label: "Коммуникации", type: "chips",  options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"],gridClass: "comm-grid"},{ key: "voltage", label: "Напряжение", type: "chips", options: ["220 В", "360 В"],gridClass: "voltage-grid"},
    { key: "truck_access", label: "Подъезд пути для грузового транспорта", type: "chips", options: ["Есть", "Нет"],gridClass: "access-grid"}]
},
factory: {
  extraClass: 'grid-comm-factory',
  main: [{ key: "office_status", label: "Состояние офиса", type: "select" },
    { key: "priceFrom", label: "Цена: от", type: "number" },
    { key: "priceTo", label: "Цена: до", type: "number" },
    { key: "dealType", label: "Тип сделки", type: "select" },
    { key: "areaFrom", label: "Площадь от", type: "number" },
    { key: "areaTo", label: "Площадь до", type: "number" },
    { key: "floors", label: "Кол-во этажей", type: "number" },],
  extra: [{ key: "communications", label: "Коммуникации", type: "chips",  options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"],gridClass: "comm-grid"},{ key: "voltage", label: "Напряжение", type: "chips", options: ["220 В", "360 В"],gridClass: "voltage-grid"},
    { key: "truck_access", label: "Подъезд пути для грузового транспорта", type: "chips", options: ["Есть", "Нет"],gridClass: "access-grid"}]
},
free: {
  extraClass: 'grid-comm-free',
  main: [{ key: "office_status", label: "Состояние офиса", type: "select" },
    { key: "priceFrom", label: "Цена: от", type: "number" },
    { key: "priceTo", label: "Цена: до", type: "number" },
    { key: "dealType", label: "Тип сделки", type: "select" },
    { key: "areaFrom", label: "Площадь от", type: "number" },
    { key: "areaTo", label: "Площадь до", type: "number" },
    { key: "floors", label: "Кол-во этажей", type: "number" },],
  extra: [{ key: "communications", label: "Коммуникации", type: "chips",  options: ["Электричество", "Вентиляция", "Охрана", "Кондиционер", "Интернет", "Лифт", "Отсутствуют"],gridClass: "comm-grid"},{ key: "voltage", label: "Напряжение", type: "chips", options: ["220 В", "360 В"],gridClass: "voltage-grid"},
    { key: "truck_access", label: "Подъезд пути для грузового транспорта", type: "chips", options: ["Есть", "Нет"],gridClass: "access-grid"}]
},},
parking: {
garage: {
  extraClass: 'grid-parking',
  main: [
    { key: "park_type", label: "Тип паркинга", type: "select", options: ["Гараж", "Машиноместо", "Бокс"] },
    { key: "priceFrom", label: "Цена от", type: "number" },
    { key: "priceTo", label: "Цена до", type: "number" },
    { key: "dealType", label: "Тип сделки", type: "select", options: ["Купить", "Снять"] },
    { key: "areaFrom", label: "Площадь от", type: "number" },
    { key: "areaTo", label: "Площадь до", type: "number" },
    { key: "places", label: "Кол-во машиномест", type: "select", options: ["1", "2", "3+"] },
    { key: "heightFrom", label: "Высота потолков от", type: "number" },
    { key: "heightTo", label: "Высота потолков до", type: "number" },],
  extra: [{ key: "communications",label: "Коммуникации", type: "chips", options: ["Охрана", "Отопление", "Освещение", "Видеонаблюдение", "Электричество 220В"] }]
},
parking_place: {
  extraClass: 'grid-parking-open',
  main: [
    { key: "park_type", label: "Тип паркинга", type: "select", options: ["Гараж", "Машиноместо", "Бокс"] },
    { key: "priceFrom", label: "Цена от", type: "number" },
    { key: "priceTo", label: "Цена до", type: "number" },
    { key: "dealType", label: "Тип сделки", type: "select", options: ["Купить", "Снять"] },
    { key: "areaFrom", label: "Площадь от", type: "number" },
    { key: "areaTo", label: "Площадь до", type: "number" },
    { key: "places", label: "Кол-во машиномест", type: "select", options: ["1", "2", "3+"] },
    { key: "heightFrom", label: "Высота потолков от", type: "number" },
    { key: "heightTo", label: "Высота потолков до", type: "number" },],
  extra: [{ key: "communications",label: "Коммуникации", type: "chips", options: ["Охрана", "Отопление", "Освещение", "Видеонаблюдение", "Электричество 220В"] }]
},}},
  uslugi: { all_services:{ main: [{ key: "subcategory", label: "Категория", type: "select" },
      { key: "experience", label: "Опыт", type: "select" },
      { key: "priceFrom", label: "Цена: от", type: "number" },
      { key: "priceTo", label: "Цена: до", type: "number" }],
    extra: []}},
  transport: {
    cars: { main: [
        { key: "brand", label: "Марка", type: "select" },
        { key: "model", label: "Модель", type: "select" },
        { key: "priceFrom", label: "Цена: от", type: "number" },
        { key: "priceTo", label: "Цена: до", type: "number" },
        { key: "yearFrom", label: "Год от", type: "number" },
        { key: "yearTo", label: "Год до", type: "number" },
        { key: "bodyType", label: "Кузов", type: "select" },
        { key: "transmission", label: "КПП", type: "select" },
        { key: "engine", label: "Двигатель", type: "select" },
        { key: "mileageFrom", label: "Пробег от", type: "number" },
        { key: "mileageTo", label: "Пробег до", type: "number" },],
      extra: [
        { key: "pts", label: "Владельцев по ПТС", type: "chips", options: ['Один', 'До двух', 'До трёх', 'Не важно'] },
        { key: "owners", label: "Владельцы", type: "chips", options: ['1', '2', '3+'] },
        { key: "condition", label: "Состояние", type: "chips", options: ['Все', 'Кроме битых', 'Битые'] },
        { key: "drive", label: "Привод", type: "chips", options: ['Передний', 'Задний', 'Полный'] },
        { key: "powerFrom", titlelabel: "Объём двигателя", label: "Мощность от", type: "number" },
        { key: "powerTo", label: "Мощность до", type: "number" },
        { key: "engineVolFrom", titlelabel: "Объём двигателя", label: "От", type: "number" },
        { key: "engineVolTo", label: "До", type: "number" },
        { key: "steering", label: "Руль", type: "chips", options: ['Не важно', 'Левый ', 'Правый'] },
        { key: "color", label: "Цвет", type: "select" }]},
    moto: {main: [{ key: "country", label: "Страна производства", type: "select" },
        { key: "motoType", label: "Тип техники", type: "select" },
        { key: "brand", label: "Марка", type: "select" },
        { key: "model", label: "Модель", type: "select" },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" }],
      extra: [{ key: "owners", label: "Владельцы", type: "chips" },
        { key: "cooling", label: "Охлаждение", type: "chips" },
        { key: "engineType", label: "Двигатель", type: "select" }]},
    water: { yachts: { main: [
        { key: "country", label: "Страна производства", type: "select" },
        { key: "motoType", label: "Тип", type: "select" },
        { key: "brand", label: "Марка", type: "select" },
        { key: "model", label: "Модель", type: "select" },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" }],
       extra: [
        { key: "owners", label: "Владельцы", type: "chips" },
        { key: "cooling", label: "Охлаждение", type: "chips" },
        { key: "engineType", label: "Двигатель", type: "select" }]},
      jetski: { main: [
        { key: "country", label: "Страна", type: "select" },
        { key: "motoType", label: "Тип", type: "select" },
        { key: "brand", label: "Марка", type: "select" },
        { key: "model", label: "Модель", type: "select" },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" }],
       extra: [
        { key: "owners", label: "Владельцы", type: "chips" },
        { key: "cooling", label: "Охлаждение", type: "chips" },
        { key: "engineType", label: "Двигатель", type: "select" }]}},
    trucks: { main: [
        { key: "country", label: "Страна", type: "select" },
        { key: "specialType", label: "Тип", type: "select" },
        { key: "brand", label: "Марка", type: "select" },
        { key: "model", label: "Модель", type: "select" },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" }
      ],
      extra: [
        { key: "condition", label: "Состояние", type: "chips" },
        { key: "drive", label: "Привод", type: "chips" }]}},
  biznes: {
  ready_business: {
    main: [
      { key: "dealGoal", label: "Цель сделки", type: "select" },
      { key: "businessStatus", label: "Состояние бизнеса", type: "select" },
      { key: "payback", label: "Срок окупаемости", type: "select" },
      { key: "priceFrom", label: "Цена от", type: "number" },
      { key: "priceTo", label: "Цена до", type: "number" },
      { key: "businessAge", label: "Возраст бизнеса", type: "select" },
      { key: "legalForm", label: "Организационно-правовая форма", type: "select" }
    ],
    extra: []},
  equipment: { main: [
      { key: "subcategory", label: "Тип оборудования", type: "select" },
      { key: "priceFrom", label: "Цена от", type: "number" },
      { key: "priceTo", label: "Цена до", type: "number" }
    ],
    extra: []}},
  animals: { pets: {main: [
        { key: "subcategory", label: "Категория", type: "select" },
        { key: "gender", label: "Пол", type: "select" },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" },
        { key: "color", label: "Окрас", type: "select" },
        { key: "age", label: "Возраст", type: "select" }],
      extra: []},
      pet_products: {main: [
        { key: "subcategory", label: "Категория", type: "select" },
        { key: "gender", label: "Пол", type: "select" },
        { key: "priceFrom", label: "Цена от", type: "number" },
        { key: "priceTo", label: "Цена до", type: "number" },
        { key: "color", label: "Окрас", type: "select" },
        { key: "age", label: "Возраст", type: "select" }],
      extra: []},
    },
  price: { main: [
      { key: "subcategory", label: "Категория", type: "select" },
      { key: "priceFrom", label: "Цена от", type: "number" },
      { key: "priceTo", label: "Цена до", type: "number" }],
    extra: []},
  travel: { tours:{ main: [
      { key: "subcategory", label: "Тип предложения", type: "select" },
      { key: "priceFrom", label: "Цена от", type: "number" } ,
      { key: "priceTo", label: "Цена до", type: "number" }],
    extra: []}}};