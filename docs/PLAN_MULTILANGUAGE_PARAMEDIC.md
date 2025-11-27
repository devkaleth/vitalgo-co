# Multi-Language Medical Data Translation for Emergency Access

## Overview
Enable paramedics to view patient medical history in up to 10 languages when accessing emergency data via QR code. Uses Amazon Bedrock with Claude for medical-accurate translations with a pre-translation strategy for optimal performance.

## Supported Languages
| Code | Language | Native |
|------|----------|--------|
| ES | Spanish | Español (Base) |
| EN | English | English |
| FR | French | Français |
| DE | German | Deutsch |
| RU | Russian | Русский |
| ZH | Chinese | 中文 |
| JA | Japanese | 日本語 |
| HI | Hindi | हिन्दी |
| ID | Indonesian | Bahasa Indonesia |
| TL | Tagalog | Tagalog |

## Architecture Strategy: Pre-Translation with Redis Caching

### Why Pre-Translation?
- **Zero latency** for paramedics during emergencies
- Translations are created when patient saves data
- Redis L1 cache for emergency data (already exists)
- Redis L2 cache for translations
- PostgreSQL as persistent fallback

### Data Flow
```
Patient saves data → Background worker → Bedrock/Claude translates → Store in DB + Redis
                                                                              ↓
Paramedic scans QR → API with ?lang=XX → Get from Redis (fast) → Display translated
```

---

## Implementation Plan

### Phase 1: Database Schema

#### 1.1 Create Translation Tables

**File: `backend/slices/translations/domain/models/`**

```sql
-- New table: medical_translations
CREATE TABLE medical_translations (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,  -- 'medication', 'allergy', 'illness', 'surgery'
    entity_id INTEGER NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    source_language VARCHAR(5) DEFAULT 'es',
    target_language VARCHAR(5) NOT NULL,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    translation_model VARCHAR(50) DEFAULT 'claude-3-haiku',
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id, field_name, target_language)
);

-- Index for fast lookups
CREATE INDEX idx_translations_lookup
ON medical_translations(entity_type, entity_id, target_language);

-- Supported languages config
CREATE TABLE supported_languages (
    code VARCHAR(5) PRIMARY KEY,
    name_es VARCHAR(50) NOT NULL,
    name_native VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100
);

-- Insert supported languages
INSERT INTO supported_languages (code, name_es, name_native, priority) VALUES
('es', 'Español', 'Español', 1),
('en', 'Inglés', 'English', 2),
('fr', 'Francés', 'Français', 3),
('de', 'Alemán', 'Deutsch', 4),
('ru', 'Ruso', 'Русский', 5),
('zh', 'Chino', '中文', 6),
('ja', 'Japonés', '日本語', 7),
('hi', 'Hindi', 'हिन्दी', 8),
('id', 'Indonesio', 'Bahasa Indonesia', 9),
('tl', 'Tagalo', 'Tagalog', 10);
```

### Phase 2: Translation Service

#### 2.1 Bedrock Translation Service

**File: `backend/slices/translations/services/bedrock_translation_service.py`**

```python
import boto3
import json
from typing import List, Dict, Optional
import asyncio

class BedrockMedicalTranslator:
    """Translation service using Amazon Bedrock with Claude for medical terms."""

    def __init__(self):
        self.client = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.model_id = 'anthropic.claude-3-haiku-20240307-v1:0'

    async def translate_medical_text(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        context: str = "medical record"
    ) -> Dict:
        """Translate medical text with high accuracy for clinical terms."""

        prompt = f"""You are a medical translator. Translate the following {context} text from {source_lang} to {target_lang}.

IMPORTANT RULES:
1. Preserve medical terminology accuracy
2. Keep drug names in their international format when appropriate
3. Maintain clinical precision
4. If unsure about a medical term, keep the original with a translation in parentheses

Text to translate: {text}

Respond with ONLY the translated text, nothing else."""

        response = self.client.invoke_model(
            modelId=self.model_id,
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            })
        )

        result = json.loads(response['body'].read())
        translated = result['content'][0]['text'].strip()

        return {
            "original": text,
            "translated": translated,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "model": self.model_id
        }

    async def batch_translate(
        self,
        items: List[Dict],
        target_lang: str
    ) -> List[Dict]:
        """Batch translate multiple items efficiently."""
        tasks = [
            self.translate_medical_text(
                item['text'],
                item.get('source_lang', 'es'),
                target_lang,
                item.get('context', 'medical record')
            )
            for item in items
        ]
        return await asyncio.gather(*tasks)
```

#### 2.2 Translation Cache Service

**File: `backend/slices/translations/services/translation_cache_service.py`**

```python
from typing import Optional, Dict, List
import json

class TranslationCacheService:
    """Multi-tier caching for translations."""

    def __init__(self, redis_client, db_session):
        self.redis = redis_client
        self.db = db_session
        self.cache_ttl = 86400 * 7  # 7 days

    def _cache_key(self, entity_type: str, entity_id: int, lang: str) -> str:
        return f"trans:{entity_type}:{entity_id}:{lang}"

    async def get_translation(
        self,
        entity_type: str,
        entity_id: int,
        field_name: str,
        target_lang: str
    ) -> Optional[str]:
        """Get translation from cache (Redis) or DB."""

        # Try Redis first
        cache_key = self._cache_key(entity_type, entity_id, target_lang)
        cached = await self.redis.hget(cache_key, field_name)
        if cached:
            return cached

        # Try database
        from ..domain.models import MedicalTranslation
        translation = await self.db.query(MedicalTranslation).filter(
            MedicalTranslation.entity_type == entity_type,
            MedicalTranslation.entity_id == entity_id,
            MedicalTranslation.field_name == field_name,
            MedicalTranslation.target_language == target_lang
        ).first()

        if translation:
            # Populate Redis cache
            await self.redis.hset(cache_key, field_name, translation.translated_text)
            await self.redis.expire(cache_key, self.cache_ttl)
            return translation.translated_text

        return None

    async def get_entity_translations(
        self,
        entity_type: str,
        entity_id: int,
        target_lang: str
    ) -> Dict[str, str]:
        """Get all translations for an entity in one call."""

        cache_key = self._cache_key(entity_type, entity_id, target_lang)

        # Try Redis first (full hash)
        cached = await self.redis.hgetall(cache_key)
        if cached:
            return cached

        # Fallback to database
        from ..domain.models import MedicalTranslation
        translations = await self.db.query(MedicalTranslation).filter(
            MedicalTranslation.entity_type == entity_type,
            MedicalTranslation.entity_id == entity_id,
            MedicalTranslation.target_language == target_lang
        ).all()

        result = {t.field_name: t.translated_text for t in translations}

        if result:
            # Populate Redis
            await self.redis.hmset(cache_key, result)
            await self.redis.expire(cache_key, self.cache_ttl)

        return result
```

### Phase 3: Translation Worker (Pre-Translation on Save)

#### 3.1 Background Translation Worker

**File: `backend/slices/translations/services/translation_worker.py`**

```python
from celery import shared_task
from typing import List, Dict

# Fields to translate per entity type
TRANSLATABLE_FIELDS = {
    'medication': ['medication_name', 'dosage', 'frequency', 'notes'],
    'allergy': ['allergen', 'reaction_description'],
    'illness': ['illness_name', 'treatment_description'],
    'surgery': ['procedure_name', 'complications', 'anesthesia_type']
}

TARGET_LANGUAGES = ['en', 'fr', 'de', 'ru', 'zh', 'ja', 'hi', 'id', 'tl']

@shared_task
def translate_entity_async(
    entity_type: str,
    entity_id: int,
    entity_data: Dict,
    source_lang: str = 'es'
):
    """Background task to translate entity to all supported languages."""

    from .bedrock_translation_service import BedrockMedicalTranslator
    from .translation_cache_service import TranslationCacheService

    translator = BedrockMedicalTranslator()
    cache = TranslationCacheService(redis_client, db_session)

    fields = TRANSLATABLE_FIELDS.get(entity_type, [])

    for target_lang in TARGET_LANGUAGES:
        if target_lang == source_lang:
            continue

        for field in fields:
            if field in entity_data and entity_data[field]:
                result = translator.translate_medical_text(
                    text=entity_data[field],
                    source_lang=source_lang,
                    target_lang=target_lang,
                    context=f"{entity_type} {field}"
                )

                # Save to DB and cache
                cache.save_translation(
                    entity_type=entity_type,
                    entity_id=entity_id,
                    field_name=field,
                    target_lang=target_lang,
                    original_text=entity_data[field],
                    translated_text=result['translated']
                )
```

#### 3.2 Hook into Entity Creation/Update

**Modify existing use cases to trigger translation:**

```python
# In medications/application/use_cases/create_medication_use_case.py

async def execute(self, command: CreateMedicationCommand) -> Medication:
    medication = await self.repository.create(command)

    # Trigger background translation
    from slices.translations.services.translation_worker import translate_entity_async
    translate_entity_async.delay(
        entity_type='medication',
        entity_id=medication.id,
        entity_data={
            'medication_name': medication.medication_name,
            'dosage': medication.dosage,
            'frequency': medication.frequency,
            'notes': medication.notes
        }
    )

    return medication
```

### Phase 4: Emergency Access Endpoint Modification

#### 4.1 Update Emergency Data Use Case

**File: `backend/slices/emergency_access/application/use_cases/get_emergency_data_use_case.py`**

```python
class GetEmergencyDataUseCase:
    def __init__(
        self,
        qr_repository: QRCodeRepository,
        patient_repository: PatientRepository,
        translation_service: TranslationCacheService  # NEW
    ):
        self.qr_repository = qr_repository
        self.patient_repository = patient_repository
        self.translation_service = translation_service

    async def execute(
        self,
        qr_code: str,
        language: str = 'es'  # NEW PARAMETER
    ) -> EmergencyDataDTO:
        # ... existing validation ...

        patient = await self.patient_repository.get_by_id(qr_data.patient_id)

        # Get medical data
        medications = await self._get_medications(patient.id)
        allergies = await self._get_allergies(patient.id)
        illnesses = await self._get_illnesses(patient.id)
        surgeries = await self._get_surgeries(patient.id)

        # Apply translations if not Spanish
        if language != 'es':
            medications = await self._translate_medications(medications, language)
            allergies = await self._translate_allergies(allergies, language)
            illnesses = await self._translate_illnesses(illnesses, language)
            surgeries = await self._translate_surgeries(surgeries, language)

        return EmergencyDataDTO(
            patient=patient,
            medications=medications,
            allergies=allergies,
            illnesses=illnesses,
            surgeries=surgeries,
            language=language
        )

    async def _translate_medications(
        self,
        medications: List[Medication],
        target_lang: str
    ) -> List[Medication]:
        """Apply cached translations to medications."""

        for med in medications:
            translations = await self.translation_service.get_entity_translations(
                entity_type='medication',
                entity_id=med.id,
                target_lang=target_lang
            )

            if translations:
                med.medication_name = translations.get('medication_name', med.medication_name)
                med.dosage = translations.get('dosage', med.dosage)
                med.frequency = translations.get('frequency', med.frequency)
                med.notes = translations.get('notes', med.notes)

        return medications
```

#### 4.2 Update Router

**File: `backend/slices/emergency_access/infrastructure/api/emergency_access_router.py`**

```python
@router.get("/{qr_code}")
async def get_emergency_data(
    qr_code: str,
    lang: str = Query(default='es', regex='^(es|en|fr|de|ru|zh|ja|hi|id|tl)$'),
    use_case: GetEmergencyDataUseCase = Depends(get_emergency_data_use_case)
):
    """Get emergency patient data, optionally translated."""
    return await use_case.execute(qr_code=qr_code, language=lang)

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages for emergency access."""
    return {
        "languages": [
            {"code": "es", "name": "Español", "native": "Español"},
            {"code": "en", "name": "English", "native": "English"},
            {"code": "fr", "name": "French", "native": "Français"},
            {"code": "de", "name": "German", "native": "Deutsch"},
            {"code": "ru", "name": "Russian", "native": "Русский"},
            {"code": "zh", "name": "Chinese", "native": "中文"},
            {"code": "ja", "name": "Japanese", "native": "日本語"},
            {"code": "hi", "name": "Hindi", "native": "हिन्दी"},
            {"code": "id", "name": "Indonesian", "native": "Bahasa Indonesia"},
            {"code": "tl", "name": "Tagalog", "native": "Tagalog"}
        ]
    }
```

### Phase 5: Frontend Language Selector

#### 5.1 Emergency Language Selector Component

**File: `frontend/src/slices/emergency_access/components/molecules/EmergencyLanguageSelector.tsx`**

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'es', name: 'Español', native: 'Español', flag: 'es' },
  { code: 'en', name: 'English', native: 'English', flag: 'gb' },
  { code: 'fr', name: 'French', native: 'Français', flag: 'fr' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: 'de' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: 'ru' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: 'cn' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: 'jp' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: 'in' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: 'id' },
  { code: 'tl', name: 'Tagalog', native: 'Tagalog', flag: 'ph' }
];

interface Props {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  disabled?: boolean;
}

export function EmergencyLanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false
}: Props) {
  const t = useTranslations('emergency');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('language.selector.label')}
      </label>
      <div className="grid grid-cols-5 gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            disabled={disabled}
            className={`
              flex flex-col items-center p-2 rounded-lg border transition-all
              ${selectedLanguage === lang.code
                ? 'border-vitalgo-green bg-vitalgo-green/10 ring-2 ring-vitalgo-green'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className={`fi fi-${lang.flag} text-2xl mb-1`} />
            <span className="text-xs font-medium text-gray-700">{lang.native}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

#### 5.2 Update Emergency Access Page

**File: `frontend/src/slices/emergency_access/pages/EmergencyAccessPage.tsx`**

Add language state and selector:

```tsx
const [selectedLanguage, setSelectedLanguage] = useState('es');

// Modify API call to include language
const { data, loading, error } = useEmergencyData(qrCode, selectedLanguage);

// Add language selector to the page
<EmergencyLanguageSelector
  selectedLanguage={selectedLanguage}
  onLanguageChange={setSelectedLanguage}
  disabled={loading}
/>
```

#### 5.3 Update Emergency Data Hook

**File: `frontend/src/slices/emergency_access/hooks/useEmergencyData.ts`**

```tsx
export function useEmergencyData(qrCode: string, language: string = 'es') {
  const [data, setData] = useState<EmergencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await emergencyAccessService.getEmergencyData(qrCode, language);
        setData(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (qrCode) {
      fetchData();
    }
  }, [qrCode, language]); // Re-fetch when language changes

  return { data, loading, error };
}
```

### Phase 6: Migration for Existing Data

#### 6.1 Migration Script

**File: `backend/scripts/migrate_translations.py`**

```python
"""
One-time migration to translate all existing patient medical data.
Run with: python -m backend.scripts.migrate_translations
"""

import asyncio
from tqdm import tqdm

async def migrate_existing_data():
    """Translate all existing medical records to supported languages."""

    from slices.translations.services.translation_worker import translate_entity_async

    # Get all patients with medical data
    patients = await get_all_patients_with_data()

    for patient in tqdm(patients, desc="Migrating patients"):
        # Medications
        for med in patient.medications:
            translate_entity_async.delay(
                entity_type='medication',
                entity_id=med.id,
                entity_data={
                    'medication_name': med.medication_name,
                    'dosage': med.dosage,
                    'frequency': med.frequency,
                    'notes': med.notes
                }
            )

        # Allergies
        for allergy in patient.allergies:
            translate_entity_async.delay(
                entity_type='allergy',
                entity_id=allergy.id,
                entity_data={
                    'allergen': allergy.allergen,
                    'reaction_description': allergy.reaction_description
                }
            )

        # Illnesses
        for illness in patient.illnesses:
            translate_entity_async.delay(
                entity_type='illness',
                entity_id=illness.id,
                entity_data={
                    'illness_name': illness.illness_name,
                    'treatment_description': illness.treatment_description
                }
            )

        # Surgeries
        for surgery in patient.surgeries:
            translate_entity_async.delay(
                entity_type='surgery',
                entity_id=surgery.id,
                entity_data={
                    'procedure_name': surgery.procedure_name,
                    'complications': surgery.complications,
                    'anesthesia_type': surgery.anesthesia_type
                }
            )

if __name__ == '__main__':
    asyncio.run(migrate_existing_data())
```

---

## AWS Configuration

### Bedrock Setup

1. Enable Claude models in AWS Bedrock console
2. Create IAM role with `bedrock:InvokeModel` permission
3. Configure credentials in backend `.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

---

## Cost Estimates

Using Claude 3 Haiku via Bedrock:
- Input: $0.00025/1K tokens
- Output: $0.00125/1K tokens

| Scale | Patients/Month | Est. Cost |
|-------|----------------|-----------|
| Small | 100 | $5-10 |
| Medium | 500 | $25-50 |
| Large | 1000 | $50-100 |

*Plus one-time migration cost for existing data*

---

## Implementation Order

| Phase | Task | Priority |
|-------|------|----------|
| 1 | Database schema - Create translation tables | High |
| 2 | Bedrock service - Translation service with Claude | High |
| 3 | Cache service - Redis + DB caching layer | High |
| 4 | Translation worker - Background pre-translation | High |
| 5 | Hook into CRUD - Trigger translations on save | Medium |
| 6 | Emergency endpoint - Add language parameter | Medium |
| 7 | Frontend selector - Language picker component | Medium |
| 8 | Migration script - Translate existing data | Low |
| 9 | Testing - Integration tests for all languages | Low |

---

## Performance Guarantees

| Metric | Target |
|--------|--------|
| Emergency access latency | <100ms |
| Translation latency | Background (async) |
| Cache hit rate | >95% |
| Fallback | Original Spanish text |

---

## Files to Create/Modify

### New Files (Backend)
- `backend/slices/translations/` (new slice)
  - `domain/models/medical_translation.py`
  - `domain/models/supported_language.py`
  - `services/bedrock_translation_service.py`
  - `services/translation_cache_service.py`
  - `services/translation_worker.py`
- `backend/scripts/migrate_translations.py`
- `backend/alembic/versions/xxx_add_translations.py`

### Modified Files (Backend)
- `backend/slices/medications/application/use_cases/create_medication_use_case.py`
- `backend/slices/medications/application/use_cases/update_medication_use_case.py`
- `backend/slices/allergies/application/use_cases/create_allergy_use_case.py`
- `backend/slices/allergies/application/use_cases/update_allergy_use_case.py`
- `backend/slices/illnesses/application/use_cases/create_illness_use_case.py`
- `backend/slices/illnesses/application/use_cases/update_illness_use_case.py`
- `backend/slices/surgeries/application/use_cases/create_surgery_use_case.py`
- `backend/slices/surgeries/application/use_cases/update_surgery_use_case.py`
- `backend/slices/emergency_access/application/use_cases/get_emergency_data_use_case.py`
- `backend/slices/emergency_access/infrastructure/api/emergency_access_router.py`

### New Files (Frontend)
- `frontend/src/slices/emergency_access/components/molecules/EmergencyLanguageSelector.tsx`

### Modified Files (Frontend)
- `frontend/src/slices/emergency_access/pages/EmergencyAccessPage.tsx`
- `frontend/src/slices/emergency_access/hooks/useEmergencyData.ts`
- `frontend/src/slices/emergency_access/services/emergencyAccessService.ts`
- `frontend/messages/es.json` (add emergency.language.* keys)
- `frontend/messages/en.json` (add emergency.language.* keys)
