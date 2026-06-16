/* Best-effort integer-to-words for SGD salary figures. Output is a DEFAULT the operator edits —
 * the contract figure is legally load-bearing, so the words field is assist, not authority. */

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function under1000(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : ''));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(' and ');
}

/**
 * 4100 -> "Four Thousand and One Hundred". Accepts "4,100", "4100", "S$4,100".
 * Returns '' for non-positive / unparseable input. Whole dollars only (cents ignored).
 */
export function amountToWords(input: string | number): string {
  const digits = String(input).replace(/[^0-9.]/g, '');
  const n = Math.floor(Number(digits));
  if (!Number.isFinite(n) || n <= 0) return '';

  const groups: Array<[number, string]> = [
    [1_000_000, 'Million'],
    [1_000, 'Thousand'],
  ];
  let rest = n;
  const words: string[] = [];
  for (const [value, name] of groups) {
    if (rest >= value) {
      words.push(`${under1000(Math.floor(rest / value))} ${name}`);
      rest %= value;
    }
  }
  if (rest > 0) words.push(under1000(rest));

  // Join higher groups with "and" before the final sub-1000 remainder (INWW house style:
  // "Four Thousand and One Hundred"). Operator can still edit the result.
  if (words.length > 1) {
    return `${words.slice(0, -1).join(' ')} and ${words[words.length - 1]}`;
  }
  return words[0] ?? '';
}
