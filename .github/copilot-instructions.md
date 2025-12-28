# Proyecto Ingeniería de Software - AI Coding Guidelines

## Project Overview
Full-stack bike reservation system with user authentication, bike management, space reservations, and admin features. Backend uses Node.js/Express/TypeORM/PostgreSQL; frontend uses React/Vite/Tailwind.

## Architecture Patterns
- **Backend MVC**: Controllers handle requests, services contain business logic, entities define DB schemas
- **Validation**: Use Joi schemas in `src/validations/` with Spanish error messages
- **Responses**: Always use `handleSuccess/handleErrorClient/handleErrorServer` from `src/Handlers/responseHandlers.js`
- **Auth**: JWT tokens stored in cookies, decoded in `req.user` (sub, id, email, role, etc.)
- **File Uploads**: Multer for uploads, Sharp for image processing, served from `/uploads` with no-cache headers

## Key Conventions
- **Language**: Spanish for user-facing messages, comments, and documentation
- **Modules**: ES modules (`import/export`) throughout
- **Entities**: TypeORM EntitySchema format in `src/entities/`
- **Services**: Repository pattern with try/catch, throw custom Error messages
- **Middleware**: Role-based access (user, guard, adminbicicletero) in `src/middleware/`
- **Frontend Services**: Axios calls in `src/services/`, error handling with SweetAlert2
- **Styling**: Tailwind CSS classes, custom styles in `src/styles/`

## Development Workflow
- **Backend**: `npm run dev` (nodemon), runs on port 3000, auto-creates initial users
- **Frontend**: `npm run dev` (Vite), runs on port 5173, proxy to backend API
- **DB**: PostgreSQL with TypeORM migrations, config in `src/config/configDb.js`
- **Env**: `.env` for DB credentials, JWT secret, etc.

## Common Patterns
- **Bike Ownership**: Bikes linked to users via `user_id`, enforce in services
- **Reservations**: Token-based system, states: "ingresada", etc.
- **Bicicleteros**: Bike racks with numbered spaces, one-to-many with bikes
- **Roles**: Check `req.user.role` in middleware, different permissions per role
- **Image Handling**: Default to `/default-bike.png`, upload to `/uploads/bikes/`

## File Structure Examples
- New controller: `src/controllers/new.controller.js` → import service, validation, handlers
- New service: `src/services/new.service.js` → use repositories, throw errors
- New validation: `src/validations/new.validation.js` → Joi schema with Spanish messages
- New page: `src/pages/NewPage.jsx` → use hooks, services, navigate on success
- New component: `src/components/NewComponent.jsx` → props, state, Tailwind classes

## Integration Points
- **Auth Flow**: Login sets jwt-auth cookie + sessionStorage, context decodes token
- **API Base**: Frontend uses `VITE_BASE_URL` env var for backend URL
- **CORS**: Enabled with credentials for cookie auth
- **Uploads**: Static serve from backend `/uploads`, frontend posts FormData

Reference: `backend/src/controllers/bike.controller.js`, `frontend/src/pages/Bicicleta.jsx`</content>
<parameter name="filePath">c:\Users\kochr\OneDrive\Documentos\GitHub\Proyecto-Ingenieria-de-Software\.github\copilot-instructions.md