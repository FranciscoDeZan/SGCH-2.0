package com.sgch.repository;

import com.sgch.model.Cobro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CobroRepository extends JpaRepository<Cobro, String> {

    List<Cobro> findByOperacionIdOrderByFechaMovimientoAsc(String operacionId);

    List<Cobro> findByCuotaIdOrderByFechaMovimientoAsc(String cuotaId);
}
