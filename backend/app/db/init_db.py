"""
Script de inicialización de la base de datos.
Crea las tablas y opcionalmente inserta datos semilla para desarrollo.

Uso:
    python -m app.db.init_db
"""

import sys
import os

# Añadir el directorio padre al path para imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.db.database import engine, Base, SessionLocal
from app.models import User, Property, Service, Post, Comment, Favorite  # noqa
from app.middlewares.auth import hash_password


def create_tables():
    """Crea todas las tablas definidas en los modelos."""
    print("📦 Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas correctamente.")


def seed_data():
    """Inserta datos semilla para desarrollo y pruebas."""
    db = SessionLocal()

    try:
        # Verificar si ya hay datos
        if db.query(User).first():
            print("ℹ️  Ya existen datos en la BD. Saltando seed.")
            return

        print("🌱 Insertando datos semilla...")

        # --- Usuarios ---
        estudiante = User(
            email="estudiante@dormify.com",
            password_hash=hash_password("123456"),
            full_name="Carlos Martínez",
            phone="+57 300 123 4567",
            role="estudiante"
        )
        propietario = User(
            email="propietario@dormify.com",
            password_hash=hash_password("123456"),
            full_name="María López",
            phone="+57 310 987 6543",
            role="propietario"
        )
        proveedor = User(
            email="proveedor@dormify.com",
            password_hash=hash_password("123456"),
            full_name="Juan Pérez",
            phone="+57 320 555 1234",
            role="proveedor"
        )

        db.add_all([estudiante, propietario, proveedor])
        db.flush()

        # --- Propiedades ---
        properties = [
            Property(
                title="Habitación amoblada cerca de la Universidad Nacional",
                description="Habitación individual completamente amoblada, con baño privado, wifi incluido y servicios de aseo. Zona tranquila ideal para estudiantes. A solo 5 minutos caminando de la entrada principal de la universidad.",
                price=650000,
                address="Calle 45 #28-30, Bogotá",
                property_type="habitacion",
                university="Universidad Nacional de Colombia",
                images=[
                    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
                ],
                owner_id=propietario.id,
                lat=4.6382,
                lng=-74.0835
            ),
            Property(
                title="Apartaestudio moderno en Chapinero",
                description="Apartaestudio nuevo, cocina integral, zona de lavandería, portería 24 horas. Cerca de la Universidad Javeriana y con excelente acceso a transporte público. Ideal para una persona.",
                price=1200000,
                address="Carrera 7 #52-20, Bogotá",
                property_type="apartaestudio",
                university="Pontificia Universidad Javeriana",
                images=[
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
                    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800"
                ],
                owner_id=propietario.id,
                lat=4.6281,
                lng=-74.0650
            ),
            Property(
                title="Apartamento compartido para 3 estudiantes",
                description="Apartamento de 3 habitaciones, sala, cocina, 2 baños. Perfecto para compartir entre estudiantes. Incluye servicios de agua y gas. Wifi de alta velocidad. Zona universitaria.",
                price=850000,
                address="Calle 53 #15-40, Bogotá",
                property_type="apartamento",
                university="Universidad de los Andes",
                images=[
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
                ],
                owner_id=propietario.id,
                lat=4.6015,
                lng=-74.0665
            ),
            Property(
                title="Residencia Estudiantil Premium - Universidad del Rosario",
                description="Residencia estudiantil con habitaciones individuales y dobles. Incluye alimentación, wifi, áreas comunes de estudio, gimnasio y lavandería. Comunidad estudiantil activa.",
                price=1800000,
                address="Calle 12C #6-25, Bogotá",
                property_type="residencia",
                university="Universidad del Rosario",
                images=[
                    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
                    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800"
                ],
                owner_id=propietario.id,
                lat=4.6000,
                lng=-74.0724
            ),
            Property(
                title="Habitación económica barrio Teusaquillo",
                description="Habitación con cama sencilla y escritorio en casa familiar. Baño compartido, cocina disponible. Ambiente tranquilo, cerca del parque Simón Bolívar. Transporte fácil a varias universidades.",
                price=450000,
                address="Calle 34 #17-55, Bogotá",
                property_type="habitacion",
                university="Universidad Nacional de Colombia",
                images=[
                    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800"
                ],
                owner_id=propietario.id,
                lat=4.6297,
                lng=-74.0883
            ),
            Property(
                title="Apartaestudio luminoso cerca de la Sabana",
                description="Apartaestudio con excelente iluminación natural, closet amplio, cocina integral y balcón. Ubicado en zona residencial segura, a 10 minutos de la Universidad de La Sabana.",
                price=980000,
                address="Autopista Norte Km 7, Chía",
                property_type="apartaestudio",
                university="Universidad de La Sabana",
                images=[
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
                ],
                owner_id=propietario.id,
                lat=4.8611,
                lng=-74.0302
            ),
        ]
        db.add_all(properties)

        # --- Servicios ---
        services = [
            Service(
                name="Lavandería Express Universitaria",
                description="Servicio de lavado y secado de ropa con entrega a domicilio. Paquetes especiales para estudiantes. Lavado, secado y doblado en 24 horas. Descuento del 15% con carnet estudiantil.",
                category="lavanderia",
                location="Carrera 30 #45-10, Bogotá",
                images=["https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800"],
                schedule="Lunes a Sábado: 7:00 AM - 8:00 PM",
                contact_info="+57 301 234 5678 | lavanderia.express@email.com",
                provider_id=proveedor.id
            ),
            Service(
                name="PlomeroYa - Plomería de Emergencia",
                description="Servicio de plomería a domicilio, atendemos emergencias las 24 horas. Destape de cañerías, reparación de fugas, instalación de accesorios. Presupuesto sin compromiso.",
                category="plomeria",
                location="Bogotá D.C.",
                images=["https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800"],
                schedule="Lunes a Domingo: 24 horas",
                contact_info="+57 315 678 9012 | plomeroya@email.com",
                provider_id=proveedor.id
            ),
            Service(
                name="ElectriService - Electricista Certificado",
                description="Instalaciones eléctricas, reparaciones, cableado estructurado. Electricista certificado con más de 10 años de experiencia. Trabajo garantizado.",
                category="electricista",
                location="Bogotá D.C.",
                images=["https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800"],
                schedule="Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 9:00 AM - 2:00 PM",
                contact_info="+57 322 111 2233 | electriservice@email.com",
                provider_id=proveedor.id
            ),
            Service(
                name="Papelería y Centro de Copiado UniCopias",
                description="Impresiones, fotocopias, anillados, empastados, ploteos. Material de papelería. Descuentos para estudiantes en trabajos de grado y tesis.",
                category="papeleria",
                location="Calle 45 #30-15, frente a UniNacional",
                images=["https://images.unsplash.com/photo-1568205631564-838aca3a2bca?w=800"],
                schedule="Lunes a Viernes: 7:00 AM - 9:00 PM | Sábados: 8:00 AM - 5:00 PM",
                contact_info="+57 300 444 5566 | unicopias@email.com",
                provider_id=proveedor.id
            ),
            Service(
                name="MudanzasEstudiantiles.co",
                description="Servicio de mudanzas especializado en estudiantes. Traslados locales, embalaje, transporte seguro. Precios accesibles y servicio rápido. Vehiculos de diferentes tamaños.",
                category="mudanzas",
                location="Bogotá y alrededores",
                images=["https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800"],
                schedule="Lunes a Sábado: 7:00 AM - 7:00 PM",
                contact_info="+57 318 999 0000 | info@mudanzasestudiantiles.co",
                provider_id=proveedor.id
            ),
        ]
        db.add_all(services)

        # --- Posts del Foro ---
        posts = [
            Post(
                title="Busco roommate para apartamento en Chapinero",
                content="Hola! Tengo un cuarto disponible en un apto de 3 habitaciones en Chapinero, cerca de la Javeriana. El arriendo es de $600.000 por persona, todos los servicios incluidos. Busco alguien responsable y tranquilo/a. El apto tiene wifi, cocina equipada y zona de lavandería. ¿Alguien interesado?",
                category="roommate",
                author_id=estudiante.id
            ),
            Post(
                title="¿Qué barrio recomiendan para vivir siendo estudiante?",
                content="Voy a empezar semestre en la Universidad Nacional y no conozco bien Bogotá. ¿Qué barrios me recomiendan que sean seguros, económicos y cercanos a la universidad? Agradezco cualquier consejo, especialmente de quienes ya viven por la zona.",
                category="recomendacion",
                author_id=estudiante.id
            ),
            Post(
                title="Recomiendo la Residencia Estudiantil Campus Living",
                content="Llevo 6 meses viviendo en Campus Living cerca de la Universidad del Rosario y ha sido una experiencia increíble. Las habitaciones son cómodas, la comida es buena y he conocido gente de todo el mundo. El precio es un poco alto pero vale la pena por todo lo que incluye. Si alguien tiene preguntas, con gusto les cuento más!",
                category="recomendacion",
                author_id=estudiante.id
            ),
            Post(
                title="Consejos para primer semestre fuera de casa",
                content="Para los que están por empezar su vida universitaria lejos de casa: 1) Aprendan a cocinar al menos 5 platos básicos, 2) Hagan un presupuesto mensual, 3) No dejen todo para última hora, 4) Conozcan a sus vecinos, 5) Mantengan comunicación con su familia. ¿Qué otros consejos agregarían?",
                category="general",
                author_id=estudiante.id
            ),
        ]
        db.add_all(posts)
        db.flush()

        # --- Comentarios ---
        comments = [
            Comment(
                content="¡Me interesa! Yo estudio en la Javeriana también. ¿Puedo ir a ver el apto este fin de semana?",
                post_id=posts[0].id,
                author_id=proveedor.id
            ),
            Comment(
                content="Teusaquillo es excelente, tranquilo y bien conectado. También Galerías es buena opción.",
                post_id=posts[1].id,
                author_id=propietario.id
            ),
            Comment(
                content="Yo recomiendo Chapinero Alto si estudias en la Javeriana o la Piloto. Hay muchos arriendos para estudiantes.",
                post_id=posts[1].id,
                author_id=proveedor.id
            ),
        ]
        db.add_all(comments)

        # --- Favoritos ---
        fav1 = Favorite(user_id=estudiante.id, property_id=properties[0].id)
        fav2 = Favorite(user_id=estudiante.id, service_id=services[0].id)
        db.add_all([fav1, fav2])

        db.commit()
        print("✅ Datos semilla insertados correctamente.")
        print(f"   📧 Usuarios de prueba:")
        print(f"      - estudiante@dormify.com (contraseña: 123456)")
        print(f"      - propietario@dormify.com (contraseña: 123456)")
        print(f"      - proveedor@dormify.com (contraseña: 123456)")

    except Exception as e:
        db.rollback()
        print(f"❌ Error insertando datos semilla: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_tables()
    seed_data()
