require("dotenv").config()
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const Category = require("./models/Category")

  const allCategories = [
    // Subjects
    { name: "AI", description: "Explore artificial intelligence, neural networks, and intelligent systems." },
    { name: "Cloud Computing", description: "Learn AWS, Azure, Google Cloud, DevOps and cloud infrastructure." },
    { name: "Code Foundations", description: "Start your coding journey with programming fundamentals." },
    { name: "Computer Science", description: "Core computer science concepts, algorithms and data structures." },
    { name: "Cybersecurity", description: "Protect systems and networks with ethical hacking and security practices." },
    { name: "Data Analytics", description: "Analyze and interpret complex data to make business decisions." },
    { name: "Data Science", description: "Master Python, machine learning, data analysis and visualization." },
    { name: "Data Visualization", description: "Create compelling visual stories from data using modern tools." },
    { name: "Developer Tools", description: "Git, Docker, VS Code, and tools that make developers more productive." },
    { name: "DevOps", description: "CI/CD pipelines, containerization, and modern deployment practices." },
    { name: "Game Development", description: "Build 2D and 3D games using Unity, Unreal Engine and more." },
    { name: "IT", description: "IT fundamentals, networking, hardware and system administration." },
    { name: "Machine Learning", description: "Build intelligent models using supervised and unsupervised learning." },
    { name: "Math", description: "Mathematics for programmers — linear algebra, calculus and statistics." },
    { name: "Mobile Development", description: "Build iOS and Android apps using React Native and Flutter." },
    { name: "Web Design", description: "UI/UX design, Figma, CSS animations and responsive design." },
    { name: "Web Development", description: "Learn HTML, CSS, JavaScript, React, Node.js and build modern web apps." },

    // Languages
    { name: "Bash", description: "Shell scripting and command-line automation with Bash." },
    { name: "C++", description: "Systems programming, game development and competitive coding with C++." },
    { name: "C#", description: "Build Windows apps, games with Unity and backend services using C#." },
    { name: "Go", description: "Fast and efficient backend development with the Go programming language." },
    { name: "HTML & CSS", description: "The building blocks of the web — structure and style." },
    { name: "Java", description: "Enterprise applications, Android development and backend systems with Java." },
    { name: "JavaScript", description: "The language of the web — from basics to advanced ES6+ features." },
    { name: "Kotlin", description: "Modern Android development and JVM programming with Kotlin." },
    { name: "PHP", description: "Server-side web development and CMS platforms with PHP." },
    { name: "Python", description: "Versatile language for web, data science, AI and automation." },
    { name: "R", description: "Statistical computing and data analysis with R." },
    { name: "Ruby", description: "Elegant web development with Ruby and Ruby on Rails." },
    { name: "SQL", description: "Database management, queries and data manipulation with SQL." },
    { name: "Swift", description: "Build native iOS and macOS apps with Apple's Swift language." },
    { name: "TypeScript", description: "Typed JavaScript for large-scale application development." },
    { name: "Rust", description: "Systems programming with memory safety and blazing performance." },
  ]

  let created = 0
  let skipped = 0

  for (const cat of allCategories) {
    const exists = await Category.findOne({ name: cat.name })
    if (exists) {
      skipped++
      continue
    }
    await Category.create(cat)
    console.log("Created:", cat.name)
    created++
  }

  console.log(`\nDone! Created: ${created}, Skipped (already existed): ${skipped}`)
  process.exit(0)
}).catch((e) => {
  console.error("Error:", e.message)
  process.exit(1)
})
