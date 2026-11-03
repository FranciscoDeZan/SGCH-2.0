package com.sgch.repository;

import com.sgch.model.CuotaOperacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuotaOperacionRepository extends JpaRepository<CuotaOperacion, String> {

    List<CuotaOperacion> findByOperacionIdOrderByNumeroCuotaAsc(String operacionId);

    void deleteByOperacionId(String operacionId);
}
