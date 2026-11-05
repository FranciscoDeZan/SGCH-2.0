package com.sgch.repository;

import com.sgch.model.EstadoLiquidacion;
import com.sgch.model.ModalidadCircuito;
import com.sgch.model.Operacion;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperacionRepository extends JpaRepository<Operacion, String>, JpaSpecificationExecutor<Operacion> {

    @Override
    @EntityGraph(attributePaths = {"comprador", "vendedor", "cuotas"})
    List<Operacion> findAll(Specification<Operacion> spec);

    List<Operacion> findByCompradorIdOrVendedorIdOrderByFechaOperacionDesc(String compradorId, String vendedorId);

    List<Operacion> findByModalidadCircuito(ModalidadCircuito circuito);

    List<Operacion> findByEstadoLiquidacion(EstadoLiquidacion estado);
}
