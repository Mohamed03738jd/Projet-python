package credit_management_system.credit_management_system.dto;

import credit_management_system.credit_management_system.enums.StatutCredit;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusRequest {
    
    @NotNull(message = "Statut is required")
    private StatutCredit statut;
    
    private String commentaire;
}
