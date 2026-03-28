package com.assignment.project.controllers;

import com.assignment.project.dto.TaskRequest;
import com.assignment.project.models.ERole;
import com.assignment.project.models.Task;
import com.assignment.project.models.User;
import com.assignment.project.repositories.TaskRepository;
import com.assignment.project.repositories.UserRepository;
import com.assignment.project.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

  @Autowired
  TaskRepository taskRepository;

  @Autowired
  UserRepository userRepository;

  private User getCurrentUser() {
    UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return userRepository.findById(userDetails.getId()).orElseThrow();
  }

  @GetMapping
  public ResponseEntity<List<Task>> getAllTasks() {
    User user = getCurrentUser();
    List<Task> tasks;
    if (user.getRoles().contains(ERole.ROLE_ADMIN)) {
      tasks = taskRepository.findAll();
    } else {
      tasks = taskRepository.findByUser(user);
    }
    return ResponseEntity.ok(tasks);
  }

  @PostMapping
  public ResponseEntity<?> createTask(@Valid @RequestBody TaskRequest taskRequest) {
    User currentUser = getCurrentUser();
    User targetUser = currentUser;

    // Admin can assign tasks to other users
    if (currentUser.getRoles().contains(ERole.ROLE_ADMIN) && taskRequest.getUserId() != null) {
      Optional<User> userOpt = userRepository.findById(taskRequest.getUserId());
      if (userOpt.isPresent()) {
        targetUser = userOpt.get();
      }
    }

    Task task = new Task(taskRequest.getTitle(), taskRequest.getDescription(), targetUser);
    if (taskRequest.getStatus() != null) {
        task.setStatus(taskRequest.getStatus());
    }
    
    Task savedTask = taskRepository.save(task);
    return ResponseEntity.ok(savedTask);
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getTaskById(@PathVariable Long id) {
    Optional<Task> taskOpt = taskRepository.findById(id);
    if (taskOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    Task task = taskOpt.get();
    User user = getCurrentUser();
    if (!task.getUser().getId().equals(user.getId()) && !user.getRoles().contains(ERole.ROLE_ADMIN)) {
      return ResponseEntity.status(403).body("You are not authorized to view this task");
    }
    return ResponseEntity.ok(task);
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest taskRequest) {
    Optional<Task> taskOpt = taskRepository.findById(id);
    if (taskOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    Task task = taskOpt.get();
    User currentUser = getCurrentUser();
    
    // Check authorization
    if (!task.getUser().getId().equals(currentUser.getId()) && !currentUser.getRoles().contains(ERole.ROLE_ADMIN)) {
      return ResponseEntity.status(403).body("You are not authorized to update this task");
    }

    task.setTitle(taskRequest.getTitle());
    task.setDescription(taskRequest.getDescription());
    task.setStatus(taskRequest.getStatus());

    // Admin can re-assign task
    if (currentUser.getRoles().contains(ERole.ROLE_ADMIN) && taskRequest.getUserId() != null) {
        userRepository.findById(taskRequest.getUserId()).ifPresent(task::setUser);
    }

    Task updatedTask = taskRepository.save(task);
    return ResponseEntity.ok(updatedTask);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteTask(@PathVariable Long id) {
    Optional<Task> taskOpt = taskRepository.findById(id);
    if (taskOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    Task task = taskOpt.get();
    User user = getCurrentUser();
    if (!task.getUser().getId().equals(user.getId()) && !user.getRoles().contains(ERole.ROLE_ADMIN)) {
      return ResponseEntity.status(403).body("You are not authorized to delete this task");
    }
    taskRepository.delete(task);
    return ResponseEntity.ok("Task deleted successfully");
  }
}
