import { i as __toESM } from "../_runtime.mjs";
import { R as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { i as string, r as object } from "../_libs/zod.mjs";
import { t as toBlob } from "../_libs/html-to-image.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-j-R5Vd3F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...parts) {
	return parts.filter(Boolean).join(" ");
}
var MARKETS = [
	{
		id: "fetterman",
		category: "Senate",
		question: "Fetterman leaves the Democrats by December 31, 2026?",
		leading: {
			name: "No",
			price: .91
		},
		volume: "10.6K",
		liquidity: "14.4K",
		image: "/scenes/fetterman.jpg",
		objectPosition: "center center"
	},
	{
		id: "ufc",
		category: "Sports",
		question: "Noche UFC: Tommy McMillen vs. Marwan Rahiki (Featherweight Main Card)",
		leading: {
			name: "Tommy McMillen",
			price: .59
		},
		volume: "22.2K",
		liquidity: "27.9K",
		image: "/scenes/ufc.jpg",
		objectPosition: "center center"
	},
	{
		id: "milei",
		category: "Politics",
		question: "Will Javier Milei win the 2027 Argentina presidential election?",
		leading: {
			name: "Yes",
			price: .53
		},
		volume: "168K",
		liquidity: "11.9K",
		comments: "58",
		image: "/scenes/milei.jpg",
		objectPosition: "right center"
	},
	{
		id: "hormuz",
		category: "Politics",
		question: "Strait of Hormuz traffic returns to normal by December 31?",
		leading: {
			name: "Yes",
			price: .19
		},
		volume: "11M",
		liquidity: "523K",
		image: "/scenes/hormuz.jpg",
		objectPosition: "center right"
	},
	{
		id: "inflation",
		category: "Economics",
		question: "Will Argentina's monthly inflation in August 2026 be between 1.5% and 1.7%?",
		leading: {
			name: "Yes",
			price: .85
		},
		volume: "10K",
		liquidity: "727",
		image: "/scenes/argentina.jpg",
		objectPosition: "center right"
	}
];
function formatCents(price) {
	return `${Math.round(price * 100)}¢`;
}
function titleSize(question) {
	if (question.length > 88) return "text-xl";
	if (question.length > 54) return "text-2xl";
	return "text-3xl";
}
var ShareCard = (0, import_react.forwardRef)(function ShareCard({ market }, ref) {
	const fill = `${Math.round(market.leading.price * 100)}%`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		ref,
		className: "share-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "share-card__content",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "share-card__topline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "share-card__brand",
						children: "Polymarket Trend"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "share-card__eyebrow",
					children: market.category
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: cn("share-card__title", titleSize(market.question)),
					children: market.question
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "share-card__quote",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "share-card__label",
							children: "Leading outcome"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "share-card__quote-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: market.leading.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "share-card__price",
								children: formatCents(market.leading.price)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "share-card__bar",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: fill } })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "share-card__stats",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Volume" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: market.volume })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Liquidity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: market.liquidity })] }),
						market.comments ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Comments" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: market.comments })] }) : null
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "share-card__art",
			children: [market.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "share-card__scene",
				src: market.image,
				alt: "",
				style: { objectPosition: market.objectPosition }
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "share-card__scrim",
				"aria-hidden": "true"
			})]
		})]
	});
});
function waitForImages(node) {
	const images = Array.from(node.querySelectorAll("img"));
	return Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
		img.addEventListener("load", () => resolve(), { once: true });
		img.addEventListener("error", () => resolve(), { once: true });
	})));
}
async function captureShareCard(node) {
	await waitForImages(node);
	await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
	const blob = await toBlob(node, {
		cacheBust: true,
		pixelRatio: 2,
		backgroundColor: "#081228",
		width: 1200,
		height: 630,
		skipAutoScale: true,
		style: {
			width: "1200px",
			height: "630px",
			transform: "none",
			opacity: "1"
		}
	});
	if (!blob) throw new Error("No pude capturar la card.");
	return blob;
}
async function downloadPng(blob, name) {
	const href = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = href;
	link.download = name;
	link.click();
	URL.revokeObjectURL(href);
}
async function copyPng(blob) {
	if (!navigator.clipboard || !("ClipboardItem" in window)) throw new Error("Este navegador no copia imágenes. Descargá el PNG.");
	await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadMarket = createServerFn({ method: "POST" }).validator(object({ url: string().min(1) })).handler(createSsrRpc("34a799a6e781d55966d1bb3e8f951ae4267088cfa0dd26da08640d433ef011ef"));
var SAMPLE_URL = "https://polymarket.com/event/fetterman-leaves-the-democrats-before-the-midterms-20260720221037014/fetterman-leaves-the-democrats-by-december-31-2026";
function Studio() {
	const shotRef = (0, import_react.useRef)(null);
	const [url, setUrl] = (0, import_react.useState)(SAMPLE_URL);
	const [activeId, setActiveId] = (0, import_react.useState)(MARKETS[0].id);
	const [live, setLive] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [exporting, setExporting] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const market = live ?? MARKETS.find((item) => item.id === activeId) ?? MARKETS[0];
	async function onLoad(event) {
		event.preventDefault();
		setBusy(true);
		setError("");
		setMessage("");
		try {
			const next = await loadMarket({ data: { url } });
			setLive(next);
			setMessage("Card lista. Copiá o descargá el PNG — es la misma que ves.");
		} catch (err) {
			setLive(null);
			setError(err instanceof Error ? err.message : "No pude cargar el mercado.");
		} finally {
			setBusy(false);
		}
	}
	async function exportBlob() {
		const node = shotRef.current;
		if (!node) throw new Error("La card todavía no está lista.");
		setExporting(true);
		setError("");
		try {
			return await captureShareCard(node);
		} finally {
			setExporting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "studio",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "studio__header",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "studio__kicker",
						children: "Share card studio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "studio__heading",
						children: "Polymarket Trend"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "studio__lede",
						children: "Pegá la URL de un mercado. Lo que ves es lo que se copia: PNG 1200×630 idéntico a la preview."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "studio__form",
				onSubmit: onLoad,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "studio__label",
					htmlFor: "market-url",
					children: "URL de Polymarket"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "studio__row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "market-url",
						className: "studio__input",
						value: url,
						onChange: (event) => setUrl(event.target.value),
						placeholder: "https://polymarket.com/event/...",
						autoComplete: "off"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "studio__chip studio__chip--on",
						type: "submit",
						disabled: busy,
						children: busy ? "Cargando…" : "Armar card"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "studio__nav",
				"aria-label": "Ejemplos",
				children: MARKETS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: !live && item.id === market.id ? "studio__chip studio__chip--on" : "studio__chip",
					onClick: () => {
						setLive(null);
						setActiveId(item.id);
						setMessage("");
						setError("");
					},
					children: item.id === "fetterman" ? "Fetterman" : item.id === "ufc" ? "UFC (título largo)" : item.id === "milei" ? "Milei" : item.id === "hormuz" ? "Hormuz" : "Inflación"
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareCard, { market }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "share-card-shot",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareCard, {
					market,
					ref: shotRef
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "studio__actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "studio__chip studio__chip--on",
						disabled: exporting,
						onClick: async () => {
							try {
								await copyPng(await exportBlob());
								setMessage("PNG copiado — es la misma card que ves arriba.");
							} catch (err) {
								setError(err instanceof Error ? err.message : "No pude copiar.");
							}
						},
						children: "Copiar PNG"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "studio__chip",
						disabled: exporting,
						onClick: async () => {
							try {
								await downloadPng(await exportBlob(), `${market.id}-card.png`);
								setMessage("PNG descargado — mismo diseño que la preview.");
							} catch (err) {
								setError(err instanceof Error ? err.message : "No pude descargar.");
							}
						},
						children: "Descargar PNG"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "studio__chip",
						href: "/CARD-PIPELINE.md",
						download: true,
						children: "Nota para agentes"
					})
				]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "studio__ok",
				children: message
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "studio__err",
				children: error
			}) : null
		]
	});
}
//#endregion
export { Studio as component };
