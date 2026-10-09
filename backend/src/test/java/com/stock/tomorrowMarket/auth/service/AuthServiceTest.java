package com.stock.tomorrowMarket.auth.service;

import com.stock.tomorrowMarket.auth.dto.SignUpRequest;
import com.stock.tomorrowMarket.auth.repository.PasswordResetTokenRepository;
import com.stock.tomorrowMarket.auth.repository.RefreshTokenRepository;
import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.global.security.JwtProvider;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsersRepository usersRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtProvider jwtProvider;
    @Mock
    private JavaMailSender mailSender;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("회원가입 - 정상 처리")
    void signup_success() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "홍길동", "password123!", LocalDate.of(1990, 1, 1));
        when(usersRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        // when
        authService.signup(request);

        // then
        verify(usersRepository, times(1)).save(any(Users.class));
    }

    @Test
    @DisplayName("회원가입 - 이메일 중복 시 예외 발생")
    void signup_duplicateEmail() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "홍길동", "password123!", LocalDate.of(1990, 1, 1));
        when(usersRepository.existsByEmail(anyString())).thenReturn(true);

        // when & then
        CustomException exception = assertThrows(CustomException.class, () -> authService.signup(request));
        assertEquals(ErrorCode.DUPLICATE_EMAIL, exception.getErrorCode());
        verify(usersRepository, never()).save(any(Users.class));
    }
}
