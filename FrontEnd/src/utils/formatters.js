export function formatWeight(kg) {
  return `${Number(kg).toLocaleString("en-IN")} kg`;
}

export function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

export function formatCurrency(value) {
  return `\u20b9${Number(value).toLocaleString("en-IN")}`;
}
