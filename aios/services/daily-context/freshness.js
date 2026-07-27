const HOUR = 60 * 60 * 1000;
const TIMEZONE = 'Asia/Hong_Kong';

export function hongKongDate(value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(value);
}

export function parseTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function withinExplicitValidity(record, now) {
  const validUntil = parseTimestamp(record.valid_until || record.validUntil);
  return Boolean(validUntil && now <= validUntil);
}

export function scoreWeatherFreshness(record, now = new Date()) {
  const timestamp = parseTimestamp(record.source_timestamp);
  if (!timestamp) return { score: 0, usable: false, reason: 'missing_timestamp' };
  if (hongKongDate(timestamp) !== hongKongDate(now)) {
    return { score: 0, usable: false, reason: 'previous_day_weather' };
  }
  const age = now.getTime() - timestamp.getTime();
  if (age < -5 * 60 * 1000) return { score: 0, usable: false, reason: 'future_timestamp' };
  if (age <= 2 * HOUR) return { score: 100, usable: true, reason: null };
  if (age <= 3 * HOUR) return { score: 85, usable: true, reason: null };
  if (age <= 4 * HOUR && withinExplicitValidity(record, now)) {
    return { score: 60, usable: true, reason: null };
  }
  return {
    score: age <= 4 * HOUR ? 60 : 0,
    usable: false,
    reason: age <= 4 * HOUR ? 'validity_period_required' : 'weather_older_than_4h'
  };
}

export function scoreNewsFreshness(record, now = new Date()) {
  const timestamp = parseTimestamp(record.source_timestamp);
  if (!timestamp) return { score: 0, usable: false, reason: 'missing_timestamp' };
  const age = now.getTime() - timestamp.getTime();
  if (age < -5 * 60 * 1000) return { score: 0, usable: false, reason: 'future_timestamp' };
  const sameDay = hongKongDate(timestamp) === hongKongDate(now);
  if (!sameDay) {
    const continuing = record.continuing === true && withinExplicitValidity(record, now);
    return continuing
      ? { score: 60, usable: true, reason: null }
      : { score: 0, usable: false, reason: 'previous_day_news' };
  }
  if (age < 6 * HOUR) return { score: 100, usable: true, reason: null };
  if (age <= 12 * HOUR) return { score: 80, usable: true, reason: null };
  return { score: 60, usable: true, reason: null };
}

export function scoreTransportFreshness(record, now = new Date()) {
  const timestamp = parseTimestamp(record.source_timestamp);
  if (!timestamp) return { score: 0, usable: false, reason: 'missing_timestamp' };
  const age = now.getTime() - timestamp.getTime();
  if (age < -5 * 60 * 1000) return { score: 0, usable: false, reason: 'future_timestamp' };
  if (age < HOUR) return { score: 100, usable: true, reason: null };
  if (age <= 3 * HOUR) return { score: 80, usable: true, reason: null };
  if (withinExplicitValidity(record, now)) return { score: 60, usable: true, reason: null };
  return { score: 0, usable: false, reason: 'transport_older_than_3h' };
}

export function scoreFreshness(record, now = new Date()) {
  if (record.record_type === 'weather' || record.record_type === 'warning') {
    return scoreWeatherFreshness(record, now);
  }
  if (record.record_type === 'transport' || record.record_type === 'southside') {
    return scoreTransportFreshness(record, now);
  }
  return scoreNewsFreshness(record, now);
}
