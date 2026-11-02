import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { top10ForDay, top10Points, top10Slot, TOP10_MAX, TOP10_SECONDS } from "@/game/top10";
import { Top10Board } from "./MoreModes";

/** Renders the real Top 10 board with a fake progress hook so finish() can be observed. */
const renderBoard = () => {
  const finish = vi.fn();
  const game = { day: "2026-10-28", progress: { best: 0, streak: 0 }, doneToday: false, finish } as never;
  const list = top10ForDay("2026-10-28");
  render(
    <Top10Board game={game} title={list.title} names={list.names} seconds={TOP10_SECONDS}
      pointsFor={top10Points} max={TOP10_MAX} slotFor={(t, f) => top10Slot(list, t, f)} />,
  );
  return { finish, answer: list.names[0]![0]! };
};

describe("Top 10 give up", () => {
  it("ends the round early and keeps the points already earned", () => {
    const { finish, answer } = renderBoard();
    fireEvent.click(screen.getByRole("button", { name: /start the clock/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /name someone on the list/i }), { target: { value: answer } });
    fireEvent.click(screen.getByRole("button", { name: /^guess$/i }));
    fireEvent.click(screen.getByRole("button", { name: /give up/i }));
    expect(finish).toHaveBeenCalledWith(top10Points(1));
    expect(screen.getByRole("status").textContent).toContain(`${top10Points(1)}/${TOP10_MAX}`);
    expect(screen.queryByRole("textbox", { name: /name someone on the list/i })).not.toBeInTheDocument();
  });

  it("gives up with nothing earned when no name has been found yet", () => {
    const { finish } = renderBoard();
    fireEvent.click(screen.getByRole("button", { name: /start the clock/i }));
    fireEvent.click(screen.getByRole("button", { name: /give up/i }));
    expect(finish).toHaveBeenCalledWith(0);
    expect(screen.getByRole("status").textContent).toContain(`0/${TOP10_MAX}`);
  });

  it("offers no give-up button before the clock starts", () => {
    renderBoard();
    expect(screen.queryByRole("button", { name: /give up/i })).not.toBeInTheDocument();
  });
});
