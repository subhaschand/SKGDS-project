package com.skgdp.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;
import java.time.LocalDateTime;

@Document(collection = "knowledge_gaps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeGap {
    @Id
    private String id;

    @DBRef
    private User student;

    @DBRef
    private Topic topic;

    private Double weaknessScore;

    private LocalDateTime detectedAt;
}
