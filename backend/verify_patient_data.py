#!/usr/bin/env python3
"""
Script para verificar que los datos de información personal se guarden correctamente
"""
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import all models to ensure relationships are properly initialized
from slices.signup.domain.models.patient_model import Patient
from slices.signup.domain.models.user_model import User
from slices.signup.domain.models.login_attempt_model import LoginAttempt

# Database connection
DATABASE_URL = "postgresql://vitalgo_user:vitalgo_dev_password_2025@localhost:5432/vitalgo_dev"

def verify_patient_data(email: str):
    """
    Verifica que todos los campos de información personal estén guardados
    """
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Buscar paciente por email
        from slices.signup.domain.models.user_model import User
        user = session.query(User).filter(User.email == email).first()

        if not user:
            print(f"❌ Usuario con email {email} no encontrado")
            return

        patient = session.query(Patient).filter(Patient.user_id == user.id).first()

        if not patient:
            print(f"❌ Paciente no encontrado para usuario {email}")
            return

        print(f"\n✅ Paciente encontrado: {patient.first_name} {patient.last_name}")
        print(f"   Email: {user.email}")
        print("\n📊 INFORMACIÓN DEMOGRÁFICA:")
        print(f"   Sexo Biológico: {patient.biological_sex or '❌ NO GUARDADO'}")
        print(f"   Género: {patient.gender or '❌ NO GUARDADO'}")
        print(f"   Género Otro: {patient.gender_other or 'N/A'}")

        print("\n🌍 LUGAR DE NACIMIENTO:")
        print(f"   País: {patient.birth_country or '❌ NO GUARDADO'}")
        print(f"   País Otro: {patient.birth_country_other or 'N/A'}")
        print(f"   Departamento: {patient.birth_department or 'N/A'}")
        print(f"   Ciudad: {patient.birth_city or 'N/A'}")

        print("\n🏠 INFORMACIÓN DE RESIDENCIA:")
        print(f"   Dirección: {patient.residence_address or '❌ NO GUARDADO'}")
        print(f"   País: {patient.residence_country or '❌ NO GUARDADO'}")
        print(f"   País Otro: {patient.residence_country_other or 'N/A'}")
        print(f"   Departamento: {patient.residence_department or 'N/A'}")
        print(f"   Ciudad: {patient.residence_city or 'N/A'}")

        print("\n🩺 INFORMACIÓN MÉDICA:")
        print(f"   EPS: {patient.eps or 'N/A'}")
        print(f"   Tipo de Sangre: {patient.blood_type or 'N/A'}")
        print(f"   Contacto Emergencia: {patient.emergency_contact_name or 'N/A'}")
        print(f"   Teléfono Emergencia: {patient.emergency_contact_phone or 'N/A'}")

        # Verificar campos requeridos
        required_fields = {
            'biological_sex': patient.biological_sex,
            'gender': patient.gender,
            'birth_country': patient.birth_country,
            'residence_address': patient.residence_address,
            'residence_country': patient.residence_country
        }

        missing = [field for field, value in required_fields.items() if not value]

        if missing:
            print(f"\n⚠️  CAMPOS REQUERIDOS FALTANTES: {', '.join(missing)}")
        else:
            print("\n✅ TODOS LOS CAMPOS REQUERIDOS ESTÁN GUARDADOS")

    finally:
        session.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python verify_patient_data.py <email>")
        print("Ejemplo: python verify_patient_data.py test.patient4@gmail.com")
        sys.exit(1)

    email = sys.argv[1]
    verify_patient_data(email)
