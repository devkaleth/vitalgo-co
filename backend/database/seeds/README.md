# Database Seeds - VitalGo

Este directorio contiene archivos SQL con datos iniciales (seeds) para la base de datos de VitalGo.

## 📋 Archivos Disponibles

### `countries_seed.sql`
**Descripción**: Contiene 218 países y territorios con información completa.

**Contenido**:
- Nombre del país (español)
- Código ISO 3166-1 alpha-2 (CO, US, MX, etc.)
- Emoji de bandera (🇨🇴, 🇺🇸, 🇲🇽, etc.)
- Código telefónico internacional (+57, +1, +52, etc.)
- Estado activo/inactivo

**Cobertura geográfica**:
- 🌎 **Américas**: 55+ países/territorios (Colombia primero, luego vecinos por proximidad)
- 🌍 **Europa**: 50+ países/territorios
- 🌏 **Asia**: 50+ países/territorios
- 🌍 **África**: 54+ países
- 🌊 **Oceanía**: 20+ países/territorios

**Total registros**: 218

**Fecha de generación**: 2025-11-20

---

## 🚀 Cómo Usar

### Opción 1: Importar directamente con psql
```bash
# Conectar a PostgreSQL y ejecutar el archivo
psql -h localhost -U vitalgo_user -d vitalgo_dev -f backend/database/seeds/countries_seed.sql

# O con la URL completa
psql postgresql://vitalgo_user:vitalgo_dev_password_2025@localhost:5432/vitalgo_dev -f backend/database/seeds/countries_seed.sql
```

### Opción 2: Importar desde pgAdmin o cliente GUI
1. Abrir pgAdmin o tu cliente PostgreSQL favorito
2. Conectar a la base de datos destino
3. Abrir el Query Tool
4. Cargar el archivo `countries_seed.sql`
5. Ejecutar el script

### Opción 3: Usar desde Docker
```bash
# Copiar archivo al contenedor
docker cp backend/database/seeds/countries_seed.sql vitalgo_postgres_dev:/tmp/

# Ejecutar dentro del contenedor
docker exec -it vitalgo_postgres_dev psql -U vitalgo_user -d vitalgo_dev -f /tmp/countries_seed.sql
```

### Opción 4: Importar a otra base de datos remota
```bash
# Conectar a base de datos remota (AWS RDS, etc.)
psql -h your-rds-endpoint.amazonaws.com -U your_user -d your_database -f backend/database/seeds/countries_seed.sql
```

---

## 🔧 Estructura del Archivo SQL

### 1. Creación de Tabla (si no existe)
```sql
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(2) UNIQUE NOT NULL,
    flag_emoji VARCHAR(10),
    phone_code VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Índices
```sql
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
```

### 3. Datos (218 registros)
```sql
INSERT INTO countries (id, name, code, flag_emoji, phone_code, is_active) VALUES (1, 'Colombia', 'CO', '🇨🇴', '+57', TRUE);
-- ... 217 más
```

### 4. Reset de Secuencia
```sql
SELECT setval('countries_id_seq', (SELECT MAX(id) FROM countries));
```

---

## ⚠️ Notas Importantes

### Antes de Importar
- ✅ **Verificar si la tabla ya existe**: El script usa `IF NOT EXISTS` pero es seguro verificar antes
- ✅ **Backup recomendado**: Haz un respaldo de tu base de datos antes de importar
- ✅ **Permisos**: Asegúrate de tener permisos de INSERT en la base de datos destino

### Posibles Conflictos
Si la tabla `countries` ya existe con datos:

**Opción A - Limpiar antes de importar**:
```sql
TRUNCATE TABLE countries RESTART IDENTITY CASCADE;
-- Luego ejecutar el seed
```

**Opción B - Eliminar y recrear**:
```sql
DROP TABLE IF EXISTS countries CASCADE;
-- Luego ejecutar el seed
```

**Opción C - Actualizar en lugar de insertar**:
```sql
-- Modificar los INSERT por INSERT ... ON CONFLICT
INSERT INTO countries (id, name, code, flag_emoji, phone_code, is_active)
VALUES (1, 'Colombia', 'CO', '🇨🇴', '+57', TRUE)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    flag_emoji = EXCLUDED.flag_emoji,
    phone_code = EXCLUDED.phone_code,
    is_active = EXCLUDED.is_active;
```

### Encoding UTF-8
- El archivo está codificado en UTF-8 para soportar emojis y caracteres especiales
- Asegúrate que tu base de datos use encoding UTF-8

---

## 📊 Verificación Post-Importación

Después de importar, verifica que los datos se insertaron correctamente:

```sql
-- Contar registros
SELECT COUNT(*) FROM countries;
-- Resultado esperado: 218

-- Ver primeros 10 países
SELECT id, name, code, flag_emoji, phone_code FROM countries ORDER BY id LIMIT 10;

-- Verificar países por región (ejemplo: América Latina)
SELECT name, code, phone_code FROM countries
WHERE code IN ('CO', 'VE', 'EC', 'PE', 'BR', 'AR', 'CL', 'MX')
ORDER BY name;

-- Verificar que Colombia sea el primero (ID=1)
SELECT * FROM countries WHERE id = 1;
```

---

## 🔄 Actualización de Datos

Si necesitas actualizar el archivo seed con datos más recientes:

```bash
cd backend
poetry run python -c "
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)

# Script de extracción...
"
```

O usa el script que generó este archivo originalmente.

---

## 📝 Changelog

### 2025-11-20
- ✅ Creación inicial del archivo
- ✅ 218 países y territorios incluidos
- ✅ Datos extraídos de la base de datos de producción VitalGo
- ✅ Ordenamiento: Colombia primero, luego por proximidad geográfica
- ✅ Incluye emojis de banderas y códigos telefónicos

---

## 🆘 Soporte

Si tienes problemas importando los datos:

1. **Verificar conexión a la base de datos**
2. **Revisar permisos del usuario PostgreSQL**
3. **Comprobar encoding de la base de datos** (debe ser UTF-8)
4. **Verificar que la tabla no tenga restricciones conflictivas**
5. **Revisar logs de PostgreSQL** para errores específicos

Para más información, consulta la documentación de VitalGo en `/docs/DB.md`.
