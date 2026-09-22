from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
from database import engine, SessionLocal, Base


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Smart Farmer Procurement Platform",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Smart Farmer Procurement Platform API is running"
    }


# ============================================================
# DATABASE TEST
# ============================================================

@app.get("/database-test")
def database_test(
    db: Session = Depends(get_db)
):
    try:
        db.execute(func.now())

        return {
            "message": "Database connected successfully"
        }

    except Exception as error:
        return {
            "message": "Database connection failed",
            "error": str(error)
        }


# ============================================================
# FARMER REGISTRATION
# ============================================================

@app.post("/farmers")
def register_farmer(
    name: str,
    mobile: str,
    password: str,
    farmer_registration_id: str,
    village: str,
    district: str,
    state: str,
    db: Session = Depends(get_db)
):

    existing_user = db.query(
        models.User
    ).filter(
        models.User.mobile == mobile
    ).first()

    if existing_user:
        return {
            "message": "Mobile number already registered"
        }

    existing_farmer = db.query(
        models.Farmer
    ).filter(
        models.Farmer.farmer_registration_id
        == farmer_registration_id
    ).first()

    if existing_farmer:
        return {
            "message": "Farmer registration ID already exists"
        }

    new_user = models.User(
        name=name,
        mobile=mobile,
        password=password,
        role="farmer"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_farmer = models.Farmer(
        user_id=new_user.user_id,
        farmer_registration_id=farmer_registration_id,
        village=village,
        district=district,
        state=state
    )

    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)

    return {
        "message": "Farmer registered successfully",
        "farmer_id": new_farmer.farmer_id,
        "user_id": new_user.user_id,
        "name": new_user.name,
        "mobile": new_user.mobile,
        "role": new_user.role,
        "farmer_registration_id":
            new_farmer.farmer_registration_id
    }


# ============================================================
# FARMER LOGIN
# ============================================================

@app.post("/farmer-login")
def farmer_login(
    mobile: str,
    password: str,
    db: Session = Depends(get_db)
):

    user = db.query(
        models.User
    ).filter(
        models.User.mobile == mobile
    ).first()

    if not user:
        return {
            "message": "Invalid mobile number or password"
        }

    if user.password != password:
        return {
            "message": "Invalid mobile number or password"
        }

    farmer = db.query(
        models.Farmer
    ).filter(
        models.Farmer.user_id == user.user_id
    ).first()

    return {
        "message": "Login successful",
        "user_id": user.user_id,
        "farmer_id": farmer.farmer_id
            if farmer else None,
        "name": user.name,
        "mobile": user.mobile,
        "role": user.role
    }


# ============================================================
# CREATE PROCUREMENT CENTRE
# ============================================================

@app.post("/centres")
def create_centre(
    centre_name: str,
    location: str,
    district: str,
    state: str,
    daily_capacity: int,
    active_counters: int,
    status: str,
    db: Session = Depends(get_db)
):

    centre = models.ProcurementCentre(
        centre_name=centre_name,
        location=location,
        district=district,
        state=state,
        daily_capacity=daily_capacity,
        active_counters=active_counters,
        status=status
    )

    db.add(centre)
    db.commit()
    db.refresh(centre)

    return {
        "message": "Procurement centre created successfully",
        "centre_id": centre.centre_id,
        "centre_name": centre.centre_name,
        "location": centre.location,
        "district": centre.district,
        "state": centre.state,
        "daily_capacity": centre.daily_capacity,
        "active_counters": centre.active_counters,
        "status": centre.status
    }


# ============================================================
# LIST PROCUREMENT CENTRES
# ============================================================

@app.get("/centres")
def get_centres(
    db: Session = Depends(get_db)
):

    centres = db.query(
        models.ProcurementCentre
    ).order_by(
        models.ProcurementCentre.centre_id.asc()
    ).all()

    return [
        {
            "centre_id": centre.centre_id,
            "centre_name": centre.centre_name,
            "location": centre.location,
            "district": centre.district,
            "state": centre.state,
            "daily_capacity": centre.daily_capacity,
            "active_counters": centre.active_counters,
            "status": centre.status
        }
        for centre in centres
    ]


# ============================================================
# CREATE PROCUREMENT SCHEDULE
# ============================================================

@app.post("/schedules")
def create_schedule(
    centre_id: int,
    crop: str,
    date: str,
    start_time: str,
    end_time: str,
    capacity: int,
    status: str,
    db: Session = Depends(get_db)
):

    centre = db.query(
        models.ProcurementCentre
    ).filter(
        models.ProcurementCentre.centre_id
        == centre_id
    ).first()

    if not centre:
        return {
            "message": "Procurement centre not found"
        }

    schedule = models.Schedule(
        centre_id=centre_id,
        crop=crop,
        date=date,
        start_time=start_time,
        end_time=end_time,
        capacity=capacity,
        status=status
    )

    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    return {
        "message": "Schedule created successfully",
        "schedule_id": schedule.schedule_id,
        "centre_id": schedule.centre_id,
        "crop": schedule.crop,
        "date": schedule.date,
        "start_time": schedule.start_time,
        "end_time": schedule.end_time,
        "capacity": schedule.capacity,
        "status": schedule.status
    }


# ============================================================
# LIST SCHEDULES
# ============================================================

@app.get("/schedules")
def get_schedules(
    db: Session = Depends(get_db)
):

    schedules = db.query(
        models.Schedule
    ).order_by(
        models.Schedule.schedule_id.asc()
    ).all()

    return [
        {
            "schedule_id": schedule.schedule_id,
            "centre_id": schedule.centre_id,
            "crop": schedule.crop,
            "date": schedule.date,
            "start_time": schedule.start_time,
            "end_time": schedule.end_time,
            "capacity": schedule.capacity,
            "status": schedule.status
        }
        for schedule in schedules
    ]


# ============================================================
# GENERATE DIGITAL TOKEN
# ============================================================

@app.post("/tokens")
def create_token(
    farmer_id: int,
    centre_id: int,
    schedule_id: int,
    crop: str,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # CHECK FARMER
    # --------------------------------------------------------

    farmer = db.query(
        models.Farmer
    ).filter(
        models.Farmer.farmer_id == farmer_id
    ).first()

    if not farmer:
        return {
            "message": "Farmer not found"
        }

    # --------------------------------------------------------
    # CHECK CENTRE
    # --------------------------------------------------------

    centre = db.query(
        models.ProcurementCentre
    ).filter(
        models.ProcurementCentre.centre_id
        == centre_id
    ).first()

    if not centre:
        return {
            "message": "Procurement centre not found"
        }

    # --------------------------------------------------------
    # CHECK SCHEDULE
    # --------------------------------------------------------

    schedule = db.query(
        models.Schedule
    ).filter(
        models.Schedule.schedule_id
        == schedule_id
    ).first()

    if not schedule:
        return {
            "message": "Schedule not found"
        }

    if schedule.centre_id != centre_id:
        return {
            "message":
                "Selected schedule does not belong to this centre"
        }

    if schedule.status.lower() != "open":
        return {
            "message":
                "This procurement schedule is currently closed"
        }

    # --------------------------------------------------------
    # CHECK CAPACITY
    # --------------------------------------------------------

    active_tokens = db.query(
        models.Token
    ).filter(
        models.Token.schedule_id == schedule_id,
        models.Token.status.in_([
            "Waiting",
            "waiting",
            "Processing",
            "processing"
        ])
    ).count()

    if active_tokens >= schedule.capacity:
        return {
            "message":
                "This procurement schedule is full"
        }

    # --------------------------------------------------------
    # QUEUE POSITION
    # --------------------------------------------------------

    queue_position = active_tokens + 1

    # --------------------------------------------------------
    # TOKEN NUMBER
    # --------------------------------------------------------

    total_tokens = db.query(
        models.Token
    ).filter(
        models.Token.schedule_id == schedule_id
    ).count()

    token_number = (
        f"T{schedule_id:02d}-{total_tokens + 1:03d}"
    )

    # --------------------------------------------------------
    # CREATE TOKEN
    # --------------------------------------------------------

    new_token = models.Token(
        token_number=token_number,
        farmer_id=farmer_id,
        centre_id=centre_id,
        schedule_id=schedule_id,
        crop=crop,
        queue_position=queue_position,
        status="Waiting"
    )

    db.add(new_token)
    db.commit()
    db.refresh(new_token)

    # --------------------------------------------------------
    # NOTIFICATION
    # --------------------------------------------------------

    new_notification = models.Notification(
        farmer_id=farmer_id,
        title="Token Generated",
        message=(
            f"Your token {new_token.token_number} "
            f"has been generated. Your current "
            f"queue position is {queue_position}."
        ),
        type="token",
        is_read=False
    )

    db.add(new_notification)
    db.commit()

    return {
        "message":
            "Digital token generated successfully",
        "token_id": new_token.token_id,
        "token_number": new_token.token_number,
        "farmer_id": new_token.farmer_id,
        "centre_id": new_token.centre_id,
        "schedule_id": new_token.schedule_id,
        "crop": new_token.crop,
        "queue_position":
            new_token.queue_position,
        "status": new_token.status
    }


# ============================================================
# FARMER DASHBOARD
#
# IMPORTANT FIX:
# Do NOT blindly select the newest token.
#
# Priority:
# 1. Explicit token_id
# 2. Processing token
# 3. Waiting token
# 4. Latest token
# ============================================================

@app.get("/farmer/dashboard/{farmer_id}")
def farmer_dashboard(
    farmer_id: int,
    token_id: int | None = None,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # CHECK FARMER
    # --------------------------------------------------------

    farmer = db.query(
        models.Farmer
    ).filter(
        models.Farmer.farmer_id == farmer_id
    ).first()

    if not farmer:
        return {
            "message": "Farmer not found"
        }

    # --------------------------------------------------------
    # TOKEN SELECTION
    # --------------------------------------------------------

    token = None

    # If frontend explicitly sends token_id,
    # use exactly that token.
    if token_id is not None:

        token = db.query(
            models.Token
        ).filter(
            models.Token.token_id == token_id,
            models.Token.farmer_id == farmer_id
        ).first()

    else:

        # ----------------------------------------------------
        # FIRST PRIORITY: PROCESSING
        # ----------------------------------------------------

        token = db.query(
            models.Token
        ).filter(
            models.Token.farmer_id == farmer_id,
            models.Token.status.in_([
                "Processing",
                "processing"
            ])
        ).order_by(
            models.Token.token_id.desc()
        ).first()

        # ----------------------------------------------------
        # SECOND PRIORITY: WAITING
        # ----------------------------------------------------

        if not token:

            token = db.query(
                models.Token
            ).filter(
                models.Token.farmer_id == farmer_id,
                models.Token.status.in_([
                    "Waiting",
                    "waiting"
                ])
            ).order_by(
                models.Token.token_id.desc()
            ).first()

        # ----------------------------------------------------
        # THIRD PRIORITY: LATEST TOKEN
        # ----------------------------------------------------

        if not token:

            token = db.query(
                models.Token
            ).filter(
                models.Token.farmer_id == farmer_id
            ).order_by(
                models.Token.token_id.desc()
            ).first()

    # --------------------------------------------------------
    # NO TOKEN
    # --------------------------------------------------------

    if not token:
        return {
            "farmer_id": farmer_id,
            "message": "No tokens found"
        }

    # --------------------------------------------------------
    # CENTRE
    # --------------------------------------------------------

    centre = db.query(
        models.ProcurementCentre
    ).filter(
        models.ProcurementCentre.centre_id
        == token.centre_id
    ).first()

    # --------------------------------------------------------
    # SCHEDULE
    # --------------------------------------------------------

    schedule = db.query(
        models.Schedule
    ).filter(
        models.Schedule.schedule_id
        == token.schedule_id
    ).first()

    # --------------------------------------------------------
    # LIVE QUEUE POSITION
    # --------------------------------------------------------

    current_position = 0

    if token.status.lower() == "waiting":

        waiting_tokens = db.query(
            models.Token
        ).filter(
            models.Token.schedule_id
            == token.schedule_id,

            models.Token.status.in_([
                "Waiting",
                "waiting"
            ]),

            models.Token.token_id
            <= token.token_id
        ).order_by(
            models.Token.token_id.asc()
        ).all()

        for index, waiting_token in enumerate(
            waiting_tokens
        ):

            if waiting_token.token_id == token.token_id:

                current_position = index + 1
                break

    # --------------------------------------------------------
    # RETURN DASHBOARD DATA
    # --------------------------------------------------------

    return {
        "farmer_id": farmer_id,

        "token_id":
            token.token_id,

        "token_number":
            token.token_number,

        "status":
            token.status,

        "queue_position":
            current_position,

        "centre_name":
            centre.centre_name
            if centre else None,

        "centre_location":
            centre.location
            if centre else None,

        # IMPORTANT:
        # Crop belongs to TOKEN.
        "crop":
            token.crop,

        "date":
            schedule.date
            if schedule else None,

        "start_time":
            schedule.start_time
            if schedule else None,

        "end_time":
            schedule.end_time
            if schedule else None
    }


# ============================================================
# QUEUE STATUS
# ============================================================

@app.get("/queue/{token_id}")
def get_queue_status(
    token_id: int,
    db: Session = Depends(get_db)
):

    token = db.query(
        models.Token
    ).filter(
        models.Token.token_id == token_id
    ).first()

    if not token:
        return {
            "message": "Token not found"
        }

    if token.status.lower() != "waiting":

        return {
            "token_id": token.token_id,
            "token_number": token.token_number,
            "queue_position": 0,
            "status": token.status,
            "message":
                "You are no longer waiting in the queue"
        }

    waiting_tokens = db.query(
        models.Token
    ).filter(
        models.Token.schedule_id
        == token.schedule_id,

        models.Token.status.in_([
            "Waiting",
            "waiting"
        ]),

        models.Token.token_id
        <= token.token_id
    ).order_by(
        models.Token.token_id.asc()
    ).all()

    current_position = 0

    for index, waiting_token in enumerate(
        waiting_tokens
    ):

        if waiting_token.token_id == token.token_id:

            current_position = index + 1
            break

    return {
        "token_id": token.token_id,
        "token_number": token.token_number,
        "queue_position": current_position,
        "status": token.status
    }


# ============================================================
# WAIT TIME
# ============================================================

@app.get("/queue/{token_id}/wait-time")
def get_wait_time(
    token_id: int,
    db: Session = Depends(get_db)
):

    token = db.query(
        models.Token
    ).filter(
        models.Token.token_id == token_id
    ).first()

    if not token:
        return {
            "message": "Token not found"
        }

    # --------------------------------------------------------
    # PROCESSING / COMPLETED
    # --------------------------------------------------------

    if token.status.lower() != "waiting":

        return {
            "token_number":
                token.token_number,

            "status":
                token.status,

            "queue_position":
                0,

            "estimated_wait_minutes":
                0,

            "message":
                "You are no longer waiting in the queue"
        }

    # --------------------------------------------------------
    # LATEST CENTRE OPERATION
    # --------------------------------------------------------

    operation = db.query(
        models.CentreOperation
    ).filter(
        models.CentreOperation.centre_id
        == token.centre_id
    ).order_by(
        models.CentreOperation.operation_id.desc()
    ).first()

    if not operation:

        return {
            "token_number":
                token.token_number,

            "queue_position":
                1,

            "estimated_wait_minutes":
                0,

            "status":
                token.status,

            "message":
                "Centre operation data not available"
        }

    # --------------------------------------------------------
    # LIVE WAITING TOKENS
    # --------------------------------------------------------

    waiting_tokens = db.query(
        models.Token
    ).filter(
        models.Token.schedule_id
        == token.schedule_id,

        models.Token.status.in_([
            "Waiting",
            "waiting"
        ]),

        models.Token.token_id
        <= token.token_id
    ).order_by(
        models.Token.token_id.asc()
    ).all()

    current_position = 0

    for index, waiting_token in enumerate(
        waiting_tokens
    ):

        if waiting_token.token_id == token.token_id:

            current_position = index + 1
            break

    # --------------------------------------------------------
    # PROCESSING DATA
    # --------------------------------------------------------

    active_counters = (
        operation.active_counters
    )

    average_processing_time = (
        operation.average_processing_time
    )

    if active_counters <= 0:

        return {
            "token_number":
                token.token_number,

            "queue_position":
                current_position,

            "estimated_wait_minutes":
                0,

            "status":
                token.status,

            "message":
                "No active counters available"
        }

    # --------------------------------------------------------
    # WAIT CALCULATION
    # --------------------------------------------------------

    estimated_wait = (
        current_position
        * average_processing_time
    ) / active_counters

    return {
        "token_number":
            token.token_number,

        "queue_position":
            current_position,

        "estimated_wait_minutes":
            round(
                estimated_wait,
                1
            ),

        "status":
            token.status,

        "message":
            "Estimated waiting time calculated"
    }


# ============================================================
# CENTRE OPERATIONS
# ============================================================

@app.post("/centre-operations")
def create_centre_operation(
    centre_id: int,
    queue_length: int,
    active_counters: int,
    farmers_processed: int,
    average_processing_time: float,
    db: Session = Depends(get_db)
):

    centre = db.query(
        models.ProcurementCentre
    ).filter(
        models.ProcurementCentre.centre_id
        == centre_id
    ).first()

    if not centre:
        return {
            "message": "Procurement centre not found"
        }

    operation = models.CentreOperation(
        centre_id=centre_id,
        queue_length=queue_length,
        active_counters=active_counters,
        farmers_processed=farmers_processed,
        average_processing_time=
            average_processing_time
    )

    db.add(operation)
    db.commit()
    db.refresh(operation)

    return {
        "message":
            "Centre operation recorded successfully",

        "operation_id":
            operation.operation_id,

        "centre_id":
            operation.centre_id,

        "queue_length":
            operation.queue_length,

        "active_counters":
            operation.active_counters,

        "farmers_processed":
            operation.farmers_processed,

        "average_processing_time":
            operation.average_processing_time
    }


# ============================================================
# PROCUREMENT RECORD
# ============================================================

@app.post("/procurement-records")
def create_procurement_record(
    token_id: int,
    verification_status: str,
    quality_status: str,
    weighing_status: str,
    procurement_status: str,
    payment_status: str,
    db: Session = Depends(get_db)
):

    token = db.query(
        models.Token
    ).filter(
        models.Token.token_id == token_id
    ).first()

    if not token:
        return {
            "message": "Token not found"
        }

    existing_record = db.query(
        models.ProcurementRecord
    ).filter(
        models.ProcurementRecord.token_id
        == token_id
    ).first()

    if existing_record:

        return {
            "message":
                "Procurement record already exists",

            "record_id":
                existing_record.record_id
        }

    record = models.ProcurementRecord(
        token_id=token_id,
        verification_status=
            verification_status,
        quality_status=
            quality_status,
        weighing_status=
            weighing_status,
        procurement_status=
            procurement_status,
        payment_status=
            payment_status
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "message":
            "Procurement record created successfully",

        "record_id":
            record.record_id,

        "token_id":
            record.token_id,

        "verification_status":
            record.verification_status,

        "quality_status":
            record.quality_status,

        "weighing_status":
            record.weighing_status,

        "procurement_status":
            record.procurement_status,

        "payment_status":
            record.payment_status
    }


# ============================================================
# PROCUREMENT STATUS
# ============================================================

@app.get("/procurement-status/{token_id}")
def get_procurement_status(
    token_id: int,
    db: Session = Depends(get_db)
):

    record = db.query(
        models.ProcurementRecord
    ).filter(
        models.ProcurementRecord.token_id
        == token_id
    ).first()

    if not record:

        return {
            "message":
                "Procurement record not found"
        }

    return {
        "token_id":
            record.token_id,

        "verification_status":
            record.verification_status,

        "quality_status":
            record.quality_status,

        "weighing_status":
            record.weighing_status,

        "procurement_status":
            record.procurement_status,

        "payment_status":
            record.payment_status
    }


# ============================================================
# UPDATE PROCUREMENT STAGE
# ============================================================

@app.put("/procurement-records/{token_id}/stage")
def update_procurement_stage(
    token_id: int,
    stage: str,
    status: str,
    db: Session = Depends(get_db)
):

    record = db.query(
        models.ProcurementRecord
    ).filter(
        models.ProcurementRecord.token_id
        == token_id
    ).first()

    if not record:

        return {
            "message":
                "Procurement record not found"
        }

    stage = stage.strip().lower()
    status = status.strip()

    # --------------------------------------------------------
    # UPDATE CORRECT STAGE
    # --------------------------------------------------------

    if stage == "verification":

        record.verification_status = status

    elif stage == "quality":

        record.quality_status = status

    elif stage == "weighing":

        record.weighing_status = status

    elif stage == "procurement":

        record.procurement_status = status

    elif stage == "payment":

        record.payment_status = status

    else:

        return {
            "message":
                "Invalid procurement stage"
        }

    db.commit()
    db.refresh(record)

    # --------------------------------------------------------
    # RETURN ALL CURRENT STAGES
    # --------------------------------------------------------

    return {
        "message":
            "Procurement stage updated successfully",

        "token_id":
            record.token_id,

        "verification_status":
            record.verification_status,

        "quality_status":
            record.quality_status,

        "weighing_status":
            record.weighing_status,

        "procurement_status":
            record.procurement_status,

        "payment_status":
            record.payment_status
    }


# ============================================================
# UPDATE PAYMENT
# ============================================================

@app.put("/procurement-records/{token_id}/payment")
def update_payment_status(
    token_id: int,
    payment_status: str,
    db: Session = Depends(get_db)
):

    record = db.query(
        models.ProcurementRecord
    ).filter(
        models.ProcurementRecord.token_id
        == token_id
    ).first()

    if not record:

        return {
            "message":
                "Procurement record not found"
        }

    record.payment_status = (
        payment_status
    )

    db.commit()
    db.refresh(record)

    return {
        "message":
            "Payment status updated successfully",

        "token_id":
            token_id,

        "payment_status":
            record.payment_status
    }


# ============================================================
# UPDATE TOKEN STATUS
# ============================================================
@app.put("/tokens/{token_id}/status")
def update_token_status(
    token_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    token = db.query(
        models.Token
    ).filter(
        models.Token.token_id == token_id
    ).first()

    if not token:
        return {
            "message": "Token not found"
        }

    # Store old and new status
    old_status = token.status
    new_status = status.strip()

    # Update token status
    token.status = new_status

    db.commit()
    db.refresh(token)

    # ========================================================
    # WHEN PROCESSING STARTS
    # ========================================================

    if (
        new_status.lower() == "processing"
        and old_status.lower() != "processing"
    ):

        # Find farmer's user account
        farmer = db.query(
            models.Farmer
        ).filter(
            models.Farmer.farmer_id == token.farmer_id
        ).first()

        farmer_user = None

        if farmer:
            farmer_user = db.query(
                models.User
            ).filter(
                models.User.user_id == farmer.user_id
            ).first()

        # Send SMS
        if farmer_user:
            send_sms_notification(
                farmer_user.mobile,
                f"Your turn has arrived. Token {token.token_number} is now being processed. Please proceed to the procurement counter."
            )

        # Create procurement record if needed
        existing_record = db.query(
            models.ProcurementRecord
        ).filter(
            models.ProcurementRecord.token_id == token_id
        ).first()

        if not existing_record:

            new_record = models.ProcurementRecord(
                token_id=token_id,
                verification_status="Pending",
                quality_status="Pending",
                weighing_status="Pending",
                procurement_status="Pending",
                payment_status="Pending"
            )

            db.add(new_record)
            db.commit()

        # In-app notification
        new_notification = models.Notification(
            farmer_id=token.farmer_id,
            title="Your Turn Now",
            message=(
                f"Your token {token.token_number} "
                f"is now being processed. "
                f"Please proceed to the procurement counter."
            ),
            type="queue",
            is_read=False
        )

        db.add(new_notification)
        db.commit()

    # ========================================================
    # WHEN PROCUREMENT IS COMPLETED
    # ========================================================

    elif (
        new_status.lower() == "completed"
        and old_status.lower() != "completed"
    ):

        # Find farmer's user account
        farmer = db.query(
            models.Farmer
        ).filter(
            models.Farmer.farmer_id == token.farmer_id
        ).first()

        farmer_user = None

        if farmer:
            farmer_user = db.query(
                models.User
            ).filter(
                models.User.user_id == farmer.user_id
            ).first()

        # Send SMS
        if farmer_user:
            send_sms_notification(
                farmer_user.mobile,
                f"Your procurement for token {token.token_number} has been completed successfully. Please check your payment status."
            )

        # In-app notification
        new_notification = models.Notification(
            farmer_id=token.farmer_id,
            title="Procurement Completed",
            message=(
                f"Your procurement process "
                f"for token {token.token_number} "
                f"has been completed."
            ),
            type="procurement",
            is_read=False
        )

        db.add(new_notification)
        db.commit()

    # ========================================================
    # RECALCULATE WAITING TOKEN POSITIONS
    # ========================================================

    waiting_tokens = db.query(
        models.Token
    ).filter(
        models.Token.schedule_id == token.schedule_id,
        models.Token.status.in_([
            "Waiting",
            "waiting"
        ])
    ).order_by(
        models.Token.token_id.asc()
    ).all()

    for index, waiting_token in enumerate(waiting_tokens):
        waiting_token.queue_position = index + 1

    db.commit()

    return {
        "message": "Token status updated successfully",
        "token_id": token.token_id,
        "token_number": token.token_number,
        "status": token.status
    }


# ============================================================
# OFFICER QUEUE
# ============================================================

@app.get("/officer/queue/{centre_id}")
def officer_queue(
    centre_id: int,
    db: Session = Depends(get_db)
):

    tokens = db.query(
        models.Token
    ).filter(
        models.Token.centre_id == centre_id
    ).order_by(
        models.Token.token_id.asc()
    ).all()

    # --------------------------------------------------------
    # RECALCULATE WAITING POSITIONS
    # --------------------------------------------------------

    waiting_position = 1

    for token in tokens:

        if token.status.lower() == "waiting":

            token.queue_position = (
                waiting_position
            )

            waiting_position += 1

        else:

            token.queue_position = 0

    db.commit()

    # --------------------------------------------------------
    # RETURN QUEUE
    # --------------------------------------------------------

    result = []

    for token in tokens:

        farmer = db.query(
            models.Farmer
        ).filter(
            models.Farmer.farmer_id
            == token.farmer_id
        ).first()

        user = None

        if farmer:

            user = db.query(
                models.User
            ).filter(
                models.User.user_id
                == farmer.user_id
            ).first()

        result.append({
            "token_id":
                token.token_id,

            "token_number":
                token.token_number,

            "farmer_id":
                token.farmer_id,

            "farmer_name":
                user.name
                if user else None,

            "crop":
                token.crop,

            "queue_position":
                token.queue_position,

            "status":
                token.status,

            "centre_id":
                token.centre_id,

            "schedule_id":
                token.schedule_id
        })

    return result


# ============================================================
# OFFICER DASHBOARD
# ============================================================

@app.get("/officer/dashboard/{centre_id}")
def officer_dashboard(
    centre_id: int,
    db: Session = Depends(get_db)
):

    centre = db.query(
        models.ProcurementCentre
    ).filter(
        models.ProcurementCentre.centre_id
        == centre_id
    ).first()

    if not centre:

        return {
            "message":
                "Procurement centre not found"
        }

    waiting_count = db.query(
        models.Token
    ).filter(
        models.Token.centre_id == centre_id,
        models.Token.status.in_([
            "Waiting",
            "waiting"
        ])
    ).count()

    processing_count = db.query(
        models.Token
    ).filter(
        models.Token.centre_id == centre_id,
        models.Token.status.in_([
            "Processing",
            "processing"
        ])
    ).count()

    completed_count = db.query(
        models.Token
    ).filter(
        models.Token.centre_id == centre_id,
        models.Token.status.in_([
            "Completed",
            "completed"
        ])
    ).count()

    latest_operation = db.query(
        models.CentreOperation
    ).filter(
        models.CentreOperation.centre_id
        == centre_id
    ).order_by(
        models.CentreOperation.operation_id.desc()
    ).first()

    average_processing_time = (
        latest_operation.average_processing_time
        if latest_operation
        else 0
    )

    return {
        "centre_id":
            centre_id,

        "centre_name":
            centre.centre_name,

        "daily_capacity":
            centre.daily_capacity,

        "active_counters":
            centre.active_counters,

        "status":
            centre.status,

        "waiting":
            waiting_count,

        "processing":
            processing_count,

        "completed":
            completed_count,

        "queue_length":
            waiting_count,

        "average_processing_time":
            average_processing_time
    }


# ============================================================
# NOTIFICATIONS
# ============================================================
# ============================================================
# SMS NOTIFICATION HELPER
# ============================================================

def send_sms_notification(
    mobile: str,
    message: str
):
    """
    SMS notification placeholder.

    For the current SIH prototype, this records
    the SMS request in the backend console.

    A real SMS gateway can be connected later
    without changing the notification workflow.
    """

    print("=" * 60)
    print("SMS NOTIFICATION")
    print("=" * 60)
    print(f"Mobile : {mobile}")
    print(f"Message: {message}")
    print("=" * 60)

    return {
        "success": True,
        "mobile": mobile,
        "message": message
    }

@app.get("/notifications/{farmer_id}")
def get_notifications(
    farmer_id: int,
    db: Session = Depends(get_db)
):

    notifications = db.query(
        models.Notification
    ).filter(
        models.Notification.farmer_id
        == farmer_id
    ).order_by(
        models.Notification.notification_id.desc()
    ).all()

    return [
        {
            "notification_id":
                notification.notification_id,

            "farmer_id":
                notification.farmer_id,

            "title":
                notification.title,

            "message":
                notification.message,

            "type":
                notification.type,

            "is_read":
                notification.is_read
        }
        for notification in notifications
    ]


# ============================================================
# MARK ALL NOTIFICATIONS AS READ
# ============================================================

@app.put("/notifications/{farmer_id}/read")
def mark_notifications_read(
    farmer_id: int,
    db: Session = Depends(get_db)
):

    notifications = db.query(
        models.Notification
    ).filter(
        models.Notification.farmer_id
        == farmer_id
    ).all()

    for notification in notifications:

        notification.is_read = True

    db.commit()

    return {
        "message":
            "All notifications marked as read"
    }


# ============================================================
# END
# ============================================================