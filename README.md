
# **Set-Up-Node-MVC**  
*A CLI tool to scaffold a Node.js backend with MVC architecture and built-in authentication*  

## ⚠️ **Disclaimer**  
You must run this tool using `npx` to execute it directly from the npm registry without requiring a global installation.  

```bash
npx set-up-node-mvc
```

## **Overview**  
**Set-Up-Node-MVC** is a powerful CLI tool that quickly scaffolds a structured **MVC (Model-View-Controller)** architecture for Node.js applications. It simplifies backend setup by generating a well-organized project with essential configurations, allowing developers to focus on building features instead of setting up the boilerplate.  

## **Key Features**  
- **Interactive Setup** – Choose between JavaScript and TypeScript during setup.  
- **MVC Architecture** – Generates a modular structure with `controllers`, `services`, `repositories`, and `routes`.  
- **Express.js Integration** – Sets up an Express server with basic routing.  
- **TypeScript Support** – Includes TypeScript configuration with `ts-node-dev` for live reload.  
- **Database Ready** – Provides flexibility to integrate various databases.  
- **Built-in JWT Authentication** – Implements secure user authentication with JSON Web Tokens.  

## **Generated Project Structure**  

```
project-root/
      src/
         │── controllers/      # Route handlers  
         │── services/         # Business logic  
         │── repositories/     # Database queries and data access  
         │── routes/           # API route definitions  
         │── middleware/       # Middleware functions (e.g., authentication)  
         │── config/           # Configuration files  
         │── utils/            # Utility functions  
      │── index.js (or index.ts)  # Entry point  
      │── .env              # Environment variables  
      │── .gitignore        # Version control exclusions  
```

## **JWT Authentication**  
The CLI automatically sets up authentication with JWT, including:  
- **User Registration** – Secure signup with password hashing.  
- **User Login** – Issues JWT tokens for authenticated users.  
- **Protected Routes** – Middleware to secure endpoints using JWT.  
- **Configurable Token Settings** – Modify `JWT_KEY` and expiration in the `.env` file.  

## **Installation & Usage**  

### **Run with npx (Recommended)**  
To use the CLI without installing globally, simply run:  

```bash
npx set-up-node-mvc
```

Follow the interactive prompts to configure your project.  

### **Install Locally (Optional)**  
You can install the package locally and run it within your project:  

```bash
npm install --save-dev set-up-node-mvc
npx set-up-node-mvc
```

## **Starting the Server**  

Once the project is set up, navigate to the project directory and start the server:  

### **For JavaScript:**  
```bash
npm run dev
```

### **For TypeScript:**  
```bash
npm run dev
```
(This runs with `ts-node-dev` for live reloading.)  

## **Conclusion**  
**Set-Up-Node-MVC** is designed to save developers time by providing a well-structured backend setup with minimal effort. It’s a great choice for quickly setting up a Node.js application with **Express.js**, **JWT authentication**, and **MVC architecture**.  

---

This version improves clarity, formatting, and professionalism while keeping it beginner-friendly. Let me know if you want any modifications! 🚀


### **Designed & Developed by**  
**Abhishek Kumar Gupta** – Software Developer  

📧 **Email:** [abhishek.akg13@gmail.com](mailto:abhishek.akg13@gmail.com)  
🔗 **GitHub:** [github.com/Abhigupta13](https://github.com/Abhigupta13)  
🔗 **LinkedIn:** [linkedin.com/in/abhigupta3007](https://www.linkedin.com/in/abhigupta3007/)  
🔗 **Portfolio:** [https://abhishek-gupta-portfolio.vercel.app/](https://abhishek-gupta-portfolio.vercel.app/)

---