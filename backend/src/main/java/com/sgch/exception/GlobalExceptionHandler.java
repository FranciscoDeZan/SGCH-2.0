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
     * Comúnmente lanzado al violar unicidad (ej. número de teléfono duplicado).
     *
     * @param ex excepción de integridad de datos capturada
     * @return objeto {@link ProblemDetail} con status 409 Conflict
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Error de integridad de datos (ej. teléfono duplicado)");
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
}
