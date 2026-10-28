import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
function showMessage(title, message) {
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined"
  ) {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

/* =========================================================
   STUDYPLANNER V7
   =========================================================

   STUDENT
   - School email login
   - No password
   - Student AI

   TEACHER
   - Username + password
   - Homework
   - Teacher knowledge
   - No AI chat

   ADMIN
   - Username + password
   - View accounts
   - Ban / unban accounts
   - View AI reports
   - Manage knowledge
   - Manage homework

   AI
   - Works immediately in Snack
   - Built-in subject tutor
   - Teacher knowledge is optional
   - Optional Gemini endpoint can be connected later

   STORAGE
   - AsyncStorage
   - Local/browser/device storage

========================================================= */


/* =========================================================
   OPTIONAL REAL AI ENDPOINT
   =========================================================

   When you have your Netlify Gemini function ready,
   change this to your Netlify URL.

   Example:

   const AI_ENDPOINT =
     "https://your-site.netlify.app/.netlify/functions/ask-ai";

   Leave it empty for Snack-only built-in AI.

========================================================= */

const AI_ENDPOINT = "";


/* =========================================================
   SUBJECTS
   ========================================================= */

const SUBJECTS = [
  "English",
  "Chinese",
  "HCL",
  "Math",
  "Science",
  "Malay",
  "Physical Education",
  "Innovation & Entrepreneurship",
  "D&T",
  "ICT",
  "History",
  "Geography",
];


/* =========================================================
   STUDENT EMAIL
   ========================================================= */

const STUDENT_EMAIL_REGEX =
  /^[^\s@]+@s202[0-9]\.ssts\.edu\.sg$/i;


/* =========================================================
   TEACHERS
   ========================================================= */

const TEACHERS = {
  /*
   * App-only teacher accounts. Public staff emails below come from the
   * SST staff directory. Passwords are generated for THIS prototype only;
   * they are not SST/MOE account passwords.
   *
   * Permissions are based on the staff member's listed department/role.
   * Where the public directory does not state a specific subject assignment,
   * check the subjects array with the school before real use.
   */
  English: {
    username: "ting_wei_ling_jaslyn@sst.edu.sg",
    password: "TWLJ123!",
    name: "Ting Wei Ling Jaslyn",
    role: "teacher",
    subjects: ["English"],
  },
  Chinese: {
    username: "yap_hui_min@sst.edu.sg",
    password: "YHM123!",
    name: "Yap Hui Min",
    role: "teacher",
    subjects: ["Chinese", "HCL"],
  },
  Math: {
    username: "wong_yoke_chee_jamie@sst.edu.sg",
    password: "WYCJ123!",
    name: "Wong Yoke Chee Jamie",
    role: "teacher",
    subjects: ["Math"],
  },
  Science: {
    username: "leong_woon_foong@sst.edu.sg",
    password: "LLWF123!",
    name: "Lim-Leong Woon Foong",
    role: "teacher",
    subjects: ["Science"],
  },
  Malay: {
    username: "wong_lu_ting@sst.edu.sg",
    password: "WLT123!",
    name: "Wong Lu Ting",
    role: "teacher",
    subjects: ["Malay", "Chinese", "HCL"],
  },
  PE: {
    username: "ng_jun_wei@sst.edu.sg",
    password: "NJW123!",
    name: "Ng Jun Wei",
    role: "teacher",
    subjects: ["Physical Education"],
  },
  IE: {
    username: "mohamed_irfan_darian@sst.edu.sg",
    password: "MID123!",
    name: "Mohamed Irfan Bin Darian",
    role: "teacher",
    subjects: ["Innovation & Entrepreneurship", "D&T"],
  },
  DT: {
    username: "mohamed_irfan_darian@sst.edu.sg",
    password: "MID123!",
    name: "Mohamed Irfan Bin Darian",
    role: "teacher",
    subjects: ["Innovation & Entrepreneurship", "D&T"],
  },
  ICT: {
    username: "sim_yong_seng_stanley@sst.edu.sg",
    password: "SYSS123!",
    name: "Sim Yong Seng Stanley",
    role: "teacher",
    subjects: ["ICT"],
  },
  History: {
    username: "zhang_jiaxin_genevieve@sst.edu.sg",
    password: "ZJG123!",
    name: "Zhang Jiaxin Genevieve",
    role: "teacher",
    subjects: ["History", "Geography"],
  },
  Geography: {
    username: "zhang_jiaxin_genevieve@sst.edu.sg",
    password: "ZJG123!",
    name: "Zhang Jiaxin Genevieve",
    role: "teacher",
    subjects: ["History", "Geography"],
  },
};


/* =========================================================
   TEACHER LOGIN NOTES
   =========================================================

   - Teacher login usernames are case-insensitive SST email addresses.
   - The passwords in this file are local demo credentials for StudyPlanner.
   - They are not connected to SST authentication and must not be reused for
     school systems.
   - Some staff members cover more than one subject in this prototype. If an
     email appears in more than one subject entry, the login merges those
     subject permissions into one account rather than creating duplicate IDs.
   - The public directory lists departments and designations, not every exact
     classroom assignment. Verify the subjects array with SST before using
     this prototype for real school records.

========================================================= */

/* =========================================================
   ADMIN
   ========================================================= */

const ADMIN = {
  username: "admin",
  password: "Admin123!",
  name: "Administrator",
  role: "admin",
  subjects: SUBJECTS,
};


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const KEYS = {
  HOMEWORK: "studyplanner_v7_homework",
  KNOWLEDGE: "studyplanner_v7_knowledge",
  REPORTS: "studyplanner_v7_reports",
  ACCOUNTS: "studyplanner_v7_accounts",
  BANNED: "studyplanner_v7_banned",
  DARK: "studyplanner_v7_dark",
  NOTIFICATIONS: "studyplanner_v7_notifications",
};


/* =========================================================
   DEFAULT KNOWLEDGE
   ========================================================= */

const DEFAULT_KNOWLEDGE = [
  {
    id: "default-math",
    subject: "Math",
    title: "Math Basics",
    content:
      "Mathematics answers should show clear working and check the final result.",
    addedBy: "Built-in",
  },

  {
    id: "default-science",
    subject: "Science",
    title: "Science Basics",
    content:
      "Science answers should identify the concept and explain causes, processes and effects.",
    addedBy: "Built-in",
  },

  {
    id: "default-english",
    subject: "English",
    title: "PEEL",
    content:
      "PEEL means Point, Evidence, Explanation and Link.",
    addedBy: "Built-in",
  },

  {
    id: "default-history",
    subject: "History",
    title: "History Answers",
    content:
      "Strong History answers explain the event, use evidence and explain why the evidence matters.",
    addedBy: "Built-in",
  },

  {
    id: "default-geography",
    subject: "Geography",
    title: "Geography Basics",
    content:
      "Define the geographical concept, explain the process and give a relevant example.",
    addedBy: "Built-in",
  },

  {
    id: "default-chinese",
    subject: "Chinese",
    title: "åŽæ–‡åŸºç¡€",
    content:
      "å›žç­”åŽæ–‡é—®é¢˜æ—¶è¦æ³¨æ„å…³é”®è¯ã€ç»“æž„ã€è¯è¯­å’Œè¯­æ³•ã€‚",
    addedBy: "Built-in",
  },

  {
    id: "default-hcl",
    subject: "HCL",
    title: "é«˜çº§åŽæ–‡åŸºç¡€",
    content:
      "é«˜çº§åŽæ–‡ç­”æ¡ˆåº”è¯¥å‡†ç¡®ã€æœ‰é€»è¾‘å¹¶ä½¿ç”¨é€‚å½“çš„è¯è¯­ã€‚",
    addedBy: "Built-in",
  },
];


/* =========================================================
   HELPERS
   ========================================================= */

function safeArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}


function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


function todayKey() {
  const d = new Date();

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}


/* =========================================================
   MODERATION
   ========================================================= */

const INAPPROPRIATE_PATTERNS = [
  /\b(?:porn|pornography)\b/i,
  /\b(?:nude|nudity)\b/i,
  /\b(?:xxx)\b/i,
  /\b(?:sexual)\b/i,
  /\b(?:fuck|fucking)\b/i,
  /\b(?:kill yourself)\b/i,
  /\b(?:suicide)\b/i,
  /\b(?:self[- ]?harm)\b/i,
];


function isInappropriate(text) {
  return INAPPROPRIATE_PATTERNS.some(
    (pattern) =>
      pattern.test(
        String(text || "")
      )
  );
}


/* =========================================================
   DEFAULT ACCOUNTS
   ========================================================= */

function makeDefaultAccounts() {
  return [
    {
      id: "admin:admin",
      key: "admin",
      username: "admin",
      name: "Administrator",
      role: "admin",
      subjects: SUBJECTS,
      banned: false,
    },

    ...Object.values(
      TEACHERS
    ).filter(
      (teacher, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.username.toLowerCase() ===
            teacher.username.toLowerCase()
        ) === index
    ).map(
      (teacher) => ({
        id:
          `teacher:${teacher.username.toLowerCase()}`,

        key:
          teacher.username.toLowerCase(),

        username:
          teacher.username,

        name:
          teacher.name,

        password:
          teacher.password,

        role:
          "teacher",

        subjects:
          teacher.subjects,

        passwordUpdatedAt: null,

        banned:
          false,
      })
    ),
  ];
}


/* =========================================================
   MATH AI
   ========================================================= */

function mathAI(question) {
  const original =
    String(question || "").trim();

  const q =
    normalizeText(
      original
    );


  if (!original) {
    return "Please type your Maths question.";
  }


  /* BASIC ARITHMETIC */

  const arithmetic =
    original.match(
      /^\s*(-?\d+(?:\.\d+)?)\s*([+\-*/xXÃ—Ã·])\s*(-?\d+(?:\.\d+)?)\s*[?=]?\s*$/
    );


  if (arithmetic) {
    const a =
      Number(
        arithmetic[1]
      );

    const b =
      Number(
        arithmetic[3]
      );

    const operator =
      arithmetic[2];

    let answer;


    if (
      operator === "+"
    ) {
      answer = a + b;
    }


    if (
      operator === "-"
    ) {
      answer = a - b;
    }


    if (
      operator === "*" ||
      operator === "x" ||
      operator === "X" ||
      operator === "Ã—"
    ) {
      answer = a * b;
    }


    if (
      operator === "/" ||
      operator === "Ã·"
    ) {
      if (b === 0) {
        return (
          "Division by zero is undefined."
        );
      }

      answer = a / b;
    }


    return (
      "Let's solve it step by step.\n\n" +
      `${a} ${operator} ${b}\n` +
      `= ${answer}\n\n` +
      `Answer: ${answer}`
    );
  }


  /* PERCENTAGES */

  const percentage =
    original.match(
      /(\d+(?:\.\d+)?)\s*%\s*(?:of)\s*(\d+(?:\.\d+)?)/i
    );


  if (percentage) {
    const percent =
      Number(
        percentage[1]
      );

    const number =
      Number(
        percentage[2]
      );

    const answer =
      (percent / 100) *
      number;


    return (
      `Step 1: Convert ${percent}% into a decimal.\n` +
      `${percent}% = ${percent / 100}\n\n` +
      `Step 2: Multiply by ${number}.\n` +
      `${percent / 100} Ã— ${number} = ${answer}\n\n` +
      `Answer: ${answer}`
    );
  }


  /* LINEAR EQUATION */

  let equation =
    original.match(
      /^\s*(-?\d+(?:\.\d+)?)\s*x\s*([+\-])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)\s*$/i
    );


  if (equation) {
    const a =
      Number(
        equation[1]
      );

    const sign =
      equation[2];

    const b =
      Number(
        equation[3]
      );

    const c =
      Number(
        equation[4]
      );


    const signedB =
      sign === "+"
        ? b
        : -b;


    const x =
      (c - signedB) /
      a;


    return (
      `Equation: ${original}\n\n` +
      `Move the constant term to the other side.\n` +
      `${a}x = ${c - signedB}\n\n` +
      `Divide by ${a}.\n` +
      `x = ${x}\n\n` +
      `Answer: x = ${x}`
    );
  }


  /* SIMPLE EQUATION */

  equation =
    original.match(
      /^\s*x\s*([+\-])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)\s*$/i
    );


  if (equation) {
    const sign =
      equation[1];

    const b =
      Number(
        equation[2]
      );

    const c =
      Number(
        equation[3]
      );


    const x =
      sign === "+"
        ? c - b
        : c + b;


    return (
      `Equation: ${original}\n\n` +
      `x = ${x}\n\n` +
      `Answer: x = ${x}`
    );
  }


  /* FACTORISATION */

  if (
    q.includes("factor") ||
    q.includes("factorise") ||
    q.includes("factorize")
  ) {
    return (
      "Factorisation means rewriting an expression as a product.\n\n" +
      "First look for the greatest common factor.\n\n" +
      "Example:\n" +
      "6x + 9 = 3(2x + 3)\n\n" +
      "For a quadratic, look for two numbers that multiply to the constant term and add to the x coefficient.\n\n" +
      "Paste the exact expression for a more specific solution."
    );
  }


  /* EXPANSION */

  if (
    q.includes("expand") ||
    q.includes("bracket")
  ) {
    return (
      "To expand brackets, multiply each term outside the bracket by every term inside it.\n\n" +
      "Example:\n\n" +
      "3(x + 4)\n" +
      "= 3x + 12"
    );
  }


  /* QUADRATIC */

  if (
    q.includes("quadratic")
  ) {
    return (
      "A quadratic normally has the form:\n\n" +
      "axÂ² + bx + c = 0\n\n" +
      "You can solve it using factorisation, completing the square or the quadratic formula:\n\n" +
      "x = (-b Â± âˆš(bÂ² - 4ac)) / 2a\n\n" +
      "Paste the exact equation and I can identify the method."
    );
  }


  /* AREA */

  if (
    q.includes("area")
  ) {
    if (
      q.includes("rectangle")
    ) {
      return (
        "Rectangle area = length Ã— width.\n\n" +
        "Send the length and width for the exact answer."
      );
    }

    if (
      q.includes("triangle")
    ) {
      return (
        "Triangle area = Â½ Ã— base Ã— height."
      );
    }

    if (
      q.includes("circle")
    ) {
      return (
        "Circle area = Ï€rÂ²."
      );
    }

    return (
      "Identify the shape first, then use its area formula."
    );
  }


  /* VOLUME */

  if (
    q.includes("volume")
  ) {
    return (
      "Cuboid volume = length Ã— width Ã— height.\n\n" +
      "Cylinder volume = Ï€rÂ²h."
    );
  }


  /* DENSITY */

  if (
    q.includes("density")
  ) {
    return (
      "Density = mass Ã· volume.\n\n" +
      "For example:\n" +
      "100 g Ã· 20 cmÂ³ = 5 g/cmÂ³."
    );
  }


  /* FRACTIONS */

  if (
    q.includes("fraction")
  ) {
    return (
      "For fractions:\n\n" +
      "Addition/subtraction â†’ find a common denominator.\n\n" +
      "Multiplication â†’ multiply numerator by numerator and denominator by denominator.\n\n" +
      "Division â†’ multiply by the reciprocal."
    );
  }


  return (
    "I read your Maths question.\n\n" +
    "To give you the exact answer, I need the complete equation, numbers, measurements or diagram details.\n\n" +
    "Paste the full question exactly as it appears."
  );
}


/* =========================================================
   SCIENCE AI
   ========================================================= */

function scienceAI(question) {
  const q =
    normalizeText(
      question
    );


  if (
    q.includes("heat") ||
    q.includes("conduction") ||
    q.includes("convection") ||
    q.includes("radiation")
  ) {
    return (
      "Heat moves from hotter regions to cooler regions.\n\n" +
      "Conduction happens through direct contact.\n\n" +
      "Convection happens through movement in liquids and gases.\n\n" +
      "Radiation transfers energy using electromagnetic waves and does not require a medium."
    );
  }


  if (
    q.includes("density")
  ) {
    return (
      "Density = mass Ã· volume.\n\n" +
      "It tells us how much mass is packed into a certain volume."
    );
  }


  if (
    q.includes("refraction")
  ) {
    return (
      "Refraction is the change in direction of light when it moves from one medium to another because its speed changes."
    );
  }


  if (
    q.includes("force")
  ) {
    return (
      "A force is a push or pull. It can change an object's speed, direction or shape. Force is measured in newtons (N)."
    );
  }


  if (
    q.includes("moment")
  ) {
    return (
      "A moment is the turning effect of a force around a pivot.\n\n" +
      "Moment = force Ã— perpendicular distance from the pivot."
    );
  }


  if (
    q.includes("photosynthesis")
  ) {
    return (
      "Photosynthesis is the process where green plants use light energy to make glucose from carbon dioxide and water. Oxygen is released."
    );
  }


  if (
    q.includes("cell") ||
    q.includes("cells")
  ) {
    return (
      "Cells are the basic units of life.\n\n" +
      "Animal cells commonly contain a nucleus, cytoplasm, cell membrane and mitochondria.\n\n" +
      "Plant cells also have a cell wall, chloroplasts and a large permanent vacuole."
    );
  }


  if (
    q.includes("digestion")
  ) {
    return (
      "Digestion breaks large food molecules into smaller soluble molecules that can be absorbed.\n\n" +
      "Mechanical digestion physically breaks food apart. Chemical digestion uses enzymes."
    );
  }


  if (
    q.includes("reproduction")
  ) {
    return (
      "Reproduction is the process by which organisms produce new organisms. It may be sexual or asexual."
    );
  }


  return (
    "For Science, identify the scientific concept, explain the process, then connect the cause to the effect.\n\n" +
    "Paste the complete question for a more specific explanation."
  );
}


/* =========================================================
   ENGLISH AI
   ========================================================= */

function englishAI(question) {
  const q =
    normalizeText(
      question
    );


  if (
    q.includes("peel")
  ) {
    return (
      "PEEL means:\n\n" +
      "P â€” Point\n" +
      "E â€” Evidence\n" +
      "E â€” Explanation\n" +
      "L â€” Link\n\n" +
      "Make a point, support it with evidence, explain the evidence and link it back to the question."
    );
  }


  if (
    q.includes("anaphora")
  ) {
    return (
      "Anaphora is repetition at the beginning of successive clauses or sentences. It creates emphasis, rhythm and emotional impact."
    );
  }


  if (
    q.includes("metaphor")
  ) {
    return (
      "A metaphor makes a direct comparison without using 'like' or 'as'."
    );
  }


  if (
    q.includes("simile")
  ) {
    return (
      "A simile compares two things using words such as 'like' or 'as'."
    );
  }


  if (
    q.includes("comprehension")
  ) {
    return (
      "For comprehension:\n\n" +
      "1. Identify the keywords in the question.\n" +
      "2. Find the relevant evidence in the passage.\n" +
      "3. Explain your answer clearly.\n" +
      "4. Answer exactly what was asked."
    );
  }


  if (
    q.includes("essay") ||
    q.includes("composition")
  ) {
    return (
      "For a strong essay or composition:\n\n" +
      "1. Understand the question.\n" +
      "2. Plan your main ideas.\n" +
      "3. Organise clear paragraphs.\n" +
      "4. Use specific evidence or examples.\n" +
      "5. Explain your ideas.\n" +
      "6. Check grammar and spelling."
    );
  }


  if (
    q.includes("grammar") ||
    q.includes("tense")
  ) {
    return (
      "Check subject-verb agreement, tense consistency, sentence structure and punctuation."
    );
  }


  return (
    "For English, identify exactly what the question asks, make a clear point, support it with evidence or an example and explain your reasoning."
  );
}


/* =========================================================
   CHINESE AI
   ========================================================= */

function chineseAI(question) {
  const q =
    String(
      question || ""
    );


  const lower =
    q.toLowerCase();


  if (
    lower.includes("email") ||
    q.includes("ç”µé‚®") ||
    q.includes("é‚®ä»¶")
  ) {
    return (
      "å†™ç”µé‚®æ—¶ï¼Œå…ˆç¡®å®šæ”¶ä»¶äººã€ç›®çš„å’Œè¯­æ°”ã€‚\n\n" +
      "æ­£å¼ç”µé‚®è¦æœ‰ç¤¼è²Œã€ç»“æž„æ¸…æ¥šï¼›éžæ­£å¼ç”µé‚®å¯ä»¥æ¯”è¾ƒè‡ªç„¶ã€‚\n\n" +
      "æœ€åŽæ£€æŸ¥æ ¼å¼ã€è¯è¯­å’Œè¯­æ³•ã€‚"
    );
  }


  if (
    q.includes("ä½œæ–‡") ||
    lower.includes("composition")
  ) {
    return (
      "å†™ä½œæ–‡å‰å…ˆç¡®å®šä¸­å¿ƒæ€æƒ³ï¼Œç„¶åŽå®‰æŽ’å¼€å¤´ã€å‘å±•å’Œç»“å°¾ã€‚\n\n" +
      "å¯ä»¥åŠ å…¥äººç‰©çš„åŠ¨ä½œã€è¯­è¨€ã€å¿ƒç†å’ŒçŽ¯å¢ƒæå†™ï¼Œè®©å†…å®¹æ›´åŠ å…·ä½“ã€‚"
    );
  }


  if (
    q.includes("é˜…è¯»") ||
    lower.includes("comprehension")
  ) {
    return (
      "å…ˆæ‰¾å‡ºé¢˜ç›®çš„å…³é”®è¯ï¼Œå†å›žåˆ°æ–‡ç« å¯»æ‰¾ç›¸å…³ä¿¡æ¯ã€‚\n\n" +
      "å›žç­”æ—¶è¦æ ¹æ®é¢˜ç›®è¦æ±‚å®Œæ•´ä½œç­”ï¼Œå¹¶ä½¿ç”¨æ–‡ç« ä¸­çš„è¯æ®æ”¯æŒç­”æ¡ˆã€‚"
    );
  }


  return (
    "å…ˆæ‰¾å‡ºé¢˜ç›®çš„å…³é”®è¯ï¼Œå†ç»„ç»‡å®Œæ•´ã€æœ‰æ¡ç†çš„ç­”æ¡ˆï¼Œå¹¶ä½¿ç”¨åˆé€‚çš„è¯è¯­å’Œä¾‹å­ã€‚"
  );
}


/* =========================================================
   HISTORY AI
   ========================================================= */

function historyAI(question) {
  const q =
    normalizeText(
      question
    );


  if (
    q.includes("source") ||
    q.includes("reliability")
  ) {
    return (
      "For a History source question, consider:\n\n" +
      "1. What does the source say?\n" +
      "2. Who created it?\n" +
      "3. Why was it created?\n" +
      "4. What was happening at the time?\n" +
      "5. What can the source prove?"
    );
  }


  if (
    q.includes("cause") ||
    q.includes("why")
  ) {
    return (
      "For a causes question, identify several factors, explain how each contributed to the event and compare which factors were most important."
    );
  }


  if (
    q.includes("significant") ||
    q.includes("importance")
  ) {
    return (
      "For a significance question, explain what changed, who was affected and why the development mattered."
    );
  }


  return (
    "For History, explain what happened, provide specific evidence and explain why the evidence matters."
  );
}


/* =========================================================
   GEOGRAPHY AI
   ========================================================= */

function geographyAI(question) {
  const q =
    normalizeText(
      question
    );


  if (
    q.includes("weather") ||
    q.includes("climate")
  ) {
    return (
      "Weather describes short-term atmospheric conditions.\n\n" +
      "Climate describes long-term patterns of weather."
    );
  }


  if (
    q.includes("sustainable") ||
    q.includes("sustainability")
  ) {
    return (
      "Sustainability means meeting present needs while protecting resources and opportunities for future generations."
    );
  }


  if (
    q.includes("food waste")
  ) {
    return (
      "Food waste can be caused by over-purchasing, poor storage, large portions and food being rejected during production or retail.\n\n" +
      "Reducing food waste saves resources and improves resource efficiency."
    );
  }


  return (
    "For Geography, define the key term, explain the process, give a relevant example and link the example back to the question."
  );
}


/* =========================================================
   BUILT-IN AI ROUTER
   ========================================================= */

function builtInAI(
  subject,
  question,
  knowledge
) {
  let answer;


  switch (
    subject
  ) {
    case "Math":
      answer =
        mathAI(
          question
        );
      break;

    case "Science":
      answer =
        scienceAI(
          question
        );
      break;

    case "English":
      answer =
        englishAI(
          question
        );
      break;

    case "Chinese":
    case "HCL":
      answer =
        chineseAI(
          question
        );
      break;

    case "History":
      answer =
        historyAI(
          question
        );
      break;

    case "Geography":
      answer =
        geographyAI(
          question
        );
      break;

    case "ICT":
      answer =
        "For ICT, identify the input, processing and output. Then explain how the algorithm or technology solves the problem.";
      break;

    case "D&T":
      answer =
        "For D&T, identify the design problem, user needs and constraints. Then explain the suitable materials, processes, testing and improvements.";
      break;

    case "Physical Education":
      answer =
        "For PE, identify the fitness component, movement skill or health concept, then explain the relevant principle and give an example.";
      break;

    case "Innovation & Entrepreneurship":
      answer =
        "Start with the problem and target user. Then explain the proposed solution, value, testing and feasibility.";
      break;

    case "Malay":
      answer =
        "Kenal pasti kata kunci dalam soalan, kemudian jawab dengan ayat yang lengkap dan jelas. Berikan huraian atau contoh yang sesuai.";
      break;

    default:
      answer =
        "Identify the key concept, explain it clearly and give an example.";
  }


  /*
   OPTIONAL TEACHER KNOWLEDGE
   */

  const relevant =
    safeArray(
      knowledge
    )
      .filter(
        (item) =>
          item.subject ===
          subject &&
          item.addedBy !==
            "Built-in"
      )
      .slice(
        0,
        3
      );


  if (
    relevant.length >
    0
  ) {
    answer +=
      "\n\nTeacher knowledge:\n\n" +
      relevant
        .map(
          (item) =>
            `â€¢ ${item.title}: ${item.content}`
        )
        .join(
          "\n\n"
        );
  }


  return answer;
}


/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [
    loginMode,
    setLoginMode,
  ] = useState(
    "student"
  );


  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    null
  );


  const [
    page,
    setPage,
  ] = useState(
    "home"
  );


  const [
    homework,
    setHomework,
  ] = useState(
    []
  );


  const [
    knowledge,
    setKnowledge,
  ] = useState(
    DEFAULT_KNOWLEDGE
  );


  const [
    reports,
    setReports,
  ] = useState(
    []
  );


  const [
    accounts,
    setAccounts,
  ] = useState(
    makeDefaultAccounts()
  );


  const [
    bannedAccounts,
    setBannedAccounts,
  ] = useState(
    []
  );


  const [
    darkMode,
    setDarkMode,
  ] = useState(
    false
  );


  const [
    notifications,
    setNotifications,
  ] = useState(
    true
  );


  const [
    ready,
    setReady,
  ] = useState(
    false
  );


  useEffect(() => {
    loadData();
  }, []);


  /* =======================================================
     LOAD DATA
     ======================================================= */

  async function loadData() {
    try {
      const savedHomework =
        await AsyncStorage.getItem(
          KEYS.HOMEWORK
        );

      const savedKnowledge =
        await AsyncStorage.getItem(
          KEYS.KNOWLEDGE
        );

      const savedReports =
        await AsyncStorage.getItem(
          KEYS.REPORTS
        );

      const savedAccounts =
        await AsyncStorage.getItem(
          KEYS.ACCOUNTS
        );

      const savedBanned =
        await AsyncStorage.getItem(
          KEYS.BANNED
        );

      const savedDark =
        await AsyncStorage.getItem(
          KEYS.DARK
        );

      const savedNotifications =
        await AsyncStorage.getItem(
          KEYS.NOTIFICATIONS
        );


      if (
        savedHomework
      ) {
        setHomework(
          safeArray(
            JSON.parse(
              savedHomework
            )
          )
        );
      }


      if (
        savedKnowledge
      ) {
        setKnowledge(
          safeArray(
            JSON.parse(
              savedKnowledge
            )
          )
        );
      }


      if (
        savedReports
      ) {
        setReports(
          safeArray(
            JSON.parse(
              savedReports
            )
          )
        );
      }


      if (
        savedAccounts
      ) {
        const saved =
          safeArray(
            JSON.parse(
              savedAccounts
            )
          );

        const defaults =
          makeDefaultAccounts();

        const merged = defaults.map((defaultItem) => {
          const savedItem = saved.find((item) => item.id === defaultItem.id);
          return savedItem ? { ...defaultItem, ...savedItem } : defaultItem;
        }).concat(
          saved.filter((savedItem) => !defaults.some((defaultItem) => defaultItem.id === savedItem.id))
        );

        setAccounts(
          merged
        );
      }


      if (
        savedBanned
      ) {
        setBannedAccounts(
          safeArray(
            JSON.parse(
              savedBanned
            )
          )
        );
      }


      if (
        savedDark !==
        null
      ) {
        setDarkMode(
          Boolean(
            JSON.parse(
              savedDark
            )
          )
        );
      }


      if (
        savedNotifications !==
        null
      ) {
        setNotifications(
          Boolean(
            JSON.parse(
              savedNotifications
            )
          )
        );
      }

    } catch (
      error
    ) {
      console.log(
        "Load error",
        error
      );
    }


    setReady(
      true
    );
  }


  /* =======================================================
     SAVE
     ======================================================= */

  useEffect(() => {
    if (!ready)
      return;

    AsyncStorage.setItem(
      KEYS.HOMEWORK,
      JSON.stringify(
        homework
      )
    );
  }, [
    homework,
    ready,
  ]);


  useEffect(() => {
    if (!ready)
      return;

    AsyncStorage.setItem(
      KEYS.KNOWLEDGE,
      JSON.stringify(
        knowledge
      )
    );
  }, [
    knowledge,
    ready,
  ]);


  useEffect(() => {
    if (!ready)
      return;

    AsyncStorage.setItem(
      KEYS.REPORTS,
      JSON.stringify(
        reports
      )
    );
  }, [
    reports,
    ready,
  ]);


  useEffect(() => {
    if (!ready)
      return;

    AsyncStorage.setItem(
      KEYS.ACCOUNTS,
      JSON.stringify(
        accounts
      )
    );
  }, [
    accounts,
    ready,
  ]);


  useEffect(() => {
    if (!ready)
      return;

    AsyncStorage.setItem(
      KEYS.BANNED,
      JSON.stringify(
        bannedAccounts
      )
    );
  }, [
    bannedAccounts,
    ready,
  ]);


  /* =======================================================
     LOGIN
     ======================================================= */

  function studentLogin(
    email
  ) {
    const clean =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();


    if (
      !STUDENT_EMAIL_REGEX.test(
        clean
      )
    ) {
      Alert.alert(
        "Invalid student email",
        "Use an email such as student@s2026.ssts.edu.sg."
      );

      return;
    }


    if (
      bannedAccounts.includes(
        clean
      )
    ) {
      Alert.alert(
        "Account banned",
        "This account has been banned by the administrator."
      );

      return;
    }


    const student =
      {
        id:
          `student:${clean}`,

        key:
          clean,

        email:
          clean,

        name:
          clean.split(
            "@"
          )[0],

        role:
          "student",

        subjects:
          SUBJECTS,

        banned:
          false,
      };


    setAccounts(
      (old) => {
        const list =
          safeArray(
            old
          );

        if (
          list.some(
            (item) =>
              item.id ===
              student.id
          )
        ) {
          return list;
        }

        return [
          ...list,
          student,
        ];
      }
    );


    setCurrentUser(
      student
    );

    setPage(
      "home"
    );
  }


  function teacherLogin(
    username,
    password
  ) {
    const clean =
      String(
        username || ""
      ).trim();

    const key =
      clean.toLowerCase();


    /* ADMIN */

    if (
      key ===
      ADMIN.username
    ) {
      if (
        password !==
        ADMIN.password
      ) {
        Alert.alert(
          "Login failed",
          "Incorrect admin password."
        );

        return;
      }


      setCurrentUser({
        ...ADMIN,

        id:
          "admin:admin",

        key:
          "admin",

        banned:
          false,
      });


      setPage(
        "home"
      );

      return;
    }


    /* TEACHER */

    const matchingTeachers =
      Object.values(TEACHERS).filter(
        (item) => item.username.toLowerCase() === key
      );
    const savedTeacher = safeArray(accounts).find(
      (item) => item.role === "teacher" && String(item.username || "").toLowerCase() === key
    );
    const teacher = matchingTeachers.length
      ? {
          ...matchingTeachers[0],
          ...(savedTeacher || {}),
          username: matchingTeachers[0].username,
          name: savedTeacher?.name || matchingTeachers[0].name,
          password: savedTeacher?.password || matchingTeachers[0].password,
          subjects: [...new Set(matchingTeachers.flatMap((item) => item.subjects || []))],
        }
      : null;


    if (!teacher) {
      showMessage(
  "Login failed",
  "Teacher account not found."
);

      return;
    }


    if (
      teacher.password !==
      password
    ) {
      Alert.alert(
        "Login failed",
        "Incorrect teacher password."
      );

      return;
    }


    if (
      bannedAccounts.includes(
        key
      )
    ) {
      Alert.alert(
        "Account banned",
        "This teacher account has been banned by the administrator."
      );

      return;
    }


    const teacherUser =
      {
        ...teacher,

        id:
          `teacher:${key}`,

        key,

        banned:
          false,
      };


    setAccounts(
      (old) => {
        const list =
          safeArray(
            old
          );

        const existingIndex = list.findIndex(
          (item) => item.id === teacherUser.id
        );
        if (existingIndex >= 0) {
          return list.map((item, index) => index === existingIndex
            ? { ...item, ...teacherUser, password: teacherUser.password || item.password }
            : item
          );
        }

        return [
          ...list,
          teacherUser,
        ];
      }
    );


    setCurrentUser(
      teacherUser
    );

    setPage(
      "home"
    );
  }


  /* =======================================================
     LOGOUT
     ======================================================= */

  function logout() {
    setCurrentUser(
      null
    );

    setPage(
      "home"
    );

    setLoginMode(
      "student"
    );
  }


  /* =======================================================
     BAN / UNBAN
     ======================================================= */

  function toggleAccountBan(
    account
  ) {
    if (
      currentUser?.role !==
      "admin"
    ) {
      return;
    }


    const key =
      String(
        account.key ||
          account.email ||
          account.username ||
          ""
      )
        .trim()
        .toLowerCase();


    if (
      !key ||
      key ===
        ADMIN.username
    ) {
      Alert.alert(
        "Not allowed",
        "The administrator account cannot be banned."
      );

      return;
    }


    const currentlyBanned =
      bannedAccounts.includes(
        key
      );


    if (
      currentlyBanned
    ) {
      setBannedAccounts(
        (old) =>
          safeArray(
            old
          ).filter(
            (item) =>
              item !==
              key
          )
      );

      setAccounts(
        (old) =>
          safeArray(
            old
          ).map(
            (item) =>
              item.key ===
              key
                ? {
                    ...item,
                    banned:
                      false,
                  }
                : item
          )
      );

    } else {

      setBannedAccounts(
        (old) => [
          ...safeArray(
            old
          ),
          key,
        ]
      );

      setAccounts(
        (old) =>
          safeArray(
            old
          ).map(
            (item) =>
              item.key ===
              key
                ? {
                    ...item,
                    banned:
                      true,
                  }
                : item
          )
      );
    }
  }


  /* =======================================================
     HOMEWORK
     ======================================================= */

  function addHomework(
    item
  ) {
    setHomework(
      (old) => [
        ...safeArray(
          old
        ),
        item,
      ]
    );
  }


  function deleteHomework(
    id
  ) {
    setHomework(
      (old) =>
        safeArray(
          old
        ).filter(
          (item) =>
            item.id !==
            id
        )
    );
  }


  /* =======================================================
     MODERATION REPORT
     ======================================================= */

  function reportMessage(
    message
  ) {
    const report =
      {
        id:
          `${Date.now()}-${Math.random()}`,

        type:
          "AI moderation",

        student:
          currentUser?.email ||
          "Unknown",

        message,

        date:
          new Date().toISOString(),

        status:
          "unread",
      };


    setReports(
      (old) => [
        report,
        ...safeArray(
          old
        ),
      ]
    );
  }


  /* =======================================================
     LOADING
     ======================================================= */

  if (!ready) {
    return (
      <SafeAreaView
        style={
          styles.loading
        }
      >

        <Text
          style={
            styles.loadingEmoji
          }
        >
          ðŸ“š
        </Text>


        <Text
          style={
            styles.loadingTitle
          }
        >
          StudyPlanner
        </Text>


        <Text>
          Loading...
        </Text>

      </SafeAreaView>
    );
  }


  /* =======================================================
     LOGIN
     ======================================================= */

  if (!currentUser) {
    return (
      <LoginScreen
        mode={
          loginMode
        }
        setMode={
          setLoginMode
        }
        onStudentLogin={
          studentLogin
        }
       onPress={() => {
  console.log("Teacher Login button clicked");
  onTeacherLogin(username, password);
}}
      />
    );
  }


  /* =======================================================
     MAIN APP
     ======================================================= */

  return (
    <SafeAreaView
      style={[
        styles.app,
        darkMode &&
          styles.darkApp,
      ]}
    >

      <StatusBar
        barStyle={
          darkMode
            ? "light-content"
            : "dark-content"
        }
      />


      <View
        style={[
          styles.topBar,
          darkMode &&
            styles.darkCard,
        ]}
      >

        <View>

          <Text
            style={[
              styles.appTitle,
              darkMode &&
                styles.darkText,
            ]}
          >
            StudyPlanner
          </Text>


          <Text
            style={[
              styles.userText,
              darkMode &&
                styles.darkSecondary,
            ]}
          >
            {
              currentUser.name
            }
          </Text>

        </View>


        <TouchableOpacity
          style={
            styles.logoutButton
          }
          onPress={
            logout
          }
        >

          <Text
            style={
              styles.logoutText
            }
          >
            Logout
          </Text>

        </TouchableOpacity>

      </View>


      <View
        style={
          styles.content
        }
      >

        {page ===
          "home" && (
          <HomePage
            user={
              currentUser
            }
            homework={
              homework
            }
            setPage={
              setPage
            }
          />
        )}


        {page ===
          "homework" && (
          <HomeworkPage
            user={
              currentUser
            }
            homework={
              homework
            }
            onAdd={
              addHomework
            }
            onDelete={
              deleteHomework
            }
          />
        )}


        {page ===
          "calendar" && (
          <CalendarPage
            homework={
              homework
            }
          />
        )}


        {page ===
          "ai" &&
          currentUser.role ===
            "student" && (
          <AIPage
            knowledge={
              knowledge
            }
            onReport={
              reportMessage
            }
          />
        )}


        {page ===
          "knowledge" &&
          currentUser.role !==
            "student" && (
          <KnowledgePage
            user={
              currentUser
            }
            knowledge={
              knowledge
            }
            setKnowledge={
              setKnowledge
            }
          />
        )}


        {page ===
          "reports" &&
          currentUser.role ===
            "admin" && (
          <ReportsPage
            reports={
              reports
            }
            setReports={
              setReports
            }
          />
        )}


        {page ===
          "accounts" &&
          currentUser.role ===
            "admin" && (
          <AccountsPage
            accounts={
              accounts
            }
            bannedAccounts={
              bannedAccounts
            }
            onToggleBan={
              toggleAccountBan
            }
          />
        )}


        {page ===
          "settings" && (
          <SettingsPage
            user={
              currentUser
            }
            darkMode={
              darkMode
            }
            notifications={
              notifications
            }
            setDarkMode={
              updateDarkMode
            }
            setNotifications={
              updateNotifications
            }
            onChangePassword={
              updateTeacherPassword
            }
          />
        )}

      </View>


      <NavigationBar
        page={
          page
        }
        setPage={
          setPage
        }
        user={
          currentUser
        }
        reportCount={
          reports.filter(
            (item) =>
              item.status ===
              "unread"
          ).length
        }
      />

    </SafeAreaView>
  );


  async function updateTeacherPassword(user, currentPassword, newPassword) {
    const key = String(user?.username || user?.key || "").trim().toLowerCase();
    const existing = safeArray(accounts).find(
      (item) => item.role === "teacher" && String(item.username || "").toLowerCase() === key
    );
    const activePassword = existing?.password || user?.password;
    if (activePassword !== currentPassword) {
      Alert.alert("Password not changed", "Your current password is incorrect.");
      return;
    }
    const updatedAt = new Date().toISOString();
    const updatedAccounts = safeArray(accounts).map((item) =>
      item.role === "teacher" && String(item.username || "").toLowerCase() === key
        ? { ...item, password: newPassword, passwordUpdatedAt: updatedAt }
        : item
    );
    // Also update the active session so the new password can be used immediately.
    setAccounts(updatedAccounts);
    setCurrentUser((old) => old && old.role === "teacher" && String(old.username || "").toLowerCase() === key
      ? { ...old, password: newPassword, passwordUpdatedAt: updatedAt }
      : old
    );
    try {
      await AsyncStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(updatedAccounts));
      Alert.alert("Password updated", "Your new password is saved. The admin Accounts page will reflect this update on this installation.");
    } catch (error) {
      Alert.alert("Could not save password", "Please try again.");
    }
  }

  async function updateDarkMode(
    value
  ) {
    setDarkMode(
      value
    );

    await AsyncStorage.setItem(
      KEYS.DARK,
      JSON.stringify(
        value
      )
    );
  }


  async function updateNotifications(
    value
  ) {
    setNotifications(
      value
    );

    await AsyncStorage.setItem(
      KEYS.NOTIFICATIONS,
      JSON.stringify(
        value
      )
    );
  }
}


/* =========================================================
   LOGIN
   ========================================================= */

function LoginScreen({
  mode,
  setMode,
  onStudentLogin,
  onTeacherLogin,
}) {
  const [
    email,
    setEmail,
  ] = useState("");


  const [
    username,
    setUsername,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  return (
    <SafeAreaView
      style={
        styles.loginContainer
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.loginContent
        }
        keyboardShouldPersistTaps="handled"
      >

        <Text
          style={
            styles.loginLogo
          }
        >
          ðŸ“š
        </Text>


        <Text
          style={
            styles.loginTitle
          }
        >
          StudyPlanner
        </Text>


        <Text
          style={
            styles.loginSubtitle
          }
        >
          School planner â€¢ Homework â€¢ AI study help
        </Text>


        <View
          style={
            styles.loginSwitch
          }
        >

          <TouchableOpacity
            style={[
              styles.loginSwitchButton,
              mode ===
                "student" &&
                styles.loginSelected,
            ]}
            onPress={() =>
              setMode(
                "student"
              )
            }
          >

            <Text>
              ðŸŽ“ Student
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.loginSwitchButton,
              mode ===
                "teacher" &&
                styles.loginSelected,
            ]}
            onPress={() =>
              setMode(
                "teacher"
              )
            }
          >

            <Text>
              ðŸ‘©â€ðŸ« Teacher
            </Text>

          </TouchableOpacity>

        </View>


        {mode ===
        "student" ? (

          <View
            style={
              styles.loginCard
            }
          >

            <Text
              style={
                styles.cardTitle
              }
            >
              Student Login
            </Text>


            <Text
              style={
                styles.cardDescription
              }
            >
              Enter your school email. No password is required.
            </Text>


            <Text
              style={
                styles.inputLabel
              }
            >
              School Email
            </Text>


            <TextInput
              value={
                email
              }
              onChangeText={
                setEmail
              }
              placeholder="name@s2026.ssts.edu.sg"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={
                false
              }
              style={
                styles.input
              }
            />


            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={() =>
                onStudentLogin(
                  email
                )
              }
            >

              <Text
                style={
                  styles.primaryText
                }
              >
                Continue
              </Text>

            </TouchableOpacity>


            <Text
              style={
                styles.helperText
              }
            >
              Example:
              student@s2026.ssts.edu.sg
            </Text>

          </View>

        ) : (

          <View
            style={
              styles.loginCard
            }
          >

            <Text
              style={
                styles.cardTitle
              }
            >
              Teacher / Admin Login
            </Text>


            <Text
              style={
                styles.inputLabel
              }
            >
              Username
            </Text>


            <TextInput
              value={
                username
              }
              onChangeText={
                setUsername
              }
              autoCapitalize="none"
              autoCorrect={
                false
              }
              style={
                styles.input
              }
            />


            <Text
              style={
                styles.inputLabel
              }
            >
              Password
            </Text>


            <TextInput
              value={
                password
              }
              onChangeText={
                setPassword
              }
              secureTextEntry
              style={
                styles.input
              }
            />


            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={() =>
                onTeacherLogin(
                  username,
                  password
                )
              }
            >

              <Text
                style={
                  styles.primaryText
                }
              >
                Login
              </Text>

            </TouchableOpacity>


            <Text
              style={
                styles.helperText
              }
            >
              Admin: admin / Admin123!
            </Text>

          </View>

        )}

      </ScrollView>

    </SafeAreaView>
  );
}


/* =========================================================
   HOME
   ========================================================= */

function HomePage({
  user,
  homework,
  setPage,
}) {
  const upcoming =
    safeArray(
      homework
    )
      .filter(
        (item) =>
          !item.completed
      )
      .sort(
        (a, b) =>
          String(
            a.dueDate
          ).localeCompare(
            String(
              b.dueDate
            )
          )
      )
      .slice(
        0,
        5
      );


  return (
    <ScrollView
      contentContainerStyle={
        styles.page
      }
    >

      <Text
        style={
          styles.pageTitle
        }
      >
        Welcome ðŸ‘‹
      </Text>


      <Text
        style={
          styles.pageSubtitle
        }
      >
        {user.role ===
        "student"
          ? user.email
          : user.name}
      </Text>


      <View
        style={
          styles.grid
        }
      >

        <DashboardCard
          icon="ðŸ“"
          title="Homework"
          value={
            homework.length
          }
          onPress={() =>
            setPage(
              "homework"
            )
          }
        />


        <DashboardCard
          icon="ðŸ“…"
          title="Calendar"
          value="View"
          onPress={() =>
            setPage(
              "calendar"
            )
          }
        />


        {user.role ===
          "student" && (

          <DashboardCard
            icon="ðŸ¤–"
            title="Study AI"
            value="Ask"
            onPress={() =>
              setPage(
                "ai"
              )
            }
          />

        )}


        {user.role !==
          "student" && (

          <DashboardCard
            icon="ðŸ§ "
            title="AI Knowledge"
            value="Manage"
            onPress={() =>
              setPage(
                "knowledge"
              )
            }
          />

        )}


        {user.role ===
          "admin" && (

          <DashboardCard
            icon="ðŸ‘¥"
            title="Accounts"
            value="Manage"
            onPress={() =>
              setPage(
                "accounts"
              )
            }
          />

        )}


        {user.role ===
          "admin" && (

          <DashboardCard
            icon="ðŸš¨"
            title="Reports"
            value="View"
            onPress={() =>
              setPage(
                "reports"
              )
            }
          />

        )}

      </View>


      <Text
        style={
          styles.sectionTitle
        }
      >
        Upcoming Homework
      </Text>


      {upcoming.length ===
      0 ? (

        <EmptyState
          text="No upcoming homework."
        />

      ) : (

        upcoming.map(
          (item) => (
            <HomeworkCard
              key={
                item.id
              }
              item={
                item
              }
            />
          )
        )

      )}

    </ScrollView>
  );
}


/* =========================================================
   DASHBOARD CARD
   ========================================================= */

function DashboardCard({
  icon,
  title,
  value,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={
        styles.dashboardCard
      }
      onPress={
        onPress
      }
      activeOpacity={
        0.8
      }
    >

      <Text
        style={
          styles.dashboardIcon
        }
      >
        {
          icon
        }
      </Text>


      <Text
        style={
          styles.dashboardTitle
        }
      >
        {
          title
        }
      </Text>


      <Text
        style={
          styles.dashboardValue
        }
      >
        {
          String(
            value
          )
        }
      </Text>

    </TouchableOpacity>
  );
}


/* =========================================================
   HOMEWORK
   ========================================================= */

function HomeworkPage({
  user,
  homework,
  onAdd,
  onDelete,
}) {
  const [
    visible,
    setVisible,
  ] = useState(
    false
  );


  return (
    <View
      style={
        styles.flex
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <View
          style={
            styles.rowBetween
          }
        >

          <View>

            <Text
              style={
                styles.pageTitle
              }
            >
              ðŸ“ Homework
            </Text>


            <Text
              style={
                styles.pageSubtitle
              }
            >
              Homework and assignments.
            </Text>

          </View>


          {user.role !==
            "student" && (

            <TouchableOpacity
              style={
                styles.smallButton
              }
              onPress={() =>
                setVisible(
                  true
                )
              }
            >
              <Text
                style={
                  styles.smallButtonText
                }
              >
                + Add
              </Text>
            </TouchableOpacity>

          )}

        </View>


        {homework.length ===
        0 ? (

          <EmptyState
            text="No homework has been added."
          />

        ) : (

          homework
            .slice()
            .sort(
              (a, b) =>
                String(
                  a.dueDate
                ).localeCompare(
                  String(
                    b.dueDate
                  )
                )
            )
            .map(
              (item) => (
                <HomeworkCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  canDelete={
                    user.role !==
                    "student"
                  }
                  onDelete={() =>
                    onDelete(
                      item.id
                    )
                  }
                />
              )
            )

        )}

      </ScrollView>


      <AddHomeworkModal
        visible={
          visible
        }
        user={
          user
        }
        onClose={() =>
          setVisible(
            false
          )
        }
        onAdd={(item) => {
          onAdd(
            item
          );

          setVisible(
            false
          );
        }}
      />

    </View>
  );
}


/* =========================================================
   HOMEWORK CARD
   ========================================================= */

function HomeworkCard({
  item,
  canDelete = false,
  onDelete,
}) {
  return (
    <View
      style={
        styles.homeworkCard
      }
    >

      <Text
        style={
          styles.homeworkTitle
        }
      >
        {
          item.title
        }
      </Text>


      <Text
        style={
          styles.subjectBadge
        }
      >
        {
          item.subject
        }
      </Text>


      <Text
        style={
          styles.homeworkDescription
        }
      >
        {
          item.description
        }
      </Text>


      <Text
        style={
          styles.dueDate
        }
      >
        ðŸ“… Due:{" "}
        {
          item.dueDate
        }
      </Text>


      <Text
        style={
          styles.createdBy
        }
      >
        Added by:{" "}
        {
          item.createdBy
        }
      </Text>


      {canDelete &&
        onDelete && (

        <TouchableOpacity
          style={
            styles.deleteButton
          }
          onPress={
            onDelete
          }
        >

          <Text
            style={
              styles.deleteText
            }
          >
            Delete
          </Text>

        </TouchableOpacity>

      )}

    </View>
  );
}


/* =========================================================
   ADD HOMEWORK MODAL
   ========================================================= */

function AddHomeworkModal({
  visible,
  onClose,
  onAdd,
  user,
}) {
  const subjects =
    user.role ===
    "admin"
      ? SUBJECTS
      : safeArray(
          user.subjects
        );


  const [
    subject,
    setSubject,
  ] = useState(
    subjects[0] ||
      SUBJECTS[0]
  );


  const [
    title,
    setTitle,
  ] = useState("");


  const [
    description,
    setDescription,
  ] = useState("");


  const [
    dueDate,
    setDueDate,
  ] = useState("");


  function save() {
    if (
      !title.trim() ||
      !description.trim() ||
      !dueDate.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Please complete every field."
      );

      return;
    }


    onAdd({
      id:
        `${Date.now()}-${Math.random()}`,

      title:
        title.trim(),

      description:
        description.trim(),

      subject,

      dueDate:
        dueDate.trim(),

      createdBy:
        user.name ||
        user.email,

      createdAt:
        new Date().toISOString(),

      completed:
        false,
    });


    setTitle("");
    setDescription("");
    setDueDate("");
  }


  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      onRequestClose={
        onClose
      }
    >

      <View
        style={
          styles.modalBackground
        }
      >

        <View
          style={
            styles.modalCard
          }
        >

          <ScrollView>

            <Text
              style={
                styles.modalTitle
              }
            >
              Add Homework
            </Text>


            <Text
              style={
                styles.inputLabel
              }
            >
              Title
            </Text>


            <TextInput
              value={
                title
              }
              onChangeText={
                setTitle
              }
              placeholder="Homework title"
              style={
                styles.input
              }
            />


            <Text
              style={
                styles.inputLabel
              }
            >
              Subject
            </Text>


            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
            >

              {subjects.map(
                (item) => (

                  <TouchableOpacity
                    key={
                      item
                    }
                    style={[
                      styles.subjectChoice,
                      subject ===
                        item &&
                        styles.selectedSubject,
                    ]}
                    onPress={() =>
                      setSubject(
                        item
                      )
                    }
                  >

                    <Text
                      style={
                        subject ===
                        item
                          ? styles.selectedSubjectText
                          : styles.subjectChoiceText
                      }
                    >
                      {
                        item
                      }
                    </Text>

                  </TouchableOpacity>

                )
              )}

            </ScrollView>


            <Text
              style={
                styles.inputLabel
              }
            >
              Description
            </Text>


            <TextInput
              value={
                description
              }
              onChangeText={
                setDescription
              }
              placeholder="What needs to be done?"
              multiline
              style={[
                styles.input,
                styles.textArea,
              ]}
            />


            <Text
              style={
                styles.inputLabel
              }
            >
              Due Date
            </Text>


            <TextInput
              value={
                dueDate
              }
              onChangeText={
                setDueDate
              }
              placeholder="YYYY-MM-DD"
              style={
                styles.input
              }
            />


            <View
              style={
                styles.modalButtons
              }
            >

              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={
                  onClose
                }
              >
                <Text>
                  Cancel
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={
                  save
                }
              >

                <Text
                  style={
                    styles.primaryText
                  }
                >
                  Add Homework
                </Text>

              </TouchableOpacity>

            </View>

          </ScrollView>

        </View>

      </View>

    </Modal>
  );
}


/* =========================================================
   CALENDAR
   ========================================================= */

function CalendarPage({
  homework,
}) {
  const dates =
    useMemo(
      () =>
        [
          ...new Set(
            safeArray(
              homework
            ).map(
              (item) =>
                item.dueDate
            )
          ),
        ].sort(),
      [homework]
    );


  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    ""
  );


  const selected =
    homework.filter(
      (item) =>
        item.dueDate ===
        selectedDate
    );


  return (
    <ScrollView
      contentContainerStyle={
        styles.page
      }
    >

      <Text
        style={
          styles.pageTitle
        }
      >
        ðŸ“… Calendar
      </Text>


      <Text
        style={
          styles.pageSubtitle
        }
      >
        Homework deadlines.
      </Text>


      {dates.length ===
      0 ? (

        <EmptyState
          text="No deadlines yet."
        />

      ) : (

        dates.map(
          (date) => (

            <TouchableOpacity
              key={
                date
              }
              style={[
                styles.calendarDate,
                selectedDate ===
                  date &&
                  styles.selectedCalendarDate,
              ]}
              onPress={() =>
                setSelectedDate(
                  date
                )
              }
            >

              <Text
                style={
                  styles.calendarDateText
                }
              >
                {
                  date
                }
              </Text>

              <Text>
                {
                  homework.filter(
                    (item) =>
                      item.dueDate ===
                      date
                  ).length
                }{" "}
                homework item(s)
              </Text>

            </TouchableOpacity>

          )
        )

      )}


      {selectedDate &&
        selected.map(
          (item) => (
            <HomeworkCard
              key={
                item.id
              }
              item={
                item
              }
            />
          )
        )}

    </ScrollView>
  );
}


/* =========================================================
   AI PAGE
   ========================================================= */

function AIPage({
  knowledge,
  onReport,
}) {
  const [
    subject,
    setSubject,
  ] = useState(
    "Math"
  );


  const [
    input,
    setInput,
  ] = useState(
    ""
  );


  const [
    loading,
    setLoading,
  ] = useState(
    false
  );


  const [
    messages,
    setMessages,
  ] = useState([
    {
      id:
        "welcome",

      sender:
        "ai",

      text:
        "Hi! Ask me your homework question. I will read the question and explain it as clearly as possible.",
    },
  ]);


  async function askRealAI(
    question
  ) {
    if (!AI_ENDPOINT) {
      return builtInAI(
        subject,
        question,
        knowledge
      );
    }


    const teacherKnowledge =
      safeArray(
        knowledge
      )
        .filter(
          (item) =>
            item.subject ===
            subject
        )
        .slice(
          0,
          10
        );


    const response =
      await fetch(
        AI_ENDPOINT,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              question,
              subject,
              teacherKnowledge,
            }),
        }
      );


    const data =
      await response.json();


    if (!response.ok) {
      throw new Error(
        data.error ||
          "AI request failed."
      );
    }


    return (
      data.answer ||
      builtInAI(
        subject,
        question,
        knowledge
      )
    );
  }


  async function sendMessage() {
    const question =
      input.trim();


    if (!question ||
        loading) {
      return;
    }


    if (
      isInappropriate(
        question
      )
    ) {
      onReport(
        question
      );

      setInput("");


      Alert.alert(
        "Message removed",
        "This message was blocked and reported to the administrator."
      );

      return;
    }


    setMessages(
      (old) => [
        ...old,

        {
          id:
            `${Date.now()}-student`,

          sender:
            "student",

          text:
            question,
        },
      ]
    );


    setInput("");
    setLoading(
      true
    );


    try {
      const answer =
        await askRealAI(
          question
        );


      setMessages(
        (old) => [
          ...old,

          {
            id:
              `${Date.now()}-ai`,

            sender:
              "ai",

            text:
              answer,
          },
        ]
      );

    } catch (
      error
    ) {

      setMessages(
        (old) => [
          ...old,

          {
            id:
              `${Date.now()}-error`,

            sender:
              "ai",

            text:
              "I could not connect to the online AI. I can still use the built-in tutor â€” try asking a more specific question.",
          },
        ]
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  return (
    <KeyboardAvoidingView
      style={
        styles.flex
      }
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
          : undefined
      }
    >

      <View
        style={
          styles.aiHeader
        }
      >

        <Text
          style={
            styles.pageTitle
          }
        >
          ðŸ¤– Study AI
        </Text>


        <Text
          style={
            styles.pageSubtitle
          }
        >
          {AI_ENDPOINT
            ? "Online AI enabled"
            : "Built-in Snack AI"}
        </Text>

      </View>


      <ScrollView
        style={
          styles.chat
        }
        contentContainerStyle={
          styles.chatContent
        }
      >

        {messages.map(
          (message) => (

            <View
              key={
                message.id
              }
              style={[
                styles.message,
                message.sender ===
                  "student"
                  ? styles.studentMessage
                  : styles.aiMessage,
              ]}
            >

              <Text
                style={
                  styles.messageSender
                }
              >
                {message.sender ===
                "student"
                  ? "You"
                  : "StudyPlanner AI"}
              </Text>


              <Text
                style={
                  styles.messageText
                }
              >
                {
                  message.text
                }
              </Text>

            </View>

          )
        )}


        {loading && (

          <View
            style={
              styles.aiMessage
            }
          >

            <Text
              style={
                styles.messageSender
              }
            >
              StudyPlanner AI
            </Text>


            <Text
              style={
                styles.messageText
              }
            >
              Reading your question...
            </Text>

          </View>

        )}

      </ScrollView>


      <View
        style={
          styles.subjectBar
        }
      >

        <Text
          style={
            styles.subjectLabel
          }
        >
          Subject
        </Text>


        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >

          {SUBJECTS.map(
            (item) => (

              <TouchableOpacity
                key={
                  item
                }
                style={[
                  styles.aiSubject,
                  subject ===
                    item &&
                    styles.selectedAISubject,
                ]}
                onPress={() =>
                  setSubject(
                    item
                  )
                }
              >

                <Text
                  style={
                    subject ===
                    item
                      ? styles.selectedAISubjectText
                      : styles.aiSubjectText
                  }
                >
                  {
                    item
                  }
                </Text>

              </TouchableOpacity>

            )
          )}

        </ScrollView>

      </View>


      <View
        style={
          styles.chatInputRow
        }
      >

        <TextInput
          value={
            input
          }
          onChangeText={
            setInput
          }
          placeholder="Ask your full homework question..."
          multiline
          editable={
            !loading
          }
          style={
            styles.chatInput
          }
        />


        <TouchableOpacity
          style={[
            styles.sendButton,
            loading &&
              styles.disabledButton,
          ]}
          onPress={
            sendMessage
          }
          disabled={
            loading
          }
        >

          <Text
            style={
              styles.sendText
            }
          >
            âž¤
          </Text>

        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>
  );
}


/* =========================================================
   KNOWLEDGE PAGE
   ========================================================= */

function KnowledgePage({
  user,
  knowledge,
  setKnowledge,
}) {
  const [
    visible,
    setVisible,
  ] = useState(
    false
  );


  const visibleKnowledge =
    user.role ===
    "admin"
      ? knowledge
      : knowledge.filter(
          (item) =>
            safeArray(
              user.subjects
            ).includes(
              item.subject
            )
        );


  function deleteKnowledge(
    id
  ) {
    Alert.alert(
      "Delete knowledge?",
      "Remove this knowledge entry?",
      [
        {
          text:
            "Cancel",
          style:
            "cancel",
        },

        {
          text:
            "Delete",

          style:
            "destructive",

          onPress: () =>
            setKnowledge(
              (old) =>
                old.filter(
                  (item) =>
                    item.id !==
                    id
                )
            ),
        },
      ]
    );
  }


  return (
    <View
      style={
        styles.flex
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <View
          style={
            styles.rowBetween
          }
        >

          <View
            style={{
              flex: 1,
            }}
          >

            <Text
              style={
                styles.pageTitle
              }
            >
              ðŸ§  AI Knowledge
            </Text>


            <Text
              style={
                styles.pageSubtitle
              }
            >
              Teacher knowledge is optional. The built-in AI works without it.
            </Text>

          </View>


          <TouchableOpacity
            style={
              styles.smallButton
            }
            onPress={() =>
              setVisible(
                true
              )
            }
          >

            <Text
              style={
                styles.smallButtonText
              }
            >
              + Add
            </Text>

          </TouchableOpacity>

        </View>


        {visibleKnowledge.length ===
        0 ? (

          <EmptyState
            text="No knowledge."
          />

        ) : (

          visibleKnowledge.map(
            (item) => (

              <View
                key={
                  item.id
                }
                style={
                  styles.knowledgeCard
                }
              >

                <Text
                  style={
                    styles.knowledgeSubject
                  }
                >
                  {
                    item.subject
                  }
                </Text>


                <Text
                  style={
                    styles.knowledgeTitle
                  }
                >
                  {
                    item.title
                  }
                </Text>


                <Text
                  style={
                    styles.knowledgeContent
                  }
                >
                  {
                    item.content
                  }
                </Text>


                <Text
                  style={
                    styles.createdBy
                  }
                >
                  Added by{" "}
                  {
                    item.addedBy
                  }
                </Text>


                {item.addedBy !==
                  "Built-in" && (

                  <TouchableOpacity
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      deleteKnowledge(
                        item.id
                      )
                    }
                  >

                    <Text
                      style={
                        styles.deleteText
                      }
                    >
                      Delete
                    </Text>

                  </TouchableOpacity>

                )}

              </View>

            )
          )

        )}

      </ScrollView>


      <AddKnowledgeModal
        visible={
          visible
        }
        user={
          user
        }
        onClose={() =>
          setVisible(
            false
          )
        }
        onAdd={(item) => {

          setKnowledge(
            (old) => [
              ...old,
              item,
            ]
          );

          setVisible(
            false
          );

        }}
      />

    </View>
  );
}


/* =========================================================
   ADD KNOWLEDGE MODAL
   ========================================================= */

function AddKnowledgeModal({
  visible,
  user,
  onClose,
  onAdd,
}) {
  const subjects =
    user.role ===
    "admin"
      ? SUBJECTS
      : safeArray(
          user.subjects
        );


  const [
    subject,
    setSubject,
  ] = useState(
    subjects[0]
  );


  const [
    title,
    setTitle,
  ] = useState(
    ""
  );


  const [
    content,
    setContent,
  ] = useState(
    ""
  );


  function save() {
    if (
      !title.trim() ||
      !content.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Enter a topic and knowledge."
      );

      return;
    }


    onAdd({
      id:
        `${Date.now()}-${Math.random()}`,

      subject,

      title:
        title.trim(),

      content:
        content.trim(),

      addedBy:
        user.name,

      date:
        new Date().toISOString(),
    });


    setTitle("");
    setContent("");
  }


  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      onRequestClose={
        onClose
      }
    >

      <View
        style={
          styles.modalBackground
        }
      >

        <View
          style={
            styles.modalCard
          }
        >

          <ScrollView>

            <Text
              style={
                styles.modalTitle
              }
            >
              Add AI Knowledge
            </Text>


            <Text
              style={
                styles.inputLabel
              }
            >
              Subject
            </Text>


            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
            >

              {subjects.map(
                (item) => (

                  <TouchableOpacity
                    key={
                      item
                    }
                    style={[
                      styles.subjectChoice,
                      subject ===
                        item &&
                        styles.selectedSubject,
                    ]}
                    onPress={() =>
                      setSubject(
                        item
                      )
                    }
                  >

                    <Text
                      style={
                        subject ===
                        item
                          ? styles.selectedSubjectText
                          : styles.subjectChoiceText
                      }
                    >
                      {
                        item
                      }
                    </Text>

                  </TouchableOpacity>

                )
              )}

            </ScrollView>


            <Text
              style={
                styles.inputLabel
              }
            >
              Topic
            </Text>


            <TextInput
              value={
                title
              }
              onChangeText={
                setTitle
              }
              placeholder="Topic"
              style={
                styles.input
              }
            />


            <Text
              style={
                styles.inputLabel
              }
            >
              Knowledge
            </Text>


            <TextInput
              value={
                content
              }
              onChangeText={
                setContent
              }
              placeholder="Enter useful information for the AI..."
              multiline
              style={[
                styles.input,
                styles.textArea,
              ]}
            />


            <View
              style={
                styles.modalButtons
              }
            >

              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={
                  onClose
                }
              >
                <Text>
                  Cancel
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={
                  save
                }
              >

                <Text
                  style={
                    styles.primaryText
                  }
                >
                  Save
                </Text>

              </TouchableOpacity>

            </View>

          </ScrollView>

        </View>

      </View>

    </Modal>
  );
}


/* =========================================================
   ACCOUNTS PAGE
   ========================================================= */

function AccountsPage({
  accounts,
  bannedAccounts,
  onToggleBan,
}) {
  const safeAccounts =
    safeArray(
      accounts
    );


  const students =
    safeAccounts.filter(
      (item) =>
        item.role ===
        "student"
    ).length;


  const teachers =
    safeAccounts.filter(
      (item) =>
        item.role ===
        "teacher"
    ).length;


  return (
    <ScrollView
      contentContainerStyle={
        styles.page
      }
    >

      <Text
        style={
          styles.pageTitle
        }
      >
        ðŸ‘¥ Accounts
      </Text>


      <Text
        style={
          styles.pageSubtitle
        }
      >
        View all accounts stored by this installation.
      </Text>


      <View
        style={
          styles.accountSummary
        }
      >

        <View
          style={
            styles.summaryBox
          }
        >
          <Text
            style={
              styles.summaryNumber
            }
          >
            {
              safeAccounts.length
            }
          </Text>

          <Text
            style={
              styles.summaryLabel
            }
          >
            Total
          </Text>
        </View>


        <View
          style={
            styles.summaryBox
          }
        >
          <Text
            style={
              styles.summaryNumber
            }
          >
            {
              students
            }
          </Text>

          <Text
            style={
              styles.summaryLabel
            }
          >
            Students
          </Text>
        </View>


        <View
          style={
            styles.summaryBox
          }
        >
          <Text
            style={
              styles.summaryNumber
            }
          >
            {
              teachers
            }
          </Text>

          <Text
            style={
              styles.summaryLabel
            }
          >
            Teachers
          </Text>
        </View>


        <View
          style={
            styles.summaryBox
          }
        >
          <Text
            style={[
              styles.summaryNumber,
              styles.summaryDanger,
            ]}
          >
            {
              bannedAccounts.length
            }
          </Text>

          <Text
            style={
              styles.summaryLabel
            }
          >
            Banned
          </Text>
        </View>

      </View>


      <View
        style={
          styles.accountManageCard
        }
      >

        <View
          style={{
            flex: 1,
          }}
        >

          <Text
            style={
              styles.accountManageName
            }
          >
            ðŸ‘‘ Administrator
          </Text>


          <Text
            style={
              styles.accountText
            }
          >
            Username: admin
          </Text>


          <Text
            style={
              styles.protectedText
            }
          >
            PROTECTED
          </Text>

        </View>

      </View>


      {safeAccounts
        .filter(
          (account) =>
            account.id !==
            "admin:admin"
        )
        .map(
          (account) => {

            const key =
              String(
                account.key ||
                  ""
              )
                .toLowerCase()
                .trim();


            const banned =
              safeArray(
                bannedAccounts
              ).includes(
                key
              );


            return (
              <View
                key={
                  account.id
                }
                style={
                  styles.accountManageCard
                }
              >

                <View
                  style={{
                    flex: 1,
                  }}
                >

                  <Text
                    style={
                      styles.accountManageName
                    }
                  >
                    {
                      account.name ||
                      account.email ||
                      account.username
                    }
                  </Text>


                  <Text
                    style={
                      styles.accountText
                    }
                  >
                    Role:{" "}
                    {
                      account.role
                    }
                  </Text>


                  {account.email && (
                    <Text
                      style={
                        styles.accountText
                      }
                    >
                      Email:{" "}
                      {
                        account.email
                      }
                    </Text>
                  )}


                  {account.username && (
                    <Text
                      style={
                        styles.accountText
                      }
                    >
                      Username:{" "}
                      {
                        account.username
                      }
                    </Text>
                  )}


                  {account.role === "teacher" && (
                    <Text style={styles.accountText}>
                      Password: {account.passwordUpdatedAt ? `Updated ${new Date(account.passwordUpdatedAt).toLocaleDateString()}` : "Default password"}
                    </Text>
                  )}

                  <Text
                    style={[
                      styles.accountStatus,
                      banned &&
                        styles.accountBanned,
                    ]}
                  >
                    {banned
                      ? "BANNED"
                      : "ACTIVE"}
                  </Text>

                </View>


                <TouchableOpacity
                  style={
                    banned
                      ? styles.unbanButton
                      : styles.banButton
                  }
                  onPress={() =>
                    onToggleBan(
                      account
                    )
                  }
                >

                  <Text
                    style={
                      styles.primaryText
                    }
                  >
                    {banned
                      ? "Unban"
                      : "Ban"}
                  </Text>

                </TouchableOpacity>

              </View>
            );
          }
        )}

    </ScrollView>
  );
}


/* =========================================================
   REPORTS PAGE
   ========================================================= */

function ReportsPage({
  reports,
  setReports,
}) {
  return (
    <ScrollView
      contentContainerStyle={
        styles.page
      }
    >

      <View
        style={
          styles.rowBetween
        }
      >

        <View
          style={{
            flex: 1,
          }}
        >

          <Text
            style={
              styles.pageTitle
            }
          >
            ðŸš¨ AI Reports
          </Text>


          <Text
            style={
              styles.pageSubtitle
            }
          >
            Messages blocked by moderation.
          </Text>

        </View>


        {reports.length >
          0 && (

          <TouchableOpacity
            style={
              styles.smallButton
            }
            onPress={() =>
              setReports(
                []
              )
            }
          >

            <Text
              style={
                styles.smallButtonText
              }
            >
              Clear
            </Text>

          </TouchableOpacity>

        )}

      </View>


      {reports.length ===
      0 ? (

        <EmptyState
          text="No reports."
        />

      ) : (

        reports.map(
          (report) => (

            <View
              key={
                report.id
              }
              style={
                styles.reportCard
              }
            >

              <Text
                style={
                  styles.reportType
                }
              >
                {
                  report.type
                }
              </Text>


              <Text
                style={
                  styles.accountText
                }
              >
                Student:{" "}
                {
                  report.student
                }
              </Text>


              <Text
                style={
                  styles.reportMessage
                }
              >
                {
                  report.message
                }
              </Text>


              <Text
                style={
                  styles.createdBy
                }
              >
                {
                  report.date
                }
              </Text>

            </View>

          )
        )

      )}

    </ScrollView>
  );
}


/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function SettingsPage({
  user,
  darkMode,
  notifications,
  setDarkMode,
  setNotifications,
  onChangePassword,
}) {
  const [currentPassword, setCurrentPassword] = useState(
    ""
  );
  const [newPassword, setNewPassword] = useState(
    ""
  );
  const [confirmPassword, setConfirmPassword] = useState(
    ""
  );

  function saveNewPassword() {
    if (user.role !== "teacher") return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing details", "Fill in all password fields.");
      return;
    }
    if (currentPassword !== user.password) {
      Alert.alert("Password not changed", "Your current password is incorrect.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match", "Enter the same new password twice.");
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert("Choose a new password", "Your new password must be different.");
      return;
    }
    onChangePassword(user, currentPassword, newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <ScrollView
      contentContainerStyle={
        styles.page
      }
    >

      <Text
        style={
          styles.pageTitle
        }
      >
        âš™ï¸ Settings
      </Text>


      <View
        style={
          styles.settingsCard
        }
      >

        <View
          style={
            styles.settingRow
          }
        >

          <View
            style={{
              flex: 1,
            }}
          >

            <Text
              style={
                styles.settingTitle
              }
            >
              Dark Mode
            </Text>


            <Text
              style={
                styles.settingDescription
              }
            >
              Change the app appearance.
            </Text>

          </View>


          <Switch
            value={
              darkMode
            }
            onValueChange={
              setDarkMode
            }
          />

        </View>


        <View
          style={
            styles.divider
          }
        />


        <View
          style={
            styles.settingRow
          }
        >

          <View
            style={{
              flex: 1,
            }}
          >

            <Text
              style={
                styles.settingTitle
              }
            >
              Notifications
            </Text>


            <Text
              style={
                styles.settingDescription
              }
            >
              Homework reminder preference.
            </Text>

          </View>


          <Switch
            value={
              notifications
            }
            onValueChange={
              setNotifications
            }
          />

        </View>

      </View>


      {user.role === "teacher" && (
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <Text style={styles.settingDescription}>You can change your password here. Your email / username cannot be changed. The admin account list will show that your password was updated.</Text>
          <Text style={styles.accountText}>Current password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.accountText}>New password (at least 8 characters)</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.accountText}>Confirm new password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={saveNewPassword}>
            <Text style={styles.primaryButtonText}>Save New Password</Text>
          </TouchableOpacity>
        </View>
      )}

      <View
        style={
          styles.accountCard
        }
      >

        <Text
          style={
            styles.cardTitle
          }
        >
          Account
        </Text>


        <Text
          style={
            styles.accountText
          }
        >
          Name:{" "}
          {
            user.name
          }
        </Text>


        <Text
          style={
            styles.accountText
          }
        >
          Role:{" "}
          {
            user.role
          }
        </Text>


        <Text
          style={
            styles.accountText
          }
        >
          {user.email ||
            user.username}
        </Text>

      </View>

    </ScrollView>
  );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function NavigationBar({
  page,
  setPage,
  user,
  reportCount,
}) {
  const items = [
    {
      id:
        "home",
      icon:
        "ðŸ ",
      label:
        "Home",
    },

    {
      id:
        "homework",
      icon:
        "ðŸ“",
      label:
        "Homework",
    },

    {
      id:
        "calendar",
      icon:
        "ðŸ“…",
      label:
        "Calendar",
    },
  ];


  if (
    user.role ===
    "student"
  ) {
    items.push({
      id:
        "ai",
      icon:
        "ðŸ¤–",
      label:
        "AI",
    });
  }


  if (
    user.role !==
    "student"
  ) {
    items.push({
      id:
        "knowledge",
      icon:
        "ðŸ§ ",
      label:
        "Knowledge",
    });
  }


  if (
    user.role ===
    "admin"
  ) {

    items.push({
      id:
        "accounts",
      icon:
        "ðŸ‘¥",
      label:
        "Accounts",
    });


    items.push({
      id:
        "reports",
      icon:
        "ðŸš¨",
      label:
        reportCount
          ? `Reports (${reportCount})`
          : "Reports",
    });

  }


  items.push({
    id:
      "settings",
    icon:
      "âš™ï¸",
    label:
      "Settings",
  });


  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      style={
        styles.navigation
      }
      contentContainerStyle={
        styles.navigationContent
      }
    >

      {items.map(
        (item) => (

          <TouchableOpacity
            key={
              item.id
            }
            style={[
              styles.navItem,
              page ===
                item.id &&
                styles.navSelected,
            ]}
            onPress={() =>
              setPage(
                item.id
              )
            }
          >

            <Text
              style={
                styles.navIcon
              }
            >
              {
                item.icon
              }
            </Text>


            <Text
              style={[
                styles.navLabel,
                page ===
                  item.id &&
                  styles.navLabelSelected,
              ]}
            >
              {
                item.label
              }
            </Text>

          </TouchableOpacity>

        )
      )}

    </ScrollView>
  );
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyState({
  text,
}) {
  return (
    <View
      style={
        styles.empty
      }
    >

      <Text
        style={
          styles.emptyEmoji
        }
      >
        ðŸ“­
      </Text>


      <Text
        style={
          styles.emptyText
        }
      >
        {
          text
        }
      </Text>

    </View>
  );
}


/* =========================================================
   STYLES
   ========================================================= */

const styles =
  StyleSheet.create({

    app: {
      flex: 1,
      backgroundColor:
        "#f4f7fb",
    },

    darkApp: {
      backgroundColor:
        "#111827",
    },

    flex: {
      flex: 1,
    },

    content: {
      flex: 1,
    },

    loading: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#f4f7fb",
    },

    loadingEmoji: {
      fontSize:
        50,
    },

    loadingTitle: {
      fontSize:
        28,
      fontWeight:
        "900",
      marginVertical:
        8,
    },

    topBar: {
      backgroundColor:
        "#fff",
      paddingHorizontal:
        18,
      paddingVertical:
        14,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      borderBottomWidth:
        1,
      borderBottomColor:
        "#e5e7eb",
    },

    darkCard: {
      backgroundColor:
        "#1f2937",
      borderBottomColor:
        "#374151",
    },

    appTitle: {
      fontSize:
        22,
      fontWeight:
        "800",
      color:
        "#111827",
    },

    userText: {
      color:
        "#6b7280",
      marginTop:
        2,
    },

    darkText: {
      color:
        "#f9fafb",
    },

    darkSecondary: {
      color:
        "#d1d5db",
    },

    logoutButton: {
      backgroundColor:
        "#fee2e2",
      paddingHorizontal:
        13,
      paddingVertical:
        9,
      borderRadius:
        10,
    },

    logoutText: {
      color:
        "#b91c1c",
      fontWeight:
        "700",
    },

    page: {
      padding:
        18,
      paddingBottom:
        35,
    },

    pageTitle: {
      fontSize:
        27,
      fontWeight:
        "800",
      color:
        "#111827",
      marginBottom:
        5,
    },

    pageSubtitle: {
      color:
        "#6b7280",
      lineHeight:
        20,
      marginBottom:
        18,
    },

    grid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        12,
      marginBottom:
        24,
    },

    dashboardCard: {
      width:
        "47%",
      minHeight:
        135,
      backgroundColor:
        "#fff",
      borderRadius:
        18,
      padding:
        16,
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
    },

    dashboardIcon: {
      fontSize:
        30,
    },

    dashboardTitle: {
      marginTop:
        9,
      color:
        "#111827",
      fontWeight:
        "700",
    },

    dashboardValue: {
      marginTop:
        5,
      color:
        "#2563eb",
      fontWeight:
        "900",
    },

    sectionTitle: {
      fontSize:
        20,
      fontWeight:
        "800",
      marginBottom:
        12,
    },

    rowBetween: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      gap:
        10,
      marginBottom:
        10,
    },

    smallButton: {
      backgroundColor:
        "#2563eb",
      paddingHorizontal:
        14,
      paddingVertical:
        10,
      borderRadius:
        10,
    },

    smallButtonText: {
      color:
        "#fff",
      fontWeight:
        "800",
    },

    primaryButton: {
      backgroundColor:
        "#2563eb",
      paddingHorizontal:
        16,
      paddingVertical:
        12,
      borderRadius:
        10,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    primaryText: {
      color:
        "#fff",
      fontWeight:
        "800",
    },

    homeworkCard: {
      backgroundColor:
        "#fff",
      borderRadius:
        16,
      padding:
        16,
      marginBottom:
        12,
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
    },

    homeworkTitle: {
      fontSize:
        18,
      fontWeight:
        "800",
      color:
        "#111827",
      marginBottom:
        8,
    },

    subjectBadge: {
      alignSelf:
        "flex-start",
      backgroundColor:
        "#dbeafe",
      color:
        "#1d4ed8",
      paddingHorizontal:
        9,
      paddingVertical:
        4,
      borderRadius:
        8,
      overflow:
        "hidden",
      fontSize:
        12,
      fontWeight:
        "800",
    },

    homeworkDescription: {
      marginTop:
        12,
      color:
        "#374151",
      lineHeight:
        21,
    },

    dueDate: {
      marginTop:
        12,
      color:
        "#4b5563",
      fontWeight:
        "600",
    },

    createdBy: {
      marginTop:
        5,
      color:
        "#9ca3af",
      fontSize:
        12,
    },

    deleteButton: {
      alignSelf:
        "flex-start",
      marginTop:
        12,
      paddingHorizontal:
        12,
      paddingVertical:
        8,
      backgroundColor:
        "#fee2e2",
      borderRadius:
        9,
    },

    deleteText: {
      color:
        "#b91c1c",
      fontWeight:
        "700",
    },

    modalBackground: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,.45)",
      justifyContent:
        "flex-end",
    },

    modalCard: {
      backgroundColor:
        "#fff",
      maxHeight:
        "90%",
      borderTopLeftRadius:
        24,
      borderTopRightRadius:
        24,
      padding:
        20,
    },

    modalTitle: {
      fontSize:
        23,
      fontWeight:
        "800",
      marginBottom:
        14,
    },

    inputLabel: {
      fontWeight:
        "700",
      color:
        "#374151",
      marginTop:
        12,
      marginBottom:
        7,
    },

    input: {
      backgroundColor:
        "#fff",
      borderWidth:
        1,
      borderColor:
        "#d1d5db",
      borderRadius:
        11,
      paddingHorizontal:
        12,
      paddingVertical:
        11,
      fontSize:
        16,
    },

    textArea: {
      minHeight:
        110,
      textAlignVertical:
        "top",
    },

    subjectChoice: {
      borderWidth:
        1,
      borderColor:
        "#d1d5db",
      borderRadius:
        9,
      paddingHorizontal:
        10,
      paddingVertical:
        8,
      marginRight:
        7,
      marginBottom:
        8,
    },

    selectedSubject: {
      backgroundColor:
        "#dbeafe",
      borderColor:
        "#2563eb",
    },

    subjectChoiceText: {
      color:
        "#374151",
    },

    selectedSubjectText: {
      color:
        "#1d4ed8",
      fontWeight:
        "800",
    },

    modalButtons: {
      flexDirection:
        "row",
      justifyContent:
        "flex-end",
      gap:
        10,
      marginTop:
        18,
    },

    cancelButton: {
      backgroundColor:
        "#e5e7eb",
      borderRadius:
        10,
      paddingHorizontal:
        15,
      paddingVertical:
        12,
    },

    calendarDate: {
      backgroundColor:
        "#fff",
      borderRadius:
        14,
      padding:
        15,
      marginBottom:
        10,
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
    },

    selectedCalendarDate: {
      backgroundColor:
        "#eff6ff",
      borderColor:
        "#2563eb",
    },

    calendarDateText: {
      fontSize:
        17,
      fontWeight:
        "800",
      marginBottom:
        4,
    },

    aiHeader: {
      padding:
        18,
      backgroundColor:
        "#fff",
      borderBottomWidth:
        1,
      borderBottomColor:
        "#e5e7eb",
    },

    chat: {
      flex: 1,
    },

    chatContent: {
      padding:
        16,
    },

    message: {
      maxWidth:
        "90%",
      padding:
        14,
      borderRadius:
        17,
      marginBottom:
        12,
    },

    studentMessage: {
      alignSelf:
        "flex-end",
      backgroundColor:
        "#dbeafe",
    },

    aiMessage: {
      alignSelf:
        "flex-start",
      backgroundColor:
        "#fff",
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
    },

    messageSender: {
      fontSize:
        12,
      fontWeight:
        "800",
      color:
        "#4b5563",
      marginBottom:
        6,
    },

    messageText: {
      fontSize:
        16,
      lineHeight:
        24,
      color:
        "#111827",
    },

    subjectBar: {
      backgroundColor:
        "#fff",
      padding:
        10,
      borderTopWidth:
        1,
      borderTopColor:
        "#e5e7eb",
    },

    subjectLabel: {
      fontWeight:
        "800",
      marginBottom:
        6,
    },

    aiSubject: {
      backgroundColor:
        "#f3f4f6",
      paddingHorizontal:
        10,
      paddingVertical:
        7,
      borderRadius:
        9,
      marginRight:
        6,
    },

    selectedAISubject: {
      backgroundColor:
        "#2563eb",
    },

    aiSubjectText: {
      color:
        "#374151",
      fontSize:
        12,
    },

    selectedAISubjectText: {
      color:
        "#fff",
      fontWeight:
        "800",
      fontSize:
        12,
    },

    chatInputRow: {
      flexDirection:
        "row",
      gap:
        8,
      alignItems:
        "flex-end",
      padding:
        10,
      backgroundColor:
        "#fff",
    },

    chatInput: {
      flex: 1,
      minHeight:
        46,
      maxHeight:
        120,
      borderWidth:
        1,
      borderColor:
        "#d1d5db",
      borderRadius:
        13,
      paddingHorizontal:
        12,
      paddingVertical:
        10,
    },

    sendButton: {
      width:
        46,
      height:
        46,
      borderRadius:
        23,
      backgroundColor:
        "#2563eb",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    disabledButton: {
      opacity:
        0.5,
    },

    sendText: {
      color:
        "#fff",
      fontSize:
        20,
      fontWeight:
        "800",
    },

    knowledgeCard: {
      backgroundColor:
        "#fff",
      borderRadius:
        16,
      padding:
        16,
      marginBottom:
        12,
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
    },

    knowledgeSubject: {
      color:
        "#2563eb",
      fontWeight:
        "800",
      marginBottom:
        5,
    },

    knowledgeTitle: {
      fontSize:
        18,
      fontWeight:
        "800",
      marginBottom:
        8,
    },

    knowledgeContent: {
      color:
        "#374151",
      lineHeight:
        21,
    },

    accountSummary: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        10,
      marginBottom:
        16,
    },

    summaryBox: {
      backgroundColor:
        "#fff",
      borderRadius:
        14,
      padding:
        14,
      minWidth:
        100,
      flexGrow:
        1,
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
    },

    summaryNumber: {
      fontSize:
        23,
      fontWeight:
        "900",
      color:
        "#2563eb",
    },

    summaryDanger: {
      color:
        "#dc2626",
    },

    summaryLabel: {
      marginTop:
        4,
      color:
        "#6b7280",
    },

    accountManageCard: {
      backgroundColor:
        "#fff",
      borderRadius:
        15,
      padding:
        16,
      marginBottom:
        12,
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        12,
    },

    accountManageName: {
      fontSize:
        17,
      fontWeight:
        "800",
      color:
        "#111827",
    },

    accountText: {
      color:
        "#6b7280",
      marginTop:
        4,
    },

    accountStatus: {
      color:
        "#16a34a",
      marginTop:
        8,
      fontWeight:
        "900",
    },

    accountBanned: {
      color:
        "#dc2626",
    },

    protectedText: {
      color:
        "#7c3aed",
      fontWeight:
        "900",
      marginTop:
        8,
      fontSize:
        12,
    },

    banButton: {
      backgroundColor:
        "#dc2626",
      paddingHorizontal:
        14,
      paddingVertical:
        10,
      borderRadius:
        10,
    },

    unbanButton: {
      backgroundColor:
        "#16a34a",
      paddingHorizontal:
        14,
      paddingVertical:
        10,
      borderRadius:
        10,
    },

    reportCard: {
      backgroundColor:
        "#fff",
      borderRadius:
        14,
      padding:
        15,
      marginBottom:
        10,
      borderWidth:
        1,
      borderColor:
        "#fecaca",
    },

    reportType: {
      color:
        "#dc2626",
      fontWeight:
        "900",
    },

    reportMessage: {
      marginTop:
        8,
      color:
        "#374151",
      lineHeight:
        20,
    },

    settingsCard: {
      backgroundColor:
        "#fff",
      borderRadius:
        16,
      padding:
        16,
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
      marginBottom:
        15,
    },

    settingRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    settingTitle: {
      fontSize:
        16,
      fontWeight:
        "800",
    },

    settingDescription: {
      marginTop:
        3,
      color:
        "#6b7280",
      lineHeight:
        19,
    },

    divider: {
      height:
        1,
      backgroundColor:
        "#e5e7eb",
      marginVertical:
        15,
    },

    accountCard: {
      backgroundColor:
        "#fff",
      borderRadius:
        16,
      padding:
        16,
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
    },

    navigation: {
      maxHeight:
        72,
      backgroundColor:
        "#fff",
      borderTopWidth:
        1,
      borderTopColor:
        "#e5e7eb",
    },

    navigationContent: {
      paddingHorizontal:
        8,
      paddingVertical:
        8,
      gap:
        6,
    },

    navItem: {
      minWidth:
        78,
      paddingVertical:
        8,
      paddingHorizontal:
        9,
      borderRadius:
        10,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    navSelected: {
      backgroundColor:
        "#dbeafe",
    },

    navIcon: {
      fontSize:
        19,
    },

    navLabel: {
      fontSize:
        11,
      color:
        "#374151",
      marginTop:
        3,
    },

    navLabelSelected: {
      color:
        "#1d4ed8",
      fontWeight:
        "800",
    },

    empty: {
      backgroundColor:
        "#fff",
      borderRadius:
        16,
      padding:
        35,
      alignItems:
        "center",
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
    },

    emptyEmoji: {
      fontSize:
        30,
      marginBottom:
        8,
    },

    emptyText: {
      color:
        "#6b7280",
      textAlign:
        "center",
    },

    loginContainer: {
      flex: 1,
      backgroundColor:
        "#eef4ff",
    },

    loginContent: {
      flexGrow:
        1,
      width:
        "100%",
      maxWidth:
        600,
      alignSelf:
        "center",
      padding:
        24,
      justifyContent:
        "center",
    },

    loginLogo: {
      fontSize:
        56,
      textAlign:
        "center",
    },

    loginTitle: {
      fontSize:
        34,
      fontWeight:
        "900",
      textAlign:
        "center",
      color:
        "#111827",
      marginTop:
        8,
    },

    loginSubtitle: {
      textAlign:
        "center",
      color:
        "#6b7280",
      marginTop:
        5,
      marginBottom:
        22,
    },

    loginSwitch: {
      flexDirection:
        "row",
      backgroundColor:
        "#fff",
      borderRadius:
        13,
      padding:
        4,
      marginBottom:
        14,
    },

    loginSwitchButton: {
      flex: 1,
      alignItems:
        "center",
      paddingVertical:
        11,
      borderRadius:
        10,
    },

    loginSelected: {
      backgroundColor:
        "#dbeafe",
    },

    loginCard: {
      backgroundColor:
        "#fff",
      borderRadius:
        20,
      padding:
        20,
      borderWidth:
        1,
      borderColor:
        "#e5e7eb",
    },

    cardTitle: {
      fontSize:
        22,
      fontWeight:
        "800",
    },

    cardDescription: {
      color:
        "#6b7280",
      marginTop:
        5,
      marginBottom:
        8,
    },

    helperText: {
      color:
        "#6b7280",
      fontSize:
        12,
      marginTop:
        12,
      lineHeight:
        18,
    },

  });
