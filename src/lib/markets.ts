export type StudioMarket = {
  id: string;
  category: string;
  question: string;
  leading: { name: string; price: number };
  volume: string;
  liquidity: string;
  comments?: string;
  image: string;
  objectPosition: string;
};

export const MARKETS: StudioMarket[] = [
  {
    id: "fetterman",
    category: "Senate",
    question: "Fetterman leaves the Democrats by December 31, 2026?",
    leading: { name: "No", price: 0.91 },
    volume: "10.6K",
    liquidity: "14.4K",
    image: "/scenes/fetterman.jpg",
    objectPosition: "center center",
  },
  {
    id: "ufc",
    category: "Sports",
    question:
      "Noche UFC: Tommy McMillen vs. Marwan Rahiki (Featherweight Main Card)",
    leading: { name: "Tommy McMillen", price: 0.59 },
    volume: "22.2K",
    liquidity: "27.9K",
    image: "/scenes/ufc.jpg",
    objectPosition: "center center",
  },
  {
    id: "milei",
    category: "Politics",
    question: "Will Javier Milei win the 2027 Argentina presidential election?",
    leading: { name: "Yes", price: 0.53 },
    volume: "168K",
    liquidity: "11.9K",
    comments: "58",
    image: "/scenes/milei.jpg",
    objectPosition: "right center",
  },
  {
    id: "hormuz",
    category: "Politics",
    question: "Strait of Hormuz traffic returns to normal by December 31?",
    leading: { name: "Yes", price: 0.19 },
    volume: "11M",
    liquidity: "523K",
    image: "/scenes/hormuz.jpg",
    objectPosition: "center right",
  },
  {
    id: "inflation",
    category: "Economics",
    question:
      "Will Argentina's monthly inflation in August 2026 be between 1.5% and 1.7%?",
    leading: { name: "Yes", price: 0.85 },
    volume: "10K",
    liquidity: "727",
    image: "/scenes/argentina.jpg",
    objectPosition: "center right",
  },
];

export function formatCents(price: number) {
  return `${Math.round(price * 100)}¢`;
}

export function titleSize(question: string) {
  if (question.length > 88) return "text-xl";
  if (question.length > 54) return "text-2xl";
  return "text-3xl";
}
