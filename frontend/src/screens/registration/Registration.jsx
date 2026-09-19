import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";
import PasswordRequirements from "../../components/PasswordRequirements";

function Registration({ form, handleChange, handleSubmit }) {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171923]">
      {/* Header */}
      <Header />

      {/* Main */}
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1180px] items-center justify-center px-5 py-10">
        <section className="w-full max-w-[930px] rounded-xl border border-[#e4e6ed] bg-white px-6 py-7 shadow-[0_2px_12px_rgba(20,20,40,0.04)] sm:px-10 sm:py-8">
          {/* Progress */}
          <div className="mb-8">
            <ProgressStepper activeStep={1} />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-[22px] font-bold tracking-[-0.4px]">
              Create your account
            </h1>

            <p className="mt-1 text-[12px] text-[#777b86]">
              Let's get you started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
              {/* LEFT */}
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold text-[#3d404a]">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Priya Sharma"
                    className="h-[42px] w-full rounded-md border border-[#dfe1e8] px-3 text-[12px] outline-none placeholder:text-[#a2a5ae] focus:border-[#3155e8]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold text-[#3d404a]">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="priya.sharma@email.com"
                    className="h-[42px] w-full rounded-md border border-[#dfe1e8] px-3 text-[12px] outline-none placeholder:text-[#a2a5ae] focus:border-[#3155e8]"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold text-[#3d404a]">
                    Mobile Number
                  </label>

                  <div className="flex gap-2">
                    <select
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleChange}
                      className="h-[42px] w-[92px] rounded-md border border-[#dfe1e8] bg-white px-2 text-[12px] outline-none focus:border-[#3155e8]"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>

                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="98765 43210"
                      maxLength="10"
                      className="h-[42px] flex-1 rounded-md border border-[#dfe1e8] px-3 text-[12px] outline-none placeholder:text-[#a2a5ae] focus:border-[#3155e8]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold text-[#3d404a]">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="h-[42px] w-full rounded-md border border-[#dfe1e8] px-3 text-[13px] outline-none placeholder:text-[#a2a5ae] focus:border-[#3155e8]"
                  />
                </div>

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-2 text-[10px] leading-[15px] text-[#6d707b]">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={form.terms}
                    onChange={handleChange}
                    className="mt-[1px] h-3.5 w-3.5 accent-[#244ce8]"
                  />

                  <span>
                    I agree to the{" "}
                    <button
                      type="button"
                      className="font-semibold text-[#3155e8]"
                    >
                      Terms & Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="font-semibold text-[#3155e8]"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              {/* RIGHT */}
              <PasswordRequirements />
            </div>

            {/* Create Account */}
            <button
              type="submit"
              className="mt-7 h-[42px] w-full rounded-md bg-[#2449df] text-[12px] font-semibold text-white transition hover:bg-[#1d3dcc]"
            >
              Create Account
            </button>
          </form>

          {/* Login */}
          <p className="mt-5 text-center text-[10px] text-[#858894]">
            Already have an account?{" "}
            <button className="font-semibold text-[#3155e8]">Login</button>
          </p>

          {/* Footer */}
          <p className="mt-7 text-center text-[9px] text-[#a0a2aa]">
            © 2024 SecureID. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}

function ProgressStep({ number, active }) {
  return (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold ${
        active
          ? "bg-[#2449df] text-white"
          : "border border-[#dfe2eb] bg-white text-[#8e929d]"
      }`}
    >
      {number}
    </div>
  );
}

function ProgressLine() {
  return <div className="h-px w-10 bg-[#e2e4eb] sm:w-16" />;
}



export default Registration;
