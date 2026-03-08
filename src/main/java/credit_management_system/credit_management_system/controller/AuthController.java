package credit_management_system.credit_management_system.controller;

import credit_management_system.credit_management_system.dto.AuthResponse;
import credit_management_system.credit_management_system.dto.CreateUserRequest;
import credit_management_system.credit_management_system.dto.LoginRequest;
import credit_management_system.credit_management_system.entity.User;
import credit_management_system.credit_management_system.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("test autho");
        return ResponseEntity.ok(authService.login(request));
    }
    //@PostMapping("/create-admin")
        //public ResponseEntity<String> createAdmin() {
            //System.out.println("test create Admin");
//CreateUserRequest request = new CreateUserRequest();
            //request.setUsername("admin");
            //request.setPassword("123456");
            //request.setEmail("admin@gmail.com");
            //request.setRole("ADMIN");

            //authService.register(request);

            //return ResponseEntity.ok("Admin créé avec succès !");
        //}

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody CreateUserRequest request) {
        User user = authService.register(request);
        return ResponseEntity.ok(user);
    }
}
