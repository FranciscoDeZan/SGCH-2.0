package com.sgch.mapper;

import com.sgch.dto.CobroRequest;
import com.sgch.dto.CobroResponse;
import com.sgch.model.Cliente;
import com.sgch.model.Cobro;
import com.sgch.model.CuotaOperacion;
import com.sgch.model.Operacion;
import org.springframework.stereotype.Component;

@Component
public class CobroMapper {

    public Cobro toEntity(CobroRequest request, Operacion operacion, CuotaOperacion cuota, Cliente cliente) {
        if (request == null) {
            return null;
        }

        Cobro entity = new Cobro();
        entity.setOperacion(operacion);
        entity.setCuota(cuota);
        entity.setCliente(cliente);
        entity.setTipoMovimiento(request.getTipoMovimiento());
        entity.setFechaMovimiento(request.getFechaMovimiento());
        entity.setMonto(request.getMonto());
        entity.setMedioPago(request.getMedioPago());
        entity.setDocumentado(request.getDocumentado() != null ? request.getDocumentado() : true);
        entity.setObservaciones(request.getObservaciones());
        return entity;
    }

    public CobroResponse toResponse(Cobro entity) {
        if (entity == null) {
            return null;
        }

        return new CobroResponse(
                entity.getId(),
                entity.getOperacion() != null ? entity.getOperacion().getId() : null,
                entity.getCuota() != null ? entity.getCuota().getId() : null,
                entity.getCuota() != null ? entity.getCuota().getNumeroCuota() : null,
                entity.getCliente() != null ? entity.getCliente().getId() : null,
                entity.getCliente() != null ? entity.getCliente().getNombreRazonSocial() : null,
                entity.getTipoMovimiento(),
                entity.getFechaMovimiento(),
                entity.getMonto(),
                entity.getMedioPago(),
                entity.getDocumentado(),
                entity.getObservaciones()
        );
    }
}
