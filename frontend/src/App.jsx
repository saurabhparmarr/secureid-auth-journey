import { useEffect, useRef, useState } from "react";

import Registration from "./screens/registration/Registration";
import EmailOtp from "./screens/email/EmailOtp";
import MobileOtp from "./screens/mobile/MobileOtp";
import MfaSetup from "./screens/mfa/MfaSetup";
import AuthenticatorSetup from "./screens/mfa/AuthenticatorSetup";
import MfaVerification from "./screens/mfa/MfaVerification";
import RegistrationSuccess from "./screens/success/RegistrationSuccess";
import Login from "./screens/login/Login";

import { apiRequest } from "./services/api";

const REGISTRATION_SESSION_KEYS = [
  "currentScreen",
  "userId",
  "challengeId",
  "challengeExpiresAt",
  "challengeStatus",
  "mfaOtpauthUrl",
  "registrationForm",
];

const readSessionValue = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.error(`Unable to read ${key} from session storage:`, error);
    return null;
  }
};

const writeSessionValue = (key, value) => {
  try {
    if (value === null || value === undefined) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
    }
  } catch (error) {
    console.error(`Unable to write ${key} to session storage:`, error);
  }
};

const readSessionObject = (key, fallback) => {
  const value = readSessionValue(key);

  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Unable to parse ${key} from session storage:`, error);
    return fallback;
  }
};

const getInitialScreen = () => {
  const savedScreen = readSessionValue("currentScreen");
  const savedUserId = readSessionValue("userId");

  if (
    savedScreen &&
    savedScreen !== "registration" &&
    savedScreen !== "login" &&
    !savedUserId
  ) {
    clearRegistrationSession();
    return "registration";
  }

  return savedScreen || "registration";
};

const clearRegistrationSession = () => {
  try {
    REGISTRATION_SESSION_KEYS.forEach((key) => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Unable to clear registration session:", error);
  }
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(getInitialScreen);

  const [form, setForm] = useState(() => ({
    fullName: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    password: "",
    terms: false,
    ...readSessionObject("registrationForm", {}),
  }));

  const [userId, setUserId] = useState(() => readSessionValue("userId"));
  const [challengeId, setChallengeId] = useState(() =>
    readSessionValue("challengeId")
  );
  const [challengeExpiresAt, setChallengeExpiresAt] = useState(() =>
    readSessionValue("challengeExpiresAt")
  );
  const [challengeStatus, setChallengeStatus] = useState(() =>
    readSessionValue("challengeStatus")
  );
  const [mfaOtpauthUrl, setMfaOtpauthUrl] = useState(null);
  const [smsOtpAutoSend, setSmsOtpAutoSend] = useState(false);
  const currentScreenRef = useRef(currentScreen);
  const mfaOtpauthUrlRef = useRef(mfaOtpauthUrl);
  const registrationSubmissionInFlight = useRef(false);

  useEffect(() => {
    currentScreenRef.current = currentScreen;
    mfaOtpauthUrlRef.current = mfaOtpauthUrl;
  }, [currentScreen, mfaOtpauthUrl]);

  useEffect(() => {
    if (currentScreen === "login") {
      clearRegistrationSession();
      return;
    }

    writeSessionValue("currentScreen", currentScreen);
    writeSessionValue("userId", userId);
    writeSessionValue("challengeId", challengeId);
    writeSessionValue("challengeExpiresAt", challengeExpiresAt);
    writeSessionValue("challengeStatus", challengeStatus);
    writeSessionValue("mfaOtpauthUrl", null);
    writeSessionValue(
      "registrationForm",
      JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        countryCode: form.countryCode,
        mobile: form.mobile,
        terms: form.terms,
      })
    );
  }, [
    currentScreen,
    userId,
    challengeId,
    challengeExpiresAt,
    challengeStatus,
    form.fullName,
    form.email,
    form.countryCode,
    form.mobile,
    form.terms,
  ]);

  useEffect(() => {
    if (currentScreenRef.current === "login") {
      return;
    }

    if (!userId) return;

    let cancelled = false;

    const restoreRegistrationStatus = async () => {
      try {
        const data = await apiRequest(
          `/registration-status/${userId}`
        );

        if (cancelled) return;

        if (data.challengeId) {
          setChallengeId(data.challengeId);
        } else {
          setChallengeId(null);
        }
        setChallengeExpiresAt(data.challengeExpiresAt || null);
        setChallengeStatus(data.challengeStatus || "missing");

        const mfaScreen = [
          "mfaSetup",
          "authenticatorSetup",
          "mfaVerification",
        ];

        const savedScreen = currentScreenRef.current;
        const shouldPreserveMfaScreen =
          mfaScreen.includes(savedScreen) &&
          data.emailVerified &&
          data.mobileVerified &&
          !data.mfaEnabled &&
          !data.mfaVerified &&
          data.mfaSetupInitialized &&
          Boolean(mfaOtpauthUrlRef.current);

        if (!data.mfaSetupInitialized) {
          setMfaOtpauthUrl(null);
        }

        setCurrentScreen(
          shouldPreserveMfaScreen
            ? savedScreen
            : data.nextStep || "registration"
        );
      } catch (error) {
        if (cancelled) return;

        console.error("Registration resume error:", error);

        if (error.status === 404) {
          clearRegistrationSession();
          setUserId(null);
          setChallengeId(null);
          setChallengeExpiresAt(null);
          setChallengeStatus(null);
          setMfaOtpauthUrl(null);
          setForm({
            fullName: "",
            email: "",
            countryCode: "+91",
            mobile: "",
            password: "",
            terms: false,
          });
          setCurrentScreen("registration");
        }
      }
    };

    restoreRegistrationStatus();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleScreenChange = (screen) => {
    if (screen === "login") {
      clearRegistrationSession();
      setUserId(null);
      setChallengeId(null);
      setChallengeExpiresAt(null);
      setChallengeStatus(null);
      setMfaOtpauthUrl(null);
      setSmsOtpAutoSend(false);
    }
    setCurrentScreen(screen);
  };

  // Registration error shown inside the UI
  const [registrationError, setRegistrationError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear registration API error when user changes email/mobile
    if (name === "email" || name === "mobile") {
      setRegistrationError("");
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (registrationSubmissionInFlight.current) return;

    // Clear previous error
    setRegistrationError("");

    // Frontend validation
    if (!form.fullName.trim()) {
      setRegistrationError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setRegistrationError("Please enter your email address.");
      return;
    }

    if (!form.mobile.trim()) {
      setRegistrationError("Please enter your mobile number.");
      return;
    }

    if (!form.password) {
      setRegistrationError("Please enter your password.");
      return;
    }

    if (!form.terms) {
      setRegistrationError(
        "Please accept the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    registrationSubmissionInFlight.current = true;
    try {
      const data = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      // Save user ID returned by backend
      setUserId(data.userId);

      // Save email OTP challenge ID
      setChallengeId(data.challengeId);
      setChallengeExpiresAt(data.challengeExpiresAt || null);
      setChallengeStatus("active");

      // Clear any old error
      setRegistrationError("");

      // Go to email verification
      handleScreenChange("emailOtp");
    } catch (error) {
      console.error("Registration error:", error);

      // Show backend error inside UI instead of browser alert
      setRegistrationError(
        error.message || "Registration failed."
      );
    } finally {
      registrationSubmissionInFlight.current = false;
    }
  };

  switch (currentScreen) {
    case "emailOtp":
      return (
        <EmailOtp
          email={form.email}
          challengeId={challengeId}
          challengeExpiresAt={challengeExpiresAt}
          challengeStatus={challengeStatus}
          userId={userId}
          setCurrentScreen={handleScreenChange}
          setChallengeId={setChallengeId}
          setChallengeExpiresAt={setChallengeExpiresAt}
          setChallengeStatus={setChallengeStatus}
          setUserId={setUserId}
          setSmsOtpAutoSend={setSmsOtpAutoSend}
        />
      );

    case "mobileOtp":
      return (
        <MobileOtp
          userId={userId}
          challengeId={challengeId}
          challengeExpiresAt={challengeExpiresAt}
          challengeStatus={challengeStatus}
          setChallengeStatus={setChallengeStatus}
          autoSendInitialOtp={smsOtpAutoSend}
          setAutoSendInitialOtp={setSmsOtpAutoSend}
          setCurrentScreen={handleScreenChange}
          setChallengeId={setChallengeId}
          setChallengeExpiresAt={setChallengeExpiresAt}
        />
      );

    case "mfaSetup":
      return (
        <MfaSetup
          userId={userId}
          setCurrentScreen={handleScreenChange}
          setMfaOtpauthUrl={setMfaOtpauthUrl}
        />
      );

    case "authenticatorSetup":
      return (
        <AuthenticatorSetup
          userId={userId}
          otpauthUrl={mfaOtpauthUrl}
          setCurrentScreen={handleScreenChange}
        />
      );

    case "mfaVerification":
      return (
        <MfaVerification
          userId={userId}
          setCurrentScreen={handleScreenChange}
        />
      );

    case "success":
      return (
        <RegistrationSuccess
          setCurrentScreen={handleScreenChange}
        />
      );

    case "login":
      return <Login />;

    default:
      return (
        <Registration
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          error={registrationError}
        />
      );
  }
}

export default App;