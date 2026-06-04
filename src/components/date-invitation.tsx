"use client";

import { useMemo, useRef, useState } from "react";
import {
  ACTIVITIES,
  formatDisplayDate,
  getDateOptions,
  type Activity,
} from "@/lib/date-options";

type DateInvitationProps = {
  name: string;
  metadataEmail: string;
};

type Screen = "welcome" | "details" | "loading" | "thank-you";
type SendState = "idle" | "sending" | "success" | "error";

const floatingDecorations = [
  { text: "<3", className: "left-[8%] top-[13%] text-4xl delay-0" },
  { text: "💋", className: "right-[10%] top-[12%] text-5xl delay-300" },
  { text: "😊", className: "left-[12%] bottom-[18%] text-5xl delay-700" },
  { text: "😘", className: "right-[12%] bottom-[16%] text-5xl delay-1000" },
  { text: "♡", className: "left-[48%] top-[7%] text-6xl delay-500" },
];

export function DateInvitation({ name, metadataEmail }: DateInvitationProps) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | "">("");
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [sendState, setSendState] = useState<SendState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const dateOptions = useMemo(() => getDateOptions(), []);
  const selectedDateLabel = selectedDate
    ? formatDisplayDate(selectedDate)
    : "Choose a sweet little day";
  const canConfirm = Boolean(selectedDate && selectedActivity && sendState !== "sending");

  function moveNoButton() {
    const button = noButtonRef.current;
    const buttonWidth = button?.offsetWidth ?? 116;
    const buttonHeight = button?.offsetHeight ?? 56;
    const margin = 20;
    const maxX = Math.max(margin, window.innerWidth - buttonWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - buttonHeight - margin);

    setNoButtonPosition({
      x: Math.floor(margin + Math.random() * (maxX - margin)),
      y: Math.floor(margin + Math.random() * (maxY - margin)),
    });
  }

  async function confirmDate() {
    if (!canConfirm) {
      return;
    }

    setSendState("sending");
    setErrorMessage("");
    setScreen("loading");

    try {
      const response = await fetch("/api/confirm-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          metadataEmail,
          date: selectedDate,
          activity: selectedActivity,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "The love letter could not be sent.");
      }

      setSendState("success");
      await new Promise((resolve) => setTimeout(resolve, 850));
      setScreen("thank-you");
    } catch (error) {
      setSendState("error");
      setScreen("details");
      setErrorMessage(
        error instanceof Error ? error.message : "The love letter could not be sent.",
      );
    }
  }

  return (
    <main className="romantic-background relative min-h-dvh overflow-hidden px-4 py-5 text-[#2d1720] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="heart-shape absolute left-1/2 top-[18%] h-36 w-36 -translate-x-1/2 rotate-[-45deg] opacity-30 sm:h-48 sm:w-48" />
        {floatingDecorations.map((item) => (
          <span
            key={`${item.text}-${item.className}`}
            className={`float-decoration absolute select-none ${item.className}`}
          >
            {item.text}
          </span>
        ))}
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-5xl items-center justify-center">
        {screen === "welcome" ? (
          <div className="welcome-panel w-full max-w-3xl px-5 py-12 text-center sm:px-10 sm:py-16">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-[#8a314b]">
              One tiny question
            </p>
            <h1 className="mx-auto max-w-2xl text-balance text-4xl font-black leading-tight text-[#341320] sm:text-6xl">
              {name}, are you willing to go on a date with me?
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#66364b] sm:text-xl">
              I have a suspiciously romantic plan and a very serious calendar waiting.
            </p>

            <div className="relative mt-10 flex min-h-24 flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setScreen("details")}
                className="h-14 min-w-36 rounded-full bg-[#d81b60] px-8 text-lg font-bold text-white shadow-[0_18px_40px_rgba(216,27,96,0.28)] transition hover:-translate-y-0.5 hover:bg-[#bd1450] focus:outline-none focus:ring-4 focus:ring-[#ffb6cd]"
              >
                Yes
              </button>
              <button
                ref={noButtonRef}
                type="button"
                onClick={moveNoButton}
                onPointerDown={(event) => {
                  event.preventDefault();
                  moveNoButton();
                }}
                onPointerEnter={moveNoButton}
                style={
                  noButtonPosition.x || noButtonPosition.y
                    ? {
                        position: "fixed",
                        left: noButtonPosition.x,
                        top: noButtonPosition.y,
                        zIndex: 40,
                      }
                    : undefined
                }
                className="h-14 min-w-32 rounded-full border-2 border-[#863f56] bg-white/75 px-8 text-lg font-bold text-[#5c2437] shadow-lg backdrop-blur transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#ffd1df]"
              >
                No
              </button>
            </div>
          </div>
        ) : screen === "details" ? (
          <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="form-panel px-4 py-5 sm:px-6 sm:py-7">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a314b]">
                    Pick a date
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-[#341320]">Our next two weeks</h2>
                </div>
                <output className="rounded-2xl border border-[#efabc0] bg-white/70 px-4 py-3 text-sm font-semibold text-[#66364b]">
                  {selectedDateLabel}
                </output>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day} className="text-xs font-bold uppercase text-[#8a314b]">
                    {day}
                  </span>
                ))}
                {Array.from({ length: dateOptions[0]?.weekOffset ?? 0 }).map((_, index) => (
                  <span key={`blank-${index}`} />
                ))}
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedDate(option.value);
                      setSendState("idle");
                    }}
                    aria-pressed={selectedDate === option.value}
                    className={`aspect-square rounded-2xl border text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-[#ffb6cd] sm:text-base ${
                      selectedDate === option.value
                        ? "border-[#d81b60] bg-[#d81b60] text-white shadow-[0_12px_24px_rgba(216,27,96,0.24)]"
                        : "border-[#efabc0] bg-white/70 text-[#4a1b2d] hover:-translate-y-0.5 hover:bg-white"
                    }`}
                  >
                    <span className="block text-xs font-semibold opacity-75">{option.month}</span>
                    {option.day}
                  </button>
                ))}
              </div>
            </section>

            <section className="form-panel flex flex-col px-4 py-5 sm:px-6 sm:py-7">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a314b]">
                Pick the mood
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#341320]">What should we do?</h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {ACTIVITIES.map((activity) => (
                  <label
                    key={activity}
                    className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      selectedActivity === activity
                        ? "border-[#d81b60] bg-[#fff0f5] text-[#8a123e] shadow-[0_12px_24px_rgba(216,27,96,0.16)]"
                        : "border-[#efabc0] bg-white/70 text-[#4a1b2d] hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedActivity === activity}
                      onChange={() => {
                        setSelectedActivity(activity);
                        setSendState("idle");
                      }}
                      className="h-5 w-5 rounded border-[#b85c75] accent-[#d81b60]"
                    />
                    <span>{activity}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#efabc0] bg-white/65 p-4 text-sm leading-6 text-[#66364b]">
                <div>
                  <span className="font-bold text-[#341320]">Name:</span> {name}
                </div>
                <div>
                  <span className="font-bold text-[#341320]">Invite email:</span>{" "}
                  {metadataEmail || "Not provided"}
                </div>
                <div>
                  <span className="font-bold text-[#341320]">Date:</span> {selectedDateLabel}
                </div>
                <div>
                  <span className="font-bold text-[#341320]">Activity:</span>{" "}
                  {selectedActivity || "Choose one"}
                </div>
              </div>

              <button
                type="button"
                disabled={!canConfirm}
                onClick={confirmDate}
                className="mt-5 h-14 rounded-full bg-[#d81b60] px-7 text-base font-black text-white shadow-[0_18px_40px_rgba(216,27,96,0.25)] transition hover:-translate-y-0.5 hover:bg-[#bd1450] focus:outline-none focus:ring-4 focus:ring-[#ffb6cd] disabled:cursor-not-allowed disabled:bg-[#b899a4] disabled:shadow-none disabled:hover:translate-y-0"
              >
                {sendState === "sending" ? "Sending..." : "Confirm our date"}
              </button>

              {sendState === "error" && (
                <p className="mt-4 rounded-2xl border border-[#df8d94] bg-[#fff1f3] px-4 py-3 text-sm font-bold text-[#8b2431]">
                  {errorMessage}
                </p>
              )}
            </section>
          </div>
        ) : screen === "loading" ? (
          <div
            className="welcome-panel flex w-full max-w-xl flex-col items-center px-5 py-12 text-center sm:px-10 sm:py-14"
            role="status"
            aria-live="polite"
          >
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full border-4 border-[#ffd1df] border-t-[#d81b60] animate-spin" />
              <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white/70 text-4xl shadow-inner">
                💌
              </div>
            </div>
            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.28em] text-[#8a314b]">
              Sealing it with a kiss
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#341320] sm:text-4xl">
              Sending our little love note...
            </h2>
          </div>
        ) : (
          <div className="welcome-panel w-full max-w-3xl px-5 py-12 text-center sm:px-10 sm:py-16">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-[#8a314b]">
              Thank you, sweetheart
            </p>
            <h1 className="mx-auto max-w-2xl text-balance text-4xl font-black leading-tight text-[#341320] sm:text-6xl">
              It&apos;s a date, {name}! 💖
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#66364b] sm:text-xl">
              Your yes has been safely delivered. I&apos;ll bring the romance, the smiles, and
              probably too much excitement.
            </p>

            <div className="mx-auto mt-8 grid max-w-xl gap-3 rounded-3xl border border-[#efabc0] bg-white/65 p-5 text-left text-sm leading-6 text-[#66364b] sm:text-base">
              <div>
                <span className="font-bold text-[#341320]">Date:</span> {selectedDateLabel}
              </div>
              <div>
                <span className="font-bold text-[#341320]">Plan:</span> {selectedActivity}
              </div>
            </div>

            <div className="mt-8 text-5xl" aria-hidden="true">
              🥰 💐 ✨
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
