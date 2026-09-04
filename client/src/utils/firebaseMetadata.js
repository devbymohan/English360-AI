/**
 * Safe Base64 encoding supporting browser and node environments with UTF-8
 */
export const safeBase64Encode = (str) => {
  try {
    if (typeof window !== 'undefined' && window.btoa) {
      return window.btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode('0x' + p1)
        )
      );
    }
    return Buffer.from(str, 'utf8').toString('base64');
  } catch (e) {
    return '';
  }
};

/**
 * Safe Base64 decoding supporting browser and node environments with UTF-8
 */
export const safeBase64Decode = (b64) => {
  try {
    if (typeof window !== 'undefined' && window.atob) {
      return decodeURIComponent(
        Array.prototype.map
          .call(window.atob(b64), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }
    return Buffer.from(b64, 'base64').toString('utf8');
  } catch (e) {
    return null;
  }
};

/**
 * Strips the #e360= metadata hash from a photoURL, returning a clean image URL.
 */
export const getCleanPhotoURL = (photoURL) => {
  if (!photoURL || typeof photoURL !== 'string') return '';
  const hashIdx = photoURL.indexOf('#e360=');
  if (hashIdx === -1) return photoURL;
  return photoURL.slice(0, hashIdx).trim();
};

/**
 * Parses user assessment & progress metadata stored in a Firebase photoURL hash fragment.
 */
export const parseUserMetadata = (photoURL) => {
  if (!photoURL || typeof photoURL !== 'string') return null;
  const hashIdx = photoURL.indexOf('#e360=');
  if (hashIdx === -1) return null;
  const raw = photoURL.slice(hashIdx + 6);
  const jsonStr = safeBase64Decode(raw);
  if (!jsonStr) return null;
  try {
    const data = JSON.parse(jsonStr);
    const level = data.lvl || data.level || 'Not Assessed';
    const overallScore = data.sc ?? data.overallScore ?? 0;
    const assessmentCompleted = Boolean(data.ac ?? data.assessmentCompleted);
    const streak = data.st ?? data.streak ?? 0;
    return {
      level,
      englishLevel: level,
      overallScore,
      assessmentCompleted,
      streak,
      grammarScore: data.g ?? data.grammarScore ?? 80,
      vocabularyScore: data.v ?? data.vocabularyScore ?? 75,
      readingScore: data.r ?? data.readingScore ?? 85,
      writingScore: data.w ?? data.writingScore ?? 70,
      listeningScore: data.l ?? data.listeningScore ?? 80,
    };
  } catch (e) {
    return null;
  }
};

/**
 * Merges and encodes user progress metadata onto the photoURL via #e360=...
 */
export const buildPhotoURLWithMetadata = (currentPhotoURL, metadata = {}) => {
  const cleanBase = getCleanPhotoURL(currentPhotoURL);
  const existing = parseUserMetadata(currentPhotoURL) || {};
  const merged = { ...existing, ...metadata };

  const level = merged.level || merged.englishLevel || 'Not Assessed';
  const overallScore = merged.overallScore ?? 0;
  const assessmentCompleted = Boolean(merged.assessmentCompleted || (level !== 'Not Assessed'));
  const streak = merged.streak ?? 0;

  const payload = {
    lvl: level,
    sc: overallScore,
    ac: assessmentCompleted ? 1 : 0,
    st: streak,
    g: merged.grammarScore ?? 80,
    v: merged.vocabularyScore ?? 75,
    r: merged.readingScore ?? 85,
    w: merged.writingScore ?? 70,
    l: merged.listeningScore ?? 80,
  };

  const encoded = safeBase64Encode(JSON.stringify(payload));
  return cleanBase ? `${cleanBase}#e360=${encoded}` : `#e360=${encoded}`;
};
