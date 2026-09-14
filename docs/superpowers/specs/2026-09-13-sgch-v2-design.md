# Especificación de Diseño - SGCH v2

## 1. Visión General y Alcance
El **SGCH v2** es un Sistema de Gestión para Consignatarios de Haciendas diseñado para reemplazar herramientas manuales y planillas de cálculo. Su foco está en el CRM, registro ágil de operaciones y un motor de sugerencias (matchmaking) para conectar oferta y demanda, asegurando que los operadores no pierdan oportunidades de venta.

## 2. Arquitectura de Software
Se adopta una arquitectura Cliente-Servidor separada (SPA + API REST).

### 2.1. Backend (API REST)
- **Lenguaje/Framework:** Java 17 + Spring Boot 3.
- **Persistencia:** Spring Data JPA (Hibernate) conectado a MySQL 8.
- **Seguridad:** *Decisión Arquitectónica (ADR):* La Autenticación (Spring Security) queda postergada a la Iteración 2 para agilizar el desarrollo del MVP en localhost. El documento debe resolverse como deuda técnica obligatoria antes del primer deploy a producción.
- **Manejo de Errores:** Se adopta el estándar RFC 7807 (`ProblemDetail` de Spring 6) para todas las respuestas de error de la API.
- **Documentación de Código:** JavaDoc riguroso en interfaces, servicios y controladores para cumplir con el RNF05 (Mantenibilidad).

### 2.2. Frontend (Single Page Application)
- **Stack:** React 18 inicializado con Vite (TypeScript).
- **Estilos:** Tailwind CSS.
- **Grillas/Tablas:** Se utilizará una librería de DataGrid para replicar la UX de una planilla de cálculo, permitiendo filtros nativos, ordenamiento y edición ágil (RNF01).
- **Mapas:** Integración con Leaflet para la georreferenciación (gratuito y sin API keys).

### 2.3. Base de Datos
- **Motor:** MySQL 8.0.
- **Geolocalización:** *Decisión Arquitectónica (ADR):* En la Iteración 1 y 2, se usarán columnas `DECIMAL(10,8)` y `DECIMAL(11,8)` para latitud y longitud por simplicidad (Principio YAGNI). En la Iteración 4 (Matchmaking geográfico avanzado), se planificará la migración `V2__Convert_lat_lng_to_point.sql` para usar tipos espaciales (`POINT`) y `ST_Distance_Sphere` solo si los requerimientos de cálculo de distancias superan las capacidades de fórmulas matemáticas simples en backend.

## 3. Modelo de Datos (Esquema Principal)

*Nota: Los IDs serán UUIDs autoincrementales manejados por JPA.*

1. **`clientes`**
   - `id`, `nombre_razon_social`, `telefono` (Único), `email`, `direccion`
   - `latitud` (Decimal), `longitud` (Decimal)
   - `calificacion` (Enum: A, B, C)
   - `tipo_hacienda`, `formas_pago_preferidas`, `observaciones`
   - `fecha_ultima_operacion`, `fecha_ultimo_contacto`
   
2. **`operaciones`**
   - `id`, `comprador_id` (FK), `vendedor_id` (FK)
   - `fecha_carga`, `categoria` (Enum), `subcategoria`
   - `kilogramos`, `precio_kg`, `tipo_precio` (Enum: MAS_IVA, FINAL), `porcentaje_facturado`
   - `comision`, `forma_pago`, `plazo`
   - `raza`, `color`, `puntuacion`, `destino`, `cant_machos`, `cant_hembras`, `terneros` (Boolean), `observaciones`
   - `estado_liquidacion` (Enum: PENDIENTE, PARCIAL, LIQUIDADO), `saldo_pendiente`

3. **`pagos_operacion`** (Manejo de liquidaciones y cobranzas)
   - `id`, `operacion_id` (FK), `monto`, `fecha_pago`, `observaciones`

4. **`interacciones_crm`**
   - `id`, `cliente_id` (FK), `fecha_hora`
   - `tipo_evento` (Enum: LLAMADA, WHATSAPP, REUNION)
   - `intencion` (Enum: COMPRA, VENTA, COTIZACION, SEGUIMIENTO)
   - `caracteristicas_tropa`, `detalle_observaciones`

## 4. Lógica de Negocio y Módulos Críticos

### 4.1. Cálculo de Precios e IVA
La API recibirá la operación con los kilogramos, precio y el flag `tipo_precio`. 
Si es `MAS_IVA`, la API calculará:
- `subtotal = kg * precio_kg`
- `iva = subtotal * 0.21 * (porcentaje_facturado / 100)`
- `total_final = subtotal + iva`
Estos campos calculados se guardarán en la DB para consultas históricas rápidas.

### 4.2. Motor de Matchmaking (Sugerencias)
El backend expondrá dos endpoints clave:
- `GET /api/matchmaking/compradores?categoria=X&raza=Y`
- `GET /api/matchmaking/ofertas?clienteId=Z`

### 4.3. Procesos en Segundo Plano (Cron Jobs)
Un `@Scheduled` en Spring Boot se ejecutará diariamente a las 01:00 AM para:
- Detectar clientes Inactivos (>180 días) y No Vendidos (>6 meses).
- Identificar operaciones con saldos pendientes cercanos a vencer.
- Generar una tabla de `resumen_diario_alertas`.

## 5. Decisiones de Diseño UI/UX
- **Navegación:** Menú lateral permanente colapsable.
- **Ficha Cliente:** Pantalla dividida. Izquierda: Datos duros y Mapa. Derecha: Pestañas de Historial de Operaciones, CRM (Llamadas) y Estado Financiero.
- **Formularios:** Uso de componentes tipo *Typeahead* (Autocompletar) para seleccionar compradores y vendedores rápidamente.

## 6. Plan Iterativo de Implementación
1. **Fundamentos:** Setup de Spring Boot, Vite, y CRUD de Clientes.
2. **Core Operativo:** Registro de Operaciones y cálculos matemáticos.
3. **Seguimiento CRM:** Registro de llamadas y alertas de inactividad.
4. **Inteligencia:** Motor de búsquedas avanzadas y Matchmaking.
5. **Dashboard:** Gráficos y reportes Excel.
