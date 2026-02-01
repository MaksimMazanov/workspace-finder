export const normalizeEmployeeLabel = (value: string) => {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/coworking[-\s]*\d*/i.test(text)) return 'Коворкинг';
  return text;
};

export const getEmployeeLabelStyle = (value: string) => {
  const normalized = normalizeEmployeeLabel(value);
  const text = String(normalized || value || '').trim().toLowerCase();
  if (!text) return {};
  if (text.includes('коворкинг')) {
    return { color: 'green.600', fontWeight: 'semibold' as const };
  }
  if (text.includes('coworking')) {
    return { color: 'green.600', fontWeight: 'semibold' as const };
  }
  if (text.includes('резерв')) {
    return { fontWeight: 'semibold' as const };
  }
  if (text.includes('ваканс')) {
    return { color: 'gray.600', fontWeight: 'semibold' as const };
  }
  return {};
};

const departmentAliases = new Map<string, string>([
  ['Блок "Технологии"', 'Технологии'],
  ['Департамент данных и общ. сервис. ИТ B2C', 'В2С ДиОС'],
  ['Департамент инвестиционного бизнеса', 'ИБ'],
  ['Департамент инфраст. решений (SberInfra)', 'SberInfra'],
  ['Департамент ИТ блока "КИБ"', 'КИБ'],
  ['Департамент ИТ блока "Люди и культура"', 'Стажерство'],
  ['Департамент ИТ блока "Разв.кл.опыта B2C"', 'В2С Разв.кл.опыта'],
  ['Департамент ИТ блока "Сеть продаж"', 'СП'],
  ['Департамент ИТ блока "Строительство"', 'Строительство'],
  ['Департамент ИТ блока "Транз.банкинг B2C"', 'В2С Транз.банкинг'],
  ['Департамент ИТ блока "Финансы"', 'Финансы'],
  ['Департамент ИТ блока С и безопасности', 'СИБ'],
  ['Департамент ИТ блока УБ', 'УБ'],
  ['Департамент ИТ блока GR, УВА, ДМиК, БСР', 'GR'],
  ['Департамент ИТ блоков "Риски" и раб.с ПА', 'Риски'],
  ['Департамент ИТ Operations', 'Operations'],
  ['Департамент общих ИТ-сервисов', 'ОИТС'],
  ['Департамент совр.циф.польз.реш(SberUser)', 'SberUser'],
  ['Департамент тех.развития и коорд.дея-ти', 'ТРиКД'],
  ['Департамент управления данными (SberData', 'SberData'],
  ['Дивизион "Эквайринг"', 'В2С Эквайринг'],
  ['Дирекция ИТ "Забота о клиентах"', 'В2С Забота о клиентах'],
  ['Дирекция ИТ "Занять и сберегать"', 'В2С Занять и сберегать'],
  ['Дирекция ИТ "Цифровые каналы B2C"', 'В2С Цифровые каналы']
]);

export const normalizeDepartmentLabel = (value: string) => {
  const text = String(value || '').trim();
  if (!text) return '';
  return departmentAliases.get(text) || text;
};
