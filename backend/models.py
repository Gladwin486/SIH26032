from sqlalchemy import Column, Integer, String, Boolean, Float
from database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    mobile = Column(String(15), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)


class Farmer(Base):
    __tablename__ = "farmers"

    farmer_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    farmer_registration_id = Column(String(50), unique=True, nullable=False)
    village = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)


class ProcurementCentre(Base):
    __tablename__ = "procurement_centres"

    centre_id = Column(Integer, primary_key=True, index=True)
    centre_name = Column(String(150), nullable=False)
    location = Column(String(200), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    daily_capacity = Column(Integer, nullable=False)
    active_counters = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False)


class Schedule(Base):
    __tablename__ = "schedules"

    schedule_id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, nullable=False)
    crop = Column(String(100), nullable=False)
    date = Column(String(20), nullable=False)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False)


class Token(Base):
    __tablename__ = "tokens"

    token_id = Column(Integer, primary_key=True, index=True)
    token_number = Column(String(30), unique=True, nullable=False)
    farmer_id = Column(Integer, nullable=False)
    centre_id = Column(Integer, nullable=False)
    schedule_id = Column(Integer, nullable=False)
    crop = Column(String(100), nullable=False, default="paddy")
    queue_position = Column(Integer, nullable=False)
    status = Column(String(30), nullable=False)


class ProcurementRecord(Base):
    __tablename__ = "procurement_records"

    record_id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, nullable=False)
    verification_status = Column(String(30), nullable=False)
    quality_status = Column(String(30), nullable=False)
    weighing_status = Column(String(30), nullable=False)
    procurement_status = Column(String(30), nullable=False)
    payment_status = Column(String(30), nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(String(500), nullable=False)
    type = Column(String(30), nullable=False)
    is_read = Column(Boolean, default=False)


class CentreOperation(Base):
    __tablename__ = "centre_operations"

    operation_id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, nullable=False)
    queue_length = Column(Integer, nullable=False)
    active_counters = Column(Integer, nullable=False)
    farmers_processed = Column(Integer, nullable=False)
    average_processing_time = Column(Float, nullable=False)