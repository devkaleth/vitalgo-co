# 🌍 Geolocation Service

Servicio reutilizable para detectar la ubicación del usuario basado en su dirección IP usando la API gratuita de ipapi.co.

## 📦 Características

- ✅ **Sin permisos del usuario** - Usa IP en lugar de GPS
- ✅ **Caché automático** - Reduce llamadas a la API (1 hora por defecto)
- ✅ **Fallback inteligente** - Valor predeterminado si falla
- ✅ **TypeScript completo** - Tipos incluidos
- ✅ **React Hook incluido** - Fácil integración en componentes

## 🚀 Uso Básico

### Opción 1: Usar el Hook React (Recomendado)

```typescript
import { useGeolocation } from '@/shared/hooks/useGeolocation';

function MyComponent() {
  const { countryCode, dialCode, isLoading, error } = useGeolocation();

  if (isLoading) return <div>Detectando ubicación...</div>;

  return (
    <div>
      País detectado: {countryCode}
      Código de área: {dialCode}
    </div>
  );
}
```

### Opción 2: Usar el Servicio Directamente

```typescript
import { GeolocationService } from '@/shared/services/geolocation-service';

async function detectUserCountry() {
  // Solo obtener código de país (rápido)
  const countryCode = await GeolocationService.getUserCountryCode();
  console.log(countryCode); // 'CO', 'US', 'MX', etc.

  // Obtener código de área telefónico
  const dialCode = await GeolocationService.getUserDialCode();
  console.log(dialCode); // '+57', '+1', '+52', etc.

  // Obtener datos completos de ubicación
  const location = await GeolocationService.getUserLocation();
  console.log(location?.city); // 'Bogotá', 'New York', etc.
}
```

## 📋 Ejemplos de Uso

### Ejemplo 1: Auto-completar país en formulario

```typescript
import { useGeolocation } from '@/shared/hooks/useGeolocation';

function SignupForm() {
  const { countryCode, isLoading } = useGeolocation();
  const [selectedCountry, setSelectedCountry] = useState('CO');

  // Auto-completar cuando se detecta el país
  useEffect(() => {
    if (countryCode && !isLoading) {
      setSelectedCountry(countryCode);
    }
  }, [countryCode, isLoading]);

  return (
    <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
      <option value="CO">Colombia</option>
      <option value="US">United States</option>
      {/* ... más países */}
    </select>
  );
}
```

### Ejemplo 2: Detectar país para mostrar contenido específico

```typescript
import { GeolocationService } from '@/shared/services/geolocation-service';

async function showLocalizedContent() {
  const countryCode = await GeolocationService.getUserCountryCode();

  if (countryCode === 'CO') {
    return <ColombianContent />;
  } else if (countryCode === 'US') {
    return <USContent />;
  } else {
    return <DefaultContent />;
  }
}
```

### Ejemplo 3: Verificar si el usuario está en la UE (para GDPR)

```typescript
import { GeolocationService } from '@/shared/services/geolocation-service';

async function checkGDPRCompliance() {
  const isInEU = await GeolocationService.isUserInEU();

  if (isInEU) {
    // Mostrar aviso de cookies GDPR
    showCookieConsent();
  }
}
```

### Ejemplo 4: Auto-detectar código de área telefónico

```typescript
import { useGeolocation } from '@/shared/hooks/useGeolocation';

function PhoneInput() {
  const { dialCode, isLoading } = useGeolocation();
  const [phoneDialCode, setPhoneDialCode] = useState('+57');

  useEffect(() => {
    if (dialCode && !isLoading) {
      setPhoneDialCode(dialCode);
    }
  }, [dialCode, isLoading]);

  return (
    <div>
      <span>{phoneDialCode}</span>
      <input type="tel" placeholder="300 123 4567" />
    </div>
  );
}
```

### Ejemplo 5: Limpiar caché manualmente

```typescript
import { useGeolocation } from '@/shared/hooks/useGeolocation';

function SettingsPage() {
  const { countryCode, clearAndRefresh } = useGeolocation();

  const handleRefreshLocation = async () => {
    await clearAndRefresh(); // Limpia caché y vuelve a detectar
  };

  return (
    <div>
      <p>País actual: {countryCode}</p>
      <button onClick={handleRefreshLocation}>
        Detectar ubicación nuevamente
      </button>
    </div>
  );
}
```

## ⚙️ Opciones de Configuración

### Hook `useGeolocation`

```typescript
const options = {
  autoFetch: true,           // Auto-detectar al montar (default: true)
  fetchFullData: false,      // Obtener datos completos vs solo país (default: false)
  timeout: 5000,             // Timeout en ms (default: 5000)
  fallbackCountry: 'CO',     // País por defecto si falla (default: 'CO')
  cacheDuration: 3600000,    // Duración del caché en ms (default: 1 hora)
};

const { countryCode } = useGeolocation(options);
```

### Servicio `GeolocationService`

```typescript
const options = {
  timeout: 5000,             // Timeout en ms
  fallbackCountry: 'CO',     // País por defecto si falla
  cacheDuration: 3600000,    // Duración del caché en ms
};

const countryCode = await GeolocationService.getUserCountryCode(options);
```

## 📊 Datos Disponibles

Cuando usas `fetchFullData: true` o `getUserLocation()`, obtienes:

```typescript
interface GeolocationData {
  ip: string;                    // IP del usuario
  city: string;                  // Ciudad
  region: string;                // Región/Estado
  region_code: string;           // Código de región
  country: string;               // Código de país (2 letras)
  country_name: string;          // Nombre completo del país
  country_code: string;          // Código ISO del país
  country_code_iso3: string;     // Código ISO-3 del país
  country_calling_code: string;  // Código de área (ej: '+57')
  timezone: string;              // Zona horaria
  latitude: number;              // Latitud
  longitude: number;             // Longitud
  currency: string;              // Moneda
  languages: string;             // Idiomas
  in_eu: boolean;                // ¿Está en la UE?
  // ... y más campos
}
```

## 🔧 Límites de la API

**Plan Gratuito de ipapi.co:**
- 1,000 requests/día
- Sin API key necesaria
- HTTPS incluido

**Recomendaciones:**
- El servicio usa caché de 1 hora por defecto para minimizar llamadas
- Solo usa `fetchFullData: true` cuando realmente necesites todos los datos
- Para obtener solo el país, usa `fetchFullData: false` (más rápido)

## 🧪 Testing

Para probar diferentes ubicaciones en desarrollo:

```typescript
// Limpiar caché para forzar nueva detección
GeolocationService.clearCache();

// Usar VPN o proxy para simular diferentes países
```

## 🛡️ Manejo de Errores

El servicio maneja errores automáticamente:

```typescript
const { countryCode, error } = useGeolocation({
  fallbackCountry: 'CO'
});

if (error) {
  console.warn('No se pudo detectar la ubicación:', error);
  // countryCode será 'CO' (fallback)
}
```

## 📝 Notas Importantes

1. **No requiere permisos del usuario** - A diferencia de `navigator.geolocation`
2. **Precisión limitada** - La detección por IP es precisa a nivel de país/ciudad, no coordenadas exactas
3. **Caché persistente** - Los datos se guardan en localStorage entre sesiones
4. **SSR compatible** - El servicio verifica `typeof window` antes de usar localStorage

## 🔄 Migración desde otros servicios

Si estabas usando otro servicio de geolocalización:

```typescript
// Antes (con navigator.geolocation)
navigator.geolocation.getCurrentPosition((pos) => {
  // Requiere permisos, solo funciona en HTTPS
});

// Después (con GeolocationService)
const countryCode = await GeolocationService.getUserCountryCode();
// No requiere permisos, funciona en HTTP/HTTPS
```

## 🚀 Implementado en VitalGo

Este servicio se usa actualmente en:
- ✅ Formulario de registro de pacientes - Auto-detecta país de origen y código de área

## 📚 Referencias

- API Documentation: https://ipapi.co/api/
- Límites del plan gratuito: https://ipapi.co/#pricing
