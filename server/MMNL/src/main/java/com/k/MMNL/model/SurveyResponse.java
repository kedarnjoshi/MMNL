package com.k.MMNL.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "survey_responses", uniqueConstraints = @UniqueConstraint(columnNames = {"survey_id", "buyer_email"}))
public class SurveyResponse {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(name = "survey_id", nullable = false)
    private UUID surveyId;

    @Column(name = "google_sub", nullable = false)
    private String googleSub;

    @Column(name = "overall")
    private Integer overall;

    @Column(name = "food")
    private Integer food;

    @Column(name = "cultural")
    private Integer cultural;

    @Column(name = "venue")
    private Integer venue;

    @Column(name = "comment", columnDefinition = "text")
    private String comment;

    @Version
    private long version;

    protected SurveyResponse() {}                      // required by JPA

    public SurveyResponse(UUID surveyId, String googleSub) {
        this.surveyId = surveyId;
        this.googleSub = googleSub;
    }

    // getters only (no public setters)
    public UUID getId() { return id; }
    public UUID getSurveyId() { return surveyId; }
    public String getGoogleSub() { return googleSub; }
    public Integer getOverall() { return overall; }
    public Integer getFood() { return food; }
    public Integer getCultural() { return cultural; }
    public Integer getVenue() { return venue; }
    public String getComment() { return comment; }
}
