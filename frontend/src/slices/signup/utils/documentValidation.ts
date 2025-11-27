/**
 * Document number validation utility
 * Validates document numbers based on document type and country conventions
 */

interface DocumentValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Document validation rules by type
 *
 * CC (Cédula de Ciudadanía - Colombia):
 *   - Numbers only
 *   - 6-11 digits
 *
 * DNI (Documento Nacional de Identidad - International):
 *   - Alphanumeric (letters + numbers)
 *   - May include hyphens (for formats like Chile's RUT: 12345678-K)
 *   - 6-20 characters (accommodates various country formats)
 *   Examples:
 *     - Spain: 12345678A (8 digits + 1 letter)
 *     - Argentina/Peru: 12345678 (7-8 digits)
 *     - Chile RUT: 12345678-K (8 digits + hyphen + check digit)
 *     - Mexico CURP: 18 alphanumeric characters
 *     - Italy: CA12345AA (alphanumeric)
 *
 * PA (Passport - International):
 *   - Alphanumeric
 *   - 5-15 characters
 */

const VALIDATION_RULES: Record<string, {
  pattern: RegExp;
  minLength: number;
  maxLength: number;
  errorKey: string;
}> = {
  // Colombian Citizenship Card - numbers only
  CC: {
    pattern: /^[0-9]+$/,
    minLength: 6,
    maxLength: 11,
    errorKey: 'ccInvalid'
  },
  // National ID (DNI) - alphanumeric with optional hyphens
  DNI: {
    pattern: /^[A-Za-z0-9-]+$/,
    minLength: 6,
    maxLength: 20,
    errorKey: 'dniInvalid'
  },
  // Passport - alphanumeric
  PA: {
    pattern: /^[A-Za-z0-9]+$/,
    minLength: 5,
    maxLength: 15,
    errorKey: 'passportInvalid'
  },
  // Identity Card (Tarjeta de Identidad - Colombia) - numbers only
  TI: {
    pattern: /^[0-9]+$/,
    minLength: 6,
    maxLength: 11,
    errorKey: 'tiInvalid'
  },
  // Foreign ID (Cédula de Extranjería - Colombia) - numbers only
  CE: {
    pattern: /^[0-9]+$/,
    minLength: 6,
    maxLength: 11,
    errorKey: 'ceInvalid'
  },
  // Default fallback - alphanumeric
  DEFAULT: {
    pattern: /^[A-Za-z0-9-]+$/,
    minLength: 6,
    maxLength: 20,
    errorKey: 'documentInvalid'
  }
};

/**
 * Validates a document number based on document type
 * @param documentNumber - The document number to validate
 * @param documentType - The type of document (CC, DNI, PA, etc.)
 * @returns Validation result with isValid and optional error key
 */
export function validateDocumentNumber(
  documentNumber: string,
  documentType: string
): DocumentValidationResult {
  if (!documentNumber || !documentNumber.trim()) {
    return { isValid: false, error: 'required' };
  }

  const trimmed = documentNumber.trim();
  const rules = VALIDATION_RULES[documentType] || VALIDATION_RULES.DEFAULT;

  // Check length
  if (trimmed.length < rules.minLength) {
    return { isValid: false, error: 'tooShort' };
  }

  if (trimmed.length > rules.maxLength) {
    return { isValid: false, error: 'tooLong' };
  }

  // Check pattern
  if (!rules.pattern.test(trimmed)) {
    return { isValid: false, error: rules.errorKey };
  }

  return { isValid: true };
}

/**
 * Gets the validation rules for a document type
 * @param documentType - The document type code
 * @returns The validation rules for the document type
 */
export function getDocumentValidationRules(documentType: string) {
  return VALIDATION_RULES[documentType] || VALIDATION_RULES.DEFAULT;
}

/**
 * Checks if a document type allows letters
 * @param documentType - The document type code
 * @returns true if the document type allows letters
 */
export function documentTypeAllowsLetters(documentType: string): boolean {
  const rules = VALIDATION_RULES[documentType] || VALIDATION_RULES.DEFAULT;
  // Check if the pattern allows letters (A-Za-z)
  return rules.pattern.source.includes('A-Za-z');
}
