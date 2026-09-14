import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import {
  formatCents,
  titleSize,
  type StudioMarket,
} from "@/lib/markets";

export type CardFormat = "wide" | "square";

export const ShareCard = forwardRef<
  HTMLElement,
  { market: StudioMarket; format?: CardFormat; shot?: boolean }
>(function ShareCard({ market, format = "square", shot = false }, ref) {
  const fill = `${Math.round(market.leading.price * 100)}%`;

  return (
    <article
      ref={ref}
      className={cn(
        "share-card",
        format === "square" && "share-card--square",
        shot && "share-card--shot",
      )}
    >
      <div className="share-card__content">
        <div className="share-card__topline">
          <span className="share-card__brand">Polymarket Trend</span>
        </div>

        <p className="share-card__eyebrow">{market.category}</p>
        <h2 className={cn("share-card__title", titleSize(market.question))}>
          {market.question}
        </h2>

        <div className="share-card__quote">
          <span className="share-card__label">Leading outcome</span>
          <div className="share-card__quote-row">
            <strong>{market.leading.name}</strong>
            <span className="share-card__price">
              {formatCents(market.leading.price)}
            </span>
          </div>
          <div className="share-card__bar" aria-hidden="true">
            <span style={{ width: fill }} />
          </div>
        </div>

        <div className="share-card__stats">
          <div className="share-card__stat">
            <span className="share-card__stat-label">Volume</span>
            <span className="share-card__stat-value">{market.volume}</span>
          </div>
          <div className="share-card__stat">
            <span className="share-card__stat-label">Liquidity</span>
            <span className="share-card__stat-value">{market.liquidity}</span>
          </div>
          {market.comments ? (
            <div className="share-card__stat">
              <span className="share-card__stat-label">Comments</span>
              <span className="share-card__stat-value">{market.comments}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "share-card__art",
          market.imageFit === "contain" && "share-card__art--logo",
        )}
      >
        {market.image ? (
          <img
            className={cn(
              "share-card__scene",
              market.imageFit === "contain" && "share-card__scene--contain",
            )}
            src={market.image}
            alt=""
            style={{ objectPosition: market.objectPosition }}
          />
        ) : null}
        <div className="share-card__scrim" aria-hidden="true" />
      </div>
    </article>
  );
});
