import type { PortfolioContent } from "@/lib/types"

/**
 * The portfolio as it ships today (ganesh-portfolio/src/const.ts). Used as the
 * starting point until the portfolio has been saved once, and as demo data.
 */
export function seedPortfolio(): PortfolioContent {
  return {
    profile: {
      name: "Ganeshguru A",
      role: "Full-stack developer",
      availability: "Available for full-time roles",
      intro:
        "I build web and mobile products that run in production — real-time tracking, payments and APIs that hold up under real users. Two years shipping, two apps live on Google Play.",
      aiHeading: "Also building with AI",
      aiBlurb:
        "I use Claude Code as a daily engineering tool — this site and both of my published Agent Skills were built with it — and I'm comfortable going further: wiring LLM APIs into real products, retrieval over a vector store, and fine-tuning a model when prompting alone isn't enough.",
      aiSkills: [
        "LLM API integration",
        "RAG & vector search",
        "Prompt engineering",
        "Agent tooling",
        "Model fine-tuning",
      ],
      about: [
        "I work across the whole stack — React and Next.js on the front, Node.js and PostgreSQL behind it. Most of my time goes to the unglamorous half: securing endpoints, trimming redundant network calls, and getting queries fast enough that the interface never has to apologise for waiting.",
        "Before that I spent two years on mobile, migrating a fitness platform from web to React Native and keeping it stable on both Android and iOS. That work taught me to treat performance and offline behaviour as features, not afterthoughts — which is how I still build.",
      ],
      readout: [
        {
          key: "Based",
          value: "Chennai, India",
        },
        {
          key: "Exp",
          value: "3+ years, full-time",
        },
        {
          key: "Stack",
          value: "Next.js · Node.js · React Native · LLM APIs",
        },
        {
          key: "Shipped",
          value: "2 apps live on Google Play",
        },
        {
          key: "Open source",
          value: "4 agent skills published",
        },
      ],
      email: "ganeshguru8681@gmail.com",
      phone: "+91 90922 48685",
      location: "Chennai, India",
      resumeUrl: "/Ganeshguru-A-Resume.pdf",
      photo: "/Images/profile.png",
      socials: [
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/ganeshgurua/",
        },
        {
          label: "GitHub",
          href: "https://github.com/Ganeshguru5",
        },
        {
          label: "X",
          href: "https://x.com/GANESHGURU5034",
        },
      ],
      education: {
        degree: "BE, Computer Science",
        school: "Kamaraj College of Engineering & Technology",
        years: "2020 — 2023",
        grade: "GPA 7.6/10",
      },
      contactTitle: "Have something worth building?",
      contactBody:
        "I'm open to full-time roles and selective freelance work. Send over the problem and I'll tell you honestly whether I'm the right person for it.",
    },
    experience: [
      {
        title: "Full-Stack Developer",
        company: "Apeiron",
        location: "Chennai",
        exp: "Aug 2025 — Present",
        description:
          "Building scalable full-stack products with Next.js and Node.js. I design REST APIs with secure authentication, tune PostgreSQL queries for efficient data handling, and build responsive React interfaces that cut redundant network calls. Works directly with the CTO and cross-functional teams to ship production releases.",
        image: "/Images/apeiron.jpg",
        skills: [
          "Next.js",
          "React.js",
          "TypeScript",
          "Node.js",
          "PostgreSQL",
          "Redux",
          "RTK Query",
          "shadcn/ui",
          "Material UI",
          "Tailwind CSS",
          "Docker",
          "CI/CD",
        ],
        current: true,
      },
      {
        title: "Software Engineer",
        company: "Stamin — Velvom Healthcare",
        location: "Chennai",
        exp: "Aug 2024 — Aug 2025",
        description:
          "Owned real-time tracking and class scheduling across a gym ERP used on Android, iOS and web. Integrated Razorpay and in-app purchases to open a revenue line, cut load times on both mobile platforms, and added automated test coverage to keep releases stable.",
        image: "/Images/staminLogo.jpeg",
        skills: [
          "React Native",
          "React.js",
          "Node.js",
          "Firebase",
          "Redux-Saga",
          "Jest",
          "OAuth 2.0",
          "Razorpay",
          "AdMob",
          "Google Fit API",
        ],
      },
      {
        title: "Mobile Application Developer",
        company: "Stamin — Velvom Healthcare",
        location: "Chennai",
        exp: "Aug 2023 — Aug 2024",
        description:
          "Led the migration of a React + Firebase web app to a native-feeling React Native platform. Reworked features for touch, kept the data layer in sync through the transition, and coordinated design and QA to land the switch without disrupting existing members.",
        image: "/Images/staminLogo.jpeg",
        skills: ["React Native", "React.js", "Firebase", "Node.js", "Redux", "REST API", "UI/UX Design"],
      },
    ],
    projects: [
      {
        slug: "IamCandidate",
        title: "IamCandidate — Job Search Command Centre",
        description:
          "A personal operating system for a job search: applications, contacts, referrals, interviews, LaTeX resumes, documents and email in one place — on the web, in a browser extension and installed on iPhone.",
        detail: [
          "IamCandidate replaces the spreadsheet, the inbox folders and the twelve open tabs that a job search usually turns into. Applications move through a Kanban pipeline with a timeline of every status change and follow-up, and contacts, referrals, interviews and documents hang off the right application.",
          "Getting data in is the hard part, so IamCandidate reads it for you. A Chrome extension (Alt+K) pulls the role, company, location, salary and description from LinkedIn, Naukri, Indeed and the major applicant tracking systems. In the app, a Chat screen does the same from a pasted link — using Greenhouse, Lever, Ashby and Workday's public job APIs, LinkedIn's public pages and schema.org data — and turns LinkedIn or GitHub profile links into contacts. Every result lands on a review card first, with duplicate detection, so nothing is saved blindly.",
          "The backend is serverless on AWS: Lambda functions behind API Gateway, a single-table DynamoDB design and private S3 storage with presigned links. SMTP passwords and Google tokens are encrypted with AES-256-GCM, and the link reader refuses private and cloud-metadata addresses on every redirect so it can't be turned into a proxy.",
          "On the phone, IamCandidate installs from Safari as a progressive web app with its own icon, launch screens and offline screen. A floating glass tab bar holds four pages you choose in a control centre, with everything else one tap away.",
        ],
        highlights: [
          "Serverless AWS backend (Lambda, API Gateway, DynamoDB, S3) defined in SAM",
          "Job and profile import from links and a Chrome extension, with review and de-duplication",
          "LaTeX resume editor compiled to PDF, Google Drive import and SMTP email templates",
          "Installable iPhone app (PWA) with a customisable glass tab bar and offline support",
        ],
        image: "/Images/iamcandidate.png",
        href: "https://knot-ui-eight.vercel.app",
        meta: "Live app",
        tags: ["Next.js", "TypeScript", "AWS Lambda", "DynamoDB", "PWA"],
        span: "md:col-span-6",
        feature: true,
      },
      {
        slug: "stamin",
        title: "Stamin — Fitness Management Platform",
        description:
          "A production gym ERP running real-time member tracking, class scheduling and multi-centre management across web and mobile.",
        detail: [
          "Stamin is the operating system behind Velvom Healthcare's gyms — the system staff use to run classes, track members and handle payments across multiple centres, and the app members use day to day.",
          "I owned the real-time layer: live attendance and class-occupancy updates that stay in sync across every device in a centre without a manual refresh, and a scheduling engine that handles recurring classes, waitlists and multi-centre membership in one data model.",
          "Payments ran through Razorpay for in-app purchases and renewals, which meant getting webhook handling, retries and reconciliation right — a failed or duplicated payment event is a support ticket and a refund, not just a bug.",
        ],
        highlights: [
          "Real-time attendance and scheduling sync across web, Android and iOS",
          "Razorpay integration for renewals and in-app purchases",
          "Multi-centre data model supporting independent rosters and billing",
        ],
        image: "/Images/Stamin.png",
        href: "https://play.google.com/store/apps/details?id=com.app_stamin",
        meta: "Google Play",
        tags: ["React Native", "React.js", "Node.js", "Firebase"],
        span: "md:col-span-4",
        feature: true,
      },
      {
        slug: "exterva",
        title: "Exterva",
        description:
          "A self-initiated fitness MVP: workouts, diet, water and activity logging with real-time sync, ads and in-app purchases.",
        detail: [
          "Exterva is a solo project — I owned the idea, the product decisions and every line of code, from the first screen to the Play Store listing.",
          "It logs workouts, diet, water intake and daily activity, syncing in real time across devices through Firebase so a session logged on one phone shows up immediately everywhere else.",
          "I wired up AdMob and in-app purchases to test a real monetisation path rather than leaving it as a portfolio demo, which forced decisions most tutorial projects skip: ad placement that doesn't wreck retention, and a free/paid split that's actually worth paying for.",
        ],
        highlights: [
          "Solo-built, end to end: product, UI and backend",
          "Real-time sync for workouts, diet, water and activity logs",
          "AdMob and in-app purchases shipped to production, not stubbed out",
        ],
        image: "/Images/exterva.png",
        href: "https://play.google.com/store/apps/details?id=com.exterva",
        meta: "Google Play",
        tags: ["React Native", "Firebase", "IAP"],
        span: "md:col-span-2",
      },
      {
        slug: "anti-counterfeit-medicine",
        title: "Anti-Counterfeit Medicine Tracking",
        description: "Decentralised traceability for pharmaceuticals — smart contracts verify authenticity end to end.",
        detail: [
          "Counterfeit medicine is a supply-chain trust problem — this project traces a drug batch from manufacturer to pharmacy on-chain, so authenticity can be verified at any point without trusting a single intermediary.",
          "Each stage of the supply chain (manufacturer, distributor, pharmacy) writes a signed transaction to the chain as the batch moves, implemented as Solidity smart contracts deployed and tested with Truffle, with a React front end for registering and verifying batches.",
          "The interesting part wasn't the happy path — it was deciding what the contract should reject: a batch reported at two locations at once, a transfer from an unregistered party, a quantity mismatch at handoff.",
        ],
        highlights: [
          "Solidity smart contracts for batch provenance and transfer",
          "Truffle for contract testing and deployment",
          "React front end for registering and verifying a batch's chain of custody",
        ],
        image: "/Images/Blockchain.jpeg",
        href: "https://github.com/Ganeshguru5/Anti-Counterfeit-Medicine-Tracking-system-using-Blockchain.",
        meta: "GitHub",
        tags: ["Solidity", "Truffle", "React.js"],
        span: "md:col-span-2",
      },
      {
        slug: "naruto-api",
        title: "Naruto Unofficial API",
        description: "A public REST API serving characters, villages and clans from the Naruto universe.",
        detail: [
          "A public, free REST API for Naruto data — characters, villages and clans — built because the existing options were either incomplete or had gone offline.",
          "It's a straightforward Node.js service on Firebase, but running it as a public API (rather than a private script) meant treating it like one: stable endpoint shapes, sane error responses, and uptime that doesn't depend on me remembering to restart something.",
          "It's still live and gets used by other developers' side projects, which is the actual test of whether an API is usable.",
        ],
        highlights: [
          "Public REST API, live since launch with no breaking changes",
          "Firebase-hosted Node.js service with Firestore as the data source",
          "Used by third-party projects outside my own",
        ],
        image: "/Images/narutoApi.jpeg",
        href: "https://narutounofficialapi.web.app/",
        meta: "Live API",
        tags: ["Node.js", "REST", "Firebase"],
        span: "md:col-span-2",
      },
      {
        slug: "netflix-clone",
        title: "Netflix Clone",
        description:
          "A pixel-close rebuild of the Netflix browse experience, built to study layout and media performance.",
        detail: [
          "A deliberate study project: rebuild the Netflix browse experience closely enough that the layout, scroll behaviour and media loading had to hold up to comparison, not just resemble it from a distance.",
          "Content comes from the TMDB API, organised into the same horizontally-scrolling row layout Netflix uses, with hover previews and a hero banner that rotates featured titles.",
          "The real work was performance: lazy-loading dozens of poster images per row without janking the scroll, and keeping the hero banner from blocking first paint.",
        ],
        highlights: [
          "Row-based browse layout with hover previews, built from scratch",
          "TMDB API integration for live catalogue data",
          "Lazy image loading tuned to keep scroll performance smooth",
        ],
        image: "/Images/NetflixClone.jpeg",
        href: "https://netflsix.web.app/",
        meta: "Live demo",
        tags: ["React.js", "TMDB API"],
        span: "md:col-span-2",
      },
    ],
    agentSkills: [
      {
        name: "stack-aware-development",
        tagline: "Read the repo before you change it",
        description:
          "Stops an agent reaching for its favourite stack. It detects the languages, frameworks, database and test tooling from lockfiles and manifests, copies the conventions of the nearest existing feature, then makes the smallest change that fits — and verifies it with the project's own commands.",
        repo: "https://github.com/GanezhHQ/stack-aware-development",
        install: "npx skills add GanezhHQ/stack-aware-development",
        version: "1.0.0",
        license: "MIT",
        spec: [
          {
            key: "Languages",
            value: "7 guides",
          },
          {
            key: "Frameworks",
            value: "6 guides",
          },
          {
            key: "References",
            value: "12 docs",
          },
          {
            key: "Evals",
            value: "12 behavioural cases",
          },
        ],
        tags: ["Agent Skills", "Python", "Prompt engineering", "Evals", "CI"],
      },
      {
        name: "zod-schema-architect",
        tagline: "Design the contract, then write the schema",
        description:
          "Treats a Zod schema as a runtime contract at a trust boundary, not a type echo. It finds the boundary, decides whether runtime validation is warranted at all, reads the repo's installed Zod version and existing conventions, then writes the schema, the inferred types, the integration and the tests.",
        repo: "https://github.com/GanezhHQ/zod-schema-architect",
        install: "npx skills add GanezhHQ/zod-schema-architect",
        version: "1.0.0",
        license: "MIT",
        spec: [
          {
            key: "References",
            value: "14 docs",
          },
          {
            key: "Evals",
            value: "10 behavioural cases",
          },
          {
            key: "Fixtures",
            value: "5 runnable projects",
          },
          {
            key: "Verified on",
            value: "zod 4.6 · 3.25",
          },
        ],
        tags: ["Agent Skills", "TypeScript", "Zod", "API design", "Evals"],
      },
      {
        name: "secure-api-architect",
        tagline: "Trace every endpoint from route to SQL",
        description:
          "Makes an agent read the repo's real auth, tenancy and data-access code before it touches an API. It traces each endpoint from the route to the SQL to confirm the checks actually run, then applies only the OWASP API Top 10 and ASVS 5.0 controls that endpoint needs. It makes minimal fixes and proves them with allow-and-deny security tests.",
        repo: "https://github.com/GanezhHQ/secure-api-architect",
        install: "npx skills add GanezhHQ/secure-api-architect",
        version: "1.0.0",
        license: "MIT",
        spec: [
          { key: "Baseline", value: "OWASP API Top 10 · ASVS 5.0" },
          { key: "References", value: "12 docs" },
          { key: "Scanner", value: "21 unit tests" },
          { key: "Evals", value: "7 behavioural cases" },
        ],
        tags: ["Agent Skills", "Python", "API security", "OWASP", "Evals"],
      },
      {
        name: "unit-test-architect",
        tagline: "A test that can't fail isn't evidence",
        description:
          "Makes an agent write unit tests worth keeping. It detects the repo's existing runner and conventions (Jest, Vitest, node:test, Mocha or Bun) and designs a risk-based test matrix. It mocks only external boundaries, checks that every test can fail, runs them, and reports real pass/fail results. It also flags requests that really need an integration test.",
        repo: "https://github.com/GanezhHQ/unit-test-architect",
        install: "npx skills add GanezhHQ/unit-test-architect",
        version: "1.0.0",
        license: "MIT",
        spec: [
          { key: "Runners", value: "5 detected" },
          { key: "References", value: "4 docs" },
          { key: "Example tests", value: "29 passing" },
          { key: "Evals", value: "6 behavioural cases" },
        ],
        tags: ["Agent Skills", "Python", "Unit testing", "Jest", "Vitest"],
      },
    ],
    openSource: {
      name: "GanezhHQ",
      url: "https://github.com/GanezhHQ",
      intro:
        "GanezhHQ is my independent open-source engineering organisation, where I publish developer tools and AI-powered applications.",
      repos: [
        {
          name: "iamcandidate",
          description:
            "The project's front door: what IamCandidate does, with links to the live app and its source.",
          href: "https://github.com/GanezhHQ/iamcandidate",
          language: "",
          license: "",
        },
        {
          name: "iamcandidate-ui",
          description:
            "The web app: applications, referrals, interviews, resumes and documents in one workspace.",
          href: "https://github.com/GanezhHQ/iamcandidate-ui",
          language: "TypeScript",
          license: "",
        },
        {
          name: "iamcandidate-server",
          description:
            "The API behind it: authentication, career data, documents and integrations.",
          href: "https://github.com/GanezhHQ/iamcandidate-server",
          language: "TypeScript",
          license: "",
        },
        {
          name: "iamcandidate-extension",
          description:
            "The browser extension that captures jobs and autofills applications.",
          href: "https://github.com/GanezhHQ/iamcandidate-extension",
          language: "JavaScript",
          license: "",
        },
      ],
    },
    toolkit: [
      {
        group: "Languages",
        items: ["JavaScript", "TypeScript", "Solidity"],
      },
      {
        group: "Frontend",
        items: [
          "React.js",
          "Next.js",
          "React Native",
          "Redux",
          "RTK Query",
          "Tailwind CSS",
          "Material UI",
          "shadcn/ui",
        ],
      },
      {
        group: "Backend & data",
        items: ["Node.js", "REST APIs", "PostgreSQL", "MongoDB", "Firebase", "Cloud Functions"],
      },
      {
        group: "AI & LLM tooling",
        items: [
          "Claude Code",
          "Agent Skills",
          "Prompt engineering",
          "OpenAI API",
          "Anthropic API",
          "RAG & vector search",
          "Embeddings",
          "Model fine-tuning",
        ],
      },
      {
        group: "Tooling",
        items: [
          "Git",
          "Docker",
          "CI/CD",
          "Jest",
          "Postman",
          "Swagger",
          "Android Studio",
          "Xcode",
          "Google Cloud Console",
        ],
      },
    ],
    testimonials: [
      {
        quote:
          "Ganeshguru is a rare breed of developer who combines deep technical expertise with an eye for user experience. He consistently delivers scalable and reliable features on time.",
        name: "Naveen",
        designation: "Software Engineer at Xmplar",
        src: "/Images/naveen.jpeg",
        linkedin: "https://www.linkedin.com/in/naveen-r-545195212/",
      },
      {
        quote:
          "Working with Ganeshguru has been a game-changer. His ability to take ownership of both front-end and back-end tasks made collaboration seamless across teams.",
        name: "Ram Prasanth",
        designation: "Senior Flutter App Engineer at SN Any Device Software Solutions",
        src: "/Images/ramprsanth.jpeg",
        linkedin: "https://www.linkedin.com/in/ram-prasanth-7a506a1a0/",
      },
      {
        quote:
          "What sets Ganesh apart is his problem-solving mindset and calm under pressure. Whether it's optimizing app performance or building features from scratch — he gets it done right.",
        name: "Vignesh",
        designation: "Associate Engineer Development at Aptean",
        src: "/Images/vignesh.jpeg",
        linkedin: "https://www.linkedin.com/in/vigneshkumar-s-8a02a5241/",
      },
      {
        quote:
          "His contributions to our fitness platform were invaluable — from implementing authentication to integrating Google APIs and managing notifications, Ganesh handled it all with precision.",
        name: "Sumanth Srinivas",
        designation: "React Native Developer at Stamin",
        src: "/Images/summanth.jpeg",
        linkedin: "https://www.linkedin.com/in/sumanth-srinivas/",
      },
      {
        quote:
          "Ganeshguru consistently writes clean, testable code and goes the extra mile to ensure stability through unit testing. A dependable team player every organization needs.",
        name: "Vahini Sajal",
        designation: "Software Test Engineer at Stamin",
        src: "/Images/vahini.jpg",
        linkedin: "https://www.linkedin.com/in/vahinisajal030725/",
      },
    ],
  }
}
