// ============================================
// productLabels.js — Подписи полей + Группировка
// ============================================

// === 1. ПОДПИСИ ПОЛЕЙ (уже есть у вас) ===
export const productLabels = {
  id: "ID",
  title: "Название",
  price: "Цена",
  description: "Описание",
  city: "Город",
  address: "Адрес",
  category: "Категория",
  subcategory: "Подкатегория",
  section: "Раздел",
  
  // Недвижимость
  rooms: "Количество комнат:",
  area: "Площадь:",
  totalArea: "Общая площадь:",
  livingArea: "Жилая площадь:",
  kitchenArea: "Площадь кухни:",
  floor: "Этаж:",
  floors: "Кол-во этажей:",
  floorsInHouse: "Этажей в доме:",
  houseType: "Тип дома:",
  propertyType: "Тип недвижимости:",
  paymentForm: "Форма оплаты:",
  paymentType: "Форма оплаты:",
  balcony: "Балкон/Лоджия:",
  hasBalcony: "Балкон/Лоджия:",
  balconyAmount: "Кол-во балконов:",
  elevator: "Лифт:",
  hasElevator: "Лифт:",
  parking: "Парковка:",
  hasParking: "Парковка:",
  stationDistance: "До метро/остановок:",
  cityInfrastructure: "Инфраструктура:",
  cityInfrastructureDistance: "До инфраструктуры:",
  hasSecurity: "Охрана:",
  hasVideoSecurity: "Видеонаблюдение:",
  hasChildrenPlayground: "Детская площадка:",
  hasSportPlayground: "Спортивная площадка:",
  documents: "Документы:",
  hasDocuments: "Документы:",
  
  // Участки
  land_purpose: "Назначение земли:",
  status: "Состояние:",
  houseState: "Состояние:",
  dealType: "Тип сделки:",
  transactionScope: "Объём сделки:",
  
  // Коммерческая
  office_status: "Состояние офиса:",
  height: "Высота потолков:",
  voltage: "Напряжение:",
  truck_access: "Подъезд грузовика:",
  
  // Авто
  brand: "Марка:",
  model: "Модель:",
  year: "Год выпуска:",
  yearOfManufacture: "Год выпуска:",
  vehicleBodyType: "Кузов:",
  vehicleBodyType: "Тип кузова:",
  transmission: "КПП:",
  vehicleKpp: "КПП:",
  engine: "Двигатель:",
  engineType: "Тип двигателя:",
  mileage: "Пробег:",
  milage: "Пробег:",
  fuel: "Топливо:",
  drive: "Привод:",
  steering: "Руль:",
  steeringWheel: "Руль:",
  color: "Цвет:",
  pts: "Владельцев по ПТС:",
  ownersPts: "Владельцев по ПТС:",
  owners: "Владельцы:",
  condition: "Состояние:",
  isOnTheGo: "На ходу:",
  power: "Мощность:",
  horsePower: "Мощность:",
  engineCapacity: "Объём двигателя:",
  engineVol: "Объём двигателя:",
  country: "Страна производства:",
  motoType: "Тип техники:",
  specialType: "Тип техники:",
  cooling: "Охлаждение:",
  
  // Водный транспорт
  length: "Длина:",
  vesselLength: "Длина:",
  width: "Ширина:",
  vesselWidth: "Ширина:",
  draft: "Осадка:",
  vesselDraft: "Осадка:",
  hullMaterial: "Материал корпуса:",
  vesselBodyMaterial: "Материал корпуса:",
  material: "Материал:",
  passengers: "Пассажиров:",
  maxPassengers: "Макс. пассажиров:",
  vesselType: "Тип судна:",
  
  // Работа
  profession: "Профессия:",
  experience: "Опыт работы:",
  employment: "Занятость:",
  schedule: "График работы:",
  gender: "Пол:",
  sphere: "Сфера деятельности:",
  workExperience: "Опыт работы:",
  workFormat: "Формат работы:",
  advantages: "Преимущества:",
  
  // Бизнес
  dealGoal: "Цель сделки:",
  businessStatus: "Состояние бизнеса:",
  payback: "Срок окупаемости:",
  payBackPeriod: "Срок окупаемости:",
  businessAge: "Возраст бизнеса:",
  legalForm: "Правовая форма:",
  businessForm: "Форма бизнеса:",
  isProfitable: "Прибыльный:",
  
  // Животные
  age: "Возраст:",
  breed: "Порода:",
  petBreed: "Порода:",
  petName: "Кличка:",
  petColor: "Окрас:",
  animal_category: "Вид животного:",
  food_type: "Тип корма:",
  
  // Путешествия
  offerType: "Тип предложения:",
  priceFor: "Цена за:",
  
  // Дома
  attic: "Мансард",
  houseArea: "Площадь дома:",
  landArea: "Площадь участка:",
  bathrooms: "Кол-во санузлов:",
  communications: "Коммуникации:",
  additional: "Дополнительно:",
  
  // Парковка
  park_type: "Тип паркинга:",
  places: "Кол-во машиномест:",

  // Услуги
  services: "Виды предлагаемых услуг:",
  workSchedule: "График работы:",
};

// ============================================
// 2. ГРУППИРОВКА ПОЛЕЙ ПО СЕКЦИЯМ
// ============================================

export const fieldGroups = {
  // === Участок ===
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
  
  // === Офис ===
  office: [
    {
      title: "Подробности",
      fields: [
        { key: "office_status", type: "text", label: "Состояние офиса:" },
        { key: "area", type: "text", suffix: "м²" },
        { key: "floors", type: "text", label: "Кол-во этажей:" },
        { key: "height", type: "text", suffix: "м" },
        { key: "parking", type: "text" },
        { key: "truck_access", type: "text", label: "Подъездная дорога:" },
      ]
    },
    {
      title: "Коммуникации",
      fields: [
        { key: "communications", type: "chips" },
      ]
    }
  ],
  
  // === Квартира ===
  apartments: [
    {
      title: "Подробности",
      fields: [
        { key: "rooms", type: "text", label: "Количество комнат:" },
        { key: "totalArea", type: "text", suffix: "м²" },
        { key: "floor", type: "text", label: "Этаж:" },
        { key: "floorsInHouse", type: "text", label: "Этажей в доме:" },
        { key: "houseType", type: "text", label: "Тип дома:" },
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
  
  // === Авто ===
  cars: [
    {
      title: "Характеристики",
      fields: [
        { key: "brand", type: "text" },
        { key: "model", type: "text" },
        { key: "yearOfManufacture", type: "text", label: "Год выпуска:" },
        { key: "milage", type: "text", suffix: "км" },
        { key: "vehicleBodyType", type: "text", label: "Кузов:" },
        { key: "vehicleKpp", type: "text", label: "КПП:" },
        { key: "engineType", type: "text", label: "Двигатель:" },
        { key: "drive", type: "text", label: "Привод:" },
        { key: "horsePower", type: "text", suffix: "л.с.", label: "Мощность:" },
        { key: "engineCapacity", type: "text", suffix: "л", label: "Объём двигателя:" },
        { key: "color", type: "text" },
        { key: "isOnTheGo", type: "text", label: "На ходу:" },
      ]
    }
  ],
  // === Мотоциклы / Мототехника ===
  moto: [
    {
      title: "Характеристики",
      fields: [
        { key: "brand", type: "text", label: "Марка:" },
        { key: "model", type: "text", label: "Модель:" },
        { key: "yearOfManufacture", type: "text", label: "Год выпуска:" },
        { key: "milage", type: "text", suffix: "км", label: "Пробег:" },
        { key: "engineType", type: "text", label: "Двигатель:" },
        { key: "engineCapacity", type: "text", suffix: "см³", label: "Объём:" },
        { key: "horsePower", type: "text", suffix: "л.с.", label: "Мощность:" },
        { key: "color", type: "text", label: "Цвет:" },
        { key: "isOnTheGo", type: "text", label: "На ходу:" },
      ]
    }
  ],
  // === Яхты ===
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
        { key: "passengers", type: "text", label: "Макс. пассажиров:" },
        { key: "hullMaterial", type: "text", label: "Материал корпуса:" },
      ]
    }
  ],
  
  // === Работа — Вакансии ===
  jobs: [
    {
      title: "О вакансии",
      fields: [
        { key: "profession", type: "text" },
        { key: "sphere", type: "text", label: "Сфера:" },
        { key: "experience", type: "text", label: "Опыт работы:" },
        { key: "employment", type: "chips" },
        { key: "schedule", type: "chips", label: "График работы:" },
      ]
    }
  ],
  
  // === Работа — Резюме ===
  resume: [
    {
      title: "О кандидате",
      fields: [
        { key: "profession", type: "text" },
        { key: "sphere", type: "text", label: "Сфера:" },
        { key: "gender", type: "text" },
        { key: "experience", type: "text", label: "Опыт работы:" },
        { key: "employment", type: "chips", label: "Желаемая занятость:" },
        { key: "schedule", type: "chips", label: "График работы:" },
      ]
    }
  ],
  // === Услуги ===
  uslugi: [
    {
      title: "Об услуге",
      fields: [
        { key: "workExperience", type: "text", label: "Опыт работы:", suffix: "лет" },
        { key: "workSchedule", type: "text", label: "График работы:" },
        { key: "services", type: "text", label: "Виды предлагаемых услуг:" },
      ]
    },
  ],
  // === Животные ===
  pets: [
    {
      title: "О питомце",
      fields: [
        { key: "breed", type: "text", label: "Порода:" },
        { key: "gender", type: "text" },
        { key: "age", type: "text" },
        { key: "color", type: "text", label: "Окрас:" },
      ]
    }
  ],
  
  // === Бизнес ===
  ready_business: [
    {
      title: "О бизнесе",
      fields: [
        { key: "dealGoal", type: "text", label: "Цель сделки:" },
        { key: "businessStatus", type: "text", label: "Состояние:" },
        { key: "payback", type: "text", label: "Срок окупаемости:" },
        { key: "businessAge", type: "text", label: "Возраст бизнеса:" },
        { key: "legalForm", type: "text", label: "Правовая форма:" },
      ]
    }
  ],
  
  // === Путешествия ===
  tours: [
    {
      title: "О туре",
      fields: [
        { key: "offerType", type: "text", label: "Тип предложения:" },
        { key: "priceFor", type: "text", label: "Цена за:" },
      ]
    }
  ],
};

// ============================================
// 3. УТИЛИТЫ
// ============================================

/**
 * Получает группы полей для конкретной секции
 * @param {string} section — slug секции (apartments, cars, office, uchastok...)
 * @returns {Array} — массив групп с title и fields
 */
export function getFieldGroups(section) {
  return fieldGroups[section] || [];
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
/**
 * Проверяет, является ли значение чипса "активным" (подсвечивать зелёным)
 * @param {any} chip — значение чипса
 * @param {string} key — ключ поля (например: 'communications', 'additional')
 * @returns {boolean}
 */
export function isChipActive(chip, key, rawValue) {
  // Если передан rawValue (массив объектов), ищем по имени
  if (Array.isArray(rawValue)) {
    const found = rawValue.find(item => item.name === chip || item === chip);
    if (found && typeof found === 'object') {
      return found.value === true || found.active === true || found.enabled === true;
    }
  }
  
  // Обычная логика для строк/булевых
  if (typeof chip === 'boolean') return chip;
  if (typeof chip === 'string') {
    const positive = ['есть', 'да', 'yes', 'включено', 'подключено', 'активно', 'присутствует', 'имеется', 'доступно', 'работает', 'true', '1', 'on'];
    return positive.includes(chip.toLowerCase().trim());
  }
  if (typeof chip === 'number') return chip > 0;
  
  return false;
}

export function formatValue(value, type, suffix, key) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  // На ходу
  if (key === "isOnTheGo") {
    const isTrue =
      value === true ||
      value === "true" ||
      value === 1 ||
      value === "1";

    return isTrue ? "На ходу" : "Не на ходу";
  }

  // Услуги
  if (key === "services") {
    if (Array.isArray(value)) {
      return [
        ...new Set(
          value
            .map(item => {
              if (typeof item === "string") return item.trim();
              return item?.text || item?.name || "";
            })
            .filter(Boolean)
        )
      ];
    }

    if (typeof value === "string") {
      return [
        ...new Set(
          value
            .split(",")
            .map(item => item.trim())
            .filter(Boolean)
        )
      ];
    }

    return [String(value)];
  }

  // График работы
  if (key === "workSchedule") {
    if (!Array.isArray(value)) {
      return String(value);
    }

    return value
      .map(item => {
        if (!item || typeof item !== "object") {
          return String(item);
        }

        if (item.is24h) {
          return "Круглосуточно";
        }

        const days = formatWorkDays(item.fromDay, item.toDay);

        const time =
          item.fromTime && item.toTime
            ? `${item.fromTime}–${item.toTime}`
            : "";

        return [days, time].filter(Boolean).join(", ");
      })
      .filter(Boolean)
      .join("; ");
  }
  if (key === "workExperience") {
    const years = Number(value);

    if (!Number.isNaN(years)) {
      const lastTwo = years % 100;
      const last = years % 10;

      let word = "лет";

      if (lastTwo < 11 || lastTwo > 14) {
        if (last === 1) word = "год";
        else if (last >= 2 && last <= 4) word = "года";
      }

      return `${years} ${word}`;
    }
  }
  // Chips
  if (type === "chips") {
    if (Array.isArray(value) && value[0]?.name) {
      return value.map(item => item.name || item);
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    }

    return [String(value)];
  }
  if (typeof value === "boolean") {
    return value ? "Есть" : "Нет";
  }
  if (
    suffix &&
    (
      typeof value === "number" ||
      !isNaN(Number(value))
    )
  ) {
    return `${value} ${suffix}`;
  }
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === "object" ? item?.name || item?.text || "" : String(item)))
      .filter(Boolean)
      .join(", ");
  }

  return String(value);
}
function formatWorkDays(fromDay, toDay) {
  const days = {
    1: "Пн",
    2: "Вт",
    3: "Ср",
    4: "Чт",
    5: "Пт",
    6: "Сб",
    7: "Вс",
  };

  if (!fromDay || !toDay) {
    return "";
  }

  if (fromDay === toDay) {
    return days[fromDay] || "";
  }

  // Пн–Пт
  if (fromDay === 1 && toDay === 5) {
    return "Пн–Пт";
  }

  // Пн–Сб
  if (fromDay === 1 && toDay === 6) {
    return "Пн–Сб";
  }

  // Пн–Вс
  if (fromDay === 1 && toDay === 7) {
    return "Пн–Вс";
  }

  return `${days[fromDay] || fromDay}–${days[toDay] || toDay}`;
}