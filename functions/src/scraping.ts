import extract from "./utils/StringExtractor";
import { xml2js, ElementCompact, } from "xml-js";
import { Entry, ImageUrl, Theme, Blog } from "./firestore/access";
import { customFetch } from "./utils/customFetch";
import { parse } from "./utils/Parser";
import { EntryListState } from "./ameba_blog/entrylist";

export async function executeScraping() {
	const blogs = await Blog.getAllBlogs();

	for (let i = 0; i < blogs.length; i++) {
		const blog = blogs[i];

		scrapeBlog(blog);
	}
}

async function scrapeBlog(blog: Blog) {
	console.info(`[${blog.AmebaId}]のスクレイピングを実行します。`);

	const content = await customFetch(blog.EntrylistUrl, 50);
	const stateJson = parse(content).from("<script>window.INIT_DATA=").to("};", 1).build();
	const entrylistState: EntryListState = JSON.parse(stateJson);
	const entryMap = entrylistState.entryState.entryMap;
	let lastCreatedDatetime = blog.LastEntryCreatedDatetime;

	for (let entry_id in entryMap) {
		const entryitem = entryMap[entry_id];

		const theme: Theme = {
			blog_id: blog.BlogId,
			theme_id: entryitem.theme_id,
			theme_name: entryitem.theme_name,
		}

		const entry: Entry = {
			blog_id: blog.BlogId,
			entry_id: entryitem.entry_id,
			entry_title: entryitem.entry_title,
			entry_created_datetime: entryitem.entry_created_datetime,
			theme_id: entryitem.theme_id,
		}

		if (lastCreatedDatetime < entry.entry_created_datetime) lastCreatedDatetime = entry.entry_created_datetime;

		// 新規EntryのときのみImageUrlを取得する(アウトバウンドネットワーキングを抑えるため)
		const imageurls = blog.isLatest(entry.entry_created_datetime) ? await getImageUrlsFromEntry(entry, blog.BlogUrl) : [];

		blog.addEntry(entry, imageurls, theme);
	}

	blog.setLastEntryCreatedDatetime(lastCreatedDatetime);
}

async function getImageUrlsFromEntry(entry: Entry, blogRootUrl: string): Promise<ImageUrl[]> {
	const imageurls: ImageUrl[] = [];
	const entryUrl = `${blogRootUrl}/entry-${entry.entry_id}.html`;

	console.info(`[${entryUrl}]の画像を取得します。`);

	const content = await customFetch(entryUrl, 50);

	const imghtmls = extract(content).target("PhotoSwipeImage").from("<img").to(">").iterate();

	for (let i = 0; i < imghtmls.length; i++) {
		const html = imghtmls[i];

		try {
			const element = xml2js(html, { compact: true });
			const elementCompact = element as ElementCompact;
			console.log(elementCompact);
			const image_id: number = Number(elementCompact.img._attributes["data-image-id"]);
			const image_url = String(elementCompact.img._attributes["src"]);


			imageurls.push({
				blog_id: entry.blog_id,
				entry_id: entry.entry_id,
				image_id: image_id,
				image_url: image_url,
			})
		} catch (error) {
			// 目的のimgタグではないゴミが混入するので無視する
			continue;
		}
	}

	console.info(`${entryUrl}から取得したImageUrlは ${imageurls.length} 件です。`)
	return imageurls;
}
