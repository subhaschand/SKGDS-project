package com.skgdp.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;
import java.time.LocalDateTime;

@Document(collection = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {
    @Id
    private String id;

    @DBRef
    private Topic topic;

    @DBRef
    private User student;

    @DBRef
    private User assignedBy;

    private LocalDateTime assignedAt;

    private Status status;

    public enum Status {
        PENDING, COMPLETED
    }
}
