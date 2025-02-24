export function fNumber(number) {
  return new Intl.NumberFormat('ru-RU').format(number);
}

export function fCurrency(number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD'
  }).format(number);
}

export function fPercent(number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number / 100);
}
