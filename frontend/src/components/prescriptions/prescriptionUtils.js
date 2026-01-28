// Translation helper for print/PDF - English to Marathi
export const translateToMarathi = (text) => {
  if (!text) return 'डॉक्टरांच्या सल्ल्यानुसार';

  const translations = {
    // Instructions
    'before food': 'जेवणापूर्वी',
    'after food': 'जेवणानंतर',
    'empty stomach': 'रिकाम्या पोटी',
    'with milk': 'दुधासोबत',
    'with water': 'पाण्यासोबत',
    'with lukewarm water': 'कोमट पाण्यासोबत',
    'with hot water': 'गरम पाण्यासोबत',
    'before sleep': 'झोपण्यापूर्वी',
    'at bedtime': 'झोपण्यापूर्वी',
    'with honey': 'मधासोबत',
    'with ghee': 'तुपासोबत',
    'chew': 'चघळून खा',
    'as needed': 'गरजेनुसार',
    'sos': 'गरजेनुसार',
    'external use': 'बाह्य वापरासाठी',
    'apply on affected area': 'प्रभावित भागावर लावा',
    'as directed': 'डॉक्टरांच्या सल्ल्यानुसार',
    'as directed by physician': 'डॉक्टरांच्या सल्ल्यानुसार',
    'once daily': 'दिवसातून एकदा',
    'twice daily': 'दिवसातून दोनदा',
    'thrice daily': 'दिवसातून तीनदा',
    'morning': 'सकाळी',
    'afternoon': 'दुपारी',
    'evening': 'संध्याकाळी',
    'night': 'रात्री',
    // Dosage related
    'tablet': 'गोळी',
    'tablets': 'गोळ्या',
    'capsule': 'कॅप्सूल',
    'capsules': 'कॅप्सूल',
    'syrup': 'सिरप',
    'ml': 'मिली',
    'drops': 'थेंब',
    'teaspoon': 'चमचा',
    'tablespoon': 'मोठा चमचा',
    // Time
    'days': 'दिवस',
    'day': 'दिवस',
    'week': 'आठवडा',
    'weeks': 'आठवडे',
    'month': 'महिना',
    'months': 'महिने',
    // Gender
    'male': 'पुरुष',
    'female': 'स्त्री',
    'other': 'इतर',
    // Common
    'years': 'वर्षे',
    'yrs': 'वर्षे',
  };

  let result = text.toLowerCase();

  // Check for exact match first
  if (translations[result]) {
    return translations[result];
  }

  // Replace all matching words
  Object.keys(translations).forEach(eng => {
    const regex = new RegExp(eng, 'gi');
    result = result.replace(regex, translations[eng]);
  });

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// Translate dosage to Marathi
export const translateDosage = (dosageStr) => {
  if (!dosageStr) return '';
  let result = dosageStr;

  // Replace common patterns
  result = result.replace(/morning/gi, 'सकाळी');
  result = result.replace(/afternoon/gi, 'दुपारी');
  result = result.replace(/evening/gi, 'संध्याकाळी');
  result = result.replace(/night/gi, 'रात्री');

  return result;
};

// Helper function to format clinic timings for display
export const formatClinicTimings = (timings, asObject = false) => {
  if (!timings || !Array.isArray(timings)) return asObject ? { doubleLine: [], singleLine: [] } : '';

  const openDays = timings.filter(t => t.isOpen);
  if (openDays.length === 0) return asObject ? { doubleLine: [], singleLine: [] } : '';

  // Format time from 24hr to 12hr
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${displayHour}:${minutes}${suffix}`;
  };

  // Get time slots string for a day
  const getTimeSlots = (day) => {
    if (day.slotType === 'single') {
      return day.singleStart && day.singleEnd
        ? `${formatTime(day.singleStart)}-${formatTime(day.singleEnd)}`
        : '';
    } else {
      const morningSlot = day.morningStart && day.morningEnd
        ? `${formatTime(day.morningStart)}-${formatTime(day.morningEnd)}`
        : '';
      const eveningSlot = day.eveningStart && day.eveningEnd
        ? `${formatTime(day.eveningStart)}-${formatTime(day.eveningEnd)}`
        : '';
      return [morningSlot, eveningSlot].filter(Boolean).join(', ');
    }
  };

  // Check if two days have same timing config
  const sameTiming = (a, b) => {
    if (a.slotType !== b.slotType) return false;
    if (a.slotType === 'single') {
      return a.singleStart === b.singleStart && a.singleEnd === b.singleEnd;
    }
    return a.morningStart === b.morningStart && a.morningEnd === b.morningEnd &&
           a.eveningStart === b.eveningStart && a.eveningEnd === b.eveningEnd;
  };

  const dayAbbr = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

  const doubleParts = []; // Morning + Evening slots
  const singleParts = []; // Single slots (separate line)

  let i = 0;
  while (i < openDays.length) {
    const current = openDays[i];
    let j = i;
    // Find consecutive days with same timings
    while (j < openDays.length - 1 && sameTiming(openDays[j + 1], current)) {
      j++;
    }

    const dayRange = i === j
      ? dayAbbr[current.day]
      : `${dayAbbr[current.day]}-${dayAbbr[openDays[j].day]}`;

    const timeSlots = getTimeSlots(current);
    if (timeSlots) {
      if (current.slotType === 'single') {
        singleParts.push(`${dayRange}: ${timeSlots}`);
      } else {
        doubleParts.push(`${dayRange}: ${timeSlots}`);
      }
    }

    i = j + 1;
  }

  if (asObject) {
    return { doubleLine: doubleParts, singleLine: singleParts };
  }

  // For simple string output (PDF), combine with line break indicator
  const allParts = [...doubleParts];
  if (singleParts.length > 0) {
    allParts.push(...singleParts);
  }
  return allParts.join(' | ');
};
