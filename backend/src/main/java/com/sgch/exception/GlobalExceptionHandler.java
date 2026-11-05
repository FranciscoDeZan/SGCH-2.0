package com.sgch.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para la API REST.
 * Transforma las excepciones capturadas en respuestas estandarizadas
 * bajo el formato RFC 7807 (Problem Details).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * Maneja excepciones de recursos no encontrados (HTTP 404).
     *
     * @param ex excepción lanzada cuando no se localiza la entidad solicitada
     * @return objeto {@link ProblemDetail} con status 404 Not Found y el detalle del error
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /**
     * Maneja violaciones de restricciones de integridad de base de datos (HTTP 409).
     * Mapea causas específicas (unicidad de teléfono, CUIT, cuotas o claves foráneas)
     * a mensajes semánticos para el usuario bajo RFC 7807/9457.
     *
     * @param ex excepción de integridad de datos capturada
     * @return objeto {@link ProblemDetail} con status 409 Conflict
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        String detail = mapDataIntegrityDetail(ex);
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, detail);
    }

    private String mapDataIntegrityDetail(DataIntegrityViolationException ex) {
        Throwable cause = ex.getMostSpecificCause();
        String msg = (cause != null && cause.getMessage() != null)
                ? cause.getMessage().toLowerCase()
                : "";

        if (msg.contains("telefono")) {
            return "Ya existe un cliente registrado con ese teléfono";
        }
        if (msg.contains("uk_clientes_cuit") || msg.contains("cuit")) {
            return "Ya existe un cliente registrado con ese CUIT";
        }
        if (msg.contains("uk_cuota_operacion_numero")) {
            return "Ya existe una cuota con ese número para la operación";
        }
        if (msg.contains("foreign key") || msg.contains("fk_")) {
            return "No se puede completar la operación porque el registro tiene datos asociados";
        }
        return "Error de integridad de datos (ej. teléfono o CUIT duplicado)";
    }

    /**
     * Maneja fallos de validación de argumentos en solicitudes HTTP (HTTP 400).
     * Extrae las violaciones de campos y las incluye en la propiedad personalizada {@code errores}.
     *
     * @param ex excepción generada al fallar la validación con {@code @Valid}
     * @return objeto {@link ProblemDetail} con status 400 Bad Request y el mapa de campos con error
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (existing, replacement) -> existing
                ));
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validación fallida");
        pd.setProperty("errores", errors);
        return pd;
    }

    /**
     * Maneja violaciones de reglas de negocio y argumentos ilegales (HTTP 400).
     *
     * @param ex excepción lanzada ante argumentos inválidos o reglas cross-field no cumplidas
     * @return objeto {@link ProblemDetail} con status 400 Bad Request y el mensaje explicativo
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
}
