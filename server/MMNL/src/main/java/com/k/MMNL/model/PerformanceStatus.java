package com.k.MMNL.model;

public enum PerformanceStatus {
    DRAFT,
    REGISTERED,
    APPROVED,
    REJECTED,
    UNKNOWN,
    WITHDRAWN;

    public static PerformanceStatus from(String value) {
        for (PerformanceStatus status : values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return UNKNOWN;
    }

}
