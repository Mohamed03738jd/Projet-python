package credit_management_system.credit_management_system.controller;

import credit_management_system.credit_management_system.dto.CreditRequestDTO;
import credit_management_system.credit_management_system.dto.UpdateStatusRequest;
import credit_management_system.credit_management_system.entity.CreditRequest;
import credit_management_system.credit_management_system.service.CreditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CreditController {
    
    private final CreditService creditService;
    
    @PostMapping
    public ResponseEntity<CreditRequest> createCreditRequest(@Valid @RequestBody CreditRequestDTO dto) {
        CreditRequest creditRequest = creditService.createCreditRequest(dto);
        return ResponseEntity.ok(creditRequest);
    }

    @GetMapping("/user")
    public ResponseEntity<List<CreditRequest>> getUserCreditRequests() {
        return ResponseEntity.ok(creditService.getUserCreditRequests());
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CreditRequest>> getAllCreditRequests() {
        return ResponseEntity.ok(creditService.getAllCreditRequests());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CreditRequest> getCreditRequestById(@PathVariable Long id) {
        System.out.println("credit Id");
        return ResponseEntity.ok(creditService.getCreditRequestById(id));
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreditRequest> updateCreditStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        CreditRequest updated = creditService.updateCreditStatus(id, request);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        return ResponseEntity.ok(creditService.getStatistics());
    }
}
