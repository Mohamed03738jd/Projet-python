package credit_management_system.credit_management_system.entity;

import credit_management_system.credit_management_system.enums.StatutCredit;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCredit statut = StatutCredit.EN_ATTENTE;
    
    @Column(columnDefinition = "TEXT")
    private String commentaire;
    
    @Column(name = "date_demande", nullable = false, updatable = false)
    private LocalDateTime dateDemande;
    
    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "traite_par")
    private User traitePar;
    // ===== Données Scoring =====
    private Integer personAge;
    private Integer personEmpLength;
    private BigDecimal personIncome;
    private String personHomeOwnership;
    private String personEmpTitle;
    private String loanIntent;
    private String loanGrade;
    private String cbPersonDefaultOnFile;
    private BigDecimal cbPersonCredHistLength;
    private BigDecimal loanPercentIncome;
    private BigDecimal loanIntRate;

    // ===== Résultat IA =====
    @Column(precision = 5, scale = 4)
    private BigDecimal scoreIA;

    private String decisionIA;

    @PrePersist
    protected void onCreate() {
        dateDemande = LocalDateTime.now();
    }
}
