package com.assignment.project.repositories;

import com.assignment.project.models.Task;
import com.assignment.project.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
  List<Task> findByUser(User user);
}
