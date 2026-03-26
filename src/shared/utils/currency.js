// Utilities for parsing and formatting currency across the frontend
export const parsePrice = (p) => {
  if (p == null) return 0;
  if (typeof p === 'object' && p !== null && ('$numberDecimal' in p)) {
    const n = Number(p.$numberDecimal);
    return Number.isNaN(n) ? 0 : n;
  }
  const n = Number(p);
  return Number.isNaN(n) ? 0 : n;
};

export const formatCurrency = (value, locale = 'vi-VN') => {
  if (value == null) return '-';
  const num = typeof value === 'number' ? value : parsePrice(value);
  if (Number.isNaN(num)) return '-';
  // Use Intl.NumberFormat for proper grouping. Append ₫ for consistency.
  return new Intl.NumberFormat(locale).format(num) + '₫';
};

export default {
  parsePrice,
  formatCurrency,
};
