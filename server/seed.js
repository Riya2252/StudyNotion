require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const User = require("./models/User")
  const Profile = require("./models/Profile")
  const Category = require("./models/Category")
  const Course = require("./models/Course")
  const Section = require("./models/Section")
  const SubSection = require("./models/SubSection")

  // 1. Create Instructor
  let instructor = await User.findOne({ email: "instructor@studynotion.com" })
  if (!instructor) {
    const profile = await Profile.create({
      gender: "Male",
      dateOfBirth: "1990-01-01",
      about: "Senior software engineer and passionate instructor with 10+ years of experience.",
      contactNumber: 9999999999,
    })
    instructor = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "instructor@studynotion.com",
      password: await bcrypt.hash("Instructor@123", 10),
      accountType: "Instructor",
      approved: true,
      additionalDetails: profile._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=John Doe",
    })
    console.log("Instructor created:", instructor.email)
  } else {
    console.log("Instructor already exists:", instructor.email)
  }

  // 2. Create Categories
  const categoryData = [
    { name: "Web Development", description: "Learn HTML, CSS, JavaScript, React, Node.js and more to build modern web apps." },
    { name: "Data Science", description: "Master Python, machine learning, data analysis and visualization." },
    { name: "Mobile Development", description: "Build iOS and Android apps using React Native and Flutter." },
    { name: "Cloud Computing", description: "Learn AWS, Azure, Google Cloud, DevOps and CI/CD pipelines." },
  ]

  const categories = []
  for (const cat of categoryData) {
    let c = await Category.findOne({ name: cat.name })
    if (!c) c = await Category.create(cat)
    categories.push(c)
    console.log("Category:", c.name)
  }

  // 3. Course definitions
  const coursesData = [
    {
      courseName: "The Complete React Developer Course",
      courseDescription: "Build powerful React applications from scratch. Learn hooks, Redux, React Router, and deploy to production.",
      whatYouWillLearn: "- Build real-world React apps\n- Master React Hooks\n- State management with Redux\n- React Router & Navigation\n- REST API integration\n- Deploy to Netlify & Vercel",
      price: 1999,
      tag: ["react", "javascript", "frontend"],
      categoryIndex: 0,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
      instructions: ["Basic JavaScript knowledge required", "A computer with internet access"],
      sections: [
        {
          sectionName: "Getting Started with React",
          subSections: [
            { title: "Introduction to React", description: "What is React and why use it?", timeDuration: "10:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
            { title: "Setting Up the Environment", description: "Install Node.js and create-react-app", timeDuration: "8:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          ],
        },
        {
          sectionName: "React Hooks Deep Dive",
          subSections: [
            { title: "useState and useEffect", description: "Core hooks every React developer needs", timeDuration: "15:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
            { title: "useContext and useReducer", description: "Advanced state management hooks", timeDuration: "20:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          ],
        },
      ],
    },
    {
      courseName: "Node.js & Express — Backend Mastery",
      courseDescription: "Build scalable backend APIs with Node.js, Express, MongoDB and JWT authentication.",
      whatYouWillLearn: "- REST API design\n- Express middleware\n- MongoDB & Mongoose\n- JWT Authentication\n- File uploads\n- Error handling",
      price: 1799,
      tag: ["nodejs", "express", "backend", "mongodb"],
      categoryIndex: 0,
      thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
      instructions: ["Basic JavaScript knowledge", "Familiarity with command line"],
      sections: [
        {
          sectionName: "Node.js Fundamentals",
          subSections: [
            { title: "What is Node.js?", description: "Understanding the Node.js runtime", timeDuration: "12:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
            { title: "Building your first server", description: "Create an HTTP server with Express", timeDuration: "14:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          ],
        },
      ],
    },
    {
      courseName: "Python for Data Science & Machine Learning",
      courseDescription: "Master data science with Python, Pandas, NumPy, Matplotlib and Scikit-learn.",
      whatYouWillLearn: "- Python fundamentals\n- Data analysis with Pandas\n- Data visualization\n- Machine learning with Scikit-learn\n- Real-world projects",
      price: 2499,
      tag: ["python", "data science", "machine learning"],
      categoryIndex: 1,
      thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80",
      instructions: ["No prior experience needed", "Enthusiasm to learn!"],
      sections: [
        {
          sectionName: "Python Basics",
          subSections: [
            { title: "Python Installation & Setup", description: "Install Python and Jupyter Notebook", timeDuration: "10:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
            { title: "Variables, Lists & Loops", description: "Core Python programming concepts", timeDuration: "18:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          ],
        },
        {
          sectionName: "Data Analysis with Pandas",
          subSections: [
            { title: "Introduction to Pandas", description: "DataFrames and Series explained", timeDuration: "20:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          ],
        },
      ],
    },
    {
      courseName: "React Native — Build Mobile Apps",
      courseDescription: "Create cross-platform iOS and Android apps using React Native and Expo.",
      whatYouWillLearn: "- React Native fundamentals\n- Navigation with React Navigation\n- State management\n- Native device features\n- Publishing to App Store & Play Store",
      price: 2199,
      tag: ["react native", "mobile", "ios", "android"],
      categoryIndex: 2,
      thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
      instructions: ["Basic React knowledge helpful", "Mac required for iOS development"],
      sections: [
        {
          sectionName: "Getting Started",
          subSections: [
            { title: "React Native vs React", description: "Key differences and similarities", timeDuration: "10:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
            { title: "Setting up Expo", description: "Run your first mobile app", timeDuration: "12:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          ],
        },
      ],
    },
    {
      courseName: "AWS Cloud Practitioner Essentials",
      courseDescription: "Learn AWS core services, cloud concepts, security and billing to ace the Cloud Practitioner exam.",
      whatYouWillLearn: "- AWS core services (EC2, S3, RDS)\n- Cloud security & IAM\n- Networking & VPC\n- Billing & Cost Management\n- Exam preparation tips",
      price: 2999,
      tag: ["aws", "cloud", "devops"],
      categoryIndex: 3,
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
      instructions: ["No prior cloud experience needed", "Basic IT concepts helpful"],
      sections: [
        {
          sectionName: "AWS Fundamentals",
          subSections: [
            { title: "What is Cloud Computing?", description: "Cloud concepts and AWS global infrastructure", timeDuration: "15:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
            { title: "Core AWS Services", description: "EC2, S3, RDS, Lambda overview", timeDuration: "20:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          ],
        },
      ],
    },
    {
      courseName: "Full Stack Web Development Bootcamp",
      courseDescription: "Become a full stack developer with HTML, CSS, JavaScript, React, Node.js, and MongoDB.",
      whatYouWillLearn: "- HTML5 & CSS3 fundamentals\n- JavaScript ES6+\n- React frontend\n- Node.js backend\n- MongoDB database\n- Deploy full stack apps",
      price: 3499,
      tag: ["fullstack", "web development", "javascript"],
      categoryIndex: 0,
      thumbnail: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      instructions: ["No prior coding experience needed", "Dedicated 2-3 hours daily"],
      sections: [
        {
          sectionName: "HTML & CSS Foundations",
          subSections: [
            { title: "HTML Structure & Semantics", description: "Build the skeleton of web pages", timeDuration: "16:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
            { title: "CSS Layouts with Flexbox & Grid", description: "Modern CSS layout techniques", timeDuration: "22:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          ],
        },
        {
          sectionName: "JavaScript Essentials",
          subSections: [
            { title: "JavaScript Fundamentals", description: "Variables, functions, arrays and objects", timeDuration: "25:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
            { title: "Async JavaScript & APIs", description: "Promises, async/await and fetch", timeDuration: "18:00", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
          ],
        },
      ],
    },
  ]

  // 4. Create Courses
  for (const courseData of coursesData) {
    const existing = await Course.findOne({ courseName: courseData.courseName })
    if (existing) {
      console.log("Course already exists:", courseData.courseName)
      continue
    }

    const sectionIds = []
    for (const sec of courseData.sections) {
      const subSectionIds = []
      for (const sub of sec.subSections) {
        const subSection = await SubSection.create(sub)
        subSectionIds.push(subSection._id)
      }
      const section = await Section.create({
        sectionName: sec.sectionName,
        subSection: subSectionIds,
      })
      sectionIds.push(section._id)
    }

    const category = categories[courseData.categoryIndex]
    const course = await Course.create({
      courseName: courseData.courseName,
      courseDescription: courseData.courseDescription,
      whatYouWillLearn: courseData.whatYouWillLearn,
      price: courseData.price,
      tag: courseData.tag,
      category: category._id,
      thumbnail: courseData.thumbnail,
      instructions: courseData.instructions,
      instructor: instructor._id,
      courseContent: sectionIds,
      status: "Published",
    })

    await Category.findByIdAndUpdate(category._id, { $push: { courses: course._id } })
    await User.findByIdAndUpdate(instructor._id, { $push: { courses: course._id } })

    console.log("Course created:", course.courseName, "| Category:", category.name)
  }

  console.log("\nSeed complete!")
  process.exit(0)
}).catch((e) => {
  console.error("Error:", e.message)
  process.exit(1)
})
