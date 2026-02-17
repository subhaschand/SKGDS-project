package com.skgdp.service;

import com.skgdp.dto.AssignmentDTO;
import com.skgdp.entity.Assignment;
import com.skgdp.entity.Topic;
import com.skgdp.entity.User;
import com.skgdp.repository.AssignmentRepository;
import com.skgdp.repository.TopicRepository;
import com.skgdp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepo;
    private final TopicRepository topicRepo;
    private final UserRepository userRepo;

    @Transactional
    public List<AssignmentDTO> assignTest(String topicId, List<String> studentIds, String facultyId) {
        Topic topic = topicRepo.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        User faculty = userRepo.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        List<Assignment> assignments = studentIds.stream()
                .map(studentId -> {
                    User student = userRepo.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

                    return Assignment.builder()
                            .topic(topic)
                            .student(student)
                            .assignedBy(faculty)
                            .assignedAt(LocalDateTime.now())
                            .status(Assignment.Status.PENDING)
                            .build();
                })
                .collect(Collectors.toList());

        assignments = assignmentRepo.saveAll(assignments);

        return assignments.stream()
                .map(AssignmentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AssignmentDTO> getStudentAssignments(String studentId) {
        return assignmentRepo.findByStudentId(studentId).stream()
                .map(AssignmentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AssignmentDTO> getPendingAssignments(String studentId) {
        return assignmentRepo.findByStudentIdAndStatus(studentId, Assignment.Status.PENDING).stream()
                .map(AssignmentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentDTO completeAssignment(String assignmentId) {
        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignment.setStatus(Assignment.Status.COMPLETED);
        assignment = assignmentRepo.save(assignment);

        return AssignmentDTO.fromEntity(assignment);
    }

    @Transactional
    public void completeByTopicAndStudent(String topicId, String studentId) {
        List<Assignment> assignments = assignmentRepo.findByStudentId(studentId).stream()
                .filter(a -> a.getTopic().getId().equals(topicId) && a.getStatus() == Assignment.Status.PENDING)
                .collect(Collectors.toList());

        assignments.forEach(a -> a.setStatus(Assignment.Status.COMPLETED));
        assignmentRepo.saveAll(assignments);
    }
}
