function PasswordRequirements() {
  const requirements = [
    "At least 8 characters",
    "1 uppercase letter",
    "1 number",
    "1 special character",
  ];

  return (
    <div className="rounded-lg bg-[#fafbfe] p-5">
      <h2 className="mb-4 text-[12px] font-semibold text-[#464955]">
        Password must contain:
      </h2>

      <div className="space-y-3">
        {requirements.map((requirement) => (
          <div
            key={requirement}
            className="flex items-center gap-2 text-[11px] text-[#6d707b]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#a5a8b1]" />
            <span>{requirement}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordRequirements;