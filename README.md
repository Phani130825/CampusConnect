# Campus Connect 🚀

**Campus Connect** is a full-stack web platform that bridges the gap between **Students**, **Entrepreneurs**, and **Investors**. The platform enables entrepreneurs to post real-world problems, students to propose innovative solutions, and investors to discover promising talent and projects.

## 🌟 Features

### 👨‍💼 For Entrepreneurs
- **Post Problems**: Share business challenges and real-world problems that need solutions
- **Review Solutions**: Evaluate student-submitted solutions with AI-powered analysis
- **Connect with Talent**: Find skilled students who can solve your business problems
- **Track Submissions**: Monitor and manage all solutions submitted to your problems

### 🎓 For Students
- **Explore Problems**: Browse real-world business challenges across various domains
- **Submit Solutions**: Propose innovative solutions to problems that match your skills
- **Showcase Skills**: Build your portfolio by solving real problems
- **AI-Powered Recommendations**: Get personalized problem recommendations based on your skills
- **Get Discovered**: Connect with entrepreneurs and investors looking for talent

### 💼 For Investors
- **Discover Talent**: Find promising students and emerging entrepreneurs
- **View Solutions**: Review innovative solutions to real-world problems
- **Track Trends**: Explore problems and solutions across different industries
- **Network**: Connect with the next generation of innovators

### 🤖 AI-Powered Features
- **Smart Recommendations**: Machine learning-based problem recommendations for students
- **Solution Analysis**: AI-powered similarity analysis between problems and solutions
- **Skill Matching**: Intelligent matching of student skills to problem requirements
- **Embedding-Based Search**: Semantic search using sentence transformers

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication via JSON Web Tokens
- **bcryptjs** - Password hashing
- **Cookie Parser** - Cookie handling

### AI/ML
- **Hugging Face Inference API** - Sentence transformers for embeddings
- **Sentence Transformers** - all-MiniLM-L6-v2 model
- **Cosine Similarity** - Semantic similarity matching

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Connectors
```

### 2. Environment Setup

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/campus-connect
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campus-connect

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Hugging Face API
HUGGING_FACE_TOKEN=your_hugging_face_api_token_here

# CORS
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies

#### Install Root Dependencies
```bash
npm install
```

#### Install Client Dependencies
```bash
cd client
npm install
cd ..
```

#### Install Server Dependencies
```bash
cd server
npm install
cd ..
```

### 4. Database Setup

#### Option 1: Local MongoDB
Make sure MongoDB is running on your machine:
```bash
mongod
```

#### Option 2: MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and add it to the `.env` file

#### Seed the Database (Optional)
```bash
cd server
node seed.js
cd ..
```

### 5. Run the Application

#### Development Mode

**Terminal 1 - Run Backend:**
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`

**Terminal 2 - Run Frontend:**
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`

#### Production Mode

**Build the Client:**
```bash
cd client
npm run build
cd ..
```

**Run the Server:**
```bash
cd server
npm start
cd ..
```

## 📁 Project Structure

```
Connectors/
├── client/                      # React Frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── assets/             # Images, fonts, etc.
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/            # React Context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── EntrepreneurDashboard.jsx
│   │   │   │   └── InvestorDashboard.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                      # Node.js Backend
│   ├── controllers/            # Business logic
│   │   ├── aiController.js     # AI/ML endpoints
│   │   ├── authController.js   # Authentication
│   │   ├── problemController.js
│   │   └── solutionController.js
│   ├── middleware/             # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Problem.js
│   │   └── Solution.js
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── problemRoutes.js
│   │   ├── solutionRoutes.js
│   │   └── aiRoutes.js
│   ├── server.js               # Entry point
│   ├── seed.js                 # Database seeding
│   └── package.json
│
├── package.json                # Root package file
└── README.md                   # This file
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get single problem
- `POST /api/problems` - Create a new problem (Entrepreneur only)
- `PUT /api/problems/:id` - Update a problem (Entrepreneur only)
- `DELETE /api/problems/:id` - Delete a problem (Entrepreneur only)

### Solutions
- `GET /api/solutions` - Get all solutions
- `GET /api/solutions/:id` - Get single solution
- `POST /api/solutions` - Submit a solution (Student only)
- `GET /api/solutions/problem/:problemId` - Get solutions for a problem
- `PUT /api/solutions/:id` - Update a solution
- `DELETE /api/solutions/:id` - Delete a solution

### AI Features
- `POST /api/ai/analyze-solution` - Analyze solution using AI
- `POST /api/ai/recommend-problems` - Get personalized problem recommendations

## 👥 User Roles

### Student
- Can view all problems
- Can submit solutions to problems
- Can view their submitted solutions
- Receives AI-powered problem recommendations based on skills

### Entrepreneur
- Can create, edit, and delete problems
- Can view all solutions submitted to their problems
- Can analyze solutions using AI
- Can discover talented students

### Investor
- Can view all problems and solutions
- Can discover promising projects and talent
- Can connect with entrepreneurs and students

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in HTTP-only cookies for security
- Protected routes require valid authentication
- Role-based access control (RBAC) for different user types

## 🧪 Testing

```bash
# Run tests (if configured)
npm test
```

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration can be found in:
- `client/tailwind.config.js`
- `client/postcss.config.js`

### Vite
Vite configuration for the React app:
- `client/vite.config.js`

### ESLint
Code linting configuration:
- `client/eslint.config.js`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/YourFeature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check your Atlas connection string
- Verify network access in MongoDB Atlas (whitelist your IP)

### Port Already in Use
- Change the PORT in the `.env` file
- Kill the process using the port: `lsof -ti:5000 | xargs kill` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)

### CORS Errors
- Verify the CLIENT_URL in `.env` matches your frontend URL
- Check CORS configuration in `server/server.js`

### Hugging Face API Errors
- Ensure your HUGGING_FACE_TOKEN is valid
- Check if you have API quota remaining
- Verify the model endpoint is accessible

## 📧 Contact

For questions or support, please open an issue in the repository.

## 🙏 Acknowledgments

- Hugging Face for providing the inference API
- MongoDB for the database platform
- The open-source community for the amazing tools and libraries

---


