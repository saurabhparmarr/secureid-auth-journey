import Header from "../../components/Header";
import ProgressStepper from "../../components/ProgressStepper";

function MobileOtp() {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171923]">
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1180px] items-center justify-center px-5 py-10">
        <section className="w-full max-w-[620px] rounded-xl border border-[#e4e6ed] bg-white px-6 py-8 shadow-[0_2px_12px_rgba(20,20,40,0.04)] sm:px-10">

          {/* Progress */}
          <div className="mb-8">
            <ProgressStepper activeStep={3} />
          </div>

          {/* Heading */}
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

          {/* OTP */}
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
                  className="h-11 w-10 rounded-md border border-[#dfe1e8] text-center text-[16px] font-semibold outline-none focus:border-[#3155e8]"
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <p className="mt-5 text-center text-[10px] text-[#858894]">
            OTP expires in{" "}
            <span className="font-semibold text-[#3d404a]">
              02:00
            </span>
          </p>

          {/* Verify */}
          <button
            type="button"
            className="mt-7 h-[42px] w-full rounded-md bg-[#2449df] text-[12px] font-semibold text-white transition hover:bg-[#1d3dcc]"
          >
            Verify Mobile Number
          </button>

          {/* Resend */}
          <p className="mt-5 text-center text-[10px] text-[#858894]">
            Didn't receive the code?{" "}
            <button
              type="button"
              className="font-semibold text-[#3155e8]"
            >
              Resend OTP
            </button>
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

export default MobileOtp;