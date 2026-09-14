package com.sgch.repository;

import com.sgch.model.Cliente;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.testcontainers.mysql.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(FlywayAutoConfiguration.class)
public class ClienteRepositoryTest {

    @Container
    @ServiceConnection
    static MySQLContainer mysql = new MySQLContainer("mysql:8.0");

    @Autowired
    private ClienteRepository repository;

    @Test
    void testSaveAssignsUUIDAndPersists() {
        Cliente c = new Cliente();
        c.setNombreRazonSocial("Test");
        c.setTelefono("12345");
        c.setDireccion("Dir");
        
        Cliente saved = repository.saveAndFlush(c);
        
        assertThat(saved.getId()).isNotNull();
        assertThat(repository.findAll()).hasSize(1);
    }

    @Test
    void testUniqueTelefonoThrowsException() {
        Cliente c1 = new Cliente();
        c1.setNombreRazonSocial("Test 1");
        c1.setTelefono("555");
        c1.setDireccion("Dir 1");
        repository.saveAndFlush(c1);

        Cliente c2 = new Cliente();
        c2.setNombreRazonSocial("Test 2");
        c2.setTelefono("555");
        c2.setDireccion("Dir 2");
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            repository.saveAndFlush(c2);
        });
    }

    @Test
    void testFindByTelefonoAndExistsByTelefono() {
        Cliente c = new Cliente();
        c.setNombreRazonSocial("Test Finder");
        c.setTelefono("99999");
        c.setDireccion("Dir Finder");
        repository.saveAndFlush(c);

        assertThat(repository.existsByTelefono("99999")).isTrue();
        assertThat(repository.existsByTelefono("00000")).isFalse();

        Optional<Cliente> found = repository.findByTelefono("99999");
        assertThat(found).isPresent();
        assertThat(found.get().getNombreRazonSocial()).isEqualTo("Test Finder");
    }
}
