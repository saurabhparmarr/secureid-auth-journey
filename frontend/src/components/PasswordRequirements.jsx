function PasswordRequirements({ password = "" }) {
  const requirements = [
    ["At least 8 characters", password.length >= 8],
    ["1 uppercase letter", /[A-Z]/.test(password)],
    ["1 number", /\d/.test(password)],
    ["1 special character", /[^A-Za-z0-9]/.test(password)],
  ];

  return (
    <div className="rounded-lg bg-[#fafbfe] p-5">
      <h2 className="mb-4 text-[12px] font-semibold text-[#464955]">
        Password must contain:
      </h2>

      <div className="space-y-3">
        {requirements.map(([requirement, satisfied]) => (
          <div
            key={requirement}
            className="flex items-center gap-2 text-[11px] text-[#6d707b]"
          >
            <span
              className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
                satisfied
                  ? "bg-[#e7f7ed] text-[#22a060]"
                  : "bg-[#f0f1f4] text-[#a5a8b1]"
              }`}
              aria-hidden="true"
            >
              {satisfied ? "✓" : ""}
            </span>
            <span>{requirement}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordRequirements;