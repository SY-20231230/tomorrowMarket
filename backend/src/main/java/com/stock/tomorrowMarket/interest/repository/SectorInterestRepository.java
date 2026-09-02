package com.stock.tomorrowMarket.interest.repository;

import com.stock.tomorrowMarket.interest.entity.SectorInterest;
import com.stock.tomorrowMarket.sector.entity.Sector;
import com.stock.tomorrowMarket.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectorInterestRepository extends JpaRepository<SectorInterest, Long> {

    List<SectorInterest> findByUser(Users user);

    Optional<SectorInterest> findByUserAndSector(Users user, Sector sector);

    boolean existsByUserAndSector(Users user, Sector sector);
}
