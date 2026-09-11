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
  { market: StudioMarket; format?: CardFormat }
>(function ShareCard({ market, format = "square" }, ref) {
  const fill = `${Math.round(market.leading.price * 100)}%`;

  return (
    <article
      ref={ref}
      className={cn(
        "share-card",
        format === "square" && "share-card--square",
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

        <dl className="share-card__stats">
          <div>
            <dt>Volume</dt>
            <dd>{market.volume}</dd>
          </div>
          <div>
            <dt>Liquidity</dt>
            <dd>{market.liquidity}</dd>
          </div>
          {market.comments ? (
            <div>
              <dt>Comments</dt>
              <dd>{market.comments}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="share-card__art">
        {market.image ? (
          <img
            className="share-card__scene"
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
