package com.stock.tomorrowMarket.interest.entity;

import com.stock.tomorrowMarket.sector.entity.Sector;
import com.stock.tomorrowMarket.user.entity.Users;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "INTERESTS", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "USERS_ID", "SECTORS_ID" })
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SectorInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "INTEREST_ID")
    private Long interestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERS_ID", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SECTORS_ID", nullable = false)
    private Sector sector;

    @Column(name = "LEVEL", nullable = false)
    private Byte level;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateLevel(Byte level) {
        if (level != null) {
            this.level = level;
        }
    }

    @Builder
    public SectorInterest(Users user, Sector sector, Byte level) {
        this.user = user;
        this.sector = sector;
        this.level = level != null ? level : (byte) 1;
    }
}
