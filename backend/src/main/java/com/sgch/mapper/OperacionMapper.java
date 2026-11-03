package com.sgch.mapper;

import com.sgch.dto.CalculoResultado;
import com.sgch.dto.CuotaOperacionRequest;
import com.sgch.dto.CuotaOperacionResponse;
import com.sgch.dto.OperacionRequest;
import com.sgch.dto.OperacionResponse;
import com.sgch.model.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Component
public class OperacionMapper {

    private static final BigDecimal DEFAULT_100 = new BigDecimal("100.00");

    public Operacion toEntity(OperacionRequest request, Cliente comprador, Cliente vendedor) {
        if (request == null) {
            return null;
        }

        Operacion entity = new Operacion();
        entity.setFechaCarga(LocalDateTime.now());
        entity.setFechaOperacion(request.getFechaOperacion());
        entity.setModalidadCircuito(request.getModalidadCircuito());
        entity.setConsignatariaExterna(request.getConsignatariaExterna());
        entity.setComprador(comprador);
        entity.setVendedor(vendedor);
        entity.setCondicionFiscalVendedor(vendedor != null && vendedor.getCondicionFiscal() != null
                ? vendedor.getCondicionFiscal()
                : CondicionFiscal.RESPONSABLE_INSCRIPTO);

        entity.setCategoria(request.getCategoria());
        entity.setSubcategoria(request.getSubcategoria());
        entity.setKgNeto(request.getKgNeto());
        entity.setKgOrigenBruto(request.getKgOrigenBruto());
        entity.setPorcentajeDesbaste(request.getPorcentajeDesbaste());
        entity.setKgLlegadaReferencia(request.getKgLlegadaReferencia());
        entity.setPrecioKgFacturado(request.getPrecioKgFacturado());
        entity.setMontoExtraCobradoComprador(request.getMontoExtraCobradoComprador());

        // Sincronización bidireccional modalidadPrecio <-> precioEsFinal
        if (request.getModalidadPrecio() == ModalidadPrecio.FINAL) {
            entity.setModalidadPrecio(ModalidadPrecio.FINAL);
            entity.setPrecioEsFinal(true);
        } else if (request.getModalidadPrecio() == ModalidadPrecio.NETO) {
            entity.setModalidadPrecio(ModalidadPrecio.NETO);
            entity.setPrecioEsFinal(false);
        } else if (Boolean.TRUE.equals(request.getPrecioEsFinal())) {
            entity.setModalidadPrecio(ModalidadPrecio.FINAL);
            entity.setPrecioEsFinal(true);
        } else {
            entity.setModalidadPrecio(ModalidadPrecio.NETO);
            entity.setPrecioEsFinal(false);
        }

        entity.setComisionPorcentajeVendedor(
                request.getComisionPorcentajeVendedor() != null ? request.getComisionPorcentajeVendedor() : BigDecimal.ZERO);
        entity.setComisionPorcentajeComprador(
                request.getComisionPorcentajeComprador() != null ? request.getComisionPorcentajeComprador() : BigDecimal.ZERO);
        entity.setComisionTotalCobradaReferencia(request.getComisionTotalCobradaReferencia());

        entity.setPorcentajeDocumentadoGanado(
                request.getPorcentajeDocumentadoGanado() != null ? request.getPorcentajeDocumentadoGanado() : DEFAULT_100);
        entity.setPorcentajeDocumentadoComisionVendedor(
                request.getPorcentajeDocumentadoComisionVendedor() != null ? request.getPorcentajeDocumentadoComisionVendedor() : DEFAULT_100);
        entity.setPorcentajeDocumentadoComisionComprador(
                request.getPorcentajeDocumentadoComisionComprador() != null ? request.getPorcentajeDocumentadoComisionComprador() : DEFAULT_100);

        entity.setIvaGanadoMontoOverride(request.getIvaGanadoMontoOverride());
        entity.setIvaComisionVendedorOverride(request.getIvaComisionVendedorOverride());
        entity.setIvaComisionCompradorOverride(request.getIvaComisionCompradorOverride());

        entity.setConGarantia(request.getConGarantia() != null ? request.getConGarantia() : true);
        entity.setRetencionesExternasMonto(request.getRetencionesExternasMonto());
        entity.setCondicionEntrega(request.getCondicionEntrega());
        entity.setFleteCargoDe(request.getFleteCargoDe());
        entity.setFleteMonto(request.getFleteMonto());
        entity.setEstadoLiquidacion(
                request.getEstadoLiquidacion() != null ? request.getEstadoLiquidacion() : EstadoLiquidacion.PENDIENTE);
        entity.setFormaPago(request.getFormaPago());
        entity.setPlazo(request.getPlazo());
        entity.setRaza(request.getRaza());
        entity.setColor(request.getColor());
        entity.setPuntuacion(request.getPuntuacion());
        entity.setDestino(request.getDestino());
        entity.setCantidadMachos(request.getCantidadMachos());
        entity.setCantidadHembras(request.getCantidadHembras());
        entity.setTerneros(request.getTerneros());
        entity.setObservaciones(request.getObservaciones());

        return entity;
    }

    public OperacionResponse toResponse(Operacion entity, List<CuotaOperacion> cuotas, CalculoResultado calculo) {
        if (entity == null) {
            return null;
        }

        List<CuotaOperacionResponse> cuotaResponses = cuotas != null
                ? cuotas.stream().filter(Objects::nonNull).map(this::toCuotaResponse).toList()
                : Collections.emptyList();

        return new OperacionResponse(
                entity.getId(),
                entity.getFechaCarga(),
                entity.getFechaOperacion(),
                entity.getModalidadCircuito(),
                entity.getConsignatariaExterna(),
                entity.getComprador() != null ? entity.getComprador().getId() : null,
                entity.getComprador() != null ? entity.getComprador().getNombreRazonSocial() : null,
                entity.getVendedor() != null ? entity.getVendedor().getId() : null,
                entity.getVendedor() != null ? entity.getVendedor().getNombreRazonSocial() : null,
                entity.getCategoria(),
                entity.getSubcategoria(),
                entity.getKgNeto(),
                entity.getKgOrigenBruto(),
                entity.getPorcentajeDesbaste(),
                entity.getKgLlegadaReferencia(),
                entity.getPrecioKgFacturado(),
                entity.getMontoExtraCobradoComprador(),
                entity.getModalidadPrecio(),
                entity.getPrecioEsFinal(),
                entity.getComisionPorcentajeVendedor(),
                entity.getComisionPorcentajeComprador(),
                entity.getComisionTotalCobradaReferencia(),
                entity.getCondicionFiscalVendedor(),
                entity.getPorcentajeDocumentadoGanado(),
                entity.getPorcentajeDocumentadoComisionVendedor(),
                entity.getPorcentajeDocumentadoComisionComprador(),
                entity.getIvaGanadoMontoOverride(),
                entity.getIvaComisionVendedorOverride(),
                entity.getIvaComisionCompradorOverride(),
                entity.getConGarantia(),
                entity.getRetencionesExternasMonto(),
                entity.getCondicionEntrega(),
                entity.getFleteCargoDe(),
                entity.getFleteMonto(),
                entity.getEstadoLiquidacion(),
                entity.getFormaPago(),
                entity.getPlazo(),
                entity.getRaza(),
                entity.getColor(),
                entity.getPuntuacion(),
                entity.getDestino(),
                entity.getCantidadMachos(),
                entity.getCantidadHembras(),
                entity.getTerneros(),
                entity.getObservaciones(),
                cuotaResponses,
                calculo
        );
    }

    public CuotaOperacion toCuotaEntity(CuotaOperacionRequest request, Operacion operacion) {
        if (request == null) {
            return null;
        }

        CuotaOperacion cuota = new CuotaOperacion();
        cuota.setOperacion(operacion);
        cuota.setNumeroCuota(request.getNumeroCuota());
        cuota.setFechaBasePlazo(request.getFechaBasePlazo());
        cuota.setDiasPlazoComprador(request.getDiasPlazoComprador());
        cuota.setDiasDescalceVendedor(request.getDiasDescalceVendedor() != null ? request.getDiasDescalceVendedor() : 0);
        cuota.setFechaVencimientoComprador(request.getFechaVencimientoComprador());
        cuota.setFechaVencimientoVendedor(request.getFechaVencimientoVendedor());
        cuota.setMontoCuota(request.getMontoCuota());
        cuota.setEstadoCobro(EstadoCuotaCobro.PENDIENTE);
        cuota.setEstadoPago(EstadoCuotaPago.PENDIENTE);
        return cuota;
    }

    public CuotaOperacionResponse toCuotaResponse(CuotaOperacion cuota) {
        if (cuota == null) {
            return null;
        }

        return new CuotaOperacionResponse(
                cuota.getId(),
                cuota.getNumeroCuota(),
                cuota.getFechaBasePlazo(),
                cuota.getDiasPlazoComprador(),
                cuota.getDiasDescalceVendedor(),
                cuota.getFechaVencimientoComprador(),
                cuota.getFechaVencimientoVendedor(),
                cuota.getMontoCuota(),
                cuota.getEstadoCobro(),
                cuota.getEstadoPago()
        );
    }
}
