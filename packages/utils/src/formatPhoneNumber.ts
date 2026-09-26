export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';

  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length < 4) return phoneNumber;

  switch (cleaned.length) {
    case 7:
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;

    case 10:
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;

    case 11:
      if (cleaned.startsWith('1')) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
      }
      return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;

    case 12:
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;

    case 13:
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;

    default:
      if (cleaned.length > 13) {
        return `+${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
      } else if (cleaned.length > 10) {
        const ccLen = cleaned.length - 10;
        return `+${cleaned.slice(0, ccLen)} ${cleaned.slice(ccLen, ccLen + 3)} ${cleaned.slice(ccLen + 3, ccLen + 6)} ${cleaned.slice(ccLen + 6)}`;
      } else {
        const first = Math.min(3, cleaned.length - 4);
        const second = Math.min(3, cleaned.length - first);
        return `${cleaned.slice(0, first)} ${cleaned.slice(first, first + second)} ${cleaned.slice(first + second)}`;
      }
  }
};
