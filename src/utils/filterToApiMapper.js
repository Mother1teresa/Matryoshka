// /src/utils/filterToApiMapper.js

export const employmentMap = {
  'Полная': 'FullTime', 'Частичная': 'PartTime', 'Временная': 'Temporary', 'Стажировка': 'Internship',
  'FullTime': 'FullTime', 'PartTime': 'PartTime', 'Temporary': 'Temporary', 'Internship': 'Internship',
  'Полная занятость': 'FullTime', 'Частичная занятость': 'PartTime',
};
export const workFormatMap = {
  'Удалённо': 'Outsource', 'В офисе': 'Office', 'Гибрид': 'Hybride',
  'Удалёнка': 'Outsource', 'Полный день': 'Office', 'Сменный': 'Office',
  'В офисе или на предприятии': 'Office',
  'Outsource': 'Outsource', 'Office': 'Office', 'Hybride': 'Hybride',
};
export const propertyTypeMap = {
  'Кирпичный': 'Brick', 'Панельный': 'Panel', 'Монолитный': 'Monolith',
  'Brick': 'Brick', 'Panel': 'Panel', 'Monolith': 'Monolith',
  'Кирпич': 'Brick', 'Дерево': 'Wood', 'Газобетон': 'GasConcrete', 'Каркас': 'Frame',
};
export const vehicleKppMap = {
  'Механика': 'Manual', 'Автомат': 'Automatic', 'Робот': 'Robot', 'Вариатор': 'Variable',
  'Manual': 'Manual', 'Automatic': 'Automatic', 'Robot': 'Robot', 'Variable': 'Variable',
};
export const driveMap = {
  'Передний': 'Front', 'Задний': 'Rear', 'Полный': 'Full',
  'Front': 'Front', 'Rear': 'Rear', 'Full': 'Full',
};
export const vesselTypeMap = {
  'Лодка': 'Boat', 'Моторная яхта': 'MotorYacht', 'Парусная яхта': 'SailingYacht', 'Судно': 'Vessels',
  'Boat': 'Boat', 'MotorYacht': 'MotorYacht', 'SailingYacht': 'SailingYacht', 'Vessels': 'Vessels',
  'Катамаран': 'Boat', 'Тримаран': 'Boat', 'Каютный катер': 'Boat', 'Рыболовное судно': 'Vessels',
};
export const paymentTypeMap = {
  'Полная': 'Full', 'Торг': 'Trade', 'Ипотека': 'Mortgage', 'Рассрочка': 'InstallmentPlan',
  'Наличные': 'Full', 'Безналичные': 'InstallmentPlan', 'Мат. капитал': 'Trade',
  'Full': 'Full', 'Trade': 'Trade', 'Mortgage': 'Mortgage', 'InstallmentPlan': 'InstallmentPlan',
  'Купить': 'Full', 'Снять': 'Full', 'Продажа': 'Full', 'Аренда': 'Full', 'Субаренда': 'InstallmentPlan',
};
export const businessFormMap = {
  'ИП': 'IE', 'ООО': 'LLC', 'АО': 'JSC', 'Другое': 'Other',
  'IE': 'IE', 'LLC': 'LLC', 'JSC': 'JSC', 'Other': 'Other',
};
export const offerTypeMap = {
  'Тур': 'Tour', 'Экскурсия': 'Excursion', 'Выходной тур': 'WeekendTour',
  'Авторский тур': 'SignatureTour', 'Трансфер': 'Transfer',
  'Аренда жилья': 'HousingRental', 'Путешествие': 'Travel',
  'Tour': 'Tour', 'Excursion': 'Excursion', 'WeekendTour': 'WeekendTour',
  'SignatureTour': 'SignatureTour', 'Transfer': 'Transfer',
  'HousingRental': 'HousingRental', 'Travel': 'Travel',
  'Туры и экскурсии': 'Tour', 'Авиабилеты': 'Excursion',
  'Ж/Д и автобусные билеты': 'Transfer', 'Отели и жильё': 'HousingRental',
  'Прокат транспорта': 'Transfer', 'Визы и документы': 'Tour',
  'Трансферы и такси': 'Transfer', 'Круизы': 'Tour',
  'Экстрим и приключения': 'SignatureTour', 'Путеводители и гиды': 'Excursion',
};
export const transactionScopeMap = {
  'В аренду': 'Meet', 'Продать': 'Sell', 'Найти партнёра': 'FindPartner',
  'Meet': 'Meet', 'Sell': 'Sell', 'FindPartner': 'FindPartner',
  'В аренду': 'Meet', 'Продажа': 'Sell', 'Партнерство': 'FindPartner',
};
export const steeringWheelMap = {
  'Не важно': 'DoesntMatter', 'Левый': 'Left', 'Правый': 'Right',
  'DoesntMatter': 'DoesntMatter', 'Left': 'Left', 'Right': 'Right',
};
export const coolingMap = {
  'Воздушное': 'Air', 'Жидкостное': 'Liquid',
  'Air': 'Air', 'Liquid': 'Liquid',
};
export const genderMap = {
  'Мужской': 'Male', 'Женский': 'Female',
  'Male': 'Male', 'Female': 'Female',
};
export const houseStateMap = {
  'Под ключ': 'EuroRepairs', 'Нужен ремонт': 'NeedRepairs',
  'Черновая отделка': 'RoughFinish', 'Косметический ремонт': 'CosmeticRepairs',
  'EuroRepairs': 'EuroRepairs', 'NeedRepairs': 'NeedRepairs',
  'RoughFinish': 'RoughFinish', 'CosmeticRepairs': 'CosmeticRepairs',
  'Чистый': 'EuroRepairs', 'Застроен': 'CosmeticRepairs', 'Запущен': 'NeedRepairs',
};
export const engineTypeMap = {
  'Бензин': 'Gasoline', 'Дизель': 'Diesel', 'Гибрид': 'Hybrid', 'Электро': 'Electric',
  'Gasoline': 'Gasoline', 'Diesel': 'Diesel', 'Hybrid': 'Hybrid', 'Electric': 'Electric',
};

const fieldMappers = {
  employment: employmentMap,
  workFormat: workFormatMap,
  propertyType: propertyTypeMap,
  vehicleKpp: vehicleKppMap,
  drive: driveMap,
  vesselType: vesselTypeMap,
  paymentType: paymentTypeMap,
  businessForm: businessFormMap,
  offerType: offerTypeMap,
  transactionScope: transactionScopeMap,
  steeringWheel: steeringWheelMap,
  cooling: coolingMap,
  gender: genderMap,
  houseState: houseStateMap,
  engineType: engineTypeMap,
  subcategory: (val) => val, // пропускаем как есть
  brand: (val) => val,
  model: (val) => val,
  color: (val) => val,
  ownersPts: (val) => Number(val),
};

function extractValue(raw) {
  if (raw && typeof raw === 'object' && 'value' in raw) return raw.value;
  return raw;
}

export function toApiValue(fieldKey, value) {
  const mapper = fieldMappers[fieldKey];
  if (!mapper) return extractValue(value);
  const extracted = extractValue(value);
  if (Array.isArray(extracted)) return extracted.map(v => mapper[v] ?? v);
  return mapper[extracted] ?? extracted;
}
export const API_FILTER_FIELDS = [
  'query', 'priceFrom', 'priceTo',
  'yearOfManufactureFrom', 'yearOfManufactureTo',
  'engineCapacityFrom', 'engineCapacityTo',
  'horsePowerFrom', 'horsePowerTo',
  'totalAreaFrom', 'totalAreaTo',
  'livingAreaFrom', 'livingAreaTo',
  'vesselLengthFrom', 'vesselLengthTo',
  'vesselDraftFrom', 'vesselDraftTo',
  'vesselWidthFrom', 'vesselWidthTo',
  'maxPassengersFrom', 'maxPassengersTo',
  'heightFrom', 'heightTo',
  'hasParking', 'hasElevator', 'hasBalcony', 'hasDocuments',
  'profession', 'sphere', 'employment', 'workFormat',
  'propertyType', 'vehicleKpp', 'drive', 'vesselType',
  'paymentType', 'businessForm', 'offerType', 'transactionScope',
  'houseState', 'engineType', 'steeringWheel', 'cooling',
  'brand', 'model', 'color', 'ownersPts', 'subcategory',
  'userId', 'take'
];
export function buildSearchDto(formData, category, subCategory) {
  const dto = {};
  if (category) dto.category = category;
  if (subCategory) dto.subCategory = subCategory;

  for (const [key, value] of Object.entries(formData)) {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) continue;

    if (key === 'priceFrom' || key === 'priceTo') {
      dto[key] = Number(String(value).replace(/\D/g, '')) || undefined;
      continue;
    }

    // From/To числовые поля — не маппим, просто Number
    if (key.endsWith('From') || key.endsWith('To')) {
      const num = Number(value);
      if (!isNaN(num) && num > 0) dto[key] = num;
      continue;
    }

    // Boolean-поля (hasBalcony, hasElevator, hasParking, hasDocuments)
    if (key.startsWith('has')) {
      dto[key] = value === 'Есть' || value === true || value === 'true';
      continue;
    }

    dto[key] = toApiValue(key, value);
  }

  Object.keys(dto).forEach(k => { if (dto[k] === undefined) delete dto[k]; });
  return dto;
}

