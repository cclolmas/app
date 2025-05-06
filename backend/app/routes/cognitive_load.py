from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, CognitiveLoadAssessment, Task
from ..auth import get_current_user

router = APIRouter(prefix="/api/cognitive-load", tags=["cognitive-load"])

# Pydantic models for request/response
class CognitiveLoadAssessmentCreate(BaseModel):
    task_id: int
    complexity: int  # ICL proxy
    usability: int   # ECL proxy
    effort: int      # Total effort
    confidence: int
    frustration: int
    germane: int     # GCL proxy
    transfer: int    # Transfer capability
    config_type: Optional[str] = None  # e.g., "q4", "q8"
    notes: Optional[str] = None

class CognitiveLoadResponse(BaseModel):
    radarData: Dict
    histogramData: Dict
    stats: Optional[Dict] = None

@router.post("/assessment")
async def create_assessment(
    assessment: CognitiveLoadAssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a new cognitive load assessment for a task"""
    
    # Validate task exists
    task = db.query(Task).filter(Task.id == assessment.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Create new assessment
    db_assessment = CognitiveLoadAssessment(
        user_id=current_user.id,
        task_id=assessment.task_id,
        complexity=assessment.complexity,
        usability=assessment.usability,
        effort=assessment.effort,
        confidence=assessment.confidence,
        frustration=assessment.frustration,
        germane=assessment.germane,
        transfer=assessment.transfer,
        config_type=assessment.config_type,
        notes=assessment.notes,
        timestamp=datetime.utcnow()
    )
    
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    return {"success": True, "id": db_assessment.id}

@router.get("/user", response_model=CognitiveLoadResponse)
async def get_user_cognitive_data(
    task_type: Optional[str] = Query(None),
    config_type: Optional[str] = Query(None),
    module_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get cognitive load data for the current user"""
    
    # Query user's assessments with filters
    query = db.query(CognitiveLoadAssessment).join(Task).filter(
        CognitiveLoadAssessment.user_id == current_user.id
    )
    
    if task_type:
        query = query.filter(Task.task_type == task_type)
    if config_type:
        query = query.filter(CognitiveLoadAssessment.config_type == config_type)
    if module_id:
        query = query.filter(Task.module_id == module_id)
    
    assessments = query.order_by(CognitiveLoadAssessment.timestamp.desc()).all()
    
    # Process data for radar chart
    if assessments:
        latest_assessment = assessments[0]  # Most recent assessment
        radar_data = [
            latest_assessment.complexity,
            latest_assessment.usability,
            latest_assessment.effort,
            latest_assessment.confidence,
            latest_assessment.frustration,
            latest_assessment.germane,
            latest_assessment.transfer
        ]
    else:
        # Default data if no assessments
        radar_data = [0, 0, 0, 0, 0, 0, 0]
    
    # Process historical data for histogram - simplified for this example
    histogram_data = process_user_histogram_data(assessments)
    
    return {
        "radarData": radar_data,
        "histogramData": histogram_data
    }

@router.get("/class", response_model=CognitiveLoadResponse)
async def get_class_cognitive_data(
    task_type: Optional[str] = Query(None),
    config_type: Optional[str] = Query(None),
    module_id: Optional[int] = Query(None),
    expertise_level: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get aggregated cognitive load data for the class"""
    
    # Query all assessments with filters
    query = db.query(CognitiveLoadAssessment).join(Task)
    
    if task_type:
        query = query.filter(Task.task_type == task_type)
    if config_type:
        query = query.filter(CognitiveLoadAssessment.config_type == config_type)
    if module_id:
        query = query.filter(Task.module_id == module_id)
    if expertise_level:
        query = query.join(User).filter(User.expertise_level == expertise_level)
    
    assessments = query.all()
    
    # Calculate average values for radar chart
    radar_data = calculate_class_averages(assessments)
    
    # Process data for histogram
    histogram_data = process_class_histogram_data(assessments)
    
    # Calculate statistics
    stats = calculate_cognitive_load_stats(assessments)
    
    return {
        "radarData": radar_data,
        "histogramData": histogram_data,
        "stats": stats
    }

@router.get("/stats")
async def get_cognitive_load_stats(
    task_type: Optional[str] = Query(None),
    config_type: Optional[str] = Query(None),
    module_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistical analysis of cognitive load data"""
    
    # Query assessments with filters
    query = db.query(CognitiveLoadAssessment).join(Task)
    
    if task_type:
        query = query.filter(Task.task_type == task_type)
    if config_type:
        query = query.filter(CognitiveLoadAssessment.config_type == config_type)
    if module_id:
        query = query.filter(Task.module_id == module_id)
    
    assessments = query.all()
    
    # Calculate detailed statistics
    stats = calculate_detailed_cognitive_load_stats(assessments)
    
    return stats

# Helper functions for data processing
def calculate_class_averages(assessments):
    """Calculate average values for each dimension across all assessments"""
    if not assessments:
        return [0, 0, 0, 0, 0, 0, 0]
    
    total_complexity = sum(a.complexity for a in assessments)
    total_usability = sum(a.usability for a in assessments)
    total_effort = sum(a.effort for a in assessments)
    total_confidence = sum(a.confidence for a in assessments)
    total_frustration = sum(a.frustration for a in assessments)
    total_germane = sum(a.germane for a in assessments)
    total_transfer = sum(a.transfer for a in assessments)
    
    count = len(assessments)
    
    return [
        round(total_complexity / count, 1),
        round(total_usability / count, 1),
        round(total_effort / count, 1),
        round(total_confidence / count, 1),
        round(total_frustration / count, 1),
        round(total_germane / count, 1),
        round(total_transfer / count, 1)
    ]

def process_user_histogram_data(assessments):
    """Process user's assessments for histogram visualization"""
    # This would be implemented based on the specific data structure needed
    # Simplified placeholder
    return {}

def process_class_histogram_data(assessments):
    """Process all assessments for histogram visualization"""
    # This would be implemented based on the specific data structure needed
    # Simplified placeholder
    return {}

def calculate_cognitive_load_stats(assessments):
    """Calculate basic statistics from cognitive load assessments"""
    if not assessments:
        return {
            "mean": 0,
            "median": 0,
            "stdDev": 0,
            "overload": 0
        }
    
    # Calculate mean effort
    efforts = [a.effort for a in assessments]
    mean = sum(efforts) / len(efforts)
    
    # Calculate median effort
    efforts.sort()
    if len(efforts) % 2 == 0:
        median = (efforts[len(efforts)//2] + efforts[len(efforts)//2 - 1]) / 2
    else:
        median = efforts[len(efforts)//2]
    
    # Calculate standard deviation
    variance = sum((x - mean) ** 2 for x in efforts) / len(efforts)
    std_dev = variance ** 0.5
    
    # Calculate overload percentage (CL ≥ 7)
    overload_count = sum(1 for e in efforts if e >= 7)
    overload_percentage = (overload_count / len(efforts)) * 100
    
    return {
        "mean": round(mean, 2),
        "median": median,
        "stdDev": round(std_dev, 2),
        "overload": round(overload_percentage)
    }

def calculate_detailed_cognitive_load_stats(assessments):
    """Calculate detailed statistics for deeper analysis"""
    # This would include more advanced statistical analysis
    # Simplified placeholder
    return calculate_cognitive_load_stats(assessments)
