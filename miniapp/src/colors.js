// Variant rangi: admin panelda tanlangan HEX, bo'lmasa nomidan taxmin qilinadi
// ("Qora", "Ko'k", "Черный" ...). admin/src/colors.js bilan bir xil — ikkalasini yangilang.
const NAMES = [
  [/qora|black|черн|чёрн|블랙|검정/i, '#1b1b1d'],
  [/oq\b|^oq|white|бел|화이트|흰/i, '#f5f5f2'],
  [/kulrang|gr[ae]y|сер|그레이|회색/i, '#9a9a9e'],
  [/ko.?k|blue|navy|син|голуб|블루|파랑|네이비/i, '#2f5fb3'],
  [/yashil|green|зел|그린|초록/i, '#3c8c5a'],
  [/qizil|red|красн|레드|빨강/i, '#c8343a'],
  [/to.?q sariq|orange|оранж|오렌지|주황/i, '#e07b2c'],
  [/sariq|yellow|жёлт|желт|옐로|노랑/i, '#e8c43a'],
  [/jigarrang|brown|корич|브라운|갈색|havana|tortoise|черепах/i, '#7a4b2a'],
  [/pushti|pink|розов|핑크/i, '#e79ab0'],
  [/binafsha|purple|violet|фиолет|퍼플|보라/i, '#7a4fb0'],
  [/oltin|gold|золот|골드/i, '#d6ae51'],
  [/kumush|silver|серебр|실버|은색/i, '#c7c9cc'],
  [/bej|beige|беж|베이지|krem|cream/i, '#e3d3b4'],
];

export function colorOf(variant) {
  if (variant?.color) return variant.color;
  const label = String(variant?.label || '');
  // "Yashil gradient", "Ko'k gradient" kabi nomlarda birinchi mos rang olinadi
  for (const [re, hex] of NAMES) if (re.test(label)) return hex;
  return null;
}
