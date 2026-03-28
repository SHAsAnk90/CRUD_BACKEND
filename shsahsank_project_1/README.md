# Scalable REST API with Auth & RBAC (Intern Assignment)

This project consists of a **Spring Boot** backend and a **React.js** frontend. It implements a secure, scalable system with JWT authentication, Role-Based Access Control (RBAC), and Task CRUD operations.

## 🚀 Core Features

### Backend (Spring Boot 3.x)
- **Authentication**: User registration & login with password hashing (BCrypt) and JWT.
- **RBAC**: Roles supported: `ROLE_USER` and `ROLE_ADMIN`.
- **Task Management**: CRUD operations for tasks (Admin can see all, Users can see only their own).
- **Validation**: Input validation using Jakarta Validation.
- **Documentation**: Swagger/OpenAPI 3.0 integration.
- **Database**: H2 In-memory database (easily switchable to PostgreSQL/MySQL).

### Frontend (React + Vite + Tailwind CSS)
- **UI**: Modern, responsive dashboard.
- **Auth**: Login/Register pages with error/success handling.
- **Protected Routes**: Dashboard accessible only via JWT.
- **Task CRUD**: Full interaction with backend Task APIs.

---

## 🛠️ Configuration & Environment Variables

The project is configured to use environment variables for database and security settings.

### **1. Default Configuration**
By default, the project uses an **H2 In-memory database**. All configuration is defined in `backend/src/main/resources/application.yml`.

### **2. Using Environment Variables**
A template `.env` file is provided in the `backend/` directory. To override defaults, you can set these variables in your system or IDE:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `DB_URL` | `jdbc:h2:mem:testdb` | Database connection URL |
| `DB_DRIVER` | `org.h2.Driver` | JDBC Driver class name |
| `DB_USERNAME` | `sa` | Database username |
| `DB_PASSWORD` | `password` | Database password |
| `JWT_SECRET` | (long random string) | Secret key for JWT signing |
| `SERVER_PORT` | `8080` | Port for the backend server |

### **3. Switching to PostgreSQL/MySQL**
To use a production database:
1.  Add the corresponding driver dependency to `backend/pom.xml`.
2.  Update the environment variables in your `.env` or IDE configuration.
3.  Restart the application.

Example for PostgreSQL:
```env
DB_URL=jdbc:postgresql://localhost:5432/taskpro
DB_DRIVER=org.postgresql.Driver
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```

---

## 🚀 Running the Project
```bash
cd backend
mvn spring-boot:run
```
- API will be at: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console` (User: `sa`, Pass: `password`)

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
- UI will be at: `http://localhost:5173`

---

## 📈 Scalability Note

To scale this system for millions of users, we can implement:

1.  **Microservices Architecture**: Split Auth and Task services into independent microservices to scale them separately based on demand.
2.  **Database Scaling**:
    *   Implement **Read Replicas** for high-read scenarios.
    *   Use **Database Sharding** to distribute data across multiple nodes.
3.  **Caching**: Use **Redis** for:
    *   Caching frequently accessed tasks.
    *   Storing JWT blacklists for immediate revocation.
    *   Session management (if needed).
4.  **Load Balancing**: Use Nginx or AWS ALB to distribute traffic across multiple backend instances.
5.  **Asynchronous Processing**: Use **Kafka** or **RabbitMQ** for heavy tasks like sending registration emails or generating reports.
6.  **Containerization**: Use **Docker** and **Kubernetes** for automated deployment, scaling, and management of containers.
7.  **API Gateway**: Implement an API Gateway (like Spring Cloud Gateway) for centralized authentication, rate limiting, and request routing.

---

## 📄 API Documentation (Summary)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/tasks` | Get all tasks (User's or Admin's) | Yes |
| POST | `/api/v1/tasks` | Create new task | Yes |
| PUT | `/api/v1/tasks/{id}` | Update task | Yes |
| DELETE| `/api/v1/tasks/{id}` | Delete task | Yes |

---

**Developed by:** Shashank
**Subject:** Shahsank Developer Task (Java Backend)
