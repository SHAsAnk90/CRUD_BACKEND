package com.assignment.project.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
public class Task {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Size(max = 100)
  private String title;

  @NotBlank
  @Size(max = 500)
  private String description;

  private String status = "pending"; // pending, in-progress, completed

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  private LocalDateTime createdAt = LocalDateTime.now();

  public Task(String title, String description, User user) {
    this.title = title;
    this.description = description;
    this.user = user;
  }
}
