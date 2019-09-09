import { firestore } from "./init";
import { IEntry, IImageUrl, ITheme, IBlog } from "./interface";

export class Blog implements IBlog {
	private blog_id: string;
	private unit_id: string;
	private blog_title: string;
	private last_entry_created_datetime: string;

	/**
	 * このBlogが保存されているFirestoreのDocument参照。
	 */
	private documentRef: FirebaseFirestore.DocumentReference;

	get blogId() { return this.blog_id }
	get unitId() { return this.unit_id }
	get blogTitle() { return this.blog_title }
	get lastEntryCreatedDatetime() { return this.last_entry_created_datetime }

	/**
	 * BlogのURL
	 */
	get blogUrl() { return `https://ameblo.jp/${this.blogId}` }

	/**
	 * BlogのEntrylistのURL
	 */
	get entrylistUrl() { return `${this.blogUrl}/entrylist.html` }

	private constructor(
		blogId: string,
		unitId: string,
		blogTitle: string,
		documentRef: FirebaseFirestore.DocumentReference,
		lastEntryCreatedDatetime?: string
	) {
		this.blog_id = blogId;
		this.unit_id = unitId;
		this.blog_title = blogTitle;
		this.documentRef = documentRef;
		this.last_entry_created_datetime = lastEntryCreatedDatetime ? lastEntryCreatedDatetime : "2000-01-01T00:00:00.000+09:00";
	}

	/**
	 * num番目のEntrylistのURL
	 * @param num Entrylistのページ番号
	 */
	entrylistNthUrl(num: number) {
		if (num === 1) { return this.entrylistUrl; }
		return `${this.blogUrl}/entrylist-${num}.html`;
	}

	/**
	 * BlogにEntryを追加する。引数`entry`の`entryCreatedDatetime`が`LastEntryCreatedDatetime`以降の場合は
	 * 引数のデータをfirestoreに追加してtrueを返す。そうでなければFirestoreにアクセスすることなくfalseを返す。
	 * @param entry 
	 * @param imageurls 
	 * @param theme 
	 */
	async addEntry(entry: IEntry, imageurls: IImageUrl[], theme: ITheme): Promise<boolean> {
		if (!this.isNewEntryDatetime(entry.entryCreatedDatetime)) return false;

		console.info(`${entry.entryId} を新規Entryとして登録します。`);

		const entryDocRef = this.documentRef.collection("entries").doc(entry.entryId);
		const imageurlsCollRef = entryDocRef.collection("imageurls");
		const themeDocRef = this.documentRef.collection("themes").doc(theme.themeId);

		await entryDocRef.set(entry);
		await themeDocRef.set(theme);

		for (let i = 0; i < imageurls.length; i++) {
			const imageurl = imageurls[i];
			const imageurlDocRef = imageurlsCollRef.doc(imageurl.imageurlId);

			await imageurlDocRef.set(imageurl);
		}

		return true;
	}

	isNewEntryDatetime(entryCreatedDatetime: string): boolean {
		return this.last_entry_created_datetime < entryCreatedDatetime;
	}

	/**
	 * Blogの最終更新日時を更新する。
	 * @param lastEntryCreatedDatetime 最終更新日時
	 */
	async setLastEntryCreatedDatetime(lastEntryCreatedDatetime: string) {
		await this.documentRef.set({
			lastEntryCreatedDatetime: lastEntryCreatedDatetime,
		}, { merge: true });
	}

	/**
	 * Firestoreから取得したすべてのblogsドキュメントからBlogインスタンスを生成して配列として取得する。
	 */
	static async getAllBlogs(): Promise<Blog[]> {
		const blogsQuery = await firestore.collectionGroup("blogs").get();

		const blogs = blogsQuery.docs;

		return blogs.map(blog => {
			const data = blog.data();
			return new Blog(
				blog.id,
				data.unitId,
				data.blogTitle,
				blog.ref,
				data.lastEntryCreatedDatetime,
			);
		});
	}

	static async getBlogById(blogId: string): Promise<Blog | undefined> {
		const blogDocRef = await firestore.collection("blogs").doc(blogId);
		const blogSnapshot = await blogDocRef.get();
		if (blogSnapshot.exists) {
			const data = blogSnapshot.data() as Blog;

			return new Blog(
				blogDocRef.id,
				data.unitId,
				data.blogTitle,
				blogDocRef,
				data.lastEntryCreatedDatetime,
			);
		} else {
			return undefined;
		}
	}
}
