-- V2__create_operaciones_y_cobros.sql
-- Iteracion 2: Esquema para Operaciones, Cuotas y Cobros
-- R-056, R-057, R-060, R-063, R-066, R-069..R-080

-- ============================================================================
-- SECCION 1: Extension de tabla clientes
-- ============================================================================
ALTER TABLE clientes
    ADD COLUMN cuit VARCHAR(11) NULL,
    ADD COLUMN condicion_fiscal VARCHAR(30) NOT NULL DEFAULT 'RESPONSABLE_INSCRIPTO';

-- ============================================================================
-- SECCION 2: Tabla operaciones
-- ============================================================================
CREATE TABLE operaciones (
    id VARCHAR(36) PRIMARY KEY,
    fecha_carga DATETIME NOT NULL,
    fecha_operacion DATETIME NOT NULL,
    modalidad_circuito VARCHAR(30) NOT NULL,
    consignataria_externa VARCHAR(255) NULL,
    comprador_id VARCHAR(36) NOT NULL,
    vendedor_id VARCHAR(36) NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    subcategoria VARCHAR(100) NULL,
    kg_neto DECIMAL(12,2) NOT NULL,
    kg_origen_bruto DECIMAL(12,2) NULL,
    porcentaje_desbaste DECIMAL(5,2) NULL,
    kg_llegada_referencia DECIMAL(12,2) NULL,
    precio_kg_facturado DECIMAL(15,2) NOT NULL,
    monto_extra_cobrado_comprador DECIMAL(15,2) NULL,
    modalidad_precio VARCHAR(20) NOT NULL,
    precio_es_final BOOLEAN NOT NULL DEFAULT FALSE,
    comision_porcentaje_vendedor DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    comision_porcentaje_comprador DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    comision_total_cobrada_referencia DECIMAL(5,2) NULL,
    condicion_fiscal_vendedor VARCHAR(30) NOT NULL,
    porcentaje_documentado_ganado DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    porcentaje_documentado_comision_vendedor DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    porcentaje_documentado_comision_comprador DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    iva_ganado_monto_override DECIMAL(15,2) NULL,
    iva_comision_vendedor_override DECIMAL(15,2) NULL,
    iva_comision_comprador_override DECIMAL(15,2) NULL,
    con_garantia BOOLEAN NOT NULL DEFAULT TRUE,
    retenciones_externas_monto DECIMAL(15,2) NULL,
    condicion_entrega VARCHAR(30) NULL,
    flete_cargo_de VARCHAR(20) NULL,
    flete_monto DECIMAL(15,2) NULL,
    estado_liquidacion VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    forma_pago VARCHAR(100) NOT NULL,
    plazo VARCHAR(100) NULL,
    raza VARCHAR(50) NULL,
    color VARCHAR(100) NULL,
    puntuacion VARCHAR(50) NULL,
    destino VARCHAR(255) NULL,
    cantidad_machos INT NULL,
    cantidad_hembras INT NULL,
    terneros BOOLEAN NULL,
    observaciones TEXT NULL,

    CONSTRAINT fk_operaciones_comprador FOREIGN KEY (comprador_id) REFERENCES clientes(id),
    CONSTRAINT fk_operaciones_vendedor FOREIGN KEY (vendedor_id) REFERENCES clientes(id),

    INDEX idx_operaciones_comprador (comprador_id),
    INDEX idx_operaciones_vendedor (vendedor_id),
    INDEX idx_operaciones_fecha_operacion (fecha_operacion),
    INDEX idx_operaciones_estado_liquidacion (estado_liquidacion),
    INDEX idx_operaciones_circuito (modalidad_circuito)
);

-- ============================================================================
-- SECCION 3: Tabla cuotas_operacion
-- ============================================================================
CREATE TABLE cuotas_operacion (
    id VARCHAR(36) PRIMARY KEY,
    operacion_id VARCHAR(36) NOT NULL,
    numero_cuota INT NOT NULL,
    fecha_base_plazo VARCHAR(20) NOT NULL,
    dias_plazo_comprador INT NOT NULL,
    dias_descalce_vendedor INT NOT NULL DEFAULT 0,
    fecha_vencimiento_comprador DATE NOT NULL,
    fecha_vencimiento_vendedor DATE NOT NULL,
    monto_cuota DECIMAL(15,2) NOT NULL,
    estado_cobro VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    estado_pago VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT fk_cuotas_operacion FOREIGN KEY (operacion_id) REFERENCES operaciones(id) ON DELETE CASCADE,
    CONSTRAINT uk_cuota_operacion_numero UNIQUE (operacion_id, numero_cuota),

    INDEX idx_cuotas_venc_comprador (fecha_vencimiento_comprador),
    INDEX idx_cuotas_venc_vendedor (fecha_vencimiento_vendedor)
);

-- ============================================================================
-- SECCION 4: Tabla cobros
-- ============================================================================
CREATE TABLE cobros (
    id VARCHAR(36) PRIMARY KEY,
    operacion_id VARCHAR(36) NOT NULL,
    cuota_id VARCHAR(36) NULL,
    cliente_id VARCHAR(36) NOT NULL,
    tipo_movimiento VARCHAR(30) NOT NULL,
    fecha_movimiento DATE NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    medio_pago VARCHAR(30) NOT NULL,
    documentado BOOLEAN NOT NULL DEFAULT TRUE,
    observaciones TEXT NULL,

    CONSTRAINT fk_cobros_operacion FOREIGN KEY (operacion_id) REFERENCES operaciones(id),
    CONSTRAINT fk_cobros_cuota FOREIGN KEY (cuota_id) REFERENCES cuotas_operacion(id),
    CONSTRAINT fk_cobros_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),

    INDEX idx_cobros_operacion (operacion_id),
    INDEX idx_cobros_cuota (cuota_id),
    INDEX idx_cobros_cliente (cliente_id),
    INDEX idx_cobros_fecha (fecha_movimiento)
);
