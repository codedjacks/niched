import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Question } from "@/game/types";

const referee = vi.hoisted(() => ({ judge: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => referee.judge }));
vi.mock("@/game/judge.functions", () => ({ judgeAnswer: {} }));
import { Play } from "./Play";

const question: Question = { id: "vegetable", category: "Food", prompt: "Name a vegetable", answers: new Map([["carrot", { display: "Carrot", tier: "pencil" }]]) };
const renderGame = () => render(<Play questions={Array.from({ length: 7 }, () => question)} mode="practice" onDone={vi.fn()} onQuit={vi.fn()} />);
const submit = (answer: string) => {
  fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: answer } });
  fireEvent.click(screen.getByRole("button", { name: /^Submit$/ }));
};

describe("answer submission reliability", () => {
  beforeEach(() => { vi.useFakeTimers(); referee.judge.mockReset(); });
  afterEach(() => { vi.useRealTimers(); });

  it("keeps an on-time unlisted submission alive beyond the 25-second grading wait", async () => {
    let resolve: ((value: unknown) => void) | undefined;
    referee.judge.mockImplementation(() => new Promise((done) => { resolve = done; }));
    renderGame();
    act(() => vi.advanceTimersByTime(24_000));
    submit("tomato");
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.queryByText("Time's up")).not.toBeInTheDocument();
    await act(async () => { resolve?.({ ok: true, display: "Tomato", tier: "notebook", points: 30 }); });
    expect(screen.getByText("Tomato", { exact: true })).toBeInTheDocument();
  });

  it("allows the same answer to be retried after the checker is unavailable", async () => {
    referee.judge.mockResolvedValueOnce({ ok: false, reason: "unavailable", message: "Answer checker is offline" })
      .mockResolvedValueOnce({ ok: true, display: "Tomato", tier: "notebook", points: 30 });
    renderGame();
    await act(async () => submit("tomato"));
    expect(screen.getByRole("textbox", { name: "Your answer" })).toHaveValue("tomato");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /^Submit$/ })));
    expect(referee.judge).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Tomato", { exact: true })).toBeInTheDocument();
  });

  it("still rejects unrelated guesses without free points", async () => {
    referee.judge.mockResolvedValue({ ok: false, reason: "invalid", message: "That does not count" });
    renderGame();
    await act(async () => submit("spaceship"));
    expect(screen.getByRole("textbox", { name: "Your answer" })).toBeInTheDocument();
    expect(screen.queryByText("Graded!")).not.toBeInTheDocument();
  });
});