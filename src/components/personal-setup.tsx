"use client";
import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { createPersonalWorkspace } from "@/lib/personal-actions";
import { Feedback } from "./forms";

export function PersonalSetup() {
  const [state, action, pending] = useActionState(createPersonalWorkspace, {
    success: false,
    message: "",
  });
  return (
    <form action={action} className="form-stack">
      <div className="form-grid">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={60}
          />
        </label>
        <label>
          Timezone
          <input
            name="timezone"
            defaultValue="Asia/Kolkata"
            required
            list="timezones"
          />
        </label>
      </div>
      <datalist id="timezones">
        {[
          "Asia/Kolkata",
          "Europe/London",
          "America/New_York",
          "America/Los_Angeles",
          "Asia/Singapore",
          "Australia/Sydney",
        ].map((zone) => (
          <option key={zone} value={zone} />
        ))}
      </datalist>
      <label>
        Subjects (one per line)
        <textarea
          name="subjects"
          required
          rows={5}
          placeholder={"Mathematics\nEnglish\nPhysics"}
          maxLength={2430}
        />
      </label>
      <div className="form-grid">
        <label>
          Daily study limit (minutes)
          <input
            type="number"
            name="dailyStudyLimit"
            defaultValue={120}
            min={15}
            max={480}
            required
          />
        </label>
        <label>
          Study starts at
          <input
            type="time"
            name="preferredStudyStartTime"
            defaultValue="16:00"
            required
          />
        </label>
        <label>
          Study block (minutes)
          <input
            type="number"
            name="studyBlockMinutes"
            defaultValue={30}
            min={10}
            max={90}
            required
          />
        </label>
        <label>
          Break (minutes)
          <input
            type="number"
            name="breakMinutes"
            defaultValue={10}
            min={0}
            max={30}
            required
          />
        </label>
      </div>
      <Feedback state={state} />
      <button className="button primary fit" disabled={pending}>
        {pending ? (
          <LoaderCircle size={16} className="spin" />
        ) : (
          <ArrowRight size={16} />
        )}
        Create my workspace
      </button>
    </form>
  );
}
