import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";

function MobileOtpMaxAttempts() {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171923]">
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1180px] items-center justify-center px-5 py-10">
        <section className="w-full max-w-[620px] rounded-xl border border-[#e4e6ed] bg-white px-6 py-8 shadow-[0_2px_12px_rgba(20,20,40,0.04)] sm:px-10">

          <div className="mb-8">
            <ProgressStepper activeStep={3} />
          </div>

          <div className="text-center">
            <h1 className="text-[22px] font-bold tracking-[-0.4px]">
              Verify your mobile number
            </h1>

            <p className="mt-2 text-[12px] leading-5 text-[#777b86]">
              We have sent a verification code to your mobile number.
            </p>

            <p className="mt-1 text-[12px] font-semibold text-[#3d404a]">
              +91 98765 43210
            </p>
          </div>

          <div className="mt-8">
            <label className="mb-3 block text-center text-[11px] font-semibold text-[#3d404a]">
              Enter OTP
            </label>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <input
                  key={item}
                  type="text"
                  maxLength="1"
                  disabled
                  className="h-11 w-10 rounded-md border border-[#e1e3e9] bg-[#f5f6f9] text-center text-[16px] font-semibold text-[#9b9da5] outline-none"
                />
              ))}
            </div>

            <div className="mt-4 rounded-md border border-[#f0c7cc] bg-[#fff7f8] px-4 py-3 text-center">
              <p className="text-[10px] font-semibold text-[#d54858]">
                Maximum OTP attempts exceeded.
              </p>

              <p className="mt-1 text-[10px] leading-4 text-[#a15b63]">
                Please request a new OTP and try again.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-7 h-[42px] w-full rounded-md bg-[#2449df] text-[12px] font-semibold text-white transition hover:bg-[#1d3dcc]"
          >
            Request New OTP
          </button>

          <p className="mt-5 text-center text-[10px] text-[#858894]">
            For security, your previous OTP has been invalidated.
          </p>

          <p className="mt-7 text-center text-[9px] text-[#a0a2aa]">
            © 2024 SecureID. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}

export default MobileOtpMaxAttempts;