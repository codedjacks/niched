import { dailyItem, dayNumber, namesMatch } from "./daily-games";

export interface Mystery { name: string; aliases?: string[]; clues: [string, string, string, string, string, string] }

/** Clues go from hardest to easiest. */
export const MYSTERIES: Mystery[] = [
  { name: "Serena Williams", aliases: ["Serena"], clues: ["Individual sport", "Turned pro in 1995", "Born in Michigan, USA", "23 Grand Slam singles titles", "Won Olympic gold in doubles with a sibling", "Younger sister of Venus"] },
  { name: "Lionel Messi", aliases: ["Messi", "Leo Messi"], clues: ["Team sport", "Debuted as a pro in 2004", "Born in Rosario", "Has won 8 Ballon d'Or awards", "Played for Barcelona for 17 seasons", "Captained Argentina to the 2022 World Cup"] },
  { name: "Usain Bolt", aliases: ["Bolt"], clues: ["Track and field", "Retired in 2017", "Born in Trelawny Parish", "8 Olympic gold medals", "World record 9.58 seconds", "Jamaica's 'Lightning Bolt'"] },
  { name: "Tom Brady", aliases: ["Brady"], clues: ["Team sport", "Drafted 199th overall", "Played college ball at Michigan", "Won 7 Super Bowls", "Finished his career with Tampa Bay", "Longtime New England Patriots QB"] },
  { name: "Wayne Gretzky", aliases: ["Gretzky"], clues: ["Played on ice", "Born in Brantford", "Retired in 1999", "Career record of 894 goals", "Won 4 Stanley Cups with Edmonton", "Nicknamed 'The Great One'"] },
  { name: "Michael Phelps", aliases: ["Phelps"], clues: ["Individual sport", "Born in Baltimore", "First Olympics at age 15", "Won 8 golds at one Games (2008)", "23 Olympic gold medals", "Most decorated swimmer ever"] },
  { name: "Simone Biles", aliases: ["Biles"], clues: ["Individual sport", "Born in Columbus, Ohio", "Has moves named after her", "Won 4 golds at Rio 2016", "Most decorated in her sport's history", "American gymnast"] },
  { name: "Babe Ruth", aliases: ["Ruth", "George Herman Ruth"], clues: ["Team sport", "Born in Baltimore in 1895", "Started as a pitcher in Boston", "Hit 714 career home runs", "Nicknamed 'The Bambino'", "New York Yankees legend"] },
  { name: "Roger Federer", aliases: ["Federer"], clues: ["Individual sport", "Born in Basel", "Retired in 2022", "Won Wimbledon 8 times", "20 Grand Slam singles titles", "Swiss tennis great"] },
  { name: "Tiger Woods", aliases: ["Tiger"], clues: ["Individual sport", "Born in Cypress, California", "Played college at Stanford", "15 major championships", "Won the 2019 Masters in a comeback", "Golfer named after an animal"] },
  { name: "Cristiano Ronaldo", aliases: ["Ronaldo", "CR7"], clues: ["Team sport", "Born on Madeira", "Has played in England, Spain, Italy and Saudi Arabia", "5 Champions League titles", "Portugal's all-time top scorer", "Known as CR7"] },
  { name: "Muhammad Ali", aliases: ["Ali", "Cassius Clay"], clues: ["Combat sport", "Born in Louisville", "Won Olympic gold in 1960", "Fought the 'Rumble in the Jungle'", "Said 'float like a butterfly'", "Boxer formerly named Cassius Clay"] },
  { name: "Shohei Ohtani", aliases: ["Ohtani"], clues: ["Team sport", "Born in Oshu, Japan", "Started his MLB career with the Angels", "Was the first 50-homer, 50-steal player", "Signed a $700 million contract", "Two-way star pitcher and hitter"] },
  { name: "Patrick Mahomes", aliases: ["Mahomes"], clues: ["Team sport", "Father played Major League Baseball", "College at Texas Tech", "Drafted 10th overall in 2017", "Multiple Super Bowl MVP awards", "Kansas City Chiefs quarterback"] },
  { name: "Pele", aliases: ["Pelé", "Edson Arantes do Nascimento"], clues: ["Team sport", "Born in Tres Coracoes", "Played for Santos for nearly 20 years", "Later played for the New York Cosmos", "Won 3 World Cups", "Brazilian legend known by one name"] },
  { name: "Rafael Nadal", aliases: ["Nadal", "Rafa"], clues: ["Individual sport", "Born on Mallorca", "Left-handed", "Retired in 2024", "Won the French Open 14 times", "'King of Clay'"] },
  { name: "Caitlin Clark", aliases: ["Clark"], clues: ["Team sport", "Born in Des Moines", "Played college at Iowa", "NCAA Division I all-time leading scorer", "No. 1 pick in the 2024 WNBA Draft", "Indiana Fever guard"] },
  { name: "Lewis Hamilton", aliases: ["Hamilton"], clues: ["Motorsport", "Born in Stevenage", "Debuted in 2007 with McLaren", "7 world championships", "Won six titles with Mercedes", "Joined Ferrari in 2025"] },
  { name: "Derek Jeter", aliases: ["Jeter"], clues: ["Team sport", "Grew up in Kalamazoo", "Rookie of the Year in 1996", "3,465 career hits", "Won 5 World Series", "Yankees shortstop nicknamed 'The Captain'"] },
  { name: "Mia Hamm", aliases: ["Hamm"], clues: ["Team sport", "Born in Selma, Alabama", "Played college at North Carolina", "Won the 1991 and 1999 World Cups", "Two Olympic gold medals", "US women's soccer icon"] },
];

export const MYSTERY_POINTS = [100, 85, 60, 30, 15, 10] as const;
export const mysteryForDay = (day: string) => dailyItem("mystery", MYSTERIES, dayNumber(day));
export const isMysteryAnswer = (m: Mystery, typed: string) => namesMatch(typed, [m.name, ...(m.aliases ?? [])]);
/** Points when solved after seeing `cluesShown` clues (1–6). */
export const mysteryScore = (cluesShown: number) => MYSTERY_POINTS[Math.min(6, Math.max(1, cluesShown)) - 1]!;
