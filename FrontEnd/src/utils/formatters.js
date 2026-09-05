export function formatWeight(kg) {
  return `${Number(kg).toLocaleString("en-IN")} kg`;
}

export function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

export function formatCurrency(value) {
  return `\u20b9${Number(value).toLocaleString("en-IN")}`;
}

export function parseRateValue(val) {
  if (val == null || val === "") return 0;
  let str = String(val).trim();
  if (!str) return 0;

  // If both comma and dot exist
  if (str.includes(",") && str.includes(".")) {
    const lastComma = str.lastIndexOf(",");
    const lastDot = str.lastIndexOf(".");
    if (lastDot > lastComma) {
      str = str.replace(/,/g, "");
    } else {
      str = str.replace(/\./g, "").replace(",", ".");
    }
  } else if (str.includes(",")) {
    const parts = str.split(",");
    if (parts.length === 2) {
      if (parts[1].length === 2) {
        str = parts[0] + "." + parts[1];
      } else if (parts[1].length === 5) {
        // e.g. "6,05593" -> "6055.93"
        str = parts[0] + parts[1].slice(0, 3) + "." + parts[1].slice(3);
      } else if (parts[1].length === 3) {
        str = str.replace(/,/g, "");
      } else {
        str = str.replace(",", ".");
      }
    } else {
      str = str.replace(/,/g, "");
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function formatRate(value) {
  const num = parseRateValue(value);
  return num.toFixed(2);
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function convertLessThanThousand(n) {
  let str = "";
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  } else if (n > 0) {
    str += ONES[n];
  }
  return str.trim();
}

function convertIntPart(integerPart) {
  let result = "";
  if (integerPart >= 10000000) {
    const crores = Math.floor(integerPart / 10000000);
    result += convertIntPart(crores) + " Crore ";
    integerPart %= 10000000;
  }
  if (integerPart >= 100000) {
    const lakhs = Math.floor(integerPart / 100000);
    result += convertLessThanThousand(lakhs) + " Lakh ";
    integerPart %= 100000;
  }
  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    result += convertLessThanThousand(thousands) + " Thousand ";
    integerPart %= 1000;
  }
  if (integerPart > 0) {
    result += convertLessThanThousand(integerPart);
  }
  return result.trim();
}

export function numberToWordsINR(num) {
  if (num == null || isNaN(num) || num <= 0) return "";
  const total = Math.round(Number(num) * 100) / 100;
  let integerPart = Math.floor(total);
  const paise = Math.round((total - integerPart) * 100);

  const result = convertIntPart(integerPart);
  let words = "INR " + (result || "Zero");
  if (paise > 0) {
    words += " and " + convertLessThanThousand(paise) + " Paise";
  }
  return words + " Only";
}
