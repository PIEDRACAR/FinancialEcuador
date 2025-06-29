from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import uvicorn
import bcrypt

app = FastAPI(title="Sistema Contable Pro - Auth API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "tu_clave_secreta_super_segura_para_jwt_tokens_2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# In-memory user store (in production, use a database)
users_db = {}

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    confirmPassword: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    name: str
    email: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_db.get(email)
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.post("/auth/register", response_model=dict)
async def register(user: UserCreate):
    # Validate passwords match
    if user.password != user.confirmPassword:
        raise HTTPException(
            status_code=400,
            detail="Las contraseñas no coinciden"
        )
    
    # Check if user already exists
    if user.email in users_db:
        raise HTTPException(
            status_code=400,
            detail="El usuario ya existe"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_id = len(users_db) + 1
    
    users_db[user.email] = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password
    }
    
    return {"message": "Usuario registrado exitosamente"}

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    # Validate user credentials
    db_user = users_db.get(user.email)
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return User(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"]
    )

@app.get("/auth/health")
async def health_check():
    return {"status": "ok", "message": "Auth server is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)