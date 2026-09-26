const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const DEFAULT_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/** Format a date as a localised date string. Pass `options` to customise the output. */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => new Date(date).toLocaleDateString('en-US', options ?? DEFAULT_DATE_OPTIONS);

/** Format a date as a localised date-and-time string. */
export const formatDateTime = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => new Date(date).toLocaleString('en-US', options ?? DEFAULT_DATETIME_OPTIONS);
