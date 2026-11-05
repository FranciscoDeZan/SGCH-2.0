package com.sgch.service;

import com.sgch.dto.CalculoResultado;
import com.sgch.dto.CuotaOperacionRequest;
import com.sgch.dto.OperacionRequest;
import com.sgch.dto.OperacionResponse;
import com.sgch.exception.ResourceNotFoundException;
import com.sgch.mapper.OperacionMapper;
import com.sgch.model.Cliente;
import com.sgch.model.CondicionFiscal;
import com.sgch.model.CuotaOperacion;
import com.sgch.model.EstadoCuotaCobro;
import com.sgch.model.EstadoCuotaPago;
import com.sgch.model.EstadoLiquidacion;
import com.sgch.model.FechaBasePlazo;
import com.sgch.model.ModalidadCircuito;
import com.sgch.model.ModalidadPrecio;
import com.sgch.model.Operacion;
import com.sgch.repository.ClienteRepository;
import com.sgch.repository.CuotaOperacionRepository;
import com.sgch.repository.OperacionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class OperacionService {

    private final OperacionRepository operacionRepository;
    private final ClienteRepository clienteRepository;
    private final CuotaOperacionRepository cuotaOperacionRepository;
    private final CalculadoraFinancieraService calculadoraFinancieraService;
    private final OperacionMapper operacionMapper;

    public OperacionResponse create(OperacionRequest request) {
        Cliente comprador = clienteRepository.findById(request.getCompradorId())
                .orElseThrow(() -> new ResourceNotFoundException("Comprador no encontrado con id: " + request.getCompradorId()));
        Cliente vendedor = clienteRepository.findById(request.getVendedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendedor no encontrado con id: " + request.getVendedorId()));

        validarReglasNegocio(request);

        Operacion entity = operacionMapper.toEntity(request, comprador, vendedor);
        // Regla RN05 y Finding NA-009: al crear, siempre forzar estado PENDIENTE
        entity.setEstadoLiquidacion(EstadoLiquidacion.PENDIENTE);

        Operacion savedOperacion = operacionRepository.save(entity);

        List<CuotaOperacion> cuotasPersistidas;
        if (request.getCuotas() != null && !request.getCuotas().isEmpty()) {
            cuotasPersistidas = guardarCuotasExplicitas(request.getCuotas(), savedOperacion);
        } else {
            cuotasPersistidas = generarCuotasPorDefecto(request, savedOperacion);
        }

        // Actualizar fechaUltimaOperacion en comprador y vendedor
        LocalDateTime now = LocalDateTime.now();
        comprador.setFechaUltimaOperacion(now);
        clienteRepository.save(comprador);
        if (!vendedor.getId().equals(comprador.getId())) {
            vendedor.setFechaUltimaOperacion(now);
            clienteRepository.save(vendedor);
        }

        CalculoResultado calculo = calculadoraFinancieraService.calcular(savedOperacion);
        return operacionMapper.toResponse(savedOperacion, cuotasPersistidas, calculo);
    }

    @Transactional(readOnly = true)
    public List<OperacionResponse> findAll(
            ModalidadCircuito circuito,
            String clienteId,
            EstadoLiquidacion estado,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        Specification<Operacion> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (circuito != null) {
                predicates.add(cb.equal(root.get("modalidadCircuito"), circuito));
            }
            if (clienteId != null && !clienteId.isBlank()) {
                predicates.add(cb.or(
                        cb.equal(root.get("comprador").get("id"), clienteId),
                        cb.equal(root.get("vendedor").get("id"), clienteId)
                ));
            }
            if (estado != null) {
                predicates.add(cb.equal(root.get("estadoLiquidacion"), estado));
            }
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaOperacion"), fechaDesde));
            }
            if (fechaHasta != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fechaOperacion"), fechaHasta));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return operacionRepository.findAll(spec).stream()
                .map(op -> {
                    List<CuotaOperacion> cuotas = cuotaOperacionRepository.findByOperacionIdOrderByNumeroCuotaAsc(op.getId());
                    CalculoResultado calculo = calculadoraFinancieraService.calcular(op);
                    return operacionMapper.toResponse(op, cuotas, calculo);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public OperacionResponse findById(String id) {
        Operacion op = operacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operacion no encontrada con id: " + id));
        List<CuotaOperacion> cuotas = cuotaOperacionRepository.findByOperacionIdOrderByNumeroCuotaAsc(id);
        CalculoResultado calculo = calculadoraFinancieraService.calcular(op);
        return operacionMapper.toResponse(op, cuotas, calculo);
    }

    public OperacionResponse update(String id, OperacionRequest request) {
        Operacion op = operacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operacion no encontrada con id: " + id));

        Cliente comprador = clienteRepository.findById(request.getCompradorId())
                .orElseThrow(() -> new ResourceNotFoundException("Comprador no encontrado con id: " + request.getCompradorId()));
        Cliente vendedor = clienteRepository.findById(request.getVendedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendedor no encontrado con id: " + request.getVendedorId()));

        validarReglasNegocio(request);

        op.setFechaOperacion(request.getFechaOperacion());
        op.setModalidadCircuito(request.getModalidadCircuito());
        op.setConsignatariaExterna(request.getConsignatariaExterna());
        op.setComprador(comprador);
        op.setVendedor(vendedor);
        op.setCondicionFiscalVendedor(vendedor != null && vendedor.getCondicionFiscal() != null
                ? vendedor.getCondicionFiscal()
                : CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setCategoria(request.getCategoria());
        op.setSubcategoria(request.getSubcategoria());
        op.setKgNeto(request.getKgNeto());
        op.setKgOrigenBruto(request.getKgOrigenBruto());
        op.setPorcentajeDesbaste(request.getPorcentajeDesbaste());
        op.setKgLlegadaReferencia(request.getKgLlegadaReferencia());
        op.setPrecioKgFacturado(request.getPrecioKgFacturado());
        op.setMontoExtraCobradoComprador(request.getMontoExtraCobradoComprador());

        if (request.getModalidadPrecio() == ModalidadPrecio.FINAL) {
            op.setModalidadPrecio(ModalidadPrecio.FINAL);
            op.setPrecioEsFinal(true);
        } else if (request.getModalidadPrecio() == ModalidadPrecio.NETO) {
            op.setModalidadPrecio(ModalidadPrecio.NETO);
            op.setPrecioEsFinal(false);
        } else if (Boolean.TRUE.equals(request.getPrecioEsFinal())) {
            op.setModalidadPrecio(ModalidadPrecio.FINAL);
            op.setPrecioEsFinal(true);
        } else {
            op.setModalidadPrecio(ModalidadPrecio.NETO);
            op.setPrecioEsFinal(false);
        }

        op.setComisionPorcentajeVendedor(request.getComisionPorcentajeVendedor() != null ? request.getComisionPorcentajeVendedor() : BigDecimal.ZERO);
        op.setComisionPorcentajeComprador(request.getComisionPorcentajeComprador() != null ? request.getComisionPorcentajeComprador() : BigDecimal.ZERO);
        op.setComisionTotalCobradaReferencia(request.getComisionTotalCobradaReferencia());
        op.setPorcentajeDocumentadoGanado(request.getPorcentajeDocumentadoGanado() != null ? request.getPorcentajeDocumentadoGanado() : new BigDecimal("100.00"));
        op.setPorcentajeDocumentadoComisionVendedor(request.getPorcentajeDocumentadoComisionVendedor() != null ? request.getPorcentajeDocumentadoComisionVendedor() : new BigDecimal("100.00"));
        op.setPorcentajeDocumentadoComisionComprador(request.getPorcentajeDocumentadoComisionComprador() != null ? request.getPorcentajeDocumentadoComisionComprador() : new BigDecimal("100.00"));
        op.setIvaGanadoMontoOverride(request.getIvaGanadoMontoOverride());
        op.setIvaComisionVendedorOverride(request.getIvaComisionVendedorOverride());
        op.setIvaComisionCompradorOverride(request.getIvaComisionCompradorOverride());
        op.setConGarantia(request.getConGarantia() != null ? request.getConGarantia() : true);
        op.setRetencionesExternasMonto(request.getRetencionesExternasMonto());
        op.setCondicionEntrega(request.getCondicionEntrega());
        op.setFleteCargoDe(request.getFleteCargoDe());
        op.setFleteMonto(request.getFleteMonto());
        if (request.getEstadoLiquidacion() != null) {
            op.setEstadoLiquidacion(request.getEstadoLiquidacion());
        }
        op.setFormaPago(request.getFormaPago());
        op.setPlazo(request.getPlazo());
        op.setRaza(request.getRaza());
        op.setColor(request.getColor());
        op.setPuntuacion(request.getPuntuacion());
        op.setDestino(request.getDestino());
        op.setCantidadMachos(request.getCantidadMachos());
        op.setCantidadHembras(request.getCantidadHembras());
        op.setTerneros(request.getTerneros());
        op.setObservaciones(request.getObservaciones());

        if (request.getCuotas() != null && !request.getCuotas().isEmpty()) {
            cuotaOperacionRepository.deleteByOperacionId(id);
            guardarCuotasExplicitas(request.getCuotas(), op);
        }

        Operacion updated = operacionRepository.save(op);
        List<CuotaOperacion> cuotas = cuotaOperacionRepository.findByOperacionIdOrderByNumeroCuotaAsc(id);
        CalculoResultado calculo = calculadoraFinancieraService.calcular(updated);
        return operacionMapper.toResponse(updated, cuotas, calculo);
    }

    // =========================================================================
    // Helpers privados
    // =========================================================================

    private void validarReglasNegocio(OperacionRequest request) {
        if (request.getModalidadCircuito() == ModalidadCircuito.CONSIGNATARIA_EXTERNA) {
            if (request.getConsignatariaExterna() == null || request.getConsignatariaExterna().isBlank()) {
                throw new IllegalArgumentException("La consignataria externa es obligatoria para el circuito CONSIGNATARIA_EXTERNA");
            }
        } else {
            if (request.getRetencionesExternasMonto() != null) {
                throw new IllegalArgumentException("Las retenciones externas solo estan permitidas en circuito CONSIGNATARIA_EXTERNA");
            }
        }

        if (request.getModalidadCircuito() == ModalidadCircuito.PROPIA) {
            BigDecimal comVend = request.getComisionPorcentajeVendedor() != null
                    ? request.getComisionPorcentajeVendedor()
                    : BigDecimal.ZERO;
            BigDecimal comComp = request.getComisionPorcentajeComprador() != null
                    ? request.getComisionPorcentajeComprador()
                    : BigDecimal.ZERO;

            if (comVend.compareTo(BigDecimal.ZERO) > 0 && comComp.compareTo(BigDecimal.ZERO) > 0) {
                throw new IllegalArgumentException("En circuito PROPIA al menos una comision debe ser 0.00");
            }
        }

        if (request.getCuotas() != null && request.getCuotas().size() > 1) {
            FechaBasePlazo baseComun = null;
            for (CuotaOperacionRequest cuotaReq : request.getCuotas()) {
                FechaBasePlazo baseEfectiva = cuotaReq.getFechaBasePlazo() != null
                        ? cuotaReq.getFechaBasePlazo()
                        : FechaBasePlazo.CARGA;
                if (baseComun == null) {
                    baseComun = baseEfectiva;
                } else if (baseComun != baseEfectiva) {
                    throw new IllegalArgumentException("Todas las cuotas de la operacion deben compartir la misma fecha base de plazo (CARGA o REMATE)");
                }
            }
        }
    }

    private List<CuotaOperacion> guardarCuotasExplicitas(List<CuotaOperacionRequest> cuotaRequests, Operacion operacion) {
        List<CuotaOperacion> list = new ArrayList<>();
        int descalceDefault = operacion.getModalidadCircuito() == ModalidadCircuito.CONSIGNATARIA_EXTERNA ? 7 : 0;
        LocalDate baseDate = operacion.getFechaOperacion() != null ? operacion.getFechaOperacion().toLocalDate() : LocalDate.now();

        for (int i = 0; i < cuotaRequests.size(); i++) {
            CuotaOperacionRequest req = cuotaRequests.get(i);
            CuotaOperacion cuota = operacionMapper.toCuotaEntity(req, operacion);
            if (cuota.getNumeroCuota() == null) {
                cuota.setNumeroCuota(i + 1);
            }
            if (cuota.getFechaBasePlazo() == null) {
                cuota.setFechaBasePlazo(FechaBasePlazo.CARGA);
            }
            if (req.getDiasDescalceVendedor() == null) {
                cuota.setDiasDescalceVendedor(descalceDefault);
            }
            if (cuota.getFechaVencimientoComprador() == null && cuota.getDiasPlazoComprador() != null) {
                cuota.setFechaVencimientoComprador(baseDate.plusDays(cuota.getDiasPlazoComprador()));
            }
            if (cuota.getFechaVencimientoVendedor() == null && cuota.getFechaVencimientoComprador() != null) {
                cuota.setFechaVencimientoVendedor(cuota.getFechaVencimientoComprador().plusDays(cuota.getDiasDescalceVendedor()));
            }
            list.add(cuota);
        }
        return cuotaOperacionRepository.saveAll(list);
    }

    private List<CuotaOperacion> generarCuotasPorDefecto(OperacionRequest request, Operacion operacion) {
        List<Integer> diasList = extraerDiasPlazo(request.getPlazo());
        int n = diasList.size();
        int descalce = operacion.getModalidadCircuito() == ModalidadCircuito.CONSIGNATARIA_EXTERNA ? 7 : 0;
        LocalDate baseDate = request.getFechaOperacion() != null ? request.getFechaOperacion().toLocalDate() : LocalDate.now();

        BigDecimal subtotalGanado = calculadoraFinancieraService.calcularSubtotalGanado(operacion);
        if (subtotalGanado == null) {
            subtotalGanado = BigDecimal.ZERO;
        }
        BigDecimal ivaGanado = calculadoraFinancieraService.calcularIvaGanado(operacion);
        if (ivaGanado == null) {
            ivaGanado = BigDecimal.ZERO;
        }

        List<CuotaOperacion> list = new ArrayList<>();

        if (operacion.getModalidadCircuito() == ModalidadCircuito.CONSIGNATARIA_EXTERNA) {
            BigDecimal capitalPorCuota = subtotalGanado.divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);
            BigDecimal sumaCapitalPrevio = BigDecimal.ZERO;

            for (int i = 0; i < n; i++) {
                CuotaOperacion cuota = new CuotaOperacion();
                cuota.setOperacion(operacion);
                cuota.setNumeroCuota(i + 1);
                cuota.setFechaBasePlazo(FechaBasePlazo.CARGA);
                int diasPlazo = diasList.get(i);
                cuota.setDiasPlazoComprador(diasPlazo);
                cuota.setDiasDescalceVendedor(descalce);
                cuota.setFechaVencimientoComprador(baseDate.plusDays(diasPlazo));
                cuota.setFechaVencimientoVendedor(baseDate.plusDays(diasPlazo + descalce));
                cuota.setEstadoCobro(EstadoCuotaCobro.PENDIENTE);
                cuota.setEstadoPago(EstadoCuotaPago.PENDIENTE);

                if (i == 0) {
                    cuota.setMontoCuota(capitalPorCuota.add(ivaGanado).setScale(2, RoundingMode.HALF_UP));
                    sumaCapitalPrevio = sumaCapitalPrevio.add(capitalPorCuota);
                } else if (i < n - 1) {
                    cuota.setMontoCuota(capitalPorCuota);
                    sumaCapitalPrevio = sumaCapitalPrevio.add(capitalPorCuota);
                } else {
                    BigDecimal capitalUltimaCuota = subtotalGanado.subtract(sumaCapitalPrevio).setScale(2, RoundingMode.HALF_UP);
                    cuota.setMontoCuota(capitalUltimaCuota);
                }
                list.add(cuota);
            }
        } else {
            // DIRECTO o PROPIA (partes iguales, última cuota absorbe redondeo)
            BigDecimal totalHacienda = subtotalGanado.add(ivaGanado).setScale(2, RoundingMode.HALF_UP);
            BigDecimal montoBase = totalHacienda.divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);
            BigDecimal sumaPrevia = BigDecimal.ZERO;

            for (int i = 0; i < n; i++) {
                CuotaOperacion cuota = new CuotaOperacion();
                cuota.setOperacion(operacion);
                cuota.setNumeroCuota(i + 1);
                cuota.setFechaBasePlazo(FechaBasePlazo.CARGA);
                int diasPlazo = diasList.get(i);
                cuota.setDiasPlazoComprador(diasPlazo);
                cuota.setDiasDescalceVendedor(descalce);
                cuota.setFechaVencimientoComprador(baseDate.plusDays(diasPlazo));
                cuota.setFechaVencimientoVendedor(baseDate.plusDays(diasPlazo + descalce));
                cuota.setEstadoCobro(EstadoCuotaCobro.PENDIENTE);
                cuota.setEstadoPago(EstadoCuotaPago.PENDIENTE);

                if (i < n - 1) {
                    cuota.setMontoCuota(montoBase);
                    sumaPrevia = sumaPrevia.add(montoBase);
                } else {
                    BigDecimal montoUltima = totalHacienda.subtract(sumaPrevia).setScale(2, RoundingMode.HALF_UP);
                    cuota.setMontoCuota(montoUltima);
                }
                list.add(cuota);
            }
        }

        return cuotaOperacionRepository.saveAll(list);
    }

    private List<Integer> extraerDiasPlazo(String plazo) {
        if (plazo == null || plazo.isBlank()) {
            return List.of(30);
        }
        List<Integer> dias = new ArrayList<>();
        Matcher matcher = Pattern.compile("\\d+").matcher(plazo);
        while (matcher.find()) {
            try {
                dias.add(Integer.parseInt(matcher.group()));
            } catch (NumberFormatException ignored) {}
        }
        if (dias.isEmpty()) {
            return List.of(0);
        }
        return dias;
    }
}
