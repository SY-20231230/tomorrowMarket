package com.stock.tomorrowMarket.auth.service;

import com.stock.tomorrowMarket.auth.dto.*;
import com.stock.tomorrowMarket.auth.entity.PasswordResetToken;
import com.stock.tomorrowMarket.auth.entity.RefreshToken;
import com.stock.tomorrowMarket.auth.repository.PasswordResetTokenRepository;
import com.stock.tomorrowMarket.auth.repository.RefreshTokenRepository;
import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.global.security.JwtProvider;
import com.stock.tomorrowMarket.user.entity.Role;
import com.stock.tomorrowMarket.user.entity.Status;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsersRepository usersRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final JavaMailSender mailSender;
    private final EmailService emailService;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Transactional
    public void signup(SignUpRequest request) {
        if (usersRepository.existsByEmail(request.email())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        emailService.checkVerified(request.email());

        Users user = Users.builder()
                .email(request.email())
                .name(request.name())
                .password(passwordEncoder.encode(request.password()))
                .birthdate(request.birthdate())
                .role(Role.USER)
                .status(Status.ACTIVE)
                .build();

        usersRepository.save(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        Users user = usersRepository.findByEmail(request.email())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() != Status.ACTIVE) {
            throw new CustomException(ErrorCode.INACTIVE_USER);
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        String accessToken = jwtProvider.createAccessToken(user.getUsersId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtProvider.createRefreshToken(user.getUsersId(), user.getEmail());

        RefreshToken tokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(refreshToken))
                .expiresAt(LocalDateTime.now().plus(refreshExpiration, java.time.temporal.ChronoUnit.MILLIS))
                .build();

        refreshTokenRepository.save(tokenEntity);

        return TokenResponse.of(accessToken, refreshToken);
    }

    @Transactional(readOnly = true)
    public void checkEmail(String email) {
        if (usersRepository.existsByEmail(email)) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        RefreshToken tokenEntity = refreshTokenRepository.findByTokenHash(hashToken(refreshToken))
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_TOKEN));

        if (tokenEntity.getRevokedAt() != null || tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new CustomException(ErrorCode.EXPIRED_TOKEN);
        }

        Users user = tokenEntity.getUser();
        if (user.getStatus() != Status.ACTIVE) {
            throw new CustomException(ErrorCode.INACTIVE_USER);
        }

        String newAccessToken = jwtProvider.createAccessToken(user.getUsersId(), user.getEmail(), user.getRole().name());
        return TokenResponse.of(newAccessToken, refreshToken);
    }

    @Transactional
    public void logout(Long usersId) {
        Users user = usersRepository.findById(usersId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        List<RefreshToken> tokens = refreshTokenRepository.findByUser(user);
        for (RefreshToken token : tokens) {
            if (token.getRevokedAt() == null) {
                token.revoke();
            }
        }
    }

    @Transactional
    public void requestPasswordReset(PasswordResetRequest request) {
        Users user = usersRepository.findByEmail(request.email())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        String rawToken = UUID.randomUUID().toString();
        
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(hashToken(rawToken))
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
        
        passwordResetTokenRepository.save(resetToken);

        sendResetMail(user.getEmail(), rawToken);
    }

    @Transactional
    public void resetPassword(PasswordResetConfirmRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hashToken(request.token()))
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_TOKEN));

        if (resetToken.getUsedAt() != null || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new CustomException(ErrorCode.EXPIRED_TOKEN);
        }

        Users user = resetToken.getUser();
        user.updatePassword(passwordEncoder.encode(request.newPassword()));
        resetToken.markAsUsed();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private void sendResetMail(String to, String token) {
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[내일장] 비밀번호 재설정 링크 안내");
        message.setText("안녕하세요,\n\n" +
                "비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 새로운 비밀번호를 설정해 주세요.\n\n" +
                resetLink + "\n\n" +
                "본인이 요청하지 않으셨다면 이 이메일을 무시해 주세요.");
        mailSender.send(message);
    }
}
