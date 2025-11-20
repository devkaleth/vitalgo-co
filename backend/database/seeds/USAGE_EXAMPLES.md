# Countries Database - Usage Examples

Esta guía proporciona ejemplos prácticos de cómo usar los datos de países en diferentes escenarios.

---

## 📥 Importación de Datos

### Ejemplo 1: Importar a base de datos local de VitalGo
```bash
cd backend
poetry run python database/seeds/import_countries.py
```

### Ejemplo 2: Importar a base de datos remota (AWS RDS)
```bash
cd backend
DATABASE_URL="postgresql://user:pass@vitalgo-db.rds.amazonaws.com:5432/vitalgo_prod" \
poetry run python database/seeds/import_countries.py
```

### Ejemplo 3: Forzar reimportación (truncar antes)
```bash
cd backend
poetry run python database/seeds/import_countries.py --force
```

### Ejemplo 4: Importar con psql directamente
```bash
# Base de datos local
psql postgresql://vitalgo_user:vitalgo_dev_password_2025@localhost:5432/vitalgo_dev \
  -f backend/database/seeds/countries_seed.sql

# Base de datos en Docker
docker exec -i vitalgo_postgres_dev psql -U vitalgo_user -d vitalgo_dev \
  < backend/database/seeds/countries_seed.sql
```

---

## 🔍 Consultas SQL Útiles

### Buscar país por código
```sql
-- Buscar Colombia
SELECT * FROM countries WHERE code = 'CO';

-- Resultado esperado:
-- id: 1
-- name: Colombia
-- code: CO
-- flag_emoji: 🇨🇴
-- phone_code: +57
```

### Listar países de América Latina
```sql
SELECT name, code, flag_emoji, phone_code
FROM countries
WHERE code IN ('CO', 'VE', 'EC', 'PE', 'BR', 'AR', 'CL', 'MX',
               'UY', 'PY', 'BO', 'PA', 'CR', 'NI', 'HN', 'SV', 'GT')
ORDER BY name;
```

### Buscar por código telefónico
```sql
-- Países con código +1 (USA, Canadá, algunos del Caribe)
SELECT name, code, phone_code
FROM countries
WHERE phone_code LIKE '+1%'
ORDER BY name;
```

### Países que empiezan con letra específica
```sql
-- Países que empiezan con 'C'
SELECT name, code, flag_emoji
FROM countries
WHERE name LIKE 'C%'
ORDER BY name;
```

### Contar países activos vs inactivos
```sql
SELECT
  is_active,
  COUNT(*) as total
FROM countries
GROUP BY is_active;
```

---

## 💻 Uso en Backend (Python)

### Ejemplo 1: Obtener todos los países
```python
from sqlalchemy import select
from slices.shared.models.country_model import Country

async def get_all_countries(db: Session):
    """Get all active countries ordered by name."""
    stmt = select(Country).where(Country.is_active == True).order_by(Country.name)
    result = await db.execute(stmt)
    return result.scalars().all()
```

### Ejemplo 2: Buscar país por código
```python
async def get_country_by_code(db: Session, code: str):
    """Get country by ISO code."""
    stmt = select(Country).where(Country.code == code.upper())
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
```

### Ejemplo 3: Validar código de país
```python
async def validate_country_code(db: Session, code: str) -> bool:
    """Check if country code exists and is active."""
    stmt = select(Country.id).where(
        Country.code == code.upper(),
        Country.is_active == True
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None
```

### Ejemplo 4: Endpoint para listar países
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/countries", tags=["countries"])

@router.get("/")
async def list_countries(
    db: AsyncSession = Depends(get_db)
):
    """List all active countries."""
    countries = await get_all_countries(db)
    return [
        {
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "flag_emoji": c.flag_emoji,
            "phone_code": c.phone_code
        }
        for c in countries
    ]
```

---

## ⚛️ Uso en Frontend (TypeScript/React)

### Ejemplo 1: Tipo TypeScript
```typescript
// types/country.ts
export interface Country {
  id: number;
  name: string;
  code: string;
  flagEmoji: string;
  phoneCode: string;
  isActive: boolean;
}
```

### Ejemplo 2: API Service
```typescript
// services/countriesApi.ts
import { apiClient } from '@/shared/services/apiClient';

export class CountriesAPIService {
  async getAllCountries(): Promise<Country[]> {
    const response = await apiClient.get<Country[]>('/countries/');
    return response.data;
  }

  async getCountryByCode(code: string): Promise<Country> {
    const response = await apiClient.get<Country>(`/countries/${code}`);
    return response.data;
  }
}

export const countriesApi = new CountriesAPIService();
```

### Ejemplo 3: Hook personalizado
```typescript
// hooks/useCountries.ts
import { useState, useEffect } from 'react';
import { countriesApi } from '../services/countriesApi';

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const data = await countriesApi.getAllCountries();
        setCountries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
}
```

### Ejemplo 4: Componente de selección de país
```tsx
// components/CountrySelect.tsx
import { useCountries } from '../hooks/useCountries';

export function CountrySelect({ value, onChange }: Props) {
  const { countries, loading } = useCountries();

  if (loading) return <div>Cargando países...</div>;

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecciona un país</option>
      {countries.map((country) => (
        <option key={country.code} value={country.code}>
          {country.flagEmoji} {country.name}
        </option>
      ))}
    </select>
  );
}
```

### Ejemplo 5: Formato de teléfono con código de país
```typescript
// utils/phoneFormatter.ts
export function formatPhoneWithCountry(
  phoneNumber: string,
  countryCode: string,
  countries: Country[]
): string {
  const country = countries.find(c => c.code === countryCode);
  if (!country) return phoneNumber;

  return `${country.phoneCode} ${phoneNumber}`;
}

// Uso:
// formatPhoneWithCountry('3001234567', 'CO', countries)
// Resultado: "+57 3001234567"
```

---

## 🎯 Casos de Uso Comunes

### 1. Selector de país en formulario de registro
```typescript
<FormField>
  <label>País de nacimiento</label>
  <CountrySelect
    value={formData.birthCountry}
    onChange={(code) => setFormData({ ...formData, birthCountry: code })}
  />
</FormField>
```

### 2. Validación de código de país en backend
```python
@router.post("/signup/patient")
async def create_patient(
    data: PatientSignupDTO,
    db: AsyncSession = Depends(get_db)
):
    # Validar que el país exista
    if not await validate_country_code(db, data.origin_country):
        raise HTTPException(400, "Invalid country code")

    # Continuar con el registro...
```

### 3. Display de información de país en perfil
```tsx
function PatientProfile({ patient }: Props) {
  const { countries } = useCountries();
  const birthCountry = countries.find(c => c.code === patient.birthCountry);

  return (
    <div>
      <h3>Información Personal</h3>
      <p>
        País de nacimiento: {birthCountry?.flagEmoji} {birthCountry?.name}
      </p>
    </div>
  );
}
```

### 4. Filtrado de países por región
```typescript
function getLatinAmericanCountries(countries: Country[]): Country[] {
  const latinAmericaCodes = [
    'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV',
    'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'UY', 'VE'
  ];

  return countries.filter(c => latinAmericaCodes.includes(c.code));
}
```

---

## 🧪 Testing

### Ejemplo de test en backend
```python
import pytest
from sqlalchemy import select

async def test_get_colombia(db_session):
    """Test getting Colombia by code."""
    stmt = select(Country).where(Country.code == 'CO')
    result = await db_session.execute(stmt)
    colombia = result.scalar_one()

    assert colombia.name == 'Colombia'
    assert colombia.phone_code == '+57'
    assert colombia.flag_emoji == '🇨🇴'
    assert colombia.is_active is True

async def test_total_countries(db_session):
    """Test total number of countries."""
    stmt = select(func.count(Country.id))
    result = await db_session.execute(stmt)
    total = result.scalar()

    assert total == 218
```

### Ejemplo de test en frontend
```typescript
import { render, screen } from '@testing-library/react';
import { CountrySelect } from './CountrySelect';

const mockCountries: Country[] = [
  { id: 1, name: 'Colombia', code: 'CO', flagEmoji: '🇨🇴', phoneCode: '+57', isActive: true },
  { id: 2, name: 'México', code: 'MX', flagEmoji: '🇲🇽', phoneCode: '+52', isActive: true },
];

test('renders country options', () => {
  render(<CountrySelect countries={mockCountries} value="" onChange={() => {}} />);

  expect(screen.getByText(/🇨🇴 Colombia/)).toBeInTheDocument();
  expect(screen.getByText(/🇲🇽 México/)).toBeInTheDocument();
});
```

---

## 🚀 Optimización y Performance

### 1. Caché en Backend
```python
from functools import lru_cache

@lru_cache(maxsize=1)
async def get_countries_cached(db: AsyncSession):
    """Get countries with caching."""
    return await get_all_countries(db)
```

### 2. Lazy Loading en Frontend
```typescript
// Cargar países solo cuando el componente se monta
const CountrySelectLazy = lazy(() => import('./CountrySelect'));
```

### 3. Búsqueda optimizada
```typescript
// Usar un Map para búsquedas O(1)
const countryMap = new Map(countries.map(c => [c.code, c]));
const colombia = countryMap.get('CO');
```

---

## 📚 Referencias

- **ISO 3166-1**: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
- **International Phone Codes**: https://en.wikipedia.org/wiki/List_of_country_calling_codes
- **Country Emojis**: https://emojipedia.org/flags/

---

**Última actualización**: 2025-11-20
