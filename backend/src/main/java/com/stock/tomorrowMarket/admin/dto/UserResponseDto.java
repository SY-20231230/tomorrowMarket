package com.stock.tomorrowMarket.admin.dto;

import com.stock.tomorrowMarket.user.entity.Role;
import com.stock.tomorrowMarket.user.entity.Status;
import com.stock.tomorrowMarket.user.entity.Users;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class UserResponseDto {
    private Long usersId;
    private String email;
    private String name;
    private LocalDate birthdate;
    private Role role;
    private Status status;

    public static UserResponseDto from(Users user) {
        return UserResponseDto.builder()
                .usersId(user.getUsersId())
                .email(user.getEmail())
                .name(user.getName())
                .birthdate(user.getBirthdate())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}
