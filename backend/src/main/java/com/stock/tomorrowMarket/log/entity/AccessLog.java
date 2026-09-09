package com.stock.tomorrowMarket.log.entity;

import com.stock.tomorrowMarket.user.entity.Users;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ACCESS_LOG")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACCESS_LOG_ID")
    private Long accessLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERS_ID")
    private Users user;

    @Column(name = "SESSION_ID", nullable = false)
    private String sessionId;

    @Column(name = "REFERER", length = 500)
    private String referer;

    @Column(name = "ENTRY_PAGE", length = 500)
    private String entryPage;

    @Column(name = "SOURCE_TYPE", nullable = false, length = 30)
    private String sourceType;

    @Column(name = "ACCESS_TIME", nullable = false, updatable = false)
    private LocalDateTime accessTime;

    @PrePersist
    protected void onCreate() {
        this.accessTime = LocalDateTime.now();
    }

    @Builder
    public AccessLog(Users user, String sessionId, String referer, String entryPage, String sourceType) {
        this.user = user;
        this.sessionId = sessionId;
        this.referer = referer;
        this.entryPage = entryPage;
        this.sourceType = sourceType;
    }
}
