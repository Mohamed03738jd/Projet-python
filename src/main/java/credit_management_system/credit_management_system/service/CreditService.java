package credit_management_system.credit_management_system.service;

import credit_management_system.credit_management_system.dto.CreditRequestDTO;
import credit_management_system.credit_management_system.dto.UpdateStatusRequest;
import credit_management_system.credit_management_system.entity.Client;
import credit_management_system.credit_management_system.entity.CreditRequest;
import credit_management_system.credit_management_system.entity.User;
import credit_management_system.credit_management_system.enums.StatutCredit;
import credit_management_system.credit_management_system.repository.ClientRepository;
import credit_management_system.credit_management_system.repository.CreditRequestRepository;
import credit_management_system.credit_management_system.repository.UserRepository;
import credit_management_system.credit_management_system.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final CreditRequestRepository creditRequestRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final EncryptionUtil encryptionUtil;
    private final RestTemplate restTemplate;

    @Transactional
    public CreditRequest createCreditRequest(CreditRequestDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> aiPayload = new HashMap<>();

        aiPayload.put("person_age", dto.getPersonAge());
        aiPayload.put("person_emp_length", dto.getPersonEmpLength());
        aiPayload.put("loan_amnt", dto.getMontant());
        aiPayload.put("person_income", dto.getPersonIncome());
        aiPayload.put("person_home_ownership", dto.getPersonHomeOwnership());
        aiPayload.put("person_emp_title", dto.getPersonEmpTitle());
        aiPayload.put("loan_intent", dto.getLoanIntent());
        aiPayload.put("loan_grade", dto.getLoanGrade());
        aiPayload.put("cb_person_default_on_file", dto.getCbPersonDefaultOnFile());
        aiPayload.put("cb_person_cred_hist_length", dto.getCbPersonCredHistLength());
        aiPayload.put("loan_percent_income", dto.getLoanPercentIncome());
        aiPayload.put("loan_int_rate", dto.getLoanIntRate());
        String flaskUrl = "http://localhost:5000/predict";
        Map<String, Object> aiResponse = restTemplate.postForObject(flaskUrl, aiPayload, Map.class);
       Double probability = aiResponse != null && aiResponse.get("prediction_proba") != null
        ? ((Number) aiResponse.get("prediction_proba")).doubleValue()
        : null;

        Integer predictionClass = aiResponse != null && aiResponse.get("prediction_class") != null
                ? ((Number) aiResponse.get("prediction_class")).intValue()
                : null;

        String prediction = (predictionClass != null && predictionClass == 0)
                ? "ACCEPT"
                : "REFUSE";

        // Créer ou sauvegarder le client
        Client client = Client.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .cin(encryptionUtil.encrypt(dto.getCin()))
                .salaire(encryptionUtil.encrypt(dto.getSalaire().toString()))
                .adresse(dto.getAdresse())
                .telephone(dto.getTelephone())
                .build();
                    client = clientRepository.save(client);
                    CreditRequest creditRequest = CreditRequest.builder()
                    .client(client)
                    .user(user)
                    .montant(dto.getMontant())
                    .personAge(dto.getPersonAge())
                    .personEmpLength(dto.getPersonEmpLength())
                    .personIncome(dto.getPersonIncome())
                    .personHomeOwnership(dto.getPersonHomeOwnership())
                    .personEmpTitle(dto.getPersonEmpTitle())
                    .loanIntent(dto.getLoanIntent())
                    .loanGrade(dto.getLoanGrade())
                    .cbPersonDefaultOnFile(dto.getCbPersonDefaultOnFile())
                    .cbPersonCredHistLength(dto.getCbPersonCredHistLength())
                    .loanPercentIncome(dto.getLoanPercentIncome())
                    .loanIntRate(dto.getLoanIntRate())
                    .statut(predictionClass != null && predictionClass == 0
                            ? StatutCredit.ACCEPTE
                            : StatutCredit.REFUSE)
                    .scoreIA(probability != null ? BigDecimal.valueOf(probability) : null)
                    .decisionIA(prediction)

                    .build();


                    return creditRequestRepository.save(creditRequest);
    }

    public List<CreditRequest> getUserCreditRequests() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return creditRequestRepository.findByUserId(user.getId());
    }

    public List<CreditRequest> getAllCreditRequests() {
        return creditRequestRepository.findAllOrderByDateDesc();
    }

    @Transactional
    public CreditRequest updateCreditStatus(Long id, UpdateStatusRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CreditRequest creditRequest = creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit request not found"));

        creditRequest.setStatut(request.getStatut());
        creditRequest.setCommentaire(request.getCommentaire());
        creditRequest.setDateTraitement(LocalDateTime.now());
        creditRequest.setTraitePar(admin);

        return creditRequestRepository.save(creditRequest);
    }

    public CreditRequest getCreditRequestById(Long id) {
        return creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit request not found"));
    }

    public Map<String, Long> getStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", creditRequestRepository.count());
        stats.put("enAttente", creditRequestRepository.countByStatut(StatutCredit.EN_ATTENTE));
        stats.put("accepte", creditRequestRepository.countByStatut(StatutCredit.ACCEPTE));
        stats.put("refuse", creditRequestRepository.countByStatut(StatutCredit.REFUSE));
        return stats;
    }
}
