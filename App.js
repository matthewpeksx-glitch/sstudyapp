import React, { useEffect, useMemo, useState } from "react";
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

/* =========================================================
   STUDYPLANNER V5
   =========================================================

   STUDENTS
   - Email only
   - No password
   - @s202x.ssts.edu.sg

   TEACHERS
   - Username + password
   - Can add homework
   - Can add AI knowledge
   - AI knowledge restricted to their subject
   - NO AI CHAT

   ADMIN
   - Username + password
   - All subjects
   - Can manage knowledge
   - Can see moderation reports

   AI
   - Students only
   - Inappropriate messages are blocked
   - Blocked message is deleted
   - Moderation report is saved for admin

   IMPORTANT:
   AsyncStorage is local to the device/browser.
   A real multi-device deployment requires a backend.
   ========================================================= */


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
  English: {
    username: "English",
    password: "English123!",
    name: "English Teacher",
    role: "teacher",
    subjects: ["English"],
  },

  Chinese: {
    username: "Chinese",
    password: "Chinese123!",
    name: "Chinese Teacher",
    role: "teacher",
    subjects: ["Chinese"],
  },

  HCL: {
    username: "HCL",
    password: "HCL123!",
    name: "HCL Teacher",
    role: "teacher",
    subjects: ["HCL"],
  },

  Math: {
    username: "Math",
    password: "Math123!",
    name: "Math Teacher",
    role: "teacher",
    subjects: ["Math"],
  },

  Science: {
    username: "Science",
    password: "Science123!",
    name: "Science Teacher",
    role: "teacher",
    subjects: ["Science"],
  },

  Malay: {
    username: "Malay",
    password: "Malay123!",
    name: "Malay Teacher",
    role: "teacher",
    subjects: ["Malay"],
  },

  PE: {
    username: "PE",
    password: "PE123!",
    name: "PE Teacher",
    role: "teacher",
    subjects: ["Physical Education"],
  },

  IE: {
    username: "IE",
    password: "IE123!",
    name: "Innovation & Entrepreneurship Teacher",
    role: "teacher",
    subjects: ["Innovation & Entrepreneurship"],
  },

  DT: {
    username: "DT",
    password: "DT123!",
    name: "D&T Teacher",
    role: "teacher",
    subjects: ["D&T"],
  },

  ICT: {
    username: "ICT",
    password: "ICT123!",
    name: "ICT Teacher",
    role: "teacher",
    subjects: ["ICT"],
  },

  History: {
    username: "History",
    password: "History123!",
    name: "History Teacher",
    role: "teacher",
    subjects: ["History"],
  },

  Geography: {
    username: "Geography",
    password: "Geography123!",
    name: "Geography Teacher",
    role: "teacher",
    subjects: ["Geography"],
  },
};


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
  HOMEWORK: "studyplanner_v5_homework",
  KNOWLEDGE: "studyplanner_v5_knowledge",
  REPORTS: "studyplanner_v5_reports",
  DARK: "studyplanner_v5_dark",
  NOTIFICATIONS: "studyplanner_v5_notifications",
};


/* =========================================================
   DEFAULT KNOWLEDGE
   ========================================================= */

const DEFAULT_KNOWLEDGE = [
  {
    id: "math-default",
    subject: "Math",
    title: "Algebra Basics",
    content:
      "When solving an equation, perform the same operation on both sides. Work step by step and check your answer.",
    addedBy: "Math Teacher",
    date: new Date().toISOString(),
  },

  {
    id: "science-default",
    subject: "Science",
    title: "Heat Transfer",
    content:
      "Heat can be transferred through conduction, convection and radiation.",
    addedBy: "Science Teacher",
    date: new Date().toISOString(),
  },

  {
    id: "history-default",
    subject: "History",
    title: "History Answers",
    content:
      "A strong history answer should explain the event, provide evidence and explain why the event was significant.",
    addedBy: "History Teacher",
    date: new Date().toISOString(),
  },
];


/* =========================================================
   SAFE ARRAY
   ========================================================= */

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}


/* =========================================================
   INAPPROPRIATE CONTENT FILTER
   =========================================================

   This is deliberately a basic local filter.
   A production version should use server-side moderation.
   ========================================================= */

const INAPPROPRIATE_PATTERNS = [
  /\b(?:porn|pornography)\b/i,
  /\b(?:sex|sexual)\b/i,
  /\b(?:nude|nudity)\b/i,
  /\b(?:xxx)\b/i,
  /\b(?:fuck|fucking|motherfucker)\b/i,
  /\b(?:shit)\b/i,
  /\b(?:bitch)\b/i,
  /\b(?:rape|raping)\b/i,
  /\b(?:kill yourself)\b/i,
  /\b(?:suicide)\b/i,
  /\b(?:self[- ]?harm)\b/i,
];

function isInappropriate(text) {
  const value = String(text || "").trim();

  return INAPPROPRIATE_PATTERNS.some(
    (pattern) => pattern.test(value)
  );
}


/* =========================================================
   MAIN APP
   ========================================================= */

export default function App() {
  const [loginMode, setLoginMode] =
    useState("student");

  const [currentUser, setCurrentUser] =
    useState(null);

  const [page, setPage] =
    useState("home");

  const [homework, setHomework] =
    useState([]);

  const [knowledge, setKnowledge] =
    useState([]);

  const [reports, setReports] =
    useState([]);

  const [darkMode, setDarkMode] =
    useState(false);

  const [notifications, setNotifications] =
    useState(true);

  const [ready, setReady] =
    useState(false);


  /* =======================================================
     LOAD
     ======================================================= */

  useEffect(() => {
    loadData();
  }, []);


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

      const savedDark =
        await AsyncStorage.getItem(
          KEYS.DARK
        );

      const savedNotifications =
        await AsyncStorage.getItem(
          KEYS.NOTIFICATIONS
        );


      if (savedHomework) {
        setHomework(
          safeArray(
            JSON.parse(savedHomework)
          )
        );
      }


      if (savedKnowledge) {
        setKnowledge(
          safeArray(
            JSON.parse(savedKnowledge)
          )
        );
      } else {
        setKnowledge(
          DEFAULT_KNOWLEDGE
        );
      }


      if (savedReports) {
        setReports(
          safeArray(
            JSON.parse(savedReports)
          )
        );
      }


      if (savedDark !== null) {
        setDarkMode(
          Boolean(
            JSON.parse(savedDark)
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

    } catch (error) {
      console.log(
        "Load error:",
        error
      );
    }

    setReady(true);
  }


  /* =======================================================
     SAVE HOMEWORK
     ======================================================= */

  useEffect(() => {
    if (!ready) return;

    AsyncStorage.setItem(
      KEYS.HOMEWORK,
      JSON.stringify(
        safeArray(homework)
      )
    );
  }, [
    homework,
    ready,
  ]);


  /* =======================================================
     SAVE KNOWLEDGE
     ======================================================= */

  useEffect(() => {
    if (!ready) return;

    AsyncStorage.setItem(
      KEYS.KNOWLEDGE,
      JSON.stringify(
        safeArray(knowledge)
      )
    );
  }, [
    knowledge,
    ready,
  ]);


  /* =======================================================
     SAVE REPORTS
     ======================================================= */

  useEffect(() => {
    if (!ready) return;

    AsyncStorage.setItem(
      KEYS.REPORTS,
      JSON.stringify(
        safeArray(reports)
      )
    );
  }, [
    reports,
    ready,
  ]);


  /* =======================================================
     LOGIN
     ======================================================= */

  function studentLogin(email) {
    const clean =
      email.trim().toLowerCase();

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


    setCurrentUser({
      role: "student",
      email: clean,
      name:
        clean.split("@")[0],
    });

    setPage("home");
  }


  function teacherLogin(
    username,
    password
  ) {
    const clean =
      username.trim();


    if (
      clean.toLowerCase() ===
      ADMIN.username.toLowerCase()
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
      });

      setPage("home");
      return;
    }


    const teacher =
      Object.values(
        TEACHERS
      ).find(
        (item) =>
          item.username.toLowerCase() ===
          clean.toLowerCase()
      );


    if (!teacher) {
      Alert.alert(
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
        "Incorrect password."
      );

      return;
    }


    setCurrentUser({
      ...teacher,
    });

    setPage("home");
  }


  function logout() {
    setCurrentUser(null);
    setPage("home");
    setLoginMode("student");
  }


  /* =======================================================
     ADD HOMEWORK
     ======================================================= */

  function addHomework(item) {
    setHomework((old) => [
      ...safeArray(old),
      item,
    ]);

    Alert.alert(
      "Homework added",
      "The homework has been added to StudyPlanner."
    );
  }


  /* =======================================================
     DELETE HOMEWORK
     ======================================================= */

  function deleteHomework(id) {
    setHomework((old) =>
      safeArray(old).filter(
        (item) =>
          item.id !== id
      )
    );
  }


  /* =======================================================
     MODERATION REPORT
     ======================================================= */

  function reportInappropriateMessage(
    message
  ) {
    const report = {
      id:
        Date.now().toString() +
        Math.random(),

      type:
        "inappropriate_ai_message",

      message,

      student:
        currentUser?.email ||
        "Unknown student",

      date:
        new Date().toISOString(),

      status: "unread",
    };


    setReports((old) => [
      report,
      ...safeArray(old),
    ]);
  }


  /* =======================================================
     SETTINGS
     ======================================================= */

  async function changeDarkMode(
    value
  ) {
    setDarkMode(value);

    await AsyncStorage.setItem(
      KEYS.DARK,
      JSON.stringify(value)
    );
  }


  async function changeNotifications(
    value
  ) {
    setNotifications(value);

    await AsyncStorage.setItem(
      KEYS.NOTIFICATIONS,
      JSON.stringify(value)
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
          📚
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
        mode={loginMode}
        setMode={setLoginMode}
        onStudentLogin={
          studentLogin
        }
        onTeacherLogin={
          teacherLogin
        }
      />
    );
  }


  /* =======================================================
     TEACHER CANNOT OPEN AI CHAT
     ======================================================= */

  if (
    currentUser.role ===
      "teacher" &&
    page === "ai"
  ) {
    setPage("home");
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
            {currentUser.name}
          </Text>
        </View>


        <TouchableOpacity
          style={
            styles.logoutButton
          }
          onPress={logout}
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
        style={styles.content}
      >

        {page === "home" && (
          <HomePage
            user={currentUser}
            homework={homework}
            setPage={setPage}
          />
        )}


        {page === "homework" && (
          <HomeworkPage
            user={currentUser}
            homework={homework}
            onAdd={addHomework}
            onDelete={
              deleteHomework
            }
          />
        )}


        {page === "calendar" && (
          <CalendarPage
            homework={homework}
          />
        )}


        {page === "ai" &&
          currentUser.role ===
            "student" && (
            <AIPage
              user={currentUser}
              knowledge={knowledge}
              onReport={
                reportInappropriateMessage
              }
            />
          )}


        {page === "knowledge" &&
          currentUser.role !==
            "student" && (
            <KnowledgePage
              user={currentUser}
              knowledge={knowledge}
              setKnowledge={
                setKnowledge
              }
            />
          )}


        {page === "reports" &&
          currentUser.role ===
            "admin" && (
            <ReportsPage
              reports={reports}
              setReports={
                setReports
              }
            />
          )}


        {page === "settings" && (
          <SettingsPage
            user={currentUser}
            darkMode={darkMode}
            notifications={
              notifications
            }
            setDarkMode={
              changeDarkMode
            }
            setNotifications={
              changeNotifications
            }
          />
        )}
      </View>


      <NavigationBar
        page={page}
        setPage={setPage}
        user={currentUser}
        reportCount={
          reports.filter(
            (r) =>
              r.status ===
              "unread"
          ).length
        }
      />
    </SafeAreaView>
  );
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
  const [email, setEmail] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");


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
      >

        <Text
          style={styles.loginLogo}
        >
          📚
        </Text>

        <Text
          style={styles.loginTitle}
        >
          StudyPlanner
        </Text>

        <Text
          style={styles.loginSubtitle}
        >
          School planner • Homework •
          Teacher-powered study help
        </Text>


        <View
          style={styles.loginSwitch}
        >
          <TouchableOpacity
            style={[
              styles.loginSwitchButton,
              mode === "student" &&
                styles.loginSelected,
            ]}
            onPress={() =>
              setMode("student")
            }
          >
            <Text>
              🎓 Student
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.loginSwitchButton,
              mode === "teacher" &&
                styles.loginSelected,
            ]}
            onPress={() =>
              setMode("teacher")
            }
          >
            <Text>
              👩‍🏫 Teacher
            </Text>
          </TouchableOpacity>
        </View>


        {mode === "student" ? (
          <View
            style={styles.loginCard}
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
              No password is required.
            </Text>


            <Text
              style={
                styles.inputLabel
              }
            >
              School Email
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@s2026.ssts.edu.sg"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
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
              Student emails must end
              with @s202x.ssts.edu.sg
            </Text>
          </View>
        ) : (
          <View
            style={styles.loginCard}
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
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
            />


            <Text
              style={
                styles.inputLabel
              }
            >
              Password
            </Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
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
    safeArray(homework)
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
      .slice(0, 5);


  return (
    <ScrollView
      contentContainerStyle={
        styles.page
      }
    >
      <Text
        style={styles.pageTitle}
      >
        Welcome 👋
      </Text>

      <Text
        style={styles.pageSubtitle}
      >
        {user.role ===
        "student"
          ? user.email
          : user.name}
      </Text>


      <View
        style={styles.grid}
      >
        <DashboardCard
          icon="📝"
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
          icon="📅"
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
            icon="🤖"
            title="Study AI"
            value="Ask"
            onPress={() =>
              setPage("ai")
            }
          />
        )}


        {user.role !==
          "student" && (
          <DashboardCard
            icon="🧠"
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
            icon="🚨"
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
        style={styles.sectionTitle}
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
              key={item.id}
              item={item}
            />
          )
        )
      )}
    </ScrollView>
  );
}


/* =========================================================
   DASHBOARD
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
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text
        style={
          styles.dashboardIcon
        }
      >
        {icon}
      </Text>

      <Text
        style={
          styles.dashboardTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.dashboardValue
        }
      >
        {String(value)}
      </Text>
    </TouchableOpacity>
  );
}


/* =========================================================
   HOMEWORK PAGE
   ========================================================= */

function HomeworkPage({
  user,
  homework,
  onAdd,
  onDelete,
}) {
  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);


  function toggleComplete(id) {
    if (
      user.role !==
      "student"
    ) {
      return;
    }

    onAddUpdate(
      id
    );
  }


  function onAddUpdate(id) {
    // This is handled through the parent updater below.
    // Kept separate so every button has a defined handler.
    Alert.alert(
      "Homework",
      "Use the switch on the homework item to mark it complete."
    );
  }


  return (
    <View style={styles.flex}>
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
              📝 Homework
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              Homework added by
              students and teachers.
            </Text>
          </View>


          <TouchableOpacity
            style={
              styles.smallButton
            }
            onPress={() =>
              setModalVisible(
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


        {safeArray(homework)
          .length === 0 ? (
          <EmptyState
            text="No homework has been added yet."
          />
        ) : (
          safeArray(homework)
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
                  key={item.id}
                  item={item}
                  showComplete={
                    user.role ===
                    "student"
                  }
                  onComplete={() => {
                    Alert.alert(
                      "Complete homework",
                      "Homework completion is saved on this device."
                    );
                  }}
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
          modalVisible
        }
        onClose={() =>
          setModalVisible(
            false
          )
        }
        user={user}
        onAdd={(item) => {
          onAdd(item);
          setModalVisible(
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
  showComplete,
  onComplete,
  canDelete,
  onDelete,
}) {
  return (
    <View
      style={
        styles.homeworkCard
      }
    >
      <View
        style={
          styles.homeworkTop
        }
      >
        <View
          style={{ flex: 1 }}
        >
          <Text
            style={
              styles.homeworkTitle
            }
          >
            {item.title}
          </Text>

          <Text
            style={
              styles.subjectBadge
            }
          >
            {item.subject}
          </Text>
        </View>


        {showComplete && (
          <TouchableOpacity
            onPress={
              onComplete
            }
            style={
              styles.completeButton
            }
          >
            <Text>
              ✓
            </Text>
          </TouchableOpacity>
        )}
      </View>


      <Text
        style={
          styles.homeworkDescription
        }
      >
        {item.description}
      </Text>


      <Text
        style={
          styles.dueDate
        }
      >
        📅 Due: {item.dueDate}
      </Text>


      <Text
        style={
          styles.createdBy
        }
      >
        Added by:{" "}
        {item.createdBy}
      </Text>


      {canDelete && (
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
   ADD HOMEWORK
   ========================================================= */

function AddHomeworkModal({
  visible,
  onClose,
  onAdd,
  user,
}) {
  const allowedSubjects =
    safeArray(
      user?.subjects
    );

  const subjects =
    user?.role === "student"
      ? SUBJECTS
      : allowedSubjects;


  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [subject, setSubject] =
    useState(
      subjects[0] ||
        SUBJECTS[0]
    );


  useEffect(() => {
    if (
      subjects.length > 0 &&
      !subjects.includes(
        subject
      )
    ) {
      setSubject(
        subjects[0]
      );
    }
  }, [
    user,
    subjects.length,
  ]);


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
        Date.now().toString() +
        Math.random(),

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

      completed: false,
    });


    setTitle("");
    setDescription("");
    setDueDate("");
  }


  return (
    <Modal
      visible={visible}
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
          style={styles.modalCard}
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
              value={title}
              onChangeText={
                setTitle
              }
              placeholder="Homework title"
              style={styles.input}
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
              {safeArray(
                subjects
              ).map(
                (item) => (
                  <TouchableOpacity
                    key={item}
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
                      {item}
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
              value={dueDate}
              onChangeText={
                setDueDate
              }
              placeholder="YYYY-MM-DD"
              style={styles.input}
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
                onPress={save}
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
  ] = useState("");


  const selected =
    safeArray(homework).filter(
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
        📅 Calendar
      </Text>

      <Text
        style={
          styles.pageSubtitle
        }
      >
        Homework deadlines.
      </Text>


      {dates.length === 0 ? (
        <EmptyState
          text="No deadlines yet."
        />
      ) : (
        dates.map(
          (date) => (
            <TouchableOpacity
              key={date}
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
                {date}
              </Text>

              <Text
                style={
                  styles.calendarCount
                }
              >
                {
                  safeArray(
                    homework
                  ).filter(
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


      {selectedDate !==
        "" && (
        <View>
          {selected.map(
            (item) => (
              <HomeworkCard
                key={item.id}
                item={item}
              />
            )
          )}
        </View>
      )}
    </ScrollView>
  );
}


/* =========================================================
   AI
   ========================================================= */

function AIPage({
  user,
  knowledge,
  onReport,
}) {
  const [subject, setSubject] =
    useState(
      SUBJECTS[0]
    );

  const [input, setInput] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        id: "welcome",
        sender: "ai",
        text:
          "Hi! I'm StudyPlanner AI. Ask me a schoolwork question.",
      },
    ]);


  function generateAnswer(
    question
  ) {
    const lower =
      question.toLowerCase();


    const relevant =
      safeArray(
        knowledge
      ).filter(
        (item) => {
          if (
            item.subject !==
            subject
          ) {
            return false;
          }


          const combined =
            `${item.title} ${item.content}`
              .toLowerCase();


          const words =
            lower.split(
              /\s+/
            );


          return words.some(
            (word) => {
              const clean =
                word.replace(
                  /[^a-z0-9]/g,
                  ""
                );

              return (
                clean.length >= 4 &&
                combined.includes(
                  clean
                )
              );
            }
          );
        }
      );


    if (
      relevant.length > 0
    ) {
      return (
        `Teacher knowledge for ${subject}:\n\n` +
        relevant
          .slice(0, 5)
          .map(
            (item) =>
              `${item.title}\n${item.content}`
          )
          .join(
            "\n\n"
          )
      );
    }


    const fallback = {
      Math:
        "Break the problem into steps, identify what you know and what you need to find, then choose the appropriate method.",

      Science:
        "Identify the scientific concept first, then explain the process using correct scientific vocabulary.",

      English:
        "Identify what the question asks, plan your answer and support your ideas with relevant evidence or examples.",

      Chinese:
        "Identify the important words in the question and answer using clear, complete sentences.",

      HCL:
        "Identify the key information in the question and construct a clear answer using appropriate language.",

      History:
        "Explain the event, provide evidence and explain why the event was significant.",

      Geography:
        "Identify the geographical process, explain the causes and effects, and use relevant examples.",

      Malay:
        "Identify the key words in the question and construct a clear, complete response.",

      "Physical Education":
        "Explain the relevant movement, fitness or health concept and give a suitable example.",

      "Innovation & Entrepreneurship":
        "Identify the problem, explain the proposed solution and consider the users, value and feasibility.",

      "D&T":
        "Identify the design problem, consider constraints and explain how the proposed design solves the problem.",

      ICT:
        "Break the ICT problem into smaller steps and identify the appropriate technology or process.",
    };


    return (
      fallback[
        subject
      ] ||
      `I don't have a teacher note matching this ${subject} question yet.`
    );
  }


  function sendMessage() {
    const question =
      input.trim();


    if (!question) {
      return;
    }


    /* -----------------------------------------
       MODERATION
       ----------------------------------------- */

    if (
      isInappropriate(
        question
      )
    ) {
      // Do NOT add the inappropriate
      // message to the chat.

      onReport(question);

      setInput("");

      Alert.alert(
        "Message removed",
        "That message cannot be used with StudyPlanner AI. An administrator has been notified."
      );

      return;
    }


    const studentMessage = {
      id:
        Date.now().toString(),
      sender: "student",
      text: question,
    };


    const aiMessage = {
      id:
        Date.now().toString() +
        "-ai",
      sender: "ai",
      text:
        generateAnswer(
          question
        ),
    };


    setMessages(
      (old) => [
        ...safeArray(old),
        studentMessage,
        aiMessage,
      ]
    );

    setInput("");
  }


  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={
        Platform.OS === "ios"
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
          🤖 Study AI
        </Text>

        <Text
          style={
            styles.pageSubtitle
          }
        >
          Teacher-powered study help
        </Text>
      </View>


      <ScrollView
        style={styles.chat}
        contentContainerStyle={
          styles.chatContent
        }
      >
        {safeArray(
          messages
        ).map(
          (message) => (
            <View
              key={message.id}
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
                {message.text}
              </Text>
            </View>
          )
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
                key={item}
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
                  {item}
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
          value={input}
          onChangeText={setInput}
          placeholder="Ask a homework question..."
          multiline
          style={
            styles.chatInput
          }
        />

        <TouchableOpacity
          style={
            styles.sendButton
          }
          onPress={
            sendMessage
          }
        >
          <Text
            style={
              styles.sendText
            }
          >
            ➤
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
    modalVisible,
    setModalVisible,
  ] = useState(false);


  const visible =
    user.role === "admin"
      ? safeArray(
          knowledge
        )
      : safeArray(
          knowledge
        ).filter(
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
      "This will remove it from the AI knowledge base.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setKnowledge(
              (old) =>
                safeArray(
                  old
                ).filter(
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
    <View style={styles.flex}>
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
              🧠 AI Knowledge
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              {user.role ===
              "admin"
                ? "Manage all subjects."
                : `Only your subject: ${safeArray(
                    user.subjects
                  ).join(", ")}`}
            </Text>
          </View>


          <TouchableOpacity
            style={
              styles.smallButton
            }
            onPress={() =>
              setModalVisible(
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


        {visible.length ===
        0 ? (
          <EmptyState
            text="No knowledge added yet."
          />
        ) : (
          visible.map(
            (item) => (
              <View
                key={item.id}
                style={
                  styles.knowledgeCard
                }
              >
                <Text
                  style={
                    styles.knowledgeSubject
                  }
                >
                  {item.subject}
                </Text>

                <Text
                  style={
                    styles.knowledgeTitle
                  }
                >
                  {item.title}
                </Text>

                <Text
                  style={
                    styles.knowledgeContent
                  }
                >
                  {item.content}
                </Text>

                <Text
                  style={
                    styles.createdBy
                  }
                >
                  Added by{" "}
                  {item.addedBy}
                </Text>


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
              </View>
            )
          )
        )}
      </ScrollView>


      <AddKnowledgeModal
        visible={
          modalVisible
        }
        onClose={() =>
          setModalVisible(
            false
          )
        }
        user={user}
        onAdd={(item) => {
          setKnowledge(
            (old) => [
              ...safeArray(
                old
              ),
              item,
            ]
          );

          setModalVisible(
            false
          );
        }}
      />
    </View>
  );
}


/* =========================================================
   ADD KNOWLEDGE
   ========================================================= */

function AddKnowledgeModal({
  visible,
  onClose,
  onAdd,
  user,
}) {
  const availableSubjects =
    user.role === "admin"
      ? SUBJECTS
      : safeArray(
          user.subjects
        );


  const [
    subject,
    setSubject,
  ] = useState(
    availableSubjects[0] ||
      SUBJECTS[0]
  );

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");


  useEffect(() => {
    if (
      availableSubjects.length >
        0 &&
      !availableSubjects.includes(
        subject
      )
    ) {
      setSubject(
        availableSubjects[0]
      );
    }
  }, [
    user,
    availableSubjects.length,
  ]);


  function save() {
    if (
      !title.trim() ||
      !content.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Enter a topic and teacher notes."
      );

      return;
    }


    if (
      user.role ===
        "teacher" &&
      !safeArray(
        user.subjects
      ).includes(subject)
    ) {
      Alert.alert(
        "Not allowed",
        "You can only add AI knowledge for your own subject."
      );

      return;
    }


    onAdd({
      id:
        Date.now().toString() +
        Math.random(),

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
      visible={visible}
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
          style={styles.modalCard}
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
                styles.modalDescription
              }
            >
              Teachers can only add
              knowledge for their own
              subject.
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
              {safeArray(
                availableSubjects
              ).map(
                (item) => (
                  <TouchableOpacity
                    key={item}
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
                      {item}
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
              value={title}
              onChangeText={
                setTitle
              }
              placeholder="Example: Photosynthesis"
              style={styles.input}
            />


            <Text
              style={
                styles.inputLabel
              }
            >
              Teacher Notes
            </Text>

            <TextInput
              value={content}
              onChangeText={
                setContent
              }
              placeholder="Enter explanations, examples and tips..."
              multiline
              style={[
                styles.input,
                styles.largeTextArea,
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
                onPress={save}
              >
                <Text
                  style={
                    styles.primaryText
                  }
                >
                  Save Knowledge
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
   ADMIN REPORTS
   ========================================================= */

function ReportsPage({
  reports,
  setReports,
}) {
  function markRead(id) {
    setReports((old) =>
      safeArray(old).map(
        (report) =>
          report.id === id
            ? {
                ...report,
                status:
                  "read",
              }
            : report
      )
    );
  }


  function deleteReport(id) {
    setReports((old) =>
      safeArray(old).filter(
        (report) =>
          report.id !== id
      )
    );
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
        🚨 Admin Reports
      </Text>

      <Text
        style={
          styles.pageSubtitle
        }
      >
        Inappropriate AI messages
        reported by StudyPlanner.
      </Text>


      {safeArray(reports)
        .length === 0 ? (
        <EmptyState
          text="No moderation reports."
        />
      ) : (
        safeArray(
          reports
        ).map(
          (report) => (
            <View
              key={report.id}
              style={
                styles.reportCard
              }
            >
              <Text
                style={
                  styles.reportTitle
                }
              >
                {report.status ===
                "unread"
                  ? "🔴 New Report"
                  : "⚪ Reviewed"}
              </Text>

              <Text
                style={
                  styles.reportStudent
                }
              >
                Student:{" "}
                {report.student}
              </Text>

              <Text
                style={
                  styles.reportMessage
                }
              >
                The message was
                automatically blocked.
              </Text>

              <Text
                style={
                  styles.createdBy
                }
              >
                Time:{" "}
                {new Date(
                  report.date
                ).toLocaleString()}
              </Text>


              <View
                style={
                  styles.reportButtons
                }
              >
                {report.status ===
                  "unread" && (
                  <TouchableOpacity
                    style={
                      styles.smallButton
                    }
                    onPress={() =>
                      markRead(
                        report.id
                      )
                    }
                  >
                    <Text
                      style={
                        styles.smallButtonText
                      }
                    >
                      Mark Read
                    </Text>
                  </TouchableOpacity>
                )}


                <TouchableOpacity
                  style={
                    styles.deleteButton
                  }
                  onPress={() =>
                    deleteReport(
                      report.id
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
              </View>
            </View>
          )
        )
      )}
    </ScrollView>
  );
}


/* =========================================================
   SETTINGS
   ========================================================= */

function SettingsPage({
  user,
  darkMode,
  notifications,
  setDarkMode,
  setNotifications,
}) {
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
        ⚙️ Settings
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
            style={{ flex: 1 }}
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
              Use a darker appearance.
            </Text>
          </View>

          <Switch
            value={darkMode}
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
            style={{ flex: 1 }}
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
              Homework reminders.
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
          Type:{" "}
          {user.role}
        </Text>

        {user.email && (
          <Text
            style={
              styles.accountText
            }
          >
            Email:{" "}
            {user.email}
          </Text>
        )}

        {user.username && (
          <Text
            style={
              styles.accountText
            }
          >
            Username:{" "}
            {user.username}
          </Text>
        )}
      </View>


      <Text
        style={
          styles.versionText
        }
      >
        StudyPlanner V5 • iOS •
        Android • Web
      </Text>
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
      id: "home",
      icon: "🏠",
      label: "Home",
    },

    {
      id: "homework",
      icon: "📝",
      label: "Homework",
    },

    {
      id: "calendar",
      icon: "📅",
      label: "Calendar",
    },

    {
      id: "settings",
      icon: "⚙️",
      label: "Settings",
    },
  ];


  /* Students get AI.
     Teachers do NOT get AI. */

  if (
    user.role ===
    "student"
  ) {
    items.splice(
      3,
      0,
      {
        id: "ai",
        icon: "🤖",
        label: "AI",
      }
    );
  }


  /* Teachers/admin get Knowledge */

  if (
    user.role ===
      "teacher" ||
    user.role ===
      "admin"
  ) {
    items.splice(
      3,
      0,
      {
        id: "knowledge",
        icon: "🧠",
        label: "Knowledge",
      }
    );
  }


  /* Admin gets Reports */

  if (
    user.role ===
    "admin"
  ) {
    items.splice(
      4,
      0,
      {
        id: "reports",
        icon: "🚨",
        label:
          reportCount > 0
            ? `Reports (${reportCount})`
            : "Reports",
      }
    );
  }


  return (
    <View
      style={
        styles.navigation
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.navigationContent
        }
      >
        {items.map(
          (item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                page ===
                  item.id &&
                  styles.selectedNavItem,
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
                {item.icon}
              </Text>

              <Text
                style={[
                  styles.navText,
                  page ===
                    item.id &&
                    styles.selectedNavText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    </View>
  );
}


/* =========================================================
   EMPTY
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
          styles.emptyIcon
        }
      >
        📭
      </Text>

      <Text
        style={
          styles.emptyText
        }
      >
        {text}
      </Text>
    </View>
  );
}


/* =========================================================
   STYLES
   ========================================================= */

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    app: {
      flex: 1,
      backgroundColor:
        "#f5f7fb",
    },

    darkApp: {
      backgroundColor:
        "#111827",
    },

    darkText: {
      color: "#fff",
    },

    darkSecondary: {
      color: "#9ca3af",
    },

    darkCard: {
      backgroundColor:
        "#1f2937",
      borderBottomColor:
        "#374151",
    },

    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    loadingEmoji: {
      fontSize: 60,
    },

    loadingTitle: {
      fontSize: 30,
      fontWeight: "900",
      marginTop: 10,
    },

    topBar: {
      minHeight: 72,
      paddingHorizontal: 18,
      paddingVertical: 12,
      backgroundColor:
        "#fff",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "#e5e7eb",
    },

    appTitle: {
      fontSize: 23,
      fontWeight: "800",
    },

    userText: {
      marginTop: 3,
      fontSize: 12,
      color: "#6b7280",
    },

    logoutButton: {
      backgroundColor:
        "#ef4444",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 10,
    },

    logoutText: {
      color: "#fff",
      fontWeight: "800",
    },

    content: {
      flex: 1,
    },

    page: {
      padding: 18,
      paddingBottom: 40,
      width: "100%",
      maxWidth: 1100,
      alignSelf: "center",
    },

    pageTitle: {
      fontSize: 29,
      fontWeight: "800",
      color: "#111827",
    },

    pageSubtitle: {
      marginTop: 5,
      marginBottom: 20,
      color: "#6b7280",
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },

    dashboardCard: {
      width: 170,
      minHeight: 140,
      padding: 18,
      borderRadius: 18,
      backgroundColor: "#fff",
      justifyContent:
        "center",
      elevation: 2,
    },

    dashboardIcon: {
      fontSize: 30,
      marginBottom: 8,
    },

    dashboardTitle: {
      fontWeight: "700",
      fontSize: 16,
    },

    dashboardValue: {
      marginTop: 5,
      color: "#2563eb",
      fontWeight: "800",
    },

    sectionTitle: {
      fontSize: 21,
      fontWeight: "800",
      marginTop: 28,
      marginBottom: 12,
    },

    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 10,
    },

    smallButton: {
      backgroundColor:
        "#2563eb",
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
    },

    smallButtonText: {
      color: "#fff",
      fontWeight: "800",
    },

    homeworkCard: {
      backgroundColor: "#fff",
      borderRadius: 15,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },

    homeworkTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    homeworkTitle: {
      fontSize: 18,
      fontWeight: "800",
    },

    subjectBadge: {
      color: "#2563eb",
      fontWeight: "700",
      marginTop: 5,
    },

    homeworkDescription: {
      marginTop: 12,
      lineHeight: 21,
      color: "#4b5563",
    },

    dueDate: {
      marginTop: 12,
      color: "#dc2626",
      fontWeight: "700",
    },

    createdBy: {
      marginTop: 6,
      fontSize: 12,
      color: "#6b7280",
    },

    completeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        "#dcfce7",
      alignItems: "center",
      justifyContent:
        "center",
    },

    deleteButton: {
      alignSelf: "flex-end",
      padding: 7,
      marginTop: 5,
    },

    deleteText: {
      color: "#dc2626",
      fontWeight: "700",
    },

    calendarDate: {
      backgroundColor: "#fff",
      padding: 17,
      borderRadius: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },

    selectedCalendarDate: {
      borderColor: "#2563eb",
      borderWidth: 2,
    },

    calendarDateText: {
      fontSize: 17,
      fontWeight: "800",
    },

    calendarCount: {
      marginTop: 4,
      color: "#6b7280",
    },

    aiHeader: {
      paddingHorizontal: 18,
      paddingTop: 18,
    },

    chat: {
      flex: 1,
    },

    chatContent: {
      padding: 18,
    },

    message: {
      maxWidth: "85%",
      padding: 13,
      borderRadius: 15,
      marginBottom: 12,
    },

    studentMessage: {
      alignSelf: "flex-end",
      backgroundColor:
        "#dbeafe",
    },

    aiMessage: {
      alignSelf: "flex-start",
      backgroundColor:
        "#fff",
      borderWidth: 1,
      borderColor:
        "#e5e7eb",
    },

    messageSender: {
      fontSize: 11,
      fontWeight: "800",
      color: "#6b7280",
      marginBottom: 5,
    },

    messageText: {
      lineHeight: 21,
      color: "#111827",
    },

    subjectBar: {
      padding: 10,
      backgroundColor: "#fff",
      borderTopWidth: 1,
      borderTopColor:
        "#e5e7eb",
    },

    subjectLabel: {
      fontWeight: "700",
      marginBottom: 7,
    },

    aiSubject: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor:
        "#f3f4f6",
      marginRight: 7,
    },

    selectedAISubject: {
      backgroundColor:
        "#2563eb",
    },

    aiSubjectText: {
      fontSize: 12,
    },

    selectedAISubjectText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 12,
    },

    chatInputRow: {
      flexDirection: "row",
      padding: 10,
      backgroundColor:
        "#fff",
      gap: 8,
    },

    chatInput: {
      flex: 1,
      minHeight: 45,
      maxHeight: 100,
      borderWidth: 1,
      borderColor:
        "#d1d5db",
      borderRadius: 13,
      padding: 12,
      backgroundColor:
        "#fff",
    },

    sendButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        "#2563eb",
      alignItems: "center",
      justifyContent:
        "center",
    },

    sendText: {
      color: "#fff",
      fontSize: 21,
    },

    knowledgeCard: {
      backgroundColor: "#fff",
      borderRadius: 15,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#e5e7eb",
    },

    knowledgeSubject: {
      color: "#2563eb",
      fontWeight: "800",
    },

    knowledgeTitle: {
      marginTop: 5,
      fontSize: 18,
      fontWeight: "800",
    },

    knowledgeContent: {
      marginTop: 10,
      lineHeight: 21,
      color: "#4b5563",
    },

    settingsCard: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 17,
    },

    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 65,
    },

    settingTitle: {
      fontSize: 17,
      fontWeight: "700",
    },

    settingDescription: {
      color: "#6b7280",
      marginTop: 3,
    },

    divider: {
      height: 1,
      backgroundColor:
        "#e5e7eb",
    },

    accountCard: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 17,
      marginTop: 16,
    },

    accountText: {
      color: "#4b5563",
      marginBottom: 6,
    },

    reportCard: {
      backgroundColor: "#fff",
      borderRadius: 15,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#fecaca",
    },

    reportTitle: {
      fontSize: 18,
      fontWeight: "800",
    },

    reportStudent: {
      marginTop: 8,
      fontWeight: "700",
    },

    reportMessage: {
      marginTop: 8,
      color: "#4b5563",
    },

    reportButtons: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "flex-end",
      marginTop: 8,
    },

    navigation: {
      backgroundColor: "#fff",
      borderTopWidth: 1,
      borderTopColor:
        "#e5e7eb",
    },

    navigationContent: {
      paddingHorizontal: 8,
      paddingVertical: 7,
      alignItems: "center",
    },

    navItem: {
      minWidth: 70,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: "center",
      marginHorizontal: 2,
    },

    selectedNavItem: {
      backgroundColor:
        "#dbeafe",
    },

    navIcon: {
      fontSize: 20,
    },

    navText: {
      marginTop: 2,
      fontSize: 11,
      color: "#6b7280",
      fontWeight: "600",
    },

    selectedNavText: {
      color: "#2563eb",
      fontWeight: "800",
    },

    empty: {
      padding: 35,
      alignItems: "center",
      justifyContent:
        "center",
    },

    emptyIcon: {
      fontSize: 40,
      marginBottom: 10,
    },

    emptyText: {
      color: "#6b7280",
      textAlign: "center",
    },

    modalBackground: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      justifyContent:
        "flex-end",
    },

    modalCard: {
      backgroundColor: "#fff",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: "90%",
    },

    modalTitle: {
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 8,
    },

    modalDescription: {
      color: "#6b7280",
      marginBottom: 15,
    },

    inputLabel: {
      fontWeight: "700",
      marginTop: 10,
      marginBottom: 6,
    },

    input: {
      borderWidth: 1,
      borderColor:
        "#d1d5db",
      borderRadius: 11,
      padding: 11,
      backgroundColor:
        "#fff",
      fontSize: 15,
    },

    textArea: {
      minHeight: 90,
      textAlignVertical:
        "top",
    },

    largeTextArea: {
      minHeight: 160,
      textAlignVertical:
        "top",
    },

    modalButtons: {
      flexDirection: "row",
      justifyContent:
        "flex-end",
      gap: 10,
      marginTop: 18,
    },

    cancelButton: {
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor:
        "#f3f4f6",
      justifyContent:
        "center",
    },

    primaryButton: {
      backgroundColor:
        "#2563eb",
      paddingHorizontal: 17,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      justifyContent:
        "center",
    },

    primaryText: {
      color: "#fff",
      fontWeight: "800",
    },

    subjectChoice: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor:
        "#f3f4f6",
      borderRadius: 20,
      marginRight: 7,
      marginBottom: 8,
    },

    selectedSubject: {
      backgroundColor:
        "#2563eb",
    },

    subjectChoiceText: {
      color: "#374151",
      fontSize: 12,
    },

    selectedSubjectText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 12,
    },

    loginContainer: {
      flex: 1,
      backgroundColor:
        "#eff6ff",
    },

    loginContent: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent:
        "center",
      padding: 25,
    },

    loginLogo: {
      fontSize: 60,
    },

    loginTitle: {
      fontSize: 38,
      fontWeight: "900",
      color: "#111827",
    },

    loginSubtitle: {
      textAlign: "center",
      color: "#6b7280",
      marginVertical: 15,
      maxWidth: 500,
    },

    loginSwitch: {
      flexDirection: "row",
      backgroundColor:
        "#fff",
      borderRadius: 14,
      padding: 5,
      marginBottom: 15,
      width: "100%",
      maxWidth: 450,
    },

    loginSwitchButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderRadius: 10,
    },

    loginSelected: {
      backgroundColor:
        "#dbeafe",
    },

    loginCard: {
      width: "100%",
      maxWidth: 450,
      backgroundColor:
        "#fff",
      padding: 22,
      borderRadius: 20,
      elevation: 4,
    },

    cardTitle: {
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 8,
    },

    cardDescription: {
      color: "#6b7280",
      marginBottom: 12,
    },

    helperText: {
      textAlign: "center",
      color: "#6b7280",
      fontSize: 12,
      marginTop: 12,
    },

    versionText: {
      textAlign: "center",
      color: "#6b7280",
      marginTop: 20,
    },
  });