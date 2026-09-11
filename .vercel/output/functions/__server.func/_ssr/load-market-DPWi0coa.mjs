import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { i as string, r as object } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/load-market-DPWi0coa.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadMarket_createServerFn_handler = createServerRpc({
	id: "34a799a6e781d55966d1bb3e8f951ae4267088cfa0dd26da08640d433ef011ef",
	name: "loadMarket",
	filename: "src/lib/load-market.ts"
}, (opts) => loadMarket.__executeServer(opts));
var loadMarket = createServerFn({ method: "POST" }).validator(object({ url: string().min(1) })).handler(loadMarket_createServerFn_handler, async ({ data }) => {
	const { loadStudioMarket } = await import("./polymarket.server-BIle1vNx.mjs");
	return loadStudioMarket(data.url);
});
//#endregion
export { loadMarket_createServerFn_handler };
