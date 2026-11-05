package com.sgch.service;

import com.sgch.dto.CobroRequest;
import com.sgch.dto.CobroResponse;
import com.sgch.exception.ResourceNotFoundException;
import com.sgch.mapper.CobroMapper;
import com.sgch.model.Cliente;
import com.sgch.model.Cobro;
import com.sgch.model.CuotaOperacion;
import com.sgch.model.EstadoCuotaCobro;
import com.sgch.model.EstadoCuotaPago;
import com.sgch.model.EstadoLiquidacion;
import com.sgch.model.Operacion;
import com.sgch.model.TipoMovimientoCobro;
import com.sgch.repository.ClienteRepository;
import com.sgch.repository.CobroRepository;
import com.sgch.repository.CuotaOperacionRepository;
import com.sgch.repository.OperacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class CobroService {

    private final CobroRepository cobroRepository;
    private final OperacionRepository operacionRepository;
    private final CuotaOperacionRepository cuotaOperacionRepository;
    private final ClienteRepository clienteRepository;
    private final CalculadoraFinancieraService calculadoraFinancieraService;
    private final CobroMapper cobroMapper;

    /**
     * Registra un nuevo movimiento de cobro o pago asociado a una operación o cuota,
     * actualizando los estados de cobro/pago de la cuota y de liquidación de la operación.
     *
     * @param request datos del cobro o pago a registrar
     * @return respuesta con los datos del cobro persistido
     * @throws ResourceNotFoundException si la operación, cliente o cuota no existen
     * @throws IllegalArgumentException si la cuota no pertenece a la operación indicada
     */
    public CobroResponse create(CobroRequest request) {
        Operacion operacion = operacionRepository.findById(request.getOperacionId())
                .orElseThrow(() -> new ResourceNotFoundException("Operacion no encontrada con id: " + request.getOperacionId()));

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + request.getClienteId()));

        CuotaOperacion cuota = null;
        if (request.getCuotaId() != null && !request.getCuotaId().isBlank()) {
            cuota = cuotaOperacionRepository.findById(request.getCuotaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cuota no encontrada con id: " + request.getCuotaId()));

            // Validación cruzada de pertenencia de cuota a la operación
            if (cuota.getOperacion() == null || !cuota.getOperacion().getId().equals(operacion.getId())) {
                throw new IllegalArgumentException("La cuota no pertenece a la operacion indicada");
            }
        }

        Cobro cobro = cobroMapper.toEntity(request, operacion, cuota, cliente);
        Cobro savedCobro = cobroRepository.save(cobro);

        if (cuota != null) {
            actualizarEstadoCuota(cuota);
        }

        actualizarEstadoLiquidacionOperacion(operacion);

        return cobroMapper.toResponse(savedCobro);
    }

    /**
     * Obtiene la lista ordenada cronológicamente de cobros y pagos imputados a una operación.
     *
     * @param operacionId identificador único de la operación
     * @return lista de movimientos de cobro/pago registrados
     */
    @Transactional(readOnly = true)
    public List<CobroResponse> findByOperacionId(String operacionId) {
        return cobroRepository.findByOperacionIdOrderByFechaMovimientoAsc(operacionId).stream()
                .map(cobroMapper::toResponse)
                .toList();
    }

    /**
     * Obtiene el detalle de un movimiento de cobro o pago por su identificador único.
     *
     * @param id identificador único del cobro
     * @return detalle del movimiento de cobro/pago
     * @throws ResourceNotFoundException si el cobro no existe
     */
    @Transactional(readOnly = true)
    public CobroResponse findById(String id) {
        Cobro cobro = cobroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cobro no encontrado con id: " + id));
        return cobroMapper.toResponse(cobro);
    }

    // =========================================================================
    // Helpers privados
    // =========================================================================

    private void actualizarEstadoCuota(CuotaOperacion cuota) {
        List<Cobro> cobrosCuota = cobroRepository.findByCuotaIdOrderByFechaMovimientoAsc(cuota.getId());
        BigDecimal montoCuota = cuota.getMontoCuota() != null ? cuota.getMontoCuota() : BigDecimal.ZERO;

        BigDecimal sumaCobrosComprador = cobrosCuota.stream()
                .filter(c -> c.getTipoMovimiento() == TipoMovimientoCobro.COBRO_COMPRADOR)
                .map(Cobro::getMonto)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (sumaCobrosComprador.compareTo(BigDecimal.ZERO) == 0) {
            cuota.setEstadoCobro(EstadoCuotaCobro.PENDIENTE);
        } else if (sumaCobrosComprador.compareTo(montoCuota) < 0) {
            cuota.setEstadoCobro(EstadoCuotaCobro.PARCIAL);
        } else {
            cuota.setEstadoCobro(EstadoCuotaCobro.COBRADO);
        }

        BigDecimal sumaPagosVendedor = cobrosCuota.stream()
                .filter(c -> c.getTipoMovimiento() == TipoMovimientoCobro.PAGO_VENDEDOR)
                .map(Cobro::getMonto)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (sumaPagosVendedor.compareTo(BigDecimal.ZERO) == 0) {
            cuota.setEstadoPago(EstadoCuotaPago.PENDIENTE);
        } else if (sumaPagosVendedor.compareTo(montoCuota) < 0) {
            cuota.setEstadoPago(EstadoCuotaPago.PARCIAL);
        } else {
            cuota.setEstadoPago(EstadoCuotaPago.PAGADO);
        }

        cuotaOperacionRepository.save(cuota);
    }

    private void actualizarEstadoLiquidacionOperacion(Operacion operacion) {
        BigDecimal saldoHacienda = calculadoraFinancieraService.calcularSaldoHaciendaEntrePartes(operacion);
        if (saldoHacienda == null) {
            saldoHacienda = BigDecimal.ZERO;
        }
        BigDecimal saldoComision = calculadoraFinancieraService.calcularSaldoComisionFirma(operacion);
        if (saldoComision == null) {
            saldoComision = BigDecimal.ZERO;
        }

        List<Cobro> cobrosOperacion = cobroRepository.findByOperacionIdOrderByFechaMovimientoAsc(operacion.getId());

        BigDecimal sumaCobrosHacienda = cobrosOperacion.stream()
                .filter(c -> c.getTipoMovimiento() == TipoMovimientoCobro.COBRO_COMPRADOR)
                .map(Cobro::getMonto)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal sumaCobrosComision = cobrosOperacion.stream()
                .filter(c -> c.getTipoMovimiento() == TipoMovimientoCobro.COBRO_COMISION)
                .map(Cobro::getMonto)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        boolean haciendaCubierta = saldoHacienda.compareTo(BigDecimal.ZERO) == 0
                || sumaCobrosHacienda.compareTo(saldoHacienda) >= 0;

        boolean comisionCubierta = saldoComision.compareTo(BigDecimal.ZERO) == 0
                || sumaCobrosComision.compareTo(saldoComision) >= 0;

        // Regla RN05 y semántica R-083 (Opción A):
        // Ambos saldos deben estar cubiertos para LIQUIDADO.
        if (haciendaCubierta && comisionCubierta) {
            operacion.setEstadoLiquidacion(EstadoLiquidacion.LIQUIDADO);
        } else if (sumaCobrosHacienda.compareTo(BigDecimal.ZERO) > 0 || sumaCobrosComision.compareTo(BigDecimal.ZERO) > 0) {
            operacion.setEstadoLiquidacion(EstadoLiquidacion.PARCIALMENTE_PAGADO);
        } else {
            operacion.setEstadoLiquidacion(EstadoLiquidacion.PENDIENTE);
        }

        operacionRepository.save(operacion);
    }
}
