package com.skgdp.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;

@Document(collection = "recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {
    @Id
    private String id;

    @DBRef
    private Topic topic;

    private String url;

    private String description;

    private Type type;

    public enum Type {
        VIDEO, ARTICLE
    }
}
