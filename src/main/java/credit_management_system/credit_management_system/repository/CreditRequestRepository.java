package credit_management_system.credit_management_system.repository;

import credit_management_system.credit_management_system.entity.CreditRequest;
import credit_management_system.credit_management_system.enums.StatutCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditRequestRepository extends JpaRepository<CreditRequest, Long> {
    List<CreditRequest> findByUserId(Long userId);
    List<CreditRequest> findByStatut(StatutCredit statut);
    
    @Query("SELECT cr FROM CreditRequest cr ORDER BY cr.dateDemande DESC")
    List<CreditRequest> findAllOrderByDateDesc();
    
    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.statut = :statut")
    Long countByStatut(StatutCredit statut);
}
