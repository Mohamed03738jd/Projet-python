package credit_management_system.credit_management_system.service;

import credit_management_system.credit_management_system.entity.User;
import credit_management_system.credit_management_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
    
    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);
        user.setEmail(updatedUser.getEmail());
        user.setEnabled(updatedUser.getEnabled());
        return userRepository.save(user);
    }
}
