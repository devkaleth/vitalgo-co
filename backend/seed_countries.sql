-- VitalGo Countries Data Seed Script
-- Inserts country data with flag emojis, phone codes, and English names
-- Starting with Colombia and nearby Latin American countries

BEGIN;

-- Insert countries starting with Colombia, then nearby countries, then rest of Americas, then other continents
INSERT INTO countries (name, name_en, code, flag_emoji, phone_code, is_active) VALUES
-- Colombia first
('Colombia', 'Colombia', 'CO', '🇨🇴', '+57', true),

-- Países limítrofes con Colombia
('Venezuela', 'Venezuela', 'VE', '🇻🇪', '+58', true),
('Ecuador', 'Ecuador', 'EC', '🇪🇨', '+593', true),
('Perú', 'Peru', 'PE', '🇵🇪', '+51', true),
('Brasil', 'Brazil', 'BR', '🇧🇷', '+55', true),
('Panamá', 'Panama', 'PA', '🇵🇦', '+507', true),

-- Resto de América Central
('Costa Rica', 'Costa Rica', 'CR', '🇨🇷', '+506', true),
('Nicaragua', 'Nicaragua', 'NI', '🇳🇮', '+505', true),
('Honduras', 'Honduras', 'HN', '🇭🇳', '+504', true),
('El Salvador', 'El Salvador', 'SV', '🇸🇻', '+503', true),
('Guatemala', 'Guatemala', 'GT', '🇬🇹', '+502', true),
('Belice', 'Belize', 'BZ', '🇧🇿', '+501', true),

-- América del Sur
('Argentina', 'Argentina', 'AR', '🇦🇷', '+54', true),
('Chile', 'Chile', 'CL', '🇨🇱', '+56', true),
('Uruguay', 'Uruguay', 'UY', '🇺🇾', '+598', true),
('Paraguay', 'Paraguay', 'PY', '🇵🇾', '+595', true),
('Bolivia', 'Bolivia', 'BO', '🇧🇴', '+591', true),
('Guyana', 'Guyana', 'GY', '🇬🇾', '+592', true),
('Surinam', 'Suriname', 'SR', '🇸🇷', '+597', true),
('Guayana Francesa', 'French Guiana', 'GF', '🇬🇫', '+594', true),

-- América del Norte
('México', 'Mexico', 'MX', '🇲🇽', '+52', true),
('Estados Unidos', 'United States', 'US', '🇺🇸', '+1', true),
('Canadá', 'Canada', 'CA', '🇨🇦', '+1', true),

-- El Caribe
('Cuba', 'Cuba', 'CU', '🇨🇺', '+53', true),
('República Dominicana', 'Dominican Republic', 'DO', '🇩🇴', '+1-809', true),
('Haití', 'Haiti', 'HT', '🇭🇹', '+509', true),
('Jamaica', 'Jamaica', 'JM', '🇯🇲', '+1-876', true),
('Puerto Rico', 'Puerto Rico', 'PR', '🇵🇷', '+1-787', true),
('Trinidad y Tobago', 'Trinidad and Tobago', 'TT', '🇹🇹', '+1-868', true),
('Bahamas', 'Bahamas', 'BS', '🇧🇸', '+1-242', true),
('Barbados', 'Barbados', 'BB', '🇧🇧', '+1-246', true),

-- Europa (principales)
('España', 'Spain', 'ES', '🇪🇸', '+34', true),
('Francia', 'France', 'FR', '🇫🇷', '+33', true),
('Italia', 'Italy', 'IT', '🇮🇹', '+39', true),
('Alemania', 'Germany', 'DE', '🇩🇪', '+49', true),
('Reino Unido', 'United Kingdom', 'GB', '🇬🇧', '+44', true),
('Portugal', 'Portugal', 'PT', '🇵🇹', '+351', true),
('Países Bajos', 'Netherlands', 'NL', '🇳🇱', '+31', true),
('Suiza', 'Switzerland', 'CH', '🇨🇭', '+41', true),
('Bélgica', 'Belgium', 'BE', '🇧🇪', '+32', true),
('Suecia', 'Sweden', 'SE', '🇸🇪', '+46', true),
('Noruega', 'Norway', 'NO', '🇳🇴', '+47', true),
('Dinamarca', 'Denmark', 'DK', '🇩🇰', '+45', true),
('Polonia', 'Poland', 'PL', '🇵🇱', '+48', true),
('Rusia', 'Russia', 'RU', '🇷🇺', '+7', true),

-- Asia (principales)
('China', 'China', 'CN', '🇨🇳', '+86', true),
('Japón', 'Japan', 'JP', '🇯🇵', '+81', true),
('Corea del Sur', 'South Korea', 'KR', '🇰🇷', '+82', true),
('India', 'India', 'IN', '🇮🇳', '+91', true),
('Filipinas', 'Philippines', 'PH', '🇵🇭', '+63', true),
('Tailandia', 'Thailand', 'TH', '🇹🇭', '+66', true),
('Vietnam', 'Vietnam', 'VN', '🇻🇳', '+84', true),
('Indonesia', 'Indonesia', 'ID', '🇮🇩', '+62', true),
('Singapur', 'Singapore', 'SG', '🇸🇬', '+65', true),
('Malasia', 'Malaysia', 'MY', '🇲🇾', '+60', true),
('Israel', 'Israel', 'IL', '🇮🇱', '+972', true),
('Emiratos Árabes Unidos', 'United Arab Emirates', 'AE', '🇦🇪', '+971', true),
('Arabia Saudita', 'Saudi Arabia', 'SA', '🇸🇦', '+966', true),
('Turquía', 'Turkey', 'TR', '🇹🇷', '+90', true),

-- África (principales)
('Sudáfrica', 'South Africa', 'ZA', '🇿🇦', '+27', true),
('Nigeria', 'Nigeria', 'NG', '🇳🇬', '+234', true),
('Egipto', 'Egypt', 'EG', '🇪🇬', '+20', true),
('Kenia', 'Kenya', 'KE', '🇰🇪', '+254', true),
('Marruecos', 'Morocco', 'MA', '🇲🇦', '+212', true),
('Argelia', 'Algeria', 'DZ', '🇩🇿', '+213', true),
('Ghana', 'Ghana', 'GH', '🇬🇭', '+233', true),

-- Oceanía
('Australia', 'Australia', 'AU', '🇦🇺', '+61', true),
('Nueva Zelanda', 'New Zealand', 'NZ', '🇳🇿', '+64', true)

ON CONFLICT (code) DO UPDATE SET
    name_en = EXCLUDED.name_en;

COMMIT;

-- Verify insertion
SELECT COUNT(*) as total_countries FROM countries;
SELECT name, name_en, code, flag_emoji, phone_code FROM countries ORDER BY id LIMIT 10;
