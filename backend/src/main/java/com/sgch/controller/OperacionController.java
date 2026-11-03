package com.sgch.controller;

import com.sgch.dto.OperacionRequest;
import com.sgch.dto.OperacionResponse;
import com.sgch.model.EstadoLiquidacion;
import com.sgch.model.ModalidadCircuito;
import com.sgch.service.OperacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador REST para la gestión de operaciones comerciales de hacienda.
 * Expone endpoints bajo el prefijo canónico /api/v1/operaciones.
 */
@RestController
@RequestMapping("/api/v1/operaciones")
@RequiredArgsConstructor
public class OperacionController {

    private final OperacionService operacionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OperacionResponse create(@Valid @RequestBody OperacionRequest request) {
        return operacionService.create(request);
    }

    @GetMapping
    public List<OperacionResponse> getAll(
            @RequestParam(required = false) ModalidadCircuito circuito,
            @RequestParam(required = false) String clienteId,
            @RequestParam(required = false) EstadoLiquidacion estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        return operacionService.findAll(circuito, clienteId, estado, fechaDesde, fechaHasta);
    }

    @GetMapping("/{id}")
    public OperacionResponse getById(@PathVariable String id) {
        return operacionService.findById(id);
    }

    @PutMapping("/{id}")
    public OperacionResponse update(@PathVariable String id, @Valid @RequestBody OperacionRequest request) {
        return operacionService.update(id, request);
    }
}
