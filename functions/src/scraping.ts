import extract from "./utils/StringExtractor";
import { xml2js, ElementCompact, } from "xml-js";
import { Blog } from "./firestore/access";
import { customFetch } from "./utils/customFetch";
import { parse } from "./utils/Parser";
import { EntryListState } from "./ameba_blog/entrylist";
import { ITheme, IEntry, IImageUrl } from "./firestore/interface";

export async function executeScraping() {
	const blogs = await Blog.getAllBlogs();

	for (const blog of blogs) {
		await scrapeBlog(blog);
	}
}

async function scrapeBlog(blog: Blog) {
	console.info(`[${blog.blogId}]のスクレイピングを実行します。`);

	const content = await customFetch(blog.entrylistUrl, 50);
	const stateJson = parse(content).from("<script>window.INIT_DATA=").to("};", 1).build();
	const entrylistState: EntryListState = JSON.parse(stateJson);
	const entryMap = entrylistState.entryState.entryMap;
	const topEntryIds = Object.keys(entryMap);

	for (const entry_id in entryMap) {
		const entryitem = entryMap[entry_id];

		const theme: ITheme = {
			themeId: String(entryitem.theme_id),
			themeName: entryitem.theme_name,
			unitId: blog.unitId,
			blogId: blog.blogId,
		}

		const entry: IEntry = {
			entryId: String(entryitem.entry_id),
			entryTitle: entryitem.entry_title,
			entryCreatedDatetime: entryitem.entry_created_datetime,
			unitId: blog.unitId,
			blogId: blog.blogId,
			themeId: theme.themeId,
		}

		// 新規EntryのときのみImageUrlを取得する(アウトバウンドネットワーキングを抑えるため)
		const imageurls = blog.isNewEntry(entry.entryId) ? await getImageUrlsFromEntry(entry, blog.blogUrl) : [];

		await blog.addEntry(entry, imageurls, theme);
	}

	await blog.setTopEntryList(topEntryIds);
}

export async function getImageUrlsFromEntry(entry: IEntry, blogRootUrl: string): Promise<IImageUrl[]> {
	const imageurls: IImageUrl[] = [];
	const entryUrl = `${blogRootUrl}/entry-${entry.entryId}.html`;

	console.info(`[${entryUrl}]の画像を取得します。`);

	const content = await customFetch(entryUrl, 50);

	const imghtmls = extract(content).target("PhotoSwipeImage").from("<img").to(">").iterate();

	for (const html of imghtmls) {
		try {
			const element = xml2js(html, { compact: true });
			const elementCompact = element as ElementCompact;
			const imageId = String(elementCompact.img._attributes["data-image-id"]);
			const imageUrl = String(elementCompact.img._attributes["src"]);


			imageurls.push({
				imageurlId: imageId,
				imageUrl: imageUrl.slice(0, imageUrl.indexOf("?")),
				unitId: entry.unitId,
				blogId: entry.blogId,
				themeId: entry.themeId,
				entryId: entry.entryId,
				entryCreatedDatetime: entry.entryCreatedDatetime,
			})
		} catch (error) {
			// 目的のimgタグではないゴミが混入するので無視する
			continue;
		}
	}

	console.info(`${entryUrl}から取得したImageUrlは ${imageurls.length} 件です。`)
	return imageurls;
}
