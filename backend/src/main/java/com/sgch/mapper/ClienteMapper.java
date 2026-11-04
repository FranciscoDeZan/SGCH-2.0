package com.sgch.mapper;

import com.sgch.dto.ClienteRequest;
import com.sgch.dto.ClienteResponse;
import com.sgch.model.Cliente;
import com.sgch.model.CondicionFiscal;
import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    public Cliente toEntity(ClienteRequest request) {
        if (request == null) {
            return null;
        }

        Cliente entity = new Cliente();
        entity.setId(null);
        entity.setNombreRazonSocial(request.getNombreRazonSocial());
        entity.setCuit(request.getCuit());
        entity.setCondicionFiscal(request.getCondicionFiscal() != null
                ? request.getCondicionFiscal()
                : CondicionFiscal.RESPONSABLE_INSCRIPTO);
        entity.setTelefono(request.getTelefono());
        entity.setEmail(request.getEmail());
        entity.setDireccion(request.getDireccion());
        entity.setLatitud(request.getLatitud());
        entity.setLongitud(request.getLongitud());
        entity.setCalificacion(request.getCalificacion());
        entity.setTipoHacienda(request.getTipoHacienda());
        entity.setFormasPagoPreferidas(request.getFormasPagoPreferidas());
        entity.setObservaciones(request.getObservaciones());
        entity.setFechaUltimaOperacion(request.getFechaUltimaOperacion());
        entity.setFechaUltimoContacto(request.getFechaUltimoContacto());

        return entity;
    }

    public ClienteResponse toResponse(Cliente entity) {
        if (entity == null) {
            return null;
        }

        return new ClienteResponse(
                entity.getId(),
                entity.getNombreRazonSocial(),
                entity.getCuit(),
                entity.getCondicionFiscal() != null
                        ? entity.getCondicionFiscal()
                        : CondicionFiscal.RESPONSABLE_INSCRIPTO,
                entity.getTelefono(),
                entity.getEmail(),
                entity.getDireccion(),
                entity.getLatitud(),
                entity.getLongitud(),
                entity.getCalificacion(),
                entity.getTipoHacienda(),
                entity.getFormasPagoPreferidas(),
                entity.getObservaciones(),
                entity.getFechaUltimaOperacion(),
                entity.getFechaUltimoContacto()
        );
    }
}
