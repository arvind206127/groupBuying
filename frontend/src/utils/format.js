export const formatCurrency = (val) => {
  if (val === undefined || val === null) return '₹0';
  const num = parseFloat(val);
  if (isNaN(num)) return '₹0';

  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lac`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatPriceShort = (val) => {
  if (val === undefined || val === null) return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';

  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(num);
};
