export function calculateGST(
  price: number,
  qty: number,
  discount: number,
  gstRate: number,
  sellerStateCode: string,
  buyerStateCode: string
) {
  const taxableValue = price * qty - discount;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (sellerStateCode === buyerStateCode) {
    cgst = (taxableValue * (gstRate / 2)) / 100;
    sgst = (taxableValue * (gstRate / 2)) / 100;
  } else {
    igst = (taxableValue * gstRate) / 100;
  }

  const lineTotal = taxableValue + cgst + sgst + igst;

  return {
    taxableValue,
    cgst,
    sgst,
    igst,
    lineTotal,
  };
}

export function numberToWords(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "");
  }

  const [integerPart, fractionalPart] = num.toFixed(2).split(".");
  let result = inWords(parseInt(integerPart)) + " Rupees";
  
  if (parseInt(fractionalPart) > 0) {
    result += " and " + inWords(parseInt(fractionalPart)) + " Paisa";
  }
  
  return result + " Only";
}

export function getFinancialYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month < 3) {
    return `${year - 1}-${year.toString().slice(-2)}`;
  } else {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }
}
