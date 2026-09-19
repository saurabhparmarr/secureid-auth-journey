import { useState } from "react";

import Registration from "./screens/registration/Registration";
import EmailOtp from "./screens/email/EmailOtp";
import MobileOtp from "./screens/mobile/MobileOtp";
import MfaSetup from "./screens/mfa/MfaSetup";
import AuthenticatorSetup from "./screens/mfa/AuthenticatorSetup";
import MfaVerification from "./screens/mfa/MfaVerification";
import RegistrationSuccess from "./screens/success/RegistrationSuccess";

function App() {
  const [currentScreen, setCurrentScreen] = useState("registration");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    password: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!form.fullName.trim()) {
    alert("Please enter your full name.");
    return;
  }

  if (!form.email.trim()) {
    alert("Please enter your email address.");
    return;
  }

  if (!form.mobile.trim()) {
    alert("Please enter your mobile number.");
    return;
  }

  if (!form.password) {
    alert("Please enter your password.");
    return;
  }

  if (!form.terms) {
    alert("Please accept the Terms & Conditions and Privacy Policy.");
    return;
  }

  console.log("Registration form:", form);

  setCurrentScreen("emailOtp");
};
  switch (currentScreen) {
    case "emailOtp":
      return <EmailOtp />;

    case "mobileOtp":
      return <MobileOtp />;

    case "mfaSetup":
      return <MfaSetup />;

    case "authenticatorSetup":
      return <AuthenticatorSetup />;

    case "mfaVerification":
      return <MfaVerification />;

    case "success":
      return <RegistrationSuccess />;

    default:
      return (
        <Registration
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      );
  }
}

export default App;