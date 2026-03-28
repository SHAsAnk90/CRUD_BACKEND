package com.assignment.project.dto;

import lombok.Data;
import java.util.List;

@Data
public class TaskRequest {
    private String title;
    private String description;
    private String status;
    private Long userId; // Only used by Admin to assign a task
}
