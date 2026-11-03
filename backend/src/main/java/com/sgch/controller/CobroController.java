package com.sgch.controller;

import com.sgch.dto.CobroRequest;
import com.sgch.dto.CobroResponse;
import com.sgch.service.CobroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador REST para la imputación y consulta de cobros y pagos pecuarios.
 * Expone endpoints bajo el prefijo canónico /api/v1/cobros.
 */
@RestController
@RequestMapping("/api/v1/cobros")
@RequiredArgsConstructor
public class CobroController {

    private final CobroService cobroService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CobroResponse create(@Valid @RequestBody CobroRequest request) {
        return cobroService.create(request);
    }

    @GetMapping
    public List<CobroResponse> getByOperacionId(@RequestParam(required = false) String operacionId) {
        if (operacionId == null || operacionId.isBlank()) {
            return List.of();
        }
        return cobroService.findByOperacionId(operacionId);
    }

    @GetMapping("/{id}")
    public CobroResponse getById(@PathVariable String id) {
        return cobroService.findById(id);
    }
}
