// ============================================
// productLabels.js — Подписи с группировкой по секциям
// ============================================

// === Общие подписи для всех полей ===
export const productLabels = {
  // Общие
  id: "ID",
  title: "Название",
  price: "Цена",
  description: "Описание",
  city: "Город",
  address: "Адрес",
  category: "Категория",
  subcategory: "Категория",
  subCategory: "Подкатегория",
  
  // Работа
  profession: "Профессия",
  experience: "Опыт работы",
  employment: "Занятость",
  schedule: "График работы",
  gender: "Пол",
  sphere: "Сфера деятельности",
  workExperience: "Опыт работы",
  workFormat: "Формат работы",
  advantages: "Преимущества",
  
  // Недвижимость — общие
  rooms: "Количество комнат",
  area: "Площадь",
  totalArea: "Общая площадь",
  livingArea: "Жилая площадь",
  kitchenArea: "Площадь кухни",
  floor: "Этаж",
  apartmentFloor: "Этаж",
  floors: "Кол-во этажей",
  floorsInHouse: "Этажей в доме",
  houseType: "Тип дома",
  propertyType: "Тип недвижимости",
  paymentForm: "Форма оплаты",
  paymentType: "Форма оплаты",
  balcony: "Балкон/Лоджия",
  hasBalcony: "Балкон/Лоджия",
  balconyAmount: "Кол-во балконов",
  elevator: "Лифт",
  hasElevator: "Лифт",
  parking: "Парковка",
  hasParking: "Парковка",
  stationDistance: "До метро/остановок",
  cityInfrastructure: "Инфраструктура",
  cityInfrastructureDistance: "До инфраструктуры",
  hasSecurity: "Охрана",
  hasVideoSecurity: "Видеонаблюдение",
  hasChildrenPlayground: "Детская площадка",
  hasSportPlayground: "Спортивная площадка",
  documents: "Документы",
  hasDocuments: "Документы",
  
  // Участки
  land_purpose: "Назначение земли",
  status: "Состояние",
  houseState: "Состояние",
  dealType: "Тип сделки",
  transactionScope: "Объём сделки",
  
  // Дома/коттеджи
  attic: "Мансард",
  houseArea: "Площадь дома",
  landArea: "Площадь участка",
  bathrooms: "Кол-во санузлов",
  communications: "Коммуникации",
  additional: "Дополнительно",
  
  // Коммерческая
  office_status: "Состояние помещения",
  height: "Высота потолков",
  voltage: "Напряжение",
  truck_access: "Подъезд грузовика",
  
  // Парковка
  park_type: "Тип паркинга",
  places: "Кол-во машиномест",
  
  // Транспорт
  brand: "Марка",
  model: "Модель",
  year: "Год выпуска",
  yearOfManufacture: "Год выпуска",
  bodyType: "Кузов",
  vehicleBodyType: "Тип кузова",
  transmission: "КПП",
  vehicleKpp: "КПП",
  engine: "Двигатель",
  engineType: "Тип двигателя",
  mileage: "Пробег",
  milage: "Пробег",
  fuel: "Топливо",
  drive: "Привод",
  steering: "Руль",
  steeringWheel: "Руль",
  color: "Цвет",
  pts: "Владельцев по ПТС",
  ownersPts: "Владельцев по ПТС",
  owners: "Владельцы",
  condition: "Состояние",
  isOnTheGo: "На ходу",
  power: "Мощность",
  horsePower: "Мощность",
  engineCapacity: "Объём двигателя",
  engineVol: "Объём двигателя",
  country: "Страна производства",
  motoType: "Тип техники",
  specialType: "Тип техники",
  cooling: "Охлаждение",
  
  // Водный транспорт
  length: "Длина",
  vesselLength: "Длина",
  width: "Ширина",
  vesselWidth: "Ширина",
  draft: "Осадка",
  vesselDraft: "Осадка",
  hullMaterial: "Материал корпуса",
  vesselBodyMaterial: "Материал корпуса",
  material: "Материал",
  passengers: "Пассажиров",
  maxPassengers: "Макс. пассажиров",
  vesselType: "Тип судна",
  
  // Бизнес
  dealGoal: "Цель сделки",
  businessStatus: "Состояние бизнеса",
  payback: "Срок окупаемости",
  payBackPeriod: "Срок окупаемости",
  businessAge: "Возраст бизнеса",
  legalForm: "Организационно-правовая форма",
  businessForm: "Форма бизнеса",
  isProfitable: "Прибыльный",
  
  // Животные
  age: "Возраст",
  breed: "Порода",
  petBreed: "Порода",
  petName: "Кличка",
  petColor: "Окрас",
  animal_category: "Вид животного",
  food_type: "Тип корма",
  
  // Путешествия
  offerType: "Тип предложения",
  priceFor: "Цена за",
};

// ============================================
// ГРУППИРОВКА ПОЛЕЙ ПО СЕКЦИЯМ (как на скриншотах)
// ============================================

/**
 * Группы полей для отображения на странице товара
 * Каждая группа = заголовок + список полей
 */
export const fieldGroups = {
  // === Водный транспорт (water) — fallback для всех подкатегорий ===
  water: [
    {
      title: "Характеристики",
      fields: [
        { key: "brand", type: "text" },
        { key: "model", type: "text" },
        { key: "year", type: "text" },
        { key: "condition", type: "text" },
        { key: "length", type: "text", suffix: "м" },
        { key: "width", type: "text", suffix: "м" },
        { key: "draft", type: "text", suffix: "м" },
        { key: "passengers", type: "text", label: "Макс. пассажиров" },
        { key: "hullMaterial", type: "text", label: "Материал корпуса" },
      ]
    }
  ],
  
  // === Яхты (yachts) — конкретная подкатегория ===
  yachts: [
    {
      title: "Характеристики",
      fields: [
        { key: "brand", type: "text" },
        { key: "model", type: "text" },
        { key: "year", type: "text" },
        { key: "condition", type: "text" },
        { key: "length", type: "text", suffix: "м" },
        { key: "width", type: "text", suffix: "м" },
        { key: "draft", type: "text", suffix: "м" },
        { key: "passengers", type: "text", label: "Макс. пассажиров" },
        { key: "hullMaterial", type: "text", label: "Материал корпуса" },
      ]
    }
  ],
  
  // === Гидроциклы (jetski) ===
  jetski: [
    {
      title: "Характеристики",
      fields: [
        { key: "brand", type: "text" },
        { key: "model", type: "text" },
        { key: "year", type: "text" },
        { key: "condition", type: "text" },
        { key: "power", type: "text", suffix: "л.с." },
        { key: "engineVol", type: "text", suffix: "см³" },
      ]
    }
  ],
  
  // === Авто (cars) ===
  cars: [
    {
      title: "Характеристики",
      fields: [
        { key: "brand", type: "text" },
        { key: "model", type: "text" },
        { key: "year", type: "text" },
        { key: "mileage", type: "text", suffix: "км" },
        { key: "bodyType", type: "text", label: "Кузов" },
        { key: "transmission", type: "text", label: "КПП" },
        { key: "engineType", type: "text", label: "Двигатель" },
        { key: "drive", type: "text", label: "Привод" },
        { key: "power", type: "text", suffix: "л.с." },
        { key: "engineCapacity", type: "text", suffix: "л" },
        { key: "color", type: "text" },
      ]
    }
  ],
  
  // === Мото (moto) ===
  moto: [
    {
      title: "Характеристики",
      fields: [
        { key: "brand", type: "text" },
        { key: "model", type: "text" },
        { key: "year", type: "text" },
        { key: "mileage", type: "text", suffix: "км" },
        { key: "engineType", type: "text", label: "Тип двигателя" },
        { key: "transmission", type: "text", label: "КПП" },
        { key: "cooling", type: "text" },
        { key: "color", type: "text" },
      ]
    }
  ],
  
  // === Грузовики/Спецтехника (trucks) ===
  trucks: [
    {
      title: "Характеристики",
      fields: [
        { key: "brand", type: "text" },
        { key: "model", type: "text" },
        { key: "year", type: "text" },
        { key: "mileage", type: "text", suffix: "км" },
        { key: "specialType", type: "text", label: "Тип техники" },
        { key: "engineType", type: "text", label: "Двигатель" },
        { key: "transmission", type: "text", label: "КПП" },
        { key: "drive", type: "text", label: "Привод" },
      ]
    }
  ],
  
  // === Запчасти (parts) ===
  parts: [
    {
      title: "Характеристики",
      fields: [
        { key: "subcategory", type: "text", label: "Категория" },
        { key: "condition", type: "text" },
      ]
    }
  ],
  
  // === Квартиры (apartments) ===
  apartments: [
    {
      title: "Подробности",
      fields: [
        { key: "rooms", type: "text", label: "Количество комнат" },
        { key: "totalArea", type: "text", suffix: "м²" },
        { key: "floor", type: "text", label: "Этаж" },
        { key: "floorsInHouse", type: "text", label: "Этажей в доме" },
        { key: "houseType", type: "text", label: "Тип дома" },
        { key: "balcony", type: "text" },
        { key: "elevator", type: "text" },
        { key: "parking", type: "text" },
      ]
    },
    {
      title: "Инфраструктура",
      fields: [
        { key: "infrastructure", type: "chips" },
      ]
    },
    {
      title: "Документы",
      fields: [
        { key: "documents", type: "chips" },
      ]
    }
  ],
  
  // === Участки (uchastok) ===
  uchastok: [
    {
      title: "Подробности о участке",
      fields: [
        { key: "land_purpose", type: "text" },
        { key: "area", type: "text", suffix: "сотки" },
        { key: "status", type: "text" },
        { key: "dealType", type: "text" },
      ]
    },
    {
      title: "Удобства и инфраструктура",
      fields: [
        { key: "communications", type: "chips" },
      ]
    },
    {
      title: "Документы",
      fields: [
        { key: "documents", type: "chips" },
      ]
    },
    {
      title: "Дополнительно",
      fields: [
        { key: "additional", type: "chips" },
      ]
    }
  ],
  
  // === Дома (dom) ===
  dom: [
    {
      title: "Подробности",
      fields: [
        { key: "houseType", type: "text", label: "Материал стен" },
        { key: "status", type: "text", label: "Состояние" },
        { key: "dealType", type: "text", label: "Тип сделки" },
        { key: "attic", type: "text", label: "Мансард" },
        { key: "houseArea", type: "text", suffix: "м²", label: "Площадь дома" },
        { key: "landArea", type: "text", suffix: "сотки", label: "Площадь участка" },
        { key: "bathrooms", type: "text", label: "Кол-во санузлов" },
        { key: "rooms", type: "text", label: "Кол-во комнат" },
        { key: "floors", type: "text", label: "Кол-во этажей" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Коттеджи (kottedzh) ===
  kottedzh: [
    {
      title: "Подробности",
      fields: [
        { key: "houseType", type: "text", label: "Материал стен" },
        { key: "status", type: "text", label: "Состояние" },
        { key: "dealType", type: "text", label: "Тип сделки" },
        { key: "attic", type: "text", label: "Мансард" },
        { key: "houseArea", type: "text", suffix: "м²", label: "Площадь дома" },
        { key: "landArea", type: "text", suffix: "сотки", label: "Площадь участка" },
        { key: "bathrooms", type: "text", label: "Кол-во санузлов" },
        { key: "rooms", type: "text", label: "Кол-во комнат" },
        { key: "floors", type: "text", label: "Кол-во этажей" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Дачи (dacha) ===
  dacha: [
    {
      title: "Подробности",
      fields: [
        { key: "houseType", type: "text", label: "Материал стен" },
        { key: "status", type: "text", label: "Состояние" },
        { key: "dealType", type: "text", label: "Тип сделки" },
        { key: "attic", type: "text", label: "Мансард" },
        { key: "houseArea", type: "text", suffix: "м²", label: "Площадь дома" },
        { key: "landArea", type: "text", suffix: "сотки", label: "Площадь участка" },
        { key: "bathrooms", type: "text", label: "Кол-во санузлов" },
        { key: "rooms", type: "text", label: "Кол-во комнат" },
        { key: "floors", type: "text", label: "Кол-во этажей" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Таунхаусы (townhouse) ===
  townhouse: [
    {
      title: "Подробности",
      fields: [
        { key: "houseType", type: "text", label: "Материал стен" },
        { key: "status", type: "text", label: "Состояние" },
        { key: "dealType", type: "text", label: "Тип сделки" },
        { key: "attic", type: "text", label: "Мансард" },
        { key: "houseArea", type: "text", suffix: "м²", label: "Площадь дома" },
        { key: "landArea", type: "text", suffix: "сотки", label: "Площадь участка" },
        { key: "bathrooms", type: "text", label: "Кол-во санузлов" },
        { key: "rooms", type: "text", label: "Кол-во комнат" },
        { key: "floors", type: "text", label: "Кол-во этажей" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Офис (office) ===
  office: [
    {
      title: "Подробности",
      fields: [
        { key: "office_status", type: "text", label: "Состояние офиса" },
        { key: "area", type: "text", suffix: "м²" },
        { key: "floors", type: "text", label: "Кол-во этажей" },
        { key: "height", type: "text", suffix: "м" },
        { key: "parking", type: "text" },
        { key: "truck_access", type: "text", label: "Подъездная дорога" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Торговля (retail) ===
  retail: [
    {
      title: "Подробности",
      fields: [
        { key: "office_status", type: "text", label: "Состояние" },
        { key: "area", type: "text", suffix: "м²" },
        { key: "floors", type: "text", label: "Кол-во этажей" },
        { key: "height", type: "text", suffix: "м" },
        { key: "parking", type: "text" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Склад (warehouse) ===
  warehouse: [
    {
      title: "Подробности",
      fields: [
        { key: "office_status", type: "text", label: "Состояние" },
        { key: "area", type: "text", suffix: "м²" },
        { key: "floors", type: "text", label: "Кол-во этажей" },
        { key: "height", type: "text", suffix: "м" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Производство (factory) ===
  factory: [
    {
      title: "Подробности",
      fields: [
        { key: "office_status", type: "text", label: "Состояние" },
        { key: "area", type: "text", suffix: "м²" },
        { key: "floors", type: "text", label: "Кол-во этажей" },
        { key: "height", type: "text", suffix: "м" },
        { key: "voltage", type: "text" },
        { key: "truck_access", type: "text", label: "Подъезд грузовика" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Свободное назначение (free) ===
  free: [
    {
      title: "Подробности",
      fields: [
        { key: "office_status", type: "text", label: "Состояние" },
        { key: "area", type: "text", suffix: "м²" },
        { key: "floors", type: "text", label: "Кол-во этажей" },
        { key: "height", type: "text", suffix: "м" },
        { key: "voltage", type: "text" },
        { key: "truck_access", type: "text", label: "Подъезд грузовика" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Гараж (garage) ===
  garage: [
    {
      title: "Подробности",
      fields: [
        { key: "park_type", type: "text", label: "Тип паркинга" },
        { key: "area", type: "text", suffix: "м²" },
        { key: "dealType", type: "text", label: "Тип сделки" },
        { key: "places", type: "text", label: "Кол-во машиномест" },
        { key: "height", type: "text", suffix: "м" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Место на парковке (parking_place) ===
  parking_place: [
    {
      title: "Подробности",
      fields: [
        { key: "park_type", type: "text", label: "Тип паркинга" },
        { key: "area", type: "text", suffix: "м²" },
        { key: "dealType", type: "text", label: "Тип сделки" },
        { key: "places", type: "text", label: "Кол-во машиномест" },
        { key: "height", type: "text", suffix: "м" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Услуги (all_services) ===
  all_services: [
    {
      title: "О услуге",
      fields: [
        { key: "subcategory", type: "text", label: "Категория" },
        { key: "experience", type: "text", label: "Опыт" },
      ]
    }
  ],
  
  // === Работа — Вакансии (jobs) ===
  jobs: [
    {
      title: "О вакансии",
      fields: [
        { key: "profession", type: "text" },
        { key: "sphere", type: "text", label: "Сфера" },
        { key: "experience", type: "text", label: "Опыт работы" },
        { key: "employment", type: "chips" },
        { key: "schedule", type: "chips", label: "График" },
      ]
    }
  ],
  
  // === Работа — Резюме (resume) ===
  resume: [
    {
      title: "О кандидате",
      fields: [
        { key: "profession", type: "text" },
        { key: "sphere", type: "text", label: "Сфера" },
        { key: "gender", type: "text" },
        { key: "experience", type: "text", label: "Опыт работы" },
        { key: "employment", type: "chips", label: "Желаемая занятость" },
        { key: "schedule", type: "chips", label: "График" },
      ]
    }
  ],
  
  // === Животные — Питомцы (pets) ===
  pets: [
    {
      title: "О питомце",
      fields: [
        { key: "breed", type: "text", label: "Порода" },
        { key: "gender", type: "text" },
        { key: "age", type: "text" },
        { key: "color", type: "text", label: "Окрас" },
      ]
    }
  ],
  
  // === Животные — Товары (pet_products) ===
  pet_products: [
    {
      title: "О товаре",
      fields: [
        { key: "subcategory", type: "text", label: "Категория" },
        { key: "animal_category", type: "text", label: "Вид животного" },
        { key: "food_type", type: "text", label: "Тип корма" },
      ]
    }
  ],
  
  // === Бизнес — Готовый бизнес (ready_business) ===
  ready_business: [
    {
      title: "О бизнесе",
      fields: [
        { key: "dealGoal", type: "text", label: "Цель сделки" },
        { key: "businessStatus", type: "text", label: "Состояние" },
        { key: "payback", type: "text", label: "Срок окупаемости" },
        { key: "businessAge", type: "text", label: "Возраст бизнеса" },
        { key: "legalForm", type: "text", label: "Организационно-правовая форма" },
      ]
    }
  ],
  
  // === Бизнес — Оборудование (equipment) ===
  equipment: [
    {
      title: "Оборудование",
      fields: [
        { key: "subcategory", type: "text", label: "Тип оборудования" },
      ]
    }
  ],
  
  // === Путешествия (tours) ===
  tours: [
    {
      title: "О туре",
      fields: [
        { key: "offerType", type: "text", label: "Тип предложения" },
        { key: "priceFor", type: "text", label: "Цена за" },
      ]
    }
  ],
  
  // === Товары (default) ===
  default: [
    {
      title: "Подробности",
      fields: [
        { key: "subcategory", type: "text", label: "Категория" },
      ]
    }
  ],
};

// ============================================
// УТИЛИТЫ
// ============================================

/**
 * Получает группы полей для конкретной секции
 * @param {string} section — slug секции (apartments, cars, yachts, office, uchastok...)
 * @returns {Array} — массив групп с title и fields
 */
export function getFieldGroups(section, subcategory) {
  // Сначала ищем по subcategory (более точный), затем по section
  if (subcategory && fieldGroups[subcategory]) {
    return fieldGroups[subcategory];
  }
  if (section && fieldGroups[section]) {
    return fieldGroups[section];
  }
  return fieldGroups.default || [];
}

/**
 * Получает label для ключа
 * @param {string} key — ключ поля
 * @param {string} customLabel — кастомный label из группы (если есть)
 * @returns {string}
 */
export function getLabel(key, customLabel) {
  if (customLabel) return customLabel;
  return productLabels[key] || key;
}

/**
 * Форматирует значение для отображения
 * @param {any} value — значение
 * @param {string} type — тип поля (text, chips)
 * @param {string} suffix — суффикс (м², км, сотки...)
 * @returns {string|Array}
 */
export function formatValue(value, type, suffix) {
  if (value === undefined || value === null || value === "") return "—";
  
  if (type === "chips") {
    // Если уже массив — возвращаем как есть
    if (Array.isArray(value)) return value;
    // Если строка с запятыми — разбиваем
    if (typeof value === "string") return value.split(",").map(s => s.trim()).filter(Boolean);
    return [String(value)];
  }
  
  // Для boolean
  if (typeof value === "boolean") return value ? "Есть" : "Нет";
  
  // Для чисел с суффиксом
  if (suffix && typeof value === "number") {
    return `${value} ${suffix}`;
  }
  
  return String(value);
}