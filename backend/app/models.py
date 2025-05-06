# ... existing code ...

class CognitiveLoadAssessment(Base):
    __tablename__ = "cognitive_load_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    
    # Cognitive load dimensions (scale 1-9 following SEQ - Paas et al., 2003)
    complexity = Column(Integer, nullable=False)  # Proxy for ICL
    usability = Column(Integer, nullable=False)   # Proxy for ECL
    effort = Column(Integer, nullable=False)      # Total mental effort
    confidence = Column(Integer, nullable=False)  # Confidence in solution
    frustration = Column(Integer, nullable=False) # Frustration/anxiety level
    germane = Column(Integer, nullable=False)     # Proxy for GCL
    transfer = Column(Integer, nullable=False)    # Transfer capability perception
    
    # Additional context
    config_type = Column(String, nullable=True)   # e.g., "q4", "q8" for quantization
    notes = Column(String, nullable=True)         # Optional notes from student
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="cognitive_assessments")
    task = relationship("Task", back_populates="cognitive_assessments")

# Update User model to include relationship
User.cognitive_assessments = relationship(
    "CognitiveLoadAssessment", 
    back_populates="user",
    cascade="all, delete-orphan"
)

# Update Task model to include relationship
Task.cognitive_assessments = relationship(
    "CognitiveLoadAssessment", 
    back_populates="task",
    cascade="all, delete-orphan"
)
