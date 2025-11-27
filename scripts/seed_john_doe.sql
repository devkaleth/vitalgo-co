-- ============================================
-- CREATE TEST USER: John Doe (English Data)
-- ============================================
-- Email: john.doe@vitalgo.com
-- Password: JohnDoe123!
-- QR Code: 5a3cf81a-56f9-4fc3-ad23-4e7fede02d07
-- ============================================

-- Step 1: Create User (password: JohnDoe123!)
INSERT INTO users (
    id,
    email,
    password_hash,
    user_type,
    is_verified,
    failed_login_attempts,
    preferred_language,
    created_at,
    updated_at
) VALUES (
    '030b72a2-d798-47c5-916b-0aba0b24b339'::uuid,
    'john.doe@vitalgo.com',
    '$2b$12$aWqVfQBruFfXmT8wFsB02OBeAR7dxdDzs8NilwODEwE3vGcVXmgo2',
    'patient',
    true,
    0,
    'en',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Step 2: Create Patient Profile
INSERT INTO patients (
    id,
    user_id,
    qr_code,
    first_name,
    last_name,
    document_type_id,
    document_number,
    phone_international,
    country_code,
    dial_code,
    phone_number,
    birth_date,
    origin_country,
    accept_terms,
    accept_terms_date,
    accept_policy,
    accept_policy_date,
    biological_sex,
    blood_type,
    height,
    weight,
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_phone,
    created_at,
    updated_at
) VALUES (
    'de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid,
    '030b72a2-d798-47c5-916b-0aba0b24b339'::uuid,
    '5a3cf81a-56f9-4fc3-ad23-4e7fede02d07'::uuid,
    'John',
    'Doe',
    1,
    'JOHNDOE12345',
    '+15551234567',
    'US',
    '+1',
    '5551234567',
    '1985-03-15',
    'US',
    true,
    NOW(),
    true,
    NOW(),
    'M',
    'O+',
    180,
    82,
    'Jane Doe',
    'Spouse',
    '+15559876543',
    NOW(),
    NOW()
) ON CONFLICT (document_number) DO NOTHING;

-- Step 3: Insert Medications (English, various states)
INSERT INTO patient_medications (patient_id, medication_name, dosage, frequency, start_date, end_date, is_active, notes, prescribed_by, created_at, updated_at) VALUES
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Metformin', '500mg', 'Twice daily with meals', '2023-01-15', NULL, true, 'For type 2 diabetes management. Take with food to reduce stomach upset.', 'Dr. Sarah Johnson', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Lisinopril', '10mg', 'Once daily in the morning', '2023-03-01', NULL, true, 'ACE inhibitor for blood pressure control. Monitor potassium levels.', 'Dr. Sarah Johnson', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Atorvastatin', '20mg', 'Once daily at bedtime', '2022-06-10', NULL, true, 'Cholesterol management. Best taken in the evening.', 'Dr. Michael Chen', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Amoxicillin', '500mg', 'Three times daily for 10 days', '2024-08-01', '2024-08-10', false, 'Completed course for upper respiratory infection.', 'Dr. Emily White', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Ibuprofen', '400mg', 'As needed every 6 hours', '2024-05-15', '2024-06-01', false, 'For post-surgery pain management. Discontinued after recovery.', 'Dr. Robert Martinez', NOW(), NOW());

-- Step 4: Insert Allergies (English, various severities)
INSERT INTO patient_allergies (patient_id, allergen, severity_level, reaction_description, diagnosis_date, notes, created_at, updated_at) VALUES
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Penicillin', 'critica', 'Anaphylactic shock - severe throat swelling, difficulty breathing, drop in blood pressure. Requires immediate epinephrine.', '2010-05-20', 'LIFE-THREATENING. Always carry EpiPen. All penicillin-class antibiotics contraindicated.', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Shellfish', 'severa', 'Severe hives, facial swelling, vomiting within 30 minutes of ingestion.', '2015-08-12', 'Avoid all shellfish including shrimp, crab, lobster, and mussels. Cross-contamination risk at seafood restaurants.', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Latex', 'moderada', 'Contact dermatitis, localized itching and redness. No systemic reaction.', '2018-03-25', 'Use non-latex gloves during medical procedures. Notify staff before any medical appointment.', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Dust mites', 'leve', 'Mild nasal congestion and sneezing. Manageable with antihistamines.', '2020-01-10', 'Environmental allergy. Use allergen-proof bedding covers. Take Cetirizine during flare-ups.', NOW(), NOW());

-- Step 5: Insert Illnesses (English, various statuses)
INSERT INTO patient_illnesses (patient_id, illness_name, diagnosis_date, status, is_chronic, treatment_description, cie10_code, diagnosed_by, notes, created_at, updated_at) VALUES
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Type 2 Diabetes Mellitus', '2023-01-10', 'cronica', true, 'Managed with Metformin 500mg twice daily. Diet modification and regular exercise. A1C target below 7%.', 'E11.9', 'Dr. Sarah Johnson', 'Family history of diabetes. Regular monitoring every 3 months. Last A1C: 6.8%', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Essential Hypertension', '2023-02-28', 'cronica', true, 'Controlled with Lisinopril 10mg daily. Low sodium diet. Target BP below 130/80.', 'I10', 'Dr. Sarah Johnson', 'Monitor BP at home weekly. No end-organ damage detected.', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Hyperlipidemia', '2022-06-05', 'en_tratamiento', false, 'Atorvastatin 20mg nightly. Mediterranean diet recommended. Target LDL below 100 mg/dL.', 'E78.5', 'Dr. Michael Chen', 'Last lipid panel showed improvement. LDL reduced from 165 to 112 mg/dL.', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Gastroesophageal Reflux Disease', '2021-04-15', 'curada', false, 'Initially treated with Omeprazole 20mg daily for 8 weeks. Lifestyle modifications successful.', 'K21.0', 'Dr. Emily White', 'Resolved with dietary changes. No recurrence in over 2 years.', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Seasonal Allergic Rhinitis', '2020-04-01', 'activa', false, 'Cetirizine 10mg as needed during spring and fall. Nasal corticosteroid spray during peak seasons.', 'J30.2', 'Dr. Emily White', 'Symptoms worse during high pollen days. Consider immunotherapy if symptoms worsen.', NOW(), NOW());

-- Step 6: Insert Surgeries (English)
INSERT INTO patient_surgeries (patient_id, procedure_name, surgery_date, hospital_name, surgeon_name, anesthesia_type, duration_hours, notes, complications, created_at, updated_at) VALUES
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Laparoscopic Cholecystectomy', '2024-05-10', 'Memorial General Hospital', 'Dr. Robert Martinez', 'General anesthesia', 2, 'Gallbladder removal due to recurrent gallstones causing biliary colic. Four-port laparoscopic technique used.', 'Minor post-operative wound infection at umbilical port site. Treated with oral antibiotics. Resolved within 2 weeks.', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Arthroscopic Knee Surgery - Right', '2019-11-15', 'Sports Medicine Center', 'Dr. Amanda Torres', 'Regional anesthesia (spinal block)', 1, 'Meniscus repair for torn medial meniscus from sports injury. Physical therapy recommended for 6-8 weeks post-op.', NULL, NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Appendectomy', '2008-07-22', 'City Hospital', 'Dr. James Wilson', 'General anesthesia', 1, 'Emergency appendectomy for acute appendicitis. Open surgery approach due to perforation risk. Uneventful recovery.', 'None. Full recovery within 4 weeks.', NOW(), NOW()),
('de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid, 'Upper Gastrointestinal Endoscopy', '2021-03-20', 'Digestive Health Clinic', 'Dr. Emily White', 'Conscious sedation (Midazolam + Fentanyl)', 0, 'Diagnostic endoscopy to evaluate GERD symptoms. Biopsies taken from esophagus and stomach.', NULL, NOW(), NOW());

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'User created' as status, email, preferred_language FROM users WHERE email = 'john.doe@vitalgo.com';
SELECT 'Patient created' as status, first_name, last_name, qr_code FROM patients WHERE user_id = '030b72a2-d798-47c5-916b-0aba0b24b339'::uuid;
SELECT 'Medications' as category, COUNT(*) as count FROM patient_medications WHERE patient_id = 'de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid;
SELECT 'Allergies' as category, COUNT(*) as count FROM patient_allergies WHERE patient_id = 'de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid;
SELECT 'Illnesses' as category, COUNT(*) as count FROM patient_illnesses WHERE patient_id = 'de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid;
SELECT 'Surgeries' as category, COUNT(*) as count FROM patient_surgeries WHERE patient_id = 'de52cae4-5a69-4fd3-916f-3c002cb40eba'::uuid;
