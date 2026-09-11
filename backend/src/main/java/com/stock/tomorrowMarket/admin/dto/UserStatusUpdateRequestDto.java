package com.stock.tomorrowMarket.admin.dto;

import com.stock.tomorrowMarket.user.entity.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class UserStatusUpdateRequestDto {
    @NotNull(message = "Status cannot be null")
    private Status status;
}
