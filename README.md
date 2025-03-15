<!-- INTRO -->
<br />
<div align="center">
  <h1 align="center">Fitflo Backend/h1>

  <p align="center">
    <h3> Welcome to the **FitFlo Backend** repository! This backend serves as the core for handling authentication, user management, healthcare data processing, and AI-powered pathway planning for FitFlo.
</p>
    <br />
    <a href="https://github.com/FitFlo-App/FitFlo-BE.git">Report Bug</a>
    ·
    <a href="https://github.com/FitFlo-App/FitFlo-BE.git">Request Feature</a>
<br>
<br>

[![MIT License][license-shield]][license-url]

  </p>
</div>

<!-- CONTRIBUTOR -->
<div align="center" id="contributor">
  <strong>
    <h3>Created by ITB Team:</h3>
    <table align="center">
      <tr>
        <td>Name</td>
      </tr>
      <tr>
        <td>Andhita Naura H.</td>
     </tr>
     <tr>
        <td>Aththriq Lisan Q. D. S.</td>
    </tr>
     <tr>
        <td>Eleanor Cordelia</td>
    </tr>
     <tr>
        <td>Marzuli Suhada M</td>
    </tr>
     <tr>
        <td>Muhammad Faiz A</td>
    </tr>
    </table>
  </strong>
</div>

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Installation](#installation)
4. [API Endpoints](#api-endpoints)
5. [License](#license)
   
## 🚀 Project Overview
FitFlo is an AI-powered healthcare pathway planner designed to simplify and optimize healthcare decisions. This backend manages user authentication, profile management, and integrates with AI to generate personalized healthcare recommendations.

## 🛠 Tech Stack
- **Backend Framework**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **AI Integration**: Qwen AI, Gemma, DeepSeek
- **APIs**: RESTful architecture

## ⚙️ Installation
To set up the backend locally:

1. Clone the repository:
   ```sh
   git clone https://github.com/FitFlo-App/FitFlo-BE.git
   cd fitflo-be
   ```

2. Create a `.env` file and configure environment variables.

3. Build and start the containers:
   ```sh
   docker-compose up --build -d
   ```

4. Verify that the containers are running:
   ```sh
   docker ps
   ```

## 📡 API Endpoints

### 🔐 Authentication
| Endpoint                     | Method | Description |
|------------------------------|--------|-------------|
| `/user/auth/email/login`     | POST   | Login with email |
| `/user/auth/email/register`  | POST   | Register a new user |
| `/user/auth/refresh-token`   | GET    | Refresh authentication token |
| `/user/auth/email/verify`    | POST   | Send email verification |
| `/user/auth/email/activation?token=...` | GET | Verify email activation |
| `/user/auth/email/forgot-password` | POST | Request password reset |
| `/user/auth/email/change-password` | PUT | Change user password |

### 👤 User Profile
| Endpoint                     | Method | Description |
|------------------------------|--------|-------------|
| `/user/profile/create`       | POST   | Create user profile |
| `/user/profile/update`       | PUT    | Update user profile |
| `/user/profile/read`         | GET    | Get user profile details |

### 💬 AI Chat & Pathway Planner
| Endpoint                     | Method | Description |
|------------------------------|--------|-------------|
| `/service/pathway/create-chat` | POST | Start a chat with AI for pathway planning |

## 📜 License
This project is licensed under the MIT License.

---
### 🌟 We appreciate your contributions to FitFlo! 
If you have any questions, feel free to open an issue or contact us.

<br>
<h3 align="center"> Thank You! </h3>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/FitFlo-App/FitFlo-BE.git/blob/main/LICENSE