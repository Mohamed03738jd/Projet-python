package credit_management_system.credit_management_system.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditRequestDTO {
    @NotBlank(message = "Nom is required")
    private String nom;

    @NotBlank(message = "Prenom is required")
    private String prenom;

    @NotBlank(message = "CIN is required")
    private String cin;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal salaire;

    private String adresse;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$")
    private String telephone;
    @NotNull
    @DecimalMin(value = "1000.0")
    private BigDecimal montant;
    @NotNull
    @Min(18)
    private Integer personAge;

    @NotNull
    @Min(0)
    private Integer personEmpLength;

    @NotNull
    private BigDecimal personIncome;

    @NotBlank
    private String personHomeOwnership;

    @NotBlank
    private String personEmpTitle;

    @NotBlank
    private String loanIntent;

    @NotBlank
    private String loanGrade;

    @NotBlank
    private String cbPersonDefaultOnFile;

    @NotNull
    private BigDecimal cbPersonCredHistLength;

    @NotNull
    private BigDecimal loanPercentIncome;

    @NotNull
    private BigDecimal loanIntRate;
}
