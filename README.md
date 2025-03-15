<!-- INTRO -->
<br />
<div align="center">
  <h1 align="center">Fitflo Backend</h1>

  <p align="center">
    <h3> Welcome to the **FitFlo Backend** repository! This backend serves as the core for handling authentication, user management, healthcare data processing, and AI-powered pathway planning for FitFlo.</h3>
  </p>

  [![MIT License][license-shield]][license-url] 

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
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
  - [IRIS Intersystems](#iris-intersystems)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Profile](#user-profile)
  - [AI Chat & Pathway Planner](#ai-chat--pathway-planner)
- [License](#license)
   
## Project Overview
FitFlo is an AI-powered healthcare pathway planner designed to simplify and optimize healthcare decisions. This backend manages user authentication, profile management, and integrates with AI to generate personalized healthcare recommendations.

FitFlo is deployed on [fitflo.site](https://fitflo.site) and it's API (Back End) deployed on [api.fitflo.site](https://api.fitflo.site)

FitFlo Front-End Repository: [https://github.com/FitFlo-App/FitFlo-FE](https://github.com/FitFlo-App/FitFlo-FE)<br>
FitFlo Back-End Repository: [https://github.com/FitFlo-App/FitFlo-BE](https://github.com/FitFlo-App/FitFlo-BE)

<p align="center">
  <img src="assets/screenshots/1.jpg"/>
  <img src="assets/screenshots/2.jpg"/>
  <img src="assets/screenshots/3.jpg"/>
  <img src="assets/screenshots/4.jpg"/>
  <img src="assets/screenshots/5.jpg"/>
  <img src="assets/screenshots/6.jpg"/>
  <img src="assets/screenshots/7.jpg"/>
  <img src="assets/screenshots/8.jpg"/>
  <img src="assets/screenshots/9.jpg"/>
</p>

## Tech Stack
- **Backend Framework**: Node.js with Express
- **Database**: MongoDB, Intersystems IRIS
- **Authentication**: JWT-based authentication
- **AI Integration**: Qwen AI, Gemma, DeepSeek
- **APIs**: RESTful architecture

### IRIS Intersystems

IRIS Intersystems is used to store and query vectorized symptom data to predict user disease from a chat. Then, FitFlo will give user General Advice, Medication, Home Remedies, and Alteranative Treatments.

<p align="center">
  <img src="assets/iris-intersystems.png"/>
  <img src="assets/rest-api.png"/>
</p>

#### Problems with IRIS Intersystems

While Intersystems IRIS Community Edition performs reliably in a local Docker environment, its stability in a VPS-hosted Docker setup is highly questionable for production use. The instance frequently stops running without clear explanations, making it unpredictable and frustrating to maintain. Occasionally, it cites "License limit exceeded 1 times since instance start," but more often than not, it fails without providing any reason at all. This inconsistency makes it unreliable for critical workloads, as troubleshooting becomes a guessing game. For a production environment, a database system should offer transparency and stability, two qualities that IRIS Community Edition currently lacks in a VPS-hosted Docker setup.

## Installation
To set up the backend locally:

1. Clone the repository:
   ```sh
   git clone https://github.com/FitFlo-App/FitFlo-BE.git
   cd FitFlo-BE
   ```

2. Create a `.env` file and configure environment variables.

3. To start development server:
   ```sh
   npm run dev
   ```

4. To build Docker image and start the containers:
   ```sh
   docker-compose up --build -d
   ```

5. Verify that the containers are running:
   ```sh
   docker ps
   ```

## API Endpoints

### Authentication
| Endpoint                     | Method | Description |
|------------------------------|--------|-------------|
| `/user/auth/email/login`     | POST   | Login with email |
| `/user/auth/email/register`  | POST   | Register a new user |
| `/user/auth/refresh-token`   | GET    | Refresh authentication token |
| `/user/auth/email/verify`    | POST   | Send email verification |
| `/user/auth/email/activation?token=...` | GET | Verify email activation |
| `/user/auth/email/forgot-password` | POST | Request password reset |
| `/user/auth/email/change-password` | PUT | Change user password |

### User Profile
| Endpoint                     | Method | Description |
|------------------------------|--------|-------------|
| `/user/profile/create`       | POST   | Create user profile |
| `/user/profile/update`       | PUT    | Update user profile |
| `/user/profile/read`         | GET    | Get user profile details |

### AI Chat & Pathway Planner
| Endpoint                     | Method | Description |
|------------------------------|--------|-------------|
| `/service/pathway/create-chat` | POST | Start a chat with AI for pathway planning |
| `/service/pathway/continue-chat` | PUT | Continue started chat with AI for pathway planning |
| `/service/pathway/read-chat` | GET | Read started chat with AI for pathway planning |

## License
This project is licensed under the MIT License.

---
### 🌟 We appreciate your contributions to FitFlo! 
If you have any questions, feel free to open an issue or contact us.

<br>
<h3 align="center"> Thank You! </h3>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/github/license/FitFlo-App/FitFlo-BE.svg?style=for-the-badge
[license-url]: https://github.com/FitFlo-App/FitFlo-BE.git/blob/staging/LICENSE